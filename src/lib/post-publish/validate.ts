import { runAutoFixers } from './auto-fix'
import { wordCount } from './validators/body'
import { checkAnalysisPresent } from './validators/analysis'
import { checkBodyWordCount, checkDuplicateBody } from './validators/body'
import { checkCategoryPresent } from './validators/category'
import {
  checkH1Unique,
  checkHeadingQuality,
  checkHeadingSkip,
} from './validators/headings'
import { checkFeaturedAlt, checkFeaturedImage } from './validators/featured'
import { checkImageAlt, checkImageDimensions } from './validators/images'
import { checkLede } from './validators/lede'
import {
  checkBrokenLink,
  checkExternalLink,
  checkInternalLink,
  checkMixedContent,
} from './validators/links'
import { checkMetaDescription } from './validators/meta'
import { checkSlugFormat } from './validators/slug'
import { checkTitleFormat, checkTitleLength } from './validators/title'
import { RULES } from './rules'
import type {
  AutoFixResult,
  CheckResult,
  PreflightInput,
  PreflightResponse,
  RuleId,
} from './types'

/**
 * Run the full 20-rule preflight pipeline:
 *   1. Apply every auto-fixer to the input (collecting their notes).
 *   2. Run every validator against the patched input.
 *   3. Compose the wire-format response (counts + per-rule explanations).
 *
 * Pure function — no DB calls, no network. The publish gate wraps this and
 * adds the DB-backed checks (slug uniqueness, duplicate-body shingle).
 */
export function runPreflight(input: PreflightInput): {
  response: PreflightResponse
  patched: PreflightInput
  fixes: AutoFixResult[]
} {
  const { patched, fixes } = runAutoFixers(input)

  const checks: CheckResult[] = [
    checkTitleLength(patched),
    checkTitleFormat(patched),
    checkSlugFormat(patched),
    checkCategoryPresent(patched),
    checkFeaturedImage(patched),
    checkFeaturedAlt(patched),
    checkMetaDescription(patched),
    checkBodyWordCount(patched),
    checkH1Unique(patched),
    checkHeadingSkip(patched),
    checkHeadingQuality(patched),
    checkInternalLink(patched),
    checkExternalLink(patched),
    checkMixedContent(patched),
    checkDuplicateBody(patched),
    checkImageAlt(patched),
    checkImageDimensions(patched),
    checkBrokenLink(patched),
    checkLede(patched),
    checkAnalysisPresent(patched),
  ]

  const ordered = orderByRules(checks)
  const passed = ordered.filter((c) => c.passed).length

  return {
    response: {
      ready: passed === ordered.length,
      passed,
      total: ordered.length,
      word_count: wordCount(patched),
      checks: ordered,
      auto_fixed: fixes.map((f) => ({ rule: f.rule, note: f.note })),
    },
    patched,
    fixes,
  }
}

function orderByRules(checks: CheckResult[]): CheckResult[] {
  const byId = new Map<RuleId, CheckResult>()
  for (const c of checks) byId.set(c.rule, c)
  return RULES.map((r) => byId.get(r.id)!).filter(Boolean)
}

/** Subset of rules that block publish even when the soft gate is on. */
export function failingHardBlocks(checks: CheckResult[]): CheckResult[] {
  return checks.filter((c) => !c.passed)
}
