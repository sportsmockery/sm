import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const DATALAB_API = 'https://datalab.sportsmockery.com'

export interface PollOption {
  text: string
  isCorrect?: boolean
}

export interface PollSuggestion {
  success: boolean
  pollId?: string
  question: string
  options: PollOption[]
  pollType: 'opinion' | 'prediction' | 'comparison'
  confidence: number
  teamTheme?: string
  reasoning?: string
}

export interface PollRejectionResponse {
  success: false
  confidence?: number
  reason: string
  suggestion: string
  potentialImprovements?: string[]
}

export interface PostIQPollResponse {
  success: boolean
  poll?: PollSuggestion
  reason?: string
  suggestion?: string
  potentialImprovements?: string[]
  confidence?: number
}

/**
 * POST /api/postiq/generate-poll
 *
 * Dedicated route for PostIQ poll generation.
 * Forwards to DataLab's /api/postiq/generate-poll endpoint.
 *
 * Flow:
 * 1. Writer types article at test.sportsmockery.com
 * 2. Front-end sends to this route
 * 3. This route forwards to datalab.sportsmockery.com/api/postiq/generate-poll
 * 4. DataLab analyzes content and returns:
 *    - Success: poll with question, options, pollType, confidence
 *    - Rejection: reason, suggestion, potentialImprovements
 * 5. Front-end displays poll preview or rejection feedback
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { content, title, team = 'bears' } = body

    // Validate required fields
    if (!content || content.length < 100) {
      return NextResponse.json({
        success: false,
        reason: 'empty_content',
        suggestion: 'Write at least 100 characters before generating poll.',
      })
    }

    // Get user session for logging/tracking
    let userId: string | undefined
    try {
      const cookieStore = await cookies()
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() {
              return cookieStore.getAll()
            },
            setAll(cookiesToSet) {
              cookiesToSet.forEach(({ name, value, options }) => {
                try {
                  cookieStore.set(name, value, options)
                } catch {
                  // Ignore cookie errors in API routes
                }
              })
            },
          },
        }
      )
      const { data: { session } } = await supabase.auth.getSession()
      userId = session?.user?.id
    } catch {
      // Continue without user ID
    }

    // Forward to DataLab PostIQ /api/postiq/generate-poll
    // Request format: { content: { title, body, sport } }
    const datalabResponse = await fetch(`${DATALAB_API}/api/postiq/generate-poll`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(process.env.POSTIQ_INTERNAL_KEY && {
          'X-PostIQ-Internal-Key': process.env.POSTIQ_INTERNAL_KEY,
          'Authorization': `Bearer ${process.env.POSTIQ_INTERNAL_KEY}`,
        }),
      },
      body: JSON.stringify({
        content: {
          title: title || '',
          body: content,
          sport: team,
        },
      }),
    })

    if (!datalabResponse.ok) {
      const errorText = await datalabResponse.text()
      console.error('[PostIQ Poll] DataLab error:', datalabResponse.status, errorText)
      return NextResponse.json({
        success: false,
        reason: 'api_error',
        suggestion: 'Poll generation service temporarily unavailable. Please try again.',
      })
    }

    const data = await datalabResponse.json()
    return NextResponse.json(normalizePollResponse(data, team))

  } catch (error) {
    console.error('[PostIQ Poll] Error:', error)
    return NextResponse.json({
      success: false,
      reason: 'network_error',
      suggestion: 'Failed to generate poll. Please check your connection.',
    })
  }
}

/**
 * Normalize the DataLab poll response to ensure consistent format for frontend
 */
function normalizePollResponse(
  data: Record<string, unknown>,
  fallbackTeam: string = 'bears'
): PostIQPollResponse {
  // If DataLab returned a rejection
  if (data.success === false) {
    return {
      success: false,
      reason: String(data.reason || 'no_poll_data'),
      suggestion: String(data.suggestion || 'No pollable content found in article.'),
      potentialImprovements: Array.isArray(data.potentialImprovements)
        ? data.potentialImprovements.map(String)
        : undefined,
      confidence: typeof data.confidence === 'number' ? data.confidence : undefined,
    }
  }

  // Extract poll data
  const poll = data.poll as Record<string, unknown> | undefined
  if (!poll) {
    // Check if poll fields are at root level
    if (data.question && Array.isArray(data.options)) {
      return {
        success: true,
        poll: normalizePoll(data, fallbackTeam),
      }
    }
    return {
      success: false,
      reason: 'no_poll_data',
      suggestion: 'Could not generate a relevant poll from this content.',
    }
  }

  return {
    success: true,
    poll: normalizePoll(poll, fallbackTeam),
  }
}

/**
 * Normalize a poll object
 */
function normalizePoll(
  pollData: Record<string, unknown>,
  team: string
): PollSuggestion {
  // Parse options array
  const rawOptions = Array.isArray(pollData.options) ? pollData.options : []
  const options: PollOption[] = rawOptions.map((opt: unknown) => {
    if (typeof opt === 'string') {
      return { text: opt }
    }
    if (typeof opt === 'object' && opt !== null) {
      const optObj = opt as Record<string, unknown>
      return {
        text: String(optObj.text || optObj.label || ''),
        isCorrect: typeof optObj.isCorrect === 'boolean' ? optObj.isCorrect : undefined,
      }
    }
    return { text: String(opt) }
  })

  // Validate we have a valid poll
  const hasValidData =
    typeof pollData.question === 'string' &&
    pollData.question.length > 0 &&
    options.length >= 2

  return {
    success: hasValidData,
    pollId: pollData.pollId ? String(pollData.pollId) : undefined,
    question: String(pollData.question || ''),
    options,
    pollType: (pollData.pollType as PollSuggestion['pollType']) || 'opinion',
    confidence: typeof pollData.confidence === 'number' ? pollData.confidence : 0.7,
    teamTheme: team,
    reasoning: pollData.reasoning ? String(pollData.reasoning) : undefined,
  }
}
