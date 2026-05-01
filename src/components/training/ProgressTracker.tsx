import type { TrainingModule } from '@/lib/training/curriculum'
import type { ProgressMap } from '@/lib/training/progress'

export function ProgressTracker({
  modules,
  progress,
  currentSlug,
}: {
  modules: TrainingModule[]
  progress: ProgressMap
  currentSlug?: string
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl">
      <div className="text-xs font-semibold uppercase tracking-wider text-cyan-300">
        Curriculum
      </div>
      <ol className="mt-3 space-y-2">
        {modules.map((m) => {
          const completed = progress[m.slug]?.completed
          const isCurrent = m.slug === currentSlug
          return (
            <li
              key={m.slug}
              className={`flex items-center gap-3 rounded-xl border px-3 py-2 text-sm transition ${
                isCurrent
                  ? 'border-cyan-400/40 bg-cyan-400/10 text-white'
                  : 'border-white/5 bg-black/20 text-zinc-300'
              }`}
            >
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                  completed
                    ? 'bg-cyan-400 text-black'
                    : 'border border-white/15 text-zinc-400'
                }`}
              >
                {completed ? '✓' : m.order}
              </span>
              <div className="flex-1 truncate">
                <div className="truncate font-semibold">{m.title}</div>
                <div className="truncate text-xs text-zinc-500">
                  {m.duration}
                </div>
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
