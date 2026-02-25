import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import Image from 'next/image'
import { supabaseAdmin } from '@/lib/supabase-server'
import { format } from 'date-fns'
import ShareButtons from '@/components/ShareButtons'
import AuthorCard from '@/components/article/AuthorCard'
import RelatedArticles from '@/components/article/RelatedArticles'
import NextPrevArticle from '@/components/article/NextPrevArticle'
import ArticleTags from '@/components/article/ArticleTags'
import ArticleViewTracker from '@/components/ArticleViewTracker'
import ReadingProgressBar from '@/components/article/ReadingProgressBar'
import ArticleActions from '@/components/article/ArticleActions'
import ArticleSchema from '@/components/article/ArticleSchema'
import CommentSection from '@/components/article/CommentSection'
import { ArticleTableOfContents, MoreFromTeam } from '@/components/article'
import HeroCard from '@/components/article/HeroCard'
import ArticleBodyCard from '@/components/article/ArticleBodyCard'
import ScoutRecapCard from '@/components/article/ScoutRecapCard'
import RailCard from '@/components/article/RailCard'
import NextUpStrip from '@/components/article/NextUpStrip'
import SlimCTA from '@/components/article/SlimCTA'
import ArticleShareBar from '@/components/article/ArticleShareBar'
import { categorySlugToTeam } from '@/lib/types'
import { stripDuplicateFeaturedImage, calculateReadTime, getContextLabel } from '@/lib/content-utils'
import { buildAutoLinkContextForPost, applyAutoLinksToHtml } from '@/lib/autolink'
import { getArticleAudioInfo } from '@/lib/audioPlayer'
import { ArticleAudioPlayer } from '@/components/article/ArticleAudioPlayer'
import ArticleContentWithEmbeds from '@/components/article/ArticleContentWithEmbeds'
import { TeamChatWidget } from '@/components/chat'
import ARTourButton from '@/components/ar/ARTourButton'

interface ArticlePageProps {
  params: Promise<{
    category: string
    slug: string
  }>
}

// Reading time now uses centralized utility with 225 WPM standard

// Per design spec: Use primary red #bc0000 for category tags consistently

async function getPost(slug: string) {
  try {
    const { data: post, error } = await supabaseAdmin
      .from('sm_posts')
      .select('id, title, content, excerpt, featured_image, published_at, updated_at, seo_title, seo_description, author_id, category_id, views')
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

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug, category } = await params
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
            .select('id, display_name, bio, avatar_url, twitter, instagram, email, slug')
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
    relatedPosts = relatedPostsResult.data || []
    categoryData = categoryResult.data
    prevPost = prevPostResult.data?.[0] || null
    nextPost = nextPostResult.data?.[0] || null
    tags = (tagsResult?.data?.map((t: unknown) => {
      const tagData = t as { tag?: { name?: string } | Array<{ name?: string }> }
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

  // Build auto-link context and apply auto-linking to content
  let autoLinkedContent = post.content || ''
  try {
    const autoLinkCtx = await buildAutoLinkContextForPost(
      post.id,
      categoryData?.slug || category
    )
    autoLinkedContent = applyAutoLinksToHtml(post.content || '', autoLinkCtx)
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

  const formattedDate = format(new Date(post.published_at), 'MMMM d, yyyy')

  return (
    <>
      <ArticleViewTracker postId={post.id} />
      <ReadingProgressBar />
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

      {/* Top spacer for fixed nav */}
      <div style={{ paddingTop: 'calc(var(--sm-nav-height, 72px) + 24px)' }} />

      {/* 3-column grid */}
      <div className="article-page-grid">
        {/* Left column: Scout + TOC (desktop only via CSS) */}
        <aside className="article-col-left">
          <ScoutRecapCard slug={slug} title={post.title} excerpt={post.excerpt} />
          <ArticleTableOfContents contentHtml={post.content || ''} variant="glass" />
        </aside>

        {/* Center column */}
        <main className="article-col-center">
          <HeroCard
            breadcrumb={[
              { label: 'Home', href: '/' },
              { label: categoryData?.name || category, href: `/${categoryData?.slug || category}` },
            ]}
            categoryName={categoryData?.name || category}
            categorySlug={categoryData?.slug || category}
            contextLabel={contextLabel}
            title={post.title}
            author={author}
            publishedAt={post.published_at}
            readingTime={readingTime}
            views={post.views || 0}
            formattedDate={formattedDate}
          />

          {/* Featured image */}
          {post.featured_image && (
            <div style={{ marginTop: 24, borderRadius: 16, overflow: 'hidden', position: 'relative', aspectRatio: '16/9' }}>
              <Image src={post.featured_image} alt={post.title} fill style={{ objectFit: 'cover' }} priority />
            </div>
          )}

          <ArticleShareBar url={articleUrl} title={post.title} />

          {audioInfo && (
            <div style={{ marginTop: 16 }}>
              <ArticleAudioPlayer
                initialArticle={audioInfo.article}
                initialAudioUrl={audioInfo.audioUrl}
                articleContent={post.content || ''}
              />
            </div>
          )}

          <ArticleBodyCard>
            {/* Mobile/tablet: inline Scout + TOC */}
            <div className="xl:hidden" style={{ marginBottom: 24 }}>
              <ScoutRecapCard slug={slug} title={post.title} excerpt={post.excerpt} />
              <div style={{ marginTop: 16 }}>
                <ArticleTableOfContents contentHtml={post.content || ''} className="xl:hidden" />
              </div>
            </div>

            <article className="article-body-2030">
              <ArticleContentWithEmbeds
                content={stripDuplicateFeaturedImage(autoLinkedContent, post.featured_image)}
              />
            </article>

            {/* Share buttons */}
            <div style={{ margin: '32px 0 0', display: 'flex', alignItems: 'center', gap: 12, borderTop: '1px solid var(--sm-border)', padding: '24px 0 0' }}>
              <ShareButtons url={articleUrl} title={post.title} />
            </div>

            {/* Tags */}
            {tags.length > 0 && (
              <div style={{ marginTop: 24 }}>
                <ArticleTags tags={tags} />
              </div>
            )}

            {/* Author Card */}
            {author && (
              <div style={{ marginTop: 32, borderTop: '1px solid var(--sm-border)', paddingTop: 32 }}>
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

            {/* Comments */}
            <div id="comments-section">
              <CommentSection
                articleId={post.id}
                articleUrl={articleUrl}
                articleTitle={post.title}
              />
            </div>
          </ArticleBodyCard>

          <NextUpStrip
            articles={relatedPosts.map(p => ({ id: p.id, title: p.title, slug: p.slug }))}
            categorySlug={categoryData?.slug}
          />
          <SlimCTA />
        </main>

        {/* Right column (desktop/tablet via CSS) */}
        <aside className="article-col-right">
          {relatedPosts.length > 0 && categoryData && (
            <RailCard>
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
            </RailCard>
          )}
          <RailCard>
            <ARTourButton team={categoryData?.slug || category} />
          </RailCard>
        </aside>
      </div>

      {/* Full-width below grid */}
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
                  slug: author.slug || String(author.id),
                  avatar_url: author.avatar_url ?? undefined,
                } : { name: 'Staff', slug: 'staff' },
              }))}
              categoryName={categoryData.name}
            />
          </div>
        </section>
      )}

      <ArticleActions
        articleId={post.id}
        articleUrl={articleUrl}
        articleTitle={post.title}
      />

      <TeamChatWidget categorySlug={category} />
    </>
  )
}
