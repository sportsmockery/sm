import { getHeadings } from '../normalize'
import type { CheckResult, PreflightInput } from '../types'

const MAX_HEADING_LEN = 120

/**
 * Rule #9 — single H1.
 * Block editor toolbar only offers H2/H3/H4, so this is structurally
 * impossible to violate. We also scan paragraph HTML for stray `<h1>` tags
 * (e.g. WordPress-imported content) to catch legacy edge cases.
 */
export function checkH1Unique(input: PreflightInput): CheckResult {
  const blocks = input.document?.blocks ?? []
  let strayH1Count = 0
  for (const b of blocks) {
    const html =
      typeof (b.data as { html?: string }).html === 'string'
        ? ((b.data as { html?: string }).html || '')
        : typeof (b.data as { text?: string }).text === 'string'
          ? ((b.data as { text?: string }).text || '')
          : ''
    if (!html) continue
    const matches = html.match(/<h1\b[^>]*>/gi)
    if (matches) strayH1Count += matches.length
  }
  if (strayH1Count === 0) return { rule: 'h1_unique', passed: true }
  return {
    rule: 'h1_unique',
    passed: false,
    what_failed: `Found ${strayH1Count} stray <h1> tag${strayH1Count === 1 ? '' : 's'} inside body content.`,
    why_it_matters:
      'The post title is the only H1 — additional H1 tags fragment the document outline and confuse search engines.',
    how_to_fix: [
      'Convert each body H1 to an H2 (or H3 if nested under another H2).',
    ],
    anchor: '#body-headings',
  }
}

/**
 * Rule #10 — no skipped heading levels.
 * H2 → H3 → H4 only; no H2 → H4 jumps without an intervening H3.
 */
export function checkHeadingSkip(input: PreflightInput): CheckResult {
  const headings = getHeadings(input.document)
  if (headings.length === 0) return { rule: 'heading_skip', passed: true }

  const offenders: { level: number; text: string; expected: number }[] = []
  // Article title acts as H1, so the first body heading should be H2.
  let prev = 1
  for (const h of headings) {
    if (h.level - prev > 1) {
      offenders.push({ level: h.level, text: h.text, expected: prev + 1 })
    }
    prev = h.level
  }

  if (offenders.length === 0) return { rule: 'heading_skip', passed: true }
  const first = offenders[0]
  return {
    rule: 'heading_skip',
    passed: false,
    what_failed: `H${first.level} "${first.text}" has no parent H${first.expected}.`,
    why_it_matters:
      'Skipped heading levels break screen-reader navigation and the document outline Google uses for site hierarchy.',
    how_to_fix: [
      `Either change "${first.text}" to H${first.expected}, or add a parent H${first.expected} above it.`,
    ],
    anchor: '#body-headings',
  }
}

/**
 * Rule #11 — no empty / overlong headings.
 * The auto-fixer drops empties; this validator only fires for headings
 * that are too long (auto-suggest trim) or were missed.
 */
export function checkHeadingQuality(input: PreflightInput): CheckResult {
  const headings = getHeadings(input.document)
  for (const h of headings) {
    if (!h.text) {
      return {
        rule: 'heading_quality',
        passed: false,
        what_failed: 'Found an empty heading.',
        why_it_matters: 'Empty headings appear as gaps in the article outline.',
        how_to_fix: ['Type a heading or delete the empty heading block.'],
        anchor: '#body-headings',
      }
    }
    if (h.text.length > MAX_HEADING_LEN) {
      return {
        rule: 'heading_quality',
        passed: false,
        what_failed: `Heading "${h.text.slice(0, 40)}…" is ${h.text.length} characters; max is ${MAX_HEADING_LEN}.`,
        why_it_matters:
          "Long headings read like sentences and confuse the page's outline.",
        how_to_fix: [
          'Trim to the entity + the action (e.g. "Bears trade for Hooker").',
        ],
        anchor: '#body-headings',
      }
    }
  }
  return { rule: 'heading_quality', passed: true }
}
