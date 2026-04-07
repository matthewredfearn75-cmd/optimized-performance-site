// CSRF protection: validate origin/referer on POST requests
export function validateOrigin(req) {
  const origin = req.headers.origin || ''
  const referer = req.headers.referer || ''
  const host = req.headers.host || ''

  // Allow server-side calls (no origin/referer — internal API calls)
  if (!origin && !referer) return true

  // Check origin matches host
  if (origin) {
    try {
      const originHost = new URL(origin).host
      if (originHost === host) return true
    } catch { /* invalid URL */ }
    return false
  }

  // Check referer matches host
  if (referer) {
    try {
      const refererHost = new URL(referer).host
      if (refererHost === host) return true
    } catch { /* invalid URL */ }
    return false
  }

  return false
}

// Rate limiter: in-memory, per IP, configurable window
const rateLimitStore = new Map()
const CLEANUP_INTERVAL = 60 * 1000

// Clean up expired entries periodically
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of rateLimitStore) {
      if (now - entry.start > entry.window) rateLimitStore.delete(key)
    }
  }, CLEANUP_INTERVAL)
}

export function rateLimit(req, { maxRequests = 60, windowMs = 60 * 1000 } = {}) {
  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || 'unknown'
  const key = ip + ':' + req.url
  const now = Date.now()

  const entry = rateLimitStore.get(key)
  if (!entry || now - entry.start > windowMs) {
    rateLimitStore.set(key, { count: 1, start: now, window: windowMs })
    return true
  }

  entry.count++
  if (entry.count > maxRequests) return false
  return true
}

// Input validation helpers
export function validateEmail(email) {
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254
}

export function validateString(str, { minLength = 1, maxLength = 500 } = {}) {
  return typeof str === 'string' && str.trim().length >= minLength && str.length <= maxLength
}

export function validateZip(zip) {
  return typeof zip === 'string' && /^\d{5}(-\d{4})?$/.test(zip)
}

export function validatePositiveInt(val) {
  const n = Number(val)
  return Number.isInteger(n) && n > 0 && n < 100000
}
