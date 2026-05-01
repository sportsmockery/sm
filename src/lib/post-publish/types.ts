import type { ArticleDocument, ContentBlock } from '@/components/admin/BlockEditor'

/** Identifier for each of the 20 hard-block rules. */
export type RuleId =
  | 'title_length'
  | 'title_format'
  | 'slug_format'
  | 'category_present'
  | 'featured_image'
  | 'featured_alt'
  | 'meta_description'
  | 'body_word_count'
  | 'h1_unique'
  | 'heading_skip'
  | 'heading_quality'
  | 'internal_link'
  | 'external_link'
  | 'mixed_content'
  | 'duplicate_body'
  | 'image_alt'
  | 'image_dimensions'
  | 'broken_link'
  | 'lede_quality'
  | 'analysis_present'

/** How a rule is enforced on the writer experience. */
export type RuleMode = 'auto-fix' | 'auto-suggest' | 'writer-fix'

export interface RuleMeta {
  id: RuleId
  label: string
  mode: RuleMode
}

/** Normalised input shared across every validator. */
export interface PreflightInput {
  postId?: string | null
  title: string
  slug: string
  /** Block document is the source of truth; HTML is derived for regex rules. */
  document: ArticleDocument | null
  /** Optional pre-rendered HTML for legacy non-block posts. */
  contentHtml?: string
  categoryId?: string | null
  categorySlug?: string | null
  featuredImageUrl?: string | null
  featuredImageAlt?: string | null
  metaDescription?: string | null
  authorId?: string | null
}

/** Per-rule outcome. */
export interface CheckResult {
  rule: RuleId
  passed: boolean
  /** When false, populated with a 3-section explanation (matches preflight wire format). */
  what_failed?: string
  why_it_matters?: string
  how_to_fix?: string[]
  anchor?: string
  /** Sub-checks (e.g. lede 19a/19b/19c) shown as separate sidebar rows. */
  sub_checks?: SubCheckResult[]
}

export interface SubCheckResult {
  id: string
  label: string
  passed: boolean
  what_failed?: string
}

/** Returned by an auto-fixer — the patch is applied to PreflightInput before re-running checks. */
export interface AutoFixResult {
  rule: RuleId
  note: string
  patch: Partial<PreflightInput>
}

/** Wire-format response from /api/posts/preflight. */
export interface PreflightResponse {
  ready: boolean
  passed: number
  total: number
  word_count: number
  checks: CheckResult[]
  auto_fixed: { rule: RuleId; note: string }[]
}

/** Convenience type alias for working with blocks inside validators. */
export type Block = ContentBlock
