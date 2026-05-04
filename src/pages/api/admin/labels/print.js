import { supabaseAdmin } from '../../../../lib/supabase'
import { validateSessionToken } from '../../../../lib/session'
import { validateOrigin, rateLimit } from '../../../../lib/security'
import QRCode from 'qrcode'
import sharp from 'sharp'

function requireAuth(req) {
  const token = req.headers['x-admin-token']
  return validateSessionToken(token)
}

// Phomemo label media: 2.0" × 1.0" rolls. Two-up layout (matches Matt's
// workflow — print pair, cut in half = two 1"×1" tiles per label).
//
// 203 DPI is the Phomemo M02/P12/M110 native resolution. 2"×1" at 203 DPI =
// 406×203 pixels. Each tile is 203×203.
const DPI = 203
const LABEL_W_IN = 2
const LABEL_H_IN = 1
const LABEL_W = LABEL_W_IN * DPI // 406
const LABEL_H = LABEL_H_IN * DPI // 203
const TILE_W = LABEL_W / 2 // 203
const QR_SIZE = 150 // px, leaves room for text below

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://optimizedperformancepeptides.com'

function escapeXml(s) {
  return String(s).replace(/[<>&"']/g, (c) => ({
    '<': '&lt;',
    '>': '&gt;',
    '&': '&amp;',
    '"': '&quot;',
    "'": '&apos;',
  }[c]))
}

function formatExp(iso) {
  if (!iso) return ''
  const [y, m, d] = String(iso).split('-')
  if (!y || !m || !d) return ''
  return `${y.slice(2)}${m}${d}`
}

async function buildLabelSvg({ qrPng, sku, lotNumber, expiryShort }) {
  const qrDataUri = `data:image/png;base64,${qrPng.toString('base64')}`
  const lotText = escapeXml(`LOT ${lotNumber}`)
  const expText = expiryShort ? escapeXml(`EXP ${expiryShort}`) : ''
  const skuText = escapeXml(sku.toUpperCase())

  // Two-up: identical content twice; user cuts down the middle. Each tile
  // gets centered QR (top) + LOT/EXP text block (bottom).
  function tile(xOffset) {
    const qrX = xOffset + (TILE_W - QR_SIZE) / 2
    return `
      <image href="${qrDataUri}" x="${qrX}" y="8" width="${QR_SIZE}" height="${QR_SIZE}" />
      <text x="${xOffset + TILE_W / 2}" y="${QR_SIZE + 26}" text-anchor="middle"
            font-family="Helvetica, Arial, sans-serif" font-size="14" font-weight="700" fill="#000">${lotText}</text>
      ${expText ? `<text x="${xOffset + TILE_W / 2}" y="${QR_SIZE + 42}" text-anchor="middle"
            font-family="Helvetica, Arial, sans-serif" font-size="11" font-weight="400" fill="#000">${expText}</text>` : ''}
      <text x="${xOffset + TILE_W / 2}" y="${LABEL_H - 4}" text-anchor="middle"
            font-family="Helvetica, Arial, sans-serif" font-size="9" font-weight="500" fill="#444" letter-spacing="0.5">${skuText} · SCAN COA</text>
    `
  }

  // Subtle middle cut guide
  const cutGuide = `<line x1="${TILE_W}" y1="0" x2="${TILE_W}" y2="${LABEL_H}"
                          stroke="#bbb" stroke-width="1" stroke-dasharray="3,3" />`

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${LABEL_W}" height="${LABEL_H}" viewBox="0 0 ${LABEL_W} ${LABEL_H}">
    <rect width="${LABEL_W}" height="${LABEL_H}" fill="#fff" />
    ${tile(0)}
    ${tile(TILE_W)}
    ${cutGuide}
  </svg>`
}

export default async function handler(req, res) {
  if (!validateOrigin(req)) return res.status(403).json({ error: 'Forbidden' })
  if (!rateLimit(req, { maxRequests: 60, windowMs: 60000 })) {
    return res.status(429).json({ error: 'Too many requests' })
  }
  if (!requireAuth(req)) return res.status(401).json({ error: 'Unauthorized' })
  if (!supabaseAdmin) return res.status(500).json({ error: 'Database not configured' })

  if (req.method !== 'POST') return res.status(405).end()

  try {
    const { batchId, qty } = req.body
    if (!batchId) return res.status(400).json({ error: 'Missing batchId' })
    const printQty = Math.max(1, Math.min(parseInt(qty) || 1, 1000))

    const { data: batch, error: batchErr } = await supabaseAdmin
      .from('batches')
      .select('id, sku, lot_number, expiry_date')
      .eq('id', batchId)
      .single()
    if (batchErr || !batch) {
      return res.status(404).json({ error: 'Batch not found' })
    }

    const coaUrl = `${SITE_URL}/coa/${encodeURIComponent(batch.sku)}/${encodeURIComponent(batch.lot_number)}`
    const qrPng = await QRCode.toBuffer(coaUrl, {
      errorCorrectionLevel: 'M',
      margin: 1,
      width: QR_SIZE,
      color: { dark: '#000000', light: '#FFFFFF' },
    })

    const svg = await buildLabelSvg({
      qrPng,
      sku: batch.sku,
      lotNumber: batch.lot_number,
      expiryShort: formatExp(batch.expiry_date),
    })

    const png = await sharp(Buffer.from(svg)).png().toBuffer()

    // Audit log: every print is recorded for inventory reconciliation, recall
    // traceability, and chargeback evidence. Failure here doesn't block the
    // download — the label is more important than the log row.
    await supabaseAdmin
      .from('label_prints')
      .insert({
        batch_id: batch.id,
        qty: printQty,
        printed_by: 'admin',
      })
      .then(({ error }) => {
        if (error) console.error('[labels/print] audit log insert failed:', error.message)
      })

    res.setHeader('Content-Type', 'image/png')
    res.setHeader(
      'Content-Disposition',
      `inline; filename="label_${batch.sku}_${batch.lot_number}_x${printQty}.png"`,
    )
    res.setHeader('X-Print-Qty', String(printQty))
    res.setHeader('X-Coa-Url', coaUrl)
    return res.status(200).send(png)
  } catch (err) {
    console.error('[labels/print] error:', err)
    return res.status(500).json({ error: err.message })
  }
}

export const config = {
  api: {
    responseLimit: '4mb',
  },
}
