import { supabaseAdmin } from '@/lib/supabase-server'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'

interface PostDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function AdminPostDetailPage({ params }: PostDetailPageProps) {
  const { id } = await params

  const { data: post, error } = await supabaseAdmin
    .from('sm_posts')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !post) {
    notFound()
  }

  // Fetch category and author
  const [categoryResult, authorResult] = await Promise.all([
    post.category_id
      ? supabaseAdmin.from('sm_categories').select('name, slug').eq('id', post.category_id).single()
      : Promise.resolve({ data: null }),
    post.author_id
      ? supabaseAdmin.from('sm_authors').select('display_name').eq('id', post.author_id).single()
      : Promise.resolve({ data: null }),
  ])

  const category = categoryResult.data
  const author = authorResult.data

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/posts"
            className="text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{post.title}</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">/{post.slug}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {post.status === 'published' && category && (
            <Link
              href={`/${category.slug}/${post.slug}`}
              target="_blank"
              className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              View Live
            </Link>
          )}
          <Link
            href={`/admin/posts/${id}/edit`}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Edit Post
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {post.featured_image && (
            <div className="relative mb-6 aspect-video overflow-hidden rounded-lg">
              <Image
                src={post.featured_image}
                alt={post.title}
                fill
                className="object-cover"
              />
            </div>
          )}

          {post.excerpt && (
            <div className="mb-6 rounded-lg bg-zinc-100 p-4 dark:bg-zinc-800">
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Excerpt</p>
              <p className="mt-1 text-zinc-700 dark:text-zinc-300">{post.excerpt}</p>
            </div>
          )}

          <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="mb-4 font-semibold text-zinc-900 dark:text-zinc-100">Content</h2>
            <div
              className="prose prose-sm max-w-none dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: post.content || '<p>No content</p>' }}
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Card */}
          <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="mb-4 font-semibold text-zinc-900 dark:text-zinc-100">Status</h2>
            <span
              className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${
                post.status === 'published'
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300'
              }`}
            >
              {post.status}
            </span>
          </div>

          {/* Meta Card */}
          <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="mb-4 font-semibold text-zinc-900 dark:text-zinc-100">Details</h2>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-zinc-500 dark:text-zinc-400">Category</dt>
                <dd className="font-medium text-zinc-900 dark:text-zinc-100">
                  {category?.name || 'None'}
                </dd>
              </div>
              <div>
                <dt className="text-zinc-500 dark:text-zinc-400">Author</dt>
                <dd className="font-medium text-zinc-900 dark:text-zinc-100">
                  {author?.display_name || 'None'}
                </dd>
              </div>
              <div>
                <dt className="text-zinc-500 dark:text-zinc-400">Created</dt>
                <dd className="font-medium text-zinc-900 dark:text-zinc-100">
                  {format(new Date(post.created_at), 'MMM d, yyyy h:mm a')}
                </dd>
              </div>
              {post.published_at && (
                <div>
                  <dt className="text-zinc-500 dark:text-zinc-400">Published</dt>
                  <dd className="font-medium text-zinc-900 dark:text-zinc-100">
                    {format(new Date(post.published_at), 'MMM d, yyyy h:mm a')}
                  </dd>
                </div>
              )}
              {post.updated_at && (
                <div>
                  <dt className="text-zinc-500 dark:text-zinc-400">Last Updated</dt>
                  <dd className="font-medium text-zinc-900 dark:text-zinc-100">
                    {format(new Date(post.updated_at), 'MMM d, yyyy h:mm a')}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {/* SEO Card */}
          <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="mb-4 font-semibold text-zinc-900 dark:text-zinc-100">SEO</h2>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-zinc-500 dark:text-zinc-400">SEO Title</dt>
                <dd className="font-medium text-zinc-900 dark:text-zinc-100">
                  {post.seo_title || post.title}
                </dd>
              </div>
              <div>
                <dt className="text-zinc-500 dark:text-zinc-400">Meta Description</dt>
                <dd className="text-zinc-700 dark:text-zinc-300">
                  {post.seo_description || post.excerpt || 'None'}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  )
}
