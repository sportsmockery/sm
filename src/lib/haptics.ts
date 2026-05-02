/**
 * Haptic feedback abstraction.
 *
 * Tiered fallback:
 *   1. `@capacitor/haptics` if installed (real native haptics in a Capacitor shell)
 *   2. `navigator.vibrate()` if available (Chrome Android, some others)
 *   3. No-op (Safari/iOS Web, desktop)
 *
 * Capacitor is loaded via dynamic import wrapped in try/catch so the web bundle
 * does NOT need the plugin installed. When you ship a Capacitor wrap, install
 * `@capacitor/haptics` there and these calls light up automatically — no code
 * change in components.
 */

export type HapticStyle = 'light' | 'medium' | 'heavy' | 'selection' | 'success' | 'warning' | 'error'

type CapacitorHapticsModule = {
  Haptics: {
    impact: (opts: { style: string }) => Promise<void>
    selectionStart?: () => Promise<void>
    selectionChanged?: () => Promise<void>
    selectionEnd?: () => Promise<void>
    notification?: (opts: { type: string }) => Promise<void>
  }
  ImpactStyle: { Light: string; Medium: string; Heavy: string }
  NotificationType?: { Success: string; Warning: string; Error: string }
}

let capacitorHapticsPromise: Promise<CapacitorHapticsModule | null> | null = null

function loadCapacitorHaptics(): Promise<CapacitorHapticsModule | null> {
  if (capacitorHapticsPromise) return capacitorHapticsPromise
  // Use a variable to defeat bundler static analysis; failure is expected on web.
  const moduleName = '@capacitor/haptics'
  capacitorHapticsPromise = import(/* webpackIgnore: true */ /* @vite-ignore */ moduleName)
    .then((mod) => mod as CapacitorHapticsModule)
    .catch(() => null)
  return capacitorHapticsPromise
}

const VIBRATE_MS: Record<HapticStyle, number> = {
  light: 8,
  medium: 14,
  heavy: 22,
  selection: 6,
  success: 18,
  warning: 24,
  error: 30,
}

let userPrefersReducedMotion = false
if (typeof window !== 'undefined' && window.matchMedia) {
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
  userPrefersReducedMotion = mq.matches
  mq.addEventListener?.('change', (e) => {
    userPrefersReducedMotion = e.matches
  })
}

/**
 * Fire a haptic. Always safe to call — never throws, never logs.
 * On web without Capacitor, falls back to `navigator.vibrate` if supported.
 * Respects `prefers-reduced-motion`.
 */
export async function triggerHaptic(style: HapticStyle = 'light'): Promise<void> {
  if (typeof window === 'undefined') return
  if (userPrefersReducedMotion) return

  const cap = await loadCapacitorHaptics()
  if (cap) {
    try {
      if (style === 'selection' && cap.Haptics.selectionChanged) {
        await cap.Haptics.selectionChanged()
        return
      }
      if ((style === 'success' || style === 'warning' || style === 'error') && cap.Haptics.notification && cap.NotificationType) {
        const type = style === 'success' ? cap.NotificationType.Success
                   : style === 'warning' ? cap.NotificationType.Warning
                   : cap.NotificationType.Error
        await cap.Haptics.notification({ type })
        return
      }
      const impactStyle = style === 'heavy'  ? cap.ImpactStyle.Heavy
                        : style === 'medium' ? cap.ImpactStyle.Medium
                        : cap.ImpactStyle.Light
      await cap.Haptics.impact({ style: impactStyle })
      return
    } catch {
      /* fall through to vibrate */
    }
  }

  const nav = typeof navigator !== 'undefined' ? navigator : null
  if (nav && typeof nav.vibrate === 'function') {
    try {
      nav.vibrate(VIBRATE_MS[style])
    } catch {
      /* swallow */
    }
  }
}

/* ----- Backwards-compatible aliases -----
 * The `mobile-next` workspace already imports `haptic` / `selection` / `notify`
 * from `@/lib/haptics`. These thin wrappers make this file the single source
 * of truth across both the web app and the mobile workspace. */

export type Impact = 'light' | 'medium' | 'heavy'

export const haptic = (style: Impact = 'light') => triggerHaptic(style)

export const selection = () => triggerHaptic('selection')

export const notify = (type: 'success' | 'warning' | 'error' = 'success') =>
  triggerHaptic(type)
