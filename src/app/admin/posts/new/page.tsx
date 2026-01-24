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

  // Fetch categories and authors
  const [categoriesResult, authorsResult] = await Promise.all([
    supabaseAdmin.from('sm_categories').select('id, name').order('name'),
    supabaseAdmin.from('sm_authors').select('id, display_name, email').order('display_name'),
  ])

  const categories = categoriesResult.data || []
  let authors = authorsResult.data || []

  // Find author matching current user's email (case-insensitive)
  let currentUserAuthor = user?.email
    ? authors.find((a: { email?: string }) => a.email?.toLowerCase() === user.email?.toLowerCase())
    : null

  // If user is logged in but has no author entry, create one
  if (user?.email && !currentUserAuthor) {
    // Get user's display name from metadata or email
    const displayName = user.user_metadata?.full_name ||
                        user.user_metadata?.name ||
                        user.email.split('@')[0]

    const { data: newAuthor, error } = await supabaseAdmin
      .from('sm_authors')
      .insert({
        email: user.email,
        display_name: displayName,
      })
      .select()
      .single()

    if (!error && newAuthor) {
      currentUserAuthor = newAuthor
      authors = [...authors, newAuthor].sort((a, b) =>
        a.display_name.localeCompare(b.display_name)
      )
    }
  }

  return (
    <NewPostForm
      categories={categories}
      authors={authors}
      currentUserId={currentUserAuthor?.id}
    />
  )
}
