'use client'

/**
 * ArticleProgressHeader — immersive reading-mode header (Pillar 4).
 *
 * Fixed top header for article pages. Background fades from transparent to
 * frosted as the user scrolls past 50px; title fades in around the same
 * threshold; bottom edge shows a brand-red reading-progress bar.
 *
 * Use on `[category]/[slug]/page.tsx` (or any article surface). To reach the
 * fully immersive look you'll want to hide the global `<Header />` on article
 * routes — see `Header.tsx` line ~101 for the existing pathname guard pattern.
 *
 *   <ArticleProgressHeader title={article.headline} backHref={`/${category}`} />
 */

import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCallback } from 'react'
import { InteractivePress } from '@/components/motion/InteractivePress'

export interface ArticleProgressHeaderProps {
  title: string
  /** Where to go if there's no nav history (deep-link case). Defaults to '/'. */
  backHref?: string
  /** Optional className appended to the header element. */
  className?: string
}

export function ArticleProgressHeader({
  title,
  backHref = '/',
  className,
}: ArticleProgressHeaderProps) {
  const router = useRouter()
  const prefersReducedMotion = useReducedMotion()
  const { scrollY, scrollYProgress } = useScroll()

  // Background opacity ramps in over 50px — visible header chrome only after
  // the user has begun reading. Light + dark variants below via theme attr.
  const headerBgDark  = useTransform(scrollY, [0, 50], ['rgba(11, 15, 20, 0)',  'rgba(11, 15, 20, 0.85)'])
  const headerBgLight = useTransform(scrollY, [0, 50], ['rgba(250, 250, 251, 0)', 'rgba(250, 250, 251, 0.85)'])
  const headerBlur    = useTransform(scrollY, [0, 50], ['blur(0px)', 'blur(16px)'])
  const borderOpacity = useTransform(scrollY, [40, 80], [0, 1])

  // Title fades in between 40-120px scroll (NOT scrollYProgress, which would
  // only reach full opacity at the *end* of the article — wrong feel).
  const titleOpacity = useTransform(scrollY, [40, 120], [0, 1])
  const titleY       = useTransform(scrollY, [40, 120], [4, 0])

  const handleBack = useCallback(() => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back()
    } else {
      router.push(backHref)
    }
  }, [router, backHref])

  // Reduced-motion users get a static frosted header — no scroll-driven values.
  if (prefersReducedMotion) {
    return (
      <header
        className={`fixed top-0 left-0 right-0 z-[1010] border-b ${className ?? ''}`}
        style={{
          paddingTop: 'env(safe-area-inset-top)',
          background: 'var(--article-progress-bg, rgba(11, 15, 20, 0.92))',
          backdropFilter: 'blur(16px) saturate(160%)',
          WebkitBackdropFilter: 'blur(16px) saturate(160%)',
          borderColor: 'var(--article-progress-border, rgba(255,255,255,0.08))',
        }}
      >
        <div className="flex items-center h-14 px-4 gap-2">
          <InteractivePress
            onClick={handleBack}
            ariaLabel="Go back"
            hapticStyle="selection"
            className="inline-flex items-center justify-center min-w-[44px] min-h-[44px] -ml-2 rounded-lg"
          >
            <ArrowLeft size={22} color="var(--article-progress-fg, #FAFAFB)" />
          </InteractivePress>
          {title && (
            <span
              className="text-sm font-semibold truncate flex-1"
              style={{ color: 'var(--article-progress-fg, #FAFAFB)' }}
            >
              {title}
            </span>
          )}
        </div>
      </header>
    )
  }

  return (
    <>
      {/* Light-mode color override — set once, consumed by both branches. */}
      <style jsx global>{`
        [data-theme="light"] .article-progress-header,
        .light .article-progress-header {
          --article-progress-fg: #0B0F14;
          --article-progress-border: rgba(11, 15, 20, 0.08);
        }
      `}</style>

      {/* Dark backdrop layer */}
      <motion.div
        aria-hidden="true"
        className="fixed top-0 left-0 right-0 z-[1009] pointer-events-none article-progress-header-bg-dark"
        style={{
          height: 'calc(56px + env(safe-area-inset-top))',
          backgroundColor: headerBgDark,
          backdropFilter: headerBlur,
          WebkitBackdropFilter: headerBlur,
        }}
      />
      {/* Light backdrop layer (only renders visibly under [data-theme="light"]) */}
      <motion.div
        aria-hidden="true"
        className="fixed top-0 left-0 right-0 z-[1009] pointer-events-none article-progress-header-bg-light"
        style={{
          height: 'calc(56px + env(safe-area-inset-top))',
          backgroundColor: headerBgLight,
          opacity: 0,
        }}
      />
      <style jsx global>{`
        [data-theme="light"] .article-progress-header-bg-dark,
        .light .article-progress-header-bg-dark { opacity: 0; }
        [data-theme="light"] .article-progress-header-bg-light,
        .light .article-progress-header-bg-light { opacity: 1; }
      `}</style>

      <motion.header
        className={`article-progress-header fixed top-0 left-0 right-0 z-[1010] border-b ${className ?? ''}`}
        style={{
          paddingTop: 'env(safe-area-inset-top)',
          borderColor: 'var(--article-progress-border, rgba(255, 255, 255, 0.08))',
          // Border fades in alongside the backdrop
          borderBottomWidth: 1,
          borderBottomColor: useTransform(
            borderOpacity,
            (o) => `rgba(255, 255, 255, ${o * 0.08})`,
          ),
        }}
      >
        <div className="flex items-center h-14 px-4 gap-2">
          <InteractivePress
            onClick={handleBack}
            ariaLabel="Go back"
            hapticStyle="selection"
            className="inline-flex items-center justify-center min-w-[44px] min-h-[44px] -ml-2 rounded-lg"
          >
            <ArrowLeft size={22} color="var(--article-progress-fg, #FAFAFB)" />
          </InteractivePress>

          <motion.span
            className="text-sm font-semibold truncate flex-1"
            style={{
              color: 'var(--article-progress-fg, #FAFAFB)',
              opacity: titleOpacity,
              y: titleY,
            }}
          >
            {title}
          </motion.span>
        </div>

        {/* Reading progress bar — brand red, scaleX driven by scrollYProgress. */}
        <motion.div
          aria-hidden="true"
          className="absolute bottom-0 left-0 right-0 h-[2px] origin-left"
          style={{
            scaleX: scrollYProgress,
            backgroundColor: '#BC0000',
          }}
        />
      </motion.header>
    </>
  )
}

export default ArticleProgressHeader
