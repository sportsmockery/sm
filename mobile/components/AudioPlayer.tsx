import { useState, useCallback } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Image } from 'expo-image'

import { useTheme } from '@/hooks/useTheme'
import { useAudioPlayer } from '@/hooks/useAudioPlayer'
import { TEAMS, COLORS, TeamId } from '@/lib/config'
import { api } from '@/lib/api'

// Voice options matching the website
const VOICES = [
  { id: 'will', name: 'Will', description: 'Young, energetic' },
  { id: 'brian', name: 'Brian', description: 'Mature, authoritative' },
  { id: 'sarah', name: 'Sarah', description: 'Expressive' },
  { id: 'laura', name: 'Laura', description: 'Warm, friendly' },
]

interface AudioPlayerProps {
  compact?: boolean
  onClose?: () => void
}

export default function AudioPlayer({
  compact = false,
  onClose,
}: AudioPlayerProps) {
  const { colors, isDark } = useTheme()

  // Use global audio player context
  const {
    currentArticle,
    isPlaying,
    isLoading,
    progress,
    duration,
    selectedVoice,
    error,
    playArticle,
    togglePlayPause,
    stop,
    seek,
    setVoice,
    playNext,
  } = useAudioPlayer()

  // Local state for playlist mode and team selection
  const [playlistMode, setPlaylistMode] = useState<'team' | 'recent'>('recent')
  const [selectedTeam, setSelectedTeam] = useState<string | undefined>(undefined)

  // Format time
  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000)
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Start playing from team or recent
  const startPlayback = useCallback(async (playMode: 'team' | 'recent', teamId?: string) => {
    setPlaylistMode(playMode)
    setSelectedTeam(teamId)

    try {
      const article = await api.getFirstAudioArticle(playMode, teamId)
      if (article) {
        await playArticle({
          id: article.id,
          title: article.title,
          slug: article.slug,
          team: teamId,
        })
      }
    } catch (err) {
      console.error('Failed to start playback:', err)
    }
  }, [playArticle])

  // Handle next article
  const handleNext = useCallback(async () => {
    await playNext(playlistMode, selectedTeam)
  }, [playNext, playlistMode, selectedTeam])

  // Handle voice change
  const handleVoiceChange = useCallback((voice: string) => {
    setVoice(voice)
  }, [setVoice])

  // Compact player view (for article pages)
  if (compact) {
    return (
      <View style={[styles.compactContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.compactHeader}>
          <Ionicons name="headset" size={20} color={COLORS.primary} />
          <Text style={[styles.compactTitle, { color: colors.text }]}>Listen to Article</Text>
        </View>

        {error && (
          <Text style={styles.errorText}>{error}</Text>
        )}

        <View style={styles.compactControls}>
          <TouchableOpacity
            style={[styles.playButton, { backgroundColor: COLORS.primary }]}
            onPress={togglePlayPause}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Ionicons name={isPlaying ? 'pause' : 'play'} size={24} color="#fff" />
            )}
          </TouchableOpacity>

          {/* Voice selector */}
          <View style={styles.voiceSelector}>
            {VOICES.map((voice) => (
              <TouchableOpacity
                key={voice.id}
                style={[
                  styles.voiceChip,
                  {
                    backgroundColor: selectedVoice === voice.id ? COLORS.primary : colors.background,
                    borderColor: selectedVoice === voice.id ? COLORS.primary : colors.border,
                  },
                ]}
                onPress={() => handleVoiceChange(voice.id)}
              >
                <Text
                  style={[
                    styles.voiceChipText,
                    { color: selectedVoice === voice.id ? '#fff' : colors.text },
                  ]}
                >
                  {voice.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Progress bar */}
        {duration > 0 && (
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${(progress / duration) * 100}%`, backgroundColor: COLORS.primary },
                ]}
              />
            </View>
            <View style={styles.timeDisplay}>
              <Text style={[styles.timeText, { color: colors.textMuted }]}>{formatTime(progress)}</Text>
              <Text style={[styles.timeText, { color: colors.textMuted }]}>{formatTime(duration)}</Text>
            </View>
          </View>
        )}
      </View>
    )
  }

  // Full player view (for Listen Now page)
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Listen Now</Text>
        {onClose && (
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Mode Selection */}
        <View style={[styles.modeSection, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Choose a Mode</Text>

        <TouchableOpacity
          style={[
            styles.modeButton,
            { backgroundColor: playlistMode === 'recent' ? `${COLORS.primary}15` : colors.background, borderColor: playlistMode === 'recent' ? COLORS.primary : colors.border },
          ]}
          onPress={() => startPlayback('recent')}
        >
          <Ionicons name="time" size={24} color={playlistMode === 'recent' ? COLORS.primary : colors.textMuted} />
          <View style={styles.modeButtonText}>
            <Text style={[styles.modeButtonTitle, { color: colors.text }]}>Recent Articles</Text>
            <Text style={[styles.modeButtonDesc, { color: colors.textMuted }]}>Listen to the latest news from all teams</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Team Selection */}
      <View style={[styles.teamSection, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Or Choose a Team</Text>
        <View style={styles.teamsGrid}>
          {Object.values(TEAMS).map((t) => (
            <TouchableOpacity
              key={t.id}
              style={[
                styles.teamButton,
                {
                  backgroundColor: selectedTeam === t.id && playlistMode === 'team' ? `${t.color}15` : colors.background,
                  borderColor: selectedTeam === t.id && playlistMode === 'team' ? t.color : colors.border,
                },
              ]}
              onPress={() => startPlayback('team', t.id)}
            >
              <Image source={{ uri: t.logo }} style={styles.teamLogo} contentFit="contain" />
              <Text style={[styles.teamName, { color: colors.text }]}>{t.shortName}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Voice Selection */}
      <View style={[styles.voiceSection, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Choose a Voice</Text>
        <View style={styles.voicesGrid}>
          {VOICES.map((voice) => (
            <TouchableOpacity
              key={voice.id}
              style={[
                styles.voiceButton,
                {
                  backgroundColor: selectedVoice === voice.id ? `${COLORS.primary}15` : colors.background,
                  borderColor: selectedVoice === voice.id ? COLORS.primary : colors.border,
                },
              ]}
              onPress={() => handleVoiceChange(voice.id)}
            >
              <Ionicons
                name="mic"
                size={20}
                color={selectedVoice === voice.id ? COLORS.primary : colors.textMuted}
              />
              <Text style={[styles.voiceButtonName, { color: colors.text }]}>{voice.name}</Text>
              <Text style={[styles.voiceButtonDesc, { color: colors.textMuted }]}>{voice.description}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Now Playing */}
      {currentArticle && (
        <View style={[styles.nowPlaying, { backgroundColor: colors.surface }]}>
          <Text style={[styles.nowPlayingLabel, { color: colors.textMuted }]}>NOW PLAYING</Text>
          <Text style={[styles.nowPlayingTitle, { color: colors.text }]} numberOfLines={2}>
            {currentArticle.title}
          </Text>

          {error && <Text style={styles.errorText}>{error}</Text>}

          {/* Progress bar */}
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${duration > 0 ? (progress / duration) * 100 : 0}%`, backgroundColor: COLORS.primary },
                ]}
              />
            </View>
            <View style={styles.timeDisplay}>
              <Text style={[styles.timeText, { color: colors.textMuted }]}>{formatTime(progress)}</Text>
              <Text style={[styles.timeText, { color: colors.textMuted }]}>{formatTime(duration)}</Text>
            </View>
          </View>

          {/* Controls */}
          <View style={styles.controls}>
            <TouchableOpacity onPress={stop} style={styles.controlButton}>
              <Ionicons name="stop" size={28} color={colors.text} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.mainPlayButton, { backgroundColor: COLORS.primary }]}
              onPress={togglePlayPause}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" size="large" />
              ) : (
                <Ionicons name={isPlaying ? 'pause' : 'play'} size={36} color="#fff" />
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={handleNext} style={styles.controlButton} disabled={isLoading}>
              <Ionicons name="play-skip-forward" size={28} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Disclaimer */}
        <Text style={[styles.disclaimer, { color: colors.textMuted }]}>
          Audio is AI-generated and may contain errors. For accuracy, please read the original article.
        </Text>

        {/* Bottom padding for scroll */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Montserrat-Bold',
  },
  modeSection: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: 'Montserrat-Bold',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  modeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  modeButtonText: {
    marginLeft: 12,
    flex: 1,
  },
  modeButtonTitle: {
    fontSize: 16,
    fontFamily: 'Montserrat-SemiBold',
  },
  modeButtonDesc: {
    fontSize: 13,
    fontFamily: 'Montserrat-Regular',
    marginTop: 2,
  },
  teamSection: {
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
  },
  teamsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  teamButton: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    width: '30%',
  },
  teamLogo: {
    width: 40,
    height: 40,
    marginBottom: 8,
  },
  teamName: {
    fontSize: 12,
    fontFamily: 'Montserrat-Medium',
  },
  voiceSection: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  voicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  voiceButton: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    width: '48%',
  },
  voiceButtonName: {
    fontSize: 14,
    fontFamily: 'Montserrat-SemiBold',
    marginTop: 4,
  },
  voiceButtonDesc: {
    fontSize: 11,
    fontFamily: 'Montserrat-Regular',
    marginTop: 2,
  },
  nowPlaying: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  nowPlayingLabel: {
    fontSize: 10,
    fontFamily: 'Montserrat-Bold',
    letterSpacing: 1,
    marginBottom: 8,
  },
  nowPlayingTitle: {
    fontSize: 16,
    fontFamily: 'Montserrat-SemiBold',
    lineHeight: 22,
    marginBottom: 16,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  timeDisplay: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  timeText: {
    fontSize: 11,
    fontFamily: 'Montserrat-Regular',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },
  controlButton: {
    padding: 8,
  },
  mainPlayButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disclaimer: {
    fontSize: 11,
    fontFamily: 'Montserrat-Regular',
    textAlign: 'center',
    paddingHorizontal: 32,
    marginTop: 8,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 12,
    fontFamily: 'Montserrat-Regular',
    textAlign: 'center',
    marginVertical: 8,
  },
  // Compact styles
  compactContainer: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginVertical: 8,
  },
  compactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  compactTitle: {
    fontSize: 14,
    fontFamily: 'Montserrat-SemiBold',
  },
  compactControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  playButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  voiceSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    flex: 1,
  },
  voiceChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  voiceChipText: {
    fontSize: 11,
    fontFamily: 'Montserrat-Medium',
  },
})
