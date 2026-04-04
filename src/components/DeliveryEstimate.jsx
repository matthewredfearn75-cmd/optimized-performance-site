export default function DeliveryEstimate() {
  const today = new Date()

  const earliest = new Date(today)
  earliest.setDate(today.getDate() + 14)

  const latest = new Date(today)
  latest.setDate(today.getDate() + 21)

  const fmt = (date) =>
    date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })

  return (
    <div className="delivery-estimate">
      <span className="delivery-icon">🚚</span>
      <div>
        <p className="delivery-label">Estimated Delivery</p>
        <p className="delivery-date">
          {fmt(earliest)} – {fmt(latest)}
        </p>
        <p className="delivery-note">Ships within 1–2 business days of order</p>
      </div>
    </div>
  )
}
