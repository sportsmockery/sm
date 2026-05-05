import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { supabaseAdmin } from '@/lib/supabase-server'
import { format } from 'date-fns'
import ShareButtons from '@/components/ShareButtons'
import AuthorCard from '@/components/article/AuthorCard'
import NextArticleStream from '@/components/article/NextArticleStream'
import ArticleTags from '@/components/article/ArticleTags'
import ArticleViewTracker from '@/components/ArticleViewTracker'
import { ViewCounterCompact, CommentCountCompact } from '@/components/ViewCounter'
import { ArticleProgressHeader } from '@/components/article/ArticleProgressHeader'
import ArticleActions from '@/components/article/ArticleActions'
import ArticleSchema from '@/components/article/ArticleSchema'
import CommentSection from '@/components/article/CommentSection'
import { SegmentErrorBoundary } from '@/components/article/SegmentErrorBoundary'
import ArticleSidebar from '@/components/article/ArticleSidebar'
import { ArticleTableOfContents, MoreFromTeam } from '@/components/article'
import ScoutRecapCard from '@/components/article/ScoutRecapCard'
import ScoutInsightBox from '@/components/article/ScoutInsightBox'
import ArticleContentWithInsights from '@/components/article/ArticleContentWithInsights'
import ArticleBlockContentWithInsights from '@/components/article/ArticleBlockContentWithInsights'
import ArticleFAQ from '@/components/article/ArticleFAQ'
import { getArticleFaqsForRender } from '@/lib/articleFaq'
import { categorySlugToTeam } from '@/lib/types'
import { stripDuplicateFeaturedImage, calculateReadTime, getContextLabel, sanitizeWordPressContent } from '@/lib/content-utils'
import { buildAutoLinkContextForPost, applyAutoLinksToHtml } from '@/lib/autolink'
import { getArticleAudioInfo } from '@/lib/audioPlayer'
import { ArticleAudioPlayer } from '@/components/article/ArticleAudioPlayer'
import ArticleContentWithEmbeds from '@/components/article/ArticleContentWithEmbeds'
import SocialShareBar from '@/components/SocialShareBar'
import { isBlockContent, parseDocument } from '@/components/admin/BlockEditor/serializer'
import { canonicalUrl, JsonLd, breadcrumbJsonLd, buildArticleTitle } from '@/lib/seo'

interface ArticlePageProps {
  params: Promise<{
    category: string
    slug: string
  }>
  searchParams: Promise<{
    listen?: string
  }>
}

// Reading time now uses centralized utility with 225 WPM standard

// Per design spec: Use primary red #bc0000 for category tags consistently

async function getPost(slug: string) {
  try {
    const { data: post, error } = await supabaseAdmin
      .from('sm_posts')
      .select('id, title, content, excerpt, featured_image, image_variants, published_at, updated_at, seo_title, seo_description, author_id, category_id, views, comments_count, toc, faq_json')
      .eq('slug', slug)
      .eq('status', 'published')
      .single()

    if (error) {
      console.error('Supabase error fetching post:', error.message, 'slug:', slug)
      return null
    }

    if (!post) {
      console.log('Post not found:', slug)
      return null
    }

    // Ensure published_at exists (required for date formatting)
    if (!post.published_at) {
      console.error('Post missing published_at:', slug)
      return null
    }

    return post
  } catch (err) {
    console.error('Exception fetching post:', err, 'slug:', slug)
    return null
  }
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug, category } = await params
  const post = await getPost(slug)

  if (!post) {
    return {
      title: 'Article Not Found',
    }
  }

  const title = post.seo_title || post.title
  const seoTitle = buildArticleTitle(title)
  const description = post.seo_description || post.excerpt || ''
  const canonical = canonicalUrl(`/${category}/${slug}`)

  // Resolve the human author byline so we can emit
  // <meta property="article:author"> via openGraph.authors. Falls back to
  // the brand byline if the post is unattributed.
  let authorName = 'Sports Mockery Staff'
  if (post.author_id) {
    const { data: author } = await supabaseAdmin
      .from('sm_authors')
      .select('display_name')
      .eq('id', post.author_id)
      .single()
    if (author?.display_name) authorName = author.display_name
  }

  return {
    title: { absolute: seoTitle },
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      type: 'article',
      publishedTime: post.published_at,
      modifiedTime: post.updated_at || post.published_at,
      authors: [authorName],
      url: canonical,
      images: post.featured_image
        ? [
            {
              url: post.featured_image,
              width: 1200,
              height: 630,
              alt: post.title,
            },
          ]
        : [],
      siteName: 'SportsMockery.com',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: post.featured_image ? [post.featured_image] : [],
      site: '@sportsmockery',
    },
  }
}

