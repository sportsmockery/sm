// POST /api/admin/google-intelligence/backfill
// Enqueues a scoring job for every published sm_posts row that doesn't have a
// recent score on the active ruleset. Use after running the migration, or any
// time the ruleset version bumps. Idempotent — the ingestion service dedupes
// against queued/running jobs and the worker idempotency-checks content hashes.

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { requireAdmin, verifyCronSecret } from '@/lib/admin-auth'
import { GoogleIngestionService } from '@/lib/google/google-ingestion-service'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const maxDuration = 60

const DEFAULT_LIMIT = 500

async function authorized(req: NextRequest): Promise<boolean> {
  if (verifyCronSecret(req)) return true
  const auth = await requireAdmin(req)
  return !auth.error
}

async function runBackfill(req: NextRequest): Promise<NextResponse> {
  if (!(await authorized(req))) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const url = new URL(req.url)
  const limit = Math.min(5000, Math.max(1, parseInt(url.searchParams.get('limit') ?? String(DEFAULT_LIMIT), 10) || DEFAULT_LIMIT))
  const onlyMissing = url.searchParams.get('onlyMissing') !== 'false' // default true

  const ingest = new GoogleIngestionService(supabaseAdmin)
  const ruleset = await ingest.getActiveRuleset()

  // Pull the most recent published posts. ORDER BY published_at DESC so the
  // freshest content scores first; older content fills in on subsequent runs.
  const { data: posts, error } = await supabaseAdmin
    .from('sm_posts')
    .select('id,published_at')
    .eq('status', 'published')
    .order('published_at', { ascending: false, nullsFirst: false })
    .limit(limit)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const postIds = (posts ?? []).map((p: { id: string }) => p.id)
  if (postIds.length === 0) return NextResponse.json({ enqueued: 0, deduplicated: 0, skipped: 0, total: 0 })

  // Optional optimisation: skip ids that already have a score row on this
  // ruleset (avoids cluttering the queue with no-op idempotency hits).
  let toEnqueue = postIds
  let skipped = 0
  if (onlyMissing) {
    const { data: existing } = await supabaseAdmin
      .from('google_article_scores')
      .select('article_id,ruleset_version')
      .in('article_id', postIds)
      .eq('ruleset_version', ruleset.version)
    const have = new Set((existing ?? []).map((r: { article_id: string }) => r.article_id))
    skipped = have.size
    toEnqueue = postIds.filter((id) => !have.has(id))
  }

  let enqueued = 0
  let deduplicated = 0
  const errors: Array<{ id: string; message: string }> = []
  for (const id of toEnqueue) {
    try {
      const r = await ingest.enqueue({ articleId: id, trigger: 'rescan.nightly', actor: 'backfill' })
      if (r.deduplicated) deduplicated += 1
      else enqueued += 1
    } catch (e) {
      errors.push({ id, message: e instanceof Error ? e.message : String(e) })
    }
  }

  return NextResponse.json({
    rulesetVersion: ruleset.version,
    total: postIds.length,
    enqueued,
    deduplicated,
    skipped,
    errors: errors.slice(0, 25),
    errorCount: errors.length,
  })
}

export async function GET(req: NextRequest) {
  return runBackfill(req)
}

export async function POST(req: NextRequest) {
  return runBackfill(req)
}
