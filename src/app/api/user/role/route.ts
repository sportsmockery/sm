import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { getAuthUser } from '@/lib/admin-auth'

export async function GET(request: NextRequest) {
  // Require authentication — users can only look up their own role
  const authUser = await getAuthUser(request)
  if (!authUser) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }

  const email = authUser.email
  if (!email) {
    return NextResponse.json({ role: null })
  }

  try {
    // Check sm_users table first (primary user table)
    const { data: user } = await supabaseAdmin
      .from('sm_users')
      .select('role')
      .eq('id', authUser.id)
      .single()

    if (user?.role) {
      return NextResponse.json({ role: user.role })
    }

    // Fall back to sm_authors table
    const { data: author } = await supabaseAdmin
      .from('sm_authors')
      .select('role')
      .ilike('email', email)
      .single()

    if (author?.role) {
      return NextResponse.json({ role: author.role })
    }

    return NextResponse.json({ role: null })
  } catch (err) {
    console.error('[User Role] Error:', err)
    return NextResponse.json({ role: null })
  }
}
