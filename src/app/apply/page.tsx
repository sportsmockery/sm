import { Metadata } from 'next'
import ApplyForm from './ApplyForm'

export const metadata: Metadata = {
  title: 'Careers | Sports Mockery',
  description: 'Join the Sports Mockery team. We\'re looking for passionate writers, editors, analysts, and creators who live and breathe Chicago sports.',
  alternates: { canonical: 'https://sportsmockery.com/apply' },
  openGraph: {
    title: 'Careers | Sports Mockery',
    description: 'Join Chicago\'s premier sports intelligence platform.',
    type: 'website',
  },
}

const OPEN_ROLES = [
  {
    title: 'Sports Writer',
    type: 'Full-time / Freelance',
    desc: 'Cover Chicago sports with original reporting, analysis, and editorial takes. Beat coverage for one or more Chicago teams.',
  },
  {
    title: 'Video Producer',
    type: 'Full-time / Part-time',
    desc: 'Create and edit video content for our YouTube channels — podcasts, analysis segments, and short-form social clips.',
  },
  {
    title: 'Data Analyst',
    type: 'Full-time',
    desc: 'Build and maintain sports analytics models, stat visualizations, and data-driven content for SM Edge.',
  },
  {
    title: 'Social Media Manager',
    type: 'Full-time',
    desc: 'Grow our social presence across platforms with engaging, on-brand content that drives traffic and conversation.',
  },
]

export default function ApplyPage() {
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
          background: 'rgba(188, 0, 0, 0.1)',
          border: '1px solid rgba(188, 0, 0, 0.2)',
          marginBottom: '24px',
        }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#BC0000', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
            We&apos;re Hiring
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
          Join Sports Mockery
        </h1>
        <p style={{
          fontSize: '20px',
          color: 'var(--sm-text-muted)',
          maxWidth: '600px',
          margin: '0 auto',
          lineHeight: 1.6,
        }}>
          We&apos;re building Chicago&apos;s most intelligent sports platform. If you live and breathe Chicago sports, we want to hear from you.
        </p>
      </section>

      {/* Open Roles */}
      <section style={{ position: 'relative', maxWidth: '720px', margin: '0 auto', padding: '0 24px 48px' }}>
        <h2 style={{
          fontSize: '24px',
          fontWeight: 800,
          letterSpacing: '-0.5px',
          color: 'var(--sm-text)',
          marginBottom: '24px',
        }}>
          Open Roles
        </h2>

        <div style={{ display: 'grid', gap: '16px', marginBottom: '16px' }}>
          {OPEN_ROLES.map((role) => (
            <div
              key={role.title}
              className="glass-card glass-card-static"
              style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--sm-text)', margin: 0 }}>
                  {role.title}
                </h3>
                <span style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#00D4FF',
                  padding: '4px 12px',
                  borderRadius: '999px',
                  background: 'rgba(0, 212, 255, 0.1)',
                }}>
                  {role.type}
                </span>
              </div>
              <p style={{ fontSize: '15px', lineHeight: 1.6, color: 'var(--sm-text-muted)', margin: 0 }}>
                {role.desc}
              </p>
            </div>
          ))}
        </div>

        <p style={{ fontSize: '14px', color: 'var(--sm-text-dim)' }}>
          Don&apos;t see your role? Apply anyway — we&apos;re always looking for talented people.
        </p>
      </section>

      {/* Application Form */}
      <section style={{ position: 'relative', maxWidth: '600px', margin: '0 auto', padding: '0 24px 80px' }}>
        <h2 style={{
          fontSize: '24px',
          fontWeight: 800,
          letterSpacing: '-0.5px',
          color: 'var(--sm-text)',
          marginBottom: '24px',
        }}>
          Apply Now
        </h2>

        <ApplyForm roles={OPEN_ROLES.map((r) => r.title)} />
      </section>
    </div>
  )
}
