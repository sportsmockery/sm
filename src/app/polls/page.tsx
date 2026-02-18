import { Metadata } from 'next'
import PollList from '@/components/admin/polls/PollList'

export const metadata: Metadata = {
  title: 'Polls Management | SportsMockery',
  description: 'Create and manage interactive polls for SportsMockery articles',
}

export default function PollsPage() {
  return (
    <div className="sm-hero-bg" style={{ minHeight: '100vh' }}>
      <div className="sm-grid-overlay" />
      <div style={{ position: 'relative', maxWidth: 'var(--sm-max-width)', margin: '0 auto', padding: '32px 16px' }}>
        <PollList />
      </div>
    </div>
  )
}
