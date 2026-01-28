/**
 * Alert Discovery Engine
 *
 * Polls ESPN free APIs and RSS feeds to detect Chicago sports events
 * that should trigger push notifications. Returns AlertEvent objects
 * for the orchestrator to filter and send.
 */

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface GameState {
  gameId: string
  sport: 'nfl' | 'nba' | 'mlb' | 'nhl' | 'mls' | 'wnba'
  homeTeam: string
  awayTeam: string
  homeScore: number
  awayScore: number
  period: number
  clock: string
  status: 'pre' | 'in' | 'post'
  chicagoTeamId: string | null
  lastUpdated: Date
}

export interface AlertEvent {
  type: 'SCORE_CHANGE' | 'GAME_START' | 'GAME_END' | 'INJURY' | 'TRADE' |
        'CLOSE_GAME' | 'OVERTIME' | 'BREAKING_NEWS' | 'ROSTER_MOVE'
  gameId?: string
  sport?: string
  team: string
  title: string
  body: string
  data: Record<string, any>
  priority: 'high' | 'normal' | 'low'
  timestamp: Date
}

// ═══════════════════════════════════════════════════════════════
// ESPN FREE API ENDPOINTS
// ═══════════════════════════════════════════════════════════════

const ESPN_ENDPOINTS: Record<string, string> = {
  nfl: 'https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard',
  nba: 'https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard',
  mlb: 'https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/scoreboard',
  nhl: 'https://site.api.espn.com/apis/site/v2/sports/hockey/nhl/scoreboard',
}

const CHICAGO_TEAM_IDS: Record<string, { abbreviation: string; name: string; id: string }> = {
  nfl: { abbreviation: 'CHI', name: 'Bears', id: 'bears' },
  nba: { abbreviation: 'CHI', name: 'Bulls', id: 'bulls' },
  nhl: { abbreviation: 'CHI', name: 'Blackhawks', id: 'blackhawks' },
}

// MLB has two Chicago teams
const CHICAGO_MLB_TEAMS = [
  { abbreviation: 'CHC', name: 'Cubs', id: 'cubs' },
  { abbreviation: 'CWS', name: 'White Sox', id: 'whitesox' },
]

const RSS_FEEDS: Record<string, string> = {
  espn_nfl: 'https://www.espn.com/espn/rss/nfl/news',
  espn_nba: 'https://www.espn.com/espn/rss/nba/news',
  espn_mlb: 'https://www.espn.com/espn/rss/mlb/news',
  espn_nhl: 'https://www.espn.com/espn/rss/nhl/news',
  bears: 'https://www.chicagobears.com/news/rss',
  cubs: 'https://www.mlb.com/cubs/feeds/news/rss.xml',
  whitesox: 'https://www.mlb.com/whitesox/feeds/news/rss.xml',
}

// ═══════════════════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════════════════

const gameStates: Map<string, GameState> = new Map()
const processedRSSItems: Set<string> = new Set()

// ═══════════════════════════════════════════════════════════════
// MAIN ENTRY POINT
// ═══════════════════════════════════════════════════════════════

export async function discoverAlerts(): Promise<AlertEvent[]> {
  const alerts: AlertEvent[] = []

  try {
    const scoreAlerts = await checkScoreUpdates()
    alerts.push(...scoreAlerts)

    const newsAlerts = await checkNewsUpdates()
    alerts.push(...newsAlerts)

    console.log(`[AlertEngine] Discovered ${alerts.length} potential alerts`)
  } catch (error) {
    console.error('[AlertEngine] Error discovering alerts:', error)
  }

  return alerts
}

// ═══════════════════════════════════════════════════════════════
// SCORE CHECKING
// ═══════════════════════════════════════════════════════════════

