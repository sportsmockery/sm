import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

export async function GET() {
  try {
    const supabase = supabaseAdmin
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
    }

    const { data, error } = await supabase
      .from('sm_settings')
      .select('*')
      .single()

    if (error && error.code !== 'PGRST116') throw error

    // Return default settings if none exist
    const defaultSettings = {
      site_name: 'SportsMockery',
      site_description: 'Sports news and commentary',
      logo_url: '',
      favicon_url: '',
      meta_title_template: '%title% | %site_name%',
      meta_description: '',
      google_analytics_id: '',
      sitemap_enabled: true,
      robots_txt: 'User-agent: *\nAllow: /',
      twitter_handle: '',
      facebook_page: '',
      instagram_handle: '',
      youtube_channel: '',
      default_share_image: ''
    }

    return NextResponse.json(data || defaultSettings)
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = supabaseAdmin
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
    }

    const body = await request.json()

    // Check if settings exist
    const { data: existing } = await supabase
      .from('sm_settings')
      .select('id')
      .single()

    let result
    if (existing) {
      // Update existing
      const { data, error } = await supabase
        .from('sm_settings')
        .update({
          ...body,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id)
        .select()
        .single()

      if (error) throw error
      result = data
    } else {
      // Insert new
      const { data, error } = await supabase
        .from('sm_settings')
        .insert({
          ...body
        })
        .select()
        .single()

      if (error) throw error
      result = data
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
  }
}
