import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { supabaseAdmin } from '@/lib/supabase-server'
import { format } from 'date-fns'
import ArticleViewTracker from '@/components/ArticleViewTracker'

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

// Social share buttons - SportsMockery.com style
function ShareButtons({ url, title }: { url: string; title: string }) {
  const encodedUrl = encodeURIComponent(url)
  const encodedTitle = encodeURIComponent(title)

  return (
    <div className="flex items-center gap-3">
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="w-8 h-8 flex items-center justify-center rounded-full bg-[#3b5998] text-white hover:opacity-80 transition-opacity"
        aria-label="Share on Facebook"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 320 512">
          <path d="M279.14 288l14.22-92.66h-88.91v-60.13c0-25.35 12.42-50.06 52.24-50.06h40.42V6.26S260.43 0 225.36 0c-73.22 0-121.08 44.38-121.08 124.72v70.62H22.89V288h81.39v224h100.17V288z" />
        </svg>
      </a>
      <a
        href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}
        target="_blank"
        rel="noopener noreferrer"
        className="w-8 h-8 flex items-center justify-center rounded-full bg-black text-white hover:opacity-80 transition-opacity"
        aria-label="Share on Twitter"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 512 512">
          <path d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z" />
        </svg>
      </a>
      <a
        href={`https://www.reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`}
        target="_blank"
        rel="noopener noreferrer"
        className="w-8 h-8 flex items-center justify-center rounded-full bg-[#ff4500] text-white hover:opacity-80 transition-opacity"
        aria-label="Share on Reddit"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 512 512">
          <path d="M201.5 305.5c-13.8 0-24.9-11.1-24.9-24.6 0-13.8 11.1-24.9 24.9-24.9 13.6 0 24.6 11.1 24.6 24.9 0 13.6-11.1 24.6-24.6 24.6zM504 256c0 137-111 248-248 248S8 393 8 256 119 8 256 8s248 111 248 248zm-132.3-41.2c-9.4 0-17.7 3.9-23.8 10-22.4-15.5-52.6-25.5-86.1-26.6l17.4-78.3 55.4 12.5c0 13.6 11.1 24.6 24.6 24.6 13.8 0 24.9-11.3 24.9-24.9s-11.1-24.9-24.9-24.9c-9.7 0-18 5.8-22.1 13.8l-61.2-13.6c-3-.8-6.1 1.4-6.9 4.4l-19.1 86.4c-33.2 1.4-63.1 11.3-85.5 26.8-6.1-6.4-14.7-10.2-24.1-10.2-34.9 0-46.3 46.9-14.4 62.8-1.1 5-1.7 10.2-1.7 15.5 0 52.6 59.2 95.2 132 95.2 73.1 0 132.3-42.6 132.3-95.2 0-5.3-.6-10.8-1.9-15.8 31.3-16 19.8-62.5-14.9-62.5zM302.8 331c-18.2 18.2-76.1 17.9-93.6 0-2.2-2.2-6.1-2.2-8.3 0-2.5 2.5-2.5 6.4 0 8.6 22.8 22.8 87.3 22.8 110.2 0 2.5-2.2 2.5-6.1 0-8.6-2.2-2.2-6.1-2.2-8.3 0zm7.7-75c-13.6 0-24.6 11.1-24.6 24.9 0 13.6 11.1 24.6 24.6 24.6 13.8 0 24.9-11.1 24.9-24.6 0-13.8-11-24.9-24.9-24.9z" />
        </svg>
      </a>
      <a
        href={`mailto:?subject=${encodedTitle}&body=${encodedUrl}`}
        className="w-8 h-8 flex items-center justify-center rounded-full bg-[#666] text-white hover:opacity-80 transition-opacity"
        aria-label="Share via Email"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      </a>
    </div>
  )
}

