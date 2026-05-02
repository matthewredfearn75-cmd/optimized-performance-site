import { supabaseAdmin } from '../../../lib/supabase'
import { validateSessionToken } from '../../../lib/session'
import { validateOrigin, rateLimit } from '../../../lib/security'

// GET    /api/admin/payouts            → list with filters (status, type, affiliate, period)
// POST   /api/admin/payouts            → create a manual payout
// PATCH  /api/admin/payouts            → mark paid / unpaid (single or bulk)
// DELETE /api/admin/payouts?id=<uuid>  → remove a payout (admin clean-up)
//
// Admin-only, validated via x-admin-token header.

function requireAuth(req) {
  const token = req.headers['x-admin-token']
  return validateSessionToken(token)
}

export default async function handler(req, res) {
  if (!validateOrigin(req)) return res.status(403).json({ error: 'Forbidden' })
  if (!rateLimit(req, { maxRequests: 60, windowMs: 60000 })) {
    return res.status(429).json({ error: 'Too many requests' })
  }
  if (!requireAuth(req)) return res.status(401).json({ error: 'Unauthorized' })
  if (!supabaseAdmin) return res.status(500).json({ error: 'Database not configured' })

  try {
    if (req.method === 'GET') {
      const { status, type, affiliate_id, period, limit = '500' } = req.query
      let q = supabaseAdmin
        .from('affiliate_payouts')
        .select(`
          id, affiliate_id, payout_type, period, amount,
          trigger_affiliate_id, notes, paid_at, created_at,
          affiliate:affiliates!affiliate_payouts_affiliate_id_fkey(name, code, email),
          trigger_affiliate:affiliates!affiliate_payouts_trigger_affiliate_id_fkey(name, code)
        `)
        .order('created_at', { ascending: false })
        .limit(Math.min(Number(limit) || 500, 2000))

      if (status === 'pending') q = q.is('paid_at', null)
      else if (status === 'paid') q = q.not('paid_at', 'is', null)
      if (type) q = q.eq('payout_type', String(type))
      if (affiliate_id) q = q.eq('affiliate_id', String(affiliate_id))
      if (period) q = q.eq('period', String(period))

      const { data, error } = await q
      if (error) throw error
      return res.status(200).json(data || [])
    }

    if (req.method === 'POST') {
      const { affiliate_id, payout_type, period, amount, trigger_affiliate_id, notes } = req.body || {}
      if (!affiliate_id || !payout_type || amount === undefined) {
        return res.status(400).json({ error: 'Missing required fields (affiliate_id, payout_type, amount)' })
      }
      if (!['override', 'royalty', 'manual'].includes(payout_type)) {
        return res.status(400).json({ error: 'Invalid payout_type' })
      }
      const amt = Number(amount)
      if (!Number.isFinite(amt) || amt < -100000 || amt > 1000000) {
        return res.status(400).json({ error: 'Invalid amount' })
      }
      const insert = {
        affiliate_id,
        payout_type,
        period: period || null,
        amount: amt,
        trigger_affiliate_id: trigger_affiliate_id || null,
        notes: notes || null,
      }
      const { data, error } = await supabaseAdmin
        .from('affiliate_payouts')
        .insert(insert)
        .select()
        .single()
      if (error) {
        if (error.code === '23505') {
          return res.status(409).json({ error: 'Duplicate payout for this affiliate/type/period/trigger' })
        }
        throw error
      }
      return res.status(200).json(data)
    }

    if (req.method === 'PATCH') {
      const { ids, action } = req.body || {}
      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ error: 'Missing ids[]' })
      }
      if (ids.length > 500) {
        return res.status(400).json({ error: 'Too many ids in one request (max 500)' })
      }
      if (!['mark_paid', 'mark_unpaid'].includes(action)) {
        return res.status(400).json({ error: 'Invalid action (mark_paid | mark_unpaid)' })
      }
      const patch = action === 'mark_paid'
        ? { paid_at: new Date().toISOString() }
        : { paid_at: null }
      const { data, error } = await supabaseAdmin
        .from('affiliate_payouts')
        .update(patch)
        .in('id', ids)
        .select('id, paid_at')
      if (error) throw error
      return res.status(200).json({ updated: (data || []).length, ids: (data || []).map((d) => d.id) })
    }

    if (req.method === 'DELETE') {
      const { id } = req.query
      if (!id) return res.status(400).json({ error: 'Missing id' })
      const { error } = await supabaseAdmin.from('affiliate_payouts').delete().eq('id', id)
      if (error) throw error
      return res.status(200).json({ ok: true })
    }

    return res.status(405).end()
  } catch (err) {
    console.error('Admin payouts error:', err)
    return res.status(500).json({ error: err.message || 'Internal error' })
  }
}
