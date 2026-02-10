import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// This endpoint receives notifications from DataLab when new viral predictions are ready
// POST from DataLab: { "count": 5, "message": "New viral drafts ready in Twitter_viral_predictions" }

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { count, message } = body

    console.log(`[Twitter Auto Posts] New notification: ${message} (${count} items)`)

    // You could add additional notification logic here:
    // - Send email to admin
    // - Push notification
    // - Slack webhook
    // - Store in notification log table

    return NextResponse.json({
      success: true,
      received: { count, message },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[Twitter Auto Posts] Notification error:', error)
    return NextResponse.json(
      { error: 'Failed to process notification' },
      { status: 500 }
    )
  }
}

// Allow GET for health checks
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    endpoint: '/api/admin/notify',
    purpose: 'Receives notifications from DataLab cron when new viral predictions are ready',
  })
}
