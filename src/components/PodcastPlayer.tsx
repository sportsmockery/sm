'use client'

import { useState, useRef, useEffect } from 'react'

interface PodcastPlayerProps {
  title: string
  articleTitle: string
  duration: string // e.g., "5:32"
  audioUrl?: string
  onPlay?: () => void
  onPause?: () => void
}

export default function PodcastPlayer({
  title = 'AI Narration',
  articleTitle,
  duration = '5:32',
  audioUrl,
  onPlay,
  onPause,
}: PodcastPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [totalDuration, setTotalDuration] = useState(0)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [isExpanded, setIsExpanded] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  // Convert duration string to seconds
  useEffect(() => {
    const parts = duration.split(':')
    const seconds = parseInt(parts[0]) * 60 + parseInt(parts[1])
    setTotalDuration(seconds)
  }, [duration])

  // Simulate playback progress
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isPlaying && currentTime < totalDuration) {
      interval = setInterval(() => {
        setCurrentTime(prev => {
          const next = prev + playbackSpeed
          if (next >= totalDuration) {
            setIsPlaying(false)
            return totalDuration
          }
          return next
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isPlaying, currentTime, totalDuration, playbackSpeed])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handlePlayPause = () => {
    if (!isLoaded) {
      // Simulate loading
      setIsLoaded(true)
    }
    setIsPlaying(!isPlaying)
    if (!isPlaying) {
      onPlay?.()
    } else {
      onPause?.()
    }
  }

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percentage = x / rect.width
    setCurrentTime(percentage * totalDuration)
  }

  const handleSpeedChange = () => {
    const speeds = [0.75, 1, 1.25, 1.5, 2]
    const currentIndex = speeds.indexOf(playbackSpeed)
    const nextIndex = (currentIndex + 1) % speeds.length
    setPlaybackSpeed(speeds[nextIndex])
  }

  const handleSkip = (seconds: number) => {
    setCurrentTime(prev => Math.max(0, Math.min(totalDuration, prev + seconds)))
  }

  const progress = totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0

  return (
    <div className="rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-800 overflow-hidden">
      {/* Compact header - always visible */}
      <div
        className="flex items-center gap-4 p-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {/* AI Voice badge */}
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/20">
          <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
          </svg>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-violet-400">{title}</span>
            <span className="rounded bg-violet-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-violet-300">
              AI Generated
            </span>
          </div>
          <p className="truncate font-semibold text-white">{articleTitle}</p>
          <p className="text-xs text-zinc-500">{duration} • Powered by Claude</p>
        </div>

        {/* Quick play button */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            handlePlayPause()
          }}
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all ${
            isPlaying
              ? 'bg-violet-500 text-white'
              : 'bg-white/10 text-white hover:bg-violet-500'
          }`}
        >
          {isPlaying ? (
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
            </svg>
          ) : (
            <svg className="h-5 w-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        {/* Expand indicator */}
        <svg
          className={`h-5 w-5 text-zinc-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </div>

      {/* Progress bar - always visible */}
      <div
        className="h-1 cursor-pointer bg-zinc-700"
        onClick={handleSeek}
      >
        <div
          className="h-full bg-gradient-to-r from-violet-500 to-purple-500 transition-all duration-200"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Expanded controls */}
      <div
        className={`overflow-hidden transition-all duration-300 ${
          isExpanded ? 'max-h-60' : 'max-h-0'
        }`}
      >
        <div className="border-t border-zinc-800 p-4">
          {/* Time display */}
          <div className="mb-4 flex items-center justify-between text-xs">
            <span className="text-zinc-400">{formatTime(currentTime)}</span>
            <span className="text-zinc-400">-{formatTime(totalDuration - currentTime)}</span>
          </div>

          {/* Waveform visualization */}
          <div className="mb-4 flex h-12 items-center justify-center gap-0.5">
            {[...Array(40)].map((_, i) => {
              const height = Math.random() * 100
              const isActive = (i / 40) * 100 <= progress
              return (
                <div
                  key={i}
                  className={`w-1 rounded-full transition-all ${
                    isActive ? 'bg-violet-500' : 'bg-zinc-700'
                  }`}
                  style={{
                    height: `${20 + height * 0.8}%`,
                    opacity: isPlaying ? (isActive ? 1 : 0.5) : 0.7,
                  }}
                />
              )
            })}
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4">
            {/* Skip back */}
            <button
              onClick={() => handleSkip(-15)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 16.811c0 .864-.933 1.405-1.683.977l-7.108-4.062a1.125 1.125 0 010-1.953l7.108-4.062A1.125 1.125 0 0121 8.688v8.123zM11.25 16.811c0 .864-.933 1.405-1.683.977l-7.108-4.062a1.125 1.125 0 010-1.953L9.567 7.71a1.125 1.125 0 011.683.977v8.123z" />
              </svg>
            </button>

            {/* Play/Pause */}
            <button
              onClick={handlePlayPause}
              className={`flex h-14 w-14 items-center justify-center rounded-full transition-all ${
                isPlaying
                  ? 'bg-violet-500 text-white shadow-lg shadow-violet-500/30'
                  : 'bg-white text-zinc-900 hover:bg-violet-500 hover:text-white'
              }`}
            >
              {isPlaying ? (
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                </svg>
              ) : (
                <svg className="h-6 w-6 ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>

            {/* Skip forward */}
            <button
              onClick={() => handleSkip(15)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8.688c0-.864.933-1.405 1.683-.977l7.108 4.062a1.125 1.125 0 010 1.953l-7.108 4.062A1.125 1.125 0 013 16.81V8.688zM12.75 8.688c0-.864.933-1.405 1.683-.977l7.108 4.062a1.125 1.125 0 010 1.953l-7.108 4.062a1.125 1.125 0 01-1.683-.977V8.688z" />
              </svg>
            </button>
          </div>

          {/* Speed control */}
          <div className="mt-4 flex items-center justify-center">
            <button
              onClick={handleSpeedChange}
              className="rounded-full bg-white/5 px-3 py-1 text-xs font-semibold text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
            >
              {playbackSpeed}x Speed
            </button>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="border-t border-zinc-800 bg-violet-500/5 px-4 py-2">
        <p className="text-center text-[10px] text-violet-300/60">
          Audio generated by AI. Quality may vary. For entertainment purposes.
        </p>
      </div>
    </div>
  )
}
