import Link from 'next/link'
import type { TrainingModule } from '@/lib/training/curriculum'

export function ModuleCard({
  module,
  completed,
  score,
}: {
  module: TrainingModule
  completed: boolean
  score?: number
}) {
  return (
    <Link
      href={`/training/${module.slug}`}
      className="group block rounded-2xl border border-white/10 bg-white/[0.035] p-5 backdrop-blur-xl transition hover:-translate-y-1 hover:border-cyan-400/40 hover:bg-white/[0.06]"
    >
      <div className="mb-4 flex items-center justify-between">
        <span className="rounded-full bg-[#bc0000]/20 px-3 py-1 text-xs font-semibold text-red-300">
          {module.duration}
        </span>
        <span
          className={
            completed
              ? 'text-xs font-semibold uppercase tracking-wider text-cyan-300'
              : 'text-xs font-semibold uppercase tracking-wider text-zinc-500'
          }
        >
          {completed ? `Completed${score ? ` · ${score}%` : ''}` : 'Start →'}
        </span>
      </div>

      <div className="mb-3 flex items-center gap-2 text-xs text-zinc-500">
        <span>Module {module.order}</span>
      </div>

      <h3 className="text-xl font-bold text-white">{module.title}</h3>
      <p className="mt-2 text-sm text-zinc-400">{module.subtitle}</p>

      <div className="mt-5 h-px bg-gradient-to-r from-cyan-400/70 via-white/10 to-transparent" />

      <p className="mt-4 text-sm text-zinc-300">{module.description}</p>
    </Link>
  )
}
