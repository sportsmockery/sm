import { Metadata } from 'next'
import Link from 'next/link'
import SignupForm from '@/components/auth/SignupForm'

export const metadata: Metadata = {
  title: 'Sign Up | Sports Mockery',
  description: 'Create your Sports Mockery account',
}

export default function SignupPage() {
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
              Create your account
            </h2>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Join the Sports Mockery community
            </p>
          </div>

          <SignupForm />
        </div>
      </div>

      {/* Right side - Image/Branding */}
      <div className="relative hidden w-0 flex-1 lg:block">
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900">
          {/* Decorative elements */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute -left-20 -top-20 h-60 w-60 rounded-full bg-[#8B0000] blur-3xl" />
            <div className="absolute -bottom-20 -right-20 h-60 w-60 rounded-full bg-[#8B0000] blur-3xl" />
          </div>

          {/* Content */}
          <div className="relative flex h-full flex-col justify-center px-12">
            <h3 className="text-3xl font-bold text-white">
              Join thousands of Chicago sports fans
            </h3>
            <p className="mt-4 text-lg text-zinc-400">
              Get access to exclusive content, hot takes, and insider analysis on all your favorite Chicago teams.
            </p>

            {/* Features */}
            <div className="mt-12 space-y-6">
              {[
                { icon: '🏈', text: 'Bears, Bulls, Cubs, Sox & Hawks coverage' },
                { icon: '🔥', text: 'Breaking news and hot takes' },
                { icon: '🤖', text: 'AI-powered predictions' },
                { icon: '📊', text: 'Stats and analysis' },
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-4">
                  <span className="text-2xl">{feature.icon}</span>
                  <span className="text-white">{feature.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
