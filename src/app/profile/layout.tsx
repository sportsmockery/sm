import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Profile',
  description: 'Manage your Sports Mockery profile',
  robots: { index: false, follow: false },
  openGraph: {
    title: 'Profile | Sports Mockery',
  },
}

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return children
}
