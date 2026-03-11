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
 * Daily cron — pulls yesterday's SM articles, sends titles to Scout,
 * and generates 5 fan questions based on real published content.
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
    // Pull yesterday's published articles
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    yesterday.setHours(0, 0, 0, 0)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const { data: articles } = await supabaseAdmin
      .from('sm_posts')
      .select('title')
      .eq('status', 'published')
      .gte('published_at', yesterday.toISOString())
      .lt('published_at', today.toISOString())
      .order('published_at', { ascending: false })
      .limit(15)

    const titles = articles?.map(a => a.title).filter(Boolean) || []
    console.log(`[Scout Prompts] Found ${titles.length} articles from yesterday`)

    // Build prompt with article context
    let articleContext = ''
    if (titles.length > 0) {
      articleContext = `Here are yesterday's SportsMockery.com headlines:\n${titles.map((t, i) => `${i + 1}. ${t}`).join('\n')}\n\nBased on these articles, `
    }

    const res = await fetch(`${DATALAB_API_URL}/api/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `${articleContext}Generate exactly 5 short questions (under 50 characters each) that a Chicago sports fan would ask today. Each question should be directly inspired by the headlines above. Cover at least 3 different teams. Keep questions open-ended and analytical — no predicting game outcomes or clinch scenarios. Return ONLY a JSON array of 5 strings, no other text. Example format: ["Question 1?","Question 2?","Question 3?","Question 4?","Question 5?"]`,
      }),
      signal: AbortSignal.timeout(15000),
    })

    let prompts = FALLBACK_PROMPTS

    if (res.ok) {
      const data = await res.json()
      const text = data.response || ''
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
    const payload = {
      prompts,
      articleCount: titles.length,
      generatedAt: new Date().toISOString(),
    }
    const { error } = await supabaseAdmin
      .from('sm_kv')
      .upsert({ key: 'scout_daily_prompts', value: payload }, { onConflict: 'key' })

    if (error) {
      console.error('[Scout Prompts] DB write failed:', error.message)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    const duration = Date.now() - startTime
    console.log(`[Scout Prompts] Done in ${duration}ms — ${titles.length} articles → ${prompts.length} prompts`)

    return NextResponse.json({
      success: true,
      prompts,
      articleCount: titles.length,
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
