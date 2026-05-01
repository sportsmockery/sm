/**
 * Entity → category mapping used by the auto-suggest for rule #4 (primary
 * category). Match is "first hit wins" — we walk the title and first
 * paragraph and return the category slug for the first matched entity.
 *
 * The map is intentionally hand-curated rather than NLP-driven because the
 * miss cost is high (wrong category = bad slug + bad sidebar) and the hit
 * cost is small (writer changes the dropdown).
 */

export type CategorySlug =
  | 'chicago-bears'
  | 'chicago-cubs'
  | 'chicago-bulls'
  | 'chicago-blackhawks'
  | 'chicago-white-sox'

interface EntityRule {
  pattern: RegExp
  category: CategorySlug
}

export const ENTITY_RULES: EntityRule[] = [
  // Bears
  { pattern: /\bcaleb williams\b/i, category: 'chicago-bears' },
  { pattern: /\bryan poles\b/i, category: 'chicago-bears' },
  { pattern: /\bben johnson\b/i, category: 'chicago-bears' },
  { pattern: /\bd'?andre swift\b/i, category: 'chicago-bears' },
  { pattern: /\bbears\b/i, category: 'chicago-bears' },
  { pattern: /\bsoldier field\b/i, category: 'chicago-bears' },
  // Cubs
  { pattern: /\bcraig counsell\b/i, category: 'chicago-cubs' },
  { pattern: /\bjed hoyer\b/i, category: 'chicago-cubs' },
  { pattern: /\bpete crow-armstrong\b/i, category: 'chicago-cubs' },
  { pattern: /\bcubs\b/i, category: 'chicago-cubs' },
  { pattern: /\bwrigley\b/i, category: 'chicago-cubs' },
  // White Sox
  { pattern: /\bchris getz\b/i, category: 'chicago-white-sox' },
  { pattern: /\b(white\s*sox|whitesox|sox)\b/i, category: 'chicago-white-sox' },
  { pattern: /\brate field\b/i, category: 'chicago-white-sox' },
  // Bulls
  { pattern: /\bjosh giddey\b/i, category: 'chicago-bulls' },
  { pattern: /\bcoby white\b/i, category: 'chicago-bulls' },
  { pattern: /\bartūras karnišovas\b/i, category: 'chicago-bulls' },
  { pattern: /\bbulls\b/i, category: 'chicago-bulls' },
  { pattern: /\bunited center\b/i, category: 'chicago-bulls' },
  // Blackhawks
  { pattern: /\bconnor bedard\b/i, category: 'chicago-blackhawks' },
  { pattern: /\bkyle davidson\b/i, category: 'chicago-blackhawks' },
  { pattern: /\bblackhawks\b/i, category: 'chicago-blackhawks' },
]

/**
 * Detect a category from raw text. Returns the slug of the first matched
 * entity, or null if no entity matches.
 */
export function detectCategorySlug(text: string): CategorySlug | null {
  if (!text) return null
  for (const rule of ENTITY_RULES) {
    if (rule.pattern.test(text)) return rule.category
  }
  return null
}

/**
 * Exhaustive list of Chicago sports proper nouns used by the lede validator
 * to detect named entities. Re-exported from the entities module so callers
 * still importing from `category-types` keep working.
 */
export { CHICAGO_ENTITY_LIST } from './entities/chicago-sports'
