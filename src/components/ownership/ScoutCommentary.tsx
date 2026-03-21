'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'

interface ScoutCommentaryProps {
  teamSlug?: string
}

interface CommentaryData {
  commentary: string
  speech_text?: string
  angle: number
  angle_name: string
  team?: string
}

const DATALAB_URL = 'https://datalab.sportsmockery.com'
const TOTAL_ANGLES = 3

function getCacheKey(teamSlug: string | undefined, angle: number) {
  return `scout_owner_${teamSlug || 'all'}_${angle}`
}

export default function ScoutCommentary({ teamSlug }: ScoutCommentaryProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<CommentaryData | null>(null)
  const [displayedText, setDisplayedText] = useState('')
  const [isTalking, setIsTalking] = useState(false)
  const [currentAngle, setCurrentAngle] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [audioLoading, setAudioLoading] = useState(false)
  const [audioProgress, setAudioProgress] = useState(0)
  const [audioDuration, setAudioDuration] = useState(0)
  const animFrameRef = useRef<number | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const textRef = useRef<HTMLDivElement>(null)
  const fetchingAudioRef = useRef(false)

  const fetchSingle = useCallback(async (angle: number): Promise<CommentaryData | null> => {
    const cacheKey = getCacheKey(teamSlug, angle)
    const cached = sessionStorage.getItem(cacheKey)
    if (cached) {
      try { return JSON.parse(cached) as CommentaryData } catch { /* miss */ }
    }
    try {
      const params = new URLSearchParams()
      if (teamSlug) params.set('team', teamSlug)
      params.set('angle', String(angle))
      const res = await fetch(`${DATALAB_URL}/api/scout/owner-commentary?${params}`)
      if (!res.ok) throw new Error('Failed')
      const json = await res.json()
      const result: CommentaryData = {
        commentary: json.commentary || json.data?.commentary || '',
        speech_text: json.speech_text || json.data?.speech_text || '',
        angle: json.angle?.index ?? json.angle ?? angle,
        angle_name: json.angle?.label || json.angle_name || json.data?.angle_name || '',
        team: json.team || teamSlug,
      }
      sessionStorage.setItem(cacheKey, JSON.stringify(result))
      return result
    } catch {
      return null
    }
  }, [teamSlug])

  const showCommentary = useCallback((result: CommentaryData, angle: number) => {
    setData(result)
    setCurrentAngle(angle)
    setLoading(false)
    animateText(result.commentary)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchCommentary = useCallback(async (angle: number) => {
    const cacheKey = getCacheKey(teamSlug, angle)
    const cached = sessionStorage.getItem(cacheKey)
    if (cached) {
      try { showCommentary(JSON.parse(cached), angle); return } catch { /* miss */ }
    }
    setLoading(true)
    setDisplayedText('')
    setData(null)
    const result = await fetchSingle(angle)
    if (result) {
      showCommentary(result, angle)
    } else {
      setLoading(false)
      const fallback: CommentaryData = {
        commentary: 'Scout is warming up — commentary is loading. Hit "Another Take" to try again, or check back shortly.',
        angle, angle_name: '', team: teamSlug,
      }
      setData(fallback)
      setDisplayedText(fallback.commentary)
    }
  }, [teamSlug, fetchSingle, showCommentary])

  const animateText = useCallback((fullText: string) => {
    setLoading(false)
    setIsTalking(true)
    setDisplayedText('')
    let charIndex = 0
    const charsPerFrame = 2
    const intervalMs = 22
    const tick = () => {
      charIndex += charsPerFrame
      if (charIndex >= fullText.length) { setDisplayedText(fullText); setIsTalking(false); return }
      setDisplayedText(fullText.slice(0, charIndex))
      animFrameRef.current = window.setTimeout(tick, intervalMs)
    }
    if (animFrameRef.current) clearTimeout(animFrameRef.current)
    animFrameRef.current = window.setTimeout(tick, 300)
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => { setIsOpen(true); fetchCommentary(0) }, 1500)
    return () => clearTimeout(timer)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => { return () => { if (animFrameRef.current) clearTimeout(animFrameRef.current); if (audioRef.current) { audioRef.current.pause(); audioRef.current = null } } }, [])

  useEffect(() => { if (textRef.current && isTalking) textRef.current.scrollTop = textRef.current.scrollHeight }, [displayedText, isTalking])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    const onTime = () => { setAudioProgress(audio.currentTime); setAudioDuration(audio.duration || 0) }
    audio.addEventListener('timeupdate', onTime)
    return () => audio.removeEventListener('timeupdate', onTime)
  }, [playing])

  const stopAudio = useCallback(() => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null }
    setPlaying(false); setAudioProgress(0); setAudioDuration(0); fetchingAudioRef.current = false
  }, [])

  const handleAnotherTake = () => {
    if (animFrameRef.current) clearTimeout(animFrameRef.current)
    stopAudio()
    setDisplayedText(''); setIsTalking(false)
    fetchCommentary((currentAngle + 1) % TOTAL_ANGLES)
  }

  const handleToggle = () => {
    if (isOpen) { setIsOpen(false); if (animFrameRef.current) clearTimeout(animFrameRef.current); setIsTalking(false) }
    else { setIsOpen(true); if (!data && !loading) fetchCommentary(currentAngle) }
  }

  const handleClose = () => {
    setIsOpen(false); if (animFrameRef.current) clearTimeout(animFrameRef.current); stopAudio(); setIsTalking(false)
  }

  const handleSkip = () => {
    if (animFrameRef.current) clearTimeout(animFrameRef.current)
    if (data) { setDisplayedText(data.commentary); setIsTalking(false) }
  }

  const handlePlayVoice = async () => {
    if (!data?.commentary) return
    if (playing && audioRef.current) { audioRef.current.pause(); setPlaying(false); return }
    if (fetchingAudioRef.current) return
    fetchingAudioRef.current = true
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null }

    const audioCacheKey = `scout-audio-${teamSlug || 'all'}-${currentAngle}`
    let audioUrl = sessionStorage.getItem(audioCacheKey)

    if (!audioUrl) {
      setAudioLoading(true)
      try {
        // Use speech_text for TTS (numbers/symbols converted for natural reading)
        const ttsText = data.speech_text || data.commentary
        const res = await fetch('/api/scout/speak', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: ttsText }),
        })
        if (!res.ok) throw new Error('TTS failed')
        const blob = await res.blob()
        audioUrl = URL.createObjectURL(blob)
        sessionStorage.setItem(audioCacheKey, audioUrl)
      } catch (err) {
        console.error('Scout TTS failed:', err)
        setAudioLoading(false); fetchingAudioRef.current = false; return
      }
      setAudioLoading(false)
    }

    const audio = new Audio(audioUrl)
    audioRef.current = audio
    audio.onended = () => { setPlaying(false); setAudioProgress(0) }
    audio.onerror = () => { setPlaying(false); fetchingAudioRef.current = false }
    await audio.play()
    setPlaying(true)
    fetchingAudioRef.current = false
  }

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !audioDuration) return
    const rect = e.currentTarget.getBoundingClientRect()
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    audioRef.current.currentTime = pct * audioDuration
  }

  const fmtTime = (s: number) => { const m = Math.floor(s / 60); const sec = Math.floor(s % 60); return `${m}:${sec < 10 ? '0' : ''}${sec}` }

  const paragraphs = displayedText.split('\n\n').filter(Boolean)
  const progressPct = audioDuration > 0 ? (audioProgress / audioDuration) * 100 : 0

  return (
    <>
      {/* Scout icon */}
      <button onClick={handleToggle} style={{ position: 'fixed', bottom: 20, right: 20, width: 96, height: 96, borderRadius: '50%', border: '3px solid rgba(0,212,255,0.3)', backgroundColor: 'var(--sm-card)', cursor: 'pointer', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, boxShadow: '0 4px 24px rgba(0,0,0,0.3)', animation: (isTalking || playing) ? 'scout-bob 0.6s ease-in-out infinite' : 'none' }} aria-label="Scout Commentary">
        <Image src="/downloads/scout-v2.png" alt="Scout AI" width={72} height={72} style={{ borderRadius: '50%', objectFit: 'contain', animation: (isTalking || playing) ? 'scout-talk 0.4s ease-in-out infinite alternate' : 'none' }} />
      </button>

      {/* Speech bubble */}
      {isOpen && (
        <div style={{ position: 'fixed', bottom: 40, right: 126, width: 400, maxHeight: '70vh', borderRadius: '16px 16px 0 16px', backgroundColor: 'var(--sm-card)', border: '1px solid var(--sm-border)', boxShadow: '0 8px 40px rgba(0,0,0,0.15)', zIndex: 9998, display: 'flex', flexDirection: 'column', overflow: 'hidden' }} className="scout-commentary-bubble">
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderBottom: '1px solid var(--sm-border)', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 20, fontWeight: 800, color: 'var(--sm-text)' }}>Scout</span>
              {data?.angle_name && <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 4, backgroundColor: 'rgba(0,212,255,0.12)', color: '#00D4FF', lineHeight: 1 }}>{data.angle_name}</span>}
              {isTalking && <span style={{ fontSize: 11, color: '#00D4FF', fontWeight: 500 }}>speaking...</span>}
            </div>
            <button onClick={handleClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--sm-text-muted)', padding: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }} aria-label="Close">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
            </button>
          </div>

          {/* Body */}
          <div ref={textRef} style={{ flex: 1, overflowY: 'auto', padding: '14px', fontSize: 13, color: 'var(--sm-text)', lineHeight: 1.65 }}>
            {loading ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#00D4FF' }}>
                <span>Scout is reviewing the grades</span>
                <span className="scout-typing-dots"><span>.</span><span>.</span><span>.</span></span>
              </div>
            ) : paragraphs.length > 0 ? paragraphs.map((p, i) => (
              <p key={i} style={{ margin: i < paragraphs.length - 1 ? '0 0 10px' : 0 }}>{p}</p>
            )) : null}
          </div>

          {/* Embedded Audio Player */}
          {(playing || audioLoading || audioProgress > 0) && (
            <div style={{ padding: '8px 14px', borderTop: '1px solid var(--sm-border)', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button onClick={handlePlayVoice} style={{ width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--sm-surface)', border: '1px solid var(--sm-border)', color: playing ? '#BC0000' : 'var(--sm-text-muted)', cursor: 'pointer', padding: 0, flexShrink: 0 }}>
                  {playing ? <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" /></svg> : <svg width="12" height="14" viewBox="0 0 20 24" fill="none"><path d="M2 1L18 12L2 23V1Z" fill="currentColor" /></svg>}
                </button>
                <div onClick={handleSeek} style={{ flex: 1, height: 4, borderRadius: 2, backgroundColor: 'var(--sm-border)', cursor: 'pointer', position: 'relative' }}>
                  <div style={{ height: '100%', width: `${progressPct}%`, borderRadius: 2, backgroundColor: '#00D4FF', transition: 'width 0.1s linear' }} />
                </div>
                {audioDuration > 0 && <span style={{ fontSize: 10, color: 'var(--sm-text-dim)', flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}>{fmtTime(audioProgress)} / {fmtTime(audioDuration)}</span>}
              </div>
            </div>
          )}

          {/* Footer */}
          <div style={{ padding: '8px 14px', borderTop: '1px solid var(--sm-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {isTalking && <button onClick={handleSkip} style={{ fontSize: 12, fontWeight: 500, color: 'var(--sm-text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0' }}>Skip to end</button>}
              {!playing && !audioLoading && audioProgress === 0 && data?.commentary && !loading && (
                <button onClick={handlePlayVoice} disabled={audioLoading} style={{ width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', backgroundColor: 'var(--sm-surface)', border: '1px solid var(--sm-border)', color: 'var(--sm-text-muted)', padding: 0, flexShrink: 0, opacity: audioLoading ? 0.4 : 1 }} aria-label="Play">
                  {audioLoading ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="scout-spin"><circle cx="12" cy="12" r="10" strokeDasharray="50" strokeDashoffset="15" /></svg> : <svg width="14" height="16" viewBox="0 0 20 24" fill="none"><path d="M2 1L18 12L2 23V1Z" fill="currentColor" /></svg>}
                </button>
              )}
            </div>
            <button onClick={handleAnotherTake} disabled={loading} style={{ fontSize: 12, fontWeight: 600, color: '#00D4FF', background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: 8, padding: '6px 14px', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 5, lineHeight: 1, opacity: loading ? 0.5 : 1 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 4v6h6M23 20v-6h-6" /><path d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15" /></svg>
              Another Take
            </button>
          </div>

          {/* Tail */}
          <div style={{ position: 'absolute', bottom: 12, right: -8, width: 0, height: 0, borderLeft: '8px solid var(--sm-card)', borderTop: '6px solid transparent', borderBottom: '6px solid transparent' }} />
        </div>
      )}

      <style>{`
        @keyframes scout-bob { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
        @keyframes scout-talk { 0% { transform: scale(1) rotate(0deg); } 50% { transform: scale(1.06) rotate(1deg); } 100% { transform: scale(1) rotate(-1deg); } }
        .scout-typing-dots span { animation: scout-dot-blink 1.4s infinite; opacity: 0; }
        .scout-typing-dots span:nth-child(2) { animation-delay: 0.2s; }
        .scout-typing-dots span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes scout-dot-blink { 0%, 20% { opacity: 0; } 50% { opacity: 1; } 100% { opacity: 0; } }
        .scout-spin { animation: scout-spinner 1s linear infinite; }
        @keyframes scout-spinner { 100% { transform: rotate(360deg); } }
        @media (max-width: 640px) {
          .scout-commentary-bubble { right: 12px !important; left: 12px !important; width: auto !important; bottom: 126px !important; border-radius: 16px !important; max-height: 45vh !important; }
        }
      `}</style>
    </>
  )
}
