import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

const FALLBACK_PROMPTS = [
  "Why did the Bears lose Sunday?",
  "Is Caleb Williams improving?",
  "Should the Cubs trade Bellinger?",
  "What's wrong with the Bulls defense?",
  "Are the Blackhawks rebuilding correctly?",
]

/**
 * Lightweight GET endpoint — returns today's Scout-generated prompts.
 * Falls back to static prompts if none exist.
 */
export async function GET() {
  try {
    const { data } = await supabaseAdmin
      .from('sm_kv')
      .select('value')
      .eq('key', 'scout_daily_prompts')
      .single()

    if (data?.value?.prompts) {
      return NextResponse.json({ prompts: data.value.prompts })
    }
  } catch {
    // Fall through to fallback
  }

  return NextResponse.json({ prompts: FALLBACK_PROMPTS })
}
