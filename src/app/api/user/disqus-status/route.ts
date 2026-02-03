import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const cookieStore = await cookies()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => {
                cookieStore.set(name, value, options)
              })
            } catch {
              // Server component, ignore
            }
          },
        },
      }
    )

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ isConnected: false }, { status: 200 })
    }

    // Check for Disqus connection in user_disqus_connections table
    const { data: connection, error: dbError } = await supabase
      .from('user_disqus_connections')
      .select('disqus_user_id, disqus_username, connected_at')
      .eq('user_id', user.id)
      .maybeSingle()

    if (dbError) {
      console.error('Error fetching Disqus connection:', dbError)
      return NextResponse.json({ isConnected: false }, { status: 200 })
    }

    if (!connection) {
      return NextResponse.json({ isConnected: false }, { status: 200 })
    }

    return NextResponse.json({
      isConnected: true,
      username: connection.disqus_username,
      disqusUserId: connection.disqus_user_id,
      connectedAt: connection.connected_at,
    })
  } catch (error) {
    console.error('Error checking Disqus status:', error)
    return NextResponse.json({ isConnected: false }, { status: 200 })
  }
}