export default async function ArticlePage({ params, searchParams }: ArticlePageProps) {
  const { slug, category } = await params
  const { listen } = await searchParams
  const autoPlayAudio = listen === 'true'
  const post = await getPost(slug)

  if (!post) {
    notFound()
  }

  const readingTime = calculateReadTime(post.content || '')
  const articleUrl = `https://sportsmockery.com/${category}/${slug}`

  // Fetch supplementary data in parallel - wrapped in try-catch to handle cold start issues.
  // Related/prev/next queries are gone — NextArticleStream handles "what's next" lazily.
  let author = null
  let categoryData: { id: number; name: string; slug: string } | null = null
  let tags: string[] = []

  try {
    const [authorResult, categoryResult, tagsResult] = await Promise.all([
      post.author_id
        ? supabaseAdmin
            .from('sm_authors')
            .select('id, display_name, bio, avatar_url, email')
            .eq('id', post.author_id)
            .single()
        : Promise.resolve({ data: null, error: null }),
      supabaseAdmin
        .from('sm_categories')
        .select('id, name, slug')
        .eq('id', post.category_id)
        .single(),
      Promise.resolve(
        supabaseAdmin
          .from('sm_post_tags')
          .select('tag:sm_tags(id, name, slug)')
          .eq('post_id', post.id)
      ).catch(() => ({ data: null, error: null })),
    ])

    author = authorResult.data
    categoryData = categoryResult.data
    tags = (tagsResult?.data?.map((t: unknown) => {
      const tagData = t as { tag?: { name?: string; slug?: string } | Array<{ name?: string; slug?: string }> }
      if (Array.isArray(tagData.tag)) {
        return tagData.tag[0]?.name
      }
      return tagData.tag?.name
    }).filter((name): name is string => typeof name === 'string') || [])
  } catch (err) {
    console.error('Error fetching article supplementary data:', err)
    // Continue with defaults - page will still render with just the post content
  }

  // Get context label (Rumor, Film Room, Opinion) per spec
  const contextLabel = getContextLabel(categoryData?.name, tags)

  // Check if this is block-based content
  const postContent = post.content || ''
  const blockDocument = isBlockContent(postContent) ? parseDocument(postContent) : null

  // Server-side heading count to decide if TOC sidebar should render
  const storedTocItems = post.toc as Array<{ id: string; text: string; level: number }> | null
  const hasEnoughHeadings = (() => {
    if (storedTocItems && storedTocItems.length >= 3) return true
    // Quick regex count of h2/h3 tags in content
    const headingMatches = postContent.match(/<h[23][^>]*>/gi)
    return (headingMatches?.length || 0) >= 3
  })()

  // Sanitize WordPress content: strip inline scripts, block comments, shortcodes.
  // This MUST run before auto-linking or any other content processing.
  // WordPress tweet embeds include <script> tags that execute during SSR and
  // corrupt the DOM, breaking React hydration and client-side navigation.
  const cleanContent = blockDocument ? '' : sanitizeWordPressContent(postContent)

  // Build auto-link context and apply auto-linking to content
  let autoLinkedContent = cleanContent
  try {
    const autoLinkCtx = await buildAutoLinkContextForPost(
      post.id,
      categoryData?.slug || category
    )
    autoLinkedContent = applyAutoLinksToHtml(cleanContent, autoLinkCtx)
  } catch (err) {
    console.error('Error applying auto-links:', err)
    // Continue with original content if auto-linking fails
  }

  // Fetch audio info for article audio player
  let audioInfo = null
  try {
    audioInfo = await getArticleAudioInfo(slug)
  } catch (err) {
    console.error('Error fetching audio info:', err)
    // Continue without audio if it fails
  }

  // Resolve team slug once for stream filter + insight components.
  const teamSlug = categorySlugToTeam(categoryData?.slug)?.replace('-', '') || null

  // FAQs — cached → block-extracted → AI-generated. Persists back to DB on
  // first generation so subsequent loads are instant. Never blocks rendering
  // on a network failure (returns []).
  let faqItems: Array<{ question: string; answer: string }> = []
  try {
    const resolved = await getArticleFaqsForRender(
      { id: post.id, title: post.title, content: post.content || '' },
      { cachedFaqJson: post.faq_json }
    )
    faqItems = resolved.items
  } catch (err) {
    console.error('Error resolving article FAQs:', err)
  }

  return (
    <>
      {/* Track page view */}
      <ArticleViewTracker postId={post.id} />

      {/* Immersive reader header — back, fading title, brand-red progress bar.
          Pairs with the global Header's article-route guard (returns null on
          this URL pattern) so the chrome doesn't double up. */}
      <ArticleProgressHeader
        title={post.title}
        backHref={`/${categoryData?.slug || category}`}
      />

      {/* JSON-LD Structured Data */}
      {post.image_variants?.['16x9']?.url && (
        <link
          rel="preload"
          as="image"
          href={post.image_variants['16x9'].url}
          // @ts-expect-error fetchpriority is valid HTML
          fetchpriority="high"
        />
      )}
      <ArticleSchema
        article={{
          title: post.title,
          excerpt: post.excerpt,
          content: post.content,
          featured_image: post.featured_image,
          image_variants: post.image_variants,
          published_at: post.published_at,
          updated_at: post.updated_at,
          slug: slug,
          author: author ? {
            name: author.display_name,
            slug: String(author.id),
            avatar_url: author.avatar_url,
          } : { name: 'SportsMockery Staff', slug: 'staff' },
          category: {
            name: categoryData?.name || category,
            slug: categoryData?.slug || category,
          },
        }}
      />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', url: '/' },
          { name: categoryData?.name || category, url: `/${categoryData?.slug || category}` },
          { name: post.title, url: `/${categoryData?.slug || category}/${slug}` },
        ])}
      />

      {/* 2030 Hero Header — top padding clears the ArticleProgressHeader
          (56px + safe-area) instead of the global nav, since the global nav
          is suppressed on article routes. */}
      <header className="article-header-2030" style={{ paddingTop: 'calc(56px + env(safe-area-inset-top, 0px) + 16px)', paddingBottom: 32, minHeight: 0, position: 'relative', background: 'var(--sm-dark)' }}>
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 1236, margin: '0 auto', padding: '0 24px' }}>
          {/* Featured image with headline overlay */}
          {post.featured_image ? (
            <div style={{ position: 'relative' }}>
              <div className="article-hero-cinematic" style={{ borderRadius: 16, overflow: 'hidden', position: 'relative', aspectRatio: '16/9' }}>
                <Image src={post.featured_image} alt={post.title} fill style={{ objectFit: 'cover' }} priority />
                {/* Gradient overlay for readability */}
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '60%', background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)', borderRadius: '0 0 16px 16px' }} />
                {/* Title + share icons overlaid at bottom */}
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 2, padding: '0 28px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                  <h1 style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)', fontWeight: 700, letterSpacing: '-1px', lineHeight: 1.15, color: '#fff', margin: 0, textAlign: 'center', textShadow: '0 2px 8px rgba(0,0,0,0.7), 0 1px 3px rgba(0,0,0,0.9)' }}>
                    {post.title}
                  </h1>
                  <SocialShareBar url={articleUrl} title={post.title} />
                </div>
              </div>
            </div>
          ) : (
            <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 700, letterSpacing: '-1px', lineHeight: 1.15, color: 'var(--sm-text)', marginBottom: 16 }}>
              {post.title}
            </h1>
          )}

          {/* Author · Date · Read time · Views — inline row, centered */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', justifyContent: 'center', marginTop: -4 }}>
            {author && (
              <>
                <Link href={`/author/${author.id}`} style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', flexShrink: 0 }}>
                  {author.avatar_url ? (
                    <div style={{ width: 28, height: 28, borderRadius: '50%', overflow: 'hidden', position: 'relative', flexShrink: 0 }}>
                      <Image src={author.avatar_url} alt={author.display_name} fill style={{ objectFit: 'cover' }} />
                    </div>
                  ) : (
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--sm-gradient-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, color: 'var(--sm-text)', flexShrink: 0 }}>
                      {author.display_name.charAt(0)}
                    </div>
                  )}
                  <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--sm-text)', whiteSpace: 'nowrap' }}>{author.display_name}</span>
                </Link>
                <span style={{ color: 'var(--sm-text-dim)' }}>·</span>
              </>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--sm-text-muted)' }}>
              <time dateTime={post.published_at}>{format(new Date(post.published_at), 'MMMM d, yyyy')}</time>
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

      {/* Article Audio Player — scroll target for ?listen=true from feed */}
      {audioInfo && (
        <div id="article-audio" style={{ backgroundColor: 'var(--sm-dark)' }}>
          <div style={{ maxWidth: 680, margin: '0 auto', padding: '0 24px' }}>
            <ArticleAudioPlayer
              initialArticle={audioInfo.article}
              initialAudioUrl={audioInfo.audioUrl}
              articleContent={post.content || ''}
              autoPlay={autoPlayAudio}
            />
          </div>
        </div>
      )}

      {/* 2030 Article Body Area */}
      <div style={{ backgroundColor: 'var(--sm-dark)' }}>
        <div className="article-body-wrapper" style={{ maxWidth: 1460, margin: '0 auto', display: 'flex', gap: 24 }}>
          {/* Left TOC Sidebar (Desktop only) — only when article has 3+ headings */}
          {hasEnoughHeadings && (
            <aside className="hidden xl:block" style={{ width: 200, minWidth: 200, flexShrink: 0 }}>
              <div style={{ position: 'sticky', top: 96 }}>
                <ArticleTableOfContents
                  contentHtml={cleanContent}
                  variant="glass"
                  storedToc={storedTocItems}
                />
              </div>
            </aside>
          )}

          {/* Main article column */}
          <div style={{ width: '100%', maxWidth: 900, flex: 1, minWidth: 0, borderColor: 'var(--sm-border)' }}>

            <article className="article-body-2030" suppressHydrationWarning>
              {/* Scout Recap — AI article summary */}
              <ScoutRecapCard
                postId={post.id}
                slug={slug}
                title={post.title}
                content={post.content}
                excerpt={post.excerpt}
                team={categorySlugToTeam(categoryData?.slug)?.replace('-', '') || undefined}
              />
              {blockDocument ? (
                /* Block-based article content with inline EDGE Insights */
                <>
                  <ArticleBlockContentWithInsights document={blockDocument} articleId={post.id} />
                  <ScoutInsightBox
                    postId={post.id}
                    postTitle={post.title}
                    content={post.content || ''}
                    team={categorySlugToTeam(categoryData?.slug)?.replace('-', '') || undefined}
                  />
                </>
              ) : (
                <>
                  {/* Mobile TOC - shown at top on smaller screens */}
                  <ArticleTableOfContents
                    contentHtml={cleanContent}
                    className="xl:hidden"
                  />

                  {/* Article content with inline Scout Insight + EDGE Insight strips */}
                  <ArticleContentWithInsights
                    content={stripDuplicateFeaturedImage(autoLinkedContent, post.featured_image)}
                    postId={post.id}
                    postTitle={post.title}
                    postContent={post.content || ''}
                    team={categorySlugToTeam(categoryData?.slug)?.replace('-', '') || undefined}
                  />
                </>
              )}

              {/* Share buttons */}
              <div style={{ margin: '32px 0', display: 'flex', alignItems: 'center', gap: 12, borderTop: '1px solid var(--sm-border)', borderBottom: '1px solid var(--sm-border)', padding: '24px 0' }}>
                <ShareButtons url={articleUrl} title={post.title} />
              </div>

              {/* Tags */}
              {tags.length > 0 && (
                <div style={{ marginTop: 40, borderTop: '1px solid var(--sm-border)', paddingTop: 24 }}>
                  <ArticleTags tags={tags} />
                </div>
              )}

              {/* Author Card */}
              {author && (
                <div style={{ marginTop: 40, borderTop: '1px solid var(--sm-border)', paddingTop: 40 }}>
                  <AuthorCard
                    author={{
                      id: author.id,
                      name: author.display_name,
                      slug: String(author.id),
                      avatar_url: author.avatar_url,
                      bio: author.bio,
                      twitter_url: undefined,
                      email: author.email,
                    }}
                  />
                </div>
              )}

              {/* FAQ — visible accordion + Google FAQPage JSON-LD */}
              <ArticleFAQ items={faqItems} pageUrl={`/${categoryData?.slug || category}/${slug}`} />

              {/* Comments — isolated so failures do not take down the article */}
              <div id="comments-section">
                <SegmentErrorBoundary>
                  <CommentSection
                    articleId={post.id}
                    articleUrl={articleUrl}
                    articleTitle={post.title}
                  />
                </SegmentErrorBoundary>
              </div>
            </article>
          </div>

          {/* Right Sidebar — Ask Scout + SM EDGE Features (Desktop only) */}
          <aside className="hidden xl:block" style={{ width: 300, flexShrink: 0 }}>
            <div style={{ position: 'sticky', top: 96 }}>
              <ArticleSidebar categoryName={categoryData?.name} categorySlug={categoryData?.slug} />
            </div>
          </aside>
        </div>
      </div>

      {/* Aggressive next-article stream — appends up to 2 same-team articles
          inline as the reader nears the end. Each appended article gets its
          own Scout Recap, Edge Insights, comments, and view tracking. After
          the cap, surfaces a hard-nav teaser that resets page state. */}
      <NextArticleStream
        initialPostId={post.id}
        initialPostUrl={`/${categoryData?.slug || category}/${slug}`}
        initialPostTitle={post.title}
        team={teamSlug}
      />

      {/* Mobile Floating Action Bar */}
      <ArticleActions
        articleId={post.id}
        articleUrl={articleUrl}
        articleTitle={post.title}
      />

      {/* Team Chat Widget removed — root layout provides ChatProvider + TeamChatPanel globally */}
    </>
  )
}
