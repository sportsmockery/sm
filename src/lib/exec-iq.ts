/**
 * ExecIQ — daily AI insights over the exec dashboard.
 *
 * Distills the dashboard payload into a compact JSON snapshot, sends it to
 * Claude Opus 4.7 with a strict output schema, and stores the result in
 * `exec_iq_insights`. Both the daily cron and the admin "Refresh" button
 * call generateExecIqInsights().
 */
import Anthropic from '@anthropic-ai/sdk'
import { supabaseAdmin } from './supabase-server'

const MODEL = 'claude-opus-4-7'

export type ExecIqInsight = {
  title: string
  severity: 'win' | 'risk' | 'opportunity'
  category: 'content' | 'writers' | 'audience' | 'seo' | 'social' | 'timing' | 'monetization'
  detail: string
  action: string
  metric?: string
}

export type ExecIqResult = {
  summary: string
  insights: ExecIqInsight[]
}

const SYSTEM_PROMPT = `You are ExecIQ, an analytical co-pilot for Chris, the owner/editor of SportsMockery — a Chicago sports content site (Bears, Cubs, White Sox, Bulls, Blackhawks).

You read the daily dashboard data and produce 4–7 specific, actionable optimization tips Chris can act on this week.

PRINCIPLES
- Every tip references a concrete data point (a number, a writer name, a category, a date pattern).
- No fluff or generalities ("focus on engagement", "improve SEO"). Be specific.
- Mix wins (what's working — do more), risks (something dropping — fix it), and opportunities (untapped angle).
- Voice: peer-to-peer, direct, terse. No executive-summary boilerplate.
- If the data is sparse or inconclusive, say so in fewer tips rather than fabricating signal.

THE "action" FIELD IS THE PRODUCT — make it operational, not advisory:
- 3–6 numbered steps (1., 2., 3. …), each on its own line, each starting with a verb.
- Name names: writer names, article slugs, category names, day-of-week, hour, target headline angles.
- Quantify: "by Thursday", "publish 3 posts", "cut Bulls volume to 1/day", "target keyword X (current rank 14)".
- Include a measurable success criterion in the last step ("re-check views vs. this week", "expect Bears category to recover to >5K avg views").
- Do NOT write generic advice ("create more content", "engage your audience"). If you can't be specific, drop the tip.

OUTPUT: valid JSON exactly matching this schema. Return ONLY the JSON, no prose before or after, no markdown fences. The action field must be a single string with newline-separated numbered steps.

{
  "summary": "1-2 sentence read of where the site sits today",
  "insights": [
    {
      "title": "short headline, 5-8 words",
      "severity": "win" | "risk" | "opportunity",
      "category": "content" | "writers" | "audience" | "seo" | "social" | "timing" | "monetization",
      "detail": "1-2 sentences explaining what the data shows and WHY it matters",
      "action": "1. Verb-led step with names and numbers.\\n2. Next step.\\n3. Next step.\\n4. Measurable success criterion.",
      "metric": "optional — the data point that triggered this insight"
    }
  ]
}`

/** Distill the dashboard JSON into the smallest payload that still carries signal. */
export function distillDashboard(d: any) {
  if (!d) return null
  const ov = d.overview || {}
  const writers = (d.writers || []).slice(0, 8).map((w: any) => ({
    name: w.name,
    posts: w.posts,
    views: w.views,
    avgViews: w.avgViews,
  }))
  const topContent = (d.topContent || []).slice(0, 10).map((p: any) => ({
    title: p.title,
    author: p.author_name,
    category: p.category_name,
    views: p.views,
    publishedAt: p.published_at,
  }))
  const categories = (d.categories || []).slice(0, 8).map((c: any) => ({
    name: c.name,
    posts: c.count,
    views: c.views,
    avgViews: c.avgViews,
  }))
  const dayOfWeek = d.dayOfWeek || []
  const peakPublishHour = (() => {
    const hh = d.hourDistribution || []
    if (!hh.length) return null
    const max = hh.reduce((a: any, b: any) => (b.count > a.count ? b : a))
    return max.hour
  })()
  const monthlyTrend = (d.monthlyTrend || []).slice(-6) // last 6 months
  const social = d.social
    ? {
        youtube: (d.social.youtube || []).map((c: any) => ({ name: c.name, subs: c.subscribers, views: c.views })),
        x: (d.social.x || []).map((a: any) => ({ handle: a.handle, followers: a.followers })),
        facebook: (d.social.facebook || []).map((p: any) => ({ name: p.name, fans: p.fans })),
      }
    : null
  const seo = d.seo
    ? {
        rank: d.seo.overview?.rank,
        organicKeywords: d.seo.overview?.organicKeywords,
        organicTraffic: d.seo.overview?.organicTraffic,
        topKeywords: (d.seo.keywords || []).slice(0, 8).map((k: any) => ({
          keyword: k.keyword,
          position: k.position,
          previousPosition: k.previousPosition,
          searchVolume: k.searchVolume,
        })),
        snapshotMonth: d.seo.monthLabel,
      }
    : null

  return {
    range: d.range,
    days: d.days,
    overview: {
      periodPosts: ov.periodPosts,
      prevPeriodPosts: ov.prevPeriodPosts,
      periodViews: ov.periodViews,
      prevPeriodViews: ov.prevPeriodViews,
      avgViews: ov.avgViews,
      velocity: ov.velocity,
      totalAuthors: ov.totalAuthors,
    },
    topWriters: writers,
    topContent,
    categories,
    dayOfWeek,
    peakPublishHour,
    monthlyTrend,
    social,
    seo,
  }
}

