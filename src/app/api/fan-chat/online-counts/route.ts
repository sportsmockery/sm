import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

const CHANNEL_IDS = ['global', 'bears', 'bulls', 'cubs', 'whitesox', 'blackhawks']

/**
 * GET /api/fan-chat/online-counts
 * Returns count of users currently online per channel (room).
 * Uses chat_presence when available; falls back to placeholder counts.
 */
export async function GET() {
  try {
    const counts: Record<string, number> = {}

    try {
      const { data, error } = await supabaseAdmin
        .from('chat_presence')
        .select('room_id')
        .eq('is_online', true)

      if (!error && data) {
        for (const row of data) {
          const roomId = row.room_id as string
          if (roomId) {
            counts[roomId] = (counts[roomId] ?? 0) + 1
          }
        }
      }
    } catch {
      // chat_presence may not exist or be unavailable
    }

    // Ensure every channel has a count (use real from presence or 1 as fallback)
    const result: Record<string, number> = {}
    for (const id of CHANNEL_IDS) {
      result[id] = counts[id] ?? 1
    }

    return NextResponse.json(result)
  } catch (err) {
    console.error('[fan-chat/online-counts]', err)
    return NextResponse.json(
      { global: 1, bears: 1, bulls: 1, cubs: 1, whitesox: 1, blackhawks: 1 },
      { status: 200 }
    )
  }
}
