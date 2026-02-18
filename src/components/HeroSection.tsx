'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import ChicagoSkyline from './ChicagoSkyline'

interface FeaturedArticle {
  title: string
  slug: string
  excerpt?: string
  featuredImage?: string
  category: {
    name: string
    slug: string
  }
  author?: string
  publishedAt?: string
}

interface HeroSectionProps {
  featuredArticle?: FeaturedArticle
  secondaryArticles?: FeaturedArticle[]
}

export default function HeroSection({ featuredArticle, secondaryArticles = [] }: HeroSectionProps) {
  const [isVisible, setIsVisible] = useState(false)
  const heroRef = useRef<HTMLElement>(null)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const formatDate = (dateString?: string) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  // Placeholder content if no featured article
  const mainArticle = featuredArticle || {
    title: 'Welcome to Sports Mockery',
    slug: '/',
    excerpt: 'Your source for Chicago sports news, analysis, and hot takes.',
    category: { name: 'Featured', slug: 'featured' },
  }

  return (
    <section ref={heroRef} className="relative overflow-hidden" style={{ backgroundColor: 'var(--sm-surface)' }}>
      {/* Background gradient */}
      <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom right, var(--sm-surface), var(--sm-card), var(--sm-surface))' }} />

      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Red accent glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#8B0000] rounded-full blur-3xl opacity-20" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#FF0000] rounded-full blur-3xl opacity-10" />

      {/* Chicago Skyline */}
      <div className="absolute bottom-0 left-0 right-0 h-48 pointer-events-none">
        <ChicagoSkyline
          className="absolute bottom-0 w-full h-full"
          color="#ffffff"
          opacity={0.05}
        />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 py-12 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* Main Featured Article */}
          <div className="lg:col-span-8">
            <Link
              href={`/${mainArticle.category.slug}/${mainArticle.slug}`}
              className="group relative block overflow-hidden rounded-2xl aspect-[16/10] lg:aspect-[16/9]"
            >
              {/* Image */}
              {mainArticle.featuredImage ? (
                <Image
                  src={mainArticle.featuredImage}
                  alt={mainArticle.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  priority
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-[#8B0000] to-zinc-900" />
              )}

              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />

              {/* Content */}
              <div className="absolute inset-0 flex flex-col justify-end p-6 lg:p-10">
                {/* Category badge */}
                <div
                  className={`inline-flex self-start mb-4 transform transition-all duration-500 ${
                    isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                  }`}
                  style={{ transitionDelay: '100ms' }}
                >
                  <span className="px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white bg-[#8B0000] rounded-full shadow-lg">
                    {mainArticle.category.name}
                  </span>
                </div>

                {/* Title */}
                <h1
                  className={`text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black text-white leading-tight font-[var(--font-montserrat)] transform transition-all duration-500 ${
                    isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                  }`}
                  style={{ transitionDelay: '200ms' }}
                >
                  <span className="group-hover:text-zinc-200 transition-colors">
                    {mainArticle.title}
                  </span>
                </h1>

                {/* Excerpt */}
                {mainArticle.excerpt && (
                  <p
                    className={`mt-4 text-sm lg:text-base line-clamp-2 max-w-2xl transform transition-all duration-500 ${
                      isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                    }`}
                    style={{ transitionDelay: '300ms' }}
                  >
                    {mainArticle.excerpt}
                  </p>
                )}

                {/* Meta info */}
                <div
                  className={`flex items-center gap-4 mt-4 text-sm transform transition-all duration-500 ${
                    isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                  }`}
                  style={{ transitionDelay: '400ms' }}
                >
                  {mainArticle.author && (
                    <span className="font-medium text-white">{mainArticle.author}</span>
                  )}
                  {mainArticle.publishedAt && (
                    <>
                      <span className="w-1 h-1 rounded-full" style={{ backgroundColor: 'var(--sm-text-muted)' }} />
                      <span>{formatDate(mainArticle.publishedAt)}</span>
                    </>
                  )}
                </div>

                {/* Read more indicator */}
                <div
                  className={`mt-6 flex items-center gap-2 text-[#FF0000] font-semibold text-sm transform transition-all duration-500 ${
                    isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                  }`}
                  style={{ transitionDelay: '500ms' }}
                >
                  <span>Read Article</span>
                  <svg
                    className="w-4 h-4 transform group-hover:translate-x-1 transition-transform"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>

              {/* Hover glow effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-t from-[#8B0000]/20 to-transparent" />
              </div>
            </Link>
          </div>

          {/* Secondary Articles */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            {secondaryArticles.slice(0, 3).map((article, index) => (
              <Link
                key={article.slug}
                href={`/${article.category.slug}/${article.slug}`}
                className={`group relative flex gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/5 hover:border-white/10 transition-all duration-300 transform ${
                  isVisible ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'
                }`}
                style={{ transitionDelay: `${(index + 1) * 150 + 200}ms` }}
              >
                {/* Thumbnail */}
                <div className="relative shrink-0 w-24 h-24 rounded-lg overflow-hidden">
                  {article.featuredImage ? (
                    <Image
                      src={article.featuredImage}
                      alt={article.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-zinc-700 to-zinc-800" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col justify-center min-w-0">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#FF0000] mb-1">
                    {article.category.name}
                  </span>
                  <h3 className="text-sm font-bold text-white leading-snug line-clamp-2 group-hover:text-zinc-200 transition-colors font-[var(--font-montserrat)]">
                    {article.title}
                  </h3>
                  {article.publishedAt && (
                    <span className="mt-2 text-xs" style={{ color: 'var(--sm-text-muted)' }}>
                      {formatDate(article.publishedAt)}
                    </span>
                  )}
                </div>

                {/* Arrow indicator */}
                <div className="shrink-0 self-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg className="w-5 h-5 text-[#FF0000]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}

            {/* View All button when more than 3 articles */}
            {secondaryArticles.length === 0 && (
              <>
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={`relative flex gap-4 p-4 rounded-xl bg-white/5 border border-white/5 transform ${
                      isVisible ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'
                    }`}
                    style={{ transitionDelay: `${i * 150 + 200}ms` }}
                  >
                    <div className="shrink-0 w-24 h-24 rounded-lg bg-[var(--sm-surface)] animate-pulse" />
                    <div className="flex-1 flex flex-col justify-center gap-2">
                      <div className="h-3 w-16 bg-zinc-800 rounded animate-pulse" />
                      <div className="h-4 w-full bg-zinc-800 rounded animate-pulse" />
                      <div className="h-4 w-3/4 bg-zinc-800 rounded animate-pulse" />
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

        {/* Team quick links */}
        <div
          className={`mt-8 flex flex-wrap justify-center gap-3 transform transition-all duration-500 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}
          style={{ transitionDelay: '600ms' }}
        >
          {[
            { name: 'Bears', slug: 'chicago-bears', gradient: 'from-[#0B162A] to-[#C83200]' },
            { name: 'Bulls', slug: 'chicago-bulls', gradient: 'from-[#CE1141] to-[#000000]' },
            { name: 'Cubs', slug: 'chicago-cubs', gradient: 'from-[#0E3386] to-[#CC3433]' },
            { name: 'White Sox', slug: 'chicago-white-sox', gradient: 'from-[#27251F] to-[#4a4a4a]' },
            { name: 'Blackhawks', slug: 'chicago-blackhawks', gradient: 'from-[#CF0A2C] to-[#000000]' },
          ].map((team) => (
            <Link
              key={team.slug}
              href={`/${team.slug}`}
              className={`px-5 py-2.5 rounded-full bg-gradient-to-r ${team.gradient} text-white text-sm font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 font-[var(--font-montserrat)]`}
            >
              {team.name}
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
