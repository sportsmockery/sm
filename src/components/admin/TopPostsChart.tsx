'use client'

interface TopPost {
  id: number
  title: string
  slug: string
  views: number
  categorySlug: string
}

interface TopPostsChartProps {
  data?: TopPost[]
}

export default function TopPostsChart({ data = [] }: TopPostsChartProps) {
  const maxViews = Math.max(...data.map(p => p.views), 1)

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <h3 className="mb-4 font-semibold text-zinc-900 dark:text-white">Top Posts</h3>
      {data.length === 0 ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">No data available</p>
      ) : (
        <div className="space-y-3">
          {data.slice(0, 5).map((post, i) => (
            <div key={i}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="truncate text-zinc-700 dark:text-zinc-300">{post.title}</span>
                <span className="text-zinc-500 dark:text-zinc-400">{post.views}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                <div
                  className="h-full bg-[#8B0000] dark:bg-[#FF6666] rounded-full"
                  style={{ width: `${(post.views / maxViews) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

