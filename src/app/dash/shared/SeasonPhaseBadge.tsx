const PHASE_COLORS: Record<string, string> = {
  contending: '#16a34a',
  rebuilding: '#666666',
  retooling: '#D6B05E',
  transitional: '#888888',
}

export function SeasonPhaseBadge({ phase }: { phase: string }) {
  const color = PHASE_COLORS[phase] || '#888888'
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-[13px] font-medium capitalize"
      style={{ backgroundColor: `${color}20`, color }}
    >
      {phase}
    </span>
  )
}
