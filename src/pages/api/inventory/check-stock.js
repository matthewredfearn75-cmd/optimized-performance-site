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
      .select('product, size, sku, stock, threshold, reorder_threshold')

    if (error) throw error

    const criticalItems = allItems.filter(item => item.stock <= item.threshold)
    const reorderItems = allItems.filter(
      item => item.stock <= item.reorder_threshold && item.stock > item.threshold
    )

    if (criticalItems.length === 0 && reorderItems.length === 0) {
      return res.status(200).json({ message: 'All stock levels healthy', checked: new Date() })
    }

    const alerts = []

    if (criticalItems.length > 0) {
      alerts.push(
        sendEmailAlert(criticalItems, 'critical'),
        sendSmsAlert(criticalItems, 'critical'),
      )
    }

    if (reorderItems.length > 0) {
      alerts.push(
        sendEmailAlert(reorderItems, 'reorder'),
        sendSmsAlert(reorderItems, 'reorder'),
      )
    }

    await Promise.all(alerts)

    return res.status(200).json({
      message: `Alerts sent — ${criticalItems.length} critical, ${reorderItems.length} reorder`,
      critical: criticalItems,
      reorder: reorderItems,
    })
  } catch (err) {
    console.error('Stock check failed:', err)
    return res.status(500).json({ error: err.message })
  }
}
