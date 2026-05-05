'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { format } from 'date-fns'
import ShareButtons from '@/components/ShareButtons'
import SocialShareBar from '@/components/SocialShareBar'
import AuthorCard from '@/components/article/AuthorCard'
import ArticleTags from '@/components/article/ArticleTags'
import { ViewCounterCompact, CommentCountCompact } from '@/components/ViewCounter'
import ArticleViewTracker from '@/components/ArticleViewTracker'
import ScoutRecapCard from '@/components/article/ScoutRecapCard'
import ScoutInsightBox from '@/components/article/ScoutInsightBox'
import ArticleContentWithInsights from '@/components/article/ArticleContentWithInsights'
import ArticleBlockContentWithInsights from '@/components/article/ArticleBlockContentWithInsights'
import { ArticleTableOfContents } from '@/components/article'
import { SegmentErrorBoundary } from '@/components/article/SegmentErrorBoundary'
import CommentSection from '@/components/article/CommentSection'
import ArticleFAQ from '@/components/article/ArticleFAQ'
import { categorySlugToTeam } from '@/lib/types'
import type { StreamedArticlePayload } from '@/app/api/articles/next/route'

interface StreamedArticleProps {
  data: StreamedArticlePayload
  /** Called once when this article's top crosses 40% into the viewport. */
  onActive?: (data: StreamedArticlePayload) => void
}

/**
 * Renders one fully-featured article inline below the original. Mirrors the
 * server-rendered article body layout but skips the ToC/right sidebars (those
 * remain anchored to the first article). Scout/Edge insights, comments, view
 * tracking are scoped per-article via key={post.id} and gated mounting.
 */
