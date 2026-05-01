import type { CheckResult, PreflightInput } from '../types'

/**
 * Rule #5 — featured image must exist. Dimensional check (≥1200×630)
 * happens server-side at publish time once we can HEAD the asset cheaply.
 */
export function checkFeaturedImage(input: PreflightInput): CheckResult {
  const url = (input.featuredImageUrl || '').trim()
  if (!url) {
    return {
      rule: 'featured_image',
      passed: false,
      what_failed: 'No featured image set.',
      why_it_matters:
        'The featured image powers the social card, the homepage feed, and the article header. Without it the post looks broken everywhere it appears.',
      how_to_fix: [
        'Upload an image (≥1200×630) from the right-hand sidebar.',
        'Or paste a URL — the system validates dimensions before accepting.',
      ],
      anchor: '#featured-image',
    }
  }
  if (!/^https:\/\//i.test(url)) {
    return {
      rule: 'featured_image',
      passed: false,
      what_failed: 'Featured image must be served over HTTPS.',
      why_it_matters: 'Browsers block insecure images on HTTPS pages.',
      how_to_fix: ['Re-upload the image to our CDN, or replace with an https:// URL.'],
      anchor: '#featured-image',
    }
  }
  return { rule: 'featured_image', passed: true }
}

/**
 * Rule #6 — featured image alt text. ≥10 chars, descriptive.
 */
export function checkFeaturedAlt(input: PreflightInput): CheckResult {
  // No image yet → skip this rule (rule #5 handles the missing image).
  if (!input.featuredImageUrl) return { rule: 'featured_alt', passed: true }

  const alt = (input.featuredImageAlt || '').trim()
  if (alt.length < 10) {
    return {
      rule: 'featured_alt',
      passed: false,
      what_failed:
        alt.length === 0
          ? 'Featured image has no alt text.'
          : `Featured image alt is only ${alt.length} characters.`,
      why_it_matters:
        'Alt text is read aloud to screen-reader users and indexed by Google Images.',
      how_to_fix: [
        'Describe the image in 10+ characters — e.g. "Caleb Williams in Bears uniform during pregame".',
      ],
      anchor: '#featured-alt',
    }
  }
  return { rule: 'featured_alt', passed: true }
}
