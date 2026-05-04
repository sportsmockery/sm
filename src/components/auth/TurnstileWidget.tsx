'use client'

// Cloudflare Turnstile widget wrapper. Loads the upstream script once,
// renders the widget, and surfaces token / error / expiry events to the
// caller via callbacks. Used to gate Supabase Auth calls (signUp,
// signInWithPassword, resetPasswordForEmail) once Turnstile is enabled
// in the Supabase Auth dashboard.
//
// If NEXT_PUBLIC_TURNSTILE_SITE_KEY is unset, callers are expected to
// skip rendering this component and let the form submit unguarded — that
// matches the "graceful degradation" mode used until the key is wired in
// Vercel.

import { useEffect, useImperativeHandle, useRef, forwardRef } from 'react'

type TurnstileTheme = 'light' | 'dark' | 'auto'
type TurnstileSize = 'normal' | 'compact' | 'flexible'

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string
          callback?: (token: string) => void
          'error-callback'?: () => void
          'expired-callback'?: () => void
          'timeout-callback'?: () => void
          theme?: TurnstileTheme
          size?: TurnstileSize
          appearance?: 'always' | 'execute' | 'interaction-only'
        }
      ) => string
      reset: (widgetId?: string) => void
      remove: (widgetId?: string) => void
    }
  }
}

const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js'

let scriptPromise: Promise<void> | null = null

function loadTurnstileScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve()
  if (window.turnstile) return Promise.resolve()
  if (scriptPromise) return scriptPromise

  scriptPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src^="${SCRIPT_SRC}"]`
    )
    if (existing) {
      existing.addEventListener('load', () => resolve())
      existing.addEventListener('error', () => reject(new Error('turnstile load failed')))
      return
    }
    const script = document.createElement('script')
    script.src = `${SCRIPT_SRC}?render=explicit`
    script.async = true
    script.defer = true
    script.addEventListener('load', () => resolve())
    script.addEventListener('error', () => reject(new Error('turnstile load failed')))
    document.head.appendChild(script)
  })

  return scriptPromise
}

export interface TurnstileWidgetHandle {
  reset: () => void
}

interface TurnstileWidgetProps {
  siteKey: string
  onVerify: (token: string) => void
  onExpire?: () => void
  onError?: () => void
  theme?: TurnstileTheme
  size?: TurnstileSize
  className?: string
}

const TurnstileWidgetInner = forwardRef<TurnstileWidgetHandle, TurnstileWidgetProps>(
  function TurnstileWidget(
    { siteKey, onVerify, onExpire, onError, theme = 'auto', size = 'flexible', className },
    ref
  ) {
    const containerRef = useRef<HTMLDivElement | null>(null)
    const widgetIdRef = useRef<string | null>(null)
    const onVerifyRef = useRef(onVerify)
    const onExpireRef = useRef(onExpire)
    const onErrorRef = useRef(onError)

    useEffect(() => {
      onVerifyRef.current = onVerify
      onExpireRef.current = onExpire
      onErrorRef.current = onError
    }, [onVerify, onExpire, onError])

    useImperativeHandle(
      ref,
      () => ({
        reset: () => {
          if (window.turnstile && widgetIdRef.current) {
            window.turnstile.reset(widgetIdRef.current)
          }
        },
      }),
      []
    )

    useEffect(() => {
      let cancelled = false
      loadTurnstileScript()
        .then(() => {
          if (cancelled) return
          if (!containerRef.current || !window.turnstile) return
          if (widgetIdRef.current) return
          widgetIdRef.current = window.turnstile.render(containerRef.current, {
            sitekey: siteKey,
            theme,
            size,
            callback: (token: string) => onVerifyRef.current?.(token),
            'expired-callback': () => onExpireRef.current?.(),
            'error-callback': () => onErrorRef.current?.(),
          })
        })
        .catch(() => {
          onErrorRef.current?.()
        })

      return () => {
        cancelled = true
        if (window.turnstile && widgetIdRef.current) {
          try {
            window.turnstile.remove(widgetIdRef.current)
          } catch {
            // ignore — script may already be torn down
          }
          widgetIdRef.current = null
        }
      }
    }, [siteKey, theme, size])

    return <div ref={containerRef} className={className} data-testid="turnstile-widget" />
  }
)

export default TurnstileWidgetInner

export function getTurnstileSiteKey(): string | undefined {
  const key = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
  return key && key.length > 0 ? key : undefined
}
