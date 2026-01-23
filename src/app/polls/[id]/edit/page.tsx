import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase-server'
import PollCreateForm from '@/components/admin/polls/PollCreateForm'
import type { Poll, CreatePollInput } from '@/types/polls'

export const metadata: Metadata = {
  title: 'Edit Poll | SportsMockery',
  description: 'Edit an existing poll',
}

interface EditPollPageProps {
  params: Promise<{ id: string }>
}

export default async function EditPollPage({ params }: EditPollPageProps) {
  const { id } = await params

  // Fetch poll
  const { data: poll, error } = await supabaseAdmin
    .from('sm_polls')
    .select(`
      *,
      options:sm_poll_options(*)
    `)
    .eq('id', id)
    .single()

  if (error || !poll) {
    notFound()
  }

  // Sort options by display order
  if (poll.options) {
    poll.options.sort((a: any, b: any) => a.display_order - b.display_order)
  }

  // Convert to form data
  const initialData: Partial<CreatePollInput> & { id: string } = {
    id: poll.id,
    title: poll.title,
    question: poll.question,
    poll_type: poll.poll_type,
    team_theme: poll.team_theme,
    is_anonymous: poll.is_anonymous,
    show_results: poll.show_results,
    show_live_results: poll.show_live_results,
    scale_min: poll.scale_min,
    scale_max: poll.scale_max,
    scale_labels: poll.scale_labels,
    starts_at: poll.starts_at,
    ends_at: poll.ends_at,
    options: poll.options?.map((opt: any) => ({
      option_text: opt.option_text,
      option_image: opt.option_image,
      team_tag: opt.team_tag,
      emoji: opt.emoji,
    })) || [],
  }

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
            <li className="text-gray-900 dark:text-white font-medium">Edit Poll</li>
          </ol>
        </nav>

        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Poll</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {poll.title || poll.question}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href={`/polls/${id}/results`}
              className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              View Results
            </Link>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {poll.total_votes.toLocaleString()} votes
            </span>
          </div>
        </div>

        {/* Form */}
        <PollCreateForm editMode initialData={initialData} />
      </div>
    </div>
  )
}
