import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Fan Zone',
  description: 'Join the Chicago sports fan community. Connect with Bears, Bulls, Cubs, White Sox, and Blackhawks fans.',
}

export default function FanZoneLayout({ children }: { children: React.ReactNode }) {
  return children
}
