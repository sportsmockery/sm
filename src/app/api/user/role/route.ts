import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const email = searchParams.get('email')

  if (!email) {
    return NextResponse.json({ error: 'Email required' }, { status: 400 })
  }

  try {
    // Check sm_users table first (primary user table)
    const { data: user } = await supabaseAdmin
      .from('sm_users')
      .select('role, email')
      .ilike('email', email)
      .single()

    if (user?.role) {
      console.log(`[User Role] Found role '${user.role}' in sm_users for: ${email}`)
      return NextResponse.json({ role: user.role })
    }

    // Fall back to sm_authors table
    const { data: author } = await supabaseAdmin
      .from('sm_authors')
      .select('role, email')
      .ilike('email', email)
      .single()

    if (author?.role) {
      console.log(`[User Role] Found role '${author.role}' in sm_authors for: ${email}`)
      return NextResponse.json({ role: author.role })
    }

    console.log(`[User Role] No role found for email: ${email}`)
    return NextResponse.json({ role: null })
  } catch (err) {
    console.error('[User Role] Error:', err)
    return NextResponse.json({ role: null })
  }
}
