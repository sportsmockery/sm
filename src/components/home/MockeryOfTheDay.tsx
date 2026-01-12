import Link from 'next/link'
import Image from 'next/image'
import GlowCard from '@/components/ui/GlowCard'

interface MockeryItem {
  id: number
  title: string
  slug: string
  excerpt: string
  author: string
  featured_image?: string
  category: {
    slug: string
  }
}

interface MockeryOfTheDayProps {
  mockery: MockeryItem
  className?: string
}

export default function MockeryOfTheDay({ mockery, className = '' }: MockeryOfTheDayProps) {
  return (
    <section className={className}>
      <GlowCard color="red" className="overflow-hidden p-0">
        <div className="relative">
          {/* Background image */}
          {mockery.featured_image && (
            <div className="absolute inset-0">
              <Image
                src={mockery.featured_image}
                alt=""
                fill
                className="object-cover opacity-20"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-[#8B0000] to-[#0B162A]/90" />
            </div>
          )}
          {!mockery.featured_image && (
            <div className="absolute inset-0 bg-gradient-to-br from-[#8B0000] to-[#0B162A]" />
          )}

          {/* Content */}
          <div className="relative p-6 lg:p-8">
            {/* Badge */}
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 backdrop-blur">
              <span className="text-xl">🔥</span>
              <span className="text-sm font-bold text-white">Mockery of the Day</span>
            </div>

            {/* Title */}
            <Link href={`/${mockery.category.slug}/${mockery.slug}`}>
              <h2 className="mb-4 font-heading text-2xl font-black text-white transition-colors hover:text-white/90 lg:text-3xl">
                {mockery.title}
              </h2>
            </Link>

            {/* Excerpt */}
            <p className="mb-6 line-clamp-3 text-white/80 lg:text-lg">
              {mockery.excerpt}
            </p>

            {/* Footer */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/60">
                By {mockery.author}
              </span>
              <Link
                href={`/${mockery.category.slug}/${mockery.slug}`}
                className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-[#8B0000] transition-colors hover:bg-white/90"
              >
                Read the Roast
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Flame decorations */}
          <div className="absolute -bottom-4 -right-4 text-6xl opacity-20">🔥</div>
          <div className="absolute -top-2 right-20 text-4xl opacity-10">🔥</div>
        </div>
      </GlowCard>
    </section>
  )
}
