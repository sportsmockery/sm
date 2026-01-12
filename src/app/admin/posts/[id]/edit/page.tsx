import { supabaseAdmin } from '@/lib/supabase-server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import PostEditForm from './PostEditForm'

interface PostEditPageProps {
  params: Promise<{ id: string }>
}

export default async function AdminPostEditPage({ params }: PostEditPageProps) {
  const { id } = await params

  const [postResult, categoriesResult, authorsResult] = await Promise.all([
    supabaseAdmin.from('sm_posts').select('*').eq('id', id).single(),
    supabaseAdmin.from('sm_categories').select('id, name').order('name'),
    supabaseAdmin.from('sm_authors').select('id, display_name').order('display_name'),
  ])

  if (postResult.error || !postResult.data) {
    notFound()
  }

  const post = postResult.data
  const categories = categoriesResult.data || []
  const authors = authorsResult.data || []

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <Link
          href={`/admin/posts/${id}`}
          className="text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Edit Post</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{post.title}</p>
        </div>
      </div>

      <PostEditForm post={post} categories={categories} authors={authors} />
    </div>
  )
}
