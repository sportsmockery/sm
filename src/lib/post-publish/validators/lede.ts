import { CHICAGO_ENTITY_LIST } from '../category-types'
import { countWordsInText, getProseParagraphs } from '../normalize'
import type { CheckResult, PreflightInput, SubCheckResult } from '../types'

/**
 * Rule #19 — inverted-pyramid lede.
 * Three sub-checks all must pass:
 *   19a. ≥1 named entity in the first 2 sentences.
 *   19b. ≥1 action / state verb in the first 2 sentences.
 *   19c. Combined word count of first 2 sentences is 15–60.
 *
 * Each sub-check is reported individually so the sidebar can show which
 * one(s) failed.
 */
export function checkLede(input: PreflightInput): CheckResult {
  const paragraphs = getProseParagraphs(input.document)
  const lede = paragraphs[0] || ''
  if (!lede) {
    return {
      rule: 'lede_quality',
      passed: false,
      what_failed: 'Body has no opening paragraph.',
      why_it_matters:
        'The lede is the first thing readers, Google, and AI Overviews see — without one there is no story.',
      how_to_fix: ['Add an opening paragraph naming the entity and the action.'],
      anchor: '#body-start',
    }
  }

  const ledeSentences = splitSentences(lede).slice(0, 2).join(' ').trim()
  const restOfBody = paragraphs.slice(1).join(' ')

  const subA = checkEntity(ledeSentences, restOfBody)
  const subB = checkActionVerb(ledeSentences)
  const subC = checkFactDensity(ledeSentences)

  const subs: SubCheckResult[] = [subA, subB, subC]
  const allPassed = subs.every((s) => s.passed)
  if (allPassed) return { rule: 'lede_quality', passed: true, sub_checks: subs }

  const firstFail = subs.find((s) => !s.passed)!
  return {
    rule: 'lede_quality',
    passed: false,
    what_failed: firstFail.what_failed || 'Lede needs work.',
    why_it_matters:
      'The first two sentences should carry the named entity, the action that happened, and enough density to stand alone — that is the inverted-pyramid lede AI Overviews quote and Google ranks.',
    how_to_fix: subs.filter((s) => !s.passed).map((s) => s.what_failed || ''),
    anchor: '#body-start',
    sub_checks: subs,
  }
}

/* ---------------- sub-checks ---------------- */

function checkEntity(lede: string, restOfBody: string): SubCheckResult {
  const lower = lede.toLowerCase()
  const matched = CHICAGO_ENTITY_LIST.some((e) => e && lower.includes(e.toLowerCase()))
  if (matched) {
    return { id: '19a_entity', label: 'Named entity in lede', passed: true }
  }
  // Tell the writer which entity the rest of the article already uses, so
  // they can promote it to sentence 1.
  const lowerRest = restOfBody.toLowerCase()
  const found = CHICAGO_ENTITY_LIST.find(
    (e) => e && lowerRest.includes(e.toLowerCase())
  )
  return {
    id: '19a_entity',
    label: 'Named entity in lede',
    passed: false,
    what_failed: found
      ? `Lede has no named entity. Try moving "${found}" up from later in the article.`
      : 'Lede has no named entity (player, team, coach, GM).',
  }
}

const COPULAS = new Set(['is', 'was', 'are', 'were', 'be', 'been', 'being', 'am'])
// Permissive verb suffix matcher — false positives here are cheap.
const VERB_SUFFIX = /(ed|ing|s)$/

function checkActionVerb(lede: string): SubCheckResult {
  const tokens = lede
    .toLowerCase()
    .replace(/[^a-z\s']/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
  if (tokens.length === 0) {
    return {
      id: '19b_action',
      label: 'Action verb in lede',
      passed: false,
      what_failed: 'Lede has no words.',
    }
  }
  const onlyCopulas = tokens.every((t) => !VERB_SUFFIX.test(t) || COPULAS.has(t))
  // We need at least one non-copula verb-shaped word. This is a heuristic;
  // the cost of a false negative is the writer adds a verb, which is fine.
  const hasAction = tokens.some((t) => !COPULAS.has(t) && VERB_SUFFIX.test(t))
  if (hasAction && !onlyCopulas) {
    return { id: '19b_action', label: 'Action verb in lede', passed: true }
  }
  return {
    id: '19b_action',
    label: 'Action verb in lede',
    passed: false,
    what_failed:
      'Lede has no action. The first two sentences should describe what happened or changed — not just describe a state.',
  }
}

function checkFactDensity(lede: string): SubCheckResult {
  const wc = countWordsInText(lede)
  if (wc >= 15 && wc <= 60) {
    return { id: '19c_density', label: 'Lede 15–60 words', passed: true }
  }
  if (wc < 15) {
    return {
      id: '19c_density',
      label: 'Lede 15–60 words',
      passed: false,
      what_failed: `Lede is ${wc} words; pack in more facts (target 15–60).`,
    }
  }
  return {
    id: '19c_density',
    label: 'Lede 15–60 words',
    passed: false,
    what_failed: `Lede is ${wc} words; split into shorter sentences (target 15–60).`,
  }
}

/* ---------------- helpers ---------------- */

function splitSentences(text: string): string[] {
  if (!text) return []
  // Cheap sentence split — periods, ?, ! followed by whitespace + capital
  // letter. Loose enough to avoid splitting on "U.S." which is what we want
  // for sports writing.
  return text
    .replace(/\s+/g, ' ')
    .split(/(?<=[.?!])\s+(?=[A-Z])/g)
    .map((s) => s.trim())
    .filter(Boolean)
}
