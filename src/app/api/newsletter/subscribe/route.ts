import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { supabaseAdmin } from '@/lib/supabase-server'
import { checkRateLimitRedis, getClientIp } from '@/lib/rate-limit'

const resend = new Resend(process.env.RESEND_API_KEY)
const AUDIENCE_NAME = 'Edge Daily Newsletter'

/** Get or create the Resend audience for the daily newsletter. */
async function getOrCreateAudience(): Promise<string | null> {
  try {
    const { data: audiences, error: listErr } = await resend.audiences.list()
    if (listErr) throw listErr

    const existing = audiences?.data?.find(
      (a: { name: string }) => a.name === AUDIENCE_NAME
    )
    if (existing) return existing.id

    const { data: created, error: createErr } = await resend.audiences.create({
      name: AUDIENCE_NAME,
    })
    if (createErr) throw createErr
    return created!.id
  } catch (err) {
    console.error('[newsletter] Failed to get/create Resend audience:', err)
    return null
  }
}

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

    // 1. Upsert into sm_newsletter_subscribers
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

    // 2. Add to email_subscribers (chicago_daily list) for the 6 AM cron
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

    // 3. Sync to Resend audience (best-effort — don't fail if Resend is down)
    const audienceId = await getOrCreateAudience()
    if (audienceId) {
      const { error: contactErr } = await resend.contacts.create({
        email: normalizedEmail,
        audienceId,
      })
      if (contactErr && !contactErr.message?.includes('already exists')) {
        console.error('[newsletter] Resend contact create error:', contactErr.message)
      }
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
