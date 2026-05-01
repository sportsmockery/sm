import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { TrainingShell } from '@/components/training/TrainingShell'
import { TrainingVideo } from '@/components/training/TrainingVideo'
import { TrainingVisual } from '@/components/training/TrainingVisual'
import { QuizCard } from '@/components/training/QuizCard'
import { ProgressTracker } from '@/components/training/ProgressTracker'
import { ModuleInteractive } from '@/components/training/ModuleInteractive'
import { VideoScriptPanel } from '@/components/training/VideoScriptPanel'
import {
  TRAINING_MODULES,
  findModule,
  nextModule,
} from '@/lib/training/curriculum'
import { fetchUserProgress } from '@/lib/training/progress'
import { requireTrainingAccess } from '@/lib/training-auth'

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ moduleSlug: string }>
}): Promise<Metadata> {
  const { moduleSlug } = await params
  const mod = findModule(moduleSlug)
  return {
    title: mod
      ? `${mod.title} · EDGE Training`
      : 'EDGE Training',
    robots: { index: false, follow: false },
  }
}

export default async function TrainingModulePage({
  params,
}: {
  params: Promise<{ moduleSlug: string }>
}) {
  const { moduleSlug } = await params
  const access = await requireTrainingAccess()

  if (!access.ok) {
    if (access.status === 401) {
      redirect(`/login?next=/training/${moduleSlug}`)
    }
    return (
      <TrainingShell>
        <div className="mx-auto max-w-xl rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-center backdrop-blur-xl">
          <h1 className="text-2xl font-bold">Access denied</h1>
          <p className="mt-2 text-sm text-zinc-400">
            You do not have access to writer training.
          </p>
        </div>
      </TrainingShell>
    )
  }

  const mod = findModule(moduleSlug)
  if (!mod) {
    notFound()
  }

  const progress = await fetchUserProgress(access.userId)
  const moduleProgress = progress[mod.slug]
  const next = nextModule(mod.slug)
  const isStaffEditor = access.role === 'admin' || access.role === 'editor'

  return (
    <TrainingShell>
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/training"
          className="text-sm text-zinc-400 transition hover:text-cyan-300"
        >
          ← Back to curriculum
        </Link>
        <span className="text-xs uppercase tracking-wider text-zinc-500">
          Module {mod.order} of {TRAINING_MODULES.length}
        </span>
      </div>

      <div className="mb-6">
        <div className="inline-flex items-center rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
          {mod.duration}
        </div>
        <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
          {mod.title}
        </h1>
        <p className="mt-2 max-w-3xl text-base text-zinc-300 sm:text-lg">
          {mod.subtitle}
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
        <div className="space-y-6">
          <TrainingVideo
            title={mod.title}
            videoSrc={mod.video.src}
            poster={mod.video.poster}
            duration={mod.duration}
            fallbackText={mod.video.fallback}
          />

          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl sm:p-6">
            <h2 className="text-xl font-bold">What you’ll learn</h2>
            <ul className="mt-3 space-y-2 text-sm text-zinc-300">
              {mod.lessons.map((l, i) => (
                <li key={i} className="flex gap-3">
                  <span className="text-cyan-300">·</span>
                  <span>{l}</span>
                </li>
              ))}
            </ul>
          </div>

          <TrainingVisual type={mod.visual.type} title={mod.visual.title} />

          {mod.interactive ? (
            <ModuleInteractive block={mod.interactive} />
          ) : null}

          {isStaffEditor ? (
            <VideoScriptPanel script={mod.videoScript} />
          ) : null}

          <QuizCard
            questions={mod.quiz}
            passScore={mod.passScore}
            moduleSlug={mod.slug}
            initialScore={moduleProgress?.quiz_score}
            initialAttempts={moduleProgress?.quiz_attempts}
            alreadyCompleted={Boolean(moduleProgress?.completed)}
          />

          <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-white/10 bg-white/[0.03] p-5">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                {moduleProgress?.completed
                  ? 'Module complete'
                  : 'Module in progress'}
              </div>
              <div className="mt-1 text-sm text-zinc-300">
                {moduleProgress?.completed
                  ? `Best score: ${moduleProgress.quiz_score}%`
                  : 'Complete the quiz with 80% or higher to unlock the next module.'}
              </div>
            </div>
            {next ? (
              <Link
                href={`/training/${next.slug}`}
                className="rounded-xl border border-cyan-400/40 bg-cyan-400/10 px-5 py-3 text-sm font-bold text-cyan-100 transition hover:bg-cyan-400/20"
              >
                Next: {next.title} →
              </Link>
            ) : (
              <Link
                href="/training"
                className="rounded-xl border border-white/15 bg-white/[0.06] px-5 py-3 text-sm font-bold text-white transition hover:bg-white/[0.1]"
              >
                Back to curriculum
              </Link>
            )}
          </div>
        </div>

        <aside className="lg:sticky lg:top-6 lg:h-fit">
          <ProgressTracker
            modules={TRAINING_MODULES}
            progress={progress}
            currentSlug={mod.slug}
          />
        </aside>
      </div>
    </TrainingShell>
  )
}
