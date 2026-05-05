import { Metadata } from 'next'

// Force dynamic rendering so each request gets a fresh CSP nonce stamped on
// <link>/<script> tags. Without this, the Vercel CDN serves cached HTML with
// stale nonces that the new response-header CSP rejects, breaking hydration
// and theming. See PR description for full diagnosis.
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Mock Draft',
  description: 'Run mock drafts for your favorite Chicago teams. Take control of the Bears, Bulls, Blackhawks, Cubs, or White Sox draft picks.',
}

export default function MockDraftLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
