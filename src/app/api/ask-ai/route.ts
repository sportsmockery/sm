import { NextRequest, NextResponse } from 'next/server'

/**
 * Ask AI API Route
 *
 * This route proxies requests to the SM Data Lab query endpoint.
 * The Data Lab handles all AI processing, SQL generation, and web fallbacks.
 *
 * By calling the Data Lab API directly:
 * 1. Both sites use the exact same AI model and training
 * 2. Updates to Data Lab's prompts automatically apply here
 * 3. Data gaps logged in Data Lab include queries from this site
 * 4. Consistent behavior across both platforms
 */

const DATALAB_API_URL = process.env.DATALAB_API_URL || 'https://datalab.sportsmockery.com'

/**
 * Team detection patterns and their sport mappings
 */
const TEAM_PATTERNS: { pattern: RegExp; team: string; sport: string }[] = [
  { pattern: /\b(bears|chicago bears|da bears)\b/i, team: 'bears', sport: 'nfl' },
  { pattern: /\b(bulls|chicago bulls)\b/i, team: 'bulls', sport: 'nba' },
  { pattern: /\b(blackhawks|hawks|chicago blackhawks)\b/i, team: 'blackhawks', sport: 'nhl' },
  { pattern: /\b(cubs|chicago cubs|cubbies)\b/i, team: 'cubs', sport: 'mlb' },
  { pattern: /\b(white sox|whitesox|sox|chicago white sox)\b/i, team: 'whitesox', sport: 'mlb' },
]

/**
 * Player to team mappings for common players
 */
const PLAYER_TEAM_MAP: { pattern: RegExp; team: string; sport: string }[] = [
  // Bears
  { pattern: /\b(caleb williams|williams)\b/i, team: 'bears', sport: 'nfl' },
  { pattern: /\b(dj moore|moore)\b/i, team: 'bears', sport: 'nfl' },
  { pattern: /\b(rome odunze|odunze)\b/i, team: 'bears', sport: 'nfl' },
  { pattern: /\b(montez sweat|sweat)\b/i, team: 'bears', sport: 'nfl' },
  // Bulls
  { pattern: /\b(demar derozan|derozan)\b/i, team: 'bulls', sport: 'nba' },
  { pattern: /\b(zach lavine|lavine)\b/i, team: 'bulls', sport: 'nba' },
  { pattern: /\b(coby white)\b/i, team: 'bulls', sport: 'nba' },
  // Blackhawks
  { pattern: /\b(connor bedard|bedard)\b/i, team: 'blackhawks', sport: 'nhl' },
  // Cubs
  { pattern: /\b(dansby swanson|swanson)\b/i, team: 'cubs', sport: 'mlb' },
  { pattern: /\b(cody bellinger|bellinger)\b/i, team: 'cubs', sport: 'mlb' },
  // White Sox
  { pattern: /\b(luis robert|robert)\b/i, team: 'whitesox', sport: 'mlb' },
]

/**
 * Detect team and sport from query text
 */
function detectTeamAndSport(query: string): { team: string | null; sport: string | null } {
  // First check explicit team mentions
  for (const { pattern, team, sport } of TEAM_PATTERNS) {
    if (pattern.test(query)) {
      return { team, sport }
    }
  }
  // Then check player names
  for (const { pattern, team, sport } of PLAYER_TEAM_MAP) {
    if (pattern.test(query)) {
      return { team, sport }
    }
  }
  return { team: null, sport: null }
}

/**
 * Extract year from query (e.g., "2025 season", "last year", "this year")
 */
function extractYear(query: string): number | null {
  // Look for explicit year mention (2020-2030 range)
  const yearMatch = query.match(/\b(202[0-9])\b/)
  if (yearMatch) {
    return parseInt(yearMatch[1], 10)
  }

  // Handle relative time references
  const currentYear = new Date().getFullYear()
  const lowerQuery = query.toLowerCase()

  if (lowerQuery.includes('this year') || lowerQuery.includes('this season') || lowerQuery.includes('current season')) {
    return currentYear
  }
  if (lowerQuery.includes('last year') || lowerQuery.includes('last season') || lowerQuery.includes('previous season')) {
    return currentYear - 1
  }

  // Default to current year if no year specified
  return currentYear
}

/**
 * Normalize season start year based on sport
 * - NFL/MLB: season_start_year = requestedYear directly
 * - NBA/NHL: 2025 and 2026 both map to 2025 for 2025-26 season
 */
function normalizeSeasonYear(requestedYear: number, sport: string | null): number {
  if (sport === 'nba' || sport === 'nhl') {
    // NBA/NHL seasons span two calendar years (e.g., 2025-26 season)
    // Both 2025 and 2026 should map to season_start_year = 2025
    const currentYear = new Date().getFullYear()
    const currentMonth = new Date().getMonth() // 0-11

    // If we're in the first half of the year (Jan-Jun), the "current" season started previous year
    // If we're in the second half (Jul-Dec), the "current" season starts this year
    const currentSeasonStart = currentMonth < 6 ? currentYear - 1 : currentYear

    // If requestedYear is the current or next year, map to current season start
    if (requestedYear === currentYear || requestedYear === currentYear + 1) {
      return currentSeasonStart
    }
    // For past years, take the lower year (e.g., asking about 2024 means 2023-24 season)
    return requestedYear
  }

  // NFL and MLB: season year is straightforward
  return requestedYear
}

/**
 * Detect if query is about schedules, records, or streaks (needs game type separation)
 */
function needsGameTypeContext(query: string): boolean {
  const patterns = [
    /\b(schedule|schedules)\b/i,
    /\b(record|records)\b/i,
    /\b(streak|streaks|win streak|losing streak)\b/i,
    /\b(standings|division|playoff)\b/i,
    /\b(game by game|week by week)\b/i,
    /\b(preseason|regular season|postseason|playoffs)\b/i,
  ]
  return patterns.some(p => p.test(query))
}

