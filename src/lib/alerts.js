import nodemailer from 'nodemailer'
import twilio from 'twilio'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.ALERT_EMAIL_FROM,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
})

export async function sendEmailAlert(items, level = 'critical') {
  const isCritical = level === 'critical'
  const emoji = isCritical ? '🚨' : '📦'
  const title = isCritical ? 'CRITICAL — Low Stock' : 'Reorder Reminder'
  const color = isCritical ? '#DC2626' : '#F59E0B'
  const action = isCritical
    ? 'These products are critically low and need immediate restocking.'
    : 'These products are approaching reorder level — time to place an order and send samples for Jano testing.'

  const rows = items
    .map(
      (i) =>
        `• ${i.product} ${i.size} (SKU: ${i.sku}) — ${i.stock} units left`
    )
    .join('\n')

  await transporter.sendMail({
    from: `"Optimized Performance Alerts" <${process.env.ALERT_EMAIL_FROM}>`,
    to: process.env.ALERT_EMAIL_TO,
    subject: `${emoji} ${title} — ${items.length} SKU${items.length > 1 ? 's' : ''}`,
    text: `${action}\n\n${rows}\n\nLog in to place a reorder now.`,
    html: `
      <h2 style="color:${color}">${emoji} ${title}</h2>
      <p>${action}</p>
      <table style="border-collapse:collapse;width:100%">
        <tr style="background:#1A1A2E;color:white">
          <th style="padding:8px;text-align:left">Product</th>
          <th style="padding:8px;text-align:left">SKU</th>
          <th style="padding:8px;text-align:center">Stock</th>
          <th style="padding:8px;text-align:center">${isCritical ? 'Critical Level' : 'Reorder Level'}</th>
        </tr>
        ${items
          .map(
            (i, idx) => `
          <tr style="background:${idx % 2 === 0 ? '#f0f4ff' : 'white'}">
            <td style="padding:8px">${i.product} ${i.size}</td>
            <td style="padding:8px">${i.sku}</td>
            <td style="padding:8px;text-align:center;color:${color};font-weight:bold">${i.stock}</td>
            <td style="padding:8px;text-align:center">${isCritical ? i.threshold : i.reorder_threshold}</td>
          </tr>`
          )
          .join('')}
      </table>
      ${!isCritical ? '<p style="color:#6B7280;font-size:13px;margin-top:16px"><strong>Reminder:</strong> Allow ~4-5 weeks for supplier shipping + Janoshik COA testing.</p>' : ''}
    `,
  })
}

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
)

export async function sendSmsAlert(items, level = 'critical') {
  const isCritical = level === 'critical'
  const emoji = isCritical ? '🚨' : '📦'
  const label = isCritical ? 'CRITICAL LOW STOCK' : 'REORDER REMINDER'
  const names = items.map((i) => `${i.product} ${i.size} (${i.stock} left)`).join(', ')
  await twilioClient.messages.create({
    body: `${emoji} ${label}: ${names}. Order now — allow 4-5 weeks for restock + COA testing.`,
    from: process.env.TWILIO_FROM_NUMBER,
    to: process.env.ALERT_SMS_TO,
  })
}
