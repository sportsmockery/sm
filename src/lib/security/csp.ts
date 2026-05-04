// Builds a per-request Content-Security-Policy header with a fresh nonce.
// Audit finding #8: the site has every other security header set but is
// missing CSP. We use a nonce-based policy with `'strict-dynamic'` so
// Next.js's framework scripts can keep loading without `unsafe-inline`.
//
// The middleware generates the nonce, stamps it on the response header,
// AND forwards it to the rendering pipeline via the `x-csp-nonce` request
// header so server components (e.g. via `next/script` nonce={nonce}) can
// pick it up.

const PROD_CONNECT_SOURCES = [
  "'self'",
  'https://*.supabase.co',
  'wss://*.supabase.co',
  'https://datalab.sportsmockery.com',
  'https://vitals.vercel-insights.com',
  'https://*.vercel-insights.com',
].join(' ')

const PROD_SCRIPT_SOURCES_ALLOWLIST = [
  // Vercel runtime scripts on preview deploys
  'https://*.vercel.app',
  // Anthropic / OpenAI client SDKs are server-only — not listed here.
].join(' ')

export function generateNonce(): string {
  // Use Web Crypto so this works in the Edge runtime.
  const arr = new Uint8Array(16)
  // crypto is global on Edge / browser / Node 20.
  crypto.getRandomValues(arr)
  // base64
  let bin = ''
  for (let i = 0; i < arr.length; i++) bin += String.fromCharCode(arr[i])
  return typeof btoa === 'function'
    ? btoa(bin)
    : Buffer.from(bin, 'binary').toString('base64')
}

export function buildCspHeader(nonce: string, opts?: { reportOnly?: boolean }) {
  // 'strict-dynamic' lets a nonce'd script load further scripts via
  // document.createElement('script'). This is what lets Next.js's
  // hydration pipeline work without listing every chunk URL.
  const directives: Record<string, string> = {
    'default-src': "'self'",
    'script-src': `'self' 'nonce-${nonce}' 'strict-dynamic' ${PROD_SCRIPT_SOURCES_ALLOWLIST}`,
    // Tailwind injects inline <style> tags during dev/SSR; allow
    // unsafe-inline for styles only (industry-standard tradeoff).
    'style-src': "'self' 'unsafe-inline'",
    'img-src': "'self' https: data: blob:",
    'font-src': "'self' data:",
    'connect-src': PROD_CONNECT_SOURCES,
    'media-src': "'self' https: blob:",
    'frame-src': "'self' https://www.youtube.com https://www.youtube-nocookie.com https://platform.twitter.com https://embed.tiktok.com",
    'frame-ancestors': "'self'",
    'base-uri': "'self'",
    'form-action': "'self'",
    'object-src': "'none'",
    'upgrade-insecure-requests': '',
  }

  const value = Object.entries(directives)
    .map(([k, v]) => (v ? `${k} ${v}` : k))
    .join('; ')

  return {
    headerName: opts?.reportOnly
      ? 'Content-Security-Policy-Report-Only'
      : 'Content-Security-Policy',
    headerValue: value,
  }
}