export default function StreamedArticle({ data, onActive }: StreamedArticleProps) {
  const { post, author, category, tags, processedHtml, blockDocument, readingTime, hasEnoughHeadings, url, faqs } = data
  const teamSlug = categorySlugToTeam(category.slug)
  const teamProp = teamSlug?.replace('-', '') || undefined

  const articleUrl = `https://sportsmockery.com${url}`
  const sectionRef = useRef<HTMLElement | null>(null)
  // If the runtime can't observe (very old browsers, SSR), assume the article
  // is in view as soon as it mounts — degrades gracefully rather than never
  // tracking a view.
  const supportsIO = typeof IntersectionObserver !== 'undefined'
  const [hasEnteredView, setHasEnteredView] = useState(() => !supportsIO)
  const activeFiredRef = useRef(false)

  // IntersectionObserver: gate view tracking + URL swap until the article's
  // header crosses meaningfully into the viewport. Prevents inflated views
  // when the next article preloads but the user never actually reads it.
  useEffect(() => {
    const node = sectionRef.current
    if (!node || !supportsIO) {
      if (!activeFiredRef.current) {
        activeFiredRef.current = true
        onActive?.(data)
      }
      return
    }

    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          if (!hasEnteredView) setHasEnteredView(true)
          if (!activeFiredRef.current) {
            activeFiredRef.current = true
            onActive?.(data)
          }
        }
      },
      { threshold: 0.4 }
    )
    obs.observe(node)
    return () => obs.disconnect()
  }, [data, hasEnteredView, onActive, supportsIO])

  return (
    <>
      {/* Continue Reading divider */}
      <div
        style={{
          margin: '64px auto 0',
          maxWidth: 1460,
          padding: '0 24px',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            color: 'var(--sm-text-dim)',
          }}
        >
          <div style={{ flex: 1, height: 1, background: 'var(--sm-border)' }} />
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--sm-text-dim)',
              padding: '6px 14px',
              borderRadius: 999,
              border: '1px solid var(--sm-border)',
              background: 'var(--sm-surface)',
              whiteSpace: 'nowrap',
            }}
          >
            Continue Reading · {category.name}
          </span>
          <div style={{ flex: 1, height: 1, background: 'var(--sm-border)' }} />
        </div>
      </div>

      <section
        ref={sectionRef}
        data-streamed-article-id={post.id}
        data-streamed-article-url={url}
        aria-label={post.title}
      >
        {/* Hero header */}
        <header
          style={{
            paddingTop: 32,
            paddingBottom: 32,
            background: 'var(--sm-dark)',
          }}
        >
          <div
            style={{
              position: 'relative',
              zIndex: 1,
              maxWidth: 1236,
              margin: '0 auto',
              padding: '0 24px',
            }}
          >
            {post.featured_image ? (
              <div style={{ position: 'relative' }}>
                <div
                  className="article-hero-cinematic"
                  style={{
                    borderRadius: 16,
                    overflow: 'hidden',
                    position: 'relative',
                    aspectRatio: '16/9',
                  }}
                >
                  <Image
                    src={post.featured_image}
                    alt={post.title}
                    fill
                    sizes="(max-width: 1236px) 100vw, 1236px"
                    style={{ objectFit: 'cover' }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: '60%',
                      background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
                      borderRadius: '0 0 16px 16px',
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      zIndex: 2,
                      padding: '0 28px 20px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 16,
                    }}
                  >
                    <h1
                      style={{
                        fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)',
                        fontWeight: 700,
                        letterSpacing: '-1px',
                        lineHeight: 1.15,
                        color: '#fff',
                        margin: 0,
                        textAlign: 'center',
                        textShadow:
                          '0 2px 8px rgba(0,0,0,0.7), 0 1px 3px rgba(0,0,0,0.9)',
                      }}
                    >
                      {post.title}
                    </h1>
                    <SocialShareBar url={articleUrl} title={post.title} />
                  </div>
                </div>
              </div>
            ) : (
              <h1
                style={{
                  fontSize: 'clamp(2rem, 4vw, 3rem)',
                  fontWeight: 700,
                  letterSpacing: '-1px',
                  lineHeight: 1.15,
                  color: 'var(--sm-text)',
                  marginBottom: 16,
                }}
              >
                {post.title}
              </h1>
            )}

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                flexWrap: 'wrap',
                justifyContent: 'center',
                marginTop: 16,
              }}
            >
              {author && (
                <>
                  <Link
                    href={`/author/${author.id}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      textDecoration: 'none',
                      flexShrink: 0,
                    }}
                  >
                    {author.avatar_url ? (
                      <div
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: '50%',
                          overflow: 'hidden',
                          position: 'relative',
                          flexShrink: 0,
                        }}
                      >
                        <Image
                          src={author.avatar_url}
                          alt={author.display_name}
                          fill
                          style={{ objectFit: 'cover' }}
                        />
                      </div>
                    ) : (
                      <div
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: '50%',
                          background: 'var(--sm-gradient-subtle)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 12,
                          fontWeight: 600,
                          color: 'var(--sm-text)',
                          flexShrink: 0,
                        }}
                      >
                        {author.display_name.charAt(0)}
                      </div>
                    )}
                    <span
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: 'var(--sm-text)',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {author.display_name}
                    </span>
                  </Link>
                  <span style={{ color: 'var(--sm-text-dim)' }}>·</span>
                </>
              )}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: 13,
                  color: 'var(--sm-text-muted)',
                }}
              >
                <time dateTime={post.published_at}>
                  {format(new Date(post.published_at), 'MMMM d, yyyy')}
                </time>
                <span style={{ color: 'var(--sm-text-dim)' }}>·</span>
                <span>{readingTime} min read</span>
                <span style={{ color: 'var(--sm-text-dim)' }}>·</span>
                <ViewCounterCompact views={post.views || 0} />
                {(post.comments_count || 0) > 0 && (
                  <>
                    <span style={{ color: 'var(--sm-text-dim)' }}>·</span>
                    <CommentCountCompact count={post.comments_count || 0} />
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Body — mirrors the ORIGINAL article-page column geometry exactly so
            the main column never shifts horizontally as the reader scrolls
            from article 1 → 2 → 3:

              [200 ToC | 24 gap | 900 main | 24 gap | 300 ghost]

            Both the left aside and the right ghost are always rendered (xl
            only) — they hold the column position whether or not the article
            has a ToC. Mobile/tablet collapse to a single centered column via
            the same Tailwind breakpoints used on the original page. */}
        <div style={{ backgroundColor: 'var(--sm-dark)' }}>
          <div
            className="article-body-wrapper"
            style={{ maxWidth: 1460, margin: '0 auto', display: 'flex', gap: 24 }}
          >
            <aside
              className="hidden xl:block"
              style={{ width: 200, minWidth: 200, flexShrink: 0 }}
              aria-hidden={!hasEnoughHeadings}
            >
              {hasEnoughHeadings && (
                <div style={{ position: 'sticky', top: 96 }}>
                  <ArticleTableOfContents
                    key={`toc-side-${post.id}`}
                    contentHtml={processedHtml || ''}
                    variant="glass"
                    storedToc={post.toc}
                  />
                </div>
              )}
            </aside>

            <div
              style={{
                width: '100%',
                maxWidth: 900,
                flex: 1,
                minWidth: 0,
                borderColor: 'var(--sm-border)',
              }}
            >
              <article className="article-body-2030" suppressHydrationWarning>
                <ScoutRecapCard
                  key={`scout-recap-${post.id}`}
                  postId={post.id}
                  slug={post.slug}
                  title={post.title}
                  content={post.content}
                  excerpt={post.excerpt}
                  team={teamProp}
                />
                {blockDocument ? (
                  <>
                    <ArticleBlockContentWithInsights
                      key={`block-${post.id}`}
                      document={blockDocument}
                      articleId={post.id}
                    />
                    <ScoutInsightBox
                      key={`scout-insight-${post.id}`}
                      postId={post.id}
                      postTitle={post.title}
                      content={post.content || ''}
                      team={teamProp}
                    />
                  </>
                ) : (
                  <>
                    {hasEnoughHeadings && (
                      <ArticleTableOfContents
                        key={`toc-${post.id}`}
                        contentHtml={processedHtml || ''}
                        className="xl:hidden"
                        storedToc={post.toc}
                      />
                    )}
                    <ArticleContentWithInsights
                      key={`content-${post.id}`}
                      content={processedHtml || ''}
                      postId={post.id}
                      postTitle={post.title}
                      postContent={post.content || ''}
                      team={teamProp}
                    />
                  </>
                )}

                {/* Share row */}
                <div
                  style={{
                    margin: '32px 0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    borderTop: '1px solid var(--sm-border)',
                    borderBottom: '1px solid var(--sm-border)',
                    padding: '24px 0',
                  }}
                >
                  <ShareButtons url={articleUrl} title={post.title} />
                </div>

                {tags.length > 0 && (
                  <div
                    style={{
                      marginTop: 40,
                      borderTop: '1px solid var(--sm-border)',
                      paddingTop: 24,
                    }}
                  >
                    <ArticleTags tags={tags} />
                  </div>
                )}

                {author && (
                  <div
                    style={{
                      marginTop: 40,
                      borderTop: '1px solid var(--sm-border)',
                      paddingTop: 40,
                    }}
                  >
                    <AuthorCard
                      author={{
                        id: author.id,
                        name: author.display_name,
                        slug: String(author.id),
                        avatar_url: author.avatar_url ?? undefined,
                        bio: author.bio ?? undefined,
                        twitter_url: undefined,
                        email: author.email ?? undefined,
                      }}
                    />
                  </div>
                )}

                {/* FAQ — visible accordion + Google FAQPage JSON-LD */}
                <ArticleFAQ items={faqs || []} pageUrl={url} />

                {/* Comments — keyed for full remount per-article */}
                <div id={`comments-section-${post.id}`}>
                  <SegmentErrorBoundary>
                    <CommentSection
                      key={`comments-${post.id}`}
                      articleId={post.id}
                      articleUrl={articleUrl}
                      articleTitle={post.title}
                    />
                  </SegmentErrorBoundary>
                </div>
              </article>
            </div>

            {/* Right-side ghost placeholder — mirrors the 300px sidebar slot
                on the original page so the main column sits at the exact
                same horizontal position. xl only; collapses on mobile. */}
            <div
              className="hidden xl:block"
              aria-hidden
              style={{ width: 300, flexShrink: 0 }}
            />
          </div>
        </div>

        {/* View tracker fires only once the user actually scrolls to this article. */}
        {hasEnteredView && <ArticleViewTracker key={`tracker-${post.id}`} postId={post.id} />}
      </section>
    </>
  )
}

export type { StreamedArticleProps }
