import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy - Sports Mockery',
  description: 'Sports Mockery privacy policy and data handling practices.',
}

export default function PrivacyPage() {
  const headingStyle: React.CSSProperties = {
    fontSize: '24px',
    fontWeight: 700,
    color: 'var(--sm-text)',
    fontFamily: "'Space Grotesk', var(--font-heading), sans-serif",
    marginTop: '40px',
    marginBottom: '16px',
  }

  const paragraphStyle: React.CSSProperties = {
    fontFamily: "'Inter', sans-serif",
    fontSize: '16px',
    lineHeight: 1.8,
    color: 'var(--sm-text-muted)',
    marginBottom: '16px',
  }

  const listItemStyle: React.CSSProperties = {
    fontFamily: "'Inter', sans-serif",
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
          fontFamily: "'Space Grotesk', var(--font-heading), sans-serif",
          margin: '0 0 12px',
        }}>
          Privacy Policy
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--sm-text-dim)' }}>
          Last updated: January 2026
        </p>
      </section>

      {/* Content */}
      <section style={{ position: 'relative', maxWidth: '720px', margin: '0 auto', padding: '0 24px 80px' }}>
        <div className="glass-card glass-card-static" style={{ padding: '40px' }}>
          <h2 style={headingStyle}>Introduction</h2>
          <p style={paragraphStyle}>
            Sports Mockery (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to protecting your
            privacy. This Privacy Policy explains how we collect, use, and safeguard
            your information when you visit our website.
          </p>

          <h2 style={headingStyle}>Information We Collect</h2>
          <p style={paragraphStyle}>
            We may collect information about you in various ways, including:
          </p>
          <ul style={{ paddingLeft: '24px', marginBottom: '16px' }}>
            <li style={listItemStyle}>
              <strong style={{ color: 'var(--sm-text)' }}>Personal Data:</strong> Name, email address, and other contact
              information you voluntarily provide when contacting us or subscribing to our newsletter.
            </li>
            <li style={listItemStyle}>
              <strong style={{ color: 'var(--sm-text)' }}>Usage Data:</strong> Information about how you access and use
              our website, including your IP address, browser type, pages visited, and time spent on pages.
            </li>
            <li style={listItemStyle}>
              <strong style={{ color: 'var(--sm-text)' }}>Cookies:</strong> We use cookies and similar tracking technologies
              to enhance your experience on our site.
            </li>
          </ul>

          <h2 style={headingStyle}>How We Use Your Information</h2>
          <p style={paragraphStyle}>We use the information we collect to:</p>
          <ul style={{ paddingLeft: '24px', marginBottom: '16px' }}>
            <li style={listItemStyle}>Provide and maintain our website</li>
            <li style={listItemStyle}>Improve and personalize your experience</li>
            <li style={listItemStyle}>Send you newsletters and updates (if you&apos;ve subscribed)</li>
            <li style={listItemStyle}>Respond to your inquiries and support requests</li>
            <li style={listItemStyle}>Analyze usage patterns to improve our content</li>
          </ul>

          <h2 style={headingStyle}>Third-Party Services</h2>
          <p style={paragraphStyle}>
            We may use third-party services that collect, monitor, and analyze data
            to improve our service. These third parties have their own privacy policies
            addressing how they use such information.
          </p>

          <h2 style={headingStyle}>Advertising</h2>
          <p style={paragraphStyle}>
            We may use third-party advertising companies to serve ads when you visit
            our website. These companies may use information about your visits to
            provide relevant advertisements.
          </p>

          <h2 style={headingStyle}>Data Security</h2>
          <p style={paragraphStyle}>
            We implement appropriate security measures to protect your personal
            information. However, no method of transmission over the Internet is
            100% secure, and we cannot guarantee absolute security.
          </p>

          <h2 style={headingStyle}>Your Rights</h2>
          <p style={paragraphStyle}>You have the right to:</p>
          <ul style={{ paddingLeft: '24px', marginBottom: '16px' }}>
            <li style={listItemStyle}>Access the personal information we hold about you</li>
            <li style={listItemStyle}>Request correction of inaccurate information</li>
            <li style={listItemStyle}>Request deletion of your personal information</li>
            <li style={listItemStyle}>Opt out of marketing communications</li>
          </ul>

          <h2 style={headingStyle}>Changes to This Policy</h2>
          <p style={paragraphStyle}>
            We may update this Privacy Policy from time to time. We will notify you
            of any changes by posting the new Privacy Policy on this page and updating
            the &quot;Last updated&quot; date.
          </p>

          <h2 style={headingStyle}>Contact Us</h2>
          <p style={{ ...paragraphStyle, marginBottom: 0 }}>
            If you have questions about this Privacy Policy, please contact us at{' '}
            <a href="/contact" style={{ color: '#bc0000', textDecoration: 'underline', textUnderlineOffset: '3px' }}>
              our contact page
            </a>{' '}
            or email us at privacy@sportsmockery.com.
          </p>
        </div>
      </section>
    </div>
  )
}
