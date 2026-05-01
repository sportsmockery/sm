import { ModuleCard } from './ModuleCard'
import type { TrainingModule } from '@/lib/training/curriculum'
import type { ProgressMap } from '@/lib/training/progress'

export function ModuleGrid({
  modules,
  progress,
}: {
  modules: TrainingModule[]
  progress: ProgressMap
}) {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {modules.map((module) => {
        const row = progress[module.slug]
        return (
          <ModuleCard
            key={module.slug}
            module={module}
            completed={Boolean(row?.completed)}
            score={row?.quiz_score}
          />
        )
      })}
    </section>
  )
}
