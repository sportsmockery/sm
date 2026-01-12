interface AuthorSchemaProps {
  author: {
    name: string
    slug?: string
    bio?: string
    avatar_url?: string
    twitter_url?: string
    email?: string
    joined_at?: string
  }
  postCount: number
}

export default function AuthorSchema({ author, postCount }: AuthorSchemaProps) {
  const authorUrl = `https://sportsmockery.com/author/${author.slug || 'staff'}`

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: author.name,
    url: authorUrl,
    description: author.bio,
    image: author.avatar_url,
    sameAs: [
      author.twitter_url,
      author.email ? `mailto:${author.email}` : undefined,
    ].filter(Boolean),
    jobTitle: 'Sports Writer',
    worksFor: {
      '@type': 'Organization',
      name: 'SportsMockery',
      url: 'https://sportsmockery.com',
    },
    memberOf: {
      '@type': 'Organization',
      name: 'SportsMockery',
    },
    mainEntityOfPage: {
      '@type': 'ProfilePage',
      '@id': authorUrl,
    },
    // Author statistics (using custom extension)
    interactionStatistic: {
      '@type': 'InteractionCounter',
      interactionType: 'https://schema.org/WriteAction',
      userInteractionCount: postCount,
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
