import AsyncStorage from '@react-native-async-storage/async-storage'

const ANON_ID_KEY = 'sm-anonymous-id'

let cachedId: string | null = null
let pendingLoad: Promise<string> | null = null

function generateId(): string {
  // 24-char URL-safe random ID. The web vote endpoint sanitizes inputs to
  // [a-zA-Z0-9_-] so we keep the same alphabet here.
  const bytes = new Uint8Array(18)
  for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256)
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_'
  let out = ''
  for (const b of bytes) out += alphabet[b % alphabet.length]
  return out
}

/**
 * Returns a stable per-device anonymous ID. Created lazily and persisted via
 * AsyncStorage so the user's votes / view history aren't tied to login state.
 */
export async function getAnonymousId(): Promise<string> {
  if (cachedId) return cachedId
  if (pendingLoad) return pendingLoad
  pendingLoad = (async () => {
    try {
      const stored = await AsyncStorage.getItem(ANON_ID_KEY)
      if (stored) {
        cachedId = stored
        return stored
      }
    } catch {
      // fall through to generate
    }
    const fresh = generateId()
    cachedId = fresh
    try {
      await AsyncStorage.setItem(ANON_ID_KEY, fresh)
    } catch {
      // best-effort persistence
    }
    return fresh
  })()
  return pendingLoad
}
