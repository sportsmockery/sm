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
    const supabase = getSupabaseAdmin()

    // Get all users from Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.listUsers()

    if (authError) {
      console.error('Error listing auth users:', authError)
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    const authUsers = authData.users

    // Get existing users from sm_users
    const { data: existingUsers, error: existingError } = await supabase
      .from('sm_users')
      .select('id, email')

    if (existingError) {
      console.error('Error fetching existing users:', existingError)
      return NextResponse.json({ error: existingError.message }, { status: 400 })
    }

    const existingEmails = new Set(existingUsers?.map(u => u.email.toLowerCase()) || [])
    const existingIds = new Set(existingUsers?.map(u => u.id) || [])

    // Find users that need to be synced
    const usersToSync = authUsers.filter(
      user => !existingEmails.has(user.email?.toLowerCase() || '') && !existingIds.has(user.id)
    )

    if (usersToSync.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'All users are already synced',
        synced: 0,
        total: authUsers.length
      })
    }

    // Insert new users
    const newUsers = usersToSync.map(user => ({
      id: user.id,
      email: user.email || '',
      name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
      role: user.user_metadata?.role || 'fan',
      avatar_url: user.user_metadata?.avatar_url || null,
      created_at: user.created_at,
      last_sign_in_at: user.last_sign_in_at,
    }))

    const { error: insertError } = await supabase
      .from('sm_users')
      .insert(newUsers)

    if (insertError) {
      console.error('Error inserting users:', insertError)
      return NextResponse.json({ error: insertError.message }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: `Synced ${usersToSync.length} new user(s)`,
      synced: usersToSync.length,
      total: authUsers.length
    })
  } catch (error) {
    console.error('Sync users error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET to check sync status
export async function GET() {
  try {
    const supabase = getSupabaseAdmin()

    const [authResult, dbResult] = await Promise.all([
      supabase.auth.admin.listUsers(),
      supabase.from('sm_users').select('id', { count: 'exact' })
    ])

    return NextResponse.json({
      authUsers: authResult.data?.users.length || 0,
      dbUsers: dbResult.count || 0,
      needsSync: (authResult.data?.users.length || 0) > (dbResult.count || 0)
    })
  } catch (error) {
    console.error('Check sync error:', error)
    return NextResponse.json({ error: 'Failed to check sync status' }, { status: 500 })
  }
}
