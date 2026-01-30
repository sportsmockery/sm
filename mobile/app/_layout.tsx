import { useEffect } from 'react'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { QueryClientProvider } from '@tanstack/react-query'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import * as SplashScreen from 'expo-splash-screen'
import { useFonts } from 'expo-font'

import { queryClient, restoreQueryCache, prefetchFeed, prefetchMobileConfig } from '@/lib/queryClient'
import { AuthProvider } from '@/hooks/useAuth'
import { ThemeProvider } from '@/hooks/useTheme'
import { SubscriptionProvider } from '@/hooks/useSubscription'
import { AdsProvider } from '@/hooks/useAds'
import { AudioPlayerProvider } from '@/hooks/useAudioPlayer'
import { GMProvider } from '@/lib/gm-context'
import { MockDraftProvider } from '@/lib/mock-draft-context'

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  // Load custom fonts
  const [fontsLoaded] = useFonts({
    'Montserrat-Bold': require('@/assets/fonts/Montserrat-Bold.ttf'),
    'Montserrat-SemiBold': require('@/assets/fonts/Montserrat-SemiBold.ttf'),
    'Montserrat-Medium': require('@/assets/fonts/Montserrat-Medium.ttf'),
    'Montserrat-Regular': require('@/assets/fonts/Montserrat-Regular.ttf'),
  })

  useEffect(() => {
    async function prepare() {
      try {
        // Restore cached data for offline support
        await restoreQueryCache()

        // Prefetch critical data
        await Promise.all([
          prefetchFeed(),
          prefetchMobileConfig(),
        ])
      } catch (error) {
        console.warn('Failed to prepare app:', error)
      } finally {
        // Hide splash screen when ready
        if (fontsLoaded) {
          // Small delay to ensure splash screen is visible (can be removed in production)
          await new Promise(resolve => setTimeout(resolve, 1500))
          await SplashScreen.hideAsync()
        }
      }
    }

    prepare()
  }, [fontsLoaded])

  if (!fontsLoaded) {
    return null
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <AuthProvider>
              <SubscriptionProvider>
              <AdsProvider>
                <AudioPlayerProvider>
                <GMProvider>
                <MockDraftProvider>
                <Stack
                  screenOptions={{
                    headerShown: false,
                    animation: 'slide_from_right',
                  }}
                >
                  <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                  <Stack.Screen
                    name="article/[id]"
                    options={{
                      presentation: 'card',
                      animation: 'slide_from_right',
                    }}
                  />
                  <Stack.Screen
                    name="team/[slug]"
                    options={{
                      presentation: 'card',
                      animation: 'slide_from_right',
                    }}
                  />
                  <Stack.Screen
                    name="chat/[roomId]"
                    options={{
                      presentation: 'card',
                      animation: 'slide_from_bottom',
                    }}
                  />
                  <Stack.Screen
                    name="auth"
                    options={{
                      presentation: 'modal',
                      animation: 'slide_from_bottom',
                    }}
                  />
                  <Stack.Screen
                    name="search"
                    options={{
                      presentation: 'card',
                      animation: 'slide_from_right',
                    }}
                  />
                  <Stack.Screen
                    name="listen"
                    options={{
                      presentation: 'card',
                      animation: 'slide_from_bottom',
                    }}
                  />
                  <Stack.Screen
                    name="notifications"
                    options={{
                      presentation: 'card',
                      animation: 'slide_from_right',
                    }}
                  />
                  <Stack.Screen
                    name="gm/index"
                    options={{
                      presentation: 'card',
                      animation: 'slide_from_right',
                    }}
                  />
                  <Stack.Screen
                    name="gm/roster"
                    options={{
                      presentation: 'card',
                      animation: 'slide_from_right',
                    }}
                  />
                  <Stack.Screen
                    name="gm/opponent"
                    options={{
                      presentation: 'card',
                      animation: 'slide_from_right',
                    }}
                  />
                  <Stack.Screen
                    name="gm/opponent-roster"
                    options={{
                      presentation: 'card',
                      animation: 'slide_from_right',
                    }}
                  />
                  <Stack.Screen
                    name="gm/draft-picks"
                    options={{
                      presentation: 'card',
                      animation: 'slide_from_right',
                    }}
                  />
                  <Stack.Screen
                    name="gm/review"
                    options={{
                      presentation: 'card',
                      animation: 'slide_from_right',
                    }}
                  />
                  <Stack.Screen
                    name="gm/result"
                    options={{
                      presentation: 'card',
                      animation: 'slide_from_bottom',
                    }}
                  />
                  <Stack.Screen
                    name="gm/history"
                    options={{
                      presentation: 'card',
                      animation: 'slide_from_right',
                    }}
                  />
                  <Stack.Screen
                    name="gm/leaderboard"
                    options={{
                      presentation: 'card',
                      animation: 'slide_from_right',
                    }}
                  />
                  <Stack.Screen
                    name="mock-draft/index"
                    options={{
                      presentation: 'card',
                      animation: 'slide_from_right',
                    }}
                  />
                  <Stack.Screen
                    name="mock-draft/draft"
                    options={{
                      presentation: 'card',
                      animation: 'slide_from_right',
                    }}
                  />
                  <Stack.Screen
                    name="mock-draft/result"
                    options={{
                      presentation: 'card',
                      animation: 'slide_from_bottom',
                    }}
                  />
                </Stack>
                <StatusBar style="auto" />
                </MockDraftProvider>
                </GMProvider>
                </AudioPlayerProvider>
              </AdsProvider>
              </SubscriptionProvider>
            </AuthProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}
