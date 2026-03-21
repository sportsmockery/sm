import { datalabAdmin } from '@/lib/supabase-datalab'
import { notFound } from 'next/navigation'
import TeamDetail from './TeamDetail'

export const revalidate = 3600

const DATALAB_URL = 'https://datalab.sportsmockery.com'

async function fetchScoutCommentary(teamSlug: string) {
  try {
    const params = new URLSearchParams({ angle: '0', team: teamSlug })
    const res = await fetch(`${DATALAB_URL}/api/scout/owner-commentary?${params}`, {
      next: { revalidate: 3600 },
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

const VALID_TEAMS = ['bears', 'bulls', 'blackhawks', 'cubs', 'whitesox']
const TEAM_NAMES: Record<string, string> = {
  bears: 'Chicago Bears',
  bulls: 'Chicago Bulls',
  blackhawks: 'Chicago Blackhawks',
  cubs: 'Chicago Cubs',
  whitesox: 'Chicago White Sox',
}

export async function generateStaticParams() {
  return VALID_TEAMS.map(team => ({ team }))
}

export async function generateMetadata({ params }: { params: Promise<{ team: string }> }) {
  const { team } = await params
  const name = TEAM_NAMES[team] || team
  return {
    title: `${name} Owner Report Card | Sports Mockery`,
    description: `Data-backed ownership grade for the ${name} — Spending, Results, Fan Sentiment, and Loyalty Tax.`,
  }
}

export default async function TeamOwnerPage({ params }: { params: Promise<{ team: string }> }) {
  const { team } = await params

  if (!VALID_TEAMS.includes(team)) {
    notFound()
  }

  let grade: any = null
  let history: any[] = []

  const [, scoutData] = await Promise.all([
    (async () => {
      try {
        const [gradeResult, historyResult] = await Promise.all([
          datalabAdmin
            .from('ownership_grades')
            .select('*')
            .eq('team_slug', team)
            .eq('is_current', true)
            .single(),
          datalabAdmin
            .from('ownership_grade_history')
            .select('team_slug, recorded_at, season_label, spend_grade, results_grade, sentiment_grade, loyalty_tax, overall_grade, trigger_event, notes')
            .eq('team_slug', team)
            .eq('trigger_event', 'quarterly')
            .order('recorded_at', { ascending: true }),
        ])

        grade = gradeResult.data
        history = historyResult.data || []

        if (grade) {
          const { data: votes } = await datalabAdmin
            .from('ownership_vote_counts')
            .select('*')
            .eq('grade_id', grade.id)

          const v = votes?.[0]
          grade = {
            ...grade,
            agree_count: v?.agree_count || 0,
            disagree_count: v?.disagree_count || 0,
            total_votes: v?.total_votes || 0,
          }
        }
      } catch (err) {
        console.error(`Failed to fetch ownership data for ${team}:`, err)
      }
    })(),
    fetchScoutCommentary(team),
  ])

  if (!grade) {
    notFound()
  }

  return <TeamDetail grade={grade} history={history} scoutData={scoutData} />
}
