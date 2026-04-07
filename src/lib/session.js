import crypto from 'crypto'

const SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || ''

export function createSessionToken(password) {
  const timestamp = Date.now().toString()
  const hmac = crypto.createHmac('sha256', SESSION_SECRET)
  hmac.update(password + ':' + timestamp)
  return timestamp + '.' + hmac.digest('hex')
}

export function validateSessionToken(token) {
  if (!token || !SESSION_SECRET) return false
  const [timestamp, hash] = token.split('.')
  if (!timestamp || !hash) return false

  // Token expires after 8 hours
  const age = Date.now() - parseInt(timestamp, 10)
  if (age > 8 * 60 * 60 * 1000) return false

  return true
}
