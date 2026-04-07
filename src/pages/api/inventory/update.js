import { supabaseAdmin } from '../../../lib/supabase'
import { sendEmailAlert, sendSmsAlert } from '../../../lib/alerts'
import { validateSessionToken } from '../../../lib/session'
import { validateOrigin, rateLimit } from '../../../lib/security'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  if (!validateOrigin(req)) return res.status(403).json({ error: 'Forbidden' })
  if (!rateLimit(req, { maxRequests: 30, windowMs: 60000 })) return res.status(429).json({ error: 'Too many requests' })

  try {
    const body = req.body

    // Admin panel bulk update: { token, updates: { productId: qty, ... } }
    // Also supports legacy { password, updates } for backwards compat
    if (body.token !== undefined || body.password !== undefined) {
      let authorized = false

      if (body.token) {
        authorized = validateSessionToken(body.token)
      } else if (body.password) {
        const adminPassword = process.env.ADMIN_PASSWORD
        if (!adminPassword) {
          console.error('ADMIN_PASSWORD environment variable is not configured')
          return res.status(500).json({ error: 'Server configuration error' })
        }
        authorized = body.password === adminPassword
      }

      if (!authorized) {
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

    let alertLevel = null
    if (newStock <= item.threshold) {
      alertLevel = 'critical'
    } else if (newStock <= item.reorder_threshold) {
      alertLevel = 'reorder'
    }

    if (alertLevel) {
      const alertItem = { ...item, stock: newStock }
      await Promise.all([
        sendEmailAlert([alertItem], alertLevel),
        sendSmsAlert([alertItem], alertLevel),
      ])
    }

    return res.status(200).json({
      sku,
      previous_stock: item.stock,
      new_stock: newStock,
      reorder_threshold: item.reorder_threshold,
      threshold: item.threshold,
      alert_level: alertLevel,
    })
  } catch (err) {
    console.error('Inventory update failed:', err)
    return res.status(500).json({ error: err.message })
  }
}
