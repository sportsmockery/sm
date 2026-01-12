import Link from 'next/link'

interface CategoryBreakdown {
  name: string
  slug: string
  count: number
  percentage: number
}

interface AuthorCategoriesProps {
  categories: CategoryBreakdown[]
  authorId: number | string
  className?: string
}

// Get team colors
function getTeamColor(slug: string): string {
  const colors: Record<string, string> = {
    'chicago-bears': 'bg-[#C83200]',
    bears: 'bg-[#C83200]',
    'chicago-bulls': 'bg-[#CE1141]',
    bulls: 'bg-[#CE1141]',
    'chicago-cubs': 'bg-[#0E3386]',
    cubs: 'bg-[#0E3386]',
    'chicago-white-sox': 'bg-[#27251F]',
    'white-sox': 'bg-[#27251F]',
    'chicago-blackhawks': 'bg-[#CF0A2C]',
    blackhawks: 'bg-[#CF0A2C]',
  }
  return colors[slug] || 'bg-[#8B0000]'
}

export default function AuthorCategories({
  categories,
  authorId,
  className = '',
}: AuthorCategoriesProps) {
  if (categories.length === 0) return null

  const total = categories.reduce((sum, cat) => sum + cat.count, 0)

  return (
    <section
      className={`rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 ${className}`}
    >
      <h2 className="mb-4 flex items-center gap-2 font-heading text-lg font-bold text-zinc-900 dark:text-white">
        <svg
          className="h-5 w-5 text-[#8B0000] dark:text-[#FF6666]"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z"
          />
        </svg>
        Category Breakdown
      </h2>

      {/* Simple bar chart */}
      <div className="space-y-4">
        {categories.map((cat) => (
          <Link
            key={cat.slug}
            href={`/author/${authorId}?category=${cat.slug}`}
            className="group block"
          >
            <div className="mb-1 flex items-center justify-between">
              <span className="text-sm font-medium text-zinc-700 transition-colors group-hover:text-[#8B0000] dark:text-zinc-300 dark:group-hover:text-[#FF6666]">
                {cat.name}
              </span>
              <span className="text-sm text-zinc-500 dark:text-zinc-400">
                {cat.count} ({Math.round((cat.count / total) * 100)}%)
              </span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
              <div
                className={`h-full rounded-full transition-all group-hover:opacity-80 ${getTeamColor(cat.slug)}`}
                style={{ width: `${(cat.count / total) * 100}%` }}
              />
            </div>
          </Link>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-4 border-t border-zinc-200 pt-4 dark:border-zinc-700">
        <p className="text-center text-xs text-zinc-500 dark:text-zinc-400">
          Total: {total} articles across {categories.length} teams
        </p>
      </div>
    </section>
  )
}
