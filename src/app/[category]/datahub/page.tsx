import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import TeamDataHubContent from './TeamDataHubContent'

// Valid team keys
const VALID_TEAMS = ['bears', 'bulls', 'cubs', 'whitesox', 'blackhawks'] as const
type TeamKey = typeof VALID_TEAMS[number]

// Team metadata for SEO
const TEAM_META: Record<TeamKey, { name: string; league: string }> = {
  bears: { name: 'Chicago Bears', league: 'NFL' },
  bulls: { name: 'Chicago Bulls', league: 'NBA' },
  cubs: { name: 'Chicago Cubs', league: 'MLB' },
  whitesox: { name: 'Chicago White Sox', league: 'MLB' },
  blackhawks: { name: 'Chicago Blackhawks', league: 'NHL' },
}

interface PageProps {
  params: Promise<{ category: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category: team } = await params

  if (!VALID_TEAMS.includes(team as TeamKey)) {
    return {
      title: 'Team Not Found | Sports Mockery',
    }
  }

  const teamInfo = TEAM_META[team as TeamKey]

  return {
    title: `${teamInfo.name} Data Hub | Live Stats & Schedules`,
    description: `Complete ${teamInfo.name} data hub. Live ${teamInfo.league} scores, schedules, standings, roster, and player statistics.`,
    openGraph: {
      title: `${teamInfo.name} Data Hub | Sports Mockery`,
      description: `Live stats, schedules, and standings for the ${teamInfo.name}`,
      type: 'website',
    },
  }
}

export function generateStaticParams() {
  return VALID_TEAMS.map((team) => ({ category: team }))
}

export default async function TeamDataHubPage({ params }: PageProps) {
  const { category: team } = await params

  // Validate team parameter
  if (!VALID_TEAMS.includes(team as TeamKey)) {
    notFound()
  }

  return <TeamDataHubContent teamKey={team as TeamKey} />
}
