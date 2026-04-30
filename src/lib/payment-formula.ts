/**
 * Shared helpers for writer payment formulas.
 *
 * `formula_code` is evaluated with `posts` and `views` in scope. The whitelist
 * allows digits, whitespace, arithmetic + ternary + comparison operators,
 * parens, and the variable names — nothing else (no identifiers, quotes,
 * brackets, or property access).
 */

const FORMULA_WHITELIST = /^[\d\s+\-*/()._%VAR_<>?:]+$/

export function isValidFormula(formulaCode: unknown): formulaCode is string {
  if (typeof formulaCode !== 'string' || !formulaCode.trim()) return false
  const sanitized = formulaCode.replace(/\b(posts|views)\b/g, '__VAR__')
  return FORMULA_WHITELIST.test(sanitized)
}

export function calculatePay(formulaCode: string, posts: number, views: number): number {
  if (!isValidFormula(formulaCode)) return 0
  try {
    const fn = new Function('posts', 'views', `"use strict"; return ${formulaCode}`)
    const result = fn(posts, views)
    if (typeof result !== 'number' || !isFinite(result)) return 0
    return Math.round(result * 100) / 100
  } catch {
    return 0
  }
}
