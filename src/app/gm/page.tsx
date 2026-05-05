import GMPageClient from './GMPageClient'

// Force dynamic rendering so each request gets a fresh CSP nonce stamped on
// <link>/<script> tags. Without this, the Vercel CDN serves cached HTML with
// stale nonces that the new response-header CSP rejects, breaking hydration
// and theming. See PR description for full diagnosis.
export const dynamic = 'force-dynamic'

export default function GMPage() {
  return <GMPageClient />
}
