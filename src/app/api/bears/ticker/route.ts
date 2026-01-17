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

    // Format record - NEVER combine regular and postseason
    // Show as "11-6" or "11-6, 1-0 Playoffs"
    let record = seasonRecord?.regular_season_record || '--'
    const postseasonRecord = seasonRecord?.postseason_record
    if (postseasonRecord && postseasonRecord !== '0-0') {
      record = `${record}, ${postseasonRecord} Playoffs`
    }

    // Format next game from bears_season_record
    let nextGame = null
    if (seasonRecord?.next_game_date) {
      // Parse date and time (stored in Central Time)
      const gameDate = new Date(seasonRecord.next_game_date + 'T' + (seasonRecord.next_game_time || '12:00:00'))
      const dayName = gameDate.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'America/Chicago' })
      const monthDay = gameDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'America/Chicago' })

      // Format time in Central Time (CT)
      const timeStr = seasonRecord.next_game_time
        ? formatTimeCT(seasonRecord.next_game_time)
        : 'TBD'

      nextGame = {
        opponent: `${seasonRecord.next_game_home ? 'vs' : '@'} ${seasonRecord.next_opponent || 'TBD'}`,
        opponentFull: seasonRecord.next_opponent_full,
        date: dayName,
        fullDate: monthDay,
        time: timeStr,
        temp: seasonRecord.next_game_temp,
        spread: seasonRecord.next_game_spread,
      }
    }

    // Check for live game - look for today's game that's within game window
    // Games are stored in Central Time
    const nowCT = new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' })
    const todayCT = new Date(nowCT).toISOString().split('T')[0]

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
    const { data: lastGameData } = await datalabAdmin
      .from('bears_games_master')
      .select('opponent, opponent_full_name, bears_score, opponent_score, bears_win, week, game_type')
      .not('bears_score', 'is', null)
      .not('bears_win', 'is', null) // Only completed games
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

// Format time from HH:MM:SS to readable CT format
function formatTimeCT(timeStr: string): string {
  const [hours, minutes] = timeStr.split(':').map(Number)
  const period = hours >= 12 ? 'PM' : 'AM'
  const hour12 = hours % 12 || 12
  return `${hour12}:${minutes.toString().padStart(2, '0')} ${period} CT`
}
