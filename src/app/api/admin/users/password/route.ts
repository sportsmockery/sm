import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { requireAdmin } from '@/lib/admin-auth'

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const auth = await requireAdmin(request)
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const body = await request.json()
    const { userId, email, password, action } = body

    if (!action || !['set_password', 'send_reset'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    const supabase = supabaseAdmin

    if (action === 'set_password') {
      if (!userId || !password) {
        return NextResponse.json({ error: 'userId and password are required' }, { status: 400 })
      }

      if (typeof password !== 'string' || password.length < 8) {
        return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
      }

      const { error } = await supabase.auth.admin.updateUserById(userId, {
        password: password,
      })

      if (error) {
        console.error('Error setting password:', error)
        return NextResponse.json({ error: 'Failed to update password' }, { status: 400 })
      }

      return NextResponse.json({ success: true, message: 'Password updated successfully' })
    }

    if (action === 'send_reset') {
      if (!email || typeof email !== 'string') {
        return NextResponse.json({ error: 'Valid email is required' }, { status: 400 })
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://sportsmockery.com'}/reset-password`,
      })

      if (error) {
        console.error('Error sending reset email:', error)
        return NextResponse.json({ error: 'Failed to send reset email' }, { status: 400 })
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
