import { getImageBlocks } from '../normalize'
import type { CheckResult, PreflightInput } from '../types'

const MIN_ALT = 5

/**
 * Rule #16 — every inline image has alt text.
 * The auto-suggester (vision API) is wired in phase 3 — this validator
 * only blocks when the writer has actively emptied the alt field.
 */
export function checkImageAlt(input: PreflightInput): CheckResult {
  const images = getImageBlocks(input.document)
  if (images.length === 0) return { rule: 'image_alt', passed: true }
  const offenders = images.filter((img) => !img.alt || img.alt.trim().length < MIN_ALT)
  if (offenders.length === 0) return { rule: 'image_alt', passed: true }
  return {
    rule: 'image_alt',
    passed: false,
    what_failed: `${offenders.length} inline image${offenders.length === 1 ? '' : 's'} ${offenders.length === 1 ? 'is' : 'are'} missing alt text.`,
    why_it_matters:
      'Alt text is read aloud to screen-reader users and indexed by Google Images.',
    how_to_fix: [
      'Open each image block and describe what is in the picture (5+ characters).',
    ],
    anchor: '#body-images',
  }
}

/**
 * Rule #17 — every inline image carries explicit width + height.
 * Block schema does not yet store dimensions; phase 3 extends the schema.
 * For now we auto-pass to avoid false blocks.
 */
export function checkImageDimensions(_input: PreflightInput): CheckResult {
  return { rule: 'image_dimensions', passed: true }
}
