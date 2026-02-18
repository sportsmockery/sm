import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import SignupForm from '@/components/auth/SignupForm'

export const metadata: Metadata = {
  title: 'Sign Up | Sports Mockery',
  description: 'Create your Sports Mockery account',
}

export default function SignupPage() {
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
            fontSize: '26px',
            fontWeight: 700,
            fontFamily: "'Space Grotesk', var(--font-heading), sans-serif",
            color: 'var(--sm-text)',
          }}>
            Join the future
          </h2>
          <p style={{ marginTop: '8px', fontSize: '14px', color: 'var(--sm-text-muted)' }}>
            Create your Sports Mockery account
          </p>
        </div>

        <SignupForm />
      </div>
    </div>
  )
}