async function checkScoreUpdates(): Promise<AlertEvent[]> {
  const alerts: AlertEvent[] = []

  for (const [sport, url] of Object.entries(ESPN_ENDPOINTS)) {
    try {
      const response = await fetch(url, {
        headers: { 'Accept': 'application/json' },
        cache: 'no-store',
      })

      if (!response.ok) continue

      const data = await response.json()

      for (const event of data.events || []) {
        const gameAlert = processGameEvent(event, sport)
        if (gameAlert) alerts.push(gameAlert)
      }
    } catch (error) {
      console.error(`[ESPN] Error fetching ${sport}:`, error)
    }
  }

  return alerts
}

function processGameEvent(event: any, sport: string): AlertEvent | null {
  const competition = event.competitions?.[0]
  if (!competition) return null

  const competitors = competition.competitors || []
  const homeTeam = competitors.find((c: any) => c.homeAway === 'home')
  const awayTeam = competitors.find((c: any) => c.homeAway === 'away')
  if (!homeTeam || !awayTeam) return null

  const chicagoTeam = findChicagoTeam(homeTeam, awayTeam, sport)
  if (!chicagoTeam) return null

  const gameKey = `${sport}-${event.id}`
  const previousState = gameStates.get(gameKey)

  const currentState: GameState = {
    gameId: event.id,
    sport: sport as GameState['sport'],
    homeTeam: homeTeam.team.displayName,
    awayTeam: awayTeam.team.displayName,
    homeScore: parseInt(homeTeam.score) || 0,
    awayScore: parseInt(awayTeam.score) || 0,
    period: competition.status?.period || 0,
    clock: competition.status?.displayClock || '',
    status: competition.status?.type?.state || 'pre',
    chicagoTeamId: chicagoTeam.id,
    lastUpdated: new Date(),
  }

  gameStates.set(gameKey, currentState)

  if (!previousState) {
    if (currentState.status === 'in') return createGameStartAlert(currentState)
    return null
  }

  return detectStateChange(previousState, currentState, gameKey)
}

function findChicagoTeam(homeTeam: any, awayTeam: any, sport: string) {
  if (sport === 'mlb') {
    for (const t of CHICAGO_MLB_TEAMS) {
      if (homeTeam.team.abbreviation === t.abbreviation || awayTeam.team.abbreviation === t.abbreviation) {
        return t
      }
    }
    return null
  }

  const chicago = CHICAGO_TEAM_IDS[sport]
  if (!chicago) return null

  if (homeTeam.team.abbreviation === chicago.abbreviation ||
      awayTeam.team.abbreviation === chicago.abbreviation) {
    return chicago
  }

  return null
}

function detectStateChange(prev: GameState, curr: GameState, _gameKey: string): AlertEvent | null {
  if (prev.status !== 'post' && curr.status === 'post') return createGameEndAlert(curr)
  if (prev.status === 'pre' && curr.status === 'in') return createGameStartAlert(curr)
  if (prev.homeScore !== curr.homeScore || prev.awayScore !== curr.awayScore) return createScoreChangeAlert(prev, curr)
  if (isCloseGame(curr) && !isCloseGame(prev)) return createCloseGameAlert(curr)
  if (curr.period > getRegulationPeriods(curr.sport) && prev.period <= getRegulationPeriods(curr.sport)) return createOvertimeAlert(curr)
  return null
}

// ═══════════════════════════════════════════════════════════════
// ALERT CREATORS
// ═══════════════════════════════════════════════════════════════

function createScoreChangeAlert(prev: GameState, curr: GameState): AlertEvent {
  const pointsScored = (curr.homeScore + curr.awayScore) - (prev.homeScore + prev.awayScore)
  const scoringTeam = curr.homeScore > prev.homeScore ? curr.homeTeam : curr.awayTeam

  return {
    type: 'SCORE_CHANGE',
    gameId: curr.gameId,
    sport: curr.sport,
    team: curr.chicagoTeamId || '',
    title: `${scoringTeam} ${getScoreVerb(curr.sport, pointsScored)}!`,
    body: `${curr.awayTeam} ${curr.awayScore}, ${curr.homeTeam} ${curr.homeScore} - ${formatGameClock(curr)}`,
    data: { gameId: curr.gameId, homeScore: curr.homeScore, awayScore: curr.awayScore, scoringTeam, pointsScored },
    priority: 'high',
    timestamp: new Date(),
  }
}

