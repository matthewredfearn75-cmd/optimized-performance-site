import { supabaseAdmin } from '../../../lib/supabase'
import { sendEmailAlert, sendSmsAlert } from '../../../lib/alerts'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()

  const authHeader = req.headers.authorization
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    const { data: allItems, error } = await supabaseAdmin
      .from('inventory')
      .select('product, size, sku, stock, threshold')

    if (error) throw error

    const lowItems = allItems.filter(item => item.stock <= item.threshold)

    if (lowItems.length === 0) {
      return res.status(200).json({ message: 'All stock levels healthy', checked: new Date() })
    }

    await Promise.all([
      sendEmailAlert(lowItems),
      sendSmsAlert(lowItems),
    ])

    return res.status(200).json({
      message: `Alerts sent for ${lowItems.length} low-stock SKU(s)`,
      items: lowItems,
    })
  } catch (err) {
    console.error('Stock check failed:', err)
    return res.status(500).json({ error: err.message })
  }
}
