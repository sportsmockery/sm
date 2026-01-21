import { NextRequest, NextResponse } from 'next/server'
import {
  checkAICache,
  processExternalQueryResponse,
  generateDataKey,
} from '@/lib/ai-external-service'

/**
 * Ask AI API Route
 *
 * This route handles AI queries with the following flow:
 * 1. ALWAYS query Datalab first - this is the PRIMARY data source with all main tables
 * 2. If Datalab returns data from its tables (source: 'ai'), return it directly
 * 3. If Datalab uses external sources (web_fallback):
 *    a. Check if we have this cached in AI tables (supplementary cache)
 *    b. If cached, return cached data
 *    c. If not cached, log query, validate with 2+ sources, import to AI tables
 * 4. AI tables in /sm are SUPPLEMENTARY - they store externally-sourced data
 *    and join to Datalab tables via related_player_id, related_game_id, etc.
 *
 * Architecture:
 * - Datalab = Primary data (bears_players, bears_games, bears_player_stats, etc.)
 * - AI tables = Cache for external data that can join to Datalab tables
 */

const DATALAB_API_URL = process.env.DATALAB_API_URL || 'https://datalab.sportsmockery.com'

// Team detection patterns
const TEAM_PATTERNS: Record<string, { team: string; displayName: string }> = {
  bears: { team: 'bears', displayName: 'Chicago Bears' },
  bulls: { team: 'bulls', displayName: 'Chicago Bulls' },
  cubs: { team: 'cubs', displayName: 'Chicago Cubs' },
  'white sox': { team: 'whitesox', displayName: 'Chicago White Sox' },
  whitesox: { team: 'whitesox', displayName: 'Chicago White Sox' },
  blackhawks: { team: 'blackhawks', displayName: 'Chicago Blackhawks' },
  hawks: { team: 'blackhawks', displayName: 'Chicago Blackhawks' },
}

/**
 * Detect team from query string
 */
function detectTeamFromQuery(query: string): { team: string | null; displayName: string | null } {
  const normalizedQuery = query.toLowerCase()

  for (const [pattern, info] of Object.entries(TEAM_PATTERNS)) {
    if (normalizedQuery.includes(pattern)) {
      return info
    }
  }

  return { team: null, displayName: null }
}

/**
 * Try to parse structured data from AI response
 */
function tryParseDataFromResponse(response: string): Record<string, any> | null {
  try {
    // Try to detect if response contains structured data
    // Look for patterns like "X had Y yards" or stat-like information
    const data: Record<string, any> = {
      raw_response: response,
      extracted_at: new Date().toISOString(),
    }

    // Extract numbers and stats if present
    const numberPatterns = /(\d+(?:,\d{3})*(?:\.\d+)?)\s*(yards?|points?|touchdowns?|goals?|assists?|wins?|losses?|games?)/gi
    const matches = response.matchAll(numberPatterns)
    const stats: Record<string, number> = {}

    for (const match of matches) {
      const value = parseFloat(match[1].replace(/,/g, ''))
      const statType = match[2].toLowerCase().replace(/s$/, '') // Remove plural
      stats[statType] = value
    }

    if (Object.keys(stats).length > 0) {
      data.stats = stats
    }

    // Extract player names if mentioned
    const playerPattern = /(?:^|[^a-zA-Z])([A-Z][a-z]+ [A-Z][a-z]+)(?:[^a-zA-Z]|$)/g
    const playerMatches = response.matchAll(playerPattern)
    const players: string[] = []

    for (const match of playerMatches) {
      if (!players.includes(match[1])) {
        players.push(match[1])
      }
    }

    if (players.length > 0) {
      data.mentioned_players = players
    }

    return Object.keys(data).length > 2 ? data : null
  } catch {
    return null
  }
}

/**
 * Determine data type from query content
 */
function determineDataType(query: string): 'player_stat' | 'game_info' | 'roster' | 'news' | 'historical' | 'general' {
  const normalizedQuery = query.toLowerCase()

  if (/stats?|yards?|points?|touchdowns?|goals?|assists?|average|per game/i.test(normalizedQuery)) {
    return 'player_stat'
  }
  if (/game|score|won|lost|vs\.?|versus|played/i.test(normalizedQuery)) {
    return 'game_info'
  }
  if (/roster|lineup|starting|position|players?/i.test(normalizedQuery)) {
    return 'roster'
  }
  if (/news|rumor|trade|sign|contract|injury/i.test(normalizedQuery)) {
    return 'news'
  }
  if (/history|historical|all[- ]time|record|season \d{4}|\d{4} season/i.test(normalizedQuery)) {
    return 'historical'
  }

  return 'general'
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { query } = body

    if (!query || typeof query !== 'string' || query.trim().length < 3) {
      return NextResponse.json(
        { error: 'Query is required and must be at least 3 characters' },
        { status: 400 }
      )
    }

    const trimmedQuery = query.trim()
    console.log('Ask AI request:', trimmedQuery.slice(0, 100))

    // Detect team from query
    const { team, displayName } = detectTeamFromQuery(trimmedQuery)

    // Step 1: ALWAYS query Datalab first - it has all the primary data
    const response = await fetch(`${DATALAB_API_URL}/api/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Source': 'sportsmockery.com',
      },
      body: JSON.stringify({ query: trimmedQuery }),
    })

    if (!response.ok) {
      console.error('Data Lab API error:', response.status, response.statusText)

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

    // Step 2: If Datalab used external sources, check our AI cache first
    // AI tables store previously validated external data that joins to Datalab tables
    if (data.source === 'web_fallback') {
      const effectiveTeam = team || data.team
      const effectiveDisplayName = displayName || data.teamDisplayName

      // Check if we already have this external data cached in AI tables
      if (effectiveTeam) {
        const cacheResult = await checkAICache(effectiveTeam, trimmedQuery)

        if (cacheResult.found && cacheResult.data) {
          console.log('AI cache hit for external query, team:', effectiveTeam)

          // Return cached external data (already validated)
          return NextResponse.json({
            response: cacheResult.data.raw_response || JSON.stringify(cacheResult.data),
            source: 'ai', // Cached external data is validated
            team: effectiveTeam,
            teamDisplayName: effectiveDisplayName,
            cachedResponse: true,
            cacheSource: cacheResult.source,
          })
        }
      }

      // Not in cache - log, validate, and import for future queries
      console.log('External source used, logging query for team:', effectiveTeam)

      // Parse data from response for validation
      const parsedData = tryParseDataFromResponse(data.response)
      const dataType = determineDataType(trimmedQuery)

      // Process in background (don't await to avoid slowing response)
      processExternalQueryResponse(
        trimmedQuery,
        effectiveTeam,
        effectiveDisplayName,
        data.externalSource || 'web_fallback',
        data.response,
        parsedData,
        dataType
      ).then(result => {
        console.log('External query processed:', {
          logged: result.logged,
          validated: result.validated,
          imported: result.imported,
        })
      }).catch(err => {
        console.error('Error processing external query:', err)
      })
    }

    // Return the Data Lab response
    return NextResponse.json({
      response: data.response,
      rowCount: data.rowCount,
      source: data.source,
      team: data.team || team,
      teamDisplayName: data.teamDisplayName || displayName,
      sport: data.sport,
      dataGapLogged: data.dataGapLogged,
      showSuggestions: data.showSuggestions,
      suggestions: data.suggestions,
      relatedArticles: data.relatedArticles,
      newsSummary: data.newsSummary,
    })

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error('Ask AI error:', errorMessage, 'URL:', `${DATALAB_API_URL}/api/query`)

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
