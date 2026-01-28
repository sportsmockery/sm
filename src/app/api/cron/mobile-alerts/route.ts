import { NextRequest, NextResponse } from 'next/server'

export const maxDuration = 30
export const dynamic = 'force-dynamic'

// ═══════════════════════════════════════════════════════════════
// ESPN FREE API ENDPOINTS
// ═══════════════════════════════════════════════════════════════

const ESPN_ENDPOINTS: Record<string, string> = {
  nfl: 'https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard',
  nba: 'https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard',
  mlb: 'https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/scoreboard',
  nhl: 'https://site.api.espn.com/apis/site/v2/sports/hockey/nhl/scoreboard',
}

const CHICAGO_ABBREVS = ['CHI', 'CHC', 'CWS']

interface GameState {
  gameId: string
  sport: string
  homeTeam: string
  awayTeam: string
  homeScore: number
  awayScore: number
  period: number
  clock: string
  status: string
  chicagoTeamId: string
}

interface AlertEvent {
  type: string
  team: string
  title: string
  body: string
  data: Record<string, any>
  priority: 'high' | 'normal' | 'low'
  gameId?: string
}

// In-memory state (resets on cold start, which is fine for per-minute cron)
const previousStates: Map<string, GameState> = new Map()
const alertsSentThisHour: Map<string, number> = new Map()
const lastAlertTime: Map<string, number> = new Map()

const MAX_ALERTS_PER_GAME = 15
const MAX_ALERTS_PER_HOUR = 30
const MIN_ALERT_GAP_MS = 60000

