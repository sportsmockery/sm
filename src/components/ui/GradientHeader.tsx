import { getTeamColors } from '@/styles/colors'

interface GradientHeaderProps {
  title: string
  subtitle?: string
  teamSlug?: string
  postCount?: number
  children?: React.ReactNode
}

export default function GradientHeader({
  title,
  subtitle,
  teamSlug,
  postCount,
  children,
}: GradientHeaderProps) {
  const teamColors = teamSlug ? getTeamColors(teamSlug) : null
  const gradientClass = teamSlug
    ? `gradient-${teamSlug.replace('chicago-', '').replace('-', '')}`
    : ''

  return (
    <header
      className={`relative overflow-hidden ${gradientClass}`}
      style={
        teamColors
          ? { background: teamColors.gradient }
          : { background: 'linear-gradient(135deg, #8B0000 0%, #000000 100%)' }
      }
    >
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20" />

      {/* Content */}
      <div className="relative mx-auto max-w-6xl px-4 py-16 md:py-24">
        <div className="animate-slide-up">
          {subtitle && (
            <p className="text-white/80 text-sm font-semibold uppercase tracking-wider mb-3">
              {subtitle}
            </p>
          )}

          <h1 className="text-4xl md:text-6xl font-black text-white mb-4 font-[var(--font-montserrat)]">
            {title}
          </h1>

          {postCount !== undefined && (
            <p className="text-white/70 text-lg">
              {postCount.toLocaleString()} {postCount === 1 ? 'article' : 'articles'}
            </p>
          )}

          {children}
        </div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          viewBox="0 0 1440 60"
          className="w-full h-8 md:h-12"
          preserveAspectRatio="none"
        >
          <path
            d="M0,60 L0,30 Q360,0 720,30 T1440,30 L1440,60 Z"
            className="fill-zinc-50 dark:fill-zinc-950"
          />
        </svg>
      </div>
    </header>
  )
}
