import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm'

export const metadata: Metadata = {
  title: 'Forgot Password | Sports Mockery',
  description: 'Reset your Sports Mockery password',
}

export default function ForgotPasswordPage() {
  return (
    <div className="sm-hero-bg" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 16px' }}>
      <div className="sm-grid-overlay" />
      <div className="glass-card glass-card-static" style={{ position: 'relative', width: '100%', maxWidth: '420px', padding: '40px 32px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Link href="/" style={{ display: 'inline-block' }}>
            <Image
              src="/logos/SM_Full_v2.png"
              alt="Sports Mockery"
              width={180}
              height={45}
              className="dark:hidden"
              priority
            />
            <Image
              src="/logos/v2_SM_Whole.png"
              alt="Sports Mockery"
              width={180}
              height={45}
              className="hidden dark:block"
              priority
            />
          </Link>
          <h2 style={{
            marginTop: '24px',
            fontSize: '24px',
            fontWeight: 700,
            fontFamily: "Barlow, var(--font-heading), sans-serif",
            color: 'var(--sm-text)',
          }}>
            Reset your password
          </h2>
          <p style={{ marginTop: '8px', fontSize: '14px', color: 'var(--sm-text-muted)' }}>
            No worries, we&apos;ll send you reset instructions.
          </p>
        </div>

        <ForgotPasswordForm />
      </div>
    </div>
  )
}
