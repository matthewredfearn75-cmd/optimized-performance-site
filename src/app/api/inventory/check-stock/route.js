import { supabaseAdmin } from '@/lib/supabase'
import { sendEmailAlert, sendSmsAlert } from '@/lib/alerts'
import { NextResponse } from 'next/server'

export async function GET(request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { data: allItems, error } = await supabaseAdmin
      .from('inventory')
      .select('product, size, sku, stock, threshold')

    if (error) throw error

    const lowItems = allItems.filter(item => item.stock <= item.threshold)

    if (lowItems.length === 0) {
      return NextResponse.json({ message: 'All stock levels healthy', checked: new Date() })
    }

    await Promise.all([
      sendEmailAlert(lowItems),
      sendSmsAlert(lowItems),
    ])

    return NextResponse.json({
      message: `Alerts sent for ${lowItems.length} low-stock SKU(s)`,
      items: lowItems,
    })
  } catch (err) {
    console.error('Stock check failed:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
