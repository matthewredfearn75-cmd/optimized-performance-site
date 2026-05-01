import crypto from 'crypto'

const PROCESSOR = process.env.CARD_PROCESSOR || 'bankful'

export function getProcessorName() {
  return PROCESSOR
}

export async function createCheckoutSession(opts) {
  if (PROCESSOR === 'bankful') return bankfulCreateSession(opts)
  throw new Error(`[cardProcessor] Unsupported processor: ${PROCESSOR}`)
}

export async function parseWebhookEvent({ rawBody, headers }) {
  if (PROCESSOR === 'bankful') return bankfulParseWebhook({ rawBody, headers })
  throw new Error(`[cardProcessor] Unsupported processor: ${PROCESSOR}`)
}

const BANKFUL_LIVE_BASE = 'https://api.paybybankful.com'

function bankfulBaseUrl() {
  return process.env.BANKFUL_API_BASE || BANKFUL_LIVE_BASE
}

// HMAC-SHA256 over sorted-key concatenation of (key + value), excluding the
// `signature` field and any empty/null/undefined values. Salt is the API Secret.
function signBankfulPayload(payload, secret) {
  const keys = Object.keys(payload)
    .filter((k) => k !== 'signature')
    .filter((k) => payload[k] !== undefined && payload[k] !== null && payload[k] !== '')
    .sort()
  const payloadString = keys.map((k) => `${k}${payload[k]}`).join('')
  return crypto.createHmac('sha256', secret).update(payloadString).digest('hex')
}

async function bankfulCreateSession({ orderNumber, amountCents, currency, customer, returnUrl, cancelUrl, callbackUrl }) {
  const reqUsername = process.env.BANKFUL_API_KEY
  const apiPassword = process.env.BANKFUL_API_SECRET
  if (!reqUsername || !apiPassword) {
    throw new Error('[bankful] BANKFUL_API_KEY / BANKFUL_API_SECRET not configured')
  }

  const payload = {
    req_username: reqUsername,
    transaction_type: 'CAPTURE',
    amount: (amountCents / 100).toFixed(2),
    request_currency: currency || 'USD',
    xtl_order_id: orderNumber,
    cart_name: 'Hosted-Page',
    url_complete: returnUrl,
    url_cancel: cancelUrl,
    url_failed: cancelUrl,
    url_pending: returnUrl,
    url_callback: callbackUrl,
    return_redirect_url: 'Y',
  }

  if (customer.email) payload.cust_email = customer.email
  if (customer.firstName) payload.cust_fname = customer.firstName
  if (customer.lastName) payload.cust_lname = customer.lastName
  if (customer.phone) payload.cust_phone = customer.phone
  if (customer.address) payload.bill_addr = customer.address
  if (customer.city) payload.bill_addr_city = customer.city
  if (customer.state) payload.bill_addr_state = customer.state
  if (customer.zip) payload.bill_addr_zip = customer.zip
  if (customer.country) payload.bill_addr_country = customer.country

  const signature = signBankfulPayload(payload, apiPassword)

  const res = await fetch(`${bankfulBaseUrl()}/front-calls/go-in/hosted-page-pay`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...payload, signature }),
  })

  const text = await res.text()
  let data
  try { data = JSON.parse(text) } catch { data = null }

  if (!res.ok || !data) {
    throw new Error(`[bankful] HPP create-session failed (${res.status}): ${text.slice(0, 500)}`)
  }

  const redirectUrl = data.redirect_url
  if (!redirectUrl) {
    throw new Error(`[bankful] HPP response missing redirect_url — fields: ${Object.keys(data).join(', ')}`)
  }
  return { redirectUrl }
}

async function bankfulParseWebhook({ rawBody, headers }) {
  const apiPassword = process.env.BANKFUL_API_SECRET
  if (!apiPassword) return { verified: false, reason: 'BANKFUL_API_SECRET not configured' }

  const params = new URLSearchParams(rawBody)
  const data = {}
  for (const [k, v] of params) data[k] = v

  const receivedSignature = data.signature
  if (!receivedSignature) return { verified: false, reason: 'Missing signature in callback' }

  const expected = signBankfulPayload(data, apiPassword)
  if (expected.toLowerCase() !== String(receivedSignature).toLowerCase()) {
    return { verified: false, reason: 'Signature mismatch' }
  }

  const orderNumber = data.xtl_order_id
  const txId = data.trans_request_id || data.trans_order_id || data.transaction_id || ''
  const eventId = txId ? `${orderNumber}-${txId}` : `${orderNumber}-${receivedSignature.slice(0, 16)}`

  const rawStatus = String(data.trans_status_name || data.status || '').toUpperCase()
  let status = 'pending'
  if (['APPROVED', 'COMPLETED', 'SUCCESS', 'PAID'].includes(rawStatus)) status = 'completed'
  else if (['DECLINED', 'FAILED', 'ERROR', 'CANCELED', 'CANCELLED'].includes(rawStatus)) status = 'failed'

  return { verified: true, eventId, txId, orderNumber, status }
}
