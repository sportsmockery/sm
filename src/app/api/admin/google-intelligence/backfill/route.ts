// POST /api/admin/google-intelligence/backfill
// Enqueues a scoring job for every published sm_posts row that doesn't have a
// recent score on the active ruleset. Use after running the migration, or any
// time the ruleset version bumps. Idempotent — the worker idempotency-checks
// content + author hashes, and a partial unique index on
// google_scoring_jobs(article_id, ruleset_version, trigger) where status in
// ('queued','running') prevents true duplicates.
//
// Bulk-inserts in 200-row chunks so a 500-post backfill finishes well under
// the 60s function limit, instead of doing one INSERT per row.

import { createHash } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { requireAdmin, verifyCronSecret } from '@/lib/admin-auth'
import { GoogleIngestionService } from '@/lib/google/google-ingestion-service'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const maxDuration = 60

const DEFAULT_LIMIT = 500
const INSERT_CHUNK = 200

async function authorized(req: NextRequest): Promise<boolean> {
  if (verifyCronSecret(req)) return true
  const auth = await requireAdmin(req)
  return !auth.error
}

async function runBackfill(req: NextRequest): Promise<NextResponse> {
  try {
    if (!(await authorized(req))) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    }

    const url = new URL(req.url)
    const limit = Math.min(5000, Math.max(1, parseInt(url.searchParams.get('limit') ?? String(DEFAULT_LIMIT), 10) || DEFAULT_LIMIT))
    const onlyMissing = url.searchParams.get('onlyMissing') !== 'false'
    const includeTransparency = url.searchParams.get('transparency') !== 'false'

    const ingest = new GoogleIngestionService(supabaseAdmin)
    const ruleset = await ingest.getActiveRuleset()

    // Re-enqueue every transparency asset on each backfill so heuristics drift
    // (loosened keywords, new social platforms, etc.) gets picked up the next
    // time the worker ticks.
    let transparencyEnqueued = 0
    if (includeTransparency) {
      const { data: assets } = await supabaseAdmin
        .from('google_transparency_assets')
        .select('id,asset_type')
      for (const a of (assets ?? []) as Array<{ id: string; asset_type: string }>) {
        const trigger = ({
          about_page: 'transparency.about_updated',
          contact_page: 'transparency.contact_updated',
          author_page: 'transparency.author_page_updated',
          publisher_identity: 'transparency.publisher_updated',
          editorial_policy_page: 'transparency.editorial_policy_updated',
          disclosure_page: 'transparency.editorial_policy_updated',
        } as Record<string, string>)[a.asset_type]
        if (!trigger) continue
        try {
          await ingest.enqueue({ articleId: a.id, trigger: trigger as Parameters<typeof ingest.enqueue>[0]['trigger'], actor: 'backfill', payload: { kind: 'transparency_asset', assetId: a.id } })
          transparencyEnqueued += 1
        } catch (e) {
          console.warn('[backfill] transparency enqueue failed for', a.id, e)
        }
      }
    }

    // 1. Pull recent published posts.
    const { data: posts, error: postsErr } = await supabaseAdmin
      .from('sm_posts')
      .select('id,published_at')
      .eq('status', 'published')
      .order('published_at', { ascending: false, nullsFirst: false })
      .limit(limit)
    if (postsErr) return NextResponse.json({ stage: 'fetch_posts', error: postsErr.message }, { status: 500 })

    const postIds = (posts ?? []).map((p: { id: string }) => String(p.id))
    if (postIds.length === 0) {
      return NextResponse.json({ rulesetVersion: ruleset.version, total: 0, enqueued: 0, deduplicated: 0, skipped: 0 })
    }

    // 2. Skip posts that already have a current score on this ruleset.
    let toEnqueue = postIds
    let skipped = 0
    if (onlyMissing) {
      const { data: existing, error: existingErr } = await supabaseAdmin
        .from('google_article_scores')
        .select('article_id')
        .in('article_id', postIds)
        .eq('ruleset_version', ruleset.version)
      if (existingErr) return NextResponse.json({ stage: 'check_existing', error: existingErr.message }, { status: 500 })
      const have = new Set((existing ?? []).map((r: { article_id: string }) => r.article_id))
      skipped = have.size
      toEnqueue = postIds.filter((id) => !have.has(id))
    }

    // 3. Filter out posts that already have a queued/running job for this
    //    ruleset + trigger so the bulk insert never trips the partial unique
    //    index. (Cheaper than catching unique-violation per row.)
    let deduplicated = 0
    if (toEnqueue.length > 0) {
      const { data: queued, error: queuedErr } = await supabaseAdmin
        .from('google_scoring_jobs')
        .select('article_id')
        .in('article_id', toEnqueue)
        .eq('ruleset_version', ruleset.version)
        .eq('trigger', 'rescan.nightly')
        .in('status', ['queued', 'running'])
      if (queuedErr) return NextResponse.json({ stage: 'check_queued', error: queuedErr.message }, { status: 500 })
      const queuedSet = new Set((queued ?? []).map((r: { article_id: string }) => r.article_id))
      deduplicated = queuedSet.size
      toEnqueue = toEnqueue.filter((id) => !queuedSet.has(id))
    }

    // 4. Bulk insert into google_scoring_jobs in chunks.
    const now = new Date().toISOString()
    const rows = toEnqueue.map((articleId) => ({
      id: createHash('sha256')
        .update(`${articleId}:rescan.nightly:${ruleset.version}:${now}`)
        .digest('hex')
        .slice(0, 24),
      article_id: articleId,
      trigger: 'rescan.nightly',
      ruleset_version: ruleset.version,
      status: 'queued',
      attempts: 0,
      enqueued_at: now,
      started_at: null,
      completed_at: null,
      error_message: null,
      payload: { source: 'backfill' },
    }))

    let enqueued = 0
    const insertErrors: Array<{ chunk: number; message: string }> = []
    for (let i = 0; i < rows.length; i += INSERT_CHUNK) {
      const chunk = rows.slice(i, i + INSERT_CHUNK)
      const { error: insertErr } = await supabaseAdmin
        .from('google_scoring_jobs')
        .insert(chunk)
      if (insertErr) {
        insertErrors.push({ chunk: i / INSERT_CHUNK, message: insertErr.message })
      } else {
        enqueued += chunk.length
      }
    }

    return NextResponse.json({
      rulesetVersion: ruleset.version,
      total: postIds.length,
      enqueued,
      deduplicated,
      skipped,
      transparencyEnqueued,
      insertErrors: insertErrors.slice(0, 5),
      insertErrorCount: insertErrors.length,
    })
  } catch (e) {
    console.error('[backfill] unhandled error:', e)
    return NextResponse.json(
      { error: e instanceof Error ? e.message : String(e), stack: e instanceof Error ? e.stack : undefined },
      { status: 500 },
    )
  }
}

export async function GET(req: NextRequest) {
  return runBackfill(req)
}

export async function POST(req: NextRequest) {
  return runBackfill(req)
}
