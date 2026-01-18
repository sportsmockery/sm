'use client'

import Link from 'next/link'
import { Montserrat } from 'next/font/google'
import { motion } from 'framer-motion'

const montserrat = Montserrat({ subsets: ['latin'], weight: ['700'] })

interface TrendingItem {
  id: string
  slug: string
  title: string
  category: {
    name: string
    slug: string
  }
  views?: number
  mockeryScore?: number
}

interface TrendingSidebarProps {
  items: TrendingItem[]
  title?: string
  className?: string
}

/**
 * Trending Sidebar
 *
 * Text-only list of trending stories:
 * - Mockery score indicator
 * - View count
 * - Fire emoji for hot takes
 */
export default function TrendingSidebar({
  items,
  title = 'Trending Mockery',
  className = '',
}: TrendingSidebarProps) {
  if (items.length === 0) {
    return null
  }

  return (
    <aside
      className={`bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 ${className}`}
      aria-labelledby="trending-sidebar-title"
    >
      {/* Header */}
      <header className="px-4 py-3 border-b border-red-600 bg-zinc-50 dark:bg-zinc-900">
        <h2
          id="trending-sidebar-title"
          className={`text-lg text-black dark:text-white uppercase tracking-wide flex items-center gap-2 ${montserrat.className}`}
        >
          <span className="text-red-600">🔥</span>
          {title}
        </h2>
      </header>

      {/* Trending list */}
      <ul className="divide-y divide-zinc-100 dark:divide-zinc-800" role="list">
        {items.map((item, index) => (
          <motion.li
            key={item.id}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Link
              href={`/${item.category.slug}/${item.slug}`}
              className="block p-4 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-red-600 group"
            >
              {/* Category and mockery score */}
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-red-600 font-bold uppercase">
                  {item.category.name}
                </span>
                {item.mockeryScore && (
                  <span
                    className={`text-xs font-bold ${
                      item.mockeryScore >= 80
                        ? 'text-red-600'
                        : item.mockeryScore >= 50
                        ? 'text-orange-500'
                        : 'text-zinc-500'
                    }`}
                  >
                    {item.mockeryScore}% Mockery
                  </span>
                )}
              </div>

              {/* Title */}
              <h3 className="text-sm text-black dark:text-white font-medium leading-snug group-hover:text-red-600 dark:group-hover:text-red-500 transition-colors line-clamp-2">
                {item.title}
              </h3>

              {/* Views */}
              {item.views && (
                <div className="mt-2 text-xs text-zinc-500 dark:text-zinc-500 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path
                      fillRule="evenodd"
                      d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {formatViews(item.views)}
                </div>
              )}
            </Link>
          </motion.li>
        ))}
      </ul>
    </aside>
  )
}

function formatViews(views: number): string {
  if (views >= 1000000) {
    return `${(views / 1000000).toFixed(1)}M views`
  }
  if (views >= 1000) {
    return `${(views / 1000).toFixed(1)}K views`
  }
  return `${views} views`
}
