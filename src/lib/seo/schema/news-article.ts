import { SITE_URL, SITE_NAME, ORG_LOGO, PUBLISHER_NODE_ID } from '../constants'
import { canonicalUrl } from '../url'

export interface ImageVariant {
  url: string
  width: number
  height: number
}

export interface ArticleSchemaInput {
  slug: string
  categorySlug: string
  headline: string
  description: string
  datePublished: string
  dateModified: string
  authorSlug?: string | null
  authorName: string
  imageUrl: string
  imageVariants?: Record<string, ImageVariant> | null
  articleSection?: string | null
}

export function newsArticleJsonLd(input: ArticleSchemaInput) {
  const url = canonicalUrl(`/${input.categorySlug}/${input.slug}`)

  const variantUrls = input.imageVariants
    ? Object.values(input.imageVariants)
        .map((v) => v?.url)
        .filter((u): u is string => Boolean(u))
    : []
  const images = variantUrls.length > 0 ? variantUrls : [input.imageUrl]

  // Author is ALWAYS the human writer. Scout only produces the summary and recap
  // blocks (visibly labeled in the article body) — never the article itself.
  const author = input.authorSlug
    ? { '@id': `${SITE_URL}/author/${input.authorSlug}#person` }
    : { '@type': 'Person', name: input.authorName }

  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    '@id': `${url}#newsarticle`,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    headline: input.headline.slice(0, 110),
    description: input.description,
    image: images,
    datePublished: input.datePublished,
    dateModified: input.dateModified,
    author,
    publisher: { '@id': PUBLISHER_NODE_ID },
    url,
    ...(input.articleSection && { articleSection: input.articleSection }),
    isAccessibleForFree: true,
    inLanguage: 'en-US',
  }
}

export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'NewsMediaOrganization',
    '@id': PUBLISHER_NODE_ID,
    name: SITE_NAME,
    url: SITE_URL,
    logo: {
      '@type': 'ImageObject',
      url: ORG_LOGO,
      width: 1200,
      height: 630,
    },
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Chicago',
      addressRegion: 'IL',
      addressCountry: 'US',
    },
    areaServed: {
      '@type': 'City',
      name: 'Chicago',
    },
    sameAs: [
      'https://twitter.com/sportsmockery',
      'https://x.com/sportsmockery',
      'https://www.facebook.com/sportsmockery',
      'https://www.instagram.com/sportsmockery',
      'https://www.youtube.com/@sportsmockery',
      'https://www.tiktok.com/@sportsmockery',
    ],
    description:
      "Chicago's premier sports coverage — Bears, Bulls, Cubs, White Sox, and Blackhawks",
    publishingPrinciples: `${SITE_URL}/editorial-standards`,
  }
}
