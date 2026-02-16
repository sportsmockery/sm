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

  return (
    <>
      {/* Spacer for fixed nav */}
      <div style={{ paddingTop: 80 }} />

      <div className="hm-login-layout">
        {/* Left: Login Form */}
        <div className="hm-login-form-side">
          <div className="hm-login-form-wrapper">
            {/* Logo */}
            <Link href="/home" style={{ display: 'inline-block', marginBottom: 12 }}>
              <Image
                src="/logos/v2_header_dark.png"
                alt="Sports Mockery"
                width={180}
                height={45}
                priority
              />
            </Link>

            {/* Heading */}
            <h1 style={{
              fontFamily: 'var(--font-montserrat), Montserrat, sans-serif',
              fontSize: 32, fontWeight: 800, letterSpacing: -1,
              color: '#fff', marginBottom: 8,
            }}>
              Welcome back
            </h1>
            <p style={{
              fontSize: 15, color: '#8a8a9a', lineHeight: 1.5,
              marginBottom: 36,
            }}>
              Sign in to access your dashboard and manage content
            </p>

            <HomeLoginForm redirectTo={redirectTo} />
          </div>
        </div>

        {/* Right: Feature Comparison */}
        <div className="hm-login-feature-side">
          <div className="hm-login-feature-content">
            {/* SM Logo */}
            <Image
              src="/logos/v2_SM_Whole.png"
              alt="Sports Mockery 2.0"
              width={200}
              height={50}
              priority
            />

            {/* Tagline */}
            <p style={{
              fontSize: 17, fontWeight: 600, color: '#fff',
              marginTop: 20, textAlign: 'center',
            }}>
              AI-Powered. Fan-Driven. Chicago-Owned.
            </p>

            <h2 style={{
              fontFamily: 'var(--font-montserrat), Montserrat, sans-serif',
              fontSize: 24, fontWeight: 700, color: '#fff',
              marginTop: 8, textAlign: 'center', letterSpacing: -0.5,
            }}>
              Sports Mockery 2.0 Stands Alone
            </h2>
            <p style={{
              fontSize: 14, color: '#8a8a9a', marginTop: 4, marginBottom: 24,
              textAlign: 'center',
            }}>
              How we compare to the competition.
            </p>

            {/* Comparison Table */}
            <div className="hm-login-table">
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
                  className="hm-login-table-row"
                  style={{ background: idx % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent' }}
                >
                  <div className="hm-login-table-cell hm-login-table-feature">
                    {feature.name}
                  </div>
                  <div className="hm-login-table-cell hm-login-table-center">
                    {feature.sm === 'coming-soon' ? (
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#8a8a9a' }}>Coming Soon</span>
                    ) : feature.sm ? (
                      <span style={{ color: '#22c55e', fontSize: 18 }}>&#10003;</span>
                    ) : (
                      <span style={{ color: '#ef4444', fontSize: 18 }}>&#10007;</span>
                    )}
                  </div>
                  <div className="hm-login-table-cell hm-login-table-center">
                    {feature.espn ? (
                      <span style={{ color: '#22c55e', fontSize: 18 }}>&#10003;</span>
                    ) : (
                      <span style={{ color: '#ef4444', fontSize: 18 }}>&#10007;</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <p style={{
              fontSize: 17, fontWeight: 600, color: '#fff',
              marginTop: 20, textAlign: 'center',
            }}>
              And More...
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
