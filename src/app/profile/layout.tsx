import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Profile | Sports Mockery',
  description: 'Manage your Sports Mockery profile',
  robots: { index: false, follow: false },
}

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return children
}
