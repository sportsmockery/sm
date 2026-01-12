import Link from 'next/link'
import Image from 'next/image'

interface ArticleLink {
  title: string
  slug: string
  categorySlug: string
  featuredImage?: string
}

interface NextPrevArticleProps {
  prevArticle?: ArticleLink
  nextArticle?: ArticleLink
}

export default function NextPrevArticle({
  prevArticle,
  nextArticle,
}: NextPrevArticleProps) {
  if (!prevArticle && !nextArticle) return null

  return (
    <nav className="mx-auto max-w-4xl px-4 py-12">
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Previous Article */}
        {prevArticle ? (
          <Link
            href={`/${prevArticle.categorySlug}/${prevArticle.slug}`}
            className="group relative flex overflow-hidden rounded-2xl bg-zinc-900 transition-all hover:shadow-xl hover:shadow-zinc-900/25"
          >
            {/* Background image */}
            {prevArticle.featuredImage && (
              <div className="absolute inset-0">
                <Image
                  src={prevArticle.featuredImage}
                  alt=""
                  fill
                  className="object-cover opacity-30 transition-all group-hover:opacity-40 group-hover:scale-105"
                />
              </div>
            )}

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-transparent" />

            {/* Content */}
            <div className="relative flex items-center gap-4 p-6">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-white transition-all group-hover:bg-[#8B0000]">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Previous
                </p>
                <p className="line-clamp-2 font-semibold text-white transition-colors group-hover:text-[#FF6666]">
                  {prevArticle.title}
                </p>
              </div>
            </div>
          </Link>
        ) : (
          <div className="hidden sm:block" />
        )}

        {/* Next Article */}
        {nextArticle ? (
          <Link
            href={`/${nextArticle.categorySlug}/${nextArticle.slug}`}
            className="group relative flex justify-end overflow-hidden rounded-2xl bg-zinc-900 transition-all hover:shadow-xl hover:shadow-zinc-900/25"
          >
            {/* Background image */}
            {nextArticle.featuredImage && (
              <div className="absolute inset-0">
                <Image
                  src={nextArticle.featuredImage}
                  alt=""
                  fill
                  className="object-cover opacity-30 transition-all group-hover:opacity-40 group-hover:scale-105"
                />
              </div>
            )}

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-l from-zinc-900 via-zinc-900/90 to-transparent" />

            {/* Content */}
            <div className="relative flex items-center gap-4 p-6">
              <div className="min-w-0 text-right">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Next
                </p>
                <p className="line-clamp-2 font-semibold text-white transition-colors group-hover:text-[#FF6666]">
                  {nextArticle.title}
                </p>
              </div>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-white transition-all group-hover:bg-[#8B0000]">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </div>
            </div>
          </Link>
        ) : (
          <div className="hidden sm:block" />
        )}
      </div>
    </nav>
  )
}
