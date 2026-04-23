import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { supabaseAdmin } from '@/lib/supabase-server'

const resend = new Resend(process.env.RESEND_API_KEY)

const AUDIENCE_NAME = 'Edge Daily Newsletter'

async function getOrCreateAudience(): Promise<string> {
  // List existing audiences
  const { data: audiences, error: listErr } = await resend.audiences.list()
  if (listErr) throw new Error(`Failed to list audiences: ${listErr.message}`)

  const existing = audiences?.data?.find(
    (a: { name: string }) => a.name === AUDIENCE_NAME
  )
  if (existing) return existing.id

  // Create new audience
  const { data: created, error: createErr } = await resend.audiences.create({
    name: AUDIENCE_NAME,
  })
  if (createErr) throw new Error(`Failed to create audience: ${createErr.message}`)
  return created!.id
}

export async function POST(request: NextRequest) {
  try {
    const { email, firstName, lastName } = await request.json()

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { error: 'A valid email address is required' },
        { status: 400 }
      )
    }

    const normalizedEmail = email.trim().toLowerCase()

    // 1. Add to Resend audience
    const audienceId = await getOrCreateAudience()
    const { error: contactErr } = await resend.contacts.create({
      email: normalizedEmail,
      firstName: firstName?.trim() || undefined,
      lastName: lastName?.trim() || undefined,
      audienceId,
    })

    // Resend returns an error if contact already exists — that's fine
    if (contactErr && !contactErr.message?.includes('already exists')) {
      console.error('[newsletter/audience] Resend error:', contactErr.message)
      return NextResponse.json(
        { error: 'Failed to add to newsletter' },
        { status: 500 }
      )
    }

    // 2. Also upsert into Supabase for our records
    const { error: dbErr } = await supabaseAdmin
      .from('sm_newsletter_subscribers')
      .upsert(
        {
          email: normalizedEmail,
          subscribed_at: new Date().toISOString(),
        },
        { onConflict: 'email' }
      )

    if (dbErr) {
      console.error('[newsletter/audience] Supabase error:', dbErr.message)
      // Don't fail — Resend is the primary target
    }

    // 3. Add to email_subscribers (chicago_daily list) for the 6 AM cron
    const { error: cronListErr } = await supabaseAdmin
      .from('email_subscribers')
      .insert({
        email: normalizedEmail,
        list: 'chicago_daily',
        subscribed: true,
        source: 'newsletter_form',
      })

    if (cronListErr) {
      // Likely duplicate — that's fine
      if (!cronListErr.message?.includes('duplicate')) {
        console.error('[newsletter/audience] email_subscribers error:', cronListErr.message)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[newsletter/audience] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
