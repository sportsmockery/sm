// WordPress / common-secret probe path matcher.
//
// Returns true when the given pathname should be answered with HTTP 410 Gone
// instead of falling through to the Next.js app shell (which would render a
// soft-200 article-not-found page — bad for SEO and a beacon for scanners).
//
// Audit finding #9 (PR #100) covered the strict literal endpoints and a few
// subpath regexes. Live verification against test.sportsmockery.com showed
// gaps for `/wp-content`, `/wp-content/uploads`, `/wordpress`, and similar
// because Vercel's automatic trailing-slash 308 was redirecting the slash
// variants we did cover (`/wp-content/`) to the slash-less form we didn't.
//
// The fix collapses the two-tier (Set + multiple regex) approach into a
// single regex that catches every variant of every probe prefix in one pass,
// before Vercel's trailing-slash redirect runs.

// Subpath prefixes — match the exact name OR the name followed by `/...`.
//   /wp-admin            ✓
//   /wp-admin/           ✓
//   /wp-admin/install.php ✓
//   /wp-administrator    ✗ (must be followed by `/` or end-of-string)
const PROBE_PREFIX_RE =
  /^\/(?:wp-admin|wp-includes|wp-content|wordpress|\.git|\.aws)(?:\/|$)/i

// Literal endpoints — exact-match only (most have a `.php` suffix that
// disqualifies them from the prefix regex's `(?:\/|$)` anchor).
const PROBE_LITERALS: ReadonlySet<string> = new Set([
  '/wp-login.php',
  '/wp-login',
  '/wp-admin.php',
  '/xmlrpc.php',
  '/wp-cron.php',
  '/wp-config.php',
  '/wp-config.php.bak',
  '/wp-config-sample.php',
  '/readme.html',
  '/license.txt',
  '/.env',
  '/.env.local',
  '/.env.production',
  '/.htaccess',
])

export function isWordPressProbe(pathname: string): boolean {
  if (typeof pathname !== 'string' || pathname.length === 0) return false
  if (PROBE_LITERALS.has(pathname)) return true
  return PROBE_PREFIX_RE.test(pathname)
}
