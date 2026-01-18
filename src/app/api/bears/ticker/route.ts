import { NextResponse } from 'next/server'
import { datalabAdmin } from '@/lib/supabase-datalab'

// Revalidate every 5 minutes during non-game times, shorter during games
export const revalidate = 300

// GET /api/bears/ticker - Lightweight endpoint for Bears sticky bar
// Returns: record, next game, last game result
// Uses bears_season_record table for accurate record data

export async function GET() {
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
    // e.g., 11-6 regular + 1-0 playoffs = 12-6
    const regWins = seasonRecord?.regular_season_wins || 0
    const regLosses = seasonRecord?.regular_season_losses || 0
    const postWins = seasonRecord?.postseason_wins || 0
    const postLosses = seasonRecord?.postseason_losses || 0
    const totalWins = regWins + postWins
    const totalLosses = regLosses + postLosses
    const record = `${totalWins}-${totalLosses}`

    // Format next game from bears_season_record
    // Get current date in Central Time for "Tonight" logic
    const nowCT = new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' })
    const todayCT = new Date(nowCT).toISOString().split('T')[0]

    let nextGame = null
    if (seasonRecord?.next_game_date) {
      // Check if game is today
      const isToday = seasonRecord.next_game_date === todayCT

      // Parse date for day name - use UTC date directly since we want the game date
      const gameDate = new Date(seasonRecord.next_game_date + 'T12:00:00Z')
      const dayName = isToday ? 'Today' : gameDate.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'America/Chicago' })
      const monthDay = gameDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'America/Chicago' })

      // Show kickoff time in Central Time
      // Per SM_INTEGRATION_GUIDE: Database stores times in Central Time already
      const timeStr = seasonRecord.next_game_time ? formatTimeCT(seasonRecord.next_game_time) : 'TBD'

      // Format opponent - use common abbreviations (LA instead of LAR, etc.)
      const opponentAbbrev = formatOpponentAbbrev(seasonRecord.next_opponent || 'TBD')

      // Format weather display (temp + wind if available)
      const weatherDisplay = seasonRecord.next_game_temp !== null
        ? `${Math.round(seasonRecord.next_game_temp)}°F`
        : null

      nextGame = {
        opponent: `${seasonRecord.next_game_home ? 'vs' : '@'} ${opponentAbbrev}`,
        opponentFull: seasonRecord.next_opponent_full,
        date: dayName,
        fullDate: monthDay,
        time: timeStr,
        temp: seasonRecord.next_game_temp,
        wind: seasonRecord.next_game_wind,
        weather: weatherDisplay,
        spread: seasonRecord.next_game_spread,
        isToday,
      }
    }

    // Check for live game - look for today's game that's within game window

    // Query for today's game that might be live
    const { data: todayGame } = await datalabAdmin
      .from('bears_games_master')
      .select('*')
      .eq('game_date', todayCT)
      .single()

    let liveGame = null
    if (todayGame) {
      // Check if we're within game window (1hr before to 4hrs after kickoff)
      const gameTime = todayGame.game_time || '12:00:00'
      const [gameHours, gameMinutes] = gameTime.split(':').map(Number)

      // Get current time in Central
      const nowDate = new Date(nowCT)
      const currentMinutes = nowDate.getHours() * 60 + nowDate.getMinutes()
      const gameStartMinutes = gameHours * 60 + gameMinutes

      const minutesBefore = currentMinutes - gameStartMinutes
      const isWithinGameWindow = minutesBefore >= -60 && minutesBefore <= 240 // 1hr before to 4hrs after

      // If within window and game has scores (in progress or finished)
      if (isWithinGameWindow && todayGame.bears_score !== null) {
        // Check if game is actually live (not finished)
        const isFinished = todayGame.bears_win !== null
        if (!isFinished) {
          liveGame = {
            opponent: todayGame.opponent,
            opponentFull: todayGame.opponent_full_name,
            bearsScore: todayGame.bears_score,
            opponentScore: todayGame.opponent_score,
            quarter: todayGame.quarter || 1,
            clock: todayGame.clock || '--:--',
            possession: todayGame.possession,
            isHome: todayGame.is_bears_home,
          }
        }
      }
    }

    // Get last completed game from bears_games_master
    // A completed game must have: non-null score, non-null result, and NOT a 0-0 score
    const { data: lastGameData } = await datalabAdmin
      .from('bears_games_master')
      .select('opponent, opponent_full_name, bears_score, opponent_score, bears_win, week, game_type, game_date')
      .not('bears_score', 'is', null)
      .not('bears_win', 'is', null) // Only completed games
      .lt('game_date', todayCT) // Must be before today (not today's game)
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
        week: lastGameData.week,
        gameType: lastGameData.game_type,
      }
    }

    return NextResponse.json({
      record,
      regularRecord: seasonRecord?.regular_season_record,
      postseasonRecord: seasonRecord?.postseason_record,
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

// Format time for display (already in Central Time per SM_INTEGRATION_GUIDE)
// Input: "17:30:00" (HH:MM:SS in CT)
// Output: "5:30 PM CT"
function formatTimeCT(timeStr: string): string {
  const [hours, minutes] = timeStr.split(':').map(Number)
  const hour12 = hours % 12 || 12
  const ampm = hours >= 12 ? 'PM' : 'AM'
  const minStr = minutes.toString().padStart(2, '0')
  return `${hour12}:${minStr} ${ampm} CT`
}

// Format opponent abbreviation to common display format
function formatOpponentAbbrev(abbrev: string): string {
  const abbrevMap: Record<string, string> = {
    'LAR': 'LA',      // Los Angeles Rams -> LA
    'LAC': 'LAC',     // Los Angeles Chargers stays LAC
    'SFO': 'SF',      // San Francisco -> SF
    'SF': 'SF',
    'GNB': 'GB',      // Green Bay -> GB
    'GB': 'GB',
    'NWE': 'NE',      // New England -> NE
    'NE': 'NE',
    'TAM': 'TB',      // Tampa Bay -> TB
    'TB': 'TB',
    'KAN': 'KC',      // Kansas City -> KC
    'KC': 'KC',
    'NOR': 'NO',      // New Orleans -> NO
    'NO': 'NO',
    'LVR': 'LV',      // Las Vegas Raiders -> LV
    'LV': 'LV',
  }
  return abbrevMap[abbrev] || abbrev
}
