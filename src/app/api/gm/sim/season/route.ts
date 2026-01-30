import { NextRequest, NextResponse } from 'next/server'
import { datalabAdmin } from '@/lib/supabase-datalab'
import type {
  SimulationResult,
  TeamStanding,
  PlayoffMatchup,
  ChampionshipResult,
  SeasonSummary,
} from '@/types/gm'

// League configurations
const LEAGUE_CONFIG: Record<string, {
  conferences: [string, string]
  divisions: Record<string, string[]>
  playoffTeams: number
  gamesPerSeason: number
  seriesLength: number
  playoffRounds: string[]
}> = {
  nfl: {
    conferences: ['AFC', 'NFC'],
    divisions: {
      'AFC North': ['BAL', 'CIN', 'CLE', 'PIT'],
      'AFC South': ['HOU', 'IND', 'JAX', 'TEN'],
      'AFC East': ['BUF', 'MIA', 'NE', 'NYJ'],
      'AFC West': ['KC', 'LV', 'LAC', 'DEN'],
      'NFC North': ['CHI', 'DET', 'GB', 'MIN'],
      'NFC South': ['ATL', 'CAR', 'NO', 'TB'],
      'NFC East': ['DAL', 'NYG', 'PHI', 'WAS'],
      'NFC West': ['ARI', 'LA', 'SF', 'SEA'],
    },
    playoffTeams: 7,
    gamesPerSeason: 17,
    seriesLength: 1,
    playoffRounds: ['Wild Card', 'Divisional', 'Conference Championship', 'Super Bowl'],
  },
  nba: {
    conferences: ['Eastern', 'Western'],
    divisions: {
      'Atlantic': ['BOS', 'BKN', 'NYK', 'PHI', 'TOR'],
      'Central': ['CHI', 'CLE', 'DET', 'IND', 'MIL'],
      'Southeast': ['ATL', 'CHA', 'MIA', 'ORL', 'WAS'],
      'Northwest': ['DEN', 'MIN', 'OKC', 'POR', 'UTA'],
      'Pacific': ['GSW', 'LAC', 'LAL', 'PHX', 'SAC'],
      'Southwest': ['DAL', 'HOU', 'MEM', 'NOP', 'SAS'],
    },
    playoffTeams: 8,
    gamesPerSeason: 82,
    seriesLength: 7,
    playoffRounds: ['First Round', 'Conference Semifinals', 'Conference Finals', 'NBA Finals'],
  },
  nhl: {
    conferences: ['Eastern', 'Western'],
    divisions: {
      'Atlantic': ['BOS', 'BUF', 'DET', 'FLA', 'MTL', 'OTT', 'TB', 'TOR'],
      'Metropolitan': ['CAR', 'CBJ', 'NJ', 'NYI', 'NYR', 'PHI', 'PIT', 'WAS'],
      'Central': ['ARI', 'CHI', 'COL', 'DAL', 'MIN', 'NSH', 'STL', 'WPG'],
      'Pacific': ['ANA', 'CGY', 'EDM', 'LA', 'SJ', 'SEA', 'VAN', 'VGK'],
    },
    playoffTeams: 8,
    gamesPerSeason: 82,
    seriesLength: 7,
    playoffRounds: ['First Round', 'Second Round', 'Conference Finals', 'Stanley Cup Finals'],
  },
  mlb: {
    conferences: ['American League', 'National League'],
    divisions: {
      'AL East': ['BAL', 'BOS', 'NYY', 'TB', 'TOR'],
      'AL Central': ['CHW', 'CLE', 'DET', 'KC', 'MIN'],
      'AL West': ['HOU', 'LAA', 'OAK', 'SEA', 'TEX'],
      'NL East': ['ATL', 'MIA', 'NYM', 'PHI', 'WAS'],
      'NL Central': ['CHC', 'CIN', 'MIL', 'PIT', 'STL'],
      'NL West': ['ARI', 'COL', 'LAD', 'SD', 'SF'],
    },
    playoffTeams: 6,
    gamesPerSeason: 162,
    seriesLength: 5, // varies but simplify
    playoffRounds: ['Wild Card', 'Division Series', 'Championship Series', 'World Series'],
  },
}

