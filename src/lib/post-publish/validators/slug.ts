import type { CheckResult, PreflightInput } from '../types'

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*(?:\/[a-z0-9]+(?:-[a-z0-9]+)*)*$/

/**
 * Rule #3 — slug format. Length 3–75, ASCII kebab-case, optional single
 * category-prefix segment (e.g. `chicago-bears/draft-recap`).
 *
 * Database collision is checked separately by the publish endpoint with a
 * partial unique index; this validator only enforces shape.
 */
export function checkSlugFormat(input: PreflightInput): CheckResult {
  const slug = (input.slug || '').trim()
  if (!slug) {
    return {
      rule: 'slug_format',
      passed: false,
      what_failed: 'Slug is missing.',
      why_it_matters:
        'The slug is the URL — without it, the post has no canonical address to share or rank.',
      how_to_fix: [
        'Click "Edit" next to the slug and accept the auto-generated value, or type a kebab-case slug.',
      ],
      anchor: '#slug',
    }
  }
  if (slug.length < 3 || slug.length > 75) {
    return {
      rule: 'slug_format',
      passed: false,
      what_failed: `Slug is ${slug.length} characters; must be 3–75.`,
      why_it_matters:
        'Very short slugs lose context; very long slugs are truncated in shares and emails.',
      how_to_fix: ['Trim to a few descriptive words separated by hyphens.'],
      anchor: '#slug',
    }
  }
  if (!SLUG_RE.test(slug)) {
    return {
      rule: 'slug_format',
      passed: false,
      what_failed: 'Slug must be lowercase ASCII letters, digits, and hyphens.',
      why_it_matters:
        'Special characters in slugs break in shares, emails, and analytics.',
      how_to_fix: [
        'Replace spaces with hyphens, drop punctuation, and use lowercase letters only.',
      ],
      anchor: '#slug',
    }
  }
  return { rule: 'slug_format', passed: true }
}
