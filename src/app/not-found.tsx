import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center px-4">
      <div className="text-center max-w-lg">
        {/* 404 Number with Chicago skyline silhouette */}
        <div className="relative mb-8">
          <h1 className="text-[12rem] font-black text-zinc-200 dark:text-zinc-800 leading-none select-none">
            404
          </h1>
          {/* Chicago skyline SVG overlay */}
          <div className="absolute inset-0 flex items-end justify-center">
            <svg
              viewBox="0 0 400 100"
              className="w-full h-24 text-zinc-300 dark:text-zinc-700"
              preserveAspectRatio="xMidYMax meet"
            >
              <path
                fill="currentColor"
                d="M0,100 L0,80 L20,80 L20,60 L30,60 L30,40 L40,40 L40,60 L50,60 L50,80 L60,80 L60,50 L70,50 L70,30 L75,20 L80,30 L80,50 L90,50 L90,70 L100,70 L100,40 L110,40 L110,20 L115,10 L120,20 L120,40 L130,40 L130,60 L140,60 L140,80 L150,80 L150,45 L160,45 L160,25 L170,25 L170,15 L175,5 L180,15 L180,25 L190,25 L190,45 L200,45 L200,55 L210,55 L210,30 L220,30 L220,45 L230,45 L230,65 L240,65 L240,50 L250,50 L250,35 L260,35 L260,55 L270,55 L270,70 L280,70 L280,45 L290,45 L290,60 L300,60 L300,80 L310,80 L310,55 L320,55 L320,70 L330,70 L330,85 L340,85 L340,65 L350,65 L350,80 L360,80 L360,90 L370,90 L370,75 L380,75 L380,85 L390,85 L390,95 L400,95 L400,100 Z"
              />
            </svg>
          </div>
        </div>

        {/* Error message */}
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-4 font-[var(--font-montserrat)]">
          Fumbled at the Goal Line
        </h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-8">
          Looks like this page went out of bounds. The content you&apos;re looking for might have been traded, waived, or simply doesn&apos;t exist.
        </p>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FF0000] to-[#8B0000] px-6 py-3 font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:scale-105"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
            </svg>
            Back to Home
          </Link>
          <Link
            href="/search"
            className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-zinc-300 dark:border-zinc-700 px-6 py-3 font-semibold text-zinc-700 dark:text-zinc-300 transition-all hover:border-zinc-400 dark:hover:border-zinc-600"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            Search Articles
          </Link>
        </div>

        {/* Team links */}
        <div className="mt-12 pt-8 border-t border-zinc-200 dark:border-zinc-800">
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
            Or check out the latest from your team:
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {[
              { name: 'Bears', slug: 'chicago-bears', color: 'bg-[#0B162A]' },
              { name: 'Bulls', slug: 'chicago-bulls', color: 'bg-[#CE1141]' },
              { name: 'Cubs', slug: 'chicago-cubs', color: 'bg-[#0E3386]' },
              { name: 'White Sox', slug: 'chicago-white-sox', color: 'bg-[#27251F]' },
              { name: 'Blackhawks', slug: 'chicago-blackhawks', color: 'bg-[#CF0A2C]' },
            ].map((team) => (
              <Link
                key={team.slug}
                href={`/${team.slug}`}
                className={`${team.color} px-4 py-2 rounded-full text-white text-sm font-medium hover:opacity-90 transition-opacity`}
              >
                {team.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
