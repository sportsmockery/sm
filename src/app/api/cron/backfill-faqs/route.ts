import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { resolveArticleFaqs } from '@/lib/articleFaq'

/**
 * GET /api/cron/backfill-faqs
 *
 * Pre-warms FAQ JSON-LD for recently published posts so readers never hit
 * the cold-cache path (which would otherwise trigger a 5–8s Scout call on
 * the first article view and leave that reader without rich-result schema
 * on their request).
 *
 * Strategy:
 *   - Pull posts published in the last 7 days where `faq_json IS NULL`.
 *   - Newest first — recently published articles are highest-traffic.
 *   - Hard cap at 30 posts per run to stay inside the function budget
 *     (Scout responds in ~5–8s; 30 × ~7s ≈ 210s, well under maxDuration).
 *   - Process serially (not parallel) so we don't hammer the DataLab API.
 *
 * The resolver itself caches its result regardless of outcome — including
 * `[]` for short articles or transient model failures — so we never spin
 * on the same post twice.
 *
 * Vercel Cron schedule: daily at 04:30 UTC (off-peak, after the existing
 * scout-history cleanup at 03:00 UTC).
 */

export const maxDuration = 300
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const LOOKBACK_DAYS = 7
const MAX_POSTS_PER_RUN = 30

interface Post {
  id: number
  title: string
  content: string | null
  published_at: string
}

export async function GET(request: NextRequest) {
  // Vercel Cron sends `Authorization: Bearer ${CRON_SECRET}` per project convention.
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const startedAt = Date.now()
  console.log('[backfill-faqs] starting backfill, lookback days:', LOOKBACK_DAYS)

  const cutoff = new Date()
  cutoff.setUTCDate(cutoff.getUTCDate() - LOOKBACK_DAYS)
  const cutoffIso = cutoff.toISOString()

  let candidates: Post[] = []
  try {
    const { data, error } = await supabaseAdmin
      .from('sm_posts')
      .select('id, title, content, published_at')
      .eq('status', 'published')
      .is('faq_json', null)
      .gte('published_at', cutoffIso)
      .order('published_at', { ascending: false })
      .limit(MAX_POSTS_PER_RUN)

    if (error) {
      console.error('[backfill-faqs] candidate query failed', error)
      return NextResponse.json({ ok: false, error: 'query_failed' }, { status: 500 })
    }
    candidates = (data || []) as Post[]
  } catch (err) {
    console.error('[backfill-faqs] candidate query exception', err)
    return NextResponse.json({ ok: false, error: 'query_exception' }, { status: 500 })
  }

  if (candidates.length === 0) {
    console.log('[backfill-faqs] no candidates — nothing to do')
    return NextResponse.json({
      ok: true,
      candidates: 0,
      processed: 0,
      successWithFaqs: 0,
      cachedEmpty: 0,
      failed: 0,
      durationMs: Date.now() - startedAt,
    })
  }

  let processed = 0
  let successWithFaqs = 0
  let cachedEmpty = 0
  let failed = 0
  const failures: Array<{ id: number; title: string }> = []

  for (const post of candidates) {
    processed += 1
    try {
      const items = await resolveArticleFaqs(
        { id: post.id, title: post.title, content: post.content || '' },
        // We already know faq_json is null (filter above) — skip the
        // redundant DB read inside the resolver.
        { cachedFaqJson: null, generateIfMissing: true }
      )
      if (items.length > 0) {
        successWithFaqs += 1
      } else {
        // Resolver still wrote `[]` to faq_json so we won't re-attempt this
        // post on the next run. Counts as "handled".
        cachedEmpty += 1
      }
    } catch (err) {
      failed += 1
      failures.push({ id: post.id, title: post.title })
      console.error('[backfill-faqs] resolve failed', { id: post.id, err })
    }
  }

  const durationMs = Date.now() - startedAt
  console.log('[backfill-faqs] done', {
    processed,
    successWithFaqs,
    cachedEmpty,
    failed,
    durationMs,
  })

  return NextResponse.json({
    ok: true,
    candidates: candidates.length,
    processed,
    successWithFaqs,
    cachedEmpty,
    failed,
    failures,
    durationMs,
  })
}
