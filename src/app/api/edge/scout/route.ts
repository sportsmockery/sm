import { NextRequest, NextResponse } from 'next/server'
import { screenInput, screenOutput } from '@/lib/ai-safety'
import { sanitizeQuery } from '@/lib/sanitize-prompt'

const DATALAB_API_URL = process.env.DATALAB_API_URL || 'https://datalab.sportsmockery.com'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { prompt: rawPrompt } = body

    // Sanitize prompt
    const sanitized = sanitizeQuery(rawPrompt)
    if (!sanitized.safe) {
      return NextResponse.json({ error: sanitized.reason }, { status: 400 })
    }
    const prompt = sanitized.query

    // Screen for jailbreak attempts
    const safety = screenInput(prompt)
    if (safety.blocked) {
      return NextResponse.json({
        answer: safety.reason,
        source: 'safety',
      })
    }

    const response = await fetch(`${DATALAB_API_URL}/api/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Source': 'sportsmockery.com',
      },
      body: JSON.stringify({
        query: prompt,
      }),
    })

    if (!response.ok) {
      return NextResponse.json({
        answer: "Scout had trouble answering. Try again in a bit.",
      })
    }

    const data = await response.json()

    return NextResponse.json({
      answer: screenOutput(data.response || ''),
      source: data.source,
      sessionId: data.sessionId,
    })
  } catch {
    return NextResponse.json({
      answer: "Scout had trouble connecting. Try again in a moment.",
    })
  }
}
