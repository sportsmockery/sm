import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact Us - Sports Mockery',
  description: 'Get in touch with Sports Mockery. Send us tips, feedback, or inquiries.',
}

export default function ContactPage() {
  return (
    <div style={{ backgroundColor: 'var(--sm-dark)', minHeight: '100vh' }}>
      {/* Hero Section */}
      <section
        style={{
          padding: '140px 24px 80px',
          background: 'linear-gradient(180deg, var(--sm-surface) 0%, var(--sm-dark) 100%)',
          borderBottom: '1px solid var(--sm-border)',
          textAlign: 'center',
        }}
      >
        <h1
          style={{
            fontSize: 'clamp(2.5rem, 5vw, 4rem)',
            fontWeight: 900,
            letterSpacing: '-1.5px',
            color: 'var(--sm-text)',
            fontFamily: "'Montserrat', sans-serif",
            margin: '0 0 16px',
          }}
        >
          Contact Us
        </h1>
        <p
          style={{
            fontSize: '20px',
            color: 'var(--sm-text-muted)',
            maxWidth: '700px',
            margin: '0 auto',
            lineHeight: 1.6,
          }}
        >
          Have a question, tip, or feedback? We&apos;d love to hear from you.
        </p>
      </section>

      {/* Form Section */}
      <section
        style={{
          maxWidth: '600px',
          margin: '0 auto',
          padding: '80px 24px',
        }}
      >
        <div
          style={{
            backgroundColor: 'var(--sm-card)',
            border: '1px solid var(--sm-border)',
            borderRadius: 'var(--sm-radius-xl)',
            padding: '40px',
          }}
        >
          <form className="space-y-6">
            {/* Name */}
            <div>
              <label
                htmlFor="name"
                style={{
                  display: 'block',
                  fontWeight: 600,
                  fontSize: '14px',
                  color: 'var(--sm-text)',
                  marginBottom: '8px',
                }}
              >
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                className="w-full"
                placeholder="Your name"
                style={{
                  backgroundColor: 'var(--sm-surface)',
                  border: '1px solid var(--sm-border)',
                  borderRadius: '12px',
                  color: 'var(--sm-text)',
                  padding: '12px 16px',
                  fontSize: '15px',
                  outline: 'none',
                  width: '100%',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                style={{
                  display: 'block',
                  fontWeight: 600,
                  fontSize: '14px',
                  color: 'var(--sm-text)',
                  marginBottom: '8px',
                }}
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                className="w-full"
                placeholder="you@example.com"
                style={{
                  backgroundColor: 'var(--sm-surface)',
                  border: '1px solid var(--sm-border)',
                  borderRadius: '12px',
                  color: 'var(--sm-text)',
                  padding: '12px 16px',
                  fontSize: '15px',
                  outline: 'none',
                  width: '100%',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Subject */}
            <div>
              <label
                htmlFor="subject"
                style={{
                  display: 'block',
                  fontWeight: 600,
                  fontSize: '14px',
                  color: 'var(--sm-text)',
                  marginBottom: '8px',
                }}
              >
                Subject
              </label>
              <select
                id="subject"
                name="subject"
                className="w-full"
                style={{
                  backgroundColor: 'var(--sm-surface)',
                  border: '1px solid var(--sm-border)',
                  borderRadius: '12px',
                  color: 'var(--sm-text)',
                  padding: '12px 16px',
                  fontSize: '15px',
                  outline: 'none',
                  width: '100%',
                  boxSizing: 'border-box',
                  appearance: 'none',
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23888' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 16px center',
                }}
              >
                <option value="general">General Inquiry</option>
                <option value="tip">News Tip</option>
                <option value="feedback">Feedback</option>
                <option value="advertising">Advertising</option>
                <option value="write">Write for Us</option>
              </select>
            </div>

            {/* Message */}
            <div>
              <label
                htmlFor="message"
                style={{
                  display: 'block',
                  fontWeight: 600,
                  fontSize: '14px',
                  color: 'var(--sm-text)',
                  marginBottom: '8px',
                }}
              >
                Message
              </label>
              <textarea
                id="message"
                name="message"
                rows={6}
                required
                placeholder="Your message..."
                style={{
                  backgroundColor: 'var(--sm-surface)',
                  border: '1px solid var(--sm-border)',
                  borderRadius: '12px',
                  color: 'var(--sm-text)',
                  padding: '12px 16px',
                  fontSize: '15px',
                  outline: 'none',
                  width: '100%',
                  boxSizing: 'border-box',
                  resize: 'none',
                }}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full"
              style={{
                background: 'linear-gradient(135deg, #bc0000, #ff4444)',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '16px',
                padding: '14px 24px',
                borderRadius: '9999px',
                border: 'none',
                cursor: 'pointer',
                width: '100%',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
            >
              Send Message
            </button>
          </form>
        </div>

        {/* Contact Info */}
        <div
          style={{
            marginTop: '48px',
            paddingTop: '32px',
            borderTop: '1px solid var(--sm-border)',
            textAlign: 'center',
          }}
        >
          <h2
            style={{
              fontSize: '20px',
              fontWeight: 700,
              color: 'var(--sm-text)',
              fontFamily: "'Montserrat', sans-serif",
              marginBottom: '16px',
            }}
          >
            Other Ways to Reach Us
          </h2>
          <div className="space-y-2">
            <p style={{ fontSize: '15px', color: 'var(--sm-text-muted)' }}>
              Email: contact@sportsmockery.com
            </p>
            <p style={{ fontSize: '15px', color: 'var(--sm-text-muted)' }}>
              Twitter: @sportsmockery
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
