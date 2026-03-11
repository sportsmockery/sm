import Link from 'next/link'

interface AdminCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  href?: string
  change?: {
    value: number
    label: string
  }
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'pink'
  className?: string
}

const colorClasses = {
  blue: {
    bg: 'bg-[#00D4FF]',
    light: 'bg-[#00D4FF]/10 dark:bg-[#00D4FF]/30',
    text: 'text-[#00D4FF] dark:text-[#00D4FF]',
  },
  green: {
    bg: 'bg-[#00D4FF]',
    light: 'bg-[#00D4FF]/10 dark:bg-[#00D4FF]/30',
    text: 'text-[#00D4FF] dark:text-[#00D4FF]',
  },
  yellow: {
    bg: 'bg-yellow-500',
    light: 'bg-yellow-100 dark:bg-yellow-900/30',
    text: 'text-yellow-600 dark:text-yellow-400',
  },
  red: {
    bg: 'bg-red-500',
    light: 'bg-[#BC0000]/10 dark:bg-[#BC0000]/30',
    text: 'text-[#BC0000] dark:text-[#BC0000]',
  },
  purple: {
    bg: 'bg-[#D6B05E]',
    light: 'bg-[#D6B05E]/10 dark:bg-[#D6B05E]/30',
    text: 'text-[#D6B05E] dark:text-[#D6B05E]',
  },
  pink: {
    bg: 'bg-pink-500',
    light: 'bg-[#BC0000]/10 dark:bg-[#BC0000]/30',
    text: 'text-[#BC0000] dark:text-[#BC0000]',
  },
}

export default function AdminCard({
  title,
  value,
  icon,
  href,
  change,
  color = 'blue',
  className = '',
}: AdminCardProps) {
  const colors = colorClasses[color]

  const content = (
    <div
      className={`rounded-xl border border-zinc-200 bg-white p-6 transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 ${className}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{title}</p>
          <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-white">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {change && (
            <p className={`mt-1 flex items-center gap-1 text-sm ${change.value >= 0 ? 'text-[#00D4FF]' : 'text-[#BC0000]'}`}>
              {change.value >= 0 ? (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
                </svg>
              ) : (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6L9 12.75l4.286-4.286a11.948 11.948 0 014.306 6.43l.776 2.898m0 0l3.182-5.511m-3.182 5.51l-5.511-3.181" />
                </svg>
              )}
              {change.value >= 0 ? '+' : ''}{change.value}% {change.label}
            </p>
          )}
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${colors.light}`}>
          <div className={colors.text}>{icon}</div>
        </div>
      </div>
    </div>
  )

  if (href) {
    return <Link href={href}>{content}</Link>
  }

  return content
}
