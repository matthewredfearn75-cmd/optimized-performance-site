import SEO from '../components/SEO';

export default function ShippingReturns() {
  return (
    <div style={styles.page}>
      <SEO
        title="Shipping & Returns"
        description="Optimized Performance shipping policy — processing times, carriers, tracking, and return policy for research peptide orders."
        path="/shipping"
      />
      <div style={styles.headerBanner}>
        <p style={styles.eyebrow}>Policies</p>
        <h1 style={styles.title}>Shipping & Returns</h1>
        <p style={styles.subtitle}>Fast, discrete shipping on all orders</p>
      </div>

      <div style={styles.container}>
        <div style={styles.content}>

          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>Order Processing</h2>
            <ul style={styles.list}>
              <li>Orders are processed and shipped within <strong>1 business day</strong> of payment confirmation.</li>
              <li>Orders placed on weekends or holidays will be processed the next business day.</li>
              <li>You will receive a shipping confirmation email with tracking information once your order ships.</li>
            </ul>
          </section>

          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>Shipping Methods & Delivery</h2>
            <div style={styles.tableWrap}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Method</th>
                    <th style={styles.th}>Estimated Delivery</th>
                    <th style={styles.th}>Details</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td style={styles.td}><strong>Standard Shipping</strong></td><td style={styles.td}>3–5 business days</td><td style={styles.td}>USPS Priority Mail</td></tr>
                  <tr><td style={styles.td}><strong>Expedited Shipping</strong></td><td style={styles.td}>1–2 business days</td><td style={styles.td}>USPS Priority Mail Express (when available)</td></tr>
                </tbody>
              </table>
            </div>
            <ul style={styles.list}>
              <li>All orders ship from within the United States.</li>
              <li>We currently ship to <strong>US addresses only</strong>.</li>
              <li>Shipping times are estimates and not guaranteed. Delays may occur due to carrier issues or weather.</li>
            </ul>
          </section>

          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>Packaging</h2>
            <ul style={styles.list}>
              <li>All orders are shipped in <strong>discrete, unbranded packaging</strong> with no indication of contents on the exterior.</li>
              <li>Lyophilized products are packaged to maintain stability during transit.</li>
              <li>Products requiring cold chain shipping will include appropriate insulation.</li>
            </ul>
          </section>

          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>Tracking Your Order</h2>
            <ul style={styles.list}>
              <li>Tracking numbers are provided via email once your order ships.</li>
              <li>You can track your package directly through the USPS website using the tracking number provided.</li>
              <li>If you have not received tracking information within 2 business days of placing your order, please contact us.</li>
            </ul>
          </section>

          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>Returns & Refunds</h2>
            <p style={styles.text}>Due to the nature of our products (lyophilized research compounds), we have a limited return policy:</p>
            <ul style={styles.list}>
              <li><strong>Damaged or defective products:</strong> If your order arrives damaged, contact us within <strong>48 hours</strong> of delivery with photos. We will send a replacement or issue a full refund.</li>
              <li><strong>Incorrect items:</strong> If you received the wrong product, contact us within <strong>48 hours</strong>. We will ship the correct item at no charge.</li>
              <li><strong>Missing packages:</strong> If your tracking shows delivered but you did not receive the package, contact us within <strong>72 hours</strong>. We will work with the carrier to resolve the issue.</li>
              <li><strong>Change of mind:</strong> We do not accept returns for change of mind due to the sensitive nature of research compounds. All sales are final once shipped.</li>
              <li><strong>Opened products:</strong> We cannot accept returns on opened or used products for safety and integrity reasons.</li>
            </ul>
          </section>

          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>Refund Processing</h2>
            <ul style={styles.list}>
              <li>Approved refunds are processed within <strong>3–5 business days</strong>.</li>
              <li>Refunds are issued to the original payment method (USDC via MoonPay).</li>
              <li>MoonPay processing fees are non-refundable.</li>
            </ul>
          </section>

          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>Contact Us</h2>
            <p style={styles.text}>
              For any shipping or returns questions, contact us at:<br />
              <strong>contact@optimizedperformanceinc.com</strong>
            </p>
            <p style={styles.text}>
              Please include your order number and a description of the issue. We aim to respond within 24 hours.
            </p>
          </section>

          <div style={styles.ruo}>
            All products are sold strictly for in-vitro research and laboratory use only.
            Not for human consumption. Not for veterinary use.
          </div>
        </div>
      </div>
    </div>
  );
}

const f = "'Helvetica Neue', Arial, sans-serif";
const styles = {
  page: { minHeight: '60vh', backgroundColor: '#F7FAFB' },
  headerBanner: { backgroundColor: '#0D1B2A', padding: '52px 24px 44px', textAlign: 'center' },
  eyebrow: { margin: '0 0 8px', fontSize: 11, fontWeight: 600, letterSpacing: 3, color: '#00B4D8', textTransform: 'uppercase', fontFamily: f },
  title: { color: '#FFFFFF', fontSize: 34, fontWeight: 700, margin: '0 0 10px', fontFamily: f },
  subtitle: { color: '#7BA3C4', fontSize: 14, margin: 0, fontFamily: f },
  container: { maxWidth: 800, margin: '0 auto', padding: '40px 24px 60px' },
  content: { backgroundColor: '#fff', borderRadius: 12, padding: '40px 36px', border: '1px solid #E4EDF3' },
  section: { marginBottom: 32 },
  sectionTitle: { fontSize: 18, fontWeight: 700, color: '#0D1B2A', marginBottom: 12, fontFamily: f },
  text: { fontSize: 14, color: '#3A4F63', lineHeight: 1.7, marginBottom: 12, fontFamily: f },
  list: { paddingLeft: 20, marginBottom: 12 },
  tableWrap: { overflowX: 'auto', marginBottom: 16 },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 13, fontFamily: f },
  th: { textAlign: 'left', padding: '10px 14px', backgroundColor: '#0D1B2A', color: '#fff', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 },
  td: { padding: '10px 14px', borderBottom: '1px solid #E4EDF3', fontSize: 13, color: '#0D1B2A', fontFamily: f },
  ruo: { marginTop: 32, padding: 16, backgroundColor: '#FFF5F5', borderRadius: 8, border: '1px solid #FECDD3', fontSize: 12, color: '#CC0000', fontWeight: 600, textAlign: 'center', lineHeight: 1.6, fontFamily: f },
};
