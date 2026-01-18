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
import { ViewCounterCompact } from '@/components/ViewCounter'
import ReadingProgressBar from '@/components/article/ReadingProgressBar'
import ArticleActions from '@/components/article/ArticleActions'
import ArticleSchema from '@/components/article/ArticleSchema'
import CommentSection from '@/components/article/CommentSection'
import UpdatedDate from '@/components/article/UpdatedDate'
import TableOfContents from '@/components/article/TableOfContents'
import MockeryCommentary from '@/components/article/MockeryCommentary'
import { ArticleTableOfContents, MoreFromTeam } from '@/components/article'
import { categorySlugToTeam, PostSummary } from '@/lib/types'
import { TeamChatWidget } from '@/components/chat/TeamChatWidget'
import { stripDuplicateFeaturedImage, calculateReadTime, getContextLabel } from '@/lib/content-utils'
import { buildAutoLinkContextForPost, applyAutoLinksToHtml } from '@/lib/autolink'
import { getArticleAudioInfo } from '@/lib/audioPlayer'
import { ArticleAudioPlayer } from '@/components/article/ArticleAudioPlayer'
import ArticleContentWithEmbeds from '@/components/article/ArticleContentWithEmbeds'

interface ArticlePageProps {
  params: Promise<{
    category: string
    slug: string
  }>
}

// Reading time now uses centralized utility with 225 WPM standard

// Per design spec: Use primary red #bc0000 for category tags consistently

