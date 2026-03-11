/**
 * Generic team sidebar data functions
 * Provides season overview, key players, and trending topics for all 5 teams
 */

import { TeamSeasonOverview, TeamPlayer, TeamTrend, TEAM_INFO } from './types'
import { fetchTeamRecord, fetchNextGame, fetchLastGame } from './team-config'

type TeamKey = 'bears' | 'bulls' | 'cubs' | 'blackhawks' | 'whitesox'

const TEAM_SLUG_MAP: Record<TeamKey, string> = {
  bears: 'chicago-bears',
  bulls: 'chicago-bulls',
  cubs: 'chicago-cubs',
  blackhawks: 'chicago-blackhawks',
  whitesox: 'chicago-white-sox',
}

const TEAM_LEAGUE: Record<TeamKey, string> = {
  bears: 'NFC North',
  bulls: 'Eastern Conference',
  cubs: 'NL Central',
  blackhawks: 'Central Division',
  whitesox: 'AL Central',
}

/**
 * Get season overview for any team
 */
export async function getTeamSeasonOverview(teamKey: TeamKey): Promise<TeamSeasonOverview> {
  try {
    const [record, nextGame, lastGame] = await Promise.all([
      fetchTeamRecord(teamKey),
      fetchNextGame(teamKey),
      fetchLastGame(teamKey),
    ])

    const info = TEAM_INFO[teamKey === 'whitesox' ? 'white-sox' : teamKey]
    const wins = record?.wins ?? 0
    const losses = record?.losses ?? 0
    const ties = record?.ties ?? 0
    const otl = (record as any)?.otLosses ?? 0

    const standing = `${wins}-${losses}${ties > 0 ? `-${ties}` : ''}${otl > 0 ? `-${otl}` : ''} in ${TEAM_LEAGUE[teamKey]}`

    return {
      teamSlug: TEAM_SLUG_MAP[teamKey],
      teamName: info?.shortName || teamKey,
      season: new Date().getFullYear(),
      record: { wins, losses, ties, otl },
      standing,
      nextGame: nextGame ? {
        opponent: nextGame.opponent,
        date: nextGame.date,
        time: nextGame.time,
        isHome: nextGame.isHome,
      } : null,
      lastGame: lastGame ? {
        opponent: lastGame.opponent,
        result: lastGame.result as 'W' | 'L' | 'T' | 'OTL',
        score: `${lastGame.teamScore}-${lastGame.opponentScore}`,
      } : null,
    }
  } catch (error) {
    console.error(`Error fetching ${teamKey} season overview:`, error)
    const info = TEAM_INFO[teamKey === 'whitesox' ? 'white-sox' : teamKey]
    return {
      teamSlug: TEAM_SLUG_MAP[teamKey],
      teamName: info?.shortName || teamKey,
      season: 2025,
      record: { wins: 0, losses: 0, ties: 0 },
      standing: TEAM_LEAGUE[teamKey],
      nextGame: null,
      lastGame: null,
    }
  }
}

/**
 * Extract the #1 leader from a leaderboard category
 */
function leaderToPlayer(leader: any, statLabel: string): TeamPlayer | null {
  if (!leader?.player) return null
  const p = leader.player
  return {
    id: parseInt(p.playerId || p.espnId || '0') || 0,
    name: p.fullName || p.name || 'Unknown',
    position: p.position || '',
    number: p.jerseyNumber || p.jersey_number || 0,
    imageUrl: p.headshotUrl || p.headshot_url || undefined,
    stats: { [statLabel]: leader.primaryStat ?? 0 },
  }
}

/**
 * Get top 3 category leaders for any team (regular season stats)
 */
