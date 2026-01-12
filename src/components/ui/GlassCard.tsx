import { ReactNode } from 'react'

interface GlassCardProps {
  children: ReactNode
  variant?: 'light' | 'dark'
  blur?: 'sm' | 'md' | 'lg'
  className?: string
}

const blurClasses = {
  sm: 'backdrop-blur-sm',
  md: 'backdrop-blur-md',
  lg: 'backdrop-blur-lg',
}

export default function GlassCard({
  children,
  variant = 'light',
  blur = 'md',
  className = '',
}: GlassCardProps) {
  return (
    <div
      className={`
        rounded-2xl border
        ${blurClasses[blur]}
        ${variant === 'light'
          ? 'border-white/20 bg-white/10'
          : 'border-white/10 bg-black/50'
        }
        ${className}
      `}
    >
      {children}
    </div>
  )
}
