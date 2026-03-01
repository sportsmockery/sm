import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact Us - Sports Mockery',
  description: 'Get in touch with Sports Mockery. Send us tips, feedback, or inquiries.',
}

export default function ContactPage() {
  return (
    <div className="sm-hero-bg" style={{ minHeight: '100vh' }}>
      <div className="sm-grid-overlay" />

      {/* Hero Section */}
      <section style={{ position: 'relative', padding: '140px 24px 80px', textAlign: 'center' }}>
        <h1 style={{
          fontSize: 'clamp(2.5rem, 5vw, 4rem)',
          fontWeight: 900,
          letterSpacing: '-1.5px',
          color: 'var(--sm-text)',
          fontFamily: "Barlow, var(--font-heading), sans-serif",
          margin: '0 0 16px',
        }}>
          Contact Us
        </h1>
        <p style={{ fontSize: '20px', color: 'var(--sm-text-muted)', maxWidth: '700px', margin: '0 auto', lineHeight: 1.6 }}>
          Have a question, tip, or feedback? We&apos;d love to hear from you.
        </p>
      </section>

      {/* Form Section */}
      <section style={{ position: 'relative', maxWidth: '560px', margin: '0 auto', padding: '0 24px 80px' }}>
        <div className="glass-card glass-card-static" style={{ padding: '40px' }}>
          <form style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Name */}
            <div>
              <label htmlFor="name" style={{ display: 'block', fontWeight: 600, fontSize: '14px', color: 'var(--sm-text)', marginBottom: '8px' }}>
                Name
              </label>
              <input type="text" id="name" name="name" required className="sm-input" placeholder="Your name" />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" style={{ display: 'block', fontWeight: 600, fontSize: '14px', color: 'var(--sm-text)', marginBottom: '8px' }}>
                Email
              </label>
              <input type="email" id="email" name="email" required className="sm-input" placeholder="you@example.com" />
            </div>

            {/* Subject */}
            <div>
              <label htmlFor="subject" style={{ display: 'block', fontWeight: 600, fontSize: '14px', color: 'var(--sm-text)', marginBottom: '8px' }}>
                Subject
              </label>
              <select id="subject" name="subject" className="sm-input" style={{ appearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23888' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 16px center' }}>
                <option value="general">General Inquiry</option>
                <option value="tip">News Tip</option>
                <option value="feedback">Feedback</option>
                <option value="advertising">Advertising</option>
                <option value="write">Write for Us</option>
              </select>
            </div>

            {/* Message */}
            <div>
              <label htmlFor="message" style={{ display: 'block', fontWeight: 600, fontSize: '14px', color: 'var(--sm-text)', marginBottom: '8px' }}>
                Message
              </label>
              <textarea id="message" name="message" rows={6} required className="sm-input sm-textarea" placeholder="Your message..." />
            </div>

            {/* Submit Button */}
            <button type="submit" className="btn-primary btn-full">
              Send Message
            </button>
          </form>
        </div>

        {/* Contact Info */}
        <div style={{ marginTop: '48px', paddingTop: '32px', borderTop: '1px solid var(--sm-border)', textAlign: 'center' }}>
          <h2 style={{
            fontSize: '20px', fontWeight: 700, color: 'var(--sm-text)',
            fontFamily: "Barlow, var(--font-heading), sans-serif", marginBottom: '16px',
          }}>
            Other Ways to Reach Us
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <p style={{ fontSize: '15px', color: 'var(--sm-text-muted)', margin: 0 }}>Email: contact@sportsmockery.com</p>
            <p style={{ fontSize: '15px', color: 'var(--sm-text-muted)', margin: 0 }}>Twitter: @sportsmockery</p>
          </div>
        </div>
      </section>
    </div>
  )
}
