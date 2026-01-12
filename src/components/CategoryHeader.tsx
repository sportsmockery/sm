import { getTeamColor } from '@/styles/theme'

interface CategoryHeaderProps {
  name: string
  slug: string
  postCount?: number
}

export default function CategoryHeader({ name, slug, postCount }: CategoryHeaderProps) {
  const teamColor = getTeamColor(slug)
  const primaryColor = teamColor?.primary || '#8B0000'
  const secondaryColor = teamColor?.secondary || '#1a1a1a'

  return (
    <header
      className="relative overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
      }}
    >
      {/* Decorative pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5" />
          </pattern>
          <rect width="100" height="100" fill="url(#grid)" />
        </svg>
      </div>

      <div className="relative mx-auto max-w-6xl px-4 py-12 md:py-16">
        <div className="flex items-center gap-3 mb-2">
          <div
            className="w-1.5 h-8 rounded-full"
            style={{ backgroundColor: 'white' }}
          />
          <span className="text-white/80 text-sm font-medium uppercase tracking-wider">
            {teamColor ? 'Team Coverage' : 'Category'}
          </span>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          {name}
        </h1>

        {postCount !== undefined && (
          <p className="text-white/70 text-lg">
            {postCount.toLocaleString()} {postCount === 1 ? 'article' : 'articles'}
          </p>
        )}
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          viewBox="0 0 1440 40"
          className="w-full h-6 md:h-10"
          preserveAspectRatio="none"
        >
          <path
            d="M0,40 L0,20 Q360,0 720,20 T1440,20 L1440,40 Z"
            className="fill-zinc-50 dark:fill-zinc-950"
          />
        </svg>
      </div>
    </header>
  )
}
