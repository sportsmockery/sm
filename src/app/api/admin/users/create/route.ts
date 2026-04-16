import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { requireAdmin } from '@/lib/admin-auth'

export async function POST(request: NextRequest) {
  try {
    // Require admin authentication
    const auth = await requireAdmin(request)
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const body = await request.json()
    const { email, password, name, role = 'fan' } = body

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
    }

    // Check if user already exists in Auth
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers()
    const existingAuthUser = existingUsers?.users.find(u => u.email?.toLowerCase() === email.toLowerCase())

    if (existingAuthUser) {
      return NextResponse.json({ error: 'A user with this email already exists' }, { status: 400 })
    }

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        name: name || email.split('@')[0],
        role
      }
    })

    if (authError) {
      console.error('Error creating auth user:', authError)
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    // Create user in sm_users table
    const { error: dbError } = await supabaseAdmin
      .from('sm_users')
      .insert({
        id: authData.user.id,
        email,
        name: name || email.split('@')[0],
        role,
        created_at: new Date().toISOString()
      })

    if (dbError) {
      console.error('Error creating db user:', dbError)
      // User was created in Auth but not DB - try to clean up
      // Don't fail the request, just log it
      console.warn('User created in Auth but failed to add to sm_users:', dbError.message)
    }

    return NextResponse.json({
      success: true,
      message: 'User created successfully',
      user: {
        id: authData.user.id,
        email: authData.user.email,
        role
      }
    })
  } catch (error) {
    console.error('Create user error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
