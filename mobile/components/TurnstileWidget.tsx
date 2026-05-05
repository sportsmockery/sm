import { useCallback, useMemo, useRef, useState } from 'react'
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native'
import { WebView, type WebViewMessageEvent } from 'react-native-webview'

import { TURNSTILE_SITE_KEY } from '@/lib/config'

const WIDGET_HEIGHT = 75

interface TurnstileWidgetProps {
  /** Receives a fresh token whenever Cloudflare returns one. */
  onToken: (token: string) => void
  /** Optional: surface error / expiry signals back to the form. */
  onError?: (reason: string) => void
  /** "auto" reads the system theme inside the WebView. */
  theme?: 'light' | 'dark' | 'auto'
  /** Bump this to force a re-render of the widget (e.g. after a failed submit). */
  reloadKey?: number | string
}

// Build an inline HTML doc that loads the Turnstile script, renders the
// widget, and posts the resulting token back to the React Native side via
// window.ReactNativeWebView.postMessage. We deliberately keep this self
// contained — no network calls except the Cloudflare script.
function buildHtml(siteKey: string, theme: 'light' | 'dark' | 'auto'): string {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
<style>
  html, body { margin: 0; padding: 0; background: transparent; }
  body { display: flex; align-items: center; justify-content: center; min-height: ${WIDGET_HEIGHT}px; }
  #ts { width: 100%; }
</style>
<script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" defer></script>
</head>
<body>
<div id="ts"></div>
<script>
  function send(payload) {
    if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
      window.ReactNativeWebView.postMessage(JSON.stringify(payload));
    }
  }
  function renderWhenReady() {
    if (!window.turnstile || typeof window.turnstile.render !== 'function') {
      setTimeout(renderWhenReady, 50);
      return;
    }
    try {
      window.turnstile.render('#ts', {
        sitekey: ${JSON.stringify(siteKey)},
        theme: ${JSON.stringify(theme)},
        size: 'flexible',
        appearance: 'always',
        callback: function (token) { send({ type: 'token', token: token }); },
        'error-callback': function () { send({ type: 'error', reason: 'turnstile_error' }); },
        'expired-callback': function () { send({ type: 'expired' }); },
        'timeout-callback': function () { send({ type: 'timeout' }); },
      });
    } catch (e) {
      send({ type: 'error', reason: String(e) });
    }
  }
  renderWhenReady();
</script>
</body>
</html>`
}

export default function TurnstileWidget({
  onToken,
  onError,
  theme = 'auto',
  reloadKey,
}: TurnstileWidgetProps) {
  const [loaded, setLoaded] = useState(false)
  const html = useMemo(
    () => (TURNSTILE_SITE_KEY ? buildHtml(TURNSTILE_SITE_KEY, theme) : ''),
    [theme]
  )
  // The reloadKey prop forces React Native to re-mount the WebView so the
  // widget redraws with a fresh challenge.
  const keyForWebView = `${reloadKey ?? 'initial'}-${TURNSTILE_SITE_KEY}`
  const webRef = useRef<WebView>(null)

  const handleMessage = useCallback(
    (e: WebViewMessageEvent) => {
      try {
        const data = JSON.parse(e.nativeEvent.data || '{}')
        if (data.type === 'token' && typeof data.token === 'string') {
          onToken(data.token)
        } else if (data.type === 'error' || data.type === 'timeout') {
          onError?.(data.reason || data.type)
        } else if (data.type === 'expired') {
          // Treat expired as "token gone, refetch" — pass empty string so the
          // form clears any stale token state.
          onToken('')
          onError?.('expired')
        }
      } catch {
        // Ignore malformed messages.
      }
    },
    [onToken, onError]
  )

  if (!TURNSTILE_SITE_KEY) {
    return (
      <View style={styles.fallback}>
        <Text style={styles.fallbackText}>
          Captcha not configured — set EXPO_PUBLIC_TURNSTILE_SITE_KEY to enable.
        </Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {!loaded && (
        <View style={styles.loader} pointerEvents="none">
          <ActivityIndicator size="small" color="#BC0000" />
        </View>
      )}
      <WebView
        key={keyForWebView}
        ref={webRef}
        originWhitelist={['*']}
        source={{ html, baseUrl: 'https://challenges.cloudflare.com' }}
        javaScriptEnabled
        domStorageEnabled
        scrollEnabled={false}
        style={styles.webview}
        onMessage={handleMessage}
        onLoadEnd={() => setLoaded(true)}
        onError={() => onError?.('webview_error')}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: WIDGET_HEIGHT,
    backgroundColor: 'transparent',
  },
  webview: {
    backgroundColor: 'transparent',
    flex: 1,
  },
  loader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  fallback: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(188,0,0,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(188,0,0,0.3)',
  },
  fallbackText: {
    color: '#BC0000',
    fontSize: 12,
    textAlign: 'center',
    fontFamily: 'Montserrat-Medium',
  },
})