export async function getTeamKeyPlayers(teamKey: TeamKey): Promise<TeamPlayer[]> {
  try {
    switch (teamKey) {
      case 'bears': {
        const { getBearsStats } = await import('./bearsData')
        const stats = await getBearsStats(2025, 'regular')
        const { leaderboards } = stats
        const leaders: TeamPlayer[] = []
        const pass = leaderToPlayer(leaderboards.passing?.[0], 'Pass Yds')
        if (pass) leaders.push(pass)
        const rush = leaderToPlayer(leaderboards.rushing?.[0], 'Rush Yds')
        if (rush) leaders.push(rush)
        const rec = leaderToPlayer(leaderboards.receiving?.[0], 'Rec Yds')
        if (rec) leaders.push(rec)
        const tackles = leaderToPlayer(leaderboards.defense?.[0], 'Tackles')
        if (tackles) leaders.push(tackles)
        const sacks = leaderToPlayer(leaderboards.sacks?.[0], 'Sacks')
        if (sacks) leaders.push(sacks)
        return leaders.slice(0, 5)
      }
      case 'bulls': {
        const { getBullsStats } = await import('./bullsData')
        const stats = await getBullsStats()
        const { leaderboards } = stats
        const leaders: TeamPlayer[] = []
        // Points leader (total — find highest secondaryStat which is total PTS)
        const ptsEntry = leaderboards.scoring?.slice().sort((a: any, b: any) => (b.secondaryStat ?? 0) - (a.secondaryStat ?? 0))[0]
        if (ptsEntry) {
          const p = leaderToPlayer(ptsEntry, 'PTS')
          if (p) { p.stats = { PTS: ptsEntry.secondaryStat ?? 0 }; leaders.push(p) }
        }
        // PPG leader
        const ppg = leaderToPlayer(leaderboards.scoring?.[0], 'PPG')
        if (ppg) leaders.push(ppg)
        // Rebounds leader
        const reb = leaderToPlayer(leaderboards.rebounding?.[0], 'RPG')
        if (reb) leaders.push(reb)
        // Steals leader
        const stl = leaderToPlayer(leaderboards.steals?.[0], 'SPG')
        if (stl) leaders.push(stl)
        // Blocks leader
        const blk = leaderToPlayer(leaderboards.blocks?.[0], 'BPG')
        if (blk) leaders.push(blk)
        return leaders.slice(0, 5)
      }
      case 'cubs': {
        const { getCubsStats } = await import('./cubsData')
        const stats = await getCubsStats()
        const { leaderboards } = stats
        const leaders: TeamPlayer[] = []
        const avg = leaderToPlayer(leaderboards.batting?.[0], 'AVG')
        if (avg) leaders.push(avg)
        const hr = leaderToPlayer(leaderboards.homeRuns?.[0], 'HR')
        if (hr) leaders.push(hr)
        const obp = leaderToPlayer(leaderboards.obp?.[0], 'OBP')
        if (obp) leaders.push(obp)
        const rbi = leaderToPlayer(leaderboards.rbiLeaders?.[0], 'RBI')
        if (rbi) leaders.push(rbi)
        const ab = leaderToPlayer(leaderboards.atBats?.[0], 'AB')
        if (ab) leaders.push(ab)
        return leaders.slice(0, 5)
      }
      case 'blackhawks': {
        const { getBlackhawksStats } = await import('./blackhawksData')
        const stats = await getBlackhawksStats()
        const { leaderboards } = stats
        const leaders: TeamPlayer[] = []
        const goals = leaderToPlayer(leaderboards.goals?.[0], 'Goals')
        if (goals) leaders.push(goals)
        const assists = leaderToPlayer(leaderboards.assists?.[0], 'Assists')
        if (assists) leaders.push(assists)
        const pts = leaderToPlayer(leaderboards.points?.[0], 'Points')
        if (pts) leaders.push(pts)
        const goalie = leaderToPlayer(leaderboards.goaltending?.[0], 'SV%')
        if (goalie) leaders.push(goalie)
        const goals2 = leaderToPlayer(leaderboards.goals?.[1], 'Goals')
        if (goals2) leaders.push(goals2)
        return leaders.slice(0, 5)
      }
      case 'whitesox': {
        const { getWhiteSoxStats } = await import('./whitesoxData')
        const stats = await getWhiteSoxStats()
        const { leaderboards } = stats
        const leaders: TeamPlayer[] = []
        const avg = leaderToPlayer(leaderboards.batting?.[0], 'AVG')
        if (avg) leaders.push(avg)
        const hr = leaderToPlayer(leaderboards.homeRuns?.[0], 'HR')
        if (hr) leaders.push(hr)
        const obp = leaderToPlayer(leaderboards.obp?.[0], 'OBP')
        if (obp) leaders.push(obp)
        const rbi = leaderToPlayer(leaderboards.rbiLeaders?.[0], 'RBI')
        if (rbi) leaders.push(rbi)
        const ab = leaderToPlayer(leaderboards.atBats?.[0], 'AB')
        if (ab) leaders.push(ab)
        return leaders.slice(0, 5)
      }
      default:
        return []
    }
  } catch (error) {
    console.error(`Error fetching ${teamKey} key players:`, error)
    return []
  }
}

