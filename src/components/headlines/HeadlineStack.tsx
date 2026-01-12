import Link from 'next/link'

interface Headline {
  id: string
  title: string
  slug: string
  excerpt?: string
  featured_image?: string
  category: {
    name: string
    slug: string
  }
  published_at: string
  isBreaking?: boolean
}

const sampleHeadlines: Headline[] = [
  {
    id: '1',
    title: "Bears QB Williams named NFC Offensive Player of the Week",
    slug: 'williams-nfc-player-of-week',
    excerpt: "Caleb Williams threw for 312 yards and 4 touchdowns in Sunday's dominant victory.",
    category: { name: 'Bears', slug: 'chicago-bears' },
    published_at: new Date().toISOString(),
    isBreaking: true,
  },
  {
    id: '2',
    title: "Bulls extend winning streak with overtime thriller",
    slug: 'bulls-overtime-win',
    excerpt: "DeRozan hits game-winner as Bulls defeat Celtics 115-108.",
    category: { name: 'Bulls', slug: 'chicago-bulls' },
    published_at: new Date().toISOString(),
  },
  {
    id: '3',
    title: "Cubs announce blockbuster trade for All-Star pitcher",
    slug: 'cubs-trade-pitcher',
    excerpt: "Chicago acquires ace arm to bolster rotation for playoff push.",
    category: { name: 'Cubs', slug: 'chicago-cubs' },
    published_at: new Date().toISOString(),
  },
  {
    id: '4',
    title: "Blackhawks rookie Bedard scores hat trick in win",
    slug: 'bedard-hat-trick',
    excerpt: "Connor Bedard continues his impressive rookie campaign with three-goal performance.",
    category: { name: 'Blackhawks', slug: 'chicago-blackhawks' },
    published_at: new Date().toISOString(),
  },
  {
    id: '5',
    title: "White Sox make surprise free agent signing",
    slug: 'white-sox-signing',
    excerpt: "South siders add veteran bat to lineup ahead of spring training.",
    category: { name: 'White Sox', slug: 'chicago-white-sox' },
    published_at: new Date().toISOString(),
  },
]

interface HeadlineStackProps {
  headlines?: Headline[]
  showTitle?: boolean
  title?: string
  className?: string
}

export default function HeadlineStack({
  headlines = sampleHeadlines,
  showTitle = false,
  title = "Top Stories",
  className = ''
}: HeadlineStackProps) {
  return (
    <section className={className}>
      {/* Section header - only show if showTitle is true */}
      {showTitle && (
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold uppercase tracking-tight text-zinc-900 dark:text-white">
            {title}
          </h2>
          <Link
            href="/news"
            className="text-xs font-semibold text-[#8B0000] hover:text-[#FF0000] dark:text-[#FF6666] transition-colors"
          >
            View All
          </Link>
        </div>
      )}

      {/* Headlines list - Clean text-based list like ESPN */}
      <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
        {headlines.map((headline) => (
          <Link
            key={headline.id}
            href={`/${headline.category.slug}/${headline.slug}`}
            className="group block py-4 first:pt-0 last:pb-0"
          >
            {/* Category + Breaking indicator */}
            <div className="mb-1 flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-[#8B0000] dark:text-[#FF6666]">
                {headline.category.name}
              </span>
              {headline.isBreaking && (
                <span className="flex items-center gap-1 rounded bg-red-600 px-1.5 py-0.5 text-[10px] font-bold uppercase text-white">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
                  Live
                </span>
              )}
            </div>

            {/* Title */}
            <h3 className="text-base font-bold leading-snug text-zinc-900 transition-colors group-hover:text-[#8B0000] dark:text-white dark:group-hover:text-[#FF6666]">
              {headline.title}
            </h3>

            {/* Excerpt - only show for first headline */}
            {headline.excerpt && headlines.indexOf(headline) === 0 && (
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2">
                {headline.excerpt}
              </p>
            )}
          </Link>
        ))}
      </div>
    </section>
  )
}
