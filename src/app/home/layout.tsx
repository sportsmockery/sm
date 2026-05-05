import type { Metadata } from 'next'
import '@/styles/home.css'
import HomeNav from '@/components/home/HomeNav'
import HomeFooter from '@/components/home/HomeFooter'

// Force dynamic rendering so each request gets a fresh CSP nonce stamped on
// <link>/<script> tags. Cascades to /home/data, /home/premium, /home/scout.
// Without this, the CDN-served prerender lacks per-request nonces and
// strict-dynamic blocks every script. Same pattern as #105 / fan-chat / admin.
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: {
    template: '%s | Sports Mockery',
    default: 'Sports Mockery',
  },
}

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="hm-root">
      <HomeNav />
      {children}
      <HomeFooter />
    </div>
  )
}
