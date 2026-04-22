import SEO from '../components/SEO';

export default function ShippingReturns() {
  return (
    <div className="max-w-container mx-auto px-8 pt-14 pb-20">
      <SEO
        title="Shipping & Returns"
        description="Optimized Performance shipping policy — processing times, carriers, tracking, and return policy for research peptide orders."
        path="/shipping"
      />

      <div className="pb-8 border-b border-line">
        <span className="opp-eyebrow">Policies</span>
        <h1 className="font-display font-semibold tracking-display text-[clamp(36px,5vw,64px)] leading-none mt-3 mb-2 text-ink">
          Shipping &amp; Returns
        </h1>
        <p className="text-ink-soft text-sm m-0">Fast, discrete shipping on all orders.</p>
      </div>

      <div className="max-w-narrow mx-auto pt-12">
        <div className="card-premium p-8 md:p-12">
          <Section title="Order Processing">
            <ul className="list-disc pl-5 space-y-1.5 text-sm text-ink-soft leading-relaxed">
              <li>Orders are processed and shipped within <strong className="text-ink">1 business day</strong> of payment confirmation.</li>
              <li>Orders placed on weekends or holidays will be processed the next business day.</li>
              <li>You will receive a shipping confirmation email with tracking information once your order ships.</li>
            </ul>
          </Section>

          <Section title="Shipping Methods & Delivery">
            <div className="overflow-x-auto mb-4 border border-line rounded-opp-lg">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-surfaceAlt">
                    <th className="text-left px-4 py-3 font-mono text-[10px] font-semibold tracking-[0.14em] uppercase text-ink-mute">Method</th>
                    <th className="text-left px-4 py-3 font-mono text-[10px] font-semibold tracking-[0.14em] uppercase text-ink-mute">Estimated Delivery</th>
                    <th className="text-left px-4 py-3 font-mono text-[10px] font-semibold tracking-[0.14em] uppercase text-ink-mute">Details</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-line">
                    <td className="px-4 py-3 text-ink font-medium">Standard Shipping</td>
                    <td className="px-4 py-3 text-ink-soft">3–5 business days</td>
                    <td className="px-4 py-3 text-ink-soft">USPS Priority Mail</td>
                  </tr>
                  <tr className="border-t border-line">
                    <td className="px-4 py-3 text-ink font-medium">Expedited Shipping</td>
                    <td className="px-4 py-3 text-ink-soft">1–2 business days</td>
                    <td className="px-4 py-3 text-ink-soft">USPS Priority Mail Express (when available)</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <ul className="list-disc pl-5 space-y-1.5 text-sm text-ink-soft leading-relaxed">
              <li>All orders ship from within the United States.</li>
              <li>We currently ship to <strong className="text-ink">US addresses only</strong>.</li>
              <li>Shipping times are estimates and not guaranteed.</li>
            </ul>
          </Section>

          <Section title="Packaging">
            <ul className="list-disc pl-5 space-y-1.5 text-sm text-ink-soft leading-relaxed">
              <li>All orders are shipped in <strong className="text-ink">discrete, unbranded packaging</strong>.</li>
              <li>Lyophilized products are packaged to maintain stability during transit.</li>
              <li>Products requiring cold chain shipping will include appropriate insulation.</li>
            </ul>
          </Section>

          <Section title="Tracking Your Order">
            <ul className="list-disc pl-5 space-y-1.5 text-sm text-ink-soft leading-relaxed">
              <li>Tracking numbers are provided via email once your order ships.</li>
              <li>Track your package through the USPS website using the tracking number provided.</li>
              <li>If you have not received tracking within 2 business days, please contact us.</li>
            </ul>
          </Section>

          <Section title="Returns & Refunds">
            <p className="text-sm text-ink-soft leading-relaxed mb-3">Due to the nature of our products, we have a limited return policy:</p>
            <ul className="list-disc pl-5 space-y-1.5 text-sm text-ink-soft leading-relaxed">
              <li><strong className="text-ink">Damaged or defective products:</strong> Contact us within 7 days of delivery with photos.</li>
              <li><strong className="text-ink">Incorrect items:</strong> Contact us within 7 days of delivery. We will ship the correct item at no charge.</li>
              <li><strong className="text-ink">Missing packages:</strong> Contact us within 72 hours if tracking shows delivered but not received.</li>
              <li><strong className="text-ink">Change of mind:</strong> All sales are final once shipped.</li>
              <li><strong className="text-ink">Opened products:</strong> Cannot be returned for safety and integrity reasons.</li>
            </ul>
          </Section>

          <Section title="Refund Processing">
            <ul className="list-disc pl-5 space-y-1.5 text-sm text-ink-soft leading-relaxed">
              <li>Approved refunds are processed within 3–5 business days.</li>
              <li>Refunds are issued to the original payment method (USDC via MoonPay).</li>
              <li>MoonPay processing fees are non-refundable.</li>
            </ul>
          </Section>

          <Section title="Contact Us">
            <p className="text-sm text-ink-soft leading-relaxed mb-2">
              For any shipping or returns questions, contact us:
            </p>
            <div className="bg-surfaceAlt border border-line rounded-opp p-5 mb-3">
              <p className="text-sm text-ink-soft mb-1 m-0">
                Email:{' '}
                <a href="mailto:contact@optimizedperformanceinc.com" className="text-accent-strong hover:underline font-semibold">
                  contact@optimizedperformanceinc.com
                </a>
              </p>
              <p className="text-sm text-ink-soft m-0">
                Phone:{' '}
                <a href="tel:+18312185147" className="text-accent-strong hover:underline font-semibold font-mono">
                  +1 (831) 218-5147
                </a>
              </p>
            </div>
            <p className="text-sm text-ink-soft leading-relaxed">
              Please include your order number and a description of the issue. We aim to respond within 24 hours.
            </p>
          </Section>

          <div className="mt-8 p-4 bg-surfaceAlt border border-line rounded-opp text-center">
            <p className="font-mono text-[11px] text-danger font-medium leading-relaxed m-0">
              All products are sold strictly for in-vitro research and laboratory use only.
              Not for human consumption. Not for veterinary use.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <section className="mb-8">
      <h2 className="font-display font-semibold tracking-display text-[22px] leading-snug mb-3 pb-2 border-b border-line text-ink">
        {title}
      </h2>
      {children}
    </section>
  );
}
