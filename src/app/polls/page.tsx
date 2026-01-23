import { Metadata } from 'next'
import PollList from '@/components/admin/polls/PollList'

export const metadata: Metadata = {
  title: 'Polls Management | SportsMockery',
  description: 'Create and manage interactive polls for SportsMockery articles',
}

export default function PollsPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <PollList />
      </div>
    </div>
  )
}
