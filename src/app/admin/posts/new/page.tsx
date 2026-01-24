import type { Metadata } from 'next'
import { supabaseAdmin } from '@/lib/supabase-server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import NewPostForm from './NewPostForm'

export const metadata: Metadata = {
  title: 'Sports Mockery | New Post',
}

export default async function AdminNewPostPage() {
  // Get current user
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll() {
          // Read-only for server components
        },
      },
    }
  )
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch categories, authors, and find current user's author ID
  const [categoriesResult, authorsResult] = await Promise.all([
    supabaseAdmin.from('sm_categories').select('id, name').order('name'),
    supabaseAdmin.from('sm_authors').select('id, display_name, email').order('display_name'),
  ])

  const categories = categoriesResult.data || []
  const authors = authorsResult.data || []

  // Find author matching current user's email (case-insensitive)
  const currentUserAuthor = user?.email
    ? authors.find((a: { email?: string }) => a.email?.toLowerCase() === user.email?.toLowerCase())
    : null

  return (
    <NewPostForm
      categories={categories}
      authors={authors}
      currentUserId={currentUserAuthor?.id}
    />
  )
}
