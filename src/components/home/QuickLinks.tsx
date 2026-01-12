import Link from 'next/link'

interface QuickLink {
  label: string
  href: string
  icon?: React.ReactNode
  badge?: string
}

const defaultLinks: QuickLink[] = [
  {
    label: 'Bears',
    href: '/bears',
    icon: (
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0B162A] text-sm">🐻</span>
    ),
  },
  {
    label: 'Bulls',
    href: '/bulls',
    icon: (
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#CE1141] text-sm">🐂</span>
    ),
  },
  {
    label: 'Cubs',
    href: '/cubs',
    icon: (
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0E3386] text-sm">⚾</span>
    ),
  },
  {
    label: 'White Sox',
    href: '/whitesox',
    icon: (
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#27251F] text-sm">⚾</span>
    ),
  },
  {
    label: 'Blackhawks',
    href: '/blackhawks',
    icon: (
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#CF0A2C] text-sm">🏒</span>
    ),
  },
  {
    label: 'Fire',
    href: '/fire',
    icon: (
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#AF2626] text-sm">⚽</span>
    ),
  },
  {
    label: 'Predictions',
    href: '/predictions',
    badge: 'AI',
    icon: (
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 text-sm">🔮</span>
    ),
  },
  {
    label: 'Schedule',
    href: '/schedule',
    icon: (
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-700 text-sm">📅</span>
    ),
  },
]

interface QuickLinksProps {
  links?: QuickLink[]
  className?: string
}

export default function QuickLinks({ links = defaultLinks, className = '' }: QuickLinksProps) {
  return (
    <nav className={className} aria-label="Quick links">
      <div className="overflow-x-auto pb-2">
        <ul className="flex gap-2">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="group flex flex-col items-center gap-1.5 rounded-xl bg-white p-3 transition-all hover:bg-zinc-50 hover:shadow-md dark:bg-zinc-900 dark:hover:bg-zinc-800"
              >
                {/* Icon */}
                <div className="relative">
                  {link.icon}
                  {link.badge && (
                    <span className="absolute -right-1 -top-1 rounded bg-[#8B0000] px-1 text-[10px] font-bold text-white">
                      {link.badge}
                    </span>
                  )}
                </div>

                {/* Label */}
                <span className="whitespace-nowrap text-xs font-medium text-zinc-600 transition-colors group-hover:text-zinc-900 dark:text-zinc-400 dark:group-hover:text-white">
                  {link.label}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}

// Compact variant for mobile
export function QuickLinksCompact({ links = defaultLinks, className = '' }: QuickLinksProps) {
  return (
    <nav className={className} aria-label="Quick links">
      <div className="flex flex-wrap gap-2">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
          >
            {link.label}
            {link.badge && (
              <span className="rounded bg-[#8B0000] px-1 text-[10px] font-bold text-white">
                {link.badge}
              </span>
            )}
          </Link>
        ))}
      </div>
    </nav>
  )
}
