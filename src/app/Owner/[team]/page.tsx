import { datalabAdmin } from '@/lib/supabase-datalab'
import { notFound } from 'next/navigation'
import TeamDetail from './TeamDetail'

export const revalidate = 3600

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
    title: `${name} Owner Report Card`,
    description: `Data-backed ownership grade for the ${name} — Spending, Results, Fan Sentiment, and Loyalty Tax.`,
  }
}

export default async function TeamOwnerPage({ params }: { params: Promise<{ team: string }> }) {
  const { team } = await params

  if (!VALID_TEAMS.includes(team)) {
    notFound()
  }

  const [gradeResult, historyResult, voteResult] = await Promise.all([
    datalabAdmin
      .from('ownership_grades')
      .select('*')
      .eq('team_slug', team)
      .eq('is_current', true)
      .single(),
    datalabAdmin
      .from('ownership_grade_history')
      .select('*')
      .eq('team_slug', team)
      .order('recorded_at', { ascending: true }),
    datalabAdmin
      .from('ownership_vote_counts')
      .select('*')
      .eq('team_slug', team),
  ])

  if (gradeResult.error || !gradeResult.data) {
    notFound()
  }

  const grade = gradeResult.data
  const votes = voteResult.data?.find((v: any) => v.grade_id === grade.id)

  const gradeWithVotes = {
    ...grade,
    agree_count: votes?.agree_count || 0,
    disagree_count: votes?.disagree_count || 0,
    total_votes: votes?.total_votes || 0,
  }

  return <TeamDetail grade={gradeWithVotes} history={historyResult.data || []} />
}
