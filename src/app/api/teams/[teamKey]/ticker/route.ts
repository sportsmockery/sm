import { NextResponse } from 'next/server'
import { CHICAGO_TEAMS, ESPN_TEAM_IDS, fetchTeamRecord, fetchNextGame } from '@/lib/team-config'
import { datalabAdmin } from '@/lib/supabase-datalab'

// Revalidate every 5 minutes during non-game times
export const revalidate = 300

type TeamKey = 'bears' | 'bulls' | 'cubs' | 'whitesox' | 'blackhawks'

// Map route param to team key
const ROUTE_TO_TEAM: Record<string, TeamKey> = {
  'bears': 'bears',
  'bulls': 'bulls',
  'cubs': 'cubs',
  'whitesox': 'whitesox',
  'white-sox': 'whitesox',
  'blackhawks': 'blackhawks',
}

// GET /api/teams/[teamKey]/ticker - Lightweight endpoint for team sticky bars
// Returns: record, next game, last game result
export async function GET(
  request: Request,
  { params }: { params: Promise<{ teamKey: string }> }
) {
  const { teamKey: rawTeamKey } = await params
  const teamKey = ROUTE_TO_TEAM[rawTeamKey.toLowerCase()]

  if (!teamKey) {
    return NextResponse.json(
      { error: 'Invalid team key' },
      { status: 400 }
    )
  }

  // For Bears, use the dedicated datalab tables for accurate data
  if (teamKey === 'bears') {
    return getBearsTickerFromDatalab()
  }

  // For other teams, use ESPN API directly
  return getTeamTickerFromESPN(teamKey)
}

// Get Bears ticker from datalab (existing implementation)
async function getBearsTickerFromDatalab() {
  try {
    if (!datalabAdmin) {
      return NextResponse.json({
        record: '--',
        nextGame: null,
        lastGame: null,
        error: 'Datalab not configured',
      })
    }

    // Query bears_season_record for accurate record and next game
    const { data: seasonRecord, error: recordError } = await datalabAdmin
      .from('bears_season_record')
      .select('*')
      .single()

    if (recordError) {
      console.error('Bears season record fetch error:', recordError)
      return NextResponse.json({
        record: '--',
        nextGame: null,
        lastGame: null,
        error: 'Failed to fetch season record',
      })
    }

    // Format record - combine regular season + playoffs into total record
    const regWins = seasonRecord?.regular_season_wins || 0
    const regLosses = seasonRecord?.regular_season_losses || 0
    const postWins = seasonRecord?.postseason_wins || 0
    const postLosses = seasonRecord?.postseason_losses || 0
    const totalWins = regWins + postWins
    const totalLosses = regLosses + postLosses
    const record = `${totalWins}-${totalLosses}`

    // Get current date in Central Time
    const nowCT = new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' })
    const todayCT = new Date(nowCT).toISOString().split('T')[0]

    // Get stadium from bears_games_master for next game
    let nextGameStadium = null
    if (seasonRecord?.next_game_date) {
      const { data: nextGameData } = await datalabAdmin
        .from('bears_games_master')
        .select('stadium')
        .eq('game_date', seasonRecord.next_game_date)
        .single()
      nextGameStadium = nextGameData?.stadium || null
    }

    let nextGame = null
    if (seasonRecord?.next_game_date) {
      const isToday = seasonRecord.next_game_date === todayCT
      const gameDate = new Date(seasonRecord.next_game_date + 'T12:00:00Z')
      const dayName = isToday ? 'Today' : gameDate.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'America/Chicago' })
      const timeStr = seasonRecord.next_game_time ? formatTimeCT(seasonRecord.next_game_time) : 'TBD'
      const opponentAbbrev = formatOpponentAbbrev(seasonRecord.next_opponent || 'TBD')

      nextGame = {
        opponent: `${seasonRecord.next_game_home ? 'vs' : '@'} ${opponentAbbrev}`,
        opponentAbbrev: opponentAbbrev,
        opponentFull: seasonRecord.next_opponent_full,
        opponentLogo: `https://a.espncdn.com/i/teamlogos/nfl/500/${getLogoCode(opponentAbbrev)}.png`,
        date: dayName,
        time: timeStr,
        isHome: seasonRecord.next_game_home,
        isToday,
        stadium: nextGameStadium,
      }
    }

    // Check for live game
    const { data: todayGame } = await datalabAdmin
      .from('bears_games_master')
      .select('*')
      .eq('game_date', todayCT)
      .single()

    let liveGame = null
    if (todayGame) {
      const gameTime = todayGame.game_time || '12:00:00'
      const [gameHours, gameMinutes] = gameTime.split(':').map(Number)
      const nowDate = new Date(nowCT)
      const currentMinutes = nowDate.getHours() * 60 + nowDate.getMinutes()
      const gameStartMinutes = gameHours * 60 + gameMinutes
      const minutesBefore = currentMinutes - gameStartMinutes
      const isWithinGameWindow = minutesBefore >= -60 && minutesBefore <= 240

      if (isWithinGameWindow && todayGame.bears_score !== null) {
        const isFinished = todayGame.bears_win !== null
        if (!isFinished) {
          liveGame = {
            opponent: todayGame.opponent,
            teamScore: todayGame.bears_score,
            opponentScore: todayGame.opponent_score,
            period: todayGame.quarter || 1,
            clock: todayGame.clock || '--:--',
            possession: todayGame.possession,
          }
        }
      }
    }

    // Get last completed game
    const { data: lastGameData } = await datalabAdmin
      .from('bears_games_master')
      .select('opponent, opponent_full_name, bears_score, opponent_score, bears_win, week, game_type, game_date')
      .not('bears_score', 'is', null)
      .not('bears_win', 'is', null)
      .lt('game_date', todayCT)
      .order('game_date', { ascending: false })
      .limit(1)
      .single()

    let lastGame = null
    if (lastGameData) {
      lastGame = {
        opponent: lastGameData.opponent,
        opponentFull: lastGameData.opponent_full_name,
        result: lastGameData.bears_win ? 'W' : 'L',
        score: `${lastGameData.bears_score}-${lastGameData.opponent_score}`,
      }
    }

    return NextResponse.json({
      record,
      nextGame,
      lastGame,
      liveGame,
      updatedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Bears ticker API error:', error)
    return NextResponse.json({
      record: '--',
      nextGame: null,
      lastGame: null,
      error: 'Internal server error',
    })
  }
}

