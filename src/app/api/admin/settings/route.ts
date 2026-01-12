import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'

export async function GET() {
  try {
    const supabase = await createServerClient()

    // Check authentication
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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
    const supabase = await createServerClient()

    // Check authentication
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const { data: userData } = await supabase
      .from('sm_users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (userData?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
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
          updated_at: new Date().toISOString(),
          updated_by: user.id
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
          ...body,
          created_by: user.id
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
