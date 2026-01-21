import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { supabaseAdmin } from '@/lib/supabase-server'
import { isProTier } from '@/lib/stripe'

export interface SubscriptionResponse {
  tier: 'free' | 'sm_plus_monthly' | 'sm_plus_annual'
  status: 'active' | 'inactive' | 'canceled' | 'past_due' | 'trialing' | 'unpaid'
  isPro: boolean
  currentPeriodEnd: string | null
  cancelAtPeriodEnd: boolean
  features: {
    ar_tours: boolean
    fan_chat: boolean
    ad_free: boolean
    ask_ai: { enabled: boolean; limit: number | null }
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll() {},
        },
      }
    )

    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Return free tier for unauthenticated users
    if (!user) {
      return NextResponse.json<SubscriptionResponse>({
        tier: 'free',
        status: 'inactive',
        isPro: false,
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
        features: {
          ar_tours: false,
          fan_chat: false,
          ad_free: false,
          ask_ai: { enabled: true, limit: 5 },
        },
      })
    }

    const { data: subscription } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single()

    const isPro =
      subscription?.status === 'active' && isProTier(subscription?.tier || '')

    return NextResponse.json<SubscriptionResponse>({
      tier: (subscription?.tier as SubscriptionResponse['tier']) || 'free',
      status:
        (subscription?.status as SubscriptionResponse['status']) || 'inactive',
      isPro,
      currentPeriodEnd: subscription?.current_period_end || null,
      cancelAtPeriodEnd: subscription?.cancel_at_period_end || false,
      features: {
        ar_tours: isPro,
        fan_chat: isPro,
        ad_free: isPro,
        ask_ai: { enabled: true, limit: isPro ? null : 5 },
      },
    })
  } catch (error) {
    console.error('Subscription fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch subscription' },
      { status: 500 }
    )
  }
}
