const TEAM_LOGOS: Record<string, string> = {
  bears: '/logos/bears.svg',
  bulls: '/logos/bulls.svg',
  blackhawks: '/logos/blackhawks.svg',
  cubs: '/logos/cubs.svg',
  whitesox: '/logos/whitesox.svg',
}

export function TeamLogo({ teamKey, size = 32, className = '' }: { teamKey: string; size?: number; className?: string }) {
  const src = TEAM_LOGOS[teamKey]
  if (!src) return null
  return <img src={src} alt={teamKey} width={size} height={size} className={`object-contain ${className}`} />
}
