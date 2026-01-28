import { Tabs } from 'expo-router'
import { Image, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@/hooks/useTheme'
import { COLORS } from '@/lib/config'

const starIcon = require('@/assets/images/star.png')
const scoutMobileIcon = require('@/assets/images/scout-mobile.png')

export default function TabsLayout() {
  const { isDark } = useTheme()

  const tabBarStyle = {
    backgroundColor: isDark ? COLORS.surfaceDark : COLORS.surface,
    borderTopColor: isDark ? COLORS.borderDark : COLORS.border,
    borderTopWidth: 1,
    paddingTop: 8,
    paddingBottom: 8,
    height: 60,
  }

  const getTabBarIcon = (name: keyof typeof Ionicons.glyphMap, focused: boolean) => {
    return ({ color, size }: { color: string; size: number }) => (
      <Ionicons
        name={focused ? name : (`${name}-outline` as keyof typeof Ionicons.glyphMap)}
        size={size}
        color={color}
      />
    )
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: isDark ? COLORS.textMutedDark : COLORS.textMuted,
        tabBarStyle,
        tabBarLabelStyle: {
          fontSize: 11,
          fontFamily: 'Montserrat-Medium',
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Feed',
          tabBarIcon: ({ color, size }) => (
            <Image
              source={starIcon}
              style={{ width: size, height: size, tintColor: color }}
              resizeMode="contain"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="teams"
        options={{
          title: 'Teams',
          tabBarIcon: getTabBarIcon('american-football', false),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Fan Chat',
          tabBarIcon: getTabBarIcon('chatbubbles', false),
        }}
      />
      <Tabs.Screen
        name="ask-ai"
        options={{
          title: 'Scout AI',
          tabBarIcon: ({ size, focused }) => (
            <Image
              source={scoutMobileIcon}
              style={{
                width: size,
                height: size,
                tintColor: focused ? COLORS.primary : undefined,
              }}
              resizeMode="contain"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: getTabBarIcon('person', false),
        }}
      />
    </Tabs>
  )
}
