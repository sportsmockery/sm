import { Metadata } from 'next'
import PricingPageClient from './PricingPageClient'

export const metadata: Metadata = {
  title: 'SM+ Subscription Plans | Sports Mockery',
  description:
    'Upgrade to SM+ for ad-free reading, AR stadium tours, fan chat access, and unlimited AI queries.',
}

export default function PricingPage() {
  return <PricingPageClient />
}