function createGameStartAlert(game: GameState): AlertEvent {
  return {
    type: 'GAME_START',
    gameId: game.gameId,
    sport: game.sport,
    team: game.chicagoTeamId || '',
    title: `${game.awayTeam} vs ${game.homeTeam}`,
    body: 'Game starting now!',
    data: { gameId: game.gameId },
    priority: 'normal',
    timestamp: new Date(),
  }
}

function createGameEndAlert(game: GameState): AlertEvent {
  const chicagoWon = didChicagoWin(game)
  return {
    type: 'GAME_END',
    gameId: game.gameId,
    sport: game.sport,
    team: game.chicagoTeamId || '',
    title: `FINAL: ${game.awayTeam} ${game.awayScore}, ${game.homeTeam} ${game.homeScore}`,
    body: chicagoWon ? 'Victory!' : 'Game over.',
    data: { gameId: game.gameId, homeScore: game.homeScore, awayScore: game.awayScore, chicagoWon },
    priority: 'high',
    timestamp: new Date(),
  }
}

function createCloseGameAlert(game: GameState): AlertEvent {
  return {
    type: 'CLOSE_GAME',
    gameId: game.gameId,
    sport: game.sport,
    team: game.chicagoTeamId || '',
    title: 'Close game alert!',
    body: `${game.awayTeam} ${game.awayScore}, ${game.homeTeam} ${game.homeScore} - ${formatGameClock(game)}`,
    data: { gameId: game.gameId },
    priority: 'high',
    timestamp: new Date(),
  }
}

function createOvertimeAlert(game: GameState): AlertEvent {
  return {
    type: 'OVERTIME',
    gameId: game.gameId,
    sport: game.sport,
    team: game.chicagoTeamId || '',
    title: 'OVERTIME!',
    body: `${game.awayTeam} vs ${game.homeTeam} heading to OT!`,
    data: { gameId: game.gameId },
    priority: 'high',
    timestamp: new Date(),
  }
}

// ═══════════════════════════════════════════════════════════════
// RSS NEWS CHECKING
// ═══════════════════════════════════════════════════════════════

async function checkNewsUpdates(): Promise<AlertEvent[]> {
  const alerts: AlertEvent[] = []

  for (const [source, url] of Object.entries(RSS_FEEDS)) {
    try {
      const response = await fetch(url)
      const text = await response.text()
      const items = parseRSSItems(text)

      for (const item of items) {
        if (processedRSSItems.has(item.link)) continue
        processedRSSItems.add(item.link)

        if (!isChicagoRelevant(item.title + ' ' + item.description)) continue

        const newsAlert = classifyNewsItem(item, source)
        if (newsAlert) alerts.push(newsAlert)
      }
    } catch (error) {
      console.error(`[RSS] Error fetching ${source}:`, error)
    }
  }

  return alerts
}

function parseRSSItems(xml: string): Array<{ title: string; link: string; description: string }> {
  const items: Array<{ title: string; link: string; description: string }> = []
  const itemRegex = /<item>([\s\S]*?)<\/item>/g
  let match

  while ((match = itemRegex.exec(xml)) !== null) {
    const itemXml = match[1]
    const title = itemXml.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1] ||
                  itemXml.match(/<title>(.*?)<\/title>/)?.[1] || ''
    const link = itemXml.match(/<link>(.*?)<\/link>/)?.[1] || ''
    const description = itemXml.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/)?.[1] ||
                        itemXml.match(/<description>(.*?)<\/description>/)?.[1] || ''

    items.push({ title, link, description })
  }

  return items.slice(0, 10)
}

function isChicagoRelevant(text: string): boolean {
  const keywords = [
    'bears', 'chicago bears', 'bulls', 'chicago bulls',
    'cubs', 'chicago cubs', 'white sox', 'whitesox', 'blackhawks',
    'chicago blackhawks', 'soldier field', 'wrigley', 'united center',
  ]
  const lower = text.toLowerCase()
  return keywords.some(k => lower.includes(k))
}

