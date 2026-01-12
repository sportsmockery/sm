import Link from 'next/link'

interface CategoryBadgeProps {
  slug: string
  name: string
  size?: 'sm' | 'md' | 'lg'
  clickable?: boolean
  className?: string
}

// Team color mapping based on category slug
function getTeamColors(slug: string): { bg: string; text: string; hover: string } {
  const teamColors: Record<string, { bg: string; text: string; hover: string }> = {
    'chicago-bears': {
      bg: 'bg-[#C83200]',
      text: 'text-white',
      hover: 'hover:bg-[#a02800]',
    },
    bears: {
      bg: 'bg-[#C83200]',
      text: 'text-white',
      hover: 'hover:bg-[#a02800]',
    },
    'chicago-bulls': {
      bg: 'bg-[#CE1141]',
      text: 'text-white',
      hover: 'hover:bg-[#a00d33]',
    },
    bulls: {
      bg: 'bg-[#CE1141]',
      text: 'text-white',
      hover: 'hover:bg-[#a00d33]',
    },
    'chicago-cubs': {
      bg: 'bg-[#0E3386]',
      text: 'text-white',
      hover: 'hover:bg-[#0a266b]',
    },
    cubs: {
      bg: 'bg-[#0E3386]',
      text: 'text-white',
      hover: 'hover:bg-[#0a266b]',
    },
    'chicago-white-sox': {
      bg: 'bg-[#27251F]',
      text: 'text-white',
      hover: 'hover:bg-[#3a3830]',
    },
    'white-sox': {
      bg: 'bg-[#27251F]',
      text: 'text-white',
      hover: 'hover:bg-[#3a3830]',
    },
    'chicago-blackhawks': {
      bg: 'bg-[#CF0A2C]',
      text: 'text-white',
      hover: 'hover:bg-[#a00822]',
    },
    blackhawks: {
      bg: 'bg-[#CF0A2C]',
      text: 'text-white',
      hover: 'hover:bg-[#a00822]',
    },
  }

  return teamColors[slug.toLowerCase()] || {
    bg: 'bg-[#8B0000]',
    text: 'text-white',
    hover: 'hover:bg-[#6d0000]',
  }
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
  const baseClasses = `inline-flex items-center rounded-full font-bold uppercase tracking-wider transition-colors ${colors.bg} ${colors.text} ${sizeClasses[size]} ${className}`

  if (clickable) {
    return (
      <Link href={`/${slug}`} className={`${baseClasses} ${colors.hover}`}>
        {name}
      </Link>
    )
  }

  return <span className={baseClasses}>{name}</span>
}
