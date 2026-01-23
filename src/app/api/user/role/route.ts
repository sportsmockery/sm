import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const email = searchParams.get('email')

  if (!email) {
    return NextResponse.json({ error: 'Email required' }, { status: 400 })
  }

  try {
    const { data: author, error } = await supabaseAdmin
      .from('sm_authors')
      .select('role')
      .eq('email', email)
      .single()

    if (error || !author) {
      return NextResponse.json({ role: null })
    }

    return NextResponse.json({ role: author.role })
  } catch (err) {
    return NextResponse.json({ role: null })
  }
}