// Team display info
const TEAM_INFO: Record<string, { name: string; city: string; color: string }> = {
  // NFL
  'CHI': { name: 'Bears', city: 'Chicago', color: '#0B162A' },
  'DET': { name: 'Lions', city: 'Detroit', color: '#0076B6' },
  'GB': { name: 'Packers', city: 'Green Bay', color: '#203731' },
  'MIN': { name: 'Vikings', city: 'Minnesota', color: '#4F2683' },
  'KC': { name: 'Chiefs', city: 'Kansas City', color: '#E31837' },
  'BUF': { name: 'Bills', city: 'Buffalo', color: '#00338D' },
  'SF': { name: '49ers', city: 'San Francisco', color: '#AA0000' },
  'PHI': { name: 'Eagles', city: 'Philadelphia', color: '#004C54' },
  'DAL': { name: 'Cowboys', city: 'Dallas', color: '#003594' },
  'BAL': { name: 'Ravens', city: 'Baltimore', color: '#241773' },
  // NBA
  'BOS': { name: 'Celtics', city: 'Boston', color: '#007A33' },
  'MIL': { name: 'Bucks', city: 'Milwaukee', color: '#00471B' },
  'CLE': { name: 'Cavaliers', city: 'Cleveland', color: '#6F263D' },
  'NYK': { name: 'Knicks', city: 'New York', color: '#006BB6' },
  'DEN': { name: 'Nuggets', city: 'Denver', color: '#0E2240' },
  'OKC': { name: 'Thunder', city: 'Oklahoma City', color: '#007AC1' },
  'LAL': { name: 'Lakers', city: 'Los Angeles', color: '#552583' },
  // NHL
  'COL': { name: 'Avalanche', city: 'Colorado', color: '#6F263D' },
  'FLA': { name: 'Panthers', city: 'Florida', color: '#041E42' },
  'EDM': { name: 'Oilers', city: 'Edmonton', color: '#041E42' },
  'VGK': { name: 'Golden Knights', city: 'Vegas', color: '#B4975A' },
  // MLB
  'CHC': { name: 'Cubs', city: 'Chicago', color: '#0E3386' },
  'CHW': { name: 'White Sox', city: 'Chicago', color: '#27251F' },
  'NYY': { name: 'Yankees', city: 'New York', color: '#003087' },
  'LAD': { name: 'Dodgers', city: 'Los Angeles', color: '#005A9C' },
  'ATL': { name: 'Braves', city: 'Atlanta', color: '#CE1141' },
  'HOU': { name: 'Astros', city: 'Houston', color: '#002D62' },
}

// Chicago team mappings
const CHICAGO_TEAMS: Record<string, { abbrev: string; conference: string; division: string }> = {
  'chicago-bears': { abbrev: 'CHI', conference: 'NFC', division: 'NFC North' },
  'chicago-bulls': { abbrev: 'CHI', conference: 'Eastern', division: 'Central' },
  'chicago-blackhawks': { abbrev: 'CHI', conference: 'Western', division: 'Central' },
  'chicago-cubs': { abbrev: 'CHC', conference: 'National League', division: 'NL Central' },
  'chicago-white-sox': { abbrev: 'CHW', conference: 'American League', division: 'AL Central' },
}

function getTeamInfo(abbrev: string, sport: string) {
  const info = TEAM_INFO[abbrev] || { name: abbrev, city: '', color: '#666666' }
  return {
    teamKey: abbrev.toLowerCase(),
    teamName: info.city ? `${info.city} ${info.name}` : info.name,
    abbreviation: abbrev,
    logoUrl: `https://a.espncdn.com/i/teamlogos/${sport}/500/${abbrev.toLowerCase()}.png`,
    primaryColor: info.color,
  }
}

