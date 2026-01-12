'use client'

interface ViewsChartProps {
  data?: Array<{ date: string; views: number }>
}

export default function ViewsChart({ data = [] }: ViewsChartProps) {
  const maxViews = Math.max(...data.map(d => d.views), 1)

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <h3 className="mb-4 font-semibold text-zinc-900 dark:text-white">Page Views</h3>
      {data.length === 0 ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">No data available</p>
      ) : (
        <div className="flex h-40 items-end gap-1">
          {data.map((item, i) => (
            <div
              key={i}
              className="flex-1 bg-[#8B0000] dark:bg-[#FF6666] rounded-t transition-all hover:opacity-80"
              style={{ height: `${(item.views / maxViews) * 100}%` }}
              title={`${item.date}: ${item.views} views`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