// Related article card - SportsMockery.com style
function RelatedArticleCard({ article }: { article: any }) {
  return (
    <article className="group">
      <Link href={`/${article.category.slug}/${article.slug}`} className="block">
        {article.featured_image && (
          <div className="relative w-full pb-[70%] mb-2 overflow-hidden">
            <Image
              src={article.featured_image}
              alt={article.title}
              fill
              className="object-cover"
            />
          </div>
        )}
        <h4
          className="text-sm font-semibold text-[#222] leading-tight group-hover:text-[#bc0000] group-hover:underline decoration-[#bc0000] decoration-2 underline-offset-2"
          style={{ lineHeight: 1.2, fontFamily: 'Montserrat, sans-serif' }}
        >
          {article.title}
        </h4>
      </Link>
    </article>
  )
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
  const [authorResult, relatedPostsResult, categoryResult] = await Promise.all([
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
  ])

  const author = authorResult.data
  const relatedPosts = relatedPostsResult.data || []
  const categoryData = categoryResult.data

  return (
    <>
      {/* Track page view */}
      <ArticleViewTracker postId={post.id} />

      <div className="min-h-screen bg-white">
        {/* Hero Section with Featured Image - SportsMockery.com style */}
        {post.featured_image && (
          <header className="relative w-full" style={{ paddingBottom: '40%', minHeight: '400px', maxHeight: '600px' }}>
            <Image
              src={post.featured_image}
              alt={post.title}
              fill
              className="object-cover"
              priority
            />
            {/* Dark gradient overlay */}
            <div
              className="absolute inset-0"
              style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)' }}
            />

            {/* Content overlay at bottom */}
            <div className="absolute bottom-0 left-0 right-0">
              <div className="max-w-[1110px] mx-auto px-4 pb-8">
                {/* Category badge */}
                <span
                  className="inline-block bg-transparent text-white text-[11px] uppercase tracking-wider px-2 py-1 border border-white/50 mb-4"
                  style={{ fontFamily: 'ABeeZee, sans-serif', letterSpacing: '1px' }}
                >
                  {categoryData?.name || category} News & Rumors
                </span>

                {/* Title */}
                <h1
                  className="text-white text-3xl md:text-4xl font-semibold mb-4"
                  style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif', lineHeight: 1.2 }}
                >
                  {post.title}
                </h1>

                {/* Author and date */}
                <div className="flex items-center gap-3 text-white/90 text-sm mb-4" style={{ fontFamily: '"Fira Sans", sans-serif' }}>
                  {author?.avatar_url && (
                    <div className="relative w-7 h-7 rounded-full overflow-hidden">
                      <Image
                        src={author.avatar_url}
                        alt={author.display_name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <span className="uppercase text-xs tracking-wider">
                    By {author?.display_name || 'Staff'}
                  </span>
                  <span>-</span>
                  <time dateTime={post.published_at}>
                    {format(new Date(post.published_at), 'MMM d, yyyy')}
                  </time>
                </div>

                {/* Share buttons */}
                <ShareButtons url={articleUrl} title={post.title} />
              </div>
            </div>
          </header>
        )}

        {/* Fallback header without image */}
        {!post.featured_image && (
          <header className="bg-[#222] py-12">
            <div className="max-w-[1110px] mx-auto px-4">
              <span
                className="inline-block bg-transparent text-white text-[11px] uppercase tracking-wider px-2 py-1 border border-white/50 mb-4"
                style={{ fontFamily: 'ABeeZee, sans-serif', letterSpacing: '1px' }}
              >
                {categoryData?.name || category} News & Rumors
              </span>

              <h1
                className="text-white text-3xl md:text-4xl font-semibold mb-4"
                style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif', lineHeight: 1.2 }}
              >
                {post.title}
              </h1>

              <div className="flex items-center gap-3 text-white/90 text-sm mb-4" style={{ fontFamily: '"Fira Sans", sans-serif' }}>
                {author?.avatar_url && (
                  <div className="relative w-7 h-7 rounded-full overflow-hidden">
                    <Image
                      src={author.avatar_url}
                      alt={author.display_name}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <span className="uppercase text-xs tracking-wider">
                  By {author?.display_name || 'Staff'}
                </span>
                <span>-</span>
                <time dateTime={post.published_at}>
                  {format(new Date(post.published_at), 'MMM d, yyyy')}
                </time>
              </div>

              <ShareButtons url={articleUrl} title={post.title} />
            </div>
          </header>
        )}

        {/* Main Content Area - SportsMockery.com uses sidebar layout */}
        <main className="max-w-[1110px] mx-auto px-4 py-8">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8">
            {/* Article Content - ~65% width */}
            <article className="lg:col-span-8">
              {/* Article body - Fira Sans 16px */}
              <div
                className="prose prose-lg max-w-none
                  prose-headings:font-semibold prose-headings:text-[#222]
                  prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4
                  prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3
                  prose-p:text-base prose-p:leading-relaxed prose-p:text-[#333] prose-p:mb-5
                  prose-a:text-[#bc0000] prose-a:font-semibold prose-a:no-underline hover:prose-a:underline
                  prose-strong:text-[#222]
                  prose-blockquote:border-l-4 prose-blockquote:border-[#bc0000] prose-blockquote:bg-gray-50 prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:text-[#666] prose-blockquote:not-italic
                  prose-img:rounded-none
                  prose-ul:marker:text-[#bc0000]
                  prose-ol:marker:text-[#bc0000]"
                style={{ fontFamily: '"Fira Sans", sans-serif' }}
                dangerouslySetInnerHTML={{ __html: post.content }}
              />

              {/* Share buttons (bottom) */}
              <div className="mt-10 pt-6 border-t border-gray-200">
                <p
                  className="mb-3 text-sm uppercase tracking-wider text-[#999]"
                  style={{ fontFamily: 'ABeeZee, sans-serif' }}
                >
                  Share this article
                </p>
                <ShareButtons url={articleUrl} title={post.title} />
              </div>

              {/* Author box */}
              {author && (
                <div className="mt-8 p-6 bg-[#f5f5f5] border border-gray-200">
                  <div className="flex items-start gap-4">
                    {author.avatar_url && (
                      <div className="relative w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
                        <Image
                          src={author.avatar_url}
                          alt={author.display_name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div>
                      <h3
                        className="font-semibold text-[#222] mb-1"
                        style={{ fontFamily: 'Montserrat, sans-serif' }}
                      >
                        {author.display_name}
                      </h3>
                      {author.bio && (
                        <p
                          className="text-sm text-[#666]"
                          style={{ fontFamily: '"Fira Sans", sans-serif' }}
                        >
                          {author.bio}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </article>

            {/* Sidebar - ~35% width */}
            <aside className="lg:col-span-4 mt-10 lg:mt-0">
              <div className="sticky top-24 space-y-8">
                {/* Trending in Category */}
                {relatedPosts.length > 0 && categoryData && (
                  <div className="bg-white border border-gray-200 p-5">
                    <h3
                      className="text-sm font-bold uppercase tracking-wider text-[#222] mb-4 pb-2 border-b-[3px] border-[#bc0000]"
                      style={{ fontFamily: 'Montserrat, sans-serif' }}
                    >
                      More {categoryData.name}
                    </h3>
                    <div className="space-y-4">
                      {relatedPosts.slice(0, 4).map((relatedPost) => (
                        <RelatedArticleCard
                          key={relatedPost.id}
                          article={{
                            ...relatedPost,
                            category: { name: categoryData.name, slug: categoryData.slug }
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Ad placeholder */}
                <div className="bg-[#f5f5f5] border border-dashed border-gray-300 p-8 text-center">
                  <p
                    className="text-xs uppercase tracking-wider text-[#999]"
                    style={{ fontFamily: 'ABeeZee, sans-serif' }}
                  >
                    Advertisement
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </main>

        {/* Related Articles Section - SportsMockery.com style 4-column grid */}
        {relatedPosts.length > 0 && categoryData && (
          <section className="bg-[#f5f5f5] border-t border-gray-200 py-10">
            <div className="max-w-[1110px] mx-auto px-4">
              <h2
                className="text-lg font-bold text-[#222] mb-5 pb-2 border-b-[3px] border-[#bc0000]"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                Related Articles
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {relatedPosts.map((relatedPost) => (
                  <RelatedArticleCard
                    key={relatedPost.id}
                    article={{
                      ...relatedPost,
                      category: { name: categoryData.name, slug: categoryData.slug }
                    }}
                  />
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
    </>
  )
}
