import { Icon } from './Primitives';

export default function DeliveryEstimate() {
  const today = new Date();
  const earliest = new Date(today);
  earliest.setDate(today.getDate() + 14);
  const latest = new Date(today);
  latest.setDate(today.getDate() + 21);
  const fmt = (date) => date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });

  return (
    <div className="flex items-start gap-3 border border-line rounded-opp bg-surfaceAlt/60 px-4 py-3">
      <div className="text-accent-strong mt-0.5">
        <Icon name="truck" size={18} />
      </div>
      <div>
        <p className="opp-meta-mono uppercase">Estimated Delivery</p>
        <p className="font-semibold text-sm text-ink mt-0.5">
          {fmt(earliest)} – {fmt(latest)}
        </p>
        <p className="text-xs text-ink-soft mt-0.5">Ships within 1–2 business days of order</p>
      </div>
    </div>
  );
}
