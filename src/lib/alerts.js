import nodemailer from 'nodemailer'
import twilio from 'twilio'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.ALERT_EMAIL_FROM,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
})

export async function sendEmailAlert(items) {
  const rows = items
    .map(
      (i) =>
        `• ${i.product} ${i.size} (SKU: ${i.sku}) — ${i.stock} units left (threshold: ${i.threshold})`
    )
    .join('\n')

  await transporter.sendMail({
    from: `"Optimized Performance Alerts" <${process.env.ALERT_EMAIL_FROM}>`,
    to: process.env.ALERT_EMAIL_TO,
    subject: `⚠️ Low Stock Alert — ${items.length} SKU${items.length > 1 ? 's' : ''} need reordering`,
    text: `The following products have fallen below their reorder threshold:\n\n${rows}\n\nLog in to place a reorder now.`,
    html: `
      <h2 style="color:#E94560">⚠️ Low Stock Alert</h2>
      <p>The following products need to be reordered:</p>
      <table style="border-collapse:collapse;width:100%">
        <tr style="background:#1A1A2E;color:white">
          <th style="padding:8px;text-align:left">Product</th>
          <th style="padding:8px;text-align:left">SKU</th>
          <th style="padding:8px;text-align:center">Stock</th>
          <th style="padding:8px;text-align:center">Threshold</th>
        </tr>
        ${items
          .map(
            (i, idx) => `
          <tr style="background:${idx % 2 === 0 ? '#f0f4ff' : 'white'}">
            <td style="padding:8px">${i.product} ${i.size}</td>
            <td style="padding:8px">${i.sku}</td>
            <td style="padding:8px;text-align:center;color:#E94560;font-weight:bold">${i.stock}</td>
            <td style="padding:8px;text-align:center">${i.threshold}</td>
          </tr>`
          )
          .join('')}
      </table>
    `,
  })
}

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
)

export async function sendSmsAlert(items) {
  const names = items.map((i) => `${i.product} ${i.size} (${i.stock} left)`).join(', ')
  await twilioClient.messages.create({
    body: `⚠️ Optimized Performance — Low stock: ${names}. Log in to reorder.`,
    from: process.env.TWILIO_FROM_NUMBER,
    to: process.env.ALERT_SMS_TO,
  })
}
