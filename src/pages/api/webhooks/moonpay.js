import crypto from 'crypto'
import { supabaseAdmin } from '../../../lib/supabase'
import { sendEmailAlert, sendSmsAlert, sendOrderConfirmation } from '../../../lib/alerts'

// Disable Next.js body parsing so we can read the raw body for signature verification
export const config = {
  api: { bodyParser: false },
}

function readRawBody(req) {
  return new Promise((resolve, reject) => {
    let data = ''
    req.on('data', (chunk) => { data += chunk })
    req.on('end', () => resolve(data))
    req.on('error', reject)
  })
}

function verifySignature(rawBody, signature, secret) {
  const hmac = crypto.createHmac('sha256', secret)
  hmac.update(rawBody)
  const digest = hmac.digest('hex')
  return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature))
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  try {
    const rawBody = await readRawBody(req)
    const signature = req.headers['moonpay-signature-v2'] || req.headers['moonpay-signature']

    // Verify webhook signature
    const secret = process.env.MOONPAY_WEBHOOK_SECRET
    if (secret && signature) {
      const isValid = verifySignature(rawBody, signature, secret)
      if (!isValid) {
        console.error('MoonPay webhook signature verification failed')
        return res.status(401).json({ error: 'Invalid signature' })
      }
    }

    const event = JSON.parse(rawBody)
    const { type, data } = event

    // Only process completed transactions
    if (type !== 'transaction_completed' && data?.status !== 'completed') {
      return res.status(200).json({ received: true, action: 'ignored' })
    }

    const txId = data?.id || data?.externalTransactionId
    const orderNumber = data?.externalTransactionId

    if (!orderNumber) {
      console.error('MoonPay webhook missing externalTransactionId')
      return res.status(200).json({ received: true, action: 'no_order_ref' })
    }

    // Find the pending order
    const { data: order, error: fetchError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('order_number', orderNumber)
      .eq('payment_status', 'pending')
      .single()

    if (fetchError || !order) {
      console.error('Order not found for:', orderNumber)
      return res.status(200).json({ received: true, action: 'order_not_found' })
    }

    // Update order status to completed
    await supabaseAdmin
      .from('orders')
      .update({
        payment_status: 'completed',
        moonpay_tx_id: String(txId),
        updated_at: new Date().toISOString(),
      })
      .eq('id', order.id)

    // Decrement inventory for each item
    const lowStockItems = []
    for (const item of order.items) {
      const { data: invItem, error: invError } = await supabaseAdmin
        .from('inventory')
        .select('*')
        .eq('sku', item.sku)
        .single()

      if (invError || !invItem) continue

      const newStock = Math.max(0, invItem.stock - item.quantity)

      await supabaseAdmin
        .from('inventory')
        .update({ stock: newStock })
        .eq('sku', item.sku)

      if (newStock <= invItem.threshold) {
        lowStockItems.push({ ...invItem, stock: newStock, level: 'critical' })
      } else if (newStock <= invItem.reorder_threshold) {
        lowStockItems.push({ ...invItem, stock: newStock, level: 'reorder' })
      }
    }

    // Send order confirmation email to customer
    await sendOrderConfirmation(order)

    // Send low stock alerts if needed
    const criticalItems = lowStockItems.filter(i => i.level === 'critical')
    const reorderItems = lowStockItems.filter(i => i.level === 'reorder')

    if (criticalItems.length > 0) {
      await Promise.all([
        sendEmailAlert(criticalItems, 'critical'),
        sendSmsAlert(criticalItems, 'critical'),
      ])
    }
    if (reorderItems.length > 0) {
      await Promise.all([
        sendEmailAlert(reorderItems, 'reorder'),
        sendSmsAlert(reorderItems, 'reorder'),
      ])
    }

    return res.status(200).json({
      received: true,
      action: 'order_completed',
      order_number: orderNumber,
    })
  } catch (err) {
    console.error('MoonPay webhook error:', err)
    return res.status(500).json({ error: err.message })
  }
}