/**
 * Get trending topics for any team (static for now, can be enhanced with NLP)
 */
export async function getTeamTrends(teamKey: TeamKey): Promise<TeamTrend[]> {
  const trends: Record<TeamKey, TeamTrend[]> = {
    bears: [
      { id: 1, title: 'Caleb Williams Development', slug: 'caleb-williams', postCount: 12, isHot: true },
      { id: 2, title: 'Offensive Line Struggles', slug: 'offensive-line', postCount: 8, isHot: true },
      { id: 3, title: 'Coaching Changes', slug: 'coaching', postCount: 6 },
      { id: 4, title: 'Draft Preview 2026', slug: 'draft-2026', postCount: 5 },
      { id: 5, title: 'Soldier Field Future', slug: 'stadium', postCount: 4 },
    ],
    bulls: [
      { id: 1, title: 'Trade Deadline Moves', slug: 'trades', postCount: 10, isHot: true },
      { id: 2, title: 'Young Core Development', slug: 'young-core', postCount: 8, isHot: true },
      { id: 3, title: 'Playoff Push', slug: 'playoffs', postCount: 6 },
      { id: 4, title: 'Coaching Strategy', slug: 'coaching', postCount: 5 },
      { id: 5, title: 'Draft Lottery Watch', slug: 'draft', postCount: 4 },
    ],
    cubs: [
      { id: 1, title: 'Pitching Rotation', slug: 'pitching', postCount: 11, isHot: true },
      { id: 2, title: 'Free Agency Targets', slug: 'free-agency', postCount: 9, isHot: true },
      { id: 3, title: 'Farm System Rankings', slug: 'farm-system', postCount: 7 },
      { id: 4, title: 'Wrigley Field Upgrades', slug: 'wrigley', postCount: 5 },
      { id: 5, title: 'NL Central Race', slug: 'nl-central', postCount: 4 },
    ],
    blackhawks: [
      { id: 1, title: 'Connor Bedard Watch', slug: 'bedard', postCount: 14, isHot: true },
      { id: 2, title: 'Rebuild Progress', slug: 'rebuild', postCount: 9, isHot: true },
      { id: 3, title: 'Prospect Pipeline', slug: 'prospects', postCount: 7 },
      { id: 4, title: 'Draft Strategy', slug: 'draft', postCount: 5 },
      { id: 5, title: 'Coaching Updates', slug: 'coaching', postCount: 4 },
    ],
    whitesox: [
      { id: 1, title: 'Rebuild Timeline', slug: 'rebuild', postCount: 10, isHot: true },
      { id: 2, title: 'Top Prospects', slug: 'prospects', postCount: 8, isHot: true },
      { id: 3, title: 'Trade Returns', slug: 'trades', postCount: 6 },
      { id: 4, title: 'Stadium Situation', slug: 'stadium', postCount: 5 },
      { id: 5, title: 'Draft Strategy', slug: 'draft', postCount: 4 },
    ],
  }

  return trends[teamKey] || []
}
