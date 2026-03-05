import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

const WP_BASE_URL = 'https://www.sportsmockery.com/wp-json/sm-export/v1'

interface WPAuthor {
  id: number
  email: string
  display_name: string
  bio: string
  avatar_url: string
  role: string
  post_count: number
}

export async function POST() {
  try {
    const res = await fetch(`${WP_BASE_URL}/authors`, {
      next: { revalidate: 0 },
    })

    if (!res.ok) {
      return NextResponse.json(
        { error: `WordPress API returned ${res.status}` },
        { status: 502 }
      )
    }

    const authors: WPAuthor[] = await res.json()

    let newCount = 0
    let updatedCount = 0

    for (const author of authors) {
      // Check if author exists by wp_id or email
      const { data: existing } = await supabaseAdmin
        .from('sm_authors')
        .select('id')
        .or(`wp_id.eq.${author.id},email.eq.${author.email}`)
        .limit(1)
        .single()

      if (existing) {
        // Update existing
        const { error } = await supabaseAdmin
          .from('sm_authors')
          .update({
            wp_id: author.id,
            email: author.email,
            display_name: author.display_name,
            bio: author.bio || null,
            avatar_url: author.avatar_url || null,
            role: author.role,
          })
          .eq('id', existing.id)

        if (!error) updatedCount++
      } else {
        // Insert new
        const { error } = await supabaseAdmin
          .from('sm_authors')
          .insert({
            wp_id: author.id,
            email: author.email,
            display_name: author.display_name,
            bio: author.bio || null,
            avatar_url: author.avatar_url || null,
            role: author.role,
          })

        if (!error) newCount++
      }
    }

    return NextResponse.json({
      message: `Synced ${authors.length} writers: ${newCount} new, ${updatedCount} updated`,
      total: authors.length,
      new: newCount,
      updated: updatedCount,
    })
  } catch (error) {
    console.error('Error syncing writers from WordPress:', error)
    return NextResponse.json(
      { error: 'Failed to sync writers from WordPress' },
      { status: 500 }
    )
  }
}
