import { datalabAdmin } from '@/lib/supabase-datalab'
import OwnershipHub from './OwnershipHub'

export const dynamic = 'force-dynamic'

const DATALAB_URL = 'https://datalab.sportsmockery.com'

async function fetchScoutCommentary(teamSlug?: string) {
  try {
    const params = new URLSearchParams({ angle: '0' })
    if (teamSlug) params.set('team', teamSlug)
    const res = await fetch(`${DATALAB_URL}/api/scout/owner-commentary?${params}`, {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(10_000),
    })
    if (!res.ok) return null
    const json = await res.json()
    return {
      commentary: json.commentary || json.data?.commentary || '',
      speech_text: json.speech_text || json.data?.speech_text || '',
      angle: json.angle?.index ?? json.angle ?? 0,
      angle_name: json.angle?.label || json.angle_name || json.data?.angle_name || '',
      team: json.team || teamSlug,
    }
  } catch {
    return null
  }
}

export const metadata = {
  title: 'Owner & GM Report Cards | Sports Mockery',
  description: 'Data-backed grades on every Chicago ownership group — Spending, Results, Fan Sentiment, and Loyalty Tax.',
}

export default async function OwnerPage() {
  let gradesWithVotes: any[] = []

  const [, scoutData] = await Promise.all([
    (async () => {
      try {
        const { data: grades } = await datalabAdmin
          .from('ownership_grades')
          .select('*')
          .eq('is_current', true)
          .order('overall_grade', { ascending: true })

        if (grades && grades.length > 0) {
          const gradeIds = grades.map((g: any) => g.id)
          const { data: votes } = await datalabAdmin
            .from('ownership_vote_counts')
            .select('*')
            .in('grade_id', gradeIds)

          const votesMap = new Map((votes || []).map((v: any) => [v.grade_id, v]))
          gradesWithVotes = grades.map((g: any) => ({
            ...g,
            agree_count: votesMap.get(g.id)?.agree_count || 0,
            disagree_count: votesMap.get(g.id)?.disagree_count || 0,
            total_votes: votesMap.get(g.id)?.total_votes || 0,
          }))
        }
      } catch (err) {
        console.error('Failed to fetch ownership grades:', err)
      }
    })(),
    fetchScoutCommentary(),
  ])

  return <OwnershipHub grades={gradesWithVotes} scoutData={scoutData} />
}
