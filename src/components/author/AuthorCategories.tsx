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
  return colors[slug] || 'bg-[#BC0000]'
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
      className={`rounded-2xl p-6 ${className}`}
      style={{ border: '1px solid var(--border-default)', backgroundColor: 'var(--bg-card)' }}
    >
      <h2 className="mb-4 flex items-center gap-2 text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
        <svg
          className="h-5 w-5"
          style={{ color: '#BC0000' }}
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
              <span className="text-sm font-medium transition-colors group-hover:text-[#BC0000]" style={{ color: 'var(--text-primary)' }}>
                {cat.name}
              </span>
              <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                {cat.count} ({Math.round((cat.count / total) * 100)}%)
              </span>
            </div>
            <div className="h-3 overflow-hidden rounded-full" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
              <div
                className={`h-full rounded-full transition-all group-hover:opacity-80 ${getTeamColor(cat.slug)}`}
                style={{ width: `${(cat.count / total) * 100}%` }}
              />
            </div>
          </Link>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--border-default)' }}>
        <p className="text-center text-xs" style={{ color: 'var(--text-muted)' }}>
          Total: {total} articles across {categories.length} teams
        </p>
      </div>
    </section>
  )
}
