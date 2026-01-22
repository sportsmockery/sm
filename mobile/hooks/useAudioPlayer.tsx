import { createContext, useContext, useState, useCallback, useEffect, useRef, ReactNode } from 'react'
import { Audio, AVPlaybackStatus } from 'expo-av'
import { api } from '@/lib/api'

interface Article {
  id: number
  title: string
  slug: string
  team?: string
}

interface AudioPlayerContextType {
  currentArticle: Article | null
  isPlaying: boolean
  isLoading: boolean
  progress: number
  duration: number
  selectedVoice: string
  error: string | null
  playArticle: (article: Article, voice?: string) => Promise<void>
  togglePlayPause: () => Promise<void>
  stop: () => Promise<void>
  seek: (position: number) => Promise<void>
  setVoice: (voice: string) => void
  playNext: (mode: 'team' | 'recent', team?: string) => Promise<void>
}

const AudioPlayerContext = createContext<AudioPlayerContextType | null>(null)

export function AudioPlayerProvider({ children }: { children: ReactNode }) {
  const [currentArticle, setCurrentArticle] = useState<Article | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [selectedVoice, setSelectedVoice] = useState('will')
  const [error, setError] = useState<string | null>(null)

  const soundRef = useRef<Audio.Sound | null>(null)

  useEffect(() => {
    const configureAudio = async () => {
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
          shouldDuckAndroid: true,
        })
      } catch (err) {
        console.error('Error configuring audio:', err)
      }
    }
    configureAudio()

    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync()
      }
    }
  }, [])

  const onPlaybackStatusUpdate = useCallback((status: AVPlaybackStatus) => {
    if (!status.isLoaded) {
      if (status.error) {
        console.error('Playback error:', status.error)
        setError('Failed to play audio')
      }
      return
    }

    setIsPlaying(status.isPlaying)
    setProgress(status.positionMillis)
    setDuration(status.durationMillis || 0)

    if (status.didJustFinish) {
      setCurrentArticle(null)
      setIsPlaying(false)
      setProgress(0)
    }
  }, [])

  const playArticle = useCallback(async (article: Article, voice?: string) => {
    setIsLoading(true)
    setError(null)
    setCurrentArticle(article)

    const voiceToUse = voice || selectedVoice

    try {
      if (soundRef.current) {
        await soundRef.current.unloadAsync()
        soundRef.current = null
      }

      const audioUrl = api.getAudioUrl(article.slug, voiceToUse)

      const { sound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { shouldPlay: true },
        onPlaybackStatusUpdate
      )

      soundRef.current = sound
    } catch (err) {
      console.error('Failed to load audio:', err)
      setError('Failed to load audio. Please try again.')
      setCurrentArticle(null)
    } finally {
      setIsLoading(false)
    }
  }, [selectedVoice, onPlaybackStatusUpdate])

  const togglePlayPause = useCallback(async () => {
    if (!soundRef.current) return

    try {
      if (isPlaying) {
        await soundRef.current.pauseAsync()
      } else {
        await soundRef.current.playAsync()
      }
    } catch (err) {
      console.error('Error toggling playback:', err)
    }
  }, [isPlaying])

  const stop = useCallback(async () => {
    try {
      if (soundRef.current) {
        await soundRef.current.stopAsync()
        await soundRef.current.unloadAsync()
        soundRef.current = null
      }
    } catch (err) {
      console.warn('Error stopping audio:', err)
    }
    setCurrentArticle(null)
    setIsPlaying(false)
    setProgress(0)
    setDuration(0)
    setError(null)
  }, [])

  const seek = useCallback(async (positionMs: number) => {
    if (!soundRef.current) return

    try {
      await soundRef.current.setPositionAsync(positionMs)
    } catch (err) {
      console.error('Error seeking:', err)
    }
  }, [])

  const setVoice = useCallback((voice: string) => {
    setSelectedVoice(voice)
    if (currentArticle && isPlaying) {
      playArticle(currentArticle, voice)
    }
  }, [currentArticle, isPlaying, playArticle])

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
