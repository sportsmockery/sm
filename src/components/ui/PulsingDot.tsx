interface PulsingDotProps {
  color?: 'red' | 'green' | 'yellow' | 'blue'
  size?: 'sm' | 'md' | 'lg'
  label?: string
  className?: string
}

const colorClasses = {
  red: 'bg-red-500',
  green: 'bg-green-500',
  yellow: 'bg-yellow-500',
  blue: 'bg-blue-500',
}

const pulseColors = {
  red: 'bg-red-400',
  green: 'bg-green-400',
  yellow: 'bg-yellow-400',
  blue: 'bg-blue-400',
}

const sizeClasses = {
  sm: 'h-2 w-2',
  md: 'h-3 w-3',
  lg: 'h-4 w-4',
}

export default function PulsingDot({
  color = 'red',
  size = 'md',
  label,
  className = '',
}: PulsingDotProps) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <span className="relative flex">
        {/* Pulsing ring */}
        <span
          className={`
            absolute inline-flex h-full w-full animate-ping rounded-full opacity-75
            ${pulseColors[color]}
          `}
        />
        {/* Solid dot */}
        <span
          className={`
            relative inline-flex rounded-full
            ${colorClasses[color]}
            ${sizeClasses[size]}
          `}
        />
      </span>
      {label && (
        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          {label}
        </span>
      )}
    </span>
  )
}
