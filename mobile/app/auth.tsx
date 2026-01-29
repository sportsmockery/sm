import { useState, useRef } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  InputAccessoryView,
} from 'react-native'
import { Image } from 'expo-image'
import { useRouter, Stack } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'

import { useTheme } from '@/hooks/useTheme'
import { useAuth } from '@/hooks/useAuth'
import { COLORS } from '@/lib/config'

export default function AuthScreen() {
  const router = useRouter()
  const { colors, isDark } = useTheme()
  const { signIn, signUp } = useAuth()

  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')

  const [isSubmitting, setIsSubmitting] = useState(false)
  const inputAccessoryViewID = 'authKeyboardDone'

  const dismissKeyboard = () => Keyboard.dismiss()

  const handleSubmit = async () => {
    setError('')

    if (!email || !password) {
      setError('Please fill in all fields')
      return
    }

    setIsSubmitting(true)

    try {
      if (isSignUp) {
        if (!username) {
          setError('Please enter a username')
          setIsSubmitting(false)
          return
        }
        const result = await signUp(email, password, username)
        if (result.error) {
          setError(result.error.message || 'Sign up failed')
          setIsSubmitting(false)
          return
        }
      } else {
        const result = await signIn(email, password)
        if (result.error) {
          setError(result.error.message || 'Sign in failed')
          setIsSubmitting(false)
          return
        }
      }
      // Only navigate back on success
      router.back()
    } catch (err: any) {
      setError(err.message || 'Authentication failed')
      setIsSubmitting(false)
    }
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />

      <TouchableWithoutFeedback onPress={dismissKeyboard} accessible={false}>
        <KeyboardAvoidingView
          style={styles.content}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
        {/* Close Button */}
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => router.back()}
        >
          <Ionicons name="close" size={28} color={colors.text} />
        </TouchableOpacity>

        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={isDark ? require('@/assets/images/light_logo.png') : require('@/assets/images/logo.png')}
            style={styles.logo}
            contentFit="contain"
          />
        </View>

        {/* Title */}
        <Text style={[styles.title, { color: colors.text }]}>
          {isSignUp ? 'Create Account' : 'Welcome Back'}
        </Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          {isSignUp
            ? 'Join the Sports Mockery community'
            : 'Sign in to access all features'}
        </Text>

        {/* Form */}
        <View style={styles.form}>
          {isSignUp && (
            <TextInput
              style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
              placeholder="Username"
              placeholderTextColor={colors.textMuted}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              inputAccessoryViewID={inputAccessoryViewID}
            />
          )}

          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
            placeholder="Email"
            placeholderTextColor={colors.textMuted}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            inputAccessoryViewID={inputAccessoryViewID}
          />

          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
            placeholder="Password"
            placeholderTextColor={colors.textMuted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            inputAccessoryViewID={inputAccessoryViewID}
          />

          {error ? (
            <Text style={styles.error}>{error}</Text>
          ) : null}

          <TouchableOpacity
            style={[styles.button, { backgroundColor: COLORS.primary, opacity: isSubmitting ? 0.7 : 1 }]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>
                {isSignUp ? 'Create Account' : 'Sign In'}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Toggle */}
        <TouchableOpacity
          style={styles.toggle}
          onPress={() => {
            setIsSignUp(!isSignUp)
            setError('')
          }}
        >
          <Text style={[styles.toggleText, { color: colors.textMuted }]}>
            {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
            <Text style={{ color: COLORS.primary, fontFamily: 'Montserrat-SemiBold' }}>
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </Text>
          </Text>
        </TouchableOpacity>

        {/* Continue as Guest */}
        <TouchableOpacity
          style={styles.guestButton}
          onPress={() => router.back()}
        >
          <Text style={[styles.guestText, { color: colors.textMuted }]}>
            Continue as Guest
          </Text>
        </TouchableOpacity>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>

      {/* Keyboard Done Button (iOS) */}
      {Platform.OS === 'ios' && (
        <InputAccessoryView nativeID={inputAccessoryViewID}>
          <View style={[styles.keyboardAccessory, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
            <TouchableOpacity onPress={dismissKeyboard} style={styles.doneButton}>
              <Ionicons name="chevron-down" size={20} color={COLORS.primary} />
              <Text style={[styles.doneButtonText, { color: COLORS.primary }]}>Done</Text>
            </TouchableOpacity>
          </View>
        </InputAccessoryView>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 4,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 32,
  },
  logo: {
    width: 200,
    height: 60,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Montserrat-Bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    fontFamily: 'Montserrat-Regular',
    textAlign: 'center',
    marginBottom: 32,
  },
  form: {
    gap: 16,
  },
  input: {
    height: 52,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    fontFamily: 'Montserrat-Regular',
    borderWidth: 1,
  },
  error: {
    color: COLORS.error,
    fontSize: 14,
    fontFamily: 'Montserrat-Regular',
    textAlign: 'center',
  },
  button: {
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontFamily: 'Montserrat-SemiBold',
  },
  toggle: {
    marginTop: 24,
    alignItems: 'center',
  },
  toggleText: {
    fontSize: 15,
    fontFamily: 'Montserrat-Regular',
  },
  guestButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  guestText: {
    fontSize: 14,
    fontFamily: 'Montserrat-Regular',
  },
  keyboardAccessory: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
  },
  doneButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  doneButtonText: {
    fontSize: 16,
    fontFamily: 'Montserrat-SemiBold',
  },
})