function classifyNewsItem(item: { title: string; description: string; link: string }, source: string): AlertEvent | null {
  const text = (item.title + ' ' + item.description).toLowerCase()

  if (text.includes('injury') || text.includes('injured') || text.includes('questionable') ||
      text.includes('doubtful') || text.includes('out for') || text.includes('surgery')) {
    return {
      type: 'INJURY',
      team: detectTeamFromText(text),
      title: 'Injury Update',
      body: item.title.slice(0, 100),
      data: { link: item.link, source },
      priority: 'high',
      timestamp: new Date(),
    }
  }

  if (text.includes('trade') || text.includes('sign') || text.includes('acquire') ||
      text.includes('deal') || text.includes('contract')) {
    return {
      type: 'TRADE',
      team: detectTeamFromText(text),
      title: 'Transaction Alert',
      body: item.title.slice(0, 100),
      data: { link: item.link, source },
      priority: 'high',
      timestamp: new Date(),
    }
  }

  if (text.includes('breaking') || text.includes('just in') || text.includes('report:')) {
    return {
      type: 'BREAKING_NEWS',
      team: detectTeamFromText(text),
      title: 'Breaking News',
      body: item.title.slice(0, 100),
      data: { link: item.link, source },
      priority: 'high',
      timestamp: new Date(),
    }
  }

  return null
}

function detectTeamFromText(text: string): string {
  if (text.includes('bears')) return 'bears'
  if (text.includes('bulls')) return 'bulls'
  if (text.includes('cubs')) return 'cubs'
  if (text.includes('white sox') || text.includes('whitesox')) return 'whitesox'
  if (text.includes('blackhawks')) return 'blackhawks'
  return 'chicago'
}

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════

function getScoreVerb(sport: string, points: number): string {
  if (sport === 'nfl') {
    if (points >= 6) return 'TOUCHDOWN'
    if (points === 3) return 'FIELD GOAL'
    if (points === 2) return 'SAFETY'
    return 'scores'
  }
  if (sport === 'nhl') return 'GOAL'
  if (sport === 'mlb') return 'scores'
  return 'scores'
}

function formatGameClock(game: GameState): string {
  const periodNames: Record<string, string[]> = {
    nfl: ['1st', '2nd', '3rd', '4th', 'OT'],
    nba: ['1st', '2nd', '3rd', '4th', 'OT'],
    nhl: ['1st', '2nd', '3rd', 'OT'],
    wnba: ['1st', '2nd', '3rd', '4th', 'OT'],
  }

  if (game.sport === 'mlb') {
    return `${game.period % 2 === 1 ? 'Top' : 'Bot'} ${Math.ceil(game.period / 2)}`
  }

  const periods = periodNames[game.sport] || ['Q1', 'Q2', 'Q3', 'Q4']
  const periodName = periods[game.period - 1] || `P${game.period}`
  return `${periodName} ${game.clock}`
}

function isCloseGame(game: GameState): boolean {
  const finalPeriod = getRegulationPeriods(game.sport)
  const scoreDiff = Math.abs(game.homeScore - game.awayScore)

  if (game.period < finalPeriod) return false

  if (game.sport === 'nfl') return scoreDiff <= 8
  if (game.sport === 'nba' || game.sport === 'wnba') return scoreDiff <= 10
  if (game.sport === 'nhl') return scoreDiff <= 1
  if (game.sport === 'mlb') return scoreDiff <= 2

  return scoreDiff <= 5
}

function getRegulationPeriods(sport: string): number {
  if (sport === 'nfl' || sport === 'nba' || sport === 'wnba') return 4
  if (sport === 'nhl') return 3
  if (sport === 'mlb') return 9
  return 4
}

function didChicagoWin(game: GameState): boolean {
  const isHome = game.chicagoTeamId &&
    game.homeTeam.toLowerCase().includes(game.chicagoTeamId)

  return isHome ? game.homeScore > game.awayScore : game.awayScore > game.homeScore
}
