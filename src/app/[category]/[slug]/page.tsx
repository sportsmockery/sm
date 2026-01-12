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

// Team color mapping based on category slug
function getTeamColors(categorySlug: string): { bg: string; text: string; gradient: string } {
  const teamColors: Record<string, { bg: string; text: string; gradient: string }> = {
    bears: {
      bg: 'bg-[#C83200]',
      text: 'text-white',
      gradient: 'from-[#0B162A] to-[#C83200]',
    },
    'chicago-bears': {
      bg: 'bg-[#C83200]',
      text: 'text-white',
      gradient: 'from-[#0B162A] to-[#C83200]',
    },
    bulls: {
      bg: 'bg-[#CE1141]',
      text: 'text-white',
      gradient: 'from-[#CE1141] to-[#000000]',
    },
    'chicago-bulls': {
      bg: 'bg-[#CE1141]',
      text: 'text-white',
      gradient: 'from-[#CE1141] to-[#000000]',
    },
    cubs: {
      bg: 'bg-[#0E3386]',
      text: 'text-white',
      gradient: 'from-[#0E3386] to-[#CC3433]',
    },
    'chicago-cubs': {
      bg: 'bg-[#0E3386]',
      text: 'text-white',
      gradient: 'from-[#0E3386] to-[#CC3433]',
    },
    'white-sox': {
      bg: 'bg-[#27251F]',
      text: 'text-white',
      gradient: 'from-[#27251F] to-[#4a4a4a]',
    },
    'chicago-white-sox': {
      bg: 'bg-[#27251F]',
      text: 'text-white',
      gradient: 'from-[#27251F] to-[#4a4a4a]',
    },
    blackhawks: {
      bg: 'bg-[#CF0A2C]',
      text: 'text-white',
      gradient: 'from-[#CF0A2C] to-[#000000]',
    },
    'chicago-blackhawks': {
      bg: 'bg-[#CF0A2C]',
      text: 'text-white',
      gradient: 'from-[#CF0A2C] to-[#000000]',
    },
  }
  return teamColors[categorySlug] || {
    bg: 'bg-[#8B0000]',
    text: 'text-white',
    gradient: 'from-[#8B0000] to-[#FF0000]',
  }
}

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

  // Get team colors for category
  const teamColors = getTeamColors(categoryData?.slug || category)

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

                {/* Category Badge with team color */}
                <Link
                  href={`/${categoryData?.slug || category}`}
                  className={`mb-4 inline-flex items-center rounded-full ${teamColors.bg} ${teamColors.text} px-4 py-1.5 text-xs font-bold uppercase tracking-wider transition-transform hover:scale-105`}
                >
                  {categoryData?.name || category}
                </Link>

                {/* Title */}
                <h1 className="mb-4 font-heading text-3xl font-black leading-tight text-white sm:text-4xl lg:text-5xl">
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
                        <div className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br ${teamColors.gradient} text-sm font-bold text-white`}>
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
          /* Fallback header without image */
          <div className={`bg-gradient-to-br ${teamColors.gradient} py-16 lg:py-24`}>
            <div className="mx-auto max-w-4xl px-4">
              {/* Breadcrumb */}
              <nav className="mb-4">
                <ol className="flex items-center gap-2 text-sm text-white/70">
                  <li>
                    <Link href="/" className="hover:text-white transition-colors">
                      Home
                    </Link>
                  </li>
                  <li className="text-white/50">/</li>
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

              {/* Category Badge */}
              <Link
                href={`/${categoryData?.slug || category}`}
                className="mb-4 inline-flex items-center rounded-full bg-white/20 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white backdrop-blur-sm transition-all hover:bg-white/30"
              >
                {categoryData?.name || category}
              </Link>

              {/* Title */}
              <h1 className="mb-4 font-heading text-3xl font-black leading-tight text-white sm:text-4xl lg:text-5xl">
                {post.title}
              </h1>

              {/* Meta info */}
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
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-sm font-bold text-white">
                        {author.display_name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="font-semibold text-white group-hover:text-white/80 transition-colors">
                      {author.display_name}
                    </span>
                  </Link>
                )}
                <div className="flex items-center gap-3 text-sm text-white/80">
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
                  <ViewCounterCompact views={post.views || 0} className="text-white/80" />
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area with Sidebar */}
      <div className="mx-auto max-w-7xl px-4 py-10 lg:py-14">
        <div className="lg:grid lg:grid-cols-12 lg:gap-12">
          {/* Main Article Content */}
          <article className="lg:col-span-8">
            {/* Updated date indicator */}
            {post.updated_at && (
              <UpdatedDate
                publishedAt={post.published_at}
                updatedAt={post.updated_at}
                className="mb-6"
              />
            )}

            {/* Share buttons (top) */}
            <div className="mb-8 flex items-center justify-between border-b border-zinc-200 pb-6 dark:border-zinc-800">
              <ShareButtons url={articleUrl} title={post.title} />
            </div>

            {/* SM Mockery Commentary */}
            <MockeryCommentary commentary={randomCommentary} className="mb-8" />

            {/* Article body with premium prose styling */}
            <div
              className="prose prose-lg max-w-none
                prose-headings:font-heading prose-headings:font-black prose-headings:text-zinc-900
                prose-h2:mt-10 prose-h2:mb-4 prose-h2:text-2xl prose-h2:border-l-4 prose-h2:border-[#8B0000] prose-h2:pl-4
                prose-h3:mt-8 prose-h3:mb-3 prose-h3:text-xl
                prose-p:text-lg prose-p:leading-relaxed prose-p:text-zinc-700
                prose-a:text-[#8B0000] prose-a:font-semibold prose-a:no-underline hover:prose-a:underline
                prose-strong:text-zinc-900
                prose-blockquote:border-l-4 prose-blockquote:border-[#8B0000] prose-blockquote:bg-zinc-50 prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:rounded-r-lg prose-blockquote:text-zinc-600 prose-blockquote:not-italic prose-blockquote:font-medium
                prose-img:rounded-xl prose-img:shadow-lg
                prose-ul:marker:text-[#8B0000]
                prose-ol:marker:text-[#8B0000] prose-ol:marker:font-bold
                dark:prose-headings:text-zinc-100
                dark:prose-p:text-zinc-300
                dark:prose-a:text-[#FF6666]
                dark:prose-strong:text-zinc-100
                dark:prose-blockquote:bg-zinc-800/50 dark:prose-blockquote:text-zinc-400"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* Tags */}
            {tags.length > 0 && (
              <div className="mt-10 border-t border-zinc-200 pt-6 dark:border-zinc-800">
                <ArticleTags tags={tags} />
              </div>
            )}

            {/* Share buttons (bottom) */}
            <div className="mt-10 border-t border-zinc-200 pt-6 dark:border-zinc-800">
              <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Share this article
              </p>
              <ShareButtons url={articleUrl} title={post.title} />
            </div>

            {/* Author Card */}
            {author && (
              <div className="mt-10 border-t border-zinc-200 pt-10 dark:border-zinc-800">
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  About the Author
                </h3>
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

            {/* Comments Section */}
            <CommentSection articleId={post.id} className="mt-10" />
          </article>

          {/* Sidebar */}
          <aside className="mt-10 lg:col-span-4 lg:mt-0">
            <div className="sticky top-24 space-y-6">
              {/* Table of Contents */}
              {post.content && (
                <TableOfContents content={post.content} />
              )}

              {/* Related Articles in Sidebar */}
              {relatedPosts.length > 0 && categoryData && (
                <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
                  <h3 className="mb-4 flex items-center gap-2 font-heading text-sm font-bold uppercase tracking-wider text-zinc-900 dark:text-white">
                    <svg
                      className="h-4 w-4 text-[#8B0000] dark:text-[#FF6666]"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                      />
                    </svg>
                    More {categoryData.name}
                  </h3>
                  <ul className="space-y-4">
                    {relatedPosts.slice(0, 4).map((relatedPost) => (
                      <li key={relatedPost.id}>
                        <Link
                          href={`/${categoryData.slug}/${relatedPost.slug}`}
                          className="group flex gap-3"
                        >
                          {relatedPost.featured_image && (
                            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg">
                              <Image
                                src={relatedPost.featured_image}
                                alt=""
                                fill
                                className="object-cover transition-transform group-hover:scale-105"
                              />
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <h4 className="line-clamp-2 text-sm font-semibold text-zinc-900 transition-colors group-hover:text-[#8B0000] dark:text-white dark:group-hover:text-[#FF6666]">
                              {relatedPost.title}
                            </h4>
                            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                              {format(new Date(relatedPost.published_at), 'MMM d, yyyy')}
                            </p>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Ad placeholder */}
              <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-8 text-center dark:border-zinc-700 dark:bg-zinc-800/50">
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Advertisement
                </p>
              </div>
            </div>
          </aside>
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
