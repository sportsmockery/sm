import type { Metadata } from 'next'

// Force dynamic rendering so each request gets a fresh CSP nonce stamped on
// <link>/<script> tags. Without this, the Vercel CDN serves cached HTML with
// stale nonces that the new response-header CSP rejects, breaking hydration
// and leaving the page black. Same fix as #105 for /gm, /scout-ai, etc.
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Fan Chat — Live Discussion',
  description: 'Chat with fellow Chicago sports fans in real time. AI-powered personalities for every team channel.',
  // Live-chat threads are ephemeral and authenticated — keep noindex so
  // search engines never surface partial conversations (#43).
  robots: { index: false, follow: false },
}

export default function FanChatLayout({ children }: { children: React.ReactNode }) {
  return children
}