// Get team ticker from ESPN API (for non-Bears teams)
async function getTeamTickerFromESPN(teamKey: TeamKey) {
  try {
    const teamInfo = CHICAGO_TEAMS[teamKey]
    const espnConfig = ESPN_TEAM_IDS[teamKey as keyof typeof ESPN_TEAM_IDS]

    if (!teamInfo || !espnConfig) {
      return NextResponse.json({
        record: '--',
        nextGame: null,
        lastGame: null,
        error: 'Team not found',
      })
    }

    // Fetch team data from ESPN
    const [record, nextGameInfo] = await Promise.all([
      fetchTeamRecord(teamKey),
      fetchNextGame(teamKey),
    ])

    // Format record based on league
    let recordStr = '--'
    if (record) {
      if (espnConfig.league === 'nhl' && record.otLosses) {
        recordStr = `${record.wins}-${record.losses}-${record.otLosses}`
      } else if (record.ties !== undefined && record.ties > 0) {
        recordStr = `${record.wins}-${record.losses}-${record.ties}`
      } else {
        recordStr = `${record.wins}-${record.losses}`
      }
    }

    // Format next game
    let nextGame = null
    if (nextGameInfo) {
      // Extract opponent abbreviation from the opponent name
      const opponentAbbrev = getOpponentAbbrevFromName(nextGameInfo.opponent, espnConfig.league)

      nextGame = {
        opponent: nextGameInfo.opponent,
        opponentAbbrev,
        opponentFull: nextGameInfo.opponent,
        opponentLogo: nextGameInfo.opponentLogo,
        date: nextGameInfo.date.split(',')[0], // e.g., "Wed"
        time: nextGameInfo.time,
        isHome: nextGameInfo.isHome,
        stadium: nextGameInfo.venue,
      }
    }

    // Fetch last game from ESPN scoreboard
    const lastGame = await fetchLastGame(teamKey, espnConfig)

    return NextResponse.json({
      record: recordStr,
      nextGame,
      lastGame,
      liveGame: null, // TODO: Add live game detection
      updatedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error(`${teamKey} ticker API error:`, error)
    return NextResponse.json({
      record: '--',
      nextGame: null,
      lastGame: null,
      error: 'Internal server error',
    })
  }
}

// Fetch last completed game from ESPN
async function fetchLastGame(teamKey: TeamKey, espnConfig: { sport: string; league: string; teamId: string }) {
  try {
    // Get the team's schedule
    const url = `https://site.api.espn.com/apis/site/v2/sports/${espnConfig.sport}/${espnConfig.league}/teams/${espnConfig.teamId}/schedule`
    const response = await fetch(url, { cache: 'force-cache' })

    if (!response.ok) return null

    const data = await response.json()
    const events = data.events || []
    const now = new Date()

    // Find the most recent completed game
    const completedGames = events
      .filter((event: any) => {
        const eventDate = new Date(event.date)
        return eventDate < now && event.competitions?.[0]?.status?.type?.completed
      })
      .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())

    if (completedGames.length === 0) return null

    const lastGameEvent = completedGames[0]
    const competition = lastGameEvent.competitions?.[0]

    if (!competition) return null

    // Find our team and opponent
    const teamCompetitor = competition.competitors?.find(
      (c: any) => c.team?.id === espnConfig.teamId
    )
    const opponentCompetitor = competition.competitors?.find(
      (c: any) => c.team?.id !== espnConfig.teamId
    )

    if (!teamCompetitor || !opponentCompetitor) return null

    const teamScore = parseInt(teamCompetitor.score) || 0
    const opponentScore = parseInt(opponentCompetitor.score) || 0
    const didWin = teamScore > opponentScore

    return {
      opponent: opponentCompetitor.team?.abbreviation || opponentCompetitor.team?.shortDisplayName || 'OPP',
      opponentFull: opponentCompetitor.team?.displayName,
      opponentLogo: opponentCompetitor.team?.logo,
      result: didWin ? 'W' : 'L',
      score: `${teamScore}-${opponentScore}`,
      date: new Date(lastGameEvent.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
    }
  } catch (error) {
    console.error(`Error fetching last game for ${teamKey}:`, error)
    return null
  }
}

// Get opponent abbreviation from full name
function getOpponentAbbrevFromName(name: string, league: string): string {
  // Common team name to abbreviation mappings by league
  const mappings: Record<string, Record<string, string>> = {
    nba: {
      'Hawks': 'ATL', 'Celtics': 'BOS', 'Nets': 'BKN', 'Hornets': 'CHA',
      'Bulls': 'CHI', 'Cavaliers': 'CLE', 'Mavericks': 'DAL', 'Nuggets': 'DEN',
      'Pistons': 'DET', 'Warriors': 'GSW', 'Rockets': 'HOU', 'Pacers': 'IND',
      'Clippers': 'LAC', 'Lakers': 'LAL', 'Grizzlies': 'MEM', 'Heat': 'MIA',
      'Bucks': 'MIL', 'Timberwolves': 'MIN', 'Pelicans': 'NOP', 'Knicks': 'NYK',
      'Thunder': 'OKC', 'Magic': 'ORL', '76ers': 'PHI', 'Suns': 'PHX',
      'Trail Blazers': 'POR', 'Blazers': 'POR', 'Kings': 'SAC', 'Spurs': 'SAS',
      'Raptors': 'TOR', 'Jazz': 'UTA', 'Wizards': 'WAS',
    },
    mlb: {
      'Diamondbacks': 'ARI', 'Braves': 'ATL', 'Orioles': 'BAL', 'Red Sox': 'BOS',
      'Cubs': 'CHC', 'White Sox': 'CWS', 'Reds': 'CIN', 'Guardians': 'CLE',
      'Rockies': 'COL', 'Tigers': 'DET', 'Astros': 'HOU', 'Royals': 'KC',
      'Angels': 'LAA', 'Dodgers': 'LAD', 'Marlins': 'MIA', 'Brewers': 'MIL',
      'Twins': 'MIN', 'Mets': 'NYM', 'Yankees': 'NYY', 'Athletics': 'OAK',
      'Phillies': 'PHI', 'Pirates': 'PIT', 'Padres': 'SD', 'Giants': 'SF',
      'Mariners': 'SEA', 'Cardinals': 'STL', 'Rays': 'TB', 'Rangers': 'TEX',
      'Blue Jays': 'TOR', 'Nationals': 'WSH',
    },
    nhl: {
      'Ducks': 'ANA', 'Coyotes': 'ARI', 'Bruins': 'BOS', 'Sabres': 'BUF',
      'Flames': 'CGY', 'Hurricanes': 'CAR', 'Blackhawks': 'CHI', 'Avalanche': 'COL',
      'Blue Jackets': 'CBJ', 'Stars': 'DAL', 'Red Wings': 'DET', 'Oilers': 'EDM',
      'Panthers': 'FLA', 'Kings': 'LA', 'Wild': 'MIN', 'Canadiens': 'MTL',
      'Predators': 'NSH', 'Devils': 'NJ', 'Islanders': 'NYI', 'Rangers': 'NYR',
      'Senators': 'OTT', 'Flyers': 'PHI', 'Penguins': 'PIT', 'Sharks': 'SJ',
      'Kraken': 'SEA', 'Blues': 'STL', 'Lightning': 'TB', 'Maple Leafs': 'TOR',
      'Canucks': 'VAN', 'Golden Knights': 'VGK', 'Capitals': 'WAS', 'Jets': 'WPG',
      'Utah Hockey Club': 'UTA',
    },
  }

  const leagueMappings = mappings[league] || {}

  // Try to find matching team name
  for (const [teamName, abbrev] of Object.entries(leagueMappings)) {
    if (name.toLowerCase().includes(teamName.toLowerCase())) {
      return abbrev
    }
  }

  // Return first 3 letters as fallback
  return name.substring(0, 3).toUpperCase()
}

// Helper functions
function formatTimeCT(timeStr: string): string {
  const [hours, minutes] = timeStr.split(':').map(Number)
  const hour12 = hours % 12 || 12
  const ampm = hours >= 12 ? 'PM' : 'AM'
  const minStr = minutes.toString().padStart(2, '0')
  return `${hour12}:${minStr} ${ampm} CT`
}

function formatOpponentAbbrev(abbrev: string): string {
  const abbrevMap: Record<string, string> = {
    'LAR': 'LA', 'SFO': 'SF', 'GNB': 'GB', 'NWE': 'NE',
    'TAM': 'TB', 'KAN': 'KC', 'NOR': 'NO', 'LVR': 'LV',
  }
  return abbrevMap[abbrev] || abbrev
}

function getLogoCode(abbrev: string): string {
  const logoMap: Record<string, string> = {
    'LA': 'lar', 'LAR': 'lar', 'LAC': 'lac',
    'SF': 'sf', 'SFO': 'sf', 'GB': 'gb', 'GNB': 'gb',
    'NE': 'ne', 'NWE': 'ne', 'TB': 'tb', 'TAM': 'tb',
    'KC': 'kc', 'KAN': 'kc', 'NO': 'no', 'NOR': 'no',
    'LV': 'lv', 'LVR': 'lv', 'MIN': 'min', 'DET': 'det',
    'PHI': 'phi', 'DAL': 'dal', 'NYG': 'nyg', 'WAS': 'was',
    'ATL': 'atl', 'CAR': 'car', 'SEA': 'sea', 'ARI': 'ari',
    'DEN': 'den', 'PIT': 'pit', 'BAL': 'bal', 'CLE': 'cle',
    'CIN': 'cin', 'BUF': 'buf', 'MIA': 'mia', 'NYJ': 'nyj',
    'IND': 'ind', 'TEN': 'ten', 'JAX': 'jax', 'HOU': 'hou',
  }
  return logoMap[abbrev.toUpperCase()] || abbrev.toLowerCase()
}
