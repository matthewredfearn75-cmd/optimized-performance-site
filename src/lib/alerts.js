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

export async function sendOrderConfirmation(order) {
  const today = new Date()
  const earliest = new Date(today)
  earliest.setDate(today.getDate() + 14)
  const latest = new Date(today)
  latest.setDate(today.getDate() + 21)
  const fmt = (d) => d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

  const itemRows = order.items
    .map(
      (i, idx) => `
      <tr style="background:${idx % 2 === 0 ? '#f9fbfc' : '#ffffff'}">
        <td style="padding:12px 16px;font-size:14px;color:#0D1B2A">${i.name} — ${i.dosage}</td>
        <td style="padding:12px 16px;font-size:14px;color:#0D1B2A;text-align:center">${i.quantity}</td>
        <td style="padding:12px 16px;font-size:14px;color:#0D1B2A;text-align:right">$${(i.price * i.quantity).toFixed(2)}</td>
      </tr>`
    )
    .join('')

  await transporter.sendMail({
    from: `"Optimized Performance" <${process.env.ALERT_EMAIL_FROM}>`,
    to: order.customer_email,
    subject: `Order Confirmed — ${order.order_number}`,
    text: `Thank you for your order!\n\nOrder: ${order.order_number}\nTotal: $${order.total}\n\nEstimated delivery: ${fmt(earliest)} – ${fmt(latest)}\n\nShipping to:\n${order.customer_name}\n${order.shipping_address}\n${order.city}, ${order.state} ${order.zip}\n\nAll products are for research use only. Not for human consumption.`,
    html: `
      <div style="max-width:600px;margin:0 auto;font-family:'Helvetica Neue',Arial,sans-serif">
        <div style="background:#0D1B2A;padding:32px 24px;text-align:center;border-radius:12px 12px 0 0">
          <h1 style="color:#fff;font-size:22px;margin:0 0 4px">OPTIMIZED PERFORMANCE</h1>
          <p style="color:#00B4D8;font-size:12px;letter-spacing:2px;margin:0">ORDER CONFIRMATION</p>
        </div>

        <div style="background:#fff;padding:32px 24px;border:1px solid #E4EDF3;border-top:none">
          <p style="font-size:16px;color:#0D1B2A;margin:0 0 4px">Thank you, ${order.customer_name}!</p>
          <p style="font-size:14px;color:#5A7D9A;margin:0 0 24px">Your order has been confirmed and is being prepared for shipment.</p>

          <div style="background:#F4F9FC;border:1px solid #E4EDF3;border-radius:8px;padding:16px;margin-bottom:24px">
            <table style="width:100%">
              <tr>
                <td style="font-size:12px;color:#5A7D9A;text-transform:uppercase;letter-spacing:1px">Order Number</td>
                <td style="font-size:12px;color:#5A7D9A;text-transform:uppercase;letter-spacing:1px;text-align:right">Estimated Delivery</td>
              </tr>
              <tr>
                <td style="font-size:16px;color:#0D1B2A;font-weight:700">${order.order_number}</td>
                <td style="font-size:14px;color:#0D1B2A;font-weight:600;text-align:right">${fmt(earliest)} – ${fmt(latest)}</td>
              </tr>
            </table>
          </div>

          <table style="width:100%;border-collapse:collapse;margin-bottom:16px">
            <tr style="border-bottom:2px solid #E4EDF3">
              <th style="padding:8px 16px;text-align:left;font-size:11px;color:#5A7D9A;text-transform:uppercase;letter-spacing:1px">Product</th>
              <th style="padding:8px 16px;text-align:center;font-size:11px;color:#5A7D9A;text-transform:uppercase;letter-spacing:1px">Qty</th>
              <th style="padding:8px 16px;text-align:right;font-size:11px;color:#5A7D9A;text-transform:uppercase;letter-spacing:1px">Price</th>
            </tr>
            ${itemRows}
          </table>

          <div style="border-top:2px solid #0D1B2A;padding-top:12px;text-align:right;margin-bottom:24px">
            <span style="font-size:14px;color:#5A7D9A">Total: </span>
            <span style="font-size:20px;color:#0D1B2A;font-weight:700">$${Number(order.total).toFixed(2)}</span>
          </div>

          <div style="background:#F4F9FC;border:1px solid #E4EDF3;border-radius:8px;padding:16px;margin-bottom:24px">
            <p style="font-size:12px;color:#5A7D9A;text-transform:uppercase;letter-spacing:1px;margin:0 0 8px">Shipping To</p>
            <p style="font-size:14px;color:#0D1B2A;margin:0;line-height:1.6">
              ${order.customer_name}<br/>
              ${order.shipping_address}<br/>
              ${order.city}, ${order.state} ${order.zip}
            </p>
          </div>
        </div>

        <div style="background:#FFF5F5;padding:16px 24px;border:1px solid #FECDD3;border-top:none;border-radius:0 0 12px 12px;text-align:center">
          <p style="font-size:11px;color:#CC0000;margin:0;font-weight:600;letter-spacing:0.5px">
            FOR RESEARCH USE ONLY — Not for human consumption. Not for veterinary use.
          </p>
        </div>

        <div style="text-align:center;padding:24px">
          <p style="font-size:11px;color:#9AAAB8;margin:0">&copy; ${new Date().getFullYear()} Optimized Performance Inc. All rights reserved.</p>
        </div>
      </div>
    `,
  })
}
