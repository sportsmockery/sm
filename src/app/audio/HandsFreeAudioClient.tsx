'use client'

import { useState, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useAudioPlayer } from '@/context/AudioPlayerContext'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface LatestArticle {
  id: number
  title: string
  slug: string
  excerpt: string | null
  featured_image: string | null
  published_at: string
  category_slug: string
  team_key: string
  team_name: string
}

type PlaybackMode = 'team' | 'recent'
type VoiceId = 'will' | 'brian' | 'sarah' | 'laura'

interface VoiceOption {
  id: VoiceId
  name: string
  description: string
}

const VOICES: VoiceOption[] = [
  { id: 'will', name: 'Will', description: 'Young male, energetic' },
  { id: 'brian', name: 'Brian', description: 'Mature male, authoritative' },
  { id: 'sarah', name: 'Sarah', description: 'Young female, expressive' },
  { id: 'laura', name: 'Laura', description: 'Young female, warm' },
]

interface HandsFreeAudioClientProps {
  latestByTeam: LatestArticle[]
  overallLatest: LatestArticle | null
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function HandsFreeAudioClient({
  latestByTeam,
  overallLatest,
}: HandsFreeAudioClientProps) {
  const audio = useAudioPlayer()

  const [selectedTeam, setSelectedTeam] = useState<string | null>(null)
  const [playbackMode, setPlaybackMode] = useState<PlaybackMode>('recent')
  const [selectedVoice, setSelectedVoice] = useState<VoiceId>('will')
  const [isStarting, setIsStarting] = useState(false)

  // Determine starting article based on selection
  const startingArticle = selectedTeam
    ? latestByTeam.find(a => a.team_key === selectedTeam)
    : overallLatest

  const buildAudioUrl = useCallback((slug: string, voice: VoiceId) => {
    return `/api/audio/${encodeURIComponent(slug)}?voice=${voice}`
  }, [])

  const handleStart = useCallback(async () => {
    if (!startingArticle) return
    setIsStarting(true)

    try {
      // Start playing with the global audio context
      audio.play(
        {
          title: startingArticle.title,
          slug: startingArticle.slug,
          url: buildAudioUrl(startingArticle.slug, selectedVoice),
        },
        selectedVoice
      )

      // Set cardOutOfView so the mini player shows immediately
      audio.setCardOutOfView(true)

      // Fetch next articles for the queue based on mode
      const mode = selectedTeam ? 'team' : playbackMode
      const team = selectedTeam || startingArticle.team_key
      const queueArticles = []

      // Pre-load a few articles into the queue for continuous playback
      let currentId = startingArticle.id
      for (let i = 0; i < 5; i++) {
        try {
          const res = await fetch(
            `/api/audio/next?articleId=${currentId}&mode=${mode}&team=${team}`
          )
          if (!res.ok) break
          const data = await res.json()
          if (!data?.article) break

          queueArticles.push({
            title: data.article.title,
            slug: data.article.slug,
            url: buildAudioUrl(data.article.slug, selectedVoice),
          })
          currentId = data.article.id
        } catch {
          break
        }
      }

      if (queueArticles.length > 0) {
        audio.setQueue(queueArticles)
      }
    } finally {
      setIsStarting(false)
    }
  }, [startingArticle, selectedVoice, selectedTeam, playbackMode, audio, buildAudioUrl])

  const isCurrentlyPlaying = audio.isPlaying && audio.currentArticle

  return (
    <div style={{ minHeight: '100vh', background: 'var(--hp-background)', color: 'var(--hp-foreground)' }}>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px 96px' }}>

        {/* Header */}
        <div style={{ marginBottom: 48 }}>
          <div className="flex items-center gap-3 mb-4">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl"
              style={{ backgroundColor: 'rgba(0, 212, 255, 0.1)', border: '1px solid rgba(0, 212, 255, 0.2)' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00D4FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
                <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold" style={{ color: 'var(--hp-foreground)' }}>
                Hands-Free Audio
              </h1>
              <p className="text-sm" style={{ color: 'var(--hp-muted-foreground)' }}>
                Listen to Chicago sports articles read aloud — continuously.
              </p>
            </div>
          </div>
        </div>

        {/* Currently Playing Banner */}
        {isCurrentlyPlaying && (
          <div
            className="mb-8 rounded-xl p-4"
            style={{
              background: 'rgba(0, 212, 255, 0.06)',
              border: '1px solid rgba(0, 212, 255, 0.15)',
            }}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full" style={{ backgroundColor: '#BC0000' }}>
                <svg width="12" height="14" viewBox="0 0 20 24" fill="white">
                  <rect x="2" y="2" width="5" height="20" rx="1" />
                  <rect x="13" y="2" width="5" height="20" rx="1" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium" style={{ color: '#00D4FF' }}>Now Playing</p>
                <p className="text-sm font-semibold truncate" style={{ color: 'var(--hp-foreground)' }}>
                  {audio.currentArticle?.title}
                </p>
              </div>
              <button
                onClick={audio.stop}
                className="rounded-lg px-3 py-1.5 text-xs font-medium"
                style={{ backgroundColor: 'var(--hp-muted)', color: 'var(--hp-foreground)', border: '1px solid var(--hp-border)' }}
              >
                Stop
              </button>
            </div>
          </div>
        )}

        {/* Step 1: Pick a Team */}
        <section className="mb-10">
          <h2 className="text-base font-semibold mb-1" style={{ color: 'var(--hp-foreground)' }}>
            1. Start from a team — or play the latest
          </h2>
          <p className="text-sm mb-4" style={{ color: 'var(--hp-muted-foreground)' }}>
            Pick a team to start with their latest article, or leave unselected to start from the most recent article across all teams.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {/* "Latest" option */}
            <button
              onClick={() => setSelectedTeam(null)}
              className="rounded-xl p-4 text-left transition-all"
              style={{
                background: !selectedTeam ? 'rgba(0, 212, 255, 0.08)' : 'var(--hp-muted)',
                border: !selectedTeam ? '2px solid #00D4FF' : '1px solid var(--hp-border)',
              }}
            >
              <div className="text-sm font-semibold" style={{ color: !selectedTeam ? '#00D4FF' : 'var(--hp-foreground)' }}>
                Latest
              </div>
              <div className="text-xs mt-1" style={{ color: 'var(--hp-muted-foreground)' }}>
                Most recent article
              </div>
            </button>

            {/* Team options */}
            {latestByTeam.map(article => {
              const isSelected = selectedTeam === article.team_key
              return (
                <button
                  key={article.team_key}
                  onClick={() => setSelectedTeam(article.team_key)}
                  className="rounded-xl p-4 text-left transition-all"
                  style={{
                    background: isSelected ? 'rgba(188, 0, 0, 0.08)' : 'var(--hp-muted)',
                    border: isSelected ? '2px solid #BC0000' : '1px solid var(--hp-border)',
                  }}
                >
                  <div className="text-sm font-semibold" style={{ color: isSelected ? '#BC0000' : 'var(--hp-foreground)' }}>
                    {article.team_name.replace('Chicago ', '')}
                  </div>
                  <div className="text-xs mt-1 truncate" style={{ color: 'var(--hp-muted-foreground)' }}>
                    {article.title.length > 40 ? article.title.slice(0, 40) + '...' : article.title}
                  </div>
                </button>
              )
            })}
          </div>
        </section>

        {/* Step 2: Continuous Playback Mode */}
        <section className="mb-10">
          <h2 className="text-base font-semibold mb-1" style={{ color: 'var(--hp-foreground)' }}>
            2. Continuous playback
          </h2>
          <p className="text-sm mb-4" style={{ color: 'var(--hp-muted-foreground)' }}>
            After the first article finishes, what should play next?
          </p>

          <div className="flex gap-3">
            <button
              onClick={() => setPlaybackMode('team')}
              className="flex-1 rounded-xl p-4 text-left transition-all"
              style={{
                background: playbackMode === 'team' ? 'rgba(188, 0, 0, 0.08)' : 'var(--hp-muted)',
                border: playbackMode === 'team' ? '2px solid #BC0000' : '1px solid var(--hp-border)',
              }}
            >
              <div className="text-sm font-semibold" style={{ color: playbackMode === 'team' ? '#BC0000' : 'var(--hp-foreground)' }}>
                Same Team
              </div>
              <div className="text-xs mt-1" style={{ color: 'var(--hp-muted-foreground)' }}>
                Keep playing articles from the same team
              </div>
            </button>
            <button
              onClick={() => setPlaybackMode('recent')}
              className="flex-1 rounded-xl p-4 text-left transition-all"
              style={{
                background: playbackMode === 'recent' ? 'rgba(0, 212, 255, 0.08)' : 'var(--hp-muted)',
                border: playbackMode === 'recent' ? '2px solid #00D4FF' : '1px solid var(--hp-border)',
              }}
            >
              <div className="text-sm font-semibold" style={{ color: playbackMode === 'recent' ? '#00D4FF' : 'var(--hp-foreground)' }}>
                Recent
              </div>
              <div className="text-xs mt-1" style={{ color: 'var(--hp-muted-foreground)' }}>
                Play the next most recently published article
              </div>
            </button>
          </div>
        </section>

        {/* Step 3: Voice */}
        <section className="mb-10">
          <h2 className="text-base font-semibold mb-1" style={{ color: 'var(--hp-foreground)' }}>
            3. Choose a voice
          </h2>
          <p className="text-sm mb-4" style={{ color: 'var(--hp-muted-foreground)' }}>
            Select the voice you want reading to you.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {VOICES.map(voice => {
              const isSelected = selectedVoice === voice.id
              return (
                <button
                  key={voice.id}
                  onClick={() => setSelectedVoice(voice.id)}
                  className="rounded-xl p-4 text-left transition-all"
                  style={{
                    background: isSelected ? 'rgba(0, 212, 255, 0.08)' : 'var(--hp-muted)',
                    border: isSelected ? '2px solid #00D4FF' : '1px solid var(--hp-border)',
                  }}
                >
                  <div className="text-sm font-semibold" style={{ color: isSelected ? '#00D4FF' : 'var(--hp-foreground)' }}>
                    {voice.name}
                  </div>
                  <div className="text-xs mt-1" style={{ color: 'var(--hp-muted-foreground)' }}>
                    {voice.description}
                  </div>
                </button>
              )
            })}
          </div>
        </section>

        {/* Starting Article Preview */}
        {startingArticle && (
          <section className="mb-10">
            <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--hp-foreground)' }}>
              Starting with
            </h2>
            <div
              className="rounded-xl overflow-hidden"
              style={{ border: '1px solid var(--hp-border)', background: 'var(--hp-muted)' }}
            >
              {startingArticle.featured_image && (
                <div className="relative" style={{ aspectRatio: '16/7' }}>
                  <Image
                    src={startingArticle.featured_image}
                    alt={startingArticle.title}
                    fill
                    className="object-cover"
                    sizes="720px"
                  />
                </div>
              )}
              <div className="p-4">
                <span className="text-xs font-medium uppercase tracking-wider" style={{ color: '#BC0000' }}>
                  {startingArticle.team_name}
                </span>
                <h3 className="text-lg font-bold mt-1" style={{ color: 'var(--hp-foreground)' }}>
                  {startingArticle.title}
                </h3>
                {startingArticle.excerpt && (
                  <p className="text-sm mt-2 line-clamp-2" style={{ color: 'var(--hp-muted-foreground)' }}>
                    {startingArticle.excerpt}
                  </p>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Start Button */}
        <div className="flex justify-center">
          <button
            onClick={handleStart}
            disabled={!startingArticle || isStarting}
            className="inline-flex items-center gap-3 rounded-full px-8 py-4 text-base font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: '#BC0000',
              color: '#FAFAFB',
              border: '2px solid transparent',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 212, 255, 0.25), 0 0 6px rgba(0, 212, 255, 0.15)'
              e.currentTarget.style.borderColor = 'rgba(0, 212, 255, 0.5)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = 'none'
              e.currentTarget.style.borderColor = 'transparent'
            }}
          >
            {isStarting ? (
              <>
                <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Loading...
              </>
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
                Start Listening
              </>
            )}
          </button>
        </div>

        {/* Info note */}
        <p className="text-center text-xs mt-6" style={{ color: 'var(--hp-muted-foreground)' }}>
          Audio keeps playing as you browse the site. A mini player will appear at the bottom of the screen — stop it anytime and it disappears.
        </p>
      </div>
    </div>
  )
}
