import { supabaseAdmin } from '../../../lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()

  try {
    const { data: inventory, error } = await supabaseAdmin
      .from('inventory')
      .select('*')
      .order('product')

    if (error) throw error

    // Return as { productId: stock } for the admin page
    const result = {}
    inventory.forEach(item => { result[item.product_id] = item.stock })

    return res.status(200).json(result)
  } catch (err) {
    console.error('Failed to fetch inventory:', err)
    return res.status(500).json({ error: 'Failed to fetch inventory' })
  }
}
