import type { Metadata } from 'next'
import { supabaseAdmin } from '@/lib/supabase-server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

interface TagPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: TagPageProps): Promise<Metadata> {
  const { slug } = await params
  const { data: tag } = await supabaseAdmin
    .from('sm_tags')
    .select('name')
    .eq('slug', slug)
    .single()

  if (!tag) return { title: 'Tag Not Found' }

  return {
    title: `${tag.name} | SportsMockery`,
    description: `Articles tagged with ${tag.name} on SportsMockery`,
  }
}

export default async function TagPage({ params }: TagPageProps) {
  const { slug } = await params

  // Fetch the tag
  const { data: tag } = await supabaseAdmin
    .from('sm_tags')
    .select('id, name, slug')
    .eq('slug', slug)
    .single()

  if (!tag) notFound()

  // Fetch posts with this tag via junction table
  const { data: postTags } = await supabaseAdmin
    .from('sm_post_tags')
    .select('post_id')
    .eq('tag_id', tag.id)

  const postIds = (postTags || []).map(pt => pt.post_id)

  let posts: Array<{
    id: number
    title: string
    slug: string
    excerpt: string | null
    featured_image: string | null
    published_at: string | null
    category: { slug: string; name: string } | null
    author: { display_name: string } | null
  }> = []

  if (postIds.length > 0) {
    const { data } = await supabaseAdmin
      .from('sm_posts')
      .select(`
        id, title, slug, excerpt, featured_image, published_at,
        category:sm_categories(slug, name),
        author:sm_authors(display_name)
      `)
      .in('id', postIds)
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(50)

    posts = (data || []).map((p: Record<string, unknown>) => ({
      id: p.id as number,
      title: p.title as string,
      slug: p.slug as string,
      excerpt: p.excerpt as string | null,
      featured_image: p.featured_image as string | null,
      published_at: p.published_at as string | null,
      category: p.category as { slug: string; name: string } | null,
      author: p.author as { display_name: string } | null,
    }))
  }

  // Fetch related tags (tags that appear on the same posts)
  let relatedTags: Array<{ id: number; name: string; slug: string; count: number }> = []
  if (postIds.length > 0) {
    const { data: relatedPostTags } = await supabaseAdmin
      .from('sm_post_tags')
      .select('tag_id, tag:sm_tags(id, name, slug)')
      .in('post_id', postIds)
      .neq('tag_id', tag.id)

    // Count occurrences and dedupe
    const tagCounts = new Map<number, { id: number; name: string; slug: string; count: number }>()
    for (const row of relatedPostTags || []) {
      const t = Array.isArray(row.tag) ? row.tag[0] : row.tag
      if (!t) continue
      const existing = tagCounts.get(t.id)
      if (existing) {
        existing.count++
      } else {
        tagCounts.set(t.id, { ...t, count: 1 })
      }
    }
    relatedTags = Array.from(tagCounts.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 12)
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <div className="mx-auto max-w-[1300px] px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--accent-red)]/10">
              <svg className="h-5 w-5 text-[var(--accent-red)]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">{tag.name}</h1>
          </div>
          <p className="text-[var(--text-muted)]">
            {posts.length} {posts.length === 1 ? 'article' : 'articles'} tagged with &quot;{tag.name}&quot;
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
          {/* Articles Grid */}
          <div>
            {posts.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2">
                {posts.map((post) => {
                  const categorySlug = post.category?.slug
                  const postUrl = categorySlug ? `/${categorySlug}/${post.slug}` : `/${post.slug}`

                  return (
                    <Link
                      key={post.id}
                      href={postUrl}
                      className="group overflow-hidden rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] transition-all hover:shadow-lg hover:scale-[1.01]"
                    >
                      {post.featured_image && (
                        <div className="relative aspect-video overflow-hidden">
                          <Image
                            src={post.featured_image}
                            alt={post.title}
                            fill
                            className="object-cover transition-transform group-hover:scale-105"
                          />
                        </div>
                      )}
                      <div className="p-5">
                        {post.category && (
                          <span className="mb-2 inline-block text-xs font-medium uppercase tracking-wider text-[var(--accent-red)]">
                            {post.category.name}
                          </span>
                        )}
                        <h2 className="text-lg font-medium text-[var(--text-primary)] group-hover:text-[var(--accent-red)] transition-colors line-clamp-2">
                          {post.title}
                        </h2>
                        {post.excerpt && (
                          <p className="mt-2 text-sm text-[var(--text-muted)] line-clamp-2">
                            {post.excerpt}
                          </p>
                        )}
                        <div className="mt-3 flex items-center gap-3 text-xs text-[var(--text-muted)]">
                          {post.author && <span>{post.author.display_name}</span>}
                          {post.published_at && (
                            <time dateTime={post.published_at}>
                              {new Date(post.published_at).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </time>
                          )}
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            ) : (
              <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] px-6 py-16 text-center">
                <svg className="mx-auto h-12 w-12 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
                </svg>
                <p className="mt-4 text-[var(--text-muted)]">No articles with this tag yet.</p>
              </div>
            )}
          </div>

          {/* Sidebar - Related Tags */}
          {relatedTags.length > 0 && (
            <aside>
              <div className="sticky top-24 rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] p-5">
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                  Related Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {relatedTags.map((rt) => (
                    <Link
                      key={rt.id}
                      href={`/tag/${rt.slug}`}
                      className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-default)] px-3 py-1.5 text-sm text-[var(--text-secondary)] transition-colors hover:border-[var(--accent-red)] hover:text-[var(--accent-red)]"
                    >
                      {rt.name}
                      <span className="text-xs text-[var(--text-muted)]">{rt.count}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </aside>
          )}
        </div>
      </div>
    </div>
  )
}
