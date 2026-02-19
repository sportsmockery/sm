import { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Image from 'next/image'
import LoginForm from '@/components/auth/LoginForm'

export const metadata: Metadata = {
  title: 'Sign In | Sports Mockery',
  description: 'Sign in to your Sports Mockery account',
}

interface LoginPageProps {
  searchParams: Promise<{ next?: string }>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams
  const redirectTo = params.next || '/admin'

  // If already logged in, redirect to destination
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll() {},
      },
    }
  )
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    redirect(redirectTo)
  }

  // Comparison features
  const features: { name: string; sm: boolean | 'coming-soon'; espn: boolean }[] = [
    { name: 'Scout AI (Chicago Q&A)', sm: true, espn: false },
    { name: 'GM Trade Simulator', sm: true, espn: false },
    { name: 'Mock Draft Simulator (All 4 Leagues)', sm: true, espn: false },
    { name: 'AI Fan Chat Personalities', sm: true, espn: false },
    { name: 'Hands-Free Article Player (4 AI Voices, Auto-Queue)', sm: true, espn: false },
    { name: 'Interactive D3 Charts', sm: true, espn: false },
    { name: 'Chicago-Only Focus', sm: true, espn: false },
    { name: 'AR/VR Stadium Tours', sm: 'coming-soon', espn: false },
  ]

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Left side - Form */}
      <div style={{
        flex: '1 1 0%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 32px',
        background: 'var(--sm-card)',
        maxWidth: '520px',
      }}>
        <div style={{ width: '100%', maxWidth: '420px' }}>
          {/* Logo */}
          <div style={{ marginBottom: '32px', textAlign: 'center' }}>
            <Link href="/" style={{ display: 'inline-block' }}>
              {/* Light mode logo */}
              <Image
                src="/logos/SM_Full_v2.png"
                alt="Sports Mockery"
                width={200}
                height={50}
                className="dark:hidden"
                priority
              />
              {/* Dark mode logo */}
              <Image
                src="/logos/v2_SM_Whole.png"
                alt="Sports Mockery"
                width={200}
                height={50}
                className="hidden dark:block"
                priority
              />
            </Link>
            <h2 style={{
              marginTop: '32px',
              fontSize: '28px',
              fontWeight: 700,
              fontFamily: "'Space Grotesk', var(--font-heading), sans-serif",
              color: 'var(--sm-text)',
            }}>
              Welcome back
            </h2>
            <p style={{ marginTop: '8px', fontSize: '15px', color: 'var(--sm-text-muted)' }}>
              Sign in to access your dashboard and manage content
            </p>
          </div>

          <LoginForm redirectTo={redirectTo} />
        </div>
      </div>

      {/* Right side - Features/Branding (hidden on mobile, always dark) */}
      <div className="hidden lg:flex dark" data-theme="dark" style={{
        flex: '1 1 0%',
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0a0a0b',
      }}>
        <div className="sm-grid-overlay" />
        {/* Content */}
        <div style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '100%',
          maxWidth: '720px',
          padding: '32px',
        }}>
          <Image
            src="/logos/v2_SM_Whole.png"
            alt="Sports Mockery 2.0"
            width={220}
            height={55}
            priority
          />

          <p style={{ color: '#fff', fontSize: '18px', fontWeight: 600, marginTop: '16px', textAlign: 'center' }}>
            AI-Powered. Fan-Driven. Chicago-Owned.
          </p>

          <h3 style={{
            fontSize: '24px', fontWeight: 700, color: '#fff', marginTop: '8px', textAlign: 'center',
            fontFamily: "'Space Grotesk', var(--font-heading), sans-serif",
          }}>
            Sports Mockery 2.0 Stands Alone
          </h3>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', marginTop: '4px', marginBottom: '16px', textAlign: 'center' }}>
            How we compare to the competition.
          </p>

          {/* Comparison Chart */}
          <div className="glass-card glass-card-static" style={{ width: '100%', maxWidth: '720px', padding: 0, overflow: 'hidden' }}>
            {/* Table Header */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', background: 'rgba(255,255,255,0.05)' }}>
              <div style={{ padding: '12px 16px', color: '#fff', fontWeight: 700, fontSize: '14px' }}>Feature</div>
              <div style={{ padding: '12px 16px', color: '#fff', fontWeight: 700, fontSize: '14px', textAlign: 'center' }}>Sports Mockery 2.0</div>
              <div style={{ padding: '12px 16px', color: '#fff', fontWeight: 700, fontSize: '14px', textAlign: 'center' }}>ESPN / Bleacher</div>
            </div>
            {features.map((feature, idx) => (
              <div
                key={feature.name}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  background: idx % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent',
                }}
              >
                <div style={{ padding: '8px 16px', color: 'rgba(255,255,255,0.85)', fontSize: '14px', lineHeight: '1.4' }}>{feature.name}</div>
                <div style={{ padding: '8px 16px', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {feature.sm === 'coming-soon' ? (
                    <span style={{ fontSize: '14px', fontWeight: 500, color: '#fff' }}>Coming Soon</span>
                  ) : feature.sm ? (
                    <span style={{ color: '#4ade80', fontSize: '18px' }}>&#10003;</span>
                  ) : (
                    <span style={{ color: '#f87171', fontSize: '18px' }}>&#10007;</span>
                  )}
                </div>
                <div style={{ padding: '8px 16px', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {feature.espn ? (
                    <span style={{ color: '#4ade80', fontSize: '18px' }}>&#10003;</span>
                  ) : (
                    <span style={{ color: '#f87171', fontSize: '18px' }}>&#10007;</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <p style={{ color: '#fff', fontSize: '18px', fontWeight: 600, marginTop: '16px', textAlign: 'center' }}>
            And More...
          </p>
        </div>
      </div>
    </div>
  )
}
