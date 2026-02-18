interface AdPlaceholderProps {
  size: 'banner' | 'sidebar' | 'inline' | 'leaderboard' | 'rectangle'
  className?: string
  label?: string
}

const sizeClasses = {
  banner: 'h-24 w-full', // 728x90 or responsive
  sidebar: 'h-[250px] w-[300px]', // 300x250
  inline: 'h-[100px] w-full', // In-content ad
  leaderboard: 'h-[90px] w-full max-w-[728px]', // 728x90
  rectangle: 'h-[280px] w-[336px]', // 336x280
}

export default function AdPlaceholder({
  size,
  className = '',
  label = 'Advertisement',
}: AdPlaceholderProps) {
  return (
    <div
      className={`
        flex items-center justify-center
        rounded-lg border-2 border-dashed
        ${sizeClasses[size]}
        ${className}
      `}
      style={{ backgroundColor: 'var(--sm-card)', borderColor: 'var(--sm-border)' }}
    >
      <div className="text-center">
        <svg
          className="mx-auto mb-2 h-8 w-8"
          style={{ color: 'var(--sm-text-dim)' }}
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z"
          />
        </svg>
        <span className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--sm-text-dim)' }}>
          {label}
        </span>
      </div>
    </div>
  )
}

// Export size information for reference
export const adSizes = {
  banner: { width: 728, height: 90, description: 'Leaderboard banner' },
  sidebar: { width: 300, height: 250, description: 'Medium rectangle' },
  inline: { width: 'fluid', height: 100, description: 'In-content ad' },
  leaderboard: { width: 728, height: 90, description: 'Top banner' },
  rectangle: { width: 336, height: 280, description: 'Large rectangle' },
}
