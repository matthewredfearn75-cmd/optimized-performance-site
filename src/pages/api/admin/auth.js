import { createSessionToken } from '../../../lib/session'
import { validateOrigin, rateLimit } from '../../../lib/security'

export default function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  if (!validateOrigin(req)) return res.status(403).json({ error: 'Forbidden' })
  if (!rateLimit(req, { maxRequests: 5, windowMs: 60000 })) return res.status(429).json({ error: 'Too many attempts' })

  const { password } = req.body
  const adminPassword = process.env.ADMIN_PASSWORD
  if (!adminPassword) {
    return res.status(500).json({ error: 'Server configuration error' })
  }
  if (password !== adminPassword) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const token = createSessionToken(password)
  return res.status(200).json({ token })
}
