import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Fan Zone',
  description: 'Join the Chicago sports fan community. Connect with Bears, Bulls, Cubs, White Sox, and Blackhawks fans.',
  alternates: { canonical: 'https://sportsmockery.com/fan-zone' },
  openGraph: {
    title: 'Fan Zone | Sports Mockery',
    description: 'Join the Chicago sports fan community. Connect with Bears, Bulls, Cubs, White Sox, and Blackhawks fans.',
    images: [{ url: 'https://sportsmockery.com/og-image.png', width: 1200, height: 630 }],
  },
}

export default function FanZoneLayout({ children }: { children: React.ReactNode }) {
  return children
}
