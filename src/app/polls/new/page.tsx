import { Metadata } from 'next'
import Link from 'next/link'
import PollCreateForm from '@/components/admin/polls/PollCreateForm'

export const metadata: Metadata = {
  title: 'Create New Poll | SportsMockery',
  description: 'Create a new interactive poll for SportsMockery articles',
}

export default function NewPollPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <ol className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <li>
              <Link href="/polls" className="hover:text-purple-600 dark:hover:text-purple-400">
                Polls
              </Link>
            </li>
            <li>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </li>
            <li className="text-gray-900 dark:text-white font-medium">New Poll</li>
          </ol>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create New Poll</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Create an interactive poll to engage your readers
          </p>
        </div>

        {/* Form */}
        <PollCreateForm />
      </div>
    </div>
  )
}
