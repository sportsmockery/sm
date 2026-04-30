// POST /api/admin/google-intelligence/tick
// Drains one batch (default 25) of queued jobs from google_scoring_jobs.
// Wired to a Vercel cron so the queue makes forward progress without anyone
// holding a shell open. Also callable manually from the admin UI for ops.

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { requireAdmin, verifyCronSecret } from '@/lib/admin-auth'
import { GoogleRescoreWorker } from '@/workers/google-rescore-worker'
import { SmPostsArticleHydrator } from '@/lib/google/sm-posts-article-hydrator'
import { SmTransparencyHydrator } from '@/lib/google/sm-transparency-hydrator'

export const dynamic = 'force-dynamic'
export const revalidate = 0
// Worker can fan out fetches per article; give it room.
export const maxDuration = 60

async function authorized(req: NextRequest): Promise<boolean> {
  // Vercel cron + curl: Bearer CRON_SECRET
  if (verifyCronSecret(req)) return true
  // In-UI clicks from /admin/exec-dashboard: authenticated admin session
  const auth = await requireAdmin(req)
  return !auth.error
}

async function runTick(req: NextRequest): Promise<NextResponse> {
  if (!(await authorized(req))) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const url = new URL(req.url)
  const batchSize = Math.min(100, Math.max(1, parseInt(url.searchParams.get('batchSize') ?? '25', 10) || 25))
  const maxBatches = Math.min(20, Math.max(1, parseInt(url.searchParams.get('maxBatches') ?? '1', 10) || 1))

  const articleHydrator = new SmPostsArticleHydrator(supabaseAdmin)
  const transparencyHydrator = new SmTransparencyHydrator(supabaseAdmin)
  const worker = new GoogleRescoreWorker(supabaseAdmin, articleHydrator, transparencyHydrator)

  let processed = 0
  let failed = 0
  for (let i = 0; i < maxBatches; i += 1) {
    const result = await worker.tick(batchSize)
    processed += result.processed
    failed += result.failed
    if (result.processed === 0 && result.failed === 0) break // queue empty
  }

  return NextResponse.json({ processed, failed, batchSize, maxBatches })
}

export async function GET(req: NextRequest) {
  return runTick(req)
}

export async function POST(req: NextRequest) {
  return runTick(req)
}
