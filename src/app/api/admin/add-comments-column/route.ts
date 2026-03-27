import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { error } = await supabaseAdmin.rpc('exec_sql', {
      query: 'ALTER TABLE sm_posts ADD COLUMN IF NOT EXISTS comments_count INTEGER DEFAULT 0;',
    })

    if (error) {
      // Fallback: try raw SQL via supabaseAdmin
      const { error: rawError } = await supabaseAdmin
        .from('sm_posts')
        .select('comments_count')
        .limit(1)

      if (rawError && rawError.message.includes('comments_count')) {
        return NextResponse.json({
          success: false,
          error: 'Column does not exist and could not be created automatically. Run this SQL manually in Supabase Dashboard: ALTER TABLE sm_posts ADD COLUMN IF NOT EXISTS comments_count INTEGER DEFAULT 0;',
        }, { status: 500 })
      }

      // Column already exists
      return NextResponse.json({
        success: true,
        message: 'Column comments_count already exists',
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Column comments_count added to sm_posts',
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}
