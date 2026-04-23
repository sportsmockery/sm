import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { checkRateLimitRedis, getClientIp } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  try {
    // Rate limit: 5 subscribe attempts per minute per IP
    const rl = await checkRateLimitRedis({
      prefix: 'newsletter-sub',
      key: getClientIp(request),
      maxRequests: 5,
      windowSeconds: 60,
    })
    if (!rl.success) {
      return NextResponse.json(
        { error: 'Too many subscribe attempts. Please try again later.' },
        { status: 429 }
      )
    }

    const { email } = await request.json()

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { error: 'A valid email address is required' },
        { status: 400 }
      )
    }

    const normalizedEmail = email.trim().toLowerCase()

    // Upsert into sm_newsletter_subscribers to avoid duplicates
    const { error } = await supabaseAdmin
      .from('sm_newsletter_subscribers')
      .upsert(
        { email: normalizedEmail, subscribed_at: new Date().toISOString() },
        { onConflict: 'email' }
      )

    if (error) {
      console.error('[newsletter] Subscribe error:', error.message)
      return NextResponse.json(
        { error: 'Failed to subscribe' },
        { status: 500 }
      )
    }

    // Also add to email_subscribers (chicago_daily list) for the 6 AM cron
    const { error: cronListErr } = await supabaseAdmin
      .from('email_subscribers')
      .insert({
        email: normalizedEmail,
        list: 'chicago_daily',
        subscribed: true,
        source: 'newsletter_widget',
      })

    if (cronListErr && !cronListErr.message?.includes('duplicate')) {
      console.error('[newsletter] email_subscribers error:', cronListErr.message)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[newsletter] Unhandled error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
