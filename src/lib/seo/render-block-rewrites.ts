/**
 * Render-time rewrites applied to block.data.html / block.data.text right
 * before paint. The publish-guardrails auto-fixer rewrites at save-time;
 * this is the safety net for legacy posts and anything that slipped through.
 *
 * Mixed-content sweep (#50): allow-listed asset hosts get auto-upgraded
 * from http:// → https://. Hosts not on the list are left alone (writers
 * sometimes embed http:// where the source genuinely doesn't speak https).
 */

const HTTPS_UPGRADE_HOSTS = new Set<string>([
  'sportsmockery.com',
  'www.sportsmockery.com',
  'test.sportsmockery.com',
  'a.espncdn.com',
  'cdn.espn.com',
  'a.espn.com',
  'i.ytimg.com',
  'youtube.com',
  'www.youtube.com',
  'youtu.be',
  'twitter.com',
  'x.com',
  'mobile.twitter.com',
  'platform.twitter.com',
  'pbs.twimg.com',
  'instagram.com',
  'www.instagram.com',
  'tiktok.com',
  'www.tiktok.com',
  'facebook.com',
  'www.facebook.com',
  'fbcdn.net',
])

const ASSET_ATTR_RE = /(\b(?:src|href)\s*=\s*")http:\/\/([^"\/]+)([^"]*)"/gi
const HARDCODED_ABSOLUTE_RE =
  /(\b(?:src|href)\s*=\s*")https?:\/\/(?:www\.)?sportsmockery\.com\/([^"]*)"/gi

/**
 * Rewrite a single HTML chunk:
 *   - Upgrade http:// → https:// for allow-listed hosts.
 *   - Replace hardcoded https://(www.)?sportsmockery.com/* absolute URLs
 *     with their relative path (#14 render-time sweep).
 */
export function rewriteRenderHtml(html: string): string {
  if (!html) return html

  const upgraded = html.replace(ASSET_ATTR_RE, (full, attr, host: string, rest) => {
    const cleanHost = host.toLowerCase()
    return HTTPS_UPGRADE_HOSTS.has(cleanHost)
      ? `${attr}https://${host}${rest}"`
      : full
  })

  const relativized = upgraded.replace(HARDCODED_ABSOLUTE_RE, (_, attr, path) => {
    return `${attr}/${path}"`
  })

  return relativized
}
