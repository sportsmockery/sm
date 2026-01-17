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

interface ArticlePageProps {
  params: Promise<{
    category: string
    slug: string
  }>
}

function calculateReadingTime(content: string): number {
  const text = content.replace(/<[^>]*>/g, '')
  const words = text.split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.ceil(words / 200))
}

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

  const readingTime = calculateReadingTime(post.content || '')
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

                {/* Category Badge per spec: red bg #bc0000 */}
                <Link
                  href={`/${categoryData?.slug || category}`}
                  className="mb-4 inline-block bg-[#bc0000] text-white text-[11px] font-bold uppercase tracking-[0.5px] px-[10px] py-[4px]"
                  style={{ fontFamily: "'Montserrat', sans-serif" }}
                >
                  {categoryData?.name || category}
                </Link>

                {/* Title per spec: 36-42px, Montserrat 700-900, line-height 1.2 */}
                <h1
                  className="mb-4 text-[36px] lg:text-[42px] font-black leading-[1.2] text-white"
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
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#bc0000] text-sm font-bold text-white">
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
          /* Fallback header without image - per spec use white bg */
          <div className="bg-white py-10 border-b border-[#e0e0e0]">
            <div className="mx-auto max-w-[1110px] px-4">
              {/* Breadcrumb per spec section 15.1 */}
              <nav className="mb-4">
                <ol className="flex items-center gap-2 text-[12px] text-[#666666]">
                  <li>
                    <Link href="/" className="hover:text-[#bc0000] transition-colors">
                      Home
                    </Link>
                  </li>
                  <li>/</li>
                  <li>
                    <Link
                      href={`/${categoryData?.slug || category}`}
                      className="hover:text-[#bc0000] transition-colors"
                    >
                      {categoryData?.name || category}
                    </Link>
                  </li>
                </ol>
              </nav>

              {/* Category Badge per spec */}
              <Link
                href={`/${categoryData?.slug || category}`}
                className="mb-4 inline-block bg-[#bc0000] text-white text-[11px] font-bold uppercase tracking-[0.5px] px-[10px] py-[4px]"
                style={{ fontFamily: "'Montserrat', sans-serif" }}
              >
                {categoryData?.name || category}
              </Link>

              {/* Title per spec: 36-42px, Montserrat 700-900 */}
              <h1
                className="mb-4 text-[36px] lg:text-[42px] font-black leading-[1.2] text-[#222222]"
                style={{ fontFamily: "'Montserrat', sans-serif", letterSpacing: '-0.5px' }}
              >
                {post.title}
              </h1>

              {/* Author/Date Line per spec section 7.1: "By Author Name | Month Day, Year" */}
              <p className="text-[14px] text-[#666666]" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                {author && (
                  <>
                    By{' '}
                    <Link
                      href={`/author/${author.slug || author.id}`}
                      className="font-medium text-[#222222] hover:text-[#bc0000] transition-colors"
                    >
                      {author.display_name}
                    </Link>
                    {' | '}
                  </>
                )}
                {format(new Date(post.published_at), 'MMMM d, yyyy')}
              </p>
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area - per spec section 7.3: max-width 700-750px for article body */}
      <div className="bg-white">
        <div className="mx-auto max-w-[1110px] px-4 py-10">
          <div className="lg:flex lg:gap-10">
            {/* Main article column */}
            <div className="lg:flex-1 lg:max-w-[750px]">
              {/* Featured Image per spec section 7.2 */}
              {post.featured_image && (
                <div className="mb-8">
                  <div className="relative w-full" style={{ maxHeight: '500px' }}>
                    <Image
                      src={post.featured_image}
                      alt={post.title}
                      width={1110}
                      height={500}
                      className="w-full h-auto object-cover"
                      style={{ maxHeight: '500px' }}
                      priority
                    />
                  </div>
                </div>
              )}

              {/* Article body per spec section 7.3: Fira Sans 16-17px, line-height 1.7 */}
              <article
                className="article-body"
                style={{ fontFamily: "'Fira Sans', sans-serif" }}
              >
                {/* Share buttons (top) per spec section 7.4 */}
                <div className="mb-8 flex items-center gap-3 border-b border-[#e0e0e0] pb-6">
                  <ShareButtons url={articleUrl} title={post.title} />
                </div>

                {/* In-article Table of Contents (for longer articles) */}
                {readingTime >= 5 && (
                  <ArticleTableOfContents
                    contentHtml={post.content || ''}
                    className="mb-8 lg:hidden"
                  />
                )}

                {/* Article body content - using globals.css .article-body styles */}
                <div
                  className="article-body"
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />

                {/* Tags per spec section 15.4 */}
                {tags.length > 0 && (
                  <div className="mt-10 border-t border-[#e0e0e0] pt-6">
                    <ArticleTags tags={tags} />
                  </div>
                )}

                {/* Share buttons (bottom) */}
                <div className="mt-10 border-t border-[#e0e0e0] pt-6">
                  <p
                    className="mb-3 text-[12px] font-bold uppercase tracking-wider text-[#999999]"
                    style={{ fontFamily: "'Montserrat', sans-serif" }}
                  >
                    Share this article
                  </p>
                  <ShareButtons url={articleUrl} title={post.title} />
                </div>

                {/* Author Card per spec section 15.3 */}
                {author && (
                  <div className="mt-10 border-t border-[#e0e0e0] pt-10">
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
        <section className="border-t border-zinc-200 bg-zinc-50 py-12 dark:border-zinc-800 dark:bg-zinc-900/50">
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
    </>
  )
}
