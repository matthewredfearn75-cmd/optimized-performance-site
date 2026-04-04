import { supabaseAdmin } from '../../../lib/supabase'
import { sendEmailAlert, sendSmsAlert } from '../../../lib/alerts'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  try {
    const body = req.body

    // Admin panel bulk update: { password, updates: { productId: qty, ... } }
    if (body.password !== undefined) {
      const adminPassword = process.env.ADMIN_PASSWORD || 'optimized2024'
      if (body.password !== adminPassword) {
        return res.status(401).json({ error: 'Unauthorized' })
      }

      if (body.updates && typeof body.updates === 'object') {
        const entries = Object.entries(body.updates)
        for (const [productId, qty] of entries) {
          await supabaseAdmin
            .from('inventory')
            .update({ stock: Math.max(0, Number(qty)) })
            .eq('product_id', productId)
        }
      }

      const { data: inventory, error } = await supabaseAdmin
        .from('inventory')
        .select('*')
        .order('product')

      if (error) throw error

      // Return in the format the admin page expects: { productId: qty, ... }
      const result = {}
      inventory.forEach(item => { result[item.product_id] = item.stock })
      return res.status(200).json(result)
    }

    // Single SKU update from order: { sku, quantity }
    const { sku, quantity } = body

    if (!sku || !quantity || quantity < 1) {
      return res.status(400).json({ error: 'Invalid request' })
    }

    const { data: item, error: fetchError } = await supabaseAdmin
      .from('inventory')
      .select('*')
      .eq('sku', sku)
      .single()

    if (fetchError || !item) {
      return res.status(404).json({ error: 'SKU not found' })
    }

    const newStock = Math.max(0, item.stock - quantity)

    const { error: updateError } = await supabaseAdmin
      .from('inventory')
      .update({ stock: newStock })
      .eq('sku', sku)

    if (updateError) throw updateError

    if (newStock <= item.threshold) {
      const alertItem = { ...item, stock: newStock }
      await Promise.all([
        sendEmailAlert([alertItem]),
        sendSmsAlert([alertItem]),
      ])
    }

    return res.status(200).json({
      sku,
      previous_stock: item.stock,
      new_stock: newStock,
      threshold: item.threshold,
      alert_sent: newStock <= item.threshold,
    })
  } catch (err) {
    console.error('Inventory update failed:', err)
    return res.status(500).json({ error: err.message })
  }
}
