import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { requireAdmin } from '@/lib/admin-auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin authentication
    const auth = await requireAdmin(request)
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const { id } = await params
    const supabase = supabaseAdmin

    const { data: user, error } = await supabase
      .from('sm_users')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Fetch preferences
    const { data: preferences } = await supabase
      .from('sm_user_preferences')
      .select('*')
      .eq('user_id', id)
      .single()

    return NextResponse.json({ user, preferences })
  } catch (error) {
    console.error('GET user error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin authentication
    const auth = await requireAdmin(request)
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const { id } = await params
    const body = await request.json()
    const supabase = supabaseAdmin

    const allowedFields = ['name', 'role', 'is_fan_council_member', 'reputation_score', 'bio', 'avatar_url']
    const updates: Record<string, unknown> = {}
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates[field] = body[field]
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('sm_users')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('PATCH user error:', error)
      return NextResponse.json({ error: 'Failed to update user' }, { status: 400 })
    }

    return NextResponse.json({ user: data })
  } catch (error) {
    console.error('PATCH user error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin authentication
    const auth = await requireAdmin(request)
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const { id } = await params
    const supabase = supabaseAdmin

    // Delete from sm_users
    const { error: dbError } = await supabase
      .from('sm_users')
      .delete()
      .eq('id', id)

    if (dbError) {
      console.error('DELETE user db error:', dbError)
      return NextResponse.json({ error: 'Failed to delete user' }, { status: 400 })
    }

    // Try to delete from Supabase Auth too
    try {
      await supabase.auth.admin.deleteUser(id)
    } catch (authError) {
      console.error('Auth delete failed (non-critical):', authError)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE user error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
