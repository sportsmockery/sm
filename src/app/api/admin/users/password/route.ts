import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Create admin client with service role key
function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(url, key)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, email, password, action } = body

    const supabase = getSupabaseAdmin()

    if (action === 'set_password' && password) {
      // Directly set a new password (admin override)
      const { data, error } = await supabase.auth.admin.updateUserById(userId, {
        password: password,
      })

      if (error) {
        console.error('Error setting password:', error)
        return NextResponse.json({ error: error.message }, { status: 400 })
      }

      return NextResponse.json({ success: true, message: 'Password updated successfully' })
    }

    if (action === 'send_reset') {
      // Send password reset email
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://sportsmockery.com'}/reset-password`,
      })

      if (error) {
        console.error('Error sending reset email:', error)
        return NextResponse.json({ error: error.message }, { status: 400 })
      }

      return NextResponse.json({ success: true, message: 'Password reset email sent' })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Password API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
