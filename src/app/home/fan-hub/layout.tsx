import type { Metadata } from 'next'

// Force dynamic rendering so each request gets a fresh CSP nonce stamped on
// <link>/<script> tags. Without this, the Vercel CDN serves cached HTML with
// stale nonces that the new response-header CSP rejects, breaking hydration
// and theming. See PR description for full diagnosis.
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Fan Hub & Live Chat',
  description: 'Join the conversation with Chicago\'s most passionate sports fans. Live chat rooms for Bears, Bulls, Cubs, White Sox, and Blackhawks — powered by the SM community.',
  alternates: { canonical: '/home/fan-hub' },
  openGraph: {
    title: 'Fan Hub & Live Chat | Sports Mockery',
    description: 'Connect with Chicago sports fans in real-time. Live chat, AI insights, and trending discussions across all teams.',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
}

export default function FanHubLayout({ children }: { children: React.ReactNode }) {
  return children
}
