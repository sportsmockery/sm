import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

import { useTheme } from '@/hooks/useTheme'
import { useAudioPlayer } from '@/hooks/useAudioPlayer'
import { COLORS } from '@/lib/config'

export default function MiniPlayer() {
  const { colors } = useTheme()
  const {
    currentArticle,
    isPlaying,
    isLoading,
    progress,
    duration,
    togglePlayPause,
    stop,
  } = useAudioPlayer()

  // Don't render if nothing is playing
  if (!currentArticle) {
    return null
  }

  const progressPercent = duration > 0 ? (progress / duration) * 100 : 0

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
      {/* Progress bar */}
      <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
        <View
          style={[styles.progressFill, { width: `${progressPercent}%`, backgroundColor: COLORS.primary }]}
        />
      </View>

      <View style={styles.content}>
        {/* Icon */}
        <View style={[styles.iconContainer, { backgroundColor: COLORS.primary }]}>
          <Ionicons name="headset" size={18} color="#fff" />
        </View>

        {/* Article info */}
        <View style={styles.info}>
          <Text style={[styles.nowPlaying, { color: colors.textMuted }]}>NOW PLAYING</Text>
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
            {currentArticle.title}
          </Text>
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          {/* Play/Pause */}
          <TouchableOpacity
            style={[styles.playButton, { backgroundColor: COLORS.primary }]}
            onPress={togglePlayPause}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Ionicons name={isPlaying ? 'pause' : 'play'} size={20} color="#fff" />
            )}
          </TouchableOpacity>

          {/* Stop */}
          <TouchableOpacity
            style={styles.stopButton}
            onPress={stop}
          >
            <Ionicons name="close" size={22} color={colors.textMuted} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
  },
  progressBar: {
    height: 2,
    width: '100%',
  },
  progressFill: {
    height: '100%',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 10,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    flex: 1,
    minWidth: 0,
  },
  nowPlaying: {
    fontSize: 9,
    fontFamily: 'Montserrat-Bold',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 13,
    fontFamily: 'Montserrat-SemiBold',
    marginTop: 1,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  playButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stopButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
})
