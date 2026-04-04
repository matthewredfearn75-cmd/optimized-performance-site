export default function PrivacyPolicy() {
  const lastUpdated = 'April 3, 2025';
  const companyName = 'Optimized Performance Inc.';
  const contactEmail = 'contact@optimizedperformanceinc.com';
  const siteUrl = 'optimizedperformanceinc.com';

  return (
    <div style={styles.page}>
      <div style={styles.headerBanner}>
        <p style={styles.eyebrow}>Legal</p>
        <h1 style={styles.title}>Privacy Policy</h1>
        <p style={styles.subtitle}>Last updated: {lastUpdated}</p>
      </div>

      <div style={styles.container}>
        <div style={styles.content}>

          <section style={styles.section}>
            <p style={styles.intro}>
              {companyName} ("we," "us," or "our") operates {siteUrl} (the "Site"). This Privacy Policy explains
              how we collect, use, disclose, and safeguard your information when you visit our Site or make a purchase.
              Please read this policy carefully. By using the Site, you consent to the practices described herein.
            </p>
          </section>

          <Section title="1. Information We Collect">
            <p style={styles.p}>We may collect the following types of information:</p>
            <Subsection title="Personal Information You Provide">
              <ul style={styles.ul}>
                <li style={styles.li}>Name and shipping address</li>
                <li style={styles.li}>Email address</li>
                <li style={styles.li}>Phone number (if provided)</li>
                <li style={styles.li}>Order history and preferences</li>
              </ul>
            </Subsection>
            <Subsection title="Payment Information">
              <p style={styles.p}>
                We do not directly collect or store payment card information. All payment processing is handled by
                <strong> MoonPay</strong>, a third-party payment service provider. When you complete a purchase,
                you are subject to MoonPay's own terms of service and privacy policy, available at{' '}
                <a href="https://www.moonpay.com/legal/privacy_policy" style={styles.link} target="_blank" rel="noopener noreferrer">
                  moonpay.com/legal/privacy_policy
                </a>.
                MoonPay may collect your name, billing address, payment card details, and identity verification
                information as required by applicable financial regulations.
              </p>
            </Subsection>
            <Subsection title="Automatically Collected Information">
              <ul style={styles.ul}>
                <li style={styles.li}>IP address and approximate location</li>
                <li style={styles.li}>Browser type and version</li>
                <li style={styles.li}>Pages visited and time spent on the Site</li>
                <li style={styles.li}>Referring URLs</li>
                <li style={styles.li}>Device type and operating system</li>
              </ul>
            </Subsection>
          </Section>

          <Section title="2. How We Use Your Information">
            <p style={styles.p}>We use the information we collect to:</p>
            <ul style={styles.ul}>
              <li style={styles.li}>Process and fulfill your orders</li>
              <li style={styles.li}>Send order confirmations and shipping notifications</li>
              <li style={styles.li}>Respond to customer service inquiries</li>
              <li style={styles.li}>Comply with legal obligations</li>
              <li style={styles.li}>Improve our Site and product offerings</li>
              <li style={styles.li}>Prevent fraud and unauthorized transactions</li>
              <li style={styles.li}>Send transactional emails related to your purchases</li>
            </ul>
            <p style={styles.p}>
              We do not sell, rent, or trade your personal information to third parties for marketing purposes.
            </p>
          </Section>

          <Section title="3. MoonPay Payment Processing">
            <p style={styles.p}>
              Our Site uses MoonPay to process payments. MoonPay is a regulated financial services provider that
              facilitates cryptocurrency and fiat payment transactions. By completing a purchase on our Site, you
              acknowledge and agree that:
            </p>
            <ul style={styles.ul}>
              <li style={styles.li}>Your payment information is transmitted directly and securely to MoonPay</li>
              <li style={styles.li}>MoonPay may require identity verification (KYC) as part of their regulatory obligations</li>
              <li style={styles.li}>MoonPay may collect, store, and process your personal and financial data in accordance with their privacy policy</li>
              <li style={styles.li}>We receive only a confirmation of payment and do not have access to your card or bank details</li>
              <li style={styles.li}>MoonPay transaction data may be stored on servers outside your country of residence</li>
            </ul>
            <p style={styles.p}>
              For questions about how MoonPay handles your data, please review their privacy policy at{' '}
              <a href="https://www.moonpay.com/legal/privacy_policy" style={styles.link} target="_blank" rel="noopener noreferrer">
                moonpay.com/legal/privacy_policy
              </a>.
            </p>
          </Section>

          <Section title="4. Sharing of Information">
            <p style={styles.p}>We may share your information with:</p>
            <ul style={styles.ul}>
              <li style={styles.li}><strong>MoonPay</strong> — for payment processing</li>
              <li style={styles.li}><strong>Shipping carriers</strong> (USPS, UPS, FedEx) — to fulfill and track your order</li>
              <li style={styles.li}><strong>Email service providers</strong> — to send transactional emails</li>
              <li style={styles.li}><strong>Law enforcement or government agencies</strong> — when required by law or to protect our legal rights</li>
            </ul>
            <p style={styles.p}>
              We do not share your information with any other third parties without your explicit consent.
            </p>
          </Section>

          <Section title="5. Cookies and Tracking Technologies">
            <p style={styles.p}>
              Our Site may use cookies and similar tracking technologies to enhance your browsing experience,
              analyze Site traffic, and remember your preferences. You may disable cookies through your browser
              settings; however, doing so may affect certain Site functionality.
            </p>
            <p style={styles.p}>
              We do not use cookies for advertising or behavioral tracking purposes.
            </p>
          </Section>

          <Section title="6. Data Retention">
            <p style={styles.p}>
              We retain your personal information for as long as necessary to fulfill the purposes outlined in this
              policy, comply with legal obligations, resolve disputes, and enforce our agreements. Order records are
              typically retained for a minimum of 7 years for tax and accounting purposes.
            </p>
          </Section>

          <Section title="7. Data Security">
            <p style={styles.p}>
              We implement industry-standard security measures to protect your personal information, including
              SSL/TLS encryption for data in transit. However, no method of transmission over the internet is
              100% secure. We cannot guarantee absolute security of your data.
            </p>
          </Section>

          <Section title="8. Your Rights">
            <p style={styles.p}>Depending on your location, you may have the right to:</p>
            <ul style={styles.ul}>
              <li style={styles.li}>Access the personal information we hold about you</li>
              <li style={styles.li}>Request correction of inaccurate data</li>
              <li style={styles.li}>Request deletion of your personal information</li>
              <li style={styles.li}>Opt out of certain data processing activities</li>
              <li style={styles.li}>Lodge a complaint with a data protection authority</li>
            </ul>
            <p style={styles.p}>
              To exercise any of these rights, please contact us at <a href={`mailto:${contactEmail}`} style={styles.link}>{contactEmail}</a>.
            </p>
          </Section>

          <Section title="9. California Privacy Rights (CCPA)">
            <p style={styles.p}>
              If you are a California resident, you have the right to know what personal information we collect,
              request deletion of your personal information, and opt out of the sale of personal information.
              We do not sell personal information. To submit a request, contact us at{' '}
              <a href={`mailto:${contactEmail}`} style={styles.link}>{contactEmail}</a>.
            </p>
          </Section>

          <Section title="10. Children's Privacy">
            <p style={styles.p}>
              Our Site is intended for adults aged 18 and older. We do not knowingly collect personal information
              from individuals under 18. All products are sold strictly for research use by qualified professionals.
              If you believe a minor has provided us with personal information, please contact us immediately.
            </p>
          </Section>

          <Section title="11. Research Use Only Disclaimer">
            <p style={styles.p}>
              All products sold on this Site are for <strong>research use only (RUO)</strong> and are not intended
              for human or veterinary use. By purchasing, you confirm you are a qualified researcher or professional
              purchasing for legitimate in-vitro research purposes. We do not collect or store any information
              related to the end use of research products.
            </p>
          </Section>

          <Section title="12. Third-Party Links">
            <p style={styles.p}>
              Our Site may contain links to third-party websites. We are not responsible for the privacy practices
              of those sites and encourage you to review their privacy policies before providing any personal information.
            </p>
          </Section>

          <Section title="13. Changes to This Policy">
            <p style={styles.p}>
              We reserve the right to update this Privacy Policy at any time. Changes will be posted on this page
              with a revised "Last Updated" date. Your continued use of the Site after any changes constitutes
              acceptance of the updated policy.
            </p>
          </Section>

          <Section title="14. Contact Us">
            <p style={styles.p}>
              If you have any questions or concerns about this Privacy Policy, please contact us:
            </p>
            <div style={styles.contactBox}>
              <p style={styles.contactLine}><strong>{companyName}</strong></p>
              <p style={styles.contactLine}>Email: <a href={`mailto:${contactEmail}`} style={styles.link}>{contactEmail}</a></p>
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

function Subsection({ title, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <h3 style={{
        fontSize: 14,
        fontWeight: 600,
        color: '#0D1B2A',
        marginBottom: 8,
        fontFamily: "'Helvetica Neue', Arial, sans-serif",
      }}>
        {title}
      </h3>
      {children}
    </div>
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
