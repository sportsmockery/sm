import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { redirect } from 'next/navigation'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import HomeLoginForm from '@/components/home/HomeLoginForm'

export const metadata: Metadata = {
  title: {
    absolute: 'Sign In | Sports Mockery 2.0',
  },
  description: 'Sign in to your Sports Mockery account',
}

interface LoginPageProps {
  searchParams: Promise<{ next?: string }>
}

const features: { name: string; sm: boolean | 'coming-soon'; espn: boolean }[] = [
  { name: 'Scout AI (Chicago Q&A)', sm: true, espn: false },
  { name: 'GM Trade Simulator', sm: true, espn: false },
  { name: 'Mock Draft Simulator (All 4 Leagues)', sm: true, espn: false },
  { name: 'AI Fan Chat Personalities', sm: true, espn: false },
  { name: 'Hands-Free Article Player', sm: true, espn: false },
  { name: 'Interactive D3 Charts', sm: true, espn: false },
  { name: 'Chicago-Only Focus', sm: true, espn: false },
  { name: 'AR/VR Stadium Tours', sm: 'coming-soon', espn: false },
]

export default async function HomeLoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams

  // If already logged in, redirect to destination
  const cookieStore = await cookies()

  // Check for intended destination cookie (set by first-time visitor redirect)
  const intendedDestination = cookieStore.get('sm_intended_destination')?.value
  const redirectTo = params.next || intendedDestination || '/'
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

  return (
    <>
      {/* Spacer for fixed nav */}
      <div style={{ paddingTop: 80 }} />

      <div className="hm-login-layout">
        {/* Left: Login Form */}
        <div className="hm-login-form-side">
          <div className="hm-login-form-wrapper">
            {/* Logo */}
            <Link href="/home" style={{ display: 'inline-block', marginBottom: 24 }}>
              <Image
                src="/logos/v2_header_dark.png"
                alt="Sports Mockery"
                width={200}
                height={50}
                priority
                style={{ height: 'auto' }}
              />
            </Link>

            {/* Heading */}
            <h1 style={{
              fontFamily: 'var(--font-montserrat), Montserrat, sans-serif',
              fontSize: 38, fontWeight: 800, letterSpacing: -1.5,
              color: '#fff', marginBottom: 10, lineHeight: 1.1,
            }}>
              Welcome back
            </h1>
            <p style={{
              fontSize: 16, color: '#8a8a9a', lineHeight: 1.5,
              marginBottom: 40,
            }}>
              Sign in to access your dashboard and manage content
            </p>

            <HomeLoginForm redirectTo={redirectTo} />
          </div>
        </div>

        {/* Right: Feature Comparison */}
        <div className="hm-login-feature-side">
          {/* Scan line */}
          <div className="hm-login-scan" />
          {/* Glow orb */}
          <div className="hm-glow-orb hm-glow-red hm-orb-float" style={{ width: 300, height: 300, top: -80, right: -60 }} />

          <div className="hm-login-feature-content">
            {/* SM Logo */}
            <div className="hm-login-reveal hm-login-d1">
              <Image
                src="/logos/v2_SM_Whole.png"
                alt="Sports Mockery 2.0"
                width={220}
                height={55}
                priority
                style={{ height: 'auto' }}
              />
            </div>

            {/* Tagline */}
            <p className="hm-login-reveal hm-login-d2" style={{
              fontSize: 18, fontWeight: 600, color: '#fff',
              marginTop: 24, textAlign: 'center',
            }}>
              AI-Powered. Fan-Driven. Chicago-Owned.
            </p>

            <h2 className="hm-login-reveal hm-login-d3" style={{
              fontFamily: 'var(--font-montserrat), Montserrat, sans-serif',
              fontSize: 28, fontWeight: 700, color: '#fff',
              marginTop: 8, textAlign: 'center', letterSpacing: -0.5,
            }}>
              Sports Mockery 2.0 Stands Alone
            </h2>
            <p className="hm-login-reveal hm-login-d3" style={{
              fontSize: 15, color: '#8a8a9a', marginTop: 6, marginBottom: 28,
              textAlign: 'center',
            }}>
              How we compare to the competition.
            </p>

            {/* Comparison Table */}
            <div className="hm-login-table hm-login-reveal hm-login-d4">
              {/* Header */}
              <div className="hm-login-table-header">
                <div className="hm-login-table-cell hm-login-table-feature">Feature</div>
                <div className="hm-login-table-cell hm-login-table-center">Sports Mockery 2.0</div>
                <div className="hm-login-table-cell hm-login-table-center">ESPN / Bleacher</div>
              </div>

              {/* Rows */}
              {features.map((feature, idx) => (
                <div
                  key={feature.name}
                  className="hm-login-table-row hm-login-row-reveal"
                  style={{
                    background: idx % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent',
                    animationDelay: `${0.9 + idx * 0.07}s`,
                  }}
                >
                  <div className="hm-login-table-cell hm-login-table-feature">
                    {feature.name}
                  </div>
                  <div className="hm-login-table-cell hm-login-table-center">
                    {feature.sm === 'coming-soon' ? (
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#8a8a9a' }}>Coming Soon</span>
                    ) : feature.sm ? (
                      <span style={{ color: '#22c55e', fontSize: 20, fontWeight: 700 }}>&#10003;</span>
                    ) : (
                      <span style={{ color: '#ef4444', fontSize: 20, fontWeight: 700 }}>&#10007;</span>
                    )}
                  </div>
                  <div className="hm-login-table-cell hm-login-table-center">
                    {feature.espn ? (
                      <span style={{ color: '#22c55e', fontSize: 20, fontWeight: 700 }}>&#10003;</span>
                    ) : (
                      <span style={{ color: '#ef4444', fontSize: 20, fontWeight: 700 }}>&#10007;</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <p className="hm-login-reveal hm-login-d6" style={{
              fontSize: 18, fontWeight: 600, color: '#fff',
              marginTop: 24, textAlign: 'center',
            }}>
              And More...
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
