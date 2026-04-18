import { createSessionToken } from '../../../lib/session'
import { validateOrigin, rateLimit } from '../../../lib/security'

export default function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  if (!validateOrigin(req)) return res.status(403).json({ error: 'Forbidden' })
  if (!rateLimit(req, { maxRequests: 5, windowMs: 60000 })) return res.status(429).json({ error: 'Too many attempts' })

  const { password } = req.body
  const adminPassword = process.env.ADMIN_PASSWORD
  const sessionSecret = process.env.ADMIN_SESSION_SECRET
  if (!adminPassword || !sessionSecret) {
    console.error('ADMIN_PASSWORD or ADMIN_SESSION_SECRET is not configured')
    return res.status(500).json({ error: 'Server configuration error' })
  }
  if (typeof password !== 'string' || password.length === 0) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  const a = Buffer.from(password)
  const b = Buffer.from(adminPassword)
  if (a.length !== b.length || !require('crypto').timingSafeEqual(a, b)) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const token = createSessionToken()
  return res.status(200).json({ token })
}
