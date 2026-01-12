import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

/**
 * GET /api/admin/slugs?slug=xxx&exclude=post_id
 * Check if a slug exists and get similar slugs for suggestions
 */
export async function GET(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
    }

    const supabase = supabaseAdmin
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug')
    const excludeId = searchParams.get('exclude') // Exclude current post when editing

    if (!slug) {
      return NextResponse.json({ error: 'Slug parameter required' }, { status: 400 })
    }

    // Check if exact slug exists
    let exactQuery = supabase
      .from('sm_posts')
      .select('id, slug, title')
      .eq('slug', slug)
      .single()

    const { data: exactMatch } = await exactQuery

    // If we're editing a post and the slug belongs to that post, it's available
    const isAvailable = !exactMatch || (excludeId && exactMatch.id === excludeId)

    // Find similar slugs for suggestions
    const { data: similarPosts } = await supabase
      .from('sm_posts')
      .select('slug')
      .ilike('slug', `${slug}%`)
      .limit(10)

    const existingSlugs = similarPosts?.map((p) => p.slug) || []

    // Generate alternative slug suggestions if slug is taken
    const suggestions: string[] = []
    if (!isAvailable) {
      const baseSlug = slug.replace(/-\d+$/, '') // Remove trailing numbers

      // Try numbered variants
      for (let i = 2; i <= 5; i++) {
        const candidate = `${baseSlug}-${i}`
        if (!existingSlugs.includes(candidate)) {
          suggestions.push(candidate)
          if (suggestions.length >= 3) break
        }
      }

      // Try date-based variant
      const dateSlug = `${baseSlug}-${new Date().toISOString().slice(0, 10)}`
      if (!existingSlugs.includes(dateSlug)) {
        suggestions.push(dateSlug)
      }
    }

    return NextResponse.json({
      slug,
      isAvailable,
      existingPost: !isAvailable && exactMatch ? { id: exactMatch.id, title: exactMatch.title } : null,
      suggestions: suggestions.slice(0, 3),
    })
  } catch (error) {
    console.error('Error checking slug:', error)
    return NextResponse.json({ error: 'Failed to check slug' }, { status: 500 })
  }
}