// Generate random season record with variance
function generateRecord(baseWins: number, variance: number, gamesPerSeason: number): { wins: number; losses: number } {
  const wins = Math.max(0, Math.min(gamesPerSeason, Math.round(baseWins + (Math.random() - 0.5) * variance * 2)))
  return { wins, losses: gamesPerSeason - wins }
}

// Simulate playoff series
function simulateSeries(team1Strength: number, team2Strength: number, seriesLength: number): [number, number] {
  const winsNeeded = Math.ceil(seriesLength / 2)
  let wins1 = 0, wins2 = 0

  while (wins1 < winsNeeded && wins2 < winsNeeded) {
    const team1Prob = team1Strength / (team1Strength + team2Strength)
    if (Math.random() < team1Prob) wins1++
    else wins2++
  }

  return [wins1, wins2]
}

/**
 * POST /api/gm/sim/season
 * Generate full season simulation with standings, playoffs, and championship
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sessionId, sport, teamKey, seasonYear } = body

    if (!sessionId || !sport || !teamKey) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: sessionId, sport, teamKey' },
        { status: 400 }
      )
    }

    // Get session trades to calculate impact
    const { data: session } = await datalabAdmin
      .from('gm_sessions')
      .select('*')
      .eq('id', sessionId)
      .single()

    const { data: trades } = await datalabAdmin
      .from('gm_trades')
      .select('*')
      .eq('session_id', sessionId)

    const acceptedTrades = (trades || []).filter(t => t.status === 'accepted')
    const totalImprovement = acceptedTrades.reduce((sum, t) => sum + (t.improvement_score || 0), 0)
    const avgGrade = acceptedTrades.length > 0
      ? acceptedTrades.reduce((sum, t) => sum + t.grade, 0) / acceptedTrades.length
      : 50

    const config = LEAGUE_CONFIG[sport]
    if (!config) {
      return NextResponse.json({ success: false, error: 'Invalid sport' }, { status: 400 })
    }

    const chicagoInfo = CHICAGO_TEAMS[teamKey]
    if (!chicagoInfo) {
      return NextResponse.json({ success: false, error: 'Invalid team' }, { status: 400 })
    }

    // Generate baseline and modified records
    const baselineWinPct = sport === 'nfl' ? 0.5 : sport === 'mlb' ? 0.5 : 0.45
    const baselineWins = Math.round(config.gamesPerSeason * baselineWinPct)

    // Trade impact: each improvement point = ~0.5-1 wins
    const winBoost = Math.round(totalImprovement * 0.75)
    const modifiedWins = Math.max(0, Math.min(config.gamesPerSeason, baselineWins + winBoost))

    const baseline = {
      wins: baselineWins,
      losses: config.gamesPerSeason - baselineWins,
      madePlayoffs: baselineWins > config.gamesPerSeason * 0.55,
      playoffSeed: baselineWins > config.gamesPerSeason * 0.55 ? Math.ceil(Math.random() * 4) + 3 : undefined,
    }

    const modified = {
      wins: modifiedWins,
      losses: config.gamesPerSeason - modifiedWins,
      madePlayoffs: modifiedWins > config.gamesPerSeason * 0.52,
      playoffSeed: modifiedWins > config.gamesPerSeason * 0.52 ? Math.max(1, 8 - Math.floor(winBoost / 2)) : undefined,
    }

    // Generate full standings
    const standings: { conference1: TeamStanding[]; conference2: TeamStanding[]; conference1Name: string; conference2Name: string } = {
      conference1: [],
      conference2: [],
      conference1Name: config.conferences[0],
      conference2Name: config.conferences[1],
    }

    // Get all teams by conference
    const allTeams: { abbrev: string; division: string; conference: string }[] = []
    for (const [div, teams] of Object.entries(config.divisions)) {
      const conf = div.includes('NFC') || div.includes('Eastern') || div.includes('National') || div.includes('NL')
        ? config.conferences[1]
        : config.conferences[0]
      for (const abbrev of teams) {
        allTeams.push({ abbrev, division: div, conference: conf })
      }
    }

    // Generate records for all teams
    const teamRecords = allTeams.map(team => {
      const isChicago = team.abbrev === chicagoInfo.abbrev
      const isTradePartner = acceptedTrades.some(t =>
        t.partner_team_key?.toUpperCase() === team.abbrev
      )

      let wins: number, losses: number

      if (isChicago) {
        wins = modifiedWins
        losses = config.gamesPerSeason - wins
      } else if (isTradePartner) {
        // Trade partners may be negatively impacted
        const partnerImpact = -Math.round(totalImprovement * 0.3)
        const partnerBase = Math.round(config.gamesPerSeason * (0.45 + Math.random() * 0.15))
        wins = Math.max(10, partnerBase + partnerImpact)
        losses = config.gamesPerSeason - wins
      } else {
        // Random other teams
        const strength = 0.35 + Math.random() * 0.35
        wins = Math.round(config.gamesPerSeason * strength)
        losses = config.gamesPerSeason - wins
      }

      const info = getTeamInfo(team.abbrev, sport)
      return {
        ...info,
        wins,
        losses,
        winPct: wins / config.gamesPerSeason,
        division: team.division,
        conference: team.conference,
        divisionRank: 0,
        conferenceRank: 0,
        playoffSeed: null as number | null,
        gamesBack: 0,
        isUserTeam: isChicago,
        isTradePartner,
        tradeImpact: isChicago ? winBoost : isTradePartner ? -Math.round(totalImprovement * 0.3) : undefined,
      }
    })

    // Sort by conference and assign ranks
    for (const conf of config.conferences) {
      const confTeams = teamRecords
        .filter(t => t.conference === conf)
        .sort((a, b) => b.winPct - a.winPct)

      confTeams.forEach((team, idx) => {
        team.conferenceRank = idx + 1
        if (idx < config.playoffTeams) {
          team.playoffSeed = idx + 1
        }
      })

      // Calculate games back
      const leader = confTeams[0]
      confTeams.forEach(team => {
        team.gamesBack = (leader.wins - team.wins) / 2
      })

      if (conf === config.conferences[0]) {
        standings.conference1 = confTeams
      } else {
        standings.conference2 = confTeams
      }
    }

    // Generate playoffs
    const playoffTeams1 = standings.conference1.filter(t => t.playoffSeed).slice(0, config.playoffTeams)
    const playoffTeams2 = standings.conference2.filter(t => t.playoffSeed).slice(0, config.playoffTeams)

    const bracket: PlayoffMatchup[] = []
    let currentRound1 = [...playoffTeams1]
    let currentRound2 = [...playoffTeams2]

    let userTeamEliminated = false
    let userEliminatedRound: number | undefined
    let userEliminatedBy: string | undefined
    let userWonChampionship = false

    // Simulate each round
    for (let round = 1; round <= config.playoffRounds.length; round++) {
      const roundName = config.playoffRounds[round - 1]
      const isFinals = round === config.playoffRounds.length

      if (isFinals) {
        // Championship round - conference winners face off
        if (currentRound1.length === 1 && currentRound2.length === 1) {
          const home = currentRound1[0]
          const away = currentRound2[0]
          const homeStrength = 50 + home.wins
          const awayStrength = 50 + away.wins
          const [homeWins, awayWins] = simulateSeries(homeStrength, awayStrength, config.seriesLength)
          const winner = homeWins > awayWins ? 'home' : 'away'

          const userInvolved = home.isUserTeam || away.isUserTeam
          if (userInvolved) {
            if ((home.isUserTeam && winner === 'home') || (away.isUserTeam && winner === 'away')) {
              userWonChampionship = true
            } else {
              userTeamEliminated = true
              userEliminatedRound = round
              userEliminatedBy = winner === 'home' ? home.teamName : away.teamName
            }
          }

          bracket.push({
            round,
            roundName,
            homeTeam: { ...home, seed: home.playoffSeed!, wins: home.wins },
            awayTeam: { ...away, seed: away.playoffSeed!, wins: away.wins },
            seriesWins: [homeWins, awayWins],
            winner,
            isComplete: true,
            gamesPlayed: homeWins + awayWins,
            userTeamInvolved: userInvolved,
          })
        }
      } else {
        // Conference rounds
        for (const [confTeams, confName] of [[currentRound1, config.conferences[0]], [currentRound2, config.conferences[1]]] as const) {
          const nextRound: TeamStanding[] = []

          for (let i = 0; i < confTeams.length / 2; i++) {
            const home = confTeams[i]
            const away = confTeams[confTeams.length - 1 - i]
            if (!home || !away) continue

            const homeStrength = 50 + home.wins + (home.playoffSeed! <= 2 ? 5 : 0)
            const awayStrength = 50 + away.wins
            const [homeWins, awayWins] = simulateSeries(homeStrength, awayStrength, config.seriesLength)
            const winner = homeWins > awayWins ? 'home' : 'away'

            const userInvolved = home.isUserTeam || away.isUserTeam
            if (userInvolved && !userTeamEliminated) {
              if ((home.isUserTeam && winner === 'away') || (away.isUserTeam && winner === 'home')) {
                userTeamEliminated = true
                userEliminatedRound = round
                userEliminatedBy = winner === 'home' ? home.teamName : away.teamName
              }
            }

            bracket.push({
              round,
              roundName: `${roundName} - ${confName}`,
              homeTeam: { ...home, seed: home.playoffSeed!, wins: home.wins },
              awayTeam: { ...away, seed: away.playoffSeed!, wins: away.wins },
              seriesWins: [homeWins, awayWins],
              winner,
              isComplete: true,
              gamesPlayed: homeWins + awayWins,
              userTeamInvolved: userInvolved,
            })

            nextRound.push(winner === 'home' ? home : away)
          }

          if (confName === config.conferences[0]) {
            currentRound1 = nextRound
          } else {
            currentRound2 = nextRound
          }
        }
      }
    }

    // Championship result
    const finalsMatch = bracket.find(m => m.round === config.playoffRounds.length)
    let championship: ChampionshipResult | undefined

    if (finalsMatch) {
      const winnerTeam = finalsMatch.winner === 'home' ? finalsMatch.homeTeam : finalsMatch.awayTeam
      const loserTeam = finalsMatch.winner === 'home' ? finalsMatch.awayTeam : finalsMatch.homeTeam

      championship = {
        winner: {
          teamKey: winnerTeam.teamKey,
          teamName: winnerTeam.teamName,
          abbreviation: winnerTeam.abbreviation,
          logoUrl: winnerTeam.logoUrl,
          primaryColor: winnerTeam.primaryColor,
        },
        runnerUp: {
          teamKey: loserTeam.teamKey,
          teamName: loserTeam.teamName,
          abbreviation: loserTeam.abbreviation,
          logoUrl: loserTeam.logoUrl,
          primaryColor: loserTeam.primaryColor,
        },
        seriesScore: config.seriesLength === 1
          ? `${Math.max(...finalsMatch.seriesWins)}-${Math.min(...finalsMatch.seriesWins)}`
          : `${Math.max(...finalsMatch.seriesWins)}-${Math.min(...finalsMatch.seriesWins)}`,
        userTeamWon: userWonChampionship,
        userTeamInFinals: finalsMatch.userTeamInvolved,
      }
    }

    // Generate season summary
    const chicagoTeamName = getTeamInfo(chicagoInfo.abbrev, sport).teamName
    const winChange = modifiedWins - baselineWins
    const madePlayoffsChange = modified.madePlayoffs && !baseline.madePlayoffs
    const missedPlayoffsChange = !modified.madePlayoffs && baseline.madePlayoffs

    let headline: string
    let narrative: string

    if (userWonChampionship) {
      headline = `${chicagoTeamName} Win Championship After Masterful Trades!`
      narrative = `In a stunning turn of events, the ${chicagoTeamName} rode their strategic mid-season trades all the way to a championship. The ${acceptedTrades.length} trade(s) made during the season added ${winChange > 0 ? winChange : 0} wins to their total, transforming them from a ${baselineWins}-win team to ${modifiedWins}-win champions.`
    } else if (winChange > 3) {
      headline = `${chicagoTeamName} Surge After Blockbuster Trades`
      narrative = `The ${chicagoTeamName} made significant improvements this season, adding ${winChange} wins after executing ${acceptedTrades.length} strategic trade(s). ${madePlayoffsChange ? 'Most importantly, these moves helped the team secure a playoff berth.' : 'The team showed marked improvement across all phases.'}`
    } else if (winChange < -2) {
      headline = `${chicagoTeamName} Struggle After Controversial Trades`
      narrative = `The ${chicagoTeamName}'s trades did not pan out as expected, resulting in ${Math.abs(winChange)} fewer wins than projected. ${missedPlayoffsChange ? 'The team ultimately missed the playoffs.' : 'Management will need to reassess their strategy.'}`
    } else {
      headline = `${chicagoTeamName} Finish Season at ${modifiedWins}-${modified.losses}`
      narrative = `The ${chicagoTeamName} completed the ${seasonYear} season with a record of ${modifiedWins}-${modified.losses}. ${acceptedTrades.length > 0 ? `The ${acceptedTrades.length} trade(s) made had a modest impact on the team's performance.` : 'The team maintained their trajectory throughout the year.'}`
    }

    // Affected teams summary
    const affectedTeams = acceptedTrades
      .filter(t => t.partner_team_key)
      .map(t => {
        const partnerAbbrev = t.partner_team_key?.toUpperCase()
        const partnerStanding = [...standings.conference1, ...standings.conference2]
          .find(s => s.abbreviation === partnerAbbrev)
        return {
          teamName: t.trade_partner || partnerAbbrev,
          impact: partnerStanding
            ? `Finished ${partnerStanding.wins}-${partnerStanding.losses}, ${partnerStanding.playoffSeed ? `#${partnerStanding.playoffSeed} seed` : 'missed playoffs'}`
            : 'Impact unclear',
        }
      })

    const seasonSummary: SeasonSummary = {
      headline,
      narrative,
      tradeImpactSummary: `Your trades resulted in a net change of ${winChange > 0 ? '+' : ''}${winChange} wins. Average trade grade: ${avgGrade.toFixed(0)}.`,
      keyMoments: [
        `Season Start: ${chicagoTeamName} projected for ${baselineWins} wins`,
        acceptedTrades.length > 0 ? `Trade Deadline: Executed ${acceptedTrades.length} trade(s)` : '',
        modified.madePlayoffs ? `Playoffs: Secured #${modified.playoffSeed} seed` : 'Season End: Missed playoffs',
        userWonChampionship ? `Championship: ${chicagoTeamName} win it all!` : userEliminatedRound ? `Playoffs: Eliminated in ${config.playoffRounds[userEliminatedRound - 1]}` : '',
      ].filter(Boolean),
      affectedTeams,
    }

    // Calculate GM Score
    const tradeQualityScore = Math.min(60, avgGrade * 0.6)
    const winImprovementScore = Math.min(25, Math.max(0, winChange * 5))
    const playoffBonus = modified.madePlayoffs ? (modified.playoffSeed && modified.playoffSeed <= 4 ? 10 : 5) : 0
    const championshipBonus = userWonChampionship ? 15 : championship?.userTeamInFinals ? 5 : 0

    const gmScore = tradeQualityScore + winImprovementScore + playoffBonus + championshipBonus

    const result: SimulationResult = {
      success: true,
      baseline,
      modified,
      gmScore,
      scoreBreakdown: {
        tradeQualityScore,
        winImprovementScore,
        playoffBonusScore: playoffBonus,
        championshipBonus,
        winImprovement: winChange,
      },
      standings,
      playoffs: {
        bracket,
        userTeamResult: {
          madePlayoffs: modified.madePlayoffs,
          eliminatedRound: userEliminatedRound,
          eliminatedBy: userEliminatedBy,
          wonChampionship: userWonChampionship,
        },
      },
      championship,
      seasonSummary,
    }

    return NextResponse.json(result)

  } catch (error) {
    console.error('[Simulation API] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
