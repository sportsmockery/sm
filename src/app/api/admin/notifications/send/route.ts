import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

const ONESIGNAL_APP_ID = process.env.ONESIGNAL_APP_ID
const ONESIGNAL_REST_API_KEY = process.env.ONESIGNAL_REST_API_KEY

/**
 * POST /api/admin/notifications/send
 * Send a push notification via OneSignal
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.title || !body.body) {
      return NextResponse.json(
        { error: 'Title and body are required' },
        { status: 400 }
      )
    }

    // Check OneSignal configuration
    if (!ONESIGNAL_APP_ID || !ONESIGNAL_REST_API_KEY) {
      console.error('OneSignal not configured:', {
        hasAppId: !!ONESIGNAL_APP_ID,
        hasApiKey: !!ONESIGNAL_REST_API_KEY,
      })
      return NextResponse.json(
        { error: 'Push notifications are not configured. Please add ONESIGNAL_APP_ID and ONESIGNAL_REST_API_KEY to environment variables.' },
        { status: 500 }
      )
    }

    // Build notification payload
    const notificationPayload: Record<string, unknown> = {
      app_id: ONESIGNAL_APP_ID,
      included_segments: ['All'], // Send to all users
      headings: { en: body.title },
      contents: { en: body.body },
    }

    // Add data for deep linking if article is selected
    if (body.articleId) {
      notificationPayload.data = {
        type: 'article',
        articleId: body.articleId,
        articleSlug: body.articleSlug || null,
        categorySlug: body.categorySlug || null,
      }

      // iOS-specific URL for deep linking
      notificationPayload.ios_url = `sportsmockery://article/${body.articleSlug}`
      // Android deep link
      notificationPayload.url = `sportsmockery://article/${body.articleSlug}`
    }

    // Add iOS-specific settings
    notificationPayload.ios_sound = 'default'
    notificationPayload.ios_badgeType = 'Increase'
    notificationPayload.ios_badgeCount = 1

    // Add Android-specific settings
    notificationPayload.android_channel_id = 'default'
    notificationPayload.small_icon = 'ic_notification'
    notificationPayload.android_accent_color = 'FFBC0000'

    // Send to OneSignal
    const onesignalResponse = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${ONESIGNAL_REST_API_KEY}`,
      },
      body: JSON.stringify(notificationPayload),
    })

    const onesignalData = await onesignalResponse.json()

    if (!onesignalResponse.ok) {
      console.error('OneSignal error:', onesignalData)
      return NextResponse.json(
        { error: onesignalData.errors?.[0] || 'Failed to send notification' },
        { status: 500 }
      )
    }

    // Get article title if linked
    let articleTitle = null
    if (body.articleId) {
      const { data: article } = await supabaseAdmin
        .from('sm_posts')
        .select('title')
        .eq('id', body.articleId)
        .single()
      articleTitle = article?.title
    }

    // Save to notification history
    const { error: historyError } = await supabaseAdmin
      .from('sm_notification_history')
      .insert({
        title: body.title,
        body: body.body,
        article_id: body.articleId || null,
        article_title: articleTitle,
        onesignal_id: onesignalData.id,
        recipient_count: onesignalData.recipients || null,
        sent_by: 'admin', // TODO: Get actual user from session
      })

    if (historyError) {
      console.error('Error saving notification history:', historyError)
      // Don't fail the request, notification was still sent
    }

    return NextResponse.json({
      success: true,
      notificationId: onesignalData.id,
      recipients: onesignalData.recipients,
    })
  } catch (error) {
    console.error('Error sending notification:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
