import { supabaseAdmin } from '../../../lib/supabase'
import { validateSessionToken } from '../../../lib/session'
import { validateOrigin, rateLimit, validateString } from '../../../lib/security'

function requireAuth(req) {
  const token = req.headers['x-admin-token']
  return validateSessionToken(token)
}

const LOT_REGEX = /^\d{6}(-[A-Z])?$/

// Lyophilized peptides default to 24-month shelf life from production date.
// Admin can override per batch via the form's expiryDate field.
function defaultExpiry(productionDateISO) {
  const d = new Date(productionDateISO)
  d.setUTCFullYear(d.getUTCFullYear() + 2)
  return d.toISOString().split('T')[0]
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
      const { data, error } = await supabaseAdmin
        .from('batches')
        .select('*')
        .order('production_date', { ascending: false })
        .order('created_at', { ascending: false })
      if (error) throw error
      return res.status(200).json(data || [])
    }

    if (req.method === 'POST') {
      const { sku, lotNumber, productionDate, expiryDate, supplierLotId, vialsProduced, coaPdfPath, notes } = req.body
      if (!validateString(sku) || !validateString(lotNumber)) {
        return res.status(400).json({ error: 'Invalid SKU or lot number' })
      }
      if (!LOT_REGEX.test(lotNumber)) {
        return res.status(400).json({ error: 'Lot number must be YYMMDD or YYMMDD-A format' })
      }

      const prod = productionDate || new Date().toISOString().split('T')[0]
      const exp = expiryDate || defaultExpiry(prod)

      const insertData = {
        sku,
        lot_number: lotNumber,
        production_date: prod,
        expiry_date: exp,
        vials_produced: parseInt(vialsProduced) || 0,
        notes: notes || '',
      }
      if (supplierLotId) insertData.supplier_lot_id = supplierLotId
      if (coaPdfPath) {
        insertData.coa_pdf_path = coaPdfPath
        insertData.coa_uploaded_at = new Date().toISOString()
      }

      const { data, error } = await supabaseAdmin
        .from('batches')
        .insert(insertData)
        .select()
        .single()
      if (error) throw error
      return res.status(200).json(data)
    }

    if (req.method === 'PATCH') {
      const { id, ...updates } = req.body
      if (!id) return res.status(400).json({ error: 'Missing id' })

      const patch = { updated_at: new Date().toISOString() }
      if (updates.sku !== undefined) patch.sku = updates.sku
      if (updates.lotNumber !== undefined) {
        if (!LOT_REGEX.test(updates.lotNumber)) {
          return res.status(400).json({ error: 'Lot number must be YYMMDD or YYMMDD-A format' })
        }
        patch.lot_number = updates.lotNumber
      }
      if (updates.productionDate !== undefined) patch.production_date = updates.productionDate
      if (updates.expiryDate !== undefined) patch.expiry_date = updates.expiryDate
      if (updates.supplierLotId !== undefined) patch.supplier_lot_id = updates.supplierLotId || null
      if (updates.vialsProduced !== undefined) patch.vials_produced = parseInt(updates.vialsProduced) || 0
      if (updates.notes !== undefined) patch.notes = updates.notes
      if (updates.coaPdfPath !== undefined) {
        patch.coa_pdf_path = updates.coaPdfPath
        patch.coa_uploaded_at = updates.coaPdfPath ? new Date().toISOString() : null
      }

      const { data, error } = await supabaseAdmin
        .from('batches')
        .update(patch)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return res.status(200).json(data)
    }

    if (req.method === 'DELETE') {
      const { id } = req.body
      if (!id) return res.status(400).json({ error: 'Missing id' })
      // CASCADE on label_prints removes audit rows along with the batch.
      const { error } = await supabaseAdmin.from('batches').delete().eq('id', id)
      if (error) throw error
      return res.status(200).json({ ok: true })
    }

    return res.status(405).end()
  } catch (err) {
    console.error('Admin batches error:', err)
    return res.status(500).json({ error: err.message })
  }
}
