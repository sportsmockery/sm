import { useState, useEffect } from 'react'
import { View, StyleSheet, Platform } from 'react-native'
import { WebView } from 'react-native-webview'
import { useTheme } from '@/hooks/useTheme'
import { useAds } from '@/hooks/useAds'

interface AdBannerProps {
  code?: string
  placement: 'feed_top' | 'feed_inline' | 'article_top' | 'article_bottom'
  style?: object
}

/**
 * Flexible Ad Banner Component
 *
 * Supports:
 * - Custom HTML/JS ad code from admin panel
 * - AdMob banner ads (when no custom code)
 *
 * The ad code is fetched from the website's /api/mobile/config endpoint
 * and can be updated from the admin panel without app updates.
 */
export default function AdBanner({ code, placement, style }: AdBannerProps) {
  const { colors } = useTheme()
  const { config } = useAds()
  const [adHeight, setAdHeight] = useState(90)

  // Use provided code or fetch from config
  const adCode = code || config?.custom?.placements?.[placement]

  // If no custom code and AdMob is enabled, show AdMob banner
  if (!adCode && config?.admob?.enabled) {
    return <AdMobBanner placement={placement} style={style} />
  }

  // No ads configured
  if (!adCode) return null

  // Wrap the ad code in a basic HTML template
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html, body {
          width: 100%;
          background: transparent;
          overflow: hidden;
        }
        .ad-container {
          width: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
        }
      </style>
    </head>
    <body>
      <div class="ad-container">
        ${adCode}
      </div>
      <script>
        // Send height to React Native when content loads
        function sendHeight() {
          const height = document.body.scrollHeight || 90;
          window.ReactNativeWebView?.postMessage(JSON.stringify({ type: 'height', value: height }));
        }
        window.onload = sendHeight;
        setTimeout(sendHeight, 1000);
        setTimeout(sendHeight, 3000);
      </script>
    </body>
    </html>
  `

  const onMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data)
      if (data.type === 'height' && data.value) {
        setAdHeight(Math.max(50, Math.min(data.value, 300)))
      }
    } catch (e) {
      // Ignore invalid messages
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }, style]}>
      <WebView
        source={{ html }}
        style={[styles.webview, { height: adHeight }]}
        scrollEnabled={false}
        onMessage={onMessage}
        originWhitelist={['*']}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        mixedContentMode="compatibility"
        sharedCookiesEnabled={true}
      />
    </View>
  )
}

/**
 * AdMob Banner Component
 */
function AdMobBanner({ placement, style }: { placement: string; style?: object }) {
  const { config } = useAds()
  const { colors } = useTheme()
  const [AdComponent, setAdComponent] = useState<any>(null)

  useEffect(() => {
    // Dynamically import AdMob to avoid crashes if not configured
    async function loadAdMob() {
      try {
        const { BannerAd, BannerAdSize, TestIds } = await import('react-native-google-mobile-ads')

        // Get the appropriate ad unit ID
        const adUnitId = Platform.OS === 'ios'
          ? config?.admob?.ios_banner_id
          : config?.admob?.android_banner_id

        // Use test ID in development
        const unitId = __DEV__ ? TestIds.BANNER : adUnitId

        if (!unitId) return

        setAdComponent(
          <BannerAd
            unitId={unitId}
            size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
            requestOptions={{
              requestNonPersonalizedAdsOnly: true,
            }}
          />
        )
      } catch (error) {
        console.warn('AdMob not available:', error)
      }
    }

    if (config?.admob?.enabled) {
      loadAdMob()
    }
  }, [config])

  if (!AdComponent) return null

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }, style]}>
      {AdComponent}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  webview: {
    width: '100%',
    backgroundColor: 'transparent',
  },
})
