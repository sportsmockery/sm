import { Metadata } from 'next'
import Link from 'next/link'
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm'

export const metadata: Metadata = {
  title: 'Forgot Password | Sports Mockery',
  description: 'Reset your Sports Mockery password',
}

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4" style={{ backgroundColor: 'var(--sm-dark)' }}>
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="rounded-2xl p-8 shadow-sm" style={{ border: '1px solid var(--sm-border)', backgroundColor: 'var(--sm-card)' }}>
          {/* Logo */}
          <div className="mb-8 text-center">
            <Link href="/" className="inline-block">
              <span className="font-heading text-2xl font-black tracking-tight" style={{ color: 'var(--sm-text)' }}>
                SPORTS
                <span className="bg-gradient-to-r from-[#FF0000] to-[#8B0000] bg-clip-text text-transparent">
                  MOCKERY
                </span>
              </span>
            </Link>
            <h2 className="mt-6 text-xl font-bold" style={{ color: 'var(--sm-text)' }}>
              Forgot your password?
            </h2>
            <p className="mt-2 text-sm" style={{ color: 'var(--sm-text-muted)' }}>
              No worries, we&apos;ll send you reset instructions.
            </p>
          </div>

          <ForgotPasswordForm />
        </div>
      </div>
    </div>
  )
}
