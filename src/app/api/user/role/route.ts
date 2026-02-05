import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const email = searchParams.get('email')

  if (!email) {
    return NextResponse.json({ error: 'Email required' }, { status: 400 })
  }

  try {
    // Use ilike for case-insensitive email matching
    const { data: author, error } = await supabaseAdmin
      .from('sm_authors')
      .select('role, email')
      .ilike('email', email)
      .single()

    if (error || !author) {
      console.log(`[User Role] No author found for email: ${email}`)
      return NextResponse.json({ role: null })
    }

    console.log(`[User Role] Found role '${author.role}' for email: ${email}`)
    return NextResponse.json({ role: author.role })
  } catch (err) {
    console.error('[User Role] Error:', err)
    return NextResponse.json({ role: null })
  }
}
