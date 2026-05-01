import type { CheckResult, PreflightInput } from '../types'

/**
 * Rule #4 — primary category present.
 * Schema enforces "exactly one" via the single category_id column; we just
 * need to confirm the writer (or the auto-suggester) actually picked one.
 */
export function checkCategoryPresent(input: PreflightInput): CheckResult {
  if (input.categoryId) return { rule: 'category_present', passed: true }
  return {
    rule: 'category_present',
    passed: false,
    what_failed: 'No primary category is selected.',
    why_it_matters:
      'Without a category the post has no hub, no breadcrumb, and no canonical URL prefix.',
    how_to_fix: [
      'Pick the team or section the article belongs to in the right-hand sidebar.',
    ],
    anchor: '#category',
  }
}
