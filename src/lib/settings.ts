import { createClient } from '@/lib/supabase'

export interface SiteSettings {
  id?: string
  site_name: string
  site_description: string
  logo_url: string
  favicon_url: string
  meta_title_template: string
  meta_description: string
  google_analytics_id: string
  sitemap_enabled: boolean
  robots_txt: string
  twitter_handle: string
  facebook_page: string
  instagram_handle: string
  youtube_channel: string
  default_share_image: string
  created_at?: string
  updated_at?: string
}

const defaultSettings: SiteSettings = {
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

export async function getSettings(): Promise<SiteSettings> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('sm_settings')
    .select('*')
    .single()

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching settings:', error)
    throw error
  }

  return data || defaultSettings
}

export async function updateSettings(updates: Partial<SiteSettings>): Promise<SiteSettings> {
  const supabase = createClient()

  // Check if settings exist
  const { data: existing } = await supabase
    .from('sm_settings')
    .select('id')
    .single()

  if (existing) {
    const { data, error } = await supabase
      .from('sm_settings')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', existing.id)
      .select()
      .single()

    if (error) throw error
    return data
  } else {
    const { data, error } = await supabase
      .from('sm_settings')
      .insert({
        ...defaultSettings,
        ...updates
      })
      .select()
      .single()

    if (error) throw error
    return data
  }
}

export async function getSettingValue<K extends keyof SiteSettings>(
  key: K
): Promise<SiteSettings[K]> {
  const settings = await getSettings()
  return settings[key]
}

export async function setSettingValue<K extends keyof SiteSettings>(
  key: K,
  value: SiteSettings[K]
): Promise<void> {
  await updateSettings({ [key]: value })
}

// Helper to format meta title using template
export function formatMetaTitle(title: string, settings: SiteSettings): string {
  return settings.meta_title_template
    .replace('%title%', title)
    .replace('%site_name%', settings.site_name)
}

// Get social links as array for easy rendering
export function getSocialLinks(settings: SiteSettings): Array<{
  platform: string
  url: string
  icon: string
}> {
  const links = []

  if (settings.twitter_handle) {
    links.push({
      platform: 'Twitter',
      url: `https://twitter.com/${settings.twitter_handle}`,
      icon: 'twitter'
    })
  }

  if (settings.facebook_page) {
    links.push({
      platform: 'Facebook',
      url: settings.facebook_page,
      icon: 'facebook'
    })
  }

  if (settings.instagram_handle) {
    links.push({
      platform: 'Instagram',
      url: `https://instagram.com/${settings.instagram_handle}`,
      icon: 'instagram'
    })
  }

  if (settings.youtube_channel) {
    links.push({
      platform: 'YouTube',
      url: settings.youtube_channel,
      icon: 'youtube'
    })
  }

  return links
}
