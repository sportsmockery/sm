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

const DATALAB_URL = process.env.DATALAB_API_URL || 'https://datalab.sportsmockery.com'

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

  try {
    const res = await fetch(`${DATALAB_URL}/api/ownership-scores/grades/${team}`, {
      next: { revalidate: 3600 },
    })
    if (res.ok) {
      const json = await res.json()
      grade = json.grade || json.data || json
      history = json.history || []
    }
  } catch (err) {
    console.error(`Failed to fetch ownership grade for ${team}:`, err)
  }

  if (!grade) {
    notFound()
  }

  // Ensure vote counts exist
  const gradeWithVotes = {
    ...grade,
    agree_count: grade.agree_count || 0,
    disagree_count: grade.disagree_count || 0,
    total_votes: grade.total_votes || 0,
  }

  return <TeamDetail grade={gradeWithVotes} history={history} />
}
