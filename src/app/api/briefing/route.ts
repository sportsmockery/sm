import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'
export const revalidate = 300 // 5 min cache

export async function GET(req: NextRequest) {
  try {
    const limit = Math.min(
      parseInt(req.nextUrl.searchParams.get('limit') || '3', 10),
      5
    )

    // Fetch top posts by importance_score (same source as homepage editor picks)
    const { data, error } = await supabaseAdmin
      .from('sm_posts')
      .select('id, title, slug, excerpt, category:sm_categories!category_id(slug)')
      .eq('status', 'published')
      .order('importance_score', { ascending: false })
      .limit(limit)

    if (error) {
      return NextResponse.json({ briefings: [] }, { status: 200 })
    }

    const briefings = (data || []).map((post: any) => {
      const cat = Array.isArray(post.category) ? post.category[0] : post.category
      const summary = post.excerpt
        ? post.excerpt.split(/\s+/).slice(0, 100).join(' ')
        : ''
      return {
        id: post.id,
        title: post.title,
        summary,
        slug: post.slug,
        category_slug: cat?.slug || null,
      }
    })

    return NextResponse.json({ briefings })
  } catch {
    return NextResponse.json({ briefings: [] }, { status: 200 })
  }
}
