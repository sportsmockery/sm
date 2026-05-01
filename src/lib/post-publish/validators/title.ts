import type { CheckResult, PreflightInput } from '../types'

const MIN = 30
const MAX = 65

export function checkTitleLength(input: PreflightInput): CheckResult {
  const len = (input.title || '').trim().length
  if (len >= MIN && len <= MAX) {
    return { rule: 'title_length', passed: true }
  }
  if (len === 0) {
    return {
      rule: 'title_length',
      passed: false,
      what_failed: 'Title is missing.',
      why_it_matters:
        'Search engines and social platforms index the title before anything else; a missing title kills discoverability.',
      how_to_fix: ['Add a title that names the entity and the news in 30–65 characters.'],
      anchor: '#title',
    }
  }
  if (len < MIN) {
    return {
      rule: 'title_length',
      passed: false,
      what_failed: `Title is ${len} characters; needs at least ${MIN}.`,
      why_it_matters:
        'Short titles rarely include the named entity plus the news angle, which hurts both click-through and AI Overview citation eligibility.',
      how_to_fix: [
        'Try adding the player or team to the front of the title.',
        'Add the verb describing what happened (e.g. "trade", "extends", "fired").',
      ],
      anchor: '#title',
    }
  }
  return {
    rule: 'title_length',
    passed: false,
    what_failed: `Title is ${len} characters; max is ${MAX}.`,
    why_it_matters:
      'Google truncates titles past ~65 chars in search results — readers never see the news angle.',
    how_to_fix: [
      'Trim filler words from the end (e.g. drop "according to reports").',
      'Move the entity to the front so it survives truncation.',
    ],
    anchor: '#title',
  }
}

/**
 * Title formatting — rule #2 (run after auto-fixer).
 * Auto-fix runs first; if anything still looks all-caps or ends in dots
 * we surface it instead of silently passing.
 */
export function checkTitleFormat(input: PreflightInput): CheckResult {
  const t = input.title || ''
  if (!t) return { rule: 'title_format', passed: true }
  if (/[.…]\s*$/u.test(t.trim())) {
    return {
      rule: 'title_format',
      passed: false,
      what_failed: 'Title ends with an ellipsis or period.',
      why_it_matters: 'Trailing dots signal clickbait and are stripped from social cards.',
      how_to_fix: ['Remove the trailing punctuation.'],
      anchor: '#title',
    }
  }
  const letters = t.replace(/[^A-Za-z]/g, '')
  if (letters.length >= 4 && letters === letters.toUpperCase()) {
    return {
      rule: 'title_format',
      passed: false,
      what_failed: 'Title is in ALL CAPS.',
      why_it_matters: 'All-caps titles trigger spam classifiers and look like tabloid bait.',
      how_to_fix: ['Use sentence case or title case.'],
      anchor: '#title',
    }
  }
  return { rule: 'title_format', passed: true }
}
