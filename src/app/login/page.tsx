import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import LoginShell from '@/components/auth/LoginShell'

export const metadata: Metadata = {
  title: 'Create your account | Sports Mockery',
  description:
    'Create your free Sports Mockery account for personalized Chicago sports news, Scout AI, fan polls, and the daily 6 AM email.',
  robots: { index: false, follow: false },
}

interface LoginPageProps {
  searchParams: Promise<{ next?: string; tab?: 'signup' | 'signin' }>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams
  const redirectTo = params.next || '/admin'
  const defaultTab = params.tab === 'signin' ? 'signin' : 'signup'

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll() {},
      },
    }
  )
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (user) {
    redirect(redirectTo)
  }

  return <LoginShell redirectTo={redirectTo} defaultTab={defaultTab} />
}
