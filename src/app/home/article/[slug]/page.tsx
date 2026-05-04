import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { unstable_cache } from 'next/cache'
import { supabaseAdmin } from '@/lib/supabase-server'
import OptimizedImage from '@/components/ui/OptimizedImage'
import { format } from 'date-fns'
import { calculateReadTime, sanitizeWordPressContent } from '@/lib/content-utils'
import { ArticleBlockContent } from '@/components/articles/ArticleBlockContent'
import { isBlockContent, parseDocument } from '@/components/admin/BlockEditor/serializer'
import { JsonLd } from '@/lib/seo/jsonld'
import { faqPageJsonLd } from '@/lib/seo/schema/faq-page'
import { buildArticleTitle } from '@/lib/seo'

// SEO Tip #27 — TTFB: published article pages are content-stable for tens of
// minutes at a time. ISR + per-key unstable_cache wrappers around Supabase
// reads turn repeated visits into a static-html cache hit and a memoized
// fetch instead of a fresh round-trip per request. Editors invalidate via
// revalidateTag('article:<slug>') / 'category:*' on publish (existing pattern).
export const revalidate = 600

interface ArticlePageProps {
  params: Promise<{ slug: string }>
}

const getPost = unstable_cache(
  async (slug: string) => {
    try {
      const { data: post, error } = await supabaseAdmin
        .from('sm_posts')
        .select(
          'id, title, content, excerpt, featured_image, published_at, updated_at, seo_title, seo_description, author_id, category_id, views'
        )
        .eq('slug', slug)
        .eq('status', 'published')
        .single()

      if (error || !post || !post.published_at) return null
      return post
    } catch {
      return null
    }
  },
  ['article-by-slug'],
  { revalidate: 600, tags: ['articles'] }
)

const getCategory = unstable_cache(
  async (categoryId: number) => {
    const { data } = await supabaseAdmin
      .from('sm_categories')
      .select('id, name, slug')
      .eq('id', categoryId)
      .single()
    return data
  },
  ['article-category'],
  { revalidate: 3600, tags: ['categories'] }
)

const getRelated = unstable_cache(
  async (categoryId: number, excludeId: number) => {
    const { data } = await supabaseAdmin
      .from('sm_posts')
      .select('id, title, slug, featured_image, published_at')
      .eq('category_id', categoryId)
      .eq('status', 'published')
      .neq('id', excludeId)
      .order('published_at', { ascending: false })
      .limit(3)
    return data || []
  },
  ['article-related'],
  { revalidate: 600, tags: ['articles'] }
)

const getAuthor = unstable_cache(
  async (authorId: number) => {
    const { data } = await supabaseAdmin
      .from('sm_authors')
      .select('id, name, bio, avatar_url')
      .eq('id', authorId)
      .single()
    return data
  },
  ['article-author'],
  { revalidate: 3600, tags: ['authors'] }
)

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params
  const post = await getPost(slug)

  if (!post) return { title: 'Article Not Found' }

  const title = post.seo_title || post.title
  const seoTitle = buildArticleTitle(title)
  const description = post.seo_description || post.excerpt || ''

  return {
    title: { absolute: seoTitle },
    description,
    alternates: { canonical: `/home/article/${slug}` },
    openGraph: {
      title,
      description,
      type: 'article',
      publishedTime: post.published_at,
      modifiedTime: post.updated_at || post.published_at,
      images: post.featured_image ? [{ url: post.featured_image, width: 1200, height: 630 }] : [],
    },
  }
}

export default async function HomeArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) notFound()

  const [category, author, related] = await Promise.all([
    getCategory(post.category_id),
    post.author_id ? getAuthor(post.author_id) : null,
    getRelated(post.category_id, post.id),
  ])

  const readTime = calculateReadTime(post.content || '')
  const publishDate = format(new Date(post.published_at), 'MMMM d, yyyy')

  // Extract FAQ items from block content for FAQPage JSON-LD
  const blockDoc = isBlockContent(post.content || '') ? parseDocument(post.content || '') : null
  const faqItems = blockDoc
    ? blockDoc.blocks
        .filter((b) => b.type === 'faq')
        .flatMap((b) => (b.data as { items: { question: string; answer: string }[] }).items)
        .filter((i) => i.question && i.answer)
    : []

  return (
    <>
      {/* FAQPage JSON-LD — only when ≥3 Q&A pairs (Google threshold) */}
      {faqItems.length >= 3 && (
        <JsonLd data={faqPageJsonLd(`/home/article/${slug}`, faqItems)} />
      )}

      {/* Hero space for nav */}
      <div style={{ paddingTop: 120 }} />

      <div className="hm-article-layout">
        {/* Breadcrumb */}
        <div className="hm-breadcrumb">
          <Link href="/home">Home</Link>
          <span>/</span>
          {category && (
            <>
              <Link href={`/${category.slug}`}>{category.name}</Link>
              <span>/</span>
            </>
          )}
          <span style={{ color: '#8a8a9a' }}>{post.title}</span>
        </div>

        {/* Meta */}
        <div className="hm-article-meta">
          {author && <span>{author.name}</span>}
          <span>{publishDate}</span>
          <span>{readTime} min read</span>
          {post.views > 0 && <span>{post.views.toLocaleString()} views</span>}
        </div>

        {/* Title */}
        <h1 className="hm-article-title">
          <span className="hm-gradient-text">{post.title}</span>
        </h1>

        {/* Featured Image */}
        {post.featured_image && (
          <div className="hm-article-image-wrap">
            <OptimizedImage
              src={post.featured_image}
              alt={post.title}
              variant="hero"
              className="hm-article-image"
            />
          </div>
        )}

        {/* Content */}
        {isBlockContent(post.content || '') ? (
          <ArticleBlockContent document={parseDocument(post.content || '')!} />
        ) : (
          <div
            className="hm-article-content"
            dangerouslySetInnerHTML={{ __html: sanitizeWordPressContent(post.content || '') }}
          />
        )}

        {/* Author Bio */}
        {author && (
          <div className="hm-author-bio">
            {author.avatar_url ? (
              <Image src={author.avatar_url} alt={author.name} width={56} height={56} className="hm-author-avatar" style={{ borderRadius: '50%', objectFit: 'cover' }} />
            ) : (
              <div className="hm-author-avatar" />
            )}
            <div>
              <div style={{ fontWeight: 600, color: '#fff', marginBottom: 4 }}>{author.name}</div>
              {author.bio && <div style={{ fontSize: 13, color: '#8a8a9a', lineHeight: 1.5 }}>{author.bio}</div>}
            </div>
          </div>
        )}

        {/* Related Articles */}
        {related.length > 0 && (
          <>
            <h3 style={{ fontSize: 18, fontWeight: 600, color: '#fff', marginTop: 64, marginBottom: 20 }}>Related Articles</h3>
            <div className="hm-related-grid">
              {related.map((article) => (
                <Link key={article.id} href={`/home/article/${article.slug}`} className="hm-related-card">
                  {article.featured_image && (
                    <OptimizedImage src={article.featured_image} alt={article.title} variant="card" className="hm-related-image" />
                  )}
                  <div className="hm-related-body">
                    <h4>{article.title}</h4>
                    <span>{format(new Date(article.published_at), 'MMM d, yyyy')}</span>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  )
}
