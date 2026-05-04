export {
  SITE_URL,
  SITE_NAME,
  SITE_DESCRIPTION,
  DEFAULT_OG_IMAGE,
  TWITTER_HANDLE,
  ORG_LOGO,
  ORG_LOGO_SQUARE,
  PUBLISHER_NODE_ID,
  WEBSITE_NODE_ID,
} from './constants'

export { canonicalUrl } from './url'
export { JsonLd } from './jsonld'

export {
  newsArticleJsonLd,
  organizationJsonLd,
  type ArticleSchemaInput,
  type ImageVariant,
} from './schema/news-article'

export { breadcrumbJsonLd, type BreadcrumbCrumb } from './schema/breadcrumb'
export { personJsonLd, type PersonSchemaInput } from './schema/person'

export {
  truncateDescription,
  generateTeamMetadata,
  generateArticleMetadata,
  buildArticleTitle,
} from './legacy'
