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

  // Comparison features - sm can be true, false, or 'coming-soon'
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
    <div className="flex min-h-screen">
      {/* Left side - Form */}
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-8 sm:px-6 lg:flex-none lg:w-1/2 lg:px-12 xl:px-16 bg-white dark:bg-zinc-900">
        <div className="mx-auto w-full max-w-sm">
          {/* Logo */}
          <div className="mb-6">
            <Link href="/" className="inline-block">
              {/* Light mode logo */}
              <Image
                src="/logos/SM_Full_v2.png"
                alt="Sports Mockery"
                width={200}
                height={45}
                className="dark:hidden"
                priority
              />
              {/* Dark mode logo */}
              <Image
                src="/logos/v2_SM_Whole.png"
                alt="Sports Mockery"
                width={200}
                height={45}
                className="hidden dark:block"
                priority
              />
            </Link>
            <h2 className="mt-5 text-2xl font-bold text-zinc-900 dark:text-white">
              Welcome back
            </h2>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Sign in to access your dashboard and manage content
            </p>
          </div>

          <LoginForm redirectTo={redirectTo} />
        </div>
      </div>

      {/* Right side - Features/Branding */}
      <div className="relative hidden lg:flex flex-1 bg-black">
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-10 overflow-hidden">
          <div className="absolute -left-20 -top-20 h-60 w-60 rounded-full bg-white blur-3xl" />
          <div className="absolute -bottom-20 -right-20 h-60 w-60 rounded-full bg-white blur-3xl" />
        </div>

        {/* Content - centered vertically */}
        <div className="relative flex flex-col items-center justify-center w-full h-full px-6 py-6">
          {/* Logo */}
          <Image
            src="/logos/v2_SM_Whole.png"
            alt="Sports Mockery 2.0"
            width={180}
            height={45}
            priority
          />

          {/* Tagline */}
          <p className="text-white text-base font-semibold mt-3 text-center">
            AI-Powered. Fan-Driven. Chicago-Owned.
          </p>

          {/* Section title */}
          <h3 className="text-xl font-bold text-white mt-2 mb-1 text-center">
            Sports Mockery 2.0 Stands Alone
          </h3>
          <p className="text-white/70 text-xs mb-4 text-center">
            How we compare to the competition.
          </p>

          {/* Comparison Chart */}
          <div className="w-full max-w-2xl bg-white/10 backdrop-blur-sm rounded-lg overflow-hidden border border-white/20">
            {/* Table Header */}
            <div className="grid grid-cols-3 bg-white/10">
              <div className="px-3 py-2 text-white font-bold text-sm">
                Feature
              </div>
              <div className="px-3 py-2 text-white font-bold text-sm text-center">
                Sports Mockery 2.0
              </div>
              <div className="px-3 py-2 text-white font-bold text-sm text-center">
                ESPN / Bleacher
              </div>
            </div>

            {/* Table Body */}
            {features.map((feature, idx) => (
              <div
                key={feature.name}
                className={`grid grid-cols-3 ${idx % 2 === 0 ? 'bg-white/5' : ''}`}
              >
                <div className="px-3 py-1.5 text-white/90 text-sm leading-tight">
                  {feature.name}
                </div>
                <div className="px-3 py-1.5 text-center flex items-center justify-center">
                  {feature.sm === 'coming-soon' ? (
                    <span className="text-sm font-medium" style={{ color: '#ffffff' }}>Coming Soon</span>
                  ) : feature.sm ? (
                    <span className="text-green-400 text-base">✓</span>
                  ) : (
                    <span className="text-red-400 text-base">✗</span>
                  )}
                </div>
                <div className="px-3 py-1.5 text-center flex items-center justify-center">
                  {feature.espn ? (
                    <span className="text-green-400 text-base">✓</span>
                  ) : (
                    <span className="text-red-400 text-base">✗</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* And More text - same style as tagline */}
          <p className="text-white text-base font-semibold mt-5 text-center">
            And More...
          </p>
        </div>
      </div>
    </div>
  )
}
