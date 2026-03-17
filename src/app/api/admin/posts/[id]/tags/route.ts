import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

/** GET /api/admin/posts/[id]/tags — fetch tags for a post */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const { data, error } = await supabaseAdmin
    .from('sm_post_tags')
    .select('tag_id, tag:sm_tags(id, name, slug)')
    .eq('post_id', parseInt(id))

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const tags = (data || []).map((row: any) => {
    const tag = Array.isArray(row.tag) ? row.tag[0] : row.tag
    return tag ? { id: tag.id, name: tag.name, slug: tag.slug } : null
  }).filter(Boolean)

  return NextResponse.json({ tags })
}

/** PUT /api/admin/posts/[id]/tags — set tags for a post (replace all) */
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const postId = parseInt(id)
  const { tagNames } = await request.json() as { tagNames: string[] }

  if (!Array.isArray(tagNames)) {
    return NextResponse.json({ error: 'tagNames must be an array' }, { status: 400 })
  }

  try {
    // Ensure all tags exist, create missing ones
    const tagIds: number[] = []
    for (const name of tagNames) {
      const trimmed = name.trim()
      if (!trimmed) continue
      const slug = trimmed.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

      // Try to find existing tag
      const { data: existing } = await supabaseAdmin
        .from('sm_tags')
        .select('id')
        .eq('slug', slug)
        .single()

      if (existing) {
        tagIds.push(existing.id)
      } else {
        // Create new tag
        const { data: created, error: createErr } = await supabaseAdmin
          .from('sm_tags')
          .insert({ name: trimmed, slug })
          .select('id')
          .single()

        if (createErr) throw createErr
        if (created) tagIds.push(created.id)
      }
    }

    // Remove existing post-tag links
    await supabaseAdmin.from('sm_post_tags').delete().eq('post_id', postId)

    // Insert new links
    if (tagIds.length > 0) {
      const rows = tagIds.map(tag_id => ({ post_id: postId, tag_id }))
      const { error: insertErr } = await supabaseAdmin.from('sm_post_tags').insert(rows)
      if (insertErr) throw insertErr
    }

    return NextResponse.json({ success: true, tagCount: tagIds.length })
  } catch (err) {
    console.error('[Admin Tags] Error:', err)
    return NextResponse.json({ error: 'Failed to update tags' }, { status: 500 })
  }
}
