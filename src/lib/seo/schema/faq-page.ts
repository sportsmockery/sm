import { canonicalUrl } from '../url'

export interface FAQItem {
  question: string
  answer: string
}

export function faqPageJsonLd(pageUrl: string, items: FAQItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntityOfPage: { '@type': 'WebPage', '@id': canonicalUrl(pageUrl) },
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  }
}