async function getPost(slug: string) {
  const { data: post, error } = await supabaseAdmin
    .from('sm_posts')
    .select('id, title, content, excerpt, featured_image, published_at, updated_at, seo_title, seo_description, author_id, category_id, views')
    .eq('slug', slug)
    .single()

  if (error || !post) {
    return null
  }

  return post
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

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug, category } = await params
  const post = await getPost(slug)

  if (!post) {
    notFound()
  }

  const readingTime = calculateReadTime(post.content || '')
  const articleUrl = `https://sportsmockery.com/${category}/${slug}`

  // Fetch all data in parallel
  const [authorResult, relatedPostsResult, categoryResult, prevPostResult, nextPostResult, tagsResult] = await Promise.all([
    post.author_id
      ? supabaseAdmin
          .from('sm_authors')
          .select('id, display_name, bio, avatar_url, twitter, instagram, email, slug')
          .eq('id', post.author_id)
          .single()
      : Promise.resolve({ data: null }),
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
      .limit(1)
      .single(),
    supabaseAdmin
      .from('sm_posts')
      .select('title, slug, category_id, featured_image')
      .eq('status', 'published')
      .gt('published_at', post.published_at)
      .order('published_at', { ascending: true })
      .limit(1)
      .single(),
    // Try to fetch tags if the junction table exists
    Promise.resolve(
      supabaseAdmin
        .from('sm_post_tags')
        .select('tag:sm_tags(id, name, slug)')
        .eq('post_id', post.id)
    ).catch(() => ({ data: null, error: null })),
  ])

  const author = authorResult.data
  const relatedPosts = relatedPostsResult.data || []
  const categoryData = categoryResult.data
  const prevPost = prevPostResult.data
  const nextPost = nextPostResult.data
  const tags: string[] = (tagsResult?.data?.map((t: unknown) => {
    const tagData = t as { tag?: { name?: string } | Array<{ name?: string }> }
    if (Array.isArray(tagData.tag)) {
      return tagData.tag[0]?.name
    }
    return tagData.tag?.name
  }).filter((name): name is string => typeof name === 'string') || [])

  // Get context label (Rumor, Film Room, Opinion) per spec
  const contextLabel = getContextLabel(categoryData?.name, tags)

  // Build auto-link context and apply auto-linking to content
  const autoLinkCtx = await buildAutoLinkContextForPost(
    post.id,
    categoryData?.slug || category
  )
  const autoLinkedContent = applyAutoLinksToHtml(post.content || '', autoLinkCtx)

  // Fetch audio info for article audio player
  const audioInfo = await getArticleAudioInfo(slug)

  // Fetch category slugs for prev/next posts
  const categoryIds = [prevPost?.category_id, nextPost?.category_id].filter(Boolean)
  const { data: allCategories } = categoryIds.length > 0
    ? await supabaseAdmin
        .from('sm_categories')
        .select('id, name, slug')
        .in('id', [...new Set(categoryIds)])
    : { data: [] }

  const categoryMap = new Map(allCategories?.map(c => [c.id, c]) || [])

  // Generate a witty SM commentary
  const smCommentaries = [
    "Another day, another hot take served piping hot from the Windy City. You're welcome.",
    "If you're not reading SportsMockery, are you even a real Chicago sports fan?",
    "We're not saying we called this, but... okay fine, we definitely called this.",
    "The truth hurts, but someone's gotta tell it. That's why we're here.",
    "Chicago sports: where hope goes to get interesting stories written about it.",
  ]
  const randomCommentary = smCommentaries[Math.floor(Math.random() * smCommentaries.length)]

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
            slug: author.slug || String(author.id),
            avatar_url: author.avatar_url,
          } : { name: 'SportsMockery Staff', slug: 'staff' },
          category: {
            name: categoryData?.name || category,
            slug: categoryData?.slug || category,
          },
        }}
        url={articleUrl}
      />

      {/* Premium Hero Section */}
      <header className="relative">
        {/* Full-width featured image with overlay */}
        {post.featured_image ? (
          <div className="relative h-[50vh] min-h-[400px] w-full lg:h-[60vh]">
            <Image
              src={post.featured_image}
              alt={post.title}
              fill
              className="object-cover"
              priority
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />

            {/* Content overlay */}
            <div className="absolute inset-0 flex flex-col justify-end">
              <div className="mx-auto w-full max-w-4xl px-4 pb-8 lg:pb-12">
                {/* Breadcrumb */}
                <nav className="mb-4">
                  <ol className="flex items-center gap-2 text-sm text-zinc-300">
                    <li>
                      <Link href="/" className="hover:text-white transition-colors">
                        Home
                      </Link>
                    </li>
                    <li className="text-zinc-500">/</li>
                    <li>
                      <Link
                        href={`/${categoryData?.slug || category}`}
                        className="hover:text-white transition-colors"
                      >
                        {categoryData?.name || category}
                      </Link>
                    </li>
                  </ol>
                </nav>

                {/* Context label above title (Rumor, Film Room, Opinion) */}
                {contextLabel && (
                  <span className="mb-2 inline-block text-xs font-semibold uppercase tracking-[0.06em] px-2 py-[2px] rounded-full bg-white/20 text-white/90">
                    {contextLabel.label}
                  </span>
                )}

                {/* Category Badge per spec: red bg #bc0000 */}
                <Link
                  href={`/${categoryData?.slug || category}`}
                  className="mb-4 inline-block text-[11px] font-bold uppercase tracking-[0.5px] px-[10px] py-[4px]"
                  style={{ fontFamily: "'Montserrat', sans-serif", backgroundColor: 'var(--badge-bg)', color: 'var(--badge-text)' }}
                >
                  {categoryData?.name || category}
                </Link>

                {/* Title per spec: 28-36px, Montserrat 700-900, line-height 1.2 - no text-transform */}
                <h1
                  className="mb-4 text-[24px] sm:text-[28px] lg:text-[36px] font-black leading-[1.2] text-white max-w-4xl"
                  style={{ fontFamily: "'Montserrat', sans-serif", letterSpacing: '-0.5px' }}
                >
                  {post.title}
                </h1>

                {/* Meta info with author avatar */}
                <div className="flex flex-wrap items-center gap-4">
                  {author && (
                    <Link href={`/author/${author.slug || author.id}`} className="flex items-center gap-3 group">
                      {author.avatar_url ? (
                        <div className="relative h-10 w-10 overflow-hidden rounded-full ring-2 ring-white/30 transition-all group-hover:ring-white/60">
                          <Image
                            src={author.avatar_url}
                            alt={author.display_name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold" style={{ backgroundColor: 'var(--badge-bg)', color: 'var(--badge-text)' }}>
                          {author.display_name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span className="font-semibold text-white group-hover:text-zinc-200 transition-colors">
                        {author.display_name}
                      </span>
                    </Link>
                  )}
                  <div className="flex items-center gap-3 text-sm text-zinc-300">
                    <time dateTime={post.published_at} className="flex items-center gap-1.5">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                      </svg>
                      {format(new Date(post.published_at), 'MMMM d, yyyy')}
                    </time>
                    <span className="flex items-center gap-1.5">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {readingTime} min read
                    </span>
                    <ViewCounterCompact views={post.views || 0} className="text-zinc-300" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Fallback header without image - dark background for white text */
          <div className="py-10 border-b" style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-color)' }}>
            <div className="mx-auto max-w-[1110px] px-4">
              {/* Breadcrumb */}
              <nav className="mb-4">
                <ol className="flex items-center gap-2 text-[12px] text-zinc-400">
                  <li>
                    <Link href="/" className="hover:text-white transition-colors">
                      Home
                    </Link>
                  </li>
                  <li className="text-zinc-500">/</li>
                  <li>
                    <Link
                      href={`/${categoryData?.slug || category}`}
                      className="hover:text-white transition-colors"
                    >
                      {categoryData?.name || category}
                    </Link>
                  </li>
                </ol>
              </nav>

              {/* Context label above title (Rumor, Film Room, Opinion) */}
              {contextLabel && (
                <span className="mb-2 inline-block text-xs font-semibold uppercase tracking-[0.06em] px-2 py-[2px] rounded-full bg-white/20 text-white/90">
                  {contextLabel.label}
                </span>
              )}

              {/* Category Badge per spec */}
              <Link
                href={`/${categoryData?.slug || category}`}
                className="mb-4 inline-block text-[11px] font-bold uppercase tracking-[0.5px] px-[10px] py-[4px]"
                style={{ fontFamily: "'Montserrat', sans-serif", backgroundColor: 'var(--badge-bg)', color: 'var(--badge-text)' }}
              >
                {categoryData?.name || category}
              </Link>

              {/* Title per spec: 28-36px, Montserrat 700-900 - no text-transform */}
              <h1
                className="mb-4 text-[24px] sm:text-[28px] lg:text-[36px] font-black leading-[1.2] text-white max-w-4xl"
                style={{ fontFamily: "'Montserrat', sans-serif", letterSpacing: '-0.5px' }}
              >
                {post.title}
              </h1>

              {/* Meta line per spec: "By {author} · {Date} · {X min read} · {Category}" */}
              <p className="text-[14px]" style={{ color: 'var(--text-muted)' }}>
                {author && (
                  <>
                    By{' '}
                    <Link
                      href={`/author/${author.slug || author.id}`}
                      className="font-medium transition-colors"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {author.display_name}
                    </Link>
                    {' · '}
                  </>
                )}
                {format(new Date(post.published_at), 'MMMM d, yyyy')}
                {' · '}
                {readingTime} min read
                {' · '}
                {categoryData?.name || category}
              </p>
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area - per spec section 7.3: max-width 700-750px for article body */}
      <div style={{ backgroundColor: 'var(--bg-page)' }}>
        <div className="mx-auto max-w-[1110px] px-4 py-10">
          <div className="lg:flex lg:gap-10">
            {/* Main article column */}
            <div className="lg:flex-1 lg:max-w-[750px]">
              {/* Note: Featured image is shown in hero section above, not duplicated here */}

              {/* Article Audio Player - Listen to this article */}
              {audioInfo && (
                <ArticleAudioPlayer
                  initialArticle={audioInfo.article}
                  initialAudioUrl={audioInfo.audioUrl}
                  articleContent={post.content || ''}
                />
              )}

              {/* Article body per spec section 7.3: Fira Sans 16-17px, line-height 1.7 */}
              <article
                className="article-body"
                style={{ fontFamily: "'Fira Sans', sans-serif" }}
              >
                {/* In-article Table of Contents (for longer articles) */}
                {readingTime >= 5 && (
                  <ArticleTableOfContents
                    contentHtml={post.content || ''}
                    className="mb-8 lg:hidden"
                  />
                )}

                {/* Article body content - using globals.css .article-body styles */}
                {/* Auto-linked content with duplicate featured image stripped, Twitter embeds processed */}
                <ArticleContentWithEmbeds
                  content={stripDuplicateFeaturedImage(autoLinkedContent, post.featured_image)}
                />

                {/* Share buttons placed after article body per spec */}
                <div className="my-8 flex items-center gap-3 border-y py-6" style={{ borderColor: 'var(--border-color)' }}>
                  <ShareButtons url={articleUrl} title={post.title} />
                </div>

                {/* Tags per spec section 15.4 */}
                {tags.length > 0 && (
                  <div className="mt-10 border-t pt-6" style={{ borderColor: 'var(--border-color)' }}>
                    <ArticleTags tags={tags} />
                  </div>
                )}

                {/* Author Card per spec section 15.3 */}
                {author && (
                  <div className="mt-10 border-t pt-10" style={{ borderColor: 'var(--border-color)' }}>
                    <AuthorCard
                      author={{
                        id: author.id,
                        name: author.display_name,
                        slug: author.slug || String(author.id),
                        avatar_url: author.avatar_url,
                        bio: author.bio,
                        twitter_url: author.twitter,
                        email: author.email,
                      }}
                    />
                  </div>
                )}
              </article>
            </div>

            {/* Desktop Sidebar */}
            <aside className="hidden lg:block lg:w-[300px] lg:flex-shrink-0">
              <div className="sticky top-24 space-y-6">
                {/* Table of Contents for longer articles */}
                {readingTime >= 5 && (
                  <ArticleTableOfContents
                    contentHtml={post.content || ''}
                  />
                )}

                {/* More from this team */}
                {relatedPosts.length > 0 && categoryData && (
                  <MoreFromTeam
                    posts={relatedPosts.map(p => ({
                      id: p.id,
                      slug: p.slug,
                      title: p.title,
                      excerpt: p.excerpt,
                      featuredImage: p.featured_image,
                      publishedAt: p.published_at,
                      views: 0,
                      author: {
                        id: author?.id || 0,
                        displayName: author?.display_name || 'Staff',
                        avatarUrl: author?.avatar_url || null,
                      },
                      team: categorySlugToTeam(categoryData.slug),
                      categorySlug: categoryData.slug,
                      categoryName: categoryData.name,
                    }))}
                    team={categorySlugToTeam(categoryData.slug)}
                    currentPostId={post.id}
                  />
                )}
              </div>
            </aside>
          </div>
        </div>
      </div>

      {/* Next/Previous Article Navigation */}
      <NextPrevArticle
        prevArticle={prevPost ? {
          title: prevPost.title,
          slug: prevPost.slug,
          featured_image: prevPost.featured_image,
          category: {
            name: categoryMap.get(prevPost.category_id)?.name || 'Article',
            slug: categoryMap.get(prevPost.category_id)?.slug || 'article',
          },
        } : undefined}
        nextArticle={nextPost ? {
          title: nextPost.title,
          slug: nextPost.slug,
          featured_image: nextPost.featured_image,
          category: {
            name: categoryMap.get(nextPost.category_id)?.name || 'Article',
            slug: categoryMap.get(nextPost.category_id)?.slug || 'article',
          },
        } : undefined}
      />

      {/* Full-width Related Articles Section */}
      {relatedPosts.length > 0 && categoryData && (
        <section className="border-t py-12" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-surface)' }}>
          <div className="mx-auto max-w-7xl px-4">
            <RelatedArticles
              articles={relatedPosts.map(p => ({
                id: p.id,
                title: p.title,
                slug: p.slug,
                excerpt: p.excerpt,
                featured_image: p.featured_image,
                published_at: p.published_at,
                category: {
                  name: categoryData.name,
                  slug: categoryData.slug,
                },
                author: author ? {
                  name: author.display_name,
                  slug: author.slug || String(author.id),
                  avatar_url: author.avatar_url,
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

      {/* Team Chat Widget - Floating button and panel */}
      <TeamChatWidget
        categorySlug={categoryData?.slug || category}
        categoryName={categoryData?.name}
        articleId={post.id}
      />
    </>
  )
}
