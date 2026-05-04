// Validates the `?next=` redirect target on /login and /signup so that
// post-auth navigation cannot be steered cross-origin.
//
// Audit finding #10: the value reflects safely (no XSS) but
// `router.push(next)` will follow whatever path it is given. We need to
// reject anything that isn't a same-origin internal path.
//
// Rules:
//   - Must be a non-empty string.
//   - Must start with a single '/'.
//   - Must NOT start with '//' (schemeless cross-origin) or '/\\' (Windows
//     UNC-style; some browsers normalize backslash to forward slash).
//   - Must NOT contain control chars or whitespace.
//   - Must NOT look like an absolute URL ('http://', 'https:', 'data:',
//     'javascript:', etc.).
//
// Anything invalid falls back to the supplied default (default '/').

// Matches whitespace OR an ASCII control character (U+0000–U+001F, U+007F).
const CONTROL_OR_WHITESPACE = /[\s\x00-\x1f\x7f]/
const PATH_WITH_SCHEME = /^\/[a-z][a-z0-9+.\-]*:/i

export function sanitizeNextParam(
  next: string | null | undefined,
  fallback = '/',
): string {
  if (typeof next !== 'string' || next.length === 0) return fallback
  if (next.length > 2048) return fallback

  if (CONTROL_OR_WHITESPACE.test(next)) return fallback
  if (!next.startsWith('/')) return fallback
  if (next.startsWith('//') || next.startsWith('/\\')) return fallback
  if (PATH_WITH_SCHEME.test(next)) return fallback

  return next
}
