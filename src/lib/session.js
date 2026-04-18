import crypto from 'crypto'

const SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || ''
const TOKEN_TTL_MS = 8 * 60 * 60 * 1000 // 8h

export function createSessionToken() {
  if (!SESSION_SECRET) {
    throw new Error('ADMIN_SESSION_SECRET is not configured')
  }
  const timestamp = Date.now().toString()
  const hash = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(timestamp)
    .digest('hex')
  return `${timestamp}.${hash}`
}

export function validateSessionToken(token) {
  if (!token || !SESSION_SECRET) return false

  const parts = token.split('.')
  if (parts.length !== 2) return false
  const [timestamp, hash] = parts
  if (!timestamp || !hash) return false

  const ts = parseInt(timestamp, 10)
  if (!Number.isFinite(ts)) return false

  const age = Date.now() - ts
  if (age < 0 || age > TOKEN_TTL_MS) return false

  const expected = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(timestamp)
    .digest('hex')

  const a = Buffer.from(hash, 'hex')
  const b = Buffer.from(expected, 'hex')
  if (a.length !== b.length) return false
  try {
    return crypto.timingSafeEqual(a, b)
  } catch {
    return false
  }
}
