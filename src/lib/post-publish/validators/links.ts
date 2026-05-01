import { extractLinks, getBodyHtml } from '../normalize'
import type { CheckResult, PreflightInput } from '../types'

const INTERNAL_HOSTS = ['sportsmockery.com', 'test.sportsmockery.com']

function isInternal(href: string): boolean {
  if (!href) return false
  if (href.startsWith('/')) return true
  if (href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) {
    return false
  }
  try {
    const url = new URL(href)
    return INTERNAL_HOSTS.some((h) => url.hostname === h || url.hostname.endsWith('.' + h))
  } catch {
    return false
  }
}

function isExternal(href: string): boolean {
  if (!href) return false
  if (!/^https?:\/\//i.test(href)) return false
  return !isInternal(href)
}

/**
 * Rule #12 — at least one internal link to a hub or related article.
 */
export function checkInternalLink(input: PreflightInput): CheckResult {
  const links = extractLinks(getBodyHtml(input))
  if (links.some(isInternal)) return { rule: 'internal_link', passed: true }
  return {
    rule: 'internal_link',
    passed: false,
    what_failed: 'No internal link to a hub or related post.',
    why_it_matters:
      'Internal links pass authority across the site and keep readers on more than one page.',
    how_to_fix: [
      'Link the team name on first mention to its hub page (e.g. "Bears" → /chicago-bears).',
      'Cite a previous SM article that gives context.',
    ],
    anchor: '#body-end',
  }
}

/**
 * Rule #13 — at least one external authority link.
 */
export function checkExternalLink(input: PreflightInput): CheckResult {
  const links = extractLinks(getBodyHtml(input))
  if (links.some(isExternal)) return { rule: 'external_link', passed: true }
  return {
    rule: 'external_link',
    passed: false,
    what_failed: 'No external authority link.',
    why_it_matters:
      'Outbound links to ESPN, The Athletic, beat reporters, or league sources are how AI Overviews and Google quality raters verify claims.',
    how_to_fix: [
      'Add a link to the source you cited (press conference video, beat reporter tweet, league site).',
    ],
    anchor: '#body-end',
  }
}

/**
 * Rule #14 — no mixed content. The auto-fixer rewrites http:// to https://;
 * this validator only fires for what slipped through (e.g. raw <a href="http://">
 * which the auto-fixer skips because it might be intentional).
 */
export function checkMixedContent(input: PreflightInput): CheckResult {
  const html = getBodyHtml(input)
  const matches = html.match(/(\bsrc|\bhref)\s*=\s*"http:\/\/[^"]+"/gi) || []
  if (matches.length === 0) return { rule: 'mixed_content', passed: true }
  return {
    rule: 'mixed_content',
    passed: false,
    what_failed: `Found ${matches.length} insecure (http://) URL${matches.length === 1 ? '' : 's'} in the body.`,
    why_it_matters:
      'Browsers block insecure assets on HTTPS pages and Google flags mixed content as a quality issue.',
    how_to_fix: ['Replace http:// with https:// for each linked or embedded asset.'],
    anchor: '#body-end',
  }
}

/**
 * Rule #18 — no broken internal links. Phase 1 stub: the actual HEAD-check
 * only runs at publish time (it is too slow for live preflight). Returns
 * passed=true here; the publish gate replaces it with the real check.
 */
export function checkBrokenLink(_input: PreflightInput): CheckResult {
  return { rule: 'broken_link', passed: true }
}
