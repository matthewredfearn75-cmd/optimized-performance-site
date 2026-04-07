import SEO from '../components/SEO';

export default function TermsOfService() {
  const lastUpdated = 'April 4, 2026';
  const companyName = 'Optimized Performance Inc.';
  const contactEmail = 'contact@optimizedperformanceinc.com';
  const siteUrl = 'optimizedperformancepeptides.com';

  return (
    <div style={styles.page}>
      <SEO title="Terms of Service" description="Optimized Performance terms of service — research use only disclaimer, ordering terms, and policies." path="/terms" />
      <div style={styles.headerBanner}>
        <p style={styles.eyebrow}>Legal</p>
        <h1 style={styles.title}>Terms of Service</h1>
        <p style={styles.subtitle}>Last updated: {lastUpdated}</p>
      </div>

      <div style={styles.container}>
        <div style={styles.content}>

          <section style={styles.section}>
            <p style={styles.intro}>
              Welcome to {siteUrl} (the "Site"), operated by {companyName} ("we," "us," or "our").
              By accessing or using this Site, placing an order, or purchasing any product, you agree to be bound by
              these Terms of Service ("Terms"). If you do not agree to these Terms, do not use this Site.
            </p>
          </section>

          <Section title="1. Research Use Only">
            <p style={styles.p}>
              <strong>All products sold on this Site are strictly for in-vitro research and laboratory use only.</strong> Products
              are not intended for human consumption, veterinary use, therapeutic use, or any diagnostic purpose. Products are
              not drugs, foods, cosmetics, or dietary supplements and have not been evaluated or approved by the U.S. Food and
              Drug Administration (FDA) or any other regulatory agency.
            </p>
            <p style={styles.p}>
              By purchasing from this Site, you represent and warrant that:
            </p>
            <ul style={styles.ul}>
              <li style={styles.li}>You are purchasing products solely for legitimate research purposes</li>
              <li style={styles.li}>You will not use, administer, or distribute products for human or animal consumption</li>
              <li style={styles.li}>You understand and accept the research-use-only nature of all products</li>
              <li style={styles.li}>You will comply with all applicable federal, state, and local laws regarding the purchase, handling, and use of research compounds</li>
            </ul>
          </Section>

          <Section title="2. Eligibility">
            <p style={styles.p}>
              You must be at least 21 years of age to purchase products from this Site. By placing an order, you
              confirm that you meet this age requirement. We reserve the right to refuse service to anyone and to
              cancel orders at our sole discretion.
            </p>
          </Section>

          <Section title="3. Product Information and Accuracy">
            <p style={styles.p}>
              We make reasonable efforts to ensure that product descriptions, concentrations, and other information
              on this Site are accurate. However, we do not warrant that product descriptions or other content on
              this Site are error-free or complete. All products are provided "as is" for research purposes.
            </p>
            <p style={styles.p}>
              Certificates of Analysis (COAs) are available for products upon request and reflect testing
              performed by independent third-party laboratories. COA results are specific to the batch tested
              and may vary between production lots.
            </p>
          </Section>

          <Section title="4. Orders, Pricing, and Payment">
            <p style={styles.p}>
              All prices are listed in U.S. dollars and are subject to change without notice. We reserve the
              right to modify pricing, discontinue products, or limit order quantities at any time.
            </p>
            <p style={styles.p}>
              Payment is processed through MoonPay, a third-party payment provider. By completing a purchase,
              you agree to MoonPay's terms of service. We do not store or have access to your payment card
              or banking information.
            </p>
            <p style={styles.p}>
              Volume discounts may be applied automatically based on cart quantity. Discount tiers and
              eligibility are determined at our sole discretion and may be modified at any time.
            </p>
          </Section>

          <Section title="5. Shipping and Delivery">
            <p style={styles.p}>
              Orders are processed and shipped within 1-2 business days. Estimated delivery times are
              provided as a courtesy and are not guaranteed. {companyName} is not responsible for delays
              caused by shipping carriers, weather, customs, or other circumstances beyond our control.
            </p>
            <p style={styles.p}>
              Risk of loss and title for products pass to you upon delivery to the shipping carrier.
              All shipments include discrete packaging with no external indication of contents.
            </p>
          </Section>

          <Section title="6. Returns, Refunds, and Cancellations">
            <p style={styles.p}>
              Due to the nature of research compounds, all sales are final. We do not accept returns or
              exchanges on opened or used products. If you receive a damaged or incorrect product, contact
              us within 7 days of delivery at{' '}
              <a href={`mailto:${contactEmail}`} style={styles.link}>{contactEmail}</a> with
              photographic evidence and your order number. We will, at our sole discretion, issue a
              replacement or store credit.
            </p>
            <p style={styles.p}>
              Orders may be cancelled prior to shipment by contacting us. Once an order has shipped,
              it cannot be cancelled.
            </p>
          </Section>

          <Section title="7. Limitation of Liability">
            <p style={styles.p}>
              To the maximum extent permitted by law, {companyName}, its officers, directors, employees,
              and agents shall not be liable for any indirect, incidental, special, consequential, or
              punitive damages arising out of or related to your use of this Site, purchase of products,
              or reliance on any information provided herein.
            </p>
            <p style={styles.p}>
              Our total liability for any claim arising from your use of the Site or purchase of products
              shall not exceed the amount you paid for the specific product giving rise to the claim.
            </p>
          </Section>

          <Section title="8. Indemnification">
            <p style={styles.p}>
              You agree to indemnify, defend, and hold harmless {companyName}, its officers, directors,
              employees, agents, and affiliates from and against any and all claims, liabilities, damages,
              losses, costs, and expenses (including reasonable attorneys' fees) arising out of or related to:
            </p>
            <ul style={styles.ul}>
              <li style={styles.li}>Your use of any product purchased from this Site</li>
              <li style={styles.li}>Your violation of these Terms</li>
              <li style={styles.li}>Your violation of any applicable law or regulation</li>
              <li style={styles.li}>Any misuse, mishandling, or improper storage of products</li>
              <li style={styles.li}>Any claim by a third party related to your use of our products</li>
            </ul>
          </Section>

          <Section title="9. Intellectual Property">
            <p style={styles.p}>
              All content on this Site, including but not limited to text, graphics, logos, images,
              and software, is the property of {companyName} and is protected by U.S. and international
              copyright, trademark, and intellectual property laws. You may not reproduce, distribute,
              modify, or create derivative works from any content on this Site without our prior written consent.
            </p>
          </Section>

          <Section title="10. Prohibited Uses">
            <p style={styles.p}>You agree not to use this Site or any products purchased from it to:</p>
            <ul style={styles.ul}>
              <li style={styles.li}>Manufacture, compound, or formulate products for human or animal consumption</li>
              <li style={styles.li}>Resell products as drugs, supplements, or therapeutic agents</li>
              <li style={styles.li}>Make any health, medical, or therapeutic claims about our products</li>
              <li style={styles.li}>Violate any federal, state, or local law or regulation</li>
              <li style={styles.li}>Engage in fraudulent activity, including the use of false identities or stolen payment methods</li>
            </ul>
            <p style={styles.p}>
              Violation of these prohibitions may result in immediate termination of your account,
              cancellation of orders, and referral to law enforcement authorities.
            </p>
          </Section>

          <Section title="11. Disclaimer of Warranties">
            <p style={styles.p}>
              Products are provided "as is" and "as available" without warranties of any kind, either
              express or implied, including but not limited to implied warranties of merchantability,
              fitness for a particular purpose, or non-infringement. We do not warrant that products
              will meet your specific research requirements or that results obtained from product use
              will be accurate or reliable.
            </p>
          </Section>

          <Section title="12. Governing Law and Dispute Resolution">
            <p style={styles.p}>
              These Terms shall be governed by and construed in accordance with the laws of the State
              in which {companyName} is incorporated, without regard to its conflict of law provisions.
              Any dispute arising out of or relating to these Terms or your use of the Site shall be
              resolved through binding arbitration in accordance with the rules of the American
              Arbitration Association, except that either party may seek injunctive relief in any court
              of competent jurisdiction.
            </p>
          </Section>

          <Section title="13. Modifications to Terms">
            <p style={styles.p}>
              We reserve the right to modify these Terms at any time. Changes will be posted on this
              page with a revised "Last Updated" date. Your continued use of the Site after any
              modifications constitutes acceptance of the updated Terms. It is your responsibility to
              review these Terms periodically.
            </p>
          </Section>

          <Section title="14. Severability">
            <p style={styles.p}>
              If any provision of these Terms is found to be unenforceable or invalid, that provision
              shall be limited or eliminated to the minimum extent necessary, and the remaining
              provisions shall remain in full force and effect.
            </p>
          </Section>

          <Section title="15. Contact Us">
            <p style={styles.p}>
              If you have any questions about these Terms of Service, please contact us:
            </p>
            <div style={styles.contactBox}>
              <p style={styles.contactLine}><strong>{companyName}</strong></p>
              <p style={styles.contactLine}>Email: <a href={`mailto:${contactEmail}`} style={styles.link}>{contactEmail}</a></p>
              <p style={styles.contactLine}>Website: <a href={`https://${siteUrl}`} style={styles.link}>{siteUrl}</a></p>
            </div>
          </Section>

        </div>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <section style={{ marginBottom: 36 }}>
      <h2 style={{
        fontSize: 18,
        fontWeight: 700,
        color: '#0D1B2A',
        marginBottom: 12,
        paddingBottom: 8,
        borderBottom: '1px solid #E4EDF3',
        fontFamily: "'Helvetica Neue', Arial, sans-serif",
      }}>
        {title}
      </h2>
      {children}
    </section>
  );
}

const styles = {
  page: { minHeight: '100vh', backgroundColor: '#F7FAFB' },
  headerBanner: { backgroundColor: '#0D1B2A', padding: '52px 24px 44px', textAlign: 'center' },
  eyebrow: { margin: '0 0 8px', fontSize: 11, fontWeight: 600, letterSpacing: 3, color: '#00B4D8', textTransform: 'uppercase', fontFamily: "'Helvetica Neue', Arial, sans-serif" },
  title: { color: '#FFFFFF', fontSize: 34, fontWeight: 700, margin: '0 0 10px', fontFamily: "'Helvetica Neue', Arial, sans-serif" },
  subtitle: { color: '#7BA3C4', fontSize: 13, margin: 0, fontFamily: "'Helvetica Neue', Arial, sans-serif" },
  container: { maxWidth: 860, margin: '0 auto', padding: '48px 24px' },
  content: { backgroundColor: '#fff', borderRadius: 12, border: '1px solid #E4EDF3', padding: '40px 48px' },
  intro: { fontSize: 14, color: '#4B5563', lineHeight: 1.7, fontFamily: "'Helvetica Neue', Arial, sans-serif", marginBottom: 0 },
  section: { marginBottom: 36 },
  p: { fontSize: 14, color: '#4B5563', lineHeight: 1.7, margin: '0 0 12px', fontFamily: "'Helvetica Neue', Arial, sans-serif" },
  ul: { margin: '0 0 12px', paddingLeft: 20 },
  li: { fontSize: 14, color: '#4B5563', lineHeight: 1.8, fontFamily: "'Helvetica Neue', Arial, sans-serif" },
  link: { color: '#00B4D8', textDecoration: 'none' },
  contactBox: {
    backgroundColor: '#F4F9FC',
    border: '1px solid #E4EDF3',
    borderRadius: 8,
    padding: '16px 20px',
    marginTop: 8,
  },
  contactLine: { margin: '0 0 4px', fontSize: 14, color: '#0D1B2A', fontFamily: "'Helvetica Neue', Arial, sans-serif" },
};
