import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import Link from 'next/link'
import { supabaseAdmin } from '@/lib/supabase-server'
import { format } from 'date-fns'
import { calculateReadTime } from '@/lib/content-utils'

interface ArticlePageProps {
  params: Promise<{ slug: string }>
}

async function getPost(slug: string) {
  try {
    const { data: post, error } = await supabaseAdmin
      .from('sm_posts')
      .select('id, title, content, excerpt, featured_image, published_at, updated_at, seo_title, seo_description, author_id, category_id, views')
      .eq('slug', slug)
      .eq('status', 'published')
      .single()

    if (error || !post || !post.published_at) return null
    return post
  } catch {
    return null
  }
}

async function getCategory(categoryId: number) {
  const { data } = await supabaseAdmin
    .from('sm_categories')
    .select('id, name, slug')
    .eq('id', categoryId)
    .single()
  return data
}

async function getRelated(categoryId: number, excludeId: number) {
  const { data } = await supabaseAdmin
    .from('sm_posts')
    .select('id, title, slug, featured_image, published_at')
    .eq('category_id', categoryId)
    .eq('status', 'published')
    .neq('id', excludeId)
    .order('published_at', { ascending: false })
    .limit(3)
  return data || []
}

async function getAuthor(authorId: number) {
  const { data } = await supabaseAdmin
    .from('sm_authors')
    .select('id, name, bio, avatar_url')
    .eq('id', authorId)
    .single()
  return data
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params
  const post = await getPost(slug)

  if (!post) return { title: 'Article Not Found' }

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

  return (
    <>
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
          <img
            src={post.featured_image}
            alt={post.title}
            className="hm-article-image"
          />
        )}

        {/* Content */}
        <div
          className="hm-article-content"
          dangerouslySetInnerHTML={{ __html: post.content || '' }}
        />

        {/* Author Bio */}
        {author && (
          <div className="hm-author-bio">
            {author.avatar_url ? (
              <img src={author.avatar_url} alt={author.name} className="hm-author-avatar" style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover' }} />
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
                    <img src={article.featured_image} alt={article.title} className="hm-related-image" />
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
