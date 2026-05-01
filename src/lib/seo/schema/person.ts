import { SITE_URL, PUBLISHER_NODE_ID } from '../constants'
import { canonicalUrl } from '../url'

export interface PersonSchemaInput {
  slug: string
  name: string
  bio?: string | null
  headshotUrl?: string | null
  jobTitle?: string | null
  alumniOf?: string | null
  knowsAbout?: string[] | null
  sameAs?: string[] | null
}

export function personJsonLd(input: PersonSchemaInput) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${SITE_URL}/author/${input.slug}#person`,
    name: input.name,
    url: canonicalUrl(`/author/${input.slug}`),
    ...(input.headshotUrl && { image: input.headshotUrl }),
    jobTitle: input.jobTitle ?? 'Sports Journalist',
    ...(input.bio && { description: input.bio }),
    ...(input.alumniOf && {
      alumniOf: { '@type': 'EducationalOrganization', name: input.alumniOf },
    }),
    knowsAbout: input.knowsAbout ?? ['Chicago Bears', 'NFL'],
    sameAs: input.sameAs ?? [],
    worksFor: { '@id': PUBLISHER_NODE_ID },
  }
}
