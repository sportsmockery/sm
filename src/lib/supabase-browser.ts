/**
 * THE browser-side Supabase client singleton.
 *
 * Uses globalThis to guarantee exactly ONE instance even if this module
 * gets bundled into multiple chunks by Next.js/webpack.
 */
import { createBrowserClient } from '@supabase/ssr'

const GLOBAL_KEY = '__sm_supabase_browser__' as const

declare global {
  // eslint-disable-next-line no-var
  var [__sm_supabase_browser__]: ReturnType<typeof createBrowserClient> | undefined
}

export function getBrowserClient() {
  if (typeof window !== 'undefined' && (globalThis as any)[GLOBAL_KEY]) {
    return (globalThis as any)[GLOBAL_KEY]!
  }

  const client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  if (typeof window !== 'undefined') {
    ;(globalThis as any)[GLOBAL_KEY] = client
  }

  return client
}