/**
 * GET /api/cron/mobile-alerts
 *
 * Polls ESPN free APIs for Chicago team game updates.
 * Sends targeted push notifications via OneSignal when scores change,
 * games start/end, or close game situations occur.
 *
 * Runs every minute via Vercel Cron.
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const alerts: AlertEvent[] = []

    // Check all sports
    for (const [sport, url] of Object.entries(ESPN_ENDPOINTS)) {
      try {
        const response = await fetch(url, {
          headers: { Accept: 'application/json' },
          cache: 'no-store',
        })
        if (!response.ok) continue

        const data = await response.json()

        for (const event of data.events || []) {
          const competition = event.competitions?.[0]
          if (!competition) continue

          const competitors = competition.competitors || []
          const home = competitors.find((c: any) => c.homeAway === 'home')
          const away = competitors.find((c: any) => c.homeAway === 'away')
          if (!home || !away) continue

          // Only Chicago games
          const isChicago = CHICAGO_ABBREVS.includes(home.team.abbreviation) ||
                            CHICAGO_ABBREVS.includes(away.team.abbreviation)
          if (!isChicago) continue

          const chicagoTeamId = getChicagoTeamId(home.team.abbreviation, away.team.abbreviation, sport)
          const gameKey = `${sport}-${event.id}`

          const current: GameState = {
            gameId: event.id,
            sport,
            homeTeam: home.team.displayName,
            awayTeam: away.team.displayName,
            homeScore: parseInt(home.score) || 0,
            awayScore: parseInt(away.score) || 0,
            period: competition.status?.period || 0,
            clock: competition.status?.displayClock || '',
            status: competition.status?.type?.state || 'pre',
            chicagoTeamId,
          }

          const prev = previousStates.get(gameKey)
          previousStates.set(gameKey, current)

          if (!prev) {
            if (current.status === 'in') {
              alerts.push({
                type: 'GAME_START',
                team: chicagoTeamId,
                title: `${current.awayTeam} vs ${current.homeTeam}`,
                body: 'Game starting now!',
                data: { gameId: current.gameId },
                priority: 'normal',
                gameId: current.gameId,
              })
            }
            continue
          }

          // Game ended
          if (prev.status !== 'post' && current.status === 'post') {
            alerts.push({
              type: 'GAME_END',
              team: chicagoTeamId,
              title: `FINAL: ${current.awayTeam} ${current.awayScore}, ${current.homeTeam} ${current.homeScore}`,
              body: didChicagoWin(current) ? 'Victory!' : 'Game over.',
              data: { gameId: current.gameId, homeScore: current.homeScore, awayScore: current.awayScore },
              priority: 'high',
              gameId: current.gameId,
            })
          }
          // Game started
          else if (prev.status === 'pre' && current.status === 'in') {
            alerts.push({
              type: 'GAME_START',
              team: chicagoTeamId,
              title: `${current.awayTeam} vs ${current.homeTeam}`,
              body: 'Game starting now!',
              data: { gameId: current.gameId },
              priority: 'normal',
              gameId: current.gameId,
            })
          }
          // Score changed
          else if (prev.homeScore !== current.homeScore || prev.awayScore !== current.awayScore) {
            const scoringTeam = current.homeScore > prev.homeScore ? current.homeTeam : current.awayTeam
            const points = (current.homeScore + current.awayScore) - (prev.homeScore + prev.awayScore)
            alerts.push({
              type: 'SCORE_CHANGE',
              team: chicagoTeamId,
              title: `${scoringTeam} ${getScoreVerb(sport, points)}!`,
              body: `${current.awayTeam} ${current.awayScore}, ${current.homeTeam} ${current.homeScore}`,
              data: { gameId: current.gameId, scoringTeam },
              priority: 'high',
              gameId: current.gameId,
            })
          }
        }
      } catch (err) {
        console.error(`[mobile-alerts] ESPN ${sport} error:`, err)
      }
    }

    // Filter alerts (anti-spam)
    const filtered = alerts.filter(alert => {
      const key = `${alert.team}-${alert.gameId || 'news'}`
      const count = alertsSentThisHour.get(key) || 0
      if (count >= MAX_ALERTS_PER_GAME) return false

      const last = lastAlertTime.get(key) || 0
      if (Date.now() - last < MIN_ALERT_GAP_MS) return false

      const total = Array.from(alertsSentThisHour.values()).reduce((s, c) => s + c, 0)
      if (total >= MAX_ALERTS_PER_HOUR) return false

      return true
    })

    // Send via OneSignal
    let sent = 0
    const oneSignalAppId = process.env.ONESIGNAL_APP_ID
    const oneSignalKey = process.env.ONESIGNAL_REST_API_KEY

    if (oneSignalAppId && oneSignalKey && filtered.length > 0) {
      for (const alert of filtered) {
        try {
          const filters: any[] = [
            { field: 'tag', key: 'notifications_enabled', value: 'true' },
          ]
          if (alert.team && alert.team !== 'chicago') {
            filters.push({ operator: 'AND' })
            filters.push({ field: 'tag', key: `follows_${alert.team}`, value: 'true' })
          }

          const res = await fetch('https://onesignal.com/api/v1/notifications', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Basic ${oneSignalKey}`,
            },
            body: JSON.stringify({
              app_id: oneSignalAppId,
              filters,
              headings: { en: alert.title },
              contents: { en: alert.body },
              data: { type: alert.type, team: alert.team, ...alert.data },
              ttl: 3600,
              priority: alert.priority === 'high' ? 10 : 5,
            }),
          })

          const result = await res.json()
          if (!result.errors) {
            sent++
            const key = `${alert.team}-${alert.gameId || 'news'}`
            alertsSentThisHour.set(key, (alertsSentThisHour.get(key) || 0) + 1)
            lastAlertTime.set(key, Date.now())
          }
        } catch (err) {
          console.error('[mobile-alerts] OneSignal error:', err)
        }
      }
    }

    return NextResponse.json({
      discovered: alerts.length,
      filtered: filtered.length,
      sent,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[mobile-alerts] Cron error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

function getChicagoTeamId(homeAbbr: string, awayAbbr: string, sport: string): string {
  const abbr = CHICAGO_ABBREVS.includes(homeAbbr) ? homeAbbr : awayAbbr
  if (abbr === 'CHC') return 'cubs'
  if (abbr === 'CWS') return 'whitesox'
  // CHI maps to different teams by sport
  if (sport === 'nfl') return 'bears'
  if (sport === 'nba') return 'bulls'
  if (sport === 'nhl') return 'blackhawks'
  return 'chicago'
}

function getScoreVerb(sport: string, points: number): string {
  if (sport === 'nfl') {
    if (points >= 6) return 'TOUCHDOWN'
    if (points === 3) return 'FIELD GOAL'
    if (points === 2) return 'SAFETY'
    return 'scores'
  }
  if (sport === 'nhl') return 'GOAL'
  return 'scores'
}

function didChicagoWin(game: GameState): boolean {
  const isHome = CHICAGO_ABBREVS.some(a =>
    game.homeTeam.toLowerCase().includes(game.chicagoTeamId)
  )
  return isHome ? game.homeScore > game.awayScore : game.awayScore > game.homeScore
}
