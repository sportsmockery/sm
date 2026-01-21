import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react'
import TrackPlayer, {
  State,
  usePlaybackState,
  useProgress,
  useTrackPlayerEvents,
  Event,
  Capability,
  AppKilledPlaybackBehavior,
} from 'react-native-track-player'
import { api } from '@/lib/api'

interface Article {
  id: number
  title: string
  slug: string
  team?: string
}

interface AudioPlayerContextType {
  // Current state
  currentArticle: Article | null
  isPlaying: boolean
  isLoading: boolean
  progress: number
  duration: number
  selectedVoice: string
  error: string | null

  // Actions
  playArticle: (article: Article, voice?: string) => Promise<void>
  togglePlayPause: () => Promise<void>
  stop: () => Promise<void>
  seek: (position: number) => Promise<void>
  setVoice: (voice: string) => void
  playNext: (mode: 'team' | 'recent', team?: string) => Promise<void>
}

const AudioPlayerContext = createContext<AudioPlayerContextType | null>(null)

let isPlayerSetup = false

async function setupPlayer() {
  if (isPlayerSetup) return

  try {
    await TrackPlayer.setupPlayer({
      autoHandleInterruptions: true,
    })

    await TrackPlayer.updateOptions({
      capabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.Stop,
        Capability.SeekTo,
        Capability.SkipToNext,
      ],
      compactCapabilities: [Capability.Play, Capability.Pause, Capability.Stop],
      notificationCapabilities: [Capability.Play, Capability.Pause, Capability.Stop],
      android: {
        appKilledPlaybackBehavior: AppKilledPlaybackBehavior.ContinuePlayback,
      },
    })

    isPlayerSetup = true
  } catch (error) {
    console.error('Error setting up player:', error)
  }
}

export function AudioPlayerProvider({ children }: { children: ReactNode }) {
  const [currentArticle, setCurrentArticle] = useState<Article | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedVoice, setSelectedVoice] = useState('will')
  const [error, setError] = useState<string | null>(null)

  const playbackState = usePlaybackState()
  const { position, duration } = useProgress()

  // Determine if playing from playback state
  const isPlaying = playbackState.state === State.Playing

  // Initialize player on mount
  useEffect(() => {
    setupPlayer()

    return () => {
      // Don't destroy player on unmount to allow background playback
    }
  }, [])

  // Listen for track player events
  useTrackPlayerEvents([Event.PlaybackQueueEnded, Event.PlaybackError], async (event) => {
    if (event.type === Event.PlaybackQueueEnded) {
      setCurrentArticle(null)
    }
    if (event.type === Event.PlaybackError) {
      console.error('Playback error:', event)
      setError('Failed to play audio')
    }
  })

  // Play an article
  const playArticle = useCallback(async (article: Article, voice?: string) => {
    setIsLoading(true)
    setError(null)
    setCurrentArticle(article)

    const voiceToUse = voice || selectedVoice

    try {
      await setupPlayer()

      // Clear current queue and add new track
      await TrackPlayer.reset()

      const audioUrl = api.getAudioUrl(article.slug, voiceToUse)

      await TrackPlayer.add({
        id: article.id.toString(),
        url: audioUrl,
        title: article.title,
        artist: 'Sports Mockery',
        artwork: 'https://sportsmockery.com/logo.png', // You can customize this
      })

      await TrackPlayer.play()
    } catch (err) {
      console.error('Failed to load audio:', err)
      setError('Failed to load audio. Please try again.')
      setCurrentArticle(null)
    } finally {
      setIsLoading(false)
    }
  }, [selectedVoice])

  // Toggle play/pause
  const togglePlayPause = useCallback(async () => {
    try {
      if (isPlaying) {
        await TrackPlayer.pause()
      } else {
        await TrackPlayer.play()
      }
    } catch (err) {
      console.error('Error toggling playback:', err)
    }
  }, [isPlaying])

  // Stop playback
  const stop = useCallback(async () => {
    try {
      await TrackPlayer.stop()
      await TrackPlayer.reset()
    } catch (err) {
      console.warn('Error stopping audio:', err)
    }
    // Always clear state regardless of errors
    setCurrentArticle(null)
    setError(null)
  }, [])

  // Seek to position (in seconds for track player)
  const seek = useCallback(async (positionMs: number) => {
    try {
      await TrackPlayer.seekTo(positionMs / 1000)
    } catch (err) {
      console.error('Error seeking:', err)
    }
  }, [])

  // Set voice
  const setVoice = useCallback((voice: string) => {
    setSelectedVoice(voice)
    // If currently playing, reload with new voice
    if (currentArticle && isPlaying) {
      playArticle(currentArticle, voice)
    }
  }, [currentArticle, isPlaying, playArticle])

  // Play next article
  const playNext = useCallback(async (mode: 'team' | 'recent', team?: string) => {
    if (!currentArticle) return

    setIsLoading(true)
    try {
      const nextArticle = await api.getNextAudioArticle(
        currentArticle.id,
        mode,
        team
      )

      if (nextArticle) {
        await playArticle(nextArticle)
      } else {
        setError('No more articles in playlist')
      }
    } catch (err) {
      console.error('Failed to get next article:', err)
      setError('Failed to load next article')
    } finally {
      setIsLoading(false)
    }
  }, [currentArticle, playArticle])

  return (
    <AudioPlayerContext.Provider
      value={{
        currentArticle,
        isPlaying,
        isLoading,
        progress: position * 1000, // Convert to milliseconds for consistency
        duration: duration * 1000, // Convert to milliseconds for consistency
        selectedVoice,
        error,
        playArticle,
        togglePlayPause,
        stop,
        seek,
        setVoice,
        playNext,
      }}
    >
      {children}
    </AudioPlayerContext.Provider>
  )
}

export function useAudioPlayer() {
  const context = useContext(AudioPlayerContext)
  if (!context) {
    throw new Error('useAudioPlayer must be used within AudioPlayerProvider')
  }
  return context
}
