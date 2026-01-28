import { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
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
  return (
    <div className="flex min-h-screen">
      {/* Left side - Form */}
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          {/* Logo */}
          <div className="mb-8">
            <Link href="/" className="inline-block">
              <span className="font-heading text-2xl font-black tracking-tight text-zinc-900 dark:text-white">
                SPORTS
                <span className="bg-gradient-to-r from-[#FF0000] to-[#8B0000] bg-clip-text text-transparent">
                  MOCKERY
                </span>
              </span>
            </Link>
            <h2 className="mt-6 text-2xl font-bold text-zinc-900 dark:text-white">
              Welcome back
            </h2>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Sign in to access your dashboard and manage content
            </p>
          </div>

          <LoginForm redirectTo={redirectTo} />
        </div>
      </div>

      {/* Right side - Image/Branding */}
      <div className="relative hidden w-0 flex-1 lg:block">
        <div className="absolute inset-0 bg-gradient-to-br from-[#8B0000] via-red-600 to-[#8B0000]">
          {/* Decorative elements */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -left-20 -top-20 h-60 w-60 rounded-full bg-white blur-3xl" />
            <div className="absolute -bottom-20 -right-20 h-60 w-60 rounded-full bg-white blur-3xl" />
          </div>

          {/* Content */}
          <div className="relative flex h-full flex-col justify-center px-12">
            <blockquote className="text-white">
              <p className="text-3xl font-bold leading-tight">
                &ldquo;The best place for Chicago sports hot takes and insider coverage.&rdquo;
              </p>
              <footer className="mt-6">
                <p className="text-lg font-semibold text-white/90">Sports Mockery</p>
                <p className="text-white/70">Chicago&apos;s Premier Sports Commentary</p>
              </footer>
            </blockquote>

            {/* Stats */}
            <div className="mt-12 grid grid-cols-3 gap-8">
              <div>
                <p className="text-3xl font-bold text-white">50K+</p>
                <p className="text-sm text-white/70">Daily Readers</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-white">5</p>
                <p className="text-sm text-white/70">Chicago Teams</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-white">24/7</p>
                <p className="text-sm text-white/70">Coverage</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