function tryParseJson(text: string): ExecIqResult | null {
  // Strip markdown fences if Claude wrapped the JSON despite instructions
  const cleaned = text
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '')
    .trim()
  try {
    const obj = JSON.parse(cleaned)
    if (!obj || typeof obj !== 'object') return null
    if (!Array.isArray(obj.insights)) return null
    return obj as ExecIqResult
  } catch {
    return null
  }
}

export async function generateExecIqInsights(opts: {
  baseUrl: string
  range?: string
}): Promise<{ ok: true; insightId: number; insights: ExecIqResult } | { ok: false; error: string }> {
  const range = opts.range || 'this-week'
  const dashUrl = `${opts.baseUrl}/api/exec-dashboard?range=${range}`
  const dashRes = await fetch(dashUrl, { cache: 'no-store' })
  if (!dashRes.ok) {
    return { ok: false, error: `Dashboard fetch failed: ${dashRes.status}` }
  }
  const dashboard = await dashRes.json()
  const distilled = distillDashboard(dashboard)
  if (!distilled) return { ok: false, error: 'Dashboard payload empty' }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return { ok: false, error: 'ANTHROPIC_API_KEY not set' }

  const anthropic = new Anthropic({ apiKey })
  let result
  try {
    result = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 2048,
      system: [{ type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }],
      messages: [
        {
          role: 'user',
          content: `Today's dashboard snapshot (range = ${range}):\n\n${JSON.stringify(distilled, null, 2)}\n\nReturn the JSON now.`,
        },
      ],
    })
  } catch (e: any) {
    return { ok: false, error: `Anthropic call failed: ${e?.message || String(e)}` }
  }

  const text = result.content
    .filter((b: any) => b.type === 'text')
    .map((b: any) => b.text)
    .join('\n')
  const parsed = tryParseJson(text)
  if (!parsed) {
    return { ok: false, error: 'Claude returned non-JSON output' }
  }

  const periodStart = dashboard.overview && dashboard.range
    ? null // not directly available; could derive from days
    : null

  const { data: row, error: insertErr } = await supabaseAdmin
    .from('exec_iq_insights')
    .insert({
      period_label: range,
      period_start: periodStart,
      period_end: null,
      summary: parsed.summary,
      insights: parsed.insights,
      model: MODEL,
      input_tokens: result.usage?.input_tokens ?? null,
      output_tokens: result.usage?.output_tokens ?? null,
    })
    .select('id')
    .single()

  if (insertErr || !row) {
    return { ok: false, error: insertErr?.message || 'Failed to store insights' }
  }

  // Persist one action-item row per insight so they can be tracked + completed individually.
  if (parsed.insights.length > 0) {
    const generatedAt = new Date().toISOString()
    const items = parsed.insights.map(ins => ({
      insight_id: row.id,
      generated_at: generatedAt,
      title: ins.title,
      severity: ins.severity,
      category: ins.category,
      detail: ins.detail,
      action: ins.action,
      metric: ins.metric ?? null,
      status: 'open' as const,
    }))
    const { error: itemsErr } = await supabaseAdmin
      .from('exec_iq_action_items')
      .insert(items)
    if (itemsErr) {
      console.error('[exec-iq] action item insert failed:', itemsErr)
    }
  }

  return { ok: true, insightId: row.id as number, insights: parsed }
}

export async function loadLatestExecIq() {
  const { data } = await supabaseAdmin
    .from('exec_iq_insights')
    .select('*')
    .order('generated_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  return data
}

export type ExecIqActionItemRow = {
  id: number
  insight_id: number | null
  generated_at: string
  title: string
  severity: string
  category: string
  detail: string | null
  action: string | null
  metric: string | null
  status: 'open' | 'completed'
  completed_at: string | null
  completed_by: string | null
}

export async function loadActionItems(opts: { status?: string; limit?: number } = {}): Promise<ExecIqActionItemRow[]> {
  let q = supabaseAdmin
    .from('exec_iq_action_items')
    .select('*')
    .order('generated_at', { ascending: false })
    .limit(opts.limit ?? 200)
  if (opts.status) q = q.eq('status', opts.status)
  const { data } = await q
  return (data as ExecIqActionItemRow[] | null) ?? []
}

export async function setActionItemStatus(id: number, status: 'open' | 'completed', userEmail: string | null) {
  const update: Record<string, unknown> = {
    status,
    updated_at: new Date().toISOString(),
  }
  if (status === 'completed') {
    update.completed_at = new Date().toISOString()
    update.completed_by = userEmail
  } else {
    update.completed_at = null
    update.completed_by = null
  }
  const { data, error } = await supabaseAdmin
    .from('exec_iq_action_items')
    .update(update)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as ExecIqActionItemRow
}
