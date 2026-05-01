import { JsonLd, newsArticleJsonLd, type ImageVariant } from '@/lib/seo'

interface ArticleSchemaProps {
  article: {
    title: string
    excerpt?: string
    content?: string
    featured_image?: string
    published_at: string
    updated_at?: string
    slug: string
    image_variants?: Record<string, ImageVariant> | null
    author: {
      name: string
      slug: string
      avatar_url?: string
    }
    category: {
      name: string
      slug: string
    }
  }
}

export default function ArticleSchema({ article }: ArticleSchemaProps) {
  const data = newsArticleJsonLd({
    slug: article.slug,
    categorySlug: article.category.slug,
    headline: article.title,
    description: article.excerpt || '',
    datePublished: article.published_at,
    dateModified: article.updated_at || article.published_at,
    authorSlug: article.author.slug,
    authorName: article.author.name,
    imageUrl: article.featured_image || 'https://sportsmockery.com/og-image.png',
    imageVariants: article.image_variants,
    articleSection: article.category.name,
  })

  return <JsonLd data={data} />
}
