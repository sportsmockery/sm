import Link from 'next/link'

interface QuickAction {
  label: string
  description: string
  href: string
  icon: React.ReactNode
  color: string
  hoverBorder: string
}

const defaultActions: QuickAction[] = [
  {
    label: 'New Post',
    description: 'Create a new article',
    href: '/admin/posts/new',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
      </svg>
    ),
    color: 'bg-[var(--accent-red-glow)] text-[var(--accent-red)]',
    hoverBorder: 'hover:border-[var(--accent-red)]',
  },
  {
    label: 'Create Chart',
    description: 'Build data visualization',
    href: '/admin/charts/new',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
    color: 'bg-blue-500/10 text-blue-500',
    hoverBorder: 'hover:border-blue-500',
  },
  {
    label: 'Upload Media',
    description: 'Add images & files',
    href: '/admin/media',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
      </svg>
    ),
    color: 'bg-emerald-500/10 text-emerald-500',
    hoverBorder: 'hover:border-emerald-500',
  },
  {
    label: 'Add Author',
    description: 'Create new contributor',
    href: '/admin/authors/new',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
      </svg>
    ),
    color: 'bg-purple-500/10 text-purple-500',
    hoverBorder: 'hover:border-purple-500',
  },
  {
    label: 'AI Assistant',
    description: 'Generate content ideas',
    href: '/admin/ai',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
      </svg>
    ),
    color: 'bg-amber-500/10 text-amber-500',
    hoverBorder: 'hover:border-amber-500',
  },
]

interface QuickActionsProps {
  actions?: QuickAction[]
  className?: string
}

export default function QuickActions({ actions = defaultActions, className = '' }: QuickActionsProps) {
  return (
    <div className={`${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">Quick Actions</h2>
      </div>
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
        {actions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className={`group flex flex-col items-center gap-3 rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] p-5 text-center transition-all hover:shadow-md ${action.hoverBorder}`}
          >
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${action.color} transition-transform group-hover:scale-110`}>
              {action.icon}
            </div>
            <div>
              <p className="font-semibold text-[var(--text-primary)]">{action.label}</p>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">{action.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

// Compact version for sidebar
export function QuickActionsCompact({ className = '' }: { className?: string }) {
  return (
    <div className={`space-y-2 ${className}`}>
      <Link
        href="/admin/posts/new"
        className="flex items-center gap-3 rounded-lg bg-[var(--accent-red)] px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-[var(--accent-red-hover)]"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        New Post
      </Link>
      <div className="grid grid-cols-2 gap-2">
        <Link
          href="/admin/charts/new"
          className="flex items-center justify-center gap-2 rounded-lg border border-[var(--border-default)] px-3 py-2 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75z" />
          </svg>
          Chart
        </Link>
        <Link
          href="/admin/media"
          className="flex items-center justify-center gap-2 rounded-lg border border-[var(--border-default)] px-3 py-2 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
          Media
        </Link>
      </div>
    </div>
  )
}
