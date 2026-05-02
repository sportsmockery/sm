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

// Full-name mentions the PostIQ auto-linker will resolve at publish time.
// Keeping this list local (instead of fetching the dictionary) is fine — the
// rule only needs to know whether *something* will be linked, not what.
const AUTO_LINK_TEAM_NAMES = [
  'Chicago Bears',
  'Chicago Bulls',
  'Chicago Blackhawks',
  'Chicago Cubs',
  'Chicago White Sox',
] as const

function bodyMentionsAutoLinkable(html: string): boolean {
  if (!html) return false
  // Strip existing anchors so a `<a>` already wrapping the team name doesn't
  // count twice — the linker would skip it anyway.
  const stripped = html.replace(/<a\b[^>]*>[\s\S]*?<\/a>/gi, ' ')
  return AUTO_LINK_TEAM_NAMES.some((name) => stripped.includes(name))
}

/**
 * Rule #12 — at least one internal link to a hub or related article.
 *
 * Auto-fix path: the PostIQ auto-linker (server-side, on publish) inserts an
 * internal hub link the first time a Chicago team or active-roster player is
 * mentioned by full name. We pass the rule when either:
 *   - the body already has an internal link, OR
 *   - the body mentions a full Chicago team name (the linker will handle it).
 */
export function checkInternalLink(input: PreflightInput): CheckResult {
  const html = getBodyHtml(input)
  const links = extractLinks(html)
  if (links.some(isInternal)) return { rule: 'internal_link', passed: true }
  if (bodyMentionsAutoLinkable(html)) return { rule: 'internal_link', passed: true }
  return {
    rule: 'internal_link',
    passed: false,
    what_failed: 'No internal link to a hub or related post.',
    why_it_matters:
      'Internal links pass authority across the site and keep readers on more than one page.',
    how_to_fix: [
      'Mention a Chicago team by full name (e.g. "Chicago Bears") — PostIQ auto-links the first mention on publish.',
      'Or link manually to a hub page or previous SM article.',
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
