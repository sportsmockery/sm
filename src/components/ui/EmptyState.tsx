import Link from 'next/link'

interface EmptyStateProps {
  icon?: 'search' | 'articles' | 'comments' | 'notifications' | 'bookmarks'
  title: string
  description?: string
  action?: {
    label: string
    href?: string
    onClick?: () => void
  }
  className?: string
}

const icons = {
  search: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
    />
  ),
  articles: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
    />
  ),
  comments: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
    />
  ),
  notifications: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
    />
  ),
  bookmarks: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z"
    />
  ),
}

export default function EmptyState({
  icon = 'articles',
  title,
  description,
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <div className={`py-12 text-center ${className}`}>
      {/* Icon */}
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full" style={{ backgroundColor: 'var(--sm-surface)' }}>
        <svg
          className="h-8 w-8"
          style={{ color: 'var(--sm-text-muted)' }}
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          {icons[icon]}
        </svg>
      </div>

      {/* Title */}
      <h3 className="mb-2 font-semibold" style={{ color: 'var(--sm-text)' }}>
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p className="mb-6 text-sm max-w-sm mx-auto" style={{ color: 'var(--sm-text-muted)' }}>
          {description}
        </p>
      )}

      {/* Action button */}
      {action && (
        action.href ? (
          <Link
            href={action.href}
            className="inline-flex items-center gap-2 rounded-lg bg-[#8B0000] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#a00000] dark:bg-[#FF6666] dark:hover:bg-[#FF8888]"
          >
            {action.label}
          </Link>
        ) : (
          <button
            onClick={action.onClick}
            className="inline-flex items-center gap-2 rounded-lg bg-[#8B0000] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#a00000] dark:bg-[#FF6666] dark:hover:bg-[#FF8888]"
          >
            {action.label}
          </button>
        )
      )}
    </div>
  )
}
