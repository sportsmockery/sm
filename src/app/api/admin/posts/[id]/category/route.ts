import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

/** PUT /api/admin/posts/[id]/category — update category */
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { categoryId } = await request.json() as { categoryId: number | null }

  const { error } = await supabaseAdmin
    .from('sm_posts')
    .update({ category_id: categoryId, updated_at: new Date().toISOString() })
    .eq('id', parseInt(id))

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
