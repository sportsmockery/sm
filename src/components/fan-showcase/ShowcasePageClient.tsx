'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import HeroCarousel from './HeroCarousel'
import FeaturedSection from './FeaturedSection'
import ShowcaseCard from './ShowcaseCard'
import ShowcaseFilters from './ShowcaseFilters'
import CreatorCard from './CreatorCard'
import type { FanSubmission, FanSubmissionAsset, FanCreator, FanFeaturedSlot } from '@/types/fan-showcase'

type SubmissionWithRelations = FanSubmission & {
  creator: FanCreator
  assets: FanSubmissionAsset[]
}

type FeaturedSlotWithSubmission = FanFeaturedSlot & {
  submission: SubmissionWithRelations
}

interface ShowcaseData {
  submissions: SubmissionWithRelations[]
  featured: SubmissionWithRelations[]
  featuredSlots: FeaturedSlotWithSubmission[]
  creators: (FanCreator & { has_approved_work: boolean })[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

function ShowcaseContent() {
  const searchParams = useSearchParams()
  const [data, setData] = useState<ShowcaseData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams(searchParams.toString())
      const res = await fetch(`/api/fan-showcase?${params}`)
      if (res.ok) {
        const result = await res.json()
        setData(result)
      }
    } catch (err) {
      console.error('Failed to load showcase:', err)
    } finally {
      setLoading(false)
    }
  }, [searchParams])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Organize featured slots by type
  const slotsByType = (type: string) =>
    data?.featuredSlots
      ?.filter(s => s.slot_type === type && s.submission)
      .map(s => s.submission) || []

  const editsOfWeek = slotsByType('edit_of_week')
  const artGallery = slotsByType('art_gallery')
  const takesOfDay = slotsByType('take_of_day')
  const fantasyChampions = slotsByType('fantasy_champion')

  // Use featured submissions as fallback for sections if slots are empty
  const featuredByType = (type: string) =>
    data?.featured?.filter(s => s.type === type) || []

  if (loading && !data) {
    return <ShowcaseSkeleton />
  }

  return (
    <div>
      {/* Hero Section */}
      <section className="mb-12">
        <div className="mb-8 text-center">
          <h1 className="text-[clamp(32px,4vw,56px)] font-bold text-[var(--text-primary)]">
            Chicago Fans, By Chicago Fans
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-lg text-[var(--text-muted)]">
            A showcase of the best independent Bears, Bulls, Cubs, White Sox, and Blackhawks creators.
          </p>
        </div>
        {(data?.featured?.length ?? 0) > 0 && (
          <HeroCarousel items={data!.featured} />
        )}
      </section>

      {/* Featured Strips */}
      <FeaturedSection
        title="Fan Edit of the Week"
        subtitle="The most creative edits, clips, and remixes from the Chicago sports timeline."
        items={editsOfWeek.length > 0 ? editsOfWeek : featuredByType('edit')}
        layout="grid"
      />

      <FeaturedSection
        title="Fan Art Gallery"
        subtitle="Original artwork celebrating Chicago's teams — digital, traditional, and everything between."
        items={artGallery.length > 0 ? artGallery : featuredByType('art')}
        layout="masonry"
      />

      <FeaturedSection
        title="Fan Take of the Day"
        subtitle="Sharp analysis and hot takes from the sharpest fans in the city."
        items={takesOfDay.length > 0 ? takesOfDay : featuredByType('take')}
        layout="list"
      />

      <FeaturedSection
        title="Fantasy League Champion"
        subtitle="Chicago fans dominating their fantasy leagues. Receipts included."
        items={fantasyChampions.length > 0 ? fantasyChampions : featuredByType('fantasy_win')}
        layout="grid"
      />

      {/* Filters + Grid */}
      <section className="py-10">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-xl font-bold text-[var(--text-primary)]">All Submissions</h2>
          <ShowcaseFilters />
        </div>

        {data?.submissions && data.submissions.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {data.submissions.map(sub => (
              <ShowcaseCard key={sub.id} submission={sub} />
            ))}
          </div>
        ) : (
          <div className="rounded-[14px] border border-[var(--border-default)] bg-[var(--bg-card)] p-12 text-center">
            <p className="text-lg text-[var(--text-muted)]">
              No submissions match your filters yet. Chicago creators are just getting started.
            </p>
          </div>
        )}

        {/* Pagination */}
        {data?.pagination && data.pagination.totalPages > 1 && (
          <div className="mt-8 flex justify-center gap-2">
            {Array.from({ length: data.pagination.totalPages }, (_, i) => i + 1).map(p => (
              <Link
                key={p}
                href={`/fan-showcase?${new URLSearchParams({
                  ...Object.fromEntries(searchParams.entries()),
                  page: String(p),
                })}`}
                className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm transition ${
                  p === data.pagination.page
                    ? 'bg-[#BC0000] text-white'
                    : 'bg-[var(--bg-card)] text-[var(--text-muted)] hover:bg-[var(--bg-secondary)]'
                }`}
              >
                {p}
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Creator Discovery Rail */}
      {data?.creators && data.creators.length > 0 && (
        <section className="py-10">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-[var(--text-primary)]">
              More Chicago Creators to Watch
            </h2>
            <p className="mt-1 text-sm text-[var(--text-muted)]">
              Independent voices covering Chicago&apos;s five teams.
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {data.creators.map(creator => (
              <CreatorCard key={creator.id} creator={creator} />
            ))}
          </div>
        </section>
      )}

      {/* Submit CTA */}
      <section className="my-12 rounded-[14px] border border-[var(--border-default)] bg-[var(--bg-card)] p-8 text-center sm:p-12">
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">
          Got something to show Chicago?
        </h2>
        <p className="mx-auto mt-3 max-w-md text-[var(--text-muted)]">
          Submit your edits, art, takes, or fantasy wins. Every submission is reviewed by our team.
          Featured creators get the spotlight.
        </p>
        <Link
          href="/fan-showcase/submit"
          className="mt-6 inline-flex items-center gap-2 rounded-xl px-8 py-3.5 font-semibold transition-opacity hover:opacity-90"
          style={{
            backgroundColor: '#BC0000',
            color: '#FAFAFB',
            fontSize: 15,
            letterSpacing: '-0.01em',
            boxShadow: '0 2px 12px rgba(188,0,0,0.25)',
          }}
        >
          Submit Your Work
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </Link>
      </section>
    </div>
  )
}

function ShowcaseSkeleton() {
  return (
    <div className="animate-pulse space-y-8">
      <div className="text-center">
        <div className="mx-auto h-12 w-96 max-w-full rounded bg-[var(--bg-secondary)]" />
        <div className="mx-auto mt-3 h-6 w-72 max-w-full rounded bg-[var(--bg-secondary)]" />
      </div>
      <div className="h-80 rounded-[14px] bg-[var(--bg-secondary)]" />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-64 rounded-[14px] bg-[var(--bg-secondary)]" />
        ))}
      </div>
    </div>
  )
}

export default function ShowcasePageClient() {
  return (
    <Suspense fallback={<ShowcaseSkeleton />}>
      <ShowcaseContent />
    </Suspense>
  )
}
