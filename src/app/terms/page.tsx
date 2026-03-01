import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service - Sports Mockery',
  description: 'Sports Mockery terms of service and conditions of use.',
}

export default function TermsPage() {
  const headingStyle: React.CSSProperties = {
    fontSize: '24px',
    fontWeight: 700,
    color: 'var(--sm-text)',
    fontFamily: "Barlow, var(--font-heading), sans-serif",
    marginTop: '40px',
    marginBottom: '16px',
  }

  const paragraphStyle: React.CSSProperties = {
    fontFamily: "Barlow, sans-serif",
    fontSize: '16px',
    lineHeight: 1.8,
    color: 'var(--sm-text-muted)',
    marginBottom: '16px',
  }

  const listItemStyle: React.CSSProperties = {
    fontFamily: "Barlow, sans-serif",
    fontSize: '16px',
    lineHeight: 1.8,
    color: 'var(--sm-text-muted)',
    marginBottom: '8px',
  }

  return (
    <div className="sm-hero-bg" style={{ minHeight: '100vh' }}>
      <div className="sm-grid-overlay" />

      {/* Hero / Header */}
      <section style={{ position: 'relative', padding: '140px 24px 80px', textAlign: 'center' }}>
        <h1 style={{
          fontSize: '40px',
          fontWeight: 900,
          letterSpacing: '-1px',
          color: 'var(--sm-text)',
          fontFamily: "Barlow, var(--font-heading), sans-serif",
          margin: '0 0 12px',
        }}>
          Terms of Service
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--sm-text-dim)' }}>
          Last updated: February 2026
        </p>
      </section>

      {/* Content */}
      <section style={{ position: 'relative', maxWidth: '720px', margin: '0 auto', padding: '0 24px 80px' }}>
        <div className="glass-card glass-card-static" style={{ padding: '40px' }}>
          <h2 style={headingStyle}>Agreement to Terms</h2>
          <p style={paragraphStyle}>
            By accessing or using Sports Mockery (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;),
            you agree to be bound by these Terms of Service. If you do not agree to these
            terms, please do not use our website.
          </p>

          <h2 style={headingStyle}>Use of Our Service</h2>
          <p style={paragraphStyle}>You agree to use our website only for lawful purposes and in accordance with these Terms. You agree not to:</p>
          <ul style={{ paddingLeft: '24px', marginBottom: '16px' }}>
            <li style={listItemStyle}>Use the service in any way that violates applicable laws or regulations</li>
            <li style={listItemStyle}>Attempt to gain unauthorized access to any portion of the website</li>
            <li style={listItemStyle}>Use automated systems or software to extract data from the website (scraping)</li>
            <li style={listItemStyle}>Interfere with or disrupt the integrity or performance of the service</li>
            <li style={listItemStyle}>Impersonate any person or entity, or falsely represent your affiliation</li>
          </ul>

          <h2 style={headingStyle}>User Accounts</h2>
          <p style={paragraphStyle}>
            When you create an account with us, you must provide accurate and complete
            information. You are responsible for maintaining the security of your account
            and password. We cannot and will not be liable for any loss or damage from
            your failure to comply with this security obligation.
          </p>

          <h2 style={headingStyle}>Intellectual Property</h2>
          <p style={paragraphStyle}>
            The content on Sports Mockery, including text, graphics, logos, images, and
            software, is the property of Sports Mockery or its content suppliers and is
            protected by copyright and other intellectual property laws. You may not
            reproduce, distribute, or create derivative works from our content without
            express written permission.
          </p>

          <h2 style={headingStyle}>User-Generated Content</h2>
          <p style={paragraphStyle}>
            By posting content on our platform (including fan chat messages, comments,
            and poll responses), you grant us a non-exclusive, royalty-free license to
            use, display, and distribute that content in connection with our service.
            You are solely responsible for the content you post and must not post content that is:
          </p>
          <ul style={{ paddingLeft: '24px', marginBottom: '16px' }}>
            <li style={listItemStyle}>Defamatory, obscene, or otherwise objectionable</li>
            <li style={listItemStyle}>Infringing on any third party&apos;s intellectual property rights</li>
            <li style={listItemStyle}>Spam, advertising, or solicitation</li>
            <li style={listItemStyle}>Harmful, threatening, or harassing to other users</li>
          </ul>

          <h2 style={headingStyle}>AI-Powered Features</h2>
          <p style={paragraphStyle}>
            Our platform includes AI-powered features such as Scout AI and the GM Trade
            Simulator. These features provide entertainment and informational content only.
            AI-generated responses should not be considered professional advice. We make
            no guarantees about the accuracy of AI-generated content.
          </p>

          <h2 style={headingStyle}>Subscriptions and Payments</h2>
          <p style={paragraphStyle}>
            Some features of Sports Mockery may require a paid subscription. By
            subscribing, you agree to pay the applicable fees. Subscriptions
            automatically renew unless cancelled before the renewal date. Refunds
            are handled in accordance with our refund policy.
          </p>

          <h2 style={headingStyle}>Disclaimer of Warranties</h2>
          <p style={paragraphStyle}>
            Sports Mockery is provided &quot;as is&quot; and &quot;as available&quot; without
            warranties of any kind, either express or implied. We do not guarantee
            that the service will be uninterrupted, secure, or error-free. Sports
            statistics, scores, and other data are provided for informational purposes
            and may not always be current or accurate.
          </p>

          <h2 style={headingStyle}>Limitation of Liability</h2>
          <p style={paragraphStyle}>
            In no event shall Sports Mockery be liable for any indirect, incidental,
            special, consequential, or punitive damages arising out of or relating to
            your use of the service, whether based on warranty, contract, tort, or any
            other legal theory.
          </p>

          <h2 style={headingStyle}>Changes to These Terms</h2>
          <p style={paragraphStyle}>
            We reserve the right to modify these Terms at any time. We will notify
            users of any material changes by posting the updated Terms on this page
            and updating the &quot;Last updated&quot; date. Your continued use of the
            service after changes constitutes acceptance of the new Terms.
          </p>

          <h2 style={headingStyle}>Contact Us</h2>
          <p style={{ ...paragraphStyle, marginBottom: 0 }}>
            If you have questions about these Terms of Service, please contact us at{' '}
            <a href="/contact" style={{ color: '#bc0000', textDecoration: 'underline', textUnderlineOffset: '3px' }}>
              our contact page
            </a>{' '}
            or email us at legal@sportsmockery.com.
          </p>
        </div>
      </section>
    </div>
  )
}
