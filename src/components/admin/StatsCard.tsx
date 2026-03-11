import Link from 'next/link'

interface StatsCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  trend?: {
    value: number
    label: string
    direction: 'up' | 'down' | 'neutral'
  }
  href?: string
  color?: 'default' | 'red' | 'green' | 'blue' | 'yellow' | 'purple'
  className?: string
}

const colorVariants = {
  default: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400',
  red: 'bg-[#BC0000]/10 text-[#BC0000] dark:bg-[#BC0000]/30 dark:text-[#BC0000]',
  green: 'bg-[#00D4FF]/10 text-[#00D4FF] dark:bg-[#00D4FF]/30 dark:text-[#00D4FF]',
  blue: 'bg-[#00D4FF]/10 text-[#00D4FF] dark:bg-[#00D4FF]/30 dark:text-[#00D4FF]',
  yellow: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400',
  purple: 'bg-[#D6B05E]/10 text-[#D6B05E] dark:bg-[#D6B05E]/30 dark:text-[#D6B05E]',
}

export default function StatsCard({
  title,
  value,
  icon,
  trend,
  href,
  color = 'default',
  className = '',
}: StatsCardProps) {
  const CardContent = (
    <div
      className={`group rounded-xl p-6 transition-all hover:shadow-md ${className}`}
      style={{
        backgroundColor: 'var(--bg-card, #FAFAFB)',
        border: '1px solid var(--border-default, #e0e0e0)',
      }}
    >
      <div className="flex items-center justify-between">
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${colorVariants[color]}`}>
          {icon}
        </div>
        {trend && (
          <div
            className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
              trend.direction === 'up'
                ? 'bg-[#00D4FF]/10 text-[#00D4FF] dark:bg-[#00D4FF]/30 dark:text-[#00D4FF]'
                : trend.direction === 'down'
                ? 'bg-[#BC0000]/10 text-[#BC0000] dark:bg-[#BC0000]/30 dark:text-[#BC0000]'
                : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
            }`}
          >
            {trend.direction === 'up' && (
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
              </svg>
            )}
            {trend.direction === 'down' && (
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            )}
            {trend.value > 0 ? '+' : ''}{trend.value}%
          </div>
        )}
      </div>

      <div className="mt-4">
        <p className="text-3xl font-bold" style={{ color: 'var(--text-primary, #222222)' }}>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </p>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-muted, #666666)' }}>{title}</p>
      </div>

      {trend && (
        <p className="mt-2 text-xs" style={{ color: 'var(--text-muted, #666666)' }}>{trend.label}</p>
      )}

      {href && (
        <div className="mt-4 flex items-center text-sm text-[#8B0000] opacity-0 transition-opacity group-hover:opacity-100 dark:text-[#FF6666]">
          View details
          <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </div>
      )}
    </div>
  )

  if (href) {
    return <Link href={href}>{CardContent}</Link>
  }

  return CardContent
}
