import { countWordsInText, getBlocks, getBodyHtml, htmlToText } from '../normalize'
import type { CheckResult, PreflightInput } from '../types'

const ANALYSIS_HEADING_TERMS = [
  'analysis',
  'what it means',
  'why it matters',
  'the take',
  "what's next",
  'whats next',
  'bottom line',
  'breakdown',
  'our view',
  'the angle',
  'outlook',
  'implications',
  'read between the lines',
]

const COMMENTARY_PHRASES = [
  'we think',
  'this suggests',
  'the read here',
  'which means',
  'expect',
  'likely',
  'signals that',
  'points to',
  'our take',
  'worth noting',
  'means that',
]

/**
 * Rule #20 — original analysis present.
 * Three valid paths; pass if any one matches.
 *   A. H2 (analysis-style heading) followed by ≥80 words of prose.
 *   B. An "analysis" block (or legacy <div class="sm-analysis">) with ≥80 words.
 *   C. A blockquote followed by ≥40 words of commentary containing one of
 *      the commentary phrases above.
 */
export function checkAnalysisPresent(input: PreflightInput): CheckResult {
  if (matchesPathA(input) || matchesPathB(input) || matchesPathC(input)) {
    return { rule: 'analysis_present', passed: true }
  }
  return {
    rule: 'analysis_present',
    passed: false,
    what_failed: 'Article has no original analysis section.',
    why_it_matters:
      'Google rewards posts that go beyond the wire — original takes, what-it-means sections, and writer commentary on quotes are what AI Overviews cite.',
    how_to_fix: [
      'Insert an "Analysis" or "What it means" H2 with at least 80 words of your take.',
      'Insert an Analysis Block callout with at least 80 words.',
      'Add a blockquote with a source quote, then 40+ words of your commentary on it.',
    ],
    anchor: '#body-end',
  }
}

/* ---------------- path matchers ---------------- */

function matchesPathA(input: PreflightInput): boolean {
  const blocks = getBlocks(input)
  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i]
    if (b.type !== 'heading' || b.data.level !== 2) continue
    const heading = (b.data.text || '').toLowerCase()
    if (!ANALYSIS_HEADING_TERMS.some((t) => heading.includes(t))) continue
    // Sum prose words from the next blocks until the next H2 (or end).
    let words = 0
    for (let j = i + 1; j < blocks.length; j++) {
      const n = blocks[j]
      if (n.type === 'heading' && n.data.level === 2) break
      const data = n.data as Record<string, unknown>
      if (typeof data.html === 'string') words += countWordsInText(htmlToText(data.html))
      else if (typeof data.text === 'string') words += countWordsInText(htmlToText(data.text))
    }
    if (words >= 80) return true
  }
  // Fallback for legacy HTML posts: scan body HTML for an analysis-style H2
  // and the prose under it.
  const html = getBodyHtml(input)
  if (!html) return false
  const re = /<h2\b[^>]*>([\s\S]*?)<\/h2>([\s\S]*?)(?=<h2\b|$)/gi
  let m: RegExpExecArray | null
  while ((m = re.exec(html))) {
    const headingText = htmlToText(m[1]).toLowerCase()
    if (!ANALYSIS_HEADING_TERMS.some((t) => headingText.includes(t))) continue
    if (countWordsInText(htmlToText(m[2])) >= 80) return true
  }
  return false
}

function matchesPathB(input: PreflightInput): boolean {
  // Native analysis block (added in phase 2).
  const blocks = getBlocks(input)
  for (const b of blocks) {
    if ((b.type as string) !== 'analysis') continue
    const data = b.data as { html?: string }
    const words = countWordsInText(htmlToText(data.html || ''))
    if (words >= 80) return true
  }
  // Legacy HTML callout.
  const html = getBodyHtml(input)
  const re = /<div\b[^>]*class\s*=\s*"[^"]*sm-analysis[^"]*"[^>]*>([\s\S]*?)<\/div>/gi
  let m: RegExpExecArray | null
  while ((m = re.exec(html))) {
    if (countWordsInText(htmlToText(m[1])) >= 80) return true
  }
  return false
}

function matchesPathC(input: PreflightInput): boolean {
  const blocks = getBlocks(input)
  // Block-mode: a quote block followed by a paragraph with commentary.
  for (let i = 0; i < blocks.length - 1; i++) {
    if (blocks[i].type !== 'quote') continue
    // Find the next prose-bearing block.
    for (let j = i + 1; j < blocks.length; j++) {
      const n = blocks[j]
      const data = n.data as Record<string, unknown>
      const text =
        typeof data.html === 'string'
          ? htmlToText(data.html)
          : typeof data.text === 'string'
            ? htmlToText(data.text)
            : ''
      if (!text) continue
      if (countWordsInText(text) >= 40 && hasCommentaryPhrase(text)) return true
      break
    }
  }
  // Legacy HTML: <blockquote>…</blockquote> then a <p>.
  const html = getBodyHtml(input)
  const re =
    /<blockquote[^>]*>[\s\S]*?<\/blockquote>\s*<p[^>]*>([\s\S]*?)<\/p>/gi
  let m: RegExpExecArray | null
  while ((m = re.exec(html))) {
    const text = htmlToText(m[1])
    if (countWordsInText(text) >= 40 && hasCommentaryPhrase(text)) return true
  }
  return false
}

function hasCommentaryPhrase(text: string): boolean {
  const lower = text.toLowerCase()
  return COMMENTARY_PHRASES.some((p) => lower.includes(p))
}
