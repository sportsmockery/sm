import type { RuleId, RuleMeta } from './types'

/**
 * Registry of the 20 hard-block rules. Drives the UI checklist and the
 * publish gate. Order here is the canonical order shown in the sidebar.
 */
export const RULES: RuleMeta[] = [
  { id: 'title_length', label: 'Title length (30–65 chars)', mode: 'auto-suggest' },
  { id: 'title_format', label: 'Title formatting', mode: 'auto-fix' },
  { id: 'slug_format', label: 'Slug format & uniqueness', mode: 'auto-fix' },
  { id: 'category_present', label: 'Primary category', mode: 'auto-suggest' },
  { id: 'featured_image', label: 'Featured image (auto-resized to 1200×630)', mode: 'auto-fix' },
  { id: 'featured_alt', label: 'Featured image alt text', mode: 'auto-suggest' },
  { id: 'meta_description', label: 'Meta description (70–160 chars)', mode: 'auto-suggest' },
  { id: 'body_word_count', label: 'Body word count (≥500)', mode: 'writer-fix' },
  { id: 'h1_unique', label: 'Single H1', mode: 'auto-fix' },
  { id: 'heading_skip', label: 'No skipped heading levels', mode: 'writer-fix' },
  { id: 'heading_quality', label: 'No empty / overlong headings', mode: 'auto-fix' },
  { id: 'internal_link', label: 'Internal hub link', mode: 'auto-fix' },
  { id: 'external_link', label: 'External authority link', mode: 'auto-suggest' },
  { id: 'mixed_content', label: 'No mixed content (HTTPS only)', mode: 'auto-fix' },
  { id: 'duplicate_body', label: 'No duplicate of recent post', mode: 'writer-fix' },
  { id: 'image_alt', label: 'Inline image alt text', mode: 'auto-suggest' },
  { id: 'image_dimensions', label: 'Inline image width/height', mode: 'auto-fix' },
  { id: 'broken_link', label: 'No broken internal links', mode: 'auto-fix' },
  { id: 'lede_quality', label: 'Inverted-pyramid lede', mode: 'writer-fix' },
  { id: 'analysis_present', label: 'Original analysis present', mode: 'writer-fix' },
]

const RULE_MAP: Record<RuleId, RuleMeta> = RULES.reduce(
  (acc, rule) => {
    acc[rule.id] = rule
    return acc
  },
  {} as Record<RuleId, RuleMeta>
)

export function getRule(id: RuleId): RuleMeta {
  return RULE_MAP[id]
}
