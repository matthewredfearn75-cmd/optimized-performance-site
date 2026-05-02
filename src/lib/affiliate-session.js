import crypto from 'crypto'

const SECRET = process.env.AFFILIATE_SESSION_SECRET || ''
const TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000 // 30 days

// Token format: <affiliateId>.<issuedAt>.<hmac>
//   - hmac = HMAC-SHA256( SECRET, `${affiliateId}.${issuedAt}` )
//   - tokens are signed at admin-link-generation time; validation is stateless.
//   - to revoke a single affiliate's tokens, rotate AFFILIATE_SESSION_SECRET (revokes all),
//     or extend this module with a per-affiliate rotation counter on the affiliates row.

export function createAffiliateToken(affiliateId) {
  if (!SECRET) {
    throw new Error('AFFILIATE_SESSION_SECRET is not configured')
  }
  if (!affiliateId || typeof affiliateId !== 'string') {
    throw new Error('createAffiliateToken: affiliateId required')
  }
  const issuedAt = Date.now().toString()
  const payload = `${affiliateId}.${issuedAt}`
  const hmac = crypto.createHmac('sha256', SECRET).update(payload).digest('hex')
  return `${payload}.${hmac}`
}

export function validateAffiliateToken(token) {
  if (!token || !SECRET) return null

  const parts = String(token).split('.')
  if (parts.length !== 3) return null
  const [affiliateId, issuedAt, hmac] = parts
  if (!affiliateId || !issuedAt || !hmac) return null

  const ts = parseInt(issuedAt, 10)
  if (!Number.isFinite(ts)) return null
  const age = Date.now() - ts
  if (age < 0 || age > TOKEN_TTL_MS) return null

  const expected = crypto
    .createHmac('sha256', SECRET)
    .update(`${affiliateId}.${issuedAt}`)
    .digest('hex')

  let a, b
  try {
    a = Buffer.from(hmac, 'hex')
    b = Buffer.from(expected, 'hex')
  } catch {
    return null
  }
  if (a.length !== b.length) return null
  try {
    if (!crypto.timingSafeEqual(a, b)) return null
  } catch {
    return null
  }

  return { affiliateId, issuedAt: ts }
}

// =========================================
// Password hashing (scrypt — Node stdlib)
// =========================================
// Stored format: scrypt$<saltHex>$<keyHex>
//   - salt: 16 bytes random
//   - key:  64 bytes scrypt-derived
// Both timing-constant compared on verify.

const SCRYPT_KEYLEN = 64
const SCRYPT_SALTLEN = 16

export function hashPassword(plaintext) {
  if (typeof plaintext !== 'string' || plaintext.length === 0) {
    throw new Error('hashPassword: plaintext required')
  }
  const salt = crypto.randomBytes(SCRYPT_SALTLEN)
  const key = crypto.scryptSync(plaintext, salt, SCRYPT_KEYLEN)
  return `scrypt$${salt.toString('hex')}$${key.toString('hex')}`
}

export function verifyPassword(plaintext, stored) {
  if (typeof plaintext !== 'string' || typeof stored !== 'string') return false
  const parts = stored.split('$')
  if (parts.length !== 3 || parts[0] !== 'scrypt') return false
  let salt, expected
  try {
    salt = Buffer.from(parts[1], 'hex')
    expected = Buffer.from(parts[2], 'hex')
  } catch {
    return false
  }
  if (salt.length !== SCRYPT_SALTLEN || expected.length !== SCRYPT_KEYLEN) return false
  let actual
  try {
    actual = crypto.scryptSync(plaintext, salt, SCRYPT_KEYLEN)
  } catch {
    return false
  }
  try {
    return crypto.timingSafeEqual(actual, expected)
  } catch {
    return false
  }
}

// Generate a 12-character human-friendly password — admin shows this once to copy.
// Uses a base32-style alphabet (no 0/O, 1/l, etc) to avoid handoff transcription errors.
const FRIENDLY_ALPHABET = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789'

export function generateFriendlyPassword(length = 12) {
  const chars = []
  const bytes = crypto.randomBytes(length)
  for (let i = 0; i < length; i++) {
    chars.push(FRIENDLY_ALPHABET[bytes[i] % FRIENDLY_ALPHABET.length])
  }
  return chars.join('')
}
