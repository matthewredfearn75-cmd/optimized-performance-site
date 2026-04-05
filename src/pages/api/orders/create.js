import { supabaseAdmin } from '../../../lib/supabase'

function generateOrderNumber() {
  const date = new Date()
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `OP-${y}${m}${d}-${rand}`
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  try {
    const { name, email, address, city, state, zip, items, subtotal, total } = req.body

    if (!name || !email || !address || !city || !state || !zip || !items || !items.length) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    const orderNumber = generateOrderNumber()

    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .insert({
        order_number: orderNumber,
        customer_name: name,
        customer_email: email,
        shipping_address: address,
        city,
        state,
        zip,
        items,
        subtotal,
        total,
        payment_status: 'pending',
      })
      .select()
      .single()

    if (error) throw error

    return res.status(200).json({
      order_number: orderNumber,
      order_id: order.id,
    })
  } catch (err) {
    console.error('Order creation failed:', err)
    return res.status(500).json({ error: err.message })
  }
}
