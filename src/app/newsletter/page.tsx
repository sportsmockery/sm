import { Metadata } from 'next'
import NewsletterForm from './NewsletterForm'
import styles from './newsletter.module.css'

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
      <section style={{ position: 'relative', maxWidth: '900px', margin: '0 auto', padding: '0 24px 48px' }}>
        <h2 style={{
          fontSize: '24px',
          fontWeight: 800,
          letterSpacing: '-0.5px',
          color: 'var(--sm-text)',
          textAlign: 'center',
          marginBottom: '32px',
        }}>
          What&apos;s Inside Every Edition
        </h2>

        <div className={styles.featureGrid}>
          {[
            {
              title: 'Scoreboard',
              desc: 'Bears, Bulls, Cubs, Sox, Hawks — every final score, record, and result from the night before.',
            },
            {
              title: 'Top Stories',
              desc: 'The biggest Chicago sports stories curated and ranked by readership. Headlines that actually matter.',
            },
            {
              title: 'Scout AI',
              desc: 'AI-generated questions and angles tailored to the day\'s news — insights you won\'t find anywhere else.',
            },
            {
              title: 'Video',
              desc: 'Latest episodes from Untold Chicago Stories, Pinwheels & Ivy, and No Strokes — direct links, no searching.',
            },
          ].map((item) => (
            <div
              key={item.title}
              className="glass-card glass-card-static"
              style={{ padding: '20px', textAlign: 'center' }}
            >
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--sm-text)', marginBottom: '8px' }}>
                {item.title}
              </h3>
              <p style={{ fontSize: '13px', lineHeight: 1.6, color: 'var(--sm-text-muted)', margin: 0 }}>
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Why Subscribe */}
      <section style={{ position: 'relative', maxWidth: '600px', margin: '0 auto', padding: '0 24px 80px' }}>
        <div className="glass-card glass-card-static" style={{ padding: '32px' }}>
          <h2 style={{
            fontSize: '22px',
            fontWeight: 800,
            letterSpacing: '-0.5px',
            color: 'var(--sm-text)',
            marginBottom: '20px',
            textAlign: 'center',
          }}>
            Why 6 AM with Edge?
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { label: 'All five teams, one email', detail: 'Stop checking five different apps. Bears, Bulls, Cubs, White Sox, and Blackhawks — consolidated into a single morning read.' },
              { label: 'Written for Chicago fans', detail: 'Not a national wire recap. Every story, score, and insight is filtered through a Chicago lens by people who actually watch the games.' },
              { label: 'AI-powered angles', detail: 'Scout AI surfaces questions and storylines the mainstream coverage misses — like having a sports analyst in your inbox.' },
              { label: 'Under 5 minutes', detail: 'Designed to scan fast. Get fully caught up on your commute, over coffee, or before the group chat starts buzzing.' },
            ].map((item) => (
              <div key={item.label} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <div style={{
                  width: '6px',
                  minWidth: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: '#00D4FF',
                  marginTop: '8px',
                }} />
                <div>
                  <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--sm-text)' }}>{item.label}</span>
                  <span style={{ fontSize: '14px', color: 'var(--sm-text-muted)' }}> — {item.detail}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p style={{
          textAlign: 'center',
          fontSize: '14px',
          color: 'var(--sm-text-dim)',
          marginTop: '24px',
        }}>
          Delivered 6 AM CT, every day. Free forever. Unsubscribe anytime.
        </p>
      </section>
    </div>
  )
}
