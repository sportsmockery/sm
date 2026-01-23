import type { Metadata } from 'next'
import { supabaseAdmin } from '@/lib/supabase-server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import StudioPostEditor from './StudioPostEditor'

export const metadata: Metadata = {
  title: 'Sports Mockery | New Post',
}

export default async function StudioNewPostPage() {
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
  const { data: { user } } = await supabase.auth.getUser()

  const [categoriesResult, authorsResult] = await Promise.all([
    supabaseAdmin.from('sm_categories').select('id, name').order('name'),
    supabaseAdmin.from('sm_authors').select('id, display_name, email').order('display_name'),
  ])

  const categories = categoriesResult.data || []
  const authors = authorsResult.data || []

  const currentUserAuthor = user?.email
    ? authors.find((a: { email?: string }) => a.email === user.email)
    : null

  return (
    <StudioPostEditor
      categories={categories}
      authors={authors}
      currentUserId={currentUserAuthor?.id}
    />
  )
}
