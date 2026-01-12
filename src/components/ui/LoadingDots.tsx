interface LoadingDotsProps {
  size?: 'sm' | 'md' | 'lg'
  color?: 'primary' | 'white' | 'current' | 'muted'
  className?: string
}

const sizes = {
  sm: 'h-1.5 w-1.5',
  md: 'h-2 w-2',
  lg: 'h-3 w-3',
}

const gaps = {
  sm: 'gap-1',
  md: 'gap-1.5',
  lg: 'gap-2',
}

const colors = {
  primary: 'bg-[#8B0000] dark:bg-[#FF6666]',
  white: 'bg-white',
  current: 'bg-current',
  muted: 'bg-zinc-400 dark:bg-zinc-600',
}

export default function LoadingDots({
  size = 'md',
  color = 'primary',
  className = '',
}: LoadingDotsProps) {
  return (
    <div
      className={`inline-flex items-center ${gaps[size]} ${className}`}
      role="status"
      aria-label="Loading"
    >
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className={`${sizes[size]} ${colors[color]} rounded-full animate-bounce`}
          style={{
            animationDelay: `${i * 150}ms`,
            animationDuration: '600ms',
          }}
        />
      ))}
      <span className="sr-only">Loading...</span>
    </div>
  )
}
