import { createAffiliateToken, verifyPassword } from '../../../lib/affiliate-session'
import { supabaseAdmin } from '../../../lib/supabase'
import { validateOrigin, rateLimit, validateEmail } from '../../../lib/security'

// POST /api/affiliates/login
//   Body: { email, password }
//   Success → { token, affiliate: { id, code, name } }
//   Failure → 401 generic; do NOT reveal whether the email exists.
//
// The returned token is a stateless HMAC-signed credential (lib/affiliate-session.js).
// Frontend stores it in React state for the session; refresh = re-login. Token TTL
// is 30 days — but the frontend treats it as session-bound for security.
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  if (!validateOrigin(req)) return res.status(403).json({ error: 'Forbidden' })
  if (!rateLimit(req, { maxRequests: 10, windowMs: 60000 })) {
    return res.status(429).json({ error: 'Too many attempts' })
  }

  const { email, password } = req.body || {}
  if (!validateEmail(email) || typeof password !== 'string' || password.length === 0) {
    return res.status(401).json({ error: 'Invalid email or password' })
  }
  if (!supabaseAdmin) return res.status(500).json({ error: 'Database not configured' })

  // Look up by email — case-insensitive match
  const { data: aff, error } = await supabaseAdmin
    .from('affiliates')
    .select('id, code, name, email, active, login_password_hash')
    .ilike('email', email)
    .single()

  // Always run password compare even if affiliate not found, to prevent timing oracles.
  // Use a dummy hash with the same scrypt cost as a real one.
  const storedHash = aff?.login_password_hash || 'scrypt$00000000000000000000000000000000$' + '0'.repeat(128)
  const passwordOk = verifyPassword(password, storedHash)

  if (error || !aff || !aff.login_password_hash || !passwordOk) {
    return res.status(401).json({ error: 'Invalid email or password' })
  }
  if (!aff.active) return res.status(403).json({ error: 'Account inactive — contact admin@optimizedperformancepeptides.com' })

  let token
  try {
    token = createAffiliateToken(aff.id)
  } catch (e) {
    console.error('createAffiliateToken failed:', e)
    return res.status(500).json({ error: 'Server error — token signing unavailable' })
  }

  return res.status(200).json({
    token,
    affiliate: { id: aff.id, code: aff.code, name: aff.name },
  })
}
