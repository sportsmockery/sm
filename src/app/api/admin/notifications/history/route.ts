import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

/**
 * GET /api/admin/notifications/history
 * Get recent notification history
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')

    const { data: notifications, error } = await supabaseAdmin
      .from('sm_notification_history')
      .select('*')
      .order('sent_at', { ascending: false })
      .limit(limit)

    if (error) {
      // If table doesn't exist yet, return empty array
      if (error.code === '42P01') {
        return NextResponse.json({ notifications: [] })
      }
      console.error('Error fetching notification history:', error)
      return NextResponse.json(
        { error: 'Failed to fetch notification history' },
        { status: 500 }
      )
    }

    return NextResponse.json({ notifications: notifications || [] })
  } catch (error) {
    console.error('Error fetching notification history:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