/**
 * Transform DataLab chart data format to the format expected by DataVisualization component.
 *
 * DataLab format: { type, title, columns, rows (array of objects), summary }
 * Component format: { type, title, labels, datasets (array with label and data array) }
 */
function transformChartData(dataLabChart: {
  type: string
  title?: string
  columns?: string[]
  rows?: Record<string, unknown>[]
  labels?: string[]
  datasets?: unknown[]
}) {
  // If already in the expected format, return as-is
  if (dataLabChart.labels && dataLabChart.datasets) {
    return dataLabChart
  }

  // Transform from DataLab format (columns/rows) to component format (labels/datasets)
  if (!dataLabChart.columns || !dataLabChart.rows || dataLabChart.rows.length === 0) {
    return null
  }

  const columns = dataLabChart.columns
  const rows = dataLabChart.rows

  // First column is typically the label column (e.g., "Type", "Player", etc.)
  const labelColumn = columns[0]
  const dataColumns = columns.slice(1)

  // Extract labels from the first column of each row
  const labels = rows.map(row => String(row[labelColumn] || ''))

  // Create datasets for each data column
  const datasets = dataColumns.map(colName => ({
    label: colName,
    data: rows.map(row => {
      const val = row[colName]
      return typeof val === 'number' ? val : parseFloat(String(val)) || 0
    }),
  }))

  return {
    type: dataLabChart.type,
    title: dataLabChart.title,
    labels,
    datasets,
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { query, sessionId } = body

    if (!query || typeof query !== 'string' || query.trim().length < 3) {
      return NextResponse.json(
        { error: 'Query is required and must be at least 3 characters' },
        { status: 400 }
      )
    }

    console.log('Ask AI request:', query.slice(0, 100), sessionId ? `[session: ${sessionId}]` : '[new session]')

    // Build seasonContext for Data Lab
    const { team, sport } = detectTeamAndSport(query)
    const requestedYear = extractYear(query)
    const normalizedSeasonStartYear = requestedYear ? normalizeSeasonYear(requestedYear, sport) : null

    const seasonContext = (team && sport && requestedYear) ? {
      requestedYear,
      normalizedSeasonStartYear,
      team,
      sport,
    } : undefined

    // Build gameTypeContext if query involves schedules/records/streaks
    const gameTypeContext = needsGameTypeContext(query) ? {
      includePreseason: true,
      includeRegular: true,
      includePostseason: true,
      separatePhases: true,
    } : undefined

    console.log('Context:', { seasonContext, gameTypeContext })

    // Forward the request to Data Lab's query API
    const response = await fetch(`${DATALAB_API_URL}/api/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Pass along any auth if needed in the future
        'X-Source': 'sportsmockery.com',
      },
      body: JSON.stringify({
        query: query.trim(),
        sessionId: sessionId || undefined,
        seasonContext,
        gameTypeContext,
      }),
    })

    if (!response.ok) {
      console.error('Data Lab API error:', response.status, response.statusText)

      // Return a friendly error message
      return NextResponse.json({
        response: "I'm having trouble connecting to the data service right now. Please try again in a moment.",
        source: 'error',
        showSuggestions: true,
        suggestions: [
          "What's the Bears' record this season?",
          "Who leads the Bulls in scoring?",
          "Compare Caleb Williams to other rookie QBs"
        ]
      })
    }

    const data = await response.json()

    // Transform chart data to the format expected by the frontend component
    const transformedChartData = data.chartData ? transformChartData(data.chartData) : null

    // Return the Data Lab response
    return NextResponse.json({
      response: data.response,
      rowCount: data.rowCount,
      source: data.source,
      team: data.team,
      teamDisplayName: data.teamDisplayName,
      sport: data.sport,
      dataGapLogged: data.dataGapLogged,
      showSuggestions: data.showSuggestions,
      suggestions: data.suggestions,
      relatedArticles: data.relatedArticles,
      newsSummary: data.newsSummary,
      // Structured chart data for visualization (transformed to component format)
      chartData: transformedChartData,
      bonusInsight: data.bonusInsight,
      rawData: data.rawData,
      // Session data for follow-up context (pronoun resolution)
      sessionId: data.sessionId,
      sessionContext: data.sessionContext,
    })

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error('Ask AI error:', errorMessage, 'URL:', `${DATALAB_API_URL}/api/query`)

    // Provide more specific error feedback
    let userMessage = "I apologize, but I'm unable to process your question right now. Please try again later."

    if (errorMessage.includes('fetch failed') || errorMessage.includes('ECONNREFUSED') || errorMessage.includes('ENOTFOUND')) {
      userMessage = "I'm having trouble connecting to the data service. The service may be temporarily unavailable."
    } else if (errorMessage.includes('timeout') || errorMessage.includes('ETIMEDOUT')) {
      userMessage = "The request took too long to complete. Please try a simpler question or try again later."
    }

    return NextResponse.json({
      response: userMessage,
      source: 'error',
      showSuggestions: true,
      suggestions: [
        "What's the Bears' record this season?",
        "Who leads the Bulls in scoring?",
        "Cubs playoff chances this year?"
      ],
      // Include debug info in development
      debug: process.env.NODE_ENV === 'development' ? { error: errorMessage } : undefined
    })
  }
}

// Also support GET for simple queries via URL params
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')

  if (!query) {
    return NextResponse.json(
      { error: 'Query parameter "q" is required' },
      { status: 400 }
    )
  }

  // Convert to POST request
  const postRequest = new NextRequest(request.url, {
    method: 'POST',
    body: JSON.stringify({ query }),
  })

  return POST(postRequest)
}
