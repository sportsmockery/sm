import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cookie Policy',
  description: 'Sports Mockery cookie policy — how we use cookies and similar technologies.',
  alternates: { canonical: 'https://sportsmockery.com/cookies' },
  openGraph: {
    title: 'Cookie Policy | Sports Mockery',
    description: 'Sports Mockery cookie policy — how we use cookies and similar technologies.',
  },
}

export default function CookiesPage() {
  const headingStyle: React.CSSProperties = {
    fontSize: '24px',
    fontWeight: 700,
    color: 'var(--sm-text)',
    marginTop: '32px',
    marginBottom: '12px',
  }

  const paragraphStyle: React.CSSProperties = {
    fontSize: '16px',
    lineHeight: 1.7,
    color: 'var(--sm-text-muted)',
    marginBottom: '16px',
  }

  return (
    <div style={{ backgroundColor: 'var(--sm-dark)', minHeight: '100vh' }}>
      <div
        style={{
          maxWidth: '720px',
          margin: '0 auto',
          padding: '100px 24px 80px',
        }}
      >
        <h1
          style={{
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            fontWeight: 700,
            color: 'var(--sm-text)',
            marginBottom: '8px',
          }}
        >
          Cookie Policy
        </h1>
        <p style={{ ...paragraphStyle, fontSize: '14px', marginBottom: '32px' }}>
          Last updated: April 19, 2026
        </p>

        <h2 style={headingStyle}>What Are Cookies</h2>
        <p style={paragraphStyle}>
          Cookies are small text files stored on your device when you visit a website.
          They help the site remember your preferences, keep you logged in, and
          understand how you use the site so we can improve your experience.
        </p>

        <h2 style={headingStyle}>How We Use Cookies</h2>
        <p style={paragraphStyle}>
          Sports Mockery uses cookies for the following purposes:
        </p>
        <ul style={{ ...paragraphStyle, paddingLeft: '24px' }}>
          <li style={{ marginBottom: '8px' }}>
            <strong style={{ color: 'var(--sm-text)' }}>Essential cookies:</strong> Required
            for authentication, security, and core site functionality. These cannot be
            disabled.
          </li>
          <li style={{ marginBottom: '8px' }}>
            <strong style={{ color: 'var(--sm-text)' }}>Preference cookies:</strong> Remember
            your settings such as theme preference (light/dark mode) and favorite teams.
          </li>
          <li style={{ marginBottom: '8px' }}>
            <strong style={{ color: 'var(--sm-text)' }}>Analytics cookies:</strong> Help us
            understand how visitors interact with the site so we can improve content and
            performance.
          </li>
        </ul>

        <h2 style={headingStyle}>Third-Party Cookies</h2>
        <p style={paragraphStyle}>
          Some cookies are placed by third-party services that appear on our pages.
          These include analytics providers and content delivery networks. We do not
          control these cookies and recommend reviewing the respective privacy policies
          of those services.
        </p>

        <h2 style={headingStyle}>Managing Cookies</h2>
        <p style={paragraphStyle}>
          You can control and delete cookies through your browser settings. Most browsers
          allow you to refuse cookies or delete existing ones. Note that disabling
          essential cookies may affect site functionality, including the ability to log in.
        </p>

        <h2 style={headingStyle}>Contact Us</h2>
        <p style={paragraphStyle}>
          If you have questions about our use of cookies, please contact us
          at <a href="mailto:info@sportsmockery.com" style={{ color: '#00D4FF' }}>info@sportsmockery.com</a>.
        </p>
      </div>
    </div>
  )
}
