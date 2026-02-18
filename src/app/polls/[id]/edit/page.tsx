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
    <div className="sm-hero-bg" style={{ minHeight: '100vh' }}>
      <div className="sm-grid-overlay" />
      <div style={{ position: 'relative', maxWidth: 'var(--sm-max-width)', margin: '0 auto', padding: '32px 16px' }}>
        {/* Breadcrumb */}
        <nav style={{ marginBottom: 24 }}>
          <ol style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, listStyle: 'none', padding: 0, margin: 0 }}>
            <li>
              <Link href="/polls" style={{ color: 'var(--sm-text-muted)', textDecoration: 'none' }}>
                Polls
              </Link>
            </li>
            <li style={{ color: 'var(--sm-text-dim)' }}>
              <svg style={{ width: 16, height: 16 }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </li>
            <li style={{ color: 'var(--sm-text)', fontWeight: 600 }}>Edit Poll</li>
          </ol>
        </nav>

        {/* Header */}
        <div style={{ marginBottom: 32, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--sm-text)', fontFamily: 'var(--sm-font-heading)', margin: 0 }}>
              Edit Poll
            </h1>
            <p style={{ fontSize: 14, color: 'var(--sm-text-muted)', marginTop: 4 }}>
              {poll.title || poll.question}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link
              href={`/polls/${id}/results`}
              className="btn-secondary btn-sm"
            >
              View Results
            </Link>
            <span className="sm-tag">
              {poll.total_votes.toLocaleString()} votes
            </span>
          </div>
        </div>

        {/* Form */}
        <div className="glass-card glass-card-static">
          <PollCreateForm editMode initialData={initialData} />
        </div>
      </div>
    </div>
  )
}
