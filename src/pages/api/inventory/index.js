import { supabaseAdmin } from '../../../lib/supabase'
import { validateSessionToken } from '../../../lib/session'
import { rateLimit } from '../../../lib/security'

const LOW_STOCK_THRESHOLD = 20

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()
  if (!rateLimit(req, { maxRequests: 60, windowMs: 60000 })) return res.status(429).json({ error: 'Too many requests' })

  try {
    const { data: inventory, error } = await supabaseAdmin
      .from('inventory')
      .select('*')
      .order('product')

    if (error) throw error

    // Check if admin token provided — return full data
    const token = req.headers['x-admin-token']
    if (token && validateSessionToken(token)) {
      const result = {}
      inventory.forEach(item => { result[item.product_id] = item.stock })
      return res.status(200).json(result)
    }

    // Public: return only stock status (not exact quantities or thresholds)
    const result = {}
    inventory.forEach(item => {
      const stock = item.stock ?? 0
      result[item.product_id] = stock === 0 ? 0 : stock <= LOW_STOCK_THRESHOLD ? LOW_STOCK_THRESHOLD : 999
    })

    return res.status(200).json(result)
  } catch (err) {
    console.error('Failed to fetch inventory:', err)
    return res.status(500).json({ error: 'Failed to fetch inventory' })
  }
}
