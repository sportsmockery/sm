import Link from 'next/link'

const teams = [
  { name: 'Bears', slug: 'chicago-bears', color: 'bg-[#0B162A]', accent: 'bg-[#C83803]' },
  { name: 'Bulls', slug: 'chicago-bulls', color: 'bg-[#CE1141]', accent: 'bg-black' },
  { name: 'Cubs', slug: 'chicago-cubs', color: 'bg-[#0E3386]', accent: 'bg-[#CC3433]' },
  { name: 'White Sox', slug: 'chicago-white-sox', color: 'bg-[#27251F]', accent: 'bg-[#C4CED4]' },
  { name: 'Blackhawks', slug: 'chicago-blackhawks', color: 'bg-[#CF0A2C]', accent: 'bg-black' },
]

interface TeamSectionProps {
  className?: string
}

export default function TeamSection({ className = '' }: TeamSectionProps) {
  return (
    <section className={className}>
      {/* Section header */}
      <div className="mb-5 flex items-center gap-3 border-b-2 border-[#8B0000] pb-2">
        <h2 className="text-lg font-bold uppercase tracking-tight text-zinc-900 dark:text-white">
          Chicago Teams
        </h2>
      </div>

      {/* Team cards grid */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        {teams.map((team) => (
          <Link
            key={team.slug}
            href={`/${team.slug}`}
            className="group"
          >
            <div className={`${team.color} relative overflow-hidden rounded-lg p-4 text-white transition-transform hover:-translate-y-0.5 hover:shadow-lg`}>
              {/* Accent stripe */}
              <div className={`${team.accent} absolute bottom-0 left-0 h-1 w-full`} />

              {/* Team name */}
              <h3 className="text-sm font-bold">{team.name}</h3>

              {/* Arrow */}
              <div className="mt-2 flex items-center gap-1 text-xs text-white/70 group-hover:text-white">
                View
                <svg
                  className="h-3 w-3 transition-transform group-hover:translate-x-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
