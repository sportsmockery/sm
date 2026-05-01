import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { TrainingShell } from '@/components/training/TrainingShell'
import { TrainingHero } from '@/components/training/TrainingHero'
import { ModuleGrid } from '@/components/training/ModuleGrid'
import { CertificationCard } from '@/components/training/CertificationCard'
import { TRAINING_MODULES, TOTAL_MODULES } from '@/lib/training/curriculum'
import {
  fetchUserProgress,
  fetchUserCertification,
  countCompletedModules,
  averageScore,
} from '@/lib/training/progress'
import { requireTrainingAccess } from '@/lib/training-auth'

export const metadata: Metadata = {
  title: 'EDGE Writer Training · Sports Mockery',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

export default async function TrainingHomePage() {
  const access = await requireTrainingAccess()

  if (!access.ok) {
    if (access.status === 401) {
      redirect('/login?next=/training')
    }
    return (
      <TrainingShell>
        <div className="mx-auto max-w-xl rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-center backdrop-blur-xl">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-red-500/40 bg-red-500/10 text-2xl text-red-300">
            ✕
          </div>
          <h1 className="text-2xl font-bold">Access denied</h1>
          <p className="mt-2 text-sm text-zinc-400">
            You do not have access to writer training.
          </p>
        </div>
      </TrainingShell>
    )
  }

  const [progress, cert] = await Promise.all([
    fetchUserProgress(access.userId),
    fetchUserCertification(access.userId),
  ])

  const completed = countCompletedModules(progress)
  const overallScore = cert?.overall_score ?? averageScore(progress)
  const certified = Boolean(cert?.certified)

  return (
    <TrainingShell>
      <TrainingHero completed={completed} total={TOTAL_MODULES} />
      <ModuleGrid modules={TRAINING_MODULES} progress={progress} />
      <div className="mt-10">
        <CertificationCard
          certified={certified}
          score={overallScore}
          completed={completed}
          total={TOTAL_MODULES}
        />
      </div>
    </TrainingShell>
  )
}
