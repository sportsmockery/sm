interface ArticleSchemaProps {
  article: {
    title: string
    excerpt?: string
    content?: string
    featured_image?: string
    published_at: string
    updated_at?: string
    slug: string
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
  url: string
}

export default function ArticleSchema({ article, url }: ArticleSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.title,
    description: article.excerpt || '',
    image: article.featured_image
      ? [article.featured_image]
      : ['https://sportsmockery.com/default-og-image.jpg'],
    datePublished: article.published_at,
    dateModified: article.updated_at || article.published_at,
    author: {
      '@type': 'Person',
      name: article.author.name,
      url: `https://sportsmockery.com/author/${article.author.slug}`,
    },
    publisher: {
      '@type': 'Organization',
      name: 'SportsMockery.com',
      logo: {
        '@type': 'ImageObject',
        url: 'https://sportsmockery.com/logo.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    articleSection: article.category.name,
    url: url,
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
