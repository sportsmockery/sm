import { countWords } from '@/lib/articles/blocks'
import { countWordsInText, getBlocks, getBodyText } from '../normalize'
import type { CheckResult, PreflightInput } from '../types'

const MIN_WORDS = 500

/**
 * Rule #8 — body word count ≥500.
 * For block-mode posts we use the canonical `countWords` helper so this
 * matches the editor's word-count badge. For legacy HTML we fall back to
 * a plain-text count.
 */
export function checkBodyWordCount(input: PreflightInput): CheckResult {
  const wc = wordCount(input)
  if (wc >= MIN_WORDS) return { rule: 'body_word_count', passed: true }
  return {
    rule: 'body_word_count',
    passed: false,
    what_failed: `Body is ${wc} words; needs ${MIN_WORDS}.`,
    why_it_matters:
      "Articles under 500 words trigger Google's thin-content classifier and rarely earn AI Overview citations.",
    how_to_fix: [
      "Add a 'What it means' section after the lede with 2–3 sentences of analysis.",
      'Add a quote from the press conference, beat reporter, or team source.',
      "Add a 'What's next' closer naming the next game, deadline, or decision point.",
    ],
    anchor: '#body-end',
  }
}

/**
 * Public helper so the preflight orchestrator can include the running word
 * count in its top-level response without recomputing.
 */
export function wordCount(input: PreflightInput): number {
  const blocks = getBlocks(input)
  if (blocks.length > 0) return countWords(blocks)
  return countWordsInText(getBodyText(input))
}

/**
 * Rule #15 — duplicate body. Phase 1 only sketches the API surface; the
 * actual shingle/Jaccard query against published posts is implemented at
 * the publish endpoint where we have DB access. The validator returns
 * passed=true here; the publish gate replaces it with the real check.
 */
export function checkDuplicateBody(_input: PreflightInput): CheckResult {
  return { rule: 'duplicate_body', passed: true }
}
