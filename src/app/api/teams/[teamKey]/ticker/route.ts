import { NextResponse } from 'next/server'
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

// Team configuration for DataLab queries
const TEAM_CONFIG: Record<TeamKey, {
  gamesTable: string
  scoreCol: string
  oppScoreCol: string
  isHomeCol: string
  winCol: string
  league: 'nfl' | 'nba' | 'nhl' | 'mlb'
  logoBaseUrl: string
}> = {
  bears: {
    gamesTable: 'bears_games_master',
    scoreCol: 'bears_score',
    oppScoreCol: 'opponent_score',
    isHomeCol: 'is_bears_home',
    winCol: 'bears_win',
    league: 'nfl',
    logoBaseUrl: 'https://a.espncdn.com/i/teamlogos/nfl/500/',
  },
  bulls: {
    gamesTable: 'bulls_games_master',
    scoreCol: 'bulls_score',
    oppScoreCol: 'opponent_score',
    isHomeCol: 'is_bulls_home',
    winCol: 'bulls_win',
    league: 'nba',
    logoBaseUrl: 'https://a.espncdn.com/i/teamlogos/nba/500/',
  },
  blackhawks: {
    gamesTable: 'blackhawks_games_master',
    scoreCol: 'blackhawks_score',
    oppScoreCol: 'opponent_score',
    isHomeCol: 'is_blackhawks_home',
    winCol: 'blackhawks_win',
    league: 'nhl',
    logoBaseUrl: 'https://a.espncdn.com/i/teamlogos/nhl/500/',
  },
  cubs: {
    gamesTable: 'cubs_games_master',
    scoreCol: 'cubs_score',
    oppScoreCol: 'opponent_score',
    isHomeCol: 'is_cubs_home',
    winCol: 'cubs_win',
    league: 'mlb',
    logoBaseUrl: 'https://a.espncdn.com/i/teamlogos/mlb/500/',
  },
  whitesox: {
    gamesTable: 'whitesox_games_master',
    scoreCol: 'whitesox_score',
    oppScoreCol: 'opponent_score',
    isHomeCol: 'is_whitesox_home',
    winCol: 'whitesox_win',
    league: 'mlb',
    logoBaseUrl: 'https://a.espncdn.com/i/teamlogos/mlb/500/',
  },
}

// GET /api/teams/[teamKey]/ticker - Lightweight endpoint for team sticky bars
// Returns: record, next game, last game result (all from DataLab)
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

  // For Bears, use the dedicated bears_season_record table (more detailed)
  if (teamKey === 'bears') {
    return getBearsTickerFromDatalab()
  }

  // For all other teams, use generic DataLab ticker
  return getTeamTickerFromDatalab(teamKey)
}

