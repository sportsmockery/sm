'use client'

interface CategoryStats {
  category: string
  count: number
  percentage: number
}

interface CategoryBreakdownProps {
  data?: CategoryStats[]
}

const defaultColors = ['#8B0000', '#0B162A', '#CE1141', '#0E3386', '#27251F', '#CF0A2C']

export default function CategoryBreakdown({ data = [] }: CategoryBreakdownProps) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <h3 className="mb-4 font-semibold text-zinc-900 dark:text-white">Category Breakdown</h3>
      {data.length === 0 ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">No data available</p>
      ) : (
        <div className="space-y-3">
          {data.map((cat, i) => (
            <div key={i} className="flex items-center gap-3">
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: defaultColors[i % defaultColors.length] }}
              />
              <span className="flex-1 text-sm text-zinc-700 dark:text-zinc-300">{cat.category}</span>
              <span className="text-sm text-zinc-500 dark:text-zinc-400">
                {Math.round(cat.percentage)}%
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
