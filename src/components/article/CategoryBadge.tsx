import Link from 'next/link'

interface CategoryBadgeProps {
  slug: string
  name: string
  size?: 'sm' | 'md' | 'lg'
  clickable?: boolean
  className?: string
}

// Team color mapping based on category slug
function getTeamColors(slug: string): { bg: string; color: string } {
  const teamColors: Record<string, { bg: string; color: string }> = {
    'chicago-bears': { bg: '#C83200', color: '#FAFAFB' },
    bears: { bg: '#C83200', color: '#FAFAFB' },
    'chicago-bulls': { bg: '#CE1141', color: '#FAFAFB' },
    bulls: { bg: '#CE1141', color: '#FAFAFB' },
    'chicago-cubs': { bg: '#0E3386', color: '#FAFAFB' },
    cubs: { bg: '#0E3386', color: '#FAFAFB' },
    'chicago-white-sox': { bg: '#27251F', color: '#FAFAFB' },
    'white-sox': { bg: '#27251F', color: '#FAFAFB' },
    'chicago-blackhawks': { bg: '#CF0A2C', color: '#FAFAFB' },
    blackhawks: { bg: '#CF0A2C', color: '#FAFAFB' },
  }

  return teamColors[slug.toLowerCase()] || { bg: '#8B0000', color: '#FAFAFB' }
}

const sizeClasses = {
  sm: 'px-2 py-0.5 text-[10px]',
  md: 'px-3 py-1 text-xs',
  lg: 'px-4 py-1.5 text-sm',
}

export default function CategoryBadge({
  slug,
  name,
  size = 'sm',
  clickable = true,
  className = '',
}: CategoryBadgeProps) {
  const colors = getTeamColors(slug)
  const baseClasses = `inline-flex items-center rounded-full font-bold uppercase tracking-wider transition-colors ${sizeClasses[size]} ${className}`
  const baseStyle = { backgroundColor: colors.bg, color: colors.color }

  if (clickable) {
    return (
      <Link href={`/${slug}`} className={baseClasses} style={baseStyle}>
        {name}
      </Link>
    )
  }

  return <span className={baseClasses} style={baseStyle}>{name}</span>
}
