import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import LoginShell from '@/components/auth/LoginShell'
import { supabaseAdmin } from '@/lib/supabase-server'

export const metadata: Metadata = {
  title: 'Create your account | Sports Mockery',
  description:
    'Create your free Sports Mockery account for personalized Chicago sports news, Scout AI, fan polls, and the daily 6 AM email.',
  robots: { index: false, follow: false },
}

interface LoginPageProps {
  searchParams: Promise<{ next?: string; tab?: 'signup' | 'signin' }>
}

const TEAM_FROM_CATEGORY: Record<string, string> = {
  bears: 'Bears',
  'chicago-bears': 'Bears',
  bulls: 'Bulls',
  'chicago-bulls': 'Bulls',
  cubs: 'Cubs',
  'chicago-cubs': 'Cubs',
  'white-sox': 'White Sox',
  'chicago-white-sox': 'White Sox',
  whitesox: 'White Sox',
  blackhawks: 'Blackhawks',
  'chicago-blackhawks': 'Blackhawks',
}

function mapCategoryToTeam(slug?: string | null, name?: string | null): string {
  if (slug && TEAM_FROM_CATEGORY[slug.toLowerCase()]) return TEAM_FROM_CATEGORY[slug.toLowerCase()]
  const haystack = (name || slug || '').toLowerCase()
  if (haystack.includes('bear')) return 'Bears'
  if (haystack.includes('bull')) return 'Bulls'
  if (haystack.includes('cub')) return 'Cubs'
  if (haystack.includes('sox') || haystack.includes('white')) return 'White Sox'
  if (haystack.includes('hawk')) return 'Blackhawks'
  return ''
}

function formatSubscriberLabel(count: number): string {
  if (count < 100) return ''
  if (count < 1000) return `${Math.floor(count / 50) * 50}+`
  if (count < 10000) {
    const rounded = Math.floor(count / 100) * 100
    return rounded.toLocaleString() + '+'
  }
  const rounded = Math.floor(count / 500) * 500
  return rounded.toLocaleString() + '+'
}

function formatDayLabel(publishedAt?: string | null): string {
  if (!publishedAt) return 'Today'
  const published = new Date(publishedAt)
  if (Number.isNaN(published.getTime())) return 'Today'
  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const startOfPub = new Date(
    published.getFullYear(),
    published.getMonth(),
    published.getDate()
  )
  const diffDays = Math.round(
    (startOfToday.getTime() - startOfPub.getTime()) / 86_400_000
  )
  if (diffDays <= 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays}d ago`
  return published.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function truncateTitle(title: string, max = 88): string {
  if (title.length <= max) return title
  return title.slice(0, max - 1).trim() + '…'
}

async function fetchLoginIntel(): Promise<{
  subscriberLabel: string
  latestBriefTitle: string
  latestBriefMeta: string
}> {
  const result = { subscriberLabel: '', latestBriefTitle: '', latestBriefMeta: '' }

  const [subsRes, postRes] = await Promise.allSettled([
    supabaseAdmin
      .from('email_subscribers')
      .select('*', { count: 'exact', head: true })
      .eq('list', 'chicago_daily')
      .eq('subscribed', true),
    supabaseAdmin
      .from('sm_posts')
      .select('title, published_at, category:sm_categories(name, slug)')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ])

  if (subsRes.status === 'fulfilled' && typeof subsRes.value.count === 'number') {
    result.subscriberLabel = formatSubscriberLabel(subsRes.value.count)
  }

  if (postRes.status === 'fulfilled' && postRes.value.data) {
    const post = postRes.value.data as {
      title?: string
      published_at?: string | null
      category?: { name?: string | null; slug?: string | null } | null
    }
    if (post.title) {
      result.latestBriefTitle = truncateTitle(post.title)
      const team = mapCategoryToTeam(post.category?.slug, post.category?.name)
      const dayLabel = formatDayLabel(post.published_at)
      result.latestBriefMeta = team ? `${dayLabel} · ${team}` : dayLabel
    }
  }

  return result
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams
  const redirectTo = params.next || '/admin'
  const defaultTab = params.tab === 'signin' ? 'signin' : 'signup'

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll() {},
      },
    }
  )
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (user) {
    redirect(redirectTo)
  }

  const intel = await fetchLoginIntel()

  return (
    <LoginShell
      redirectTo={redirectTo}
      defaultTab={defaultTab}
      subscriberLabel={intel.subscriberLabel}
      latestBriefTitle={intel.latestBriefTitle}
      latestBriefMeta={intel.latestBriefMeta}
    />
  )
}
