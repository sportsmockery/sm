/**
 * General-purpose Supabase client.
 *
 * Browser code: delegates to the shared singleton in supabase-browser.ts
 * Server code: should use supabase-server.ts instead
 */
import { getBrowserClient } from './supabase-browser'

export const supabase = getBrowserClient()

/** @deprecated Use `supabase` or `getBrowserClient()` instead */
export function createClient() {
  return getBrowserClient()
}
