import { Tabs } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@/hooks/useTheme'
import { COLORS } from '@/lib/config'

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
          title: 'Home',
          tabBarIcon: getTabBarIcon('home', false),
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
          title: 'Ask AI',
          tabBarIcon: getTabBarIcon('sparkles', false),
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
