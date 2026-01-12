import { ReactNode } from 'react'

interface TeamColorBadgeProps {
  team: 'bears' | 'bulls' | 'cubs' | 'whiteSox' | 'blackhawks' | string
  children: ReactNode
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const teamColors: Record<string, { bg: string; text: string }> = {
  bears: { bg: 'bg-[#C83200]', text: 'text-white' },
  'chicago-bears': { bg: 'bg-[#C83200]', text: 'text-white' },
  bulls: { bg: 'bg-[#CE1141]', text: 'text-white' },
  'chicago-bulls': { bg: 'bg-[#CE1141]', text: 'text-white' },
  cubs: { bg: 'bg-[#0E3386]', text: 'text-white' },
  'chicago-cubs': { bg: 'bg-[#0E3386]', text: 'text-white' },
  whiteSox: { bg: 'bg-[#27251F]', text: 'text-white' },
  'white-sox': { bg: 'bg-[#27251F]', text: 'text-white' },
  'chicago-white-sox': { bg: 'bg-[#27251F]', text: 'text-white' },
  blackhawks: { bg: 'bg-[#CF0A2C]', text: 'text-white' },
  'chicago-blackhawks': { bg: 'bg-[#CF0A2C]', text: 'text-white' },
}

const defaultColors = { bg: 'bg-[#8B0000]', text: 'text-white' }

const sizeClasses = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm',
  lg: 'px-4 py-1.5 text-base',
}

export default function TeamColorBadge({
  team,
  children,
  size = 'md',
  className = '',
}: TeamColorBadgeProps) {
  const colors = teamColors[team] || teamColors[team.toLowerCase()] || defaultColors

  return (
    <span
      className={`
        inline-flex items-center rounded-full font-semibold
        ${colors.bg} ${colors.text}
        ${sizeClasses[size]}
        ${className}
      `}
    >
      {children}
    </span>
  )
}
