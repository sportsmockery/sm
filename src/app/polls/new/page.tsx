import { Metadata } from 'next'
import Link from 'next/link'
import PollCreateForm from '@/components/admin/polls/PollCreateForm'

export const metadata: Metadata = {
  title: 'Create New Poll | SportsMockery',
  description: 'Create a new interactive poll for SportsMockery articles',
}

export default function NewPollPage() {
  return (
    <div className="sm-hero-bg" style={{ minHeight: '100vh' }}>
      <div className="sm-grid-overlay" />
      <div style={{ position: 'relative', maxWidth: 'var(--sm-max-width)', margin: '0 auto', padding: '32px 16px' }}>
        {/* Breadcrumb */}
        <nav style={{ marginBottom: 24 }}>
          <ol style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, listStyle: 'none', padding: 0, margin: 0 }}>
            <li>
              <Link href="/polls" style={{ color: 'var(--sm-text-muted)', textDecoration: 'none', transition: 'color 0.2s' }}>
                Polls
              </Link>
            </li>
            <li style={{ color: 'var(--sm-text-dim)' }}>
              <svg style={{ width: 16, height: 16 }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </li>
            <li style={{ color: 'var(--sm-text)', fontWeight: 600 }}>New Poll</li>
          </ol>
        </nav>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--sm-text)', fontFamily: 'var(--sm-font-heading)', margin: 0 }}>
            Create New Poll
          </h1>
          <p style={{ fontSize: 14, color: 'var(--sm-text-muted)', marginTop: 4 }}>
            Create an interactive poll to engage your readers
          </p>
        </div>

        {/* Form */}
        <div className="glass-card glass-card-static">
          <PollCreateForm />
        </div>
      </div>
    </div>
  )
}
