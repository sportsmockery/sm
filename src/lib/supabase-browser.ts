/**
 * THE browser-side Supabase client singleton.
 *
 * Every client-side file that needs Supabase MUST import from here.
 * Do NOT create your own createBrowserClient / createClient anywhere else.
 * Multiple GoTrueClient instances cause auth race conditions.
 */
import { createBrowserClient } from '@supabase/ssr'

let _instance: ReturnType<typeof createBrowserClient> | null = null

export function getBrowserClient() {
  if (!_instance) {
    _instance = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }
  return _instance
}
