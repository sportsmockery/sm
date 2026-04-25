import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { supabaseAdmin } from '@/lib/supabase-server'
import { format } from 'date-fns'
import ShareButtons from '@/components/ShareButtons'
import AuthorCard from '@/components/article/AuthorCard'
import RelatedArticles from '@/components/article/RelatedArticles'
import NextPrevArticle from '@/components/article/NextPrevArticle'
import ArticleTags from '@/components/article/ArticleTags'
import ArticleViewTracker from '@/components/ArticleViewTracker'
import { ViewCounterCompact, CommentCountCompact } from '@/components/ViewCounter'
import ReadingProgressBar from '@/components/article/ReadingProgressBar'
import ArticleActions from '@/components/article/ArticleActions'
import ArticleSchema from '@/components/article/ArticleSchema'
import CommentSection from '@/components/article/CommentSection'
import { SegmentErrorBoundary } from '@/components/article/SegmentErrorBoundary'
import ArticleSidebar from '@/components/article/ArticleSidebar'
import { ArticleTableOfContents, MoreFromTeam } from '@/components/article'
import ScoutRecapCard from '@/components/article/ScoutRecapCard'
import ScoutInsightBox from '@/components/article/ScoutInsightBox'
import ArticleContentWithInsights from '@/components/article/ArticleContentWithInsights'
import { EdgeInsightsPanel } from '@/components/edge/ArticleEdgeInsights'
import { categorySlugToTeam } from '@/lib/types'
import { stripDuplicateFeaturedImage, calculateReadTime, getContextLabel, sanitizeWordPressContent } from '@/lib/content-utils'
import { buildAutoLinkContextForPost, applyAutoLinksToHtml } from '@/lib/autolink'
import { getArticleAudioInfo } from '@/lib/audioPlayer'
import { ArticleAudioPlayer } from '@/components/article/ArticleAudioPlayer'
import ArticleContentWithEmbeds from '@/components/article/ArticleContentWithEmbeds'
import SocialShareBar from '@/components/SocialShareBar'
import { ArticleBlockContent } from '@/components/articles/ArticleBlockContent'
import { isBlockContent, parseDocument } from '@/components/admin/BlockEditor/serializer'

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
      .select('id, title, content, excerpt, featured_image, published_at, updated_at, seo_title, seo_description, author_id, category_id, views, comments_count, toc')
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
  const description = post.seo_description || post.excerpt || ''

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      publishedTime: post.published_at,
      modifiedTime: post.updated_at || post.published_at,
      url: `https://sportsmockery.com/${category}/${slug}`,
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

  // Fetch all data in parallel - wrapped in try-catch to handle cold start issues
  let author = null
  let relatedPosts: Array<{ id: number; title: string; slug: string; excerpt: string | null; featured_image: string | null; published_at: string }> = []
  let categoryData: { id: number; name: string; slug: string } | null = null
  let prevPost: { title: string; slug: string; category_id: number; featured_image: string | null | undefined } | null = null
  let nextPost: { title: string; slug: string; category_id: number; featured_image: string | null | undefined } | null = null
  let tags: string[] = []

  try {
    const [authorResult, relatedPostsResult, categoryResult, prevPostResult, nextPostResult, tagsResult] = await Promise.all([
      post.author_id
        ? supabaseAdmin
            .from('sm_authors')
            .select('id, display_name, bio, avatar_url, email')
            .eq('id', post.author_id)
            .single()
        : Promise.resolve({ data: null, error: null }),
      supabaseAdmin
        .from('sm_posts')
        .select('id, title, slug, excerpt, featured_image, published_at')
        .eq('category_id', post.category_id)
        .eq('status', 'published')
        .neq('id', post.id)
        .order('published_at', { ascending: false })
        .limit(4),
      supabaseAdmin
        .from('sm_categories')
        .select('id, name, slug')
        .eq('id', post.category_id)
        .single(),
      supabaseAdmin
        .from('sm_posts')
        .select('title, slug, category_id, featured_image')
        .eq('status', 'published')
        .lt('published_at', post.published_at)
        .order('published_at', { ascending: false })
        .limit(1),
      supabaseAdmin
        .from('sm_posts')
        .select('title, slug, category_id, featured_image')
        .eq('status', 'published')
        .gt('published_at', post.published_at)
        .order('published_at', { ascending: true })
        .limit(1),
      // Try to fetch tags if the junction table exists
      Promise.resolve(
        supabaseAdmin
          .from('sm_post_tags')
          .select('tag:sm_tags(id, name, slug)')
          .eq('post_id', post.id)
      ).catch(() => ({ data: null, error: null })),
    ])

    author = authorResult.data
    categoryData = categoryResult.data
    prevPost = prevPostResult.data?.[0] || null
    nextPost = nextPostResult.data?.[0] || null
    tags = (tagsResult?.data?.map((t: unknown) => {
      const tagData = t as { tag?: { name?: string; slug?: string } | Array<{ name?: string; slug?: string }> }
      if (Array.isArray(tagData.tag)) {
        return tagData.tag[0]?.name
      }
      return tagData.tag?.name
    }).filter((name): name is string => typeof name === 'string') || [])

    // Enhanced related posts: prefer tag-matched articles, then same-category
    const categoryRelated = relatedPostsResult.data || []
    const tagIds = (tagsResult?.data || []).map((t: unknown) => {
      const tagData = t as { tag?: { id?: number } | Array<{ id?: number }> }
      return Array.isArray(tagData.tag) ? tagData.tag[0]?.id : tagData.tag?.id
    }).filter((id): id is number => !!id)

    if (tagIds.length > 0) {
      try {
        // Find posts sharing the same tags
        const { data: taggedPostIds } = await supabaseAdmin
          .from('sm_post_tags')
          .select('post_id')
          .in('tag_id', tagIds)
          .neq('post_id', post.id)

        const uniquePostIds = [...new Set((taggedPostIds || []).map(r => r.post_id))]

        if (uniquePostIds.length > 0) {
          const { data: tagRelated } = await supabaseAdmin
            .from('sm_posts')
            .select('id, title, slug, excerpt, featured_image, published_at')
            .in('id', uniquePostIds.slice(0, 10))
            .eq('status', 'published')
            .order('published_at', { ascending: false })
            .limit(4)

          // Merge: tag-matched first, then category-matched (deduped)
          const seenIds = new Set((tagRelated || []).map(p => p.id))
          const merged = [...(tagRelated || [])]
          for (const p of categoryRelated) {
            if (!seenIds.has(p.id) && merged.length < 4) {
              merged.push(p)
              seenIds.add(p.id)
            }
          }
          relatedPosts = merged
        } else {
          relatedPosts = categoryRelated
        }
      } catch {
        relatedPosts = categoryRelated
      }
    } else {
      relatedPosts = categoryRelated
    }
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

  // Fetch category slugs for prev/next posts
  let allCategories: Array<{ id: number; name: string; slug: string }> = []
  try {
    const categoryIds = [prevPost?.category_id, nextPost?.category_id].filter(Boolean)
    if (categoryIds.length > 0) {
      const { data } = await supabaseAdmin
        .from('sm_categories')
        .select('id, name, slug')
        .in('id', [...new Set(categoryIds)])
      allCategories = data || []
    }
  } catch (err) {
    console.error('Error fetching category slugs for prev/next:', err)
    // Continue without category slugs
  }

  const categoryMap = new Map(allCategories?.map(c => [c.id, c]) || [])

  return (
    <>
      {/* Track page view */}
      <ArticleViewTracker postId={post.id} />

      {/* Reading Progress Bar */}
      <ReadingProgressBar />

      {/* JSON-LD Structured Data */}
      <ArticleSchema
        article={{
          title: post.title,
          excerpt: post.excerpt,
          content: post.content,
          featured_image: post.featured_image,
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
        url={articleUrl}
      />

      {/* 2030 Hero Header */}
      <header className="article-header-2030" style={{ paddingTop: 'calc(var(--sm-nav-height, 72px) + 16px)', paddingBottom: 32, minHeight: 0, position: 'relative', background: 'var(--sm-dark)' }}>
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

            {/* Scout Recap — AI article summary */}
            <ScoutRecapCard
              postId={post.id}
              slug={slug}
              title={post.title}
              content={post.content}
              excerpt={post.excerpt}
              team={categorySlugToTeam(categoryData?.slug)?.replace('-', '') || undefined}
            />

            <article className="article-body-2030" suppressHydrationWarning>
              {blockDocument ? (
                /* Block-based article content */
                <>
                  <ArticleBlockContent document={blockDocument} />
                  <ScoutInsightBox
                    postId={post.id}
                    postTitle={post.title}
                    content={post.content || ''}
                    team={categorySlugToTeam(categoryData?.slug)?.replace('-', '') || undefined}
                  />
                  <EdgeInsightsPanel articleId={post.id} />
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

              {/* Next for Chicago Fans */}
              {relatedPosts.length > 0 && categoryData && (
                <div style={{ marginTop: 40, borderTop: '1px solid var(--sm-border)', paddingTop: 32 }}>
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--sm-text)', marginBottom: 16 }}>
                    Next for Chicago Fans
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {relatedPosts.slice(0, 3).map((rp) => (
                      <Link
                        key={rp.id}
                        href={`/${categoryData.slug}/${rp.slug}`}
                        className="group rounded-xl p-3 transition-colors"
                        style={{ background: 'var(--sm-surface)', border: '1px solid var(--sm-border)', textDecoration: 'none' }}
                      >
                        {rp.featured_image && (
                          <div className="mb-2 overflow-hidden rounded-lg" style={{ aspectRatio: '16/9' }}>
                            <Image
                              src={rp.featured_image}
                              alt={rp.title}
                              width={200}
                              height={112}
                              className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                            />
                          </div>
                        )}
                        <p className="line-clamp-2" style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.3, color: 'var(--sm-text)' }}>
                          {rp.title}
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

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

      {/* Next/Previous Article Navigation */}
      <NextPrevArticle
        prevArticle={prevPost ? {
          title: prevPost.title,
          slug: prevPost.slug,
          featured_image: prevPost.featured_image ?? undefined,
          category: {
            name: categoryMap.get(prevPost.category_id)?.name || 'Article',
            slug: categoryMap.get(prevPost.category_id)?.slug || 'article',
          },
        } : undefined}
        nextArticle={nextPost ? {
          title: nextPost.title,
          slug: nextPost.slug,
          featured_image: nextPost.featured_image ?? undefined,
          category: {
            name: categoryMap.get(nextPost.category_id)?.name || 'Article',
            slug: categoryMap.get(nextPost.category_id)?.slug || 'article',
          },
        } : undefined}
      />

      {/* Related Articles Section */}
      {relatedPosts.length > 0 && categoryData && (
        <section style={{ borderTop: '1px solid var(--sm-border)', padding: '48px 0', backgroundColor: 'var(--sm-surface)' }}>
          <div className="sm-container">
            <RelatedArticles
              articles={relatedPosts.map(p => ({
                id: p.id,
                title: p.title,
                slug: p.slug,
                excerpt: p.excerpt ?? undefined,
                featured_image: p.featured_image ?? undefined,
                published_at: p.published_at,
                category: {
                  name: categoryData.name,
                  slug: categoryData.slug,
                },
                author: author ? {
                  name: author.display_name,
                  slug: String(author.id),
                  avatar_url: author.avatar_url ?? undefined,
                } : { name: 'Staff', slug: 'staff' },
              }))}
              categoryName={categoryData.name}
            />
          </div>
        </section>
      )}

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
