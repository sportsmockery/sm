import { JsonLd } from '@/lib/seo'
import { faqPageJsonLd, type FAQItem } from '@/lib/seo/schema/faq-page'

// Google's FAQPage rich result requires ≥3 Q&A pairs. Inlined here (rather
// than imported from `@/lib/articleFaq`) so this file stays free of the
// server-only Supabase admin client and works inside the client bundle.
const MIN_ITEMS_FOR_RICH_RESULT = 3

interface ArticleFAQProps {
  items: FAQItem[]
  /** Page path used in the JSON-LD `mainEntityOfPage`. e.g. "/chicago-bears/foo". */
  pageUrl: string
}

/**
 * Visible FAQ accordion + Google FAQPage JSON-LD.
 *
 * Google's FAQPage rich result requires:
 *   1. The Q&A content to be present in the rendered HTML (not lazy-loaded).
 *   2. At least one Q&A pair (we hold to 3+ to avoid noisy rich snippets).
 *   3. The questions to match what's visible to users.
 *
 * Native `<details>/<summary>` gives a real expandable accordion with zero
 * client JS, full keyboard support, and SEO-friendly content (Googlebot
 * indexes `<details>` content even when collapsed).
 */
export default function ArticleFAQ({ items, pageUrl }: ArticleFAQProps) {
  if (!items || items.length === 0) return null

  const eligibleForRichResult = items.length >= MIN_ITEMS_FOR_RICH_RESULT

  return (
    <section
      aria-labelledby="article-faq-heading"
      style={{
        marginTop: 48,
        borderTop: '1px solid var(--sm-border)',
        paddingTop: 32,
      }}
    >
      {eligibleForRichResult && <JsonLd data={faqPageJsonLd(pageUrl, items)} />}

      <h2
        id="article-faq-heading"
        style={{
          fontSize: 22,
          fontWeight: 700,
          color: 'var(--sm-text)',
          marginBottom: 16,
          letterSpacing: '-0.01em',
        }}
      >
        Frequently Asked Questions
      </h2>

      <div className="article-faq-list">
        {items.map((item, i) => (
          <details
            key={`${i}-${item.question.slice(0, 32)}`}
            className="article-faq-item"
            style={{
              borderBottom: '1px solid var(--sm-border)',
              padding: '16px 0',
            }}
          >
            <summary
              style={{
                cursor: 'pointer',
                fontSize: 17,
                fontWeight: 600,
                color: 'var(--sm-text)',
                listStyle: 'none',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: 16,
                lineHeight: 1.4,
              }}
            >
              <span>{item.question}</span>
              <span
                aria-hidden
                className="article-faq-marker"
                style={{
                  flexShrink: 0,
                  fontSize: 20,
                  lineHeight: 1,
                  color: 'var(--sm-text-dim)',
                  marginTop: 2,
                  transition: 'transform 200ms ease',
                }}
              >
                +
              </span>
            </summary>
            <div
              style={{
                marginTop: 12,
                fontSize: 16,
                lineHeight: 1.7,
                color: 'var(--sm-text-muted)',
              }}
            >
              {item.answer}
            </div>
          </details>
        ))}
      </div>

      {/* The +/− marker rotation is the only purely-decorative bit. Lives
          inline so the component remains a single self-contained unit. */}
      <style>{`
        .article-faq-item summary::-webkit-details-marker { display: none; }
        .article-faq-item[open] .article-faq-marker { transform: rotate(45deg); }
      `}</style>
    </section>
  )
}
