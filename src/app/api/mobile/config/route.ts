import { NextRequest, NextResponse } from 'next/server'

/**
 * Mobile App Configuration API
 * Returns feature flags, ad settings, and app configuration
 * Controlled from admin panel at /admin/mobile
 */
export async function GET(request: NextRequest) {
  try {
    // Default mobile configuration
    // TODO: Load from database/admin settings when admin panel is built
    const config = {
      ads: {
        enabled: false,
        admob: {
          enabled: false,
          ios_banner_id: '',
          ios_interstitial_id: '',
          android_banner_id: '',
          android_interstitial_id: '',
          interstitial_frequency: 5, // Show every N articles
        },
        custom: {
          enabled: false,
          placements: {
            feed_top: null,
            feed_inline: null,
            article_top: null,
            article_bottom: null,
          },
        },
      },
      features: {
        fan_chat_enabled: true,
        ask_ai_enabled: true,
        push_notifications_enabled: true,
        dark_mode_enabled: true,
      },
      force_update: null,
      maintenance_mode: false,
    }

    return NextResponse.json(config)
  } catch (error) {
    console.error('Error in GET /api/mobile/config:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
