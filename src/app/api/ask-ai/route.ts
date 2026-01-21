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

export async function POST(request: NextRequest) {
  try {
    // Block on test site to avoid Perplexity API charges
    const host = request.headers.get('host') || ''
    if (host.includes('test.sportsmockery.com')) {
      return NextResponse.json({
        response: "Ask AI is disabled on the test site to avoid API charges. This feature works on the live site.",
        source: 'disabled',
        showSuggestions: false,
      })
    }

    const body = await request.json()
    const { query } = body

    if (!query || typeof query !== 'string' || query.trim().length < 3) {
      return NextResponse.json(
        { error: 'Query is required and must be at least 3 characters' },
        { status: 400 }
      )
    }

    console.log('Ask AI request:', query.slice(0, 100))

    // Forward the request to Data Lab's query API
    const response = await fetch(`${DATALAB_API_URL}/api/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Pass along any auth if needed in the future
        'X-Source': 'sportsmockery.com',
      },
      body: JSON.stringify({ query: query.trim() }),
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
