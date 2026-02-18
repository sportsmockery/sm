interface MockeryCommentaryProps {
  commentary: string
  className?: string
}

export default function MockeryCommentary({
  commentary,
  className = '',
}: MockeryCommentaryProps) {
  if (!commentary) return null

  return (
    <div
      className={`relative overflow-hidden rounded-xl border-l-4 p-5 ${className}`}
      style={{
        borderLeftColor: '#8B0000',
        background: 'linear-gradient(to right, color-mix(in srgb, var(--sm-accent) 10%, transparent), var(--sm-surface), var(--sm-surface))',
      }}
    >
      {/* Fire emoji decoration */}
      <div className="absolute -right-4 -top-4 text-6xl opacity-10">🔥</div>

      {/* Header */}
      <div className="mb-2 flex items-center gap-2">
        <span className="text-2xl">🔥</span>
        <span className="font-heading text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--sm-accent)' }}>
          SM Take
        </span>
      </div>

      {/* Commentary text */}
      <p className="relative z-10 text-lg italic leading-relaxed" style={{ color: 'var(--sm-text-muted)' }}>
        &ldquo;{commentary}&rdquo;
      </p>

      {/* Attribution */}
      <div className="mt-3 flex items-center gap-2">
        <div className="h-px flex-1 bg-gradient-to-r from-[#8B0000]/30 to-transparent" />
        <span className="text-xs font-semibold" style={{ color: 'var(--sm-text-muted)' }}>
          SportsMockery.com
        </span>
      </div>
    </div>
  )
}
