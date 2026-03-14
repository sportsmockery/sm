import type { Metadata } from 'next'
import { supabaseAdmin } from '@/lib/supabase-server'
import HandsFreeAudioClient from './HandsFreeAudioClient'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Hands-Free Audio | SM Edge',
  description: 'Listen to Chicago sports articles read aloud. Continuous playback by team or latest articles.',
}

const TEAM_CATEGORY_SLUGS = [
  'chicago-bears',
  'chicago-blackhawks',
  'chicago-bulls',
  'chicago-cubs',
  'chicago-white-sox',
]

const DISPLAY_NAMES: Record<string, string> = {
  'chicago-bears': 'Chicago Bears',
  'chicago-blackhawks': 'Chicago Blackhawks',
  'chicago-bulls': 'Chicago Bulls',
  'chicago-cubs': 'Chicago Cubs',
  'chicago-white-sox': 'Chicago White Sox',
}

const TEAM_KEYS: Record<string, string> = {
  'chicago-bears': 'bears',
  'chicago-blackhawks': 'blackhawks',
  'chicago-bulls': 'bulls',
  'chicago-cubs': 'cubs',
  'chicago-white-sox': 'whitesox',
}

interface LatestArticle {
  id: number
  title: string
  slug: string
  excerpt: string | null
  featured_image: string | null
  published_at: string
  category_slug: string
  team_key: string
  team_name: string
}

export default async function HandsFreeAudioPage() {
  // Fetch latest article per team
  const latestByTeam: LatestArticle[] = []

  for (const catSlug of TEAM_CATEGORY_SLUGS) {
    const { data: cat } = await supabaseAdmin
      .from('sm_categories')
      .select('id')
      .eq('slug', catSlug)
      .single()

    if (!cat) continue

    const { data: posts } = await supabaseAdmin
      .from('sm_posts')
      .select('id, title, slug, excerpt, featured_image, published_at')
      .eq('category_id', cat.id)
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(1)

    if (posts?.[0]) {
      latestByTeam.push({
        ...posts[0],
        category_slug: catSlug,
        team_key: TEAM_KEYS[catSlug] || catSlug,
        team_name: DISPLAY_NAMES[catSlug] || catSlug,
      })
    }
  }

  // Also get the absolute latest article across all teams
  const { data: latestAll } = await supabaseAdmin
    .from('sm_posts')
    .select('id, title, slug, excerpt, featured_image, published_at, category_id')
    .eq('status', 'published')
    .in('category_id', latestByTeam.map(a => {
      // We need category IDs — extract from what we already fetched
      return 0 // placeholder
    }))
    .order('published_at', { ascending: false })
    .limit(1)

  // Just use the most recent from latestByTeam
  const overallLatest = latestByTeam.sort((a, b) =>
    new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
  )[0] || null

  return (
    <HandsFreeAudioClient
      latestByTeam={latestByTeam}
      overallLatest={overallLatest}
    />
  )
}
