import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Reset Password | Sports Mockery',
  description: 'Reset your Sports Mockery password',
  robots: { index: false, follow: false },
}

export default function ResetPasswordLayout({ children }: { children: React.ReactNode }) {
  return children
}