// Generic DataLab ticker for Bulls, Blackhawks, Cubs, White Sox
async function getTeamTickerFromDatalab(teamKey: TeamKey) {
  try {
    if (!datalabAdmin) {
      return NextResponse.json({
        record: '--',
        nextGame: null,
        lastGame: null,
        error: 'Datalab not configured',
      })
    }

    const config = TEAM_CONFIG[teamKey]
    const today = new Date().toISOString().split('T')[0]

    // Calculate current season based on league
    // NFL: Season year is the year it starts (2025 season = Sept 2025 - Feb 2026)
    // NBA/NHL: Season year is the year it starts (2025-26 season stored as 2025)
    // MLB: Season year is the calendar year (2025 season = Mar-Oct 2025)
    const currentYear = new Date().getFullYear()
    const currentMonth = new Date().getMonth() + 1 // 1-12

    let currentSeason: number
    if (config.league === 'mlb') {
      // MLB: current year, or previous year if before March
      currentSeason = currentMonth < 3 ? currentYear - 1 : currentYear
    } else {
      // NBA, NHL, NFL: Season starts in fall, stored by start year
      // If we're in Jan-June, we're in the season that started last year
      currentSeason = currentMonth <= 6 ? currentYear - 1 : currentYear
    }

    // Get current season record by counting wins/losses
    const { data: seasonGames, error: recordError } = await datalabAdmin
      .from(config.gamesTable)
      .select('*')
      .eq('season', currentSeason)
      .not(config.winCol, 'is', null)

    if (recordError) {
      console.error(`${teamKey} season record fetch error:`, recordError)
    }

    // Calculate record
    let wins = 0
    let losses = 0
    let otLosses = 0 // For NHL
    if (seasonGames && seasonGames.length > 0) {
      seasonGames.forEach((game: Record<string, unknown>) => {
        if (game[config.winCol] === true) {
          wins++
        } else if (game[config.winCol] === false) {
          // Check for OT loss in NHL
          if (config.league === 'nhl' && (game.is_overtime || game.is_shootout)) {
            otLosses++
          } else {
            losses++
          }
        }
      })
    }

    // Format record based on league
    let record: string
    if (config.league === 'nhl' && otLosses > 0) {
      record = `${wins}-${losses}-${otLosses}`
    } else {
      record = `${wins}-${losses}`
    }

    // Get next game (first game on or after today without score)
    const { data: nextGameData, error: nextError } = await datalabAdmin
      .from(config.gamesTable)
      .select('*')
      .gte('game_date', today)
      .is(config.scoreCol, null)
      .order('game_date', { ascending: true })
      .limit(1)
      .single()

    if (nextError && nextError.code !== 'PGRST116') {
      console.error(`${teamKey} next game fetch error:`, nextError)
    }

    let nextGame = null
    if (nextGameData) {
      const gameDate = new Date(nextGameData.game_date + 'T12:00:00Z')
      const isToday = nextGameData.game_date === today
      const dayName = isToday ? 'Today' : gameDate.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'America/Chicago' })
      const timeStr = nextGameData.game_time ? formatTime(nextGameData.game_time) : 'TBD'
      const opponentAbbrev = nextGameData.opponent || 'TBD'
      const opponentLogo = getOpponentLogo(opponentAbbrev, config.league, config.logoBaseUrl)

      nextGame = {
        opponent: opponentAbbrev,
        opponentAbbrev: opponentAbbrev,
        opponentFull: nextGameData.opponent_full_name || opponentAbbrev,
        opponentLogo,
        date: dayName,
        time: timeStr,
        isHome: nextGameData[config.isHomeCol] ?? true,
        isToday,
        stadium: nextGameData.arena || nextGameData.stadium,
      }
    }

    // Get last completed game
    const { data: lastGameData, error: lastError } = await datalabAdmin
      .from(config.gamesTable)
      .select('*')
      .lt('game_date', today)
      .not(config.winCol, 'is', null)
      .order('game_date', { ascending: false })
      .limit(1)
      .single()

    if (lastError && lastError.code !== 'PGRST116') {
      console.error(`${teamKey} last game fetch error:`, lastError)
    }

    let lastGame = null
    if (lastGameData) {
      // Get scores - check for null explicitly (0 is a valid score)
      const rawTeamScore = lastGameData[config.scoreCol]
      const rawOppScore = lastGameData[config.oppScoreCol]
      const teamScore = rawTeamScore !== null && rawTeamScore !== undefined ? Number(rawTeamScore) : null
      const oppScore = rawOppScore !== null && rawOppScore !== undefined ? Number(rawOppScore) : null
      const didWin = lastGameData[config.winCol] === true
      const opponentAbbrev = lastGameData.opponent || 'OPP'
      const opponentLogo = getOpponentLogo(opponentAbbrev, config.league, config.logoBaseUrl)

      // Determine result (W, L, or OTL for NHL)
      let result = didWin ? 'W' : 'L'
      if (config.league === 'nhl' && !didWin && (lastGameData.is_overtime || lastGameData.is_shootout)) {
        result = 'OTL'
      }

      // Only include lastGame if we have actual scores
      if (teamScore !== null && oppScore !== null) {
        lastGame = {
          opponent: opponentAbbrev,
          opponentFull: lastGameData.opponent_full_name || opponentAbbrev,
          opponentLogo,
          result,
          score: `${teamScore}-${oppScore}`,
          date: new Date(lastGameData.game_date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          }),
        }
      } else {
        console.warn(`${teamKey} lastGame has null scores:`, { teamScore: rawTeamScore, oppScore: rawOppScore, game: lastGameData.game_date })
      }
    }

    return NextResponse.json({
      record,
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

// Get opponent logo URL from abbreviation
function getOpponentLogo(abbrev: string, league: string, baseUrl: string): string {
  // Normalize abbreviation for logo URLs
  const logoAbbrevMap: Record<string, Record<string, string>> = {
    nfl: {
      'LA': 'lar', 'LAR': 'lar', 'LAC': 'lac', 'SF': 'sf', 'SFO': 'sf',
      'GB': 'gb', 'GNB': 'gb', 'NE': 'ne', 'NWE': 'ne', 'TB': 'tb',
      'TAM': 'tb', 'KC': 'kc', 'KAN': 'kc', 'NO': 'no', 'NOR': 'no',
      'LV': 'lv', 'LVR': 'lv',
    },
    nhl: {
      'LA': 'la', 'LAK': 'la', 'SJ': 'sj', 'SJS': 'sj', 'TB': 'tb',
      'TBL': 'tb', 'NJ': 'njd', 'NJD': 'njd', 'NY': 'nyr', 'NYR': 'nyr',
      'NYI': 'nyi', 'VGK': 'vgk', 'VAN': 'van', 'WPG': 'wpg',
    },
    nba: {
      'LA': 'lal', 'LAL': 'lal', 'LAC': 'lac', 'GS': 'gs', 'GSW': 'gs',
      'NY': 'ny', 'NYK': 'ny', 'SA': 'sas', 'SAS': 'sas', 'NO': 'no',
      'NOP': 'no', 'OKC': 'okc',
    },
    mlb: {
      'LA': 'lad', 'LAD': 'lad', 'LAA': 'laa', 'SF': 'sf', 'SFG': 'sf',
      'SD': 'sd', 'SDP': 'sd', 'TB': 'tb', 'TBR': 'tb', 'KC': 'kc',
      'KCR': 'kc', 'STL': 'stl', 'CWS': 'chw', 'CHW': 'chw',
    },
  }

  const leagueMap = logoAbbrevMap[league] || {}
  const logoCode = leagueMap[abbrev.toUpperCase()] || abbrev.toLowerCase()
  return `${baseUrl}${logoCode}.png`
}

// Format time from 24h to 12h format
function formatTime(timeStr: string): string {
  const [hours, minutes] = timeStr.split(':').map(Number)
  const hour12 = hours % 12 || 12
  const ampm = hours >= 12 ? 'PM' : 'AM'
  return `${hour12}:${minutes.toString().padStart(2, '0')} ${ampm}`
}

// Get Bears ticker from datalab (uses bears_season_record for detailed info)
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
      const opponentAbbrev = formatOpponentAbbrev(lastGameData.opponent || 'OPP')
      lastGame = {
        opponent: opponentAbbrev,
        opponentFull: lastGameData.opponent_full_name,
        opponentLogo: `https://a.espncdn.com/i/teamlogos/nfl/500/${getLogoCode(opponentAbbrev)}.png`,
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
