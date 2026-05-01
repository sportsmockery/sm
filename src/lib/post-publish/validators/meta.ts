import type { CheckResult, PreflightInput } from '../types'

const MIN = 70
const MAX = 160

/** Rule #7 — meta description 70–160 chars. */
export function checkMetaDescription(input: PreflightInput): CheckResult {
  const desc = (input.metaDescription || '').trim()
  const len = desc.length
  if (len === 0) {
    return {
      rule: 'meta_description',
      passed: false,
      what_failed: 'Meta description is missing.',
      why_it_matters:
        'The meta description is the summary Google shows in search results — without one, Google picks an unflattering sentence at random.',
      how_to_fix: [
        'Open the SEO panel and accept the auto-suggested description, or write 70–160 chars summarising the news + entity.',
      ],
      anchor: '#meta-description',
    }
  }
  if (len < MIN) {
    return {
      rule: 'meta_description',
      passed: false,
      what_failed: `Meta description is ${len} characters; needs ${MIN}+.`,
      why_it_matters:
        'Short descriptions skip the entity or the news angle and lose click-through.',
      how_to_fix: ['Add more context — who, what, why it matters in one sentence.'],
      anchor: '#meta-description',
    }
  }
  if (len > MAX) {
    return {
      rule: 'meta_description',
      passed: false,
      what_failed: `Meta description is ${len} characters; max is ${MAX}.`,
      why_it_matters: 'Google truncates past ~160 chars; readers never see the rest.',
      how_to_fix: ['Trim filler. Keep the entity + the verb + the stakes.'],
      anchor: '#meta-description',
    }
  }
  return { rule: 'meta_description', passed: true }
}
