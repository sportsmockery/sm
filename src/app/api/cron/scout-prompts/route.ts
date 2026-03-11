import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

export const maxDuration = 30
export const dynamic = 'force-dynamic'

const DATALAB_API_URL = process.env.DATALAB_API_URL || 'https://datalab.sportsmockery.com'

const FALLBACK_PROMPTS = [
  "Why did the Bears lose Sunday?",
  "Is Caleb Williams improving?",
  "Should the Cubs trade Bellinger?",
  "What's wrong with the Bulls defense?",
  "Are the Blackhawks rebuilding correctly?",
]

/**
 * Daily cron — asks Scout to generate 5 topical prompts based on today's Chicago sports news.
 * Stores result in sm_kv (key: 'scout_daily_prompts').
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  console.log('[Scout Prompts] Generating daily prompts...')
  const startTime = Date.now()

  try {
    const res = await fetch(`${DATALAB_API_URL}/api/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `Generate exactly 5 short questions (under 50 characters each) that a Chicago sports fan would ask today. Cover different teams (Bears, Bulls, Cubs, White Sox, Blackhawks). Base them on current news and storylines. Return ONLY a JSON array of 5 strings, no other text. Example format: ["Question 1?","Question 2?","Question 3?","Question 4?","Question 5?"]`,
      }),
      signal: AbortSignal.timeout(15000),
    })

    let prompts = FALLBACK_PROMPTS

    if (res.ok) {
      const data = await res.json()
      const text = data.response || ''
      // Extract JSON array from response
      const match = text.match(/\[[\s\S]*?\]/)
      if (match) {
        try {
          const parsed = JSON.parse(match[0])
          if (Array.isArray(parsed) && parsed.length >= 5 && parsed.every((p: unknown) => typeof p === 'string')) {
            prompts = parsed.slice(0, 5)
          }
        } catch {
          console.log('[Scout Prompts] Failed to parse response, using fallback')
        }
      }
    }

    // Store in sm_kv table
    const payload = { prompts, generatedAt: new Date().toISOString() }
    const { error } = await supabaseAdmin
      .from('sm_kv')
      .upsert({ key: 'scout_daily_prompts', value: payload }, { onConflict: 'key' })

    if (error) {
      console.error('[Scout Prompts] DB write failed:', error.message)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    const duration = Date.now() - startTime
    console.log(`[Scout Prompts] Done in ${duration}ms`)

    return NextResponse.json({
      success: true,
      prompts,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    const duration = Date.now() - startTime
    console.error('[Scout Prompts] Error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      duration: `${duration}ms`,
    }, { status: 500 })
  }
}
