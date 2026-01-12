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
      className={`relative overflow-hidden rounded-xl border-l-4 border-[#8B0000] bg-gradient-to-r from-[#8B0000]/10 via-zinc-100 to-zinc-100 p-5 dark:from-[#8B0000]/20 dark:via-zinc-900 dark:to-zinc-900 ${className}`}
    >
      {/* Fire emoji decoration */}
      <div className="absolute -right-4 -top-4 text-6xl opacity-10">🔥</div>

      {/* Header */}
      <div className="mb-2 flex items-center gap-2">
        <span className="text-2xl">🔥</span>
        <span className="font-heading text-sm font-bold uppercase tracking-wider text-[#8B0000] dark:text-[#FF6666]">
          SM Take
        </span>
      </div>

      {/* Commentary text */}
      <p className="relative z-10 text-lg italic leading-relaxed text-zinc-700 dark:text-zinc-300">
        &ldquo;{commentary}&rdquo;
      </p>

      {/* Attribution */}
      <div className="mt-3 flex items-center gap-2">
        <div className="h-px flex-1 bg-gradient-to-r from-[#8B0000]/30 to-transparent" />
        <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-500">
          SportsMockery.com
        </span>
      </div>
    </div>
  )
}
