import { validateSessionToken } from '../../../lib/session'
import { hashPassword, generateFriendlyPassword } from '../../../lib/affiliate-session'
import { supabaseAdmin } from '../../../lib/supabase'
import { validateOrigin, rateLimit } from '../../../lib/security'

// POST /api/admin/affiliate-password
//   Body: { id: '<affiliate-uuid>' }
//   Generates a fresh 12-char random password, stores its scrypt hash on the
//   affiliate row, returns plaintext + login URL ONCE for admin to copy and
//   hand off to the affiliate.
//
// Subsequent calls rotate the password (invalidating the prior one). There's
// no "view existing password" endpoint — passwords are only shown at creation/reset.
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  if (!validateOrigin(req)) return res.status(403).json({ error: 'Forbidden' })
  if (!rateLimit(req, { maxRequests: 30, windowMs: 60000 })) {
    return res.status(429).json({ error: 'Too many requests' })
  }
  const adminToken = req.headers['x-admin-token']
  if (!validateSessionToken(adminToken)) return res.status(401).json({ error: 'Unauthorized' })

  if (!supabaseAdmin) return res.status(500).json({ error: 'Database not configured' })

  const { id } = req.body || {}
  if (!id || typeof id !== 'string') return res.status(400).json({ error: 'Missing id' })

  // Verify affiliate exists
  const { data: aff, error } = await supabaseAdmin
    .from('affiliates')
    .select('id, code, name, email, active')
    .eq('id', id)
    .single()
  if (error || !aff) return res.status(404).json({ error: 'Affiliate not found' })

  const plaintext = generateFriendlyPassword(12)
  const hash = hashPassword(plaintext)

  const { error: upErr } = await supabaseAdmin
    .from('affiliates')
    .update({ login_password_hash: hash, updated_at: new Date().toISOString() })
    .eq('id', aff.id)
  if (upErr) {
    console.error('affiliate-password update error:', upErr)
    return res.status(500).json({ error: 'Could not save password hash' })
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || ''
  const loginUrl = `${siteUrl}/affiliate/login`

  return res.status(200).json({
    affiliate: { id: aff.id, code: aff.code, name: aff.name, email: aff.email },
    password: plaintext,
    login_url: loginUrl,
    note: 'Show this password to admin once. Affiliate logs in at the URL with their email + this password. Closing this dialog without copying the password = generate a new one.',
  })
}
