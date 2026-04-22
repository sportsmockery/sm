import { Metadata } from 'next'
import NewsletterForm from './NewsletterForm'

export const metadata: Metadata = {
  title: 'Edge Daily Newsletter | Sports Mockery',
  description: 'Get the Edge Daily — Chicago sports intelligence delivered to your inbox every morning. Scores, stories, Scout AI insights, and more.',
  alternates: { canonical: 'https://sportsmockery.com/newsletter' },
  openGraph: {
    title: 'Edge Daily Newsletter | Sports Mockery',
    description: 'Chicago sports intelligence delivered to your inbox every morning.',
    type: 'website',
  },
}

export default function NewsletterPage() {
  return (
    <div className="sm-hero-bg" style={{ minHeight: '100vh' }}>
      <div className="sm-grid-overlay" />

      {/* Hero */}
      <section style={{ position: 'relative', padding: '140px 24px 60px', textAlign: 'center' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 16px',
          borderRadius: '999px',
          background: 'rgba(0, 212, 255, 0.1)',
          border: '1px solid rgba(0, 212, 255, 0.2)',
          marginBottom: '24px',
        }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#00D4FF', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
            Free Daily Briefing
          </span>
        </div>

        <h1 style={{
          fontSize: 'clamp(2.5rem, 5vw, 4rem)',
          fontWeight: 900,
          letterSpacing: '-1.5px',
          color: 'var(--sm-text)',
          margin: '0 0 16px',
          lineHeight: 1.1,
        }}>
          The Edge Daily
        </h1>
        <p style={{
          fontSize: '20px',
          color: 'var(--sm-text-muted)',
          maxWidth: '560px',
          margin: '0 auto',
          lineHeight: 1.6,
        }}>
          Chicago sports intelligence in your inbox every morning. Scores, top stories, Scout AI insights, and video — one email, zero noise.
        </p>
      </section>

      {/* Form */}
      <section style={{ position: 'relative', maxWidth: '480px', margin: '0 auto', padding: '0 24px 40px' }}>
        <NewsletterForm />
      </section>

      {/* What You Get */}
      <section style={{ position: 'relative', maxWidth: '720px', margin: '0 auto', padding: '0 24px 80px' }}>
        <h2 style={{
          fontSize: '24px',
          fontWeight: 800,
          letterSpacing: '-0.5px',
          color: 'var(--sm-text)',
          textAlign: 'center',
          marginBottom: '32px',
        }}>
          What&apos;s Inside
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
        }}>
          {[
            {
              icon: '📊',
              title: 'Live Scoreboard',
              desc: 'Every Chicago team result from the night before — scores, records, and highlights.',
            },
            {
              icon: '📰',
              title: 'Top Stories',
              desc: 'The biggest Chicago sports stories, curated and ranked by what matters most.',
            },
            {
              icon: '🤖',
              title: 'Scout AI Insights',
              desc: 'AI-powered questions and angles you won\'t find anywhere else.',
            },
            {
              icon: '🎥',
              title: 'Latest Videos',
              desc: 'New episodes from our YouTube channels — podcasts, analysis, and more.',
            },
          ].map((item) => (
            <div
              key={item.title}
              className="glass-card glass-card-static"
              style={{ padding: '24px', textAlign: 'center' }}
            >
              <div style={{ fontSize: '28px', marginBottom: '12px' }}>{item.icon}</div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--sm-text)', marginBottom: '8px' }}>
                {item.title}
              </h3>
              <p style={{ fontSize: '14px', lineHeight: 1.6, color: 'var(--sm-text-muted)', margin: 0 }}>
                {item.desc}
              </p>
            </div>
          ))}
        </div>

        <p style={{
          textAlign: 'center',
          fontSize: '14px',
          color: 'var(--sm-text-dim)',
          marginTop: '32px',
        }}>
          Delivered 6 AM CT, every day. Unsubscribe anytime.
        </p>
      </section>
    </div>
  )
}
