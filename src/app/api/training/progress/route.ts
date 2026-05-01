import { NextRequest, NextResponse } from 'next/server'
import { requireTrainingAccess } from '@/lib/training-auth'
import { supabaseAdmin } from '@/lib/supabase-server'
import {
  TRAINING_MODULES,
  TOTAL_MODULES,
  findModule,
} from '@/lib/training/curriculum'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface ProgressBody {
  moduleSlug: string
  score: number
  passed: boolean
}

export async function POST(request: NextRequest) {
  const access = await requireTrainingAccess(request)
  if (!access.ok) {
    return NextResponse.json({ error: access.error }, { status: access.status })
  }

  let body: ProgressBody
  try {
    body = (await request.json()) as ProgressBody
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { moduleSlug, score, passed } = body
  const mod = findModule(moduleSlug)
  if (!mod) {
    return NextResponse.json({ error: 'Unknown module' }, { status: 400 })
  }

  const safeScore = Number.isFinite(score) ? Math.max(0, Math.min(100, Math.round(score))) : 0
  const isPass = Boolean(passed) && safeScore >= mod.passScore

  // Upsert: if the row exists, increment attempts and lock-in best score.
  const { data: existing } = await supabaseAdmin
    .from('writer_training_progress')
    .select('quiz_score, quiz_attempts, completed, completed_at')
    .eq('user_id', access.userId)
    .eq('module_slug', moduleSlug)
    .maybeSingle()

  const nextAttempts = (existing?.quiz_attempts ?? 0) + 1
  const bestScore = Math.max(existing?.quiz_score ?? 0, safeScore)
  const wasCompleted = Boolean(existing?.completed)
  const nowCompleted = wasCompleted || isPass

  const { error: upsertError } = await supabaseAdmin
    .from('writer_training_progress')
    .upsert(
      {
        user_id: access.userId,
        module_slug: moduleSlug,
        completed: nowCompleted,
        quiz_score: bestScore,
        quiz_attempts: nextAttempts,
        completed_at: nowCompleted
          ? existing?.completed_at ?? new Date().toISOString()
          : null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,module_slug' },
    )

  if (upsertError) {
    return NextResponse.json(
      { error: upsertError.message || 'Could not save progress' },
      { status: 500 },
    )
  }

  // Recompute aggregate certification state from all rows.
  const { data: allRows } = await supabaseAdmin
    .from('writer_training_progress')
    .select('module_slug, completed, quiz_score')
    .eq('user_id', access.userId)

  const rows = allRows ?? []
  const completedRows = rows.filter((r) => r.completed)
  const completedModules = completedRows.length
  const overallScore =
    completedRows.length > 0
      ? Math.round(
          completedRows.reduce((acc, r) => acc + (r.quiz_score ?? 0), 0) /
            completedRows.length,
        )
      : 0

  const allCurriculumDone =
    TRAINING_MODULES.every((m) =>
      rows.some((r) => r.module_slug === m.slug && r.completed),
    ) && completedModules >= TOTAL_MODULES

  const certified = allCurriculumDone && overallScore >= 80

  await supabaseAdmin.from('writer_training_certifications').upsert(
    {
      user_id: access.userId,
      certified,
      overall_score: overallScore,
      completed_modules: completedModules,
      certified_at: certified ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' },
  )

  return NextResponse.json({
    ok: true,
    moduleSlug,
    score: safeScore,
    bestScore,
    attempts: nextAttempts,
    passed: isPass,
    completedModules,
    overallScore,
    certified,
  })
}
