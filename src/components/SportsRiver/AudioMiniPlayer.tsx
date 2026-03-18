'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAudioPlayer } from '@/context/AudioPlayerContext';

// Voice labels must stay in sync with AudioPlayerContext.voice
const VOICES = ['Will', 'Brian', 'Team Voice', 'Scout'] as const;

export default function AudioMiniPlayer() {
  const audio = useAudioPlayer();
  const [voiceOpen, setVoiceOpen] = useState(false);

  // Show mini player whenever audio is active — persists across page navigation
  const visible = !!(audio.isPlaying || audio.currentArticle);
  const progress = audio.duration > 0 ? (audio.currentTime / audio.duration) * 100 : 0;

  const formatTime = (s: number) => {
    if (!s || !isFinite(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <>
    <AnimatePresence>
      {visible && (
        <motion.div
          role="region"
          aria-label="Audio player"
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="audio-mini-player-wrapper"
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 1100,
            display: 'flex',
            justifyContent: 'center',
            padding: '12px 16px',
          }}
        >
          {/* Same pill bar as article page: white bg, gray play, time | progress | duration, voice, next, dismiss */}
          <div
            className="audio-mini-player-bar flex items-center gap-3 rounded-full px-2 py-1.5 w-full max-w-[680px] min-h-[52px]"
            style={{
              backgroundColor: 'var(--mini-player-bg, #fff)',
              border: '1px solid var(--mini-player-border, rgba(11,15,20,0.12))',
              boxShadow: 'var(--mini-player-shadow, 0 4px 20px rgba(0,0,0,0.08))',
            }}
          >
            {/* Play/Pause — gray circle like article */}
            <button
              onClick={() => audio.isPlaying ? audio.pause() : audio.resume()}
              aria-label={audio.isPlaying ? 'Pause' : 'Play'}
              className="shrink-0 flex items-center justify-center rounded-full transition-transform hover:scale-105"
              style={{
                width: 38,
                height: 38,
                backgroundColor: 'var(--mini-player-btn-bg, #d1d5db)',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              {audio.isPlaying ? (
                <svg className="w-4 h-4" fill="#FAFAFB" viewBox="0 0 24 24">
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                </svg>
              ) : (
                <svg className="w-4 h-4 ml-0.5" fill="#FAFAFB" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7L8 5z" />
                </svg>
              )}
            </button>

            {/* Current time */}
            <span
              className="text-[12px] font-medium tabular-nums shrink-0 mini-player-fg"
              style={{ minWidth: 36 }}
            >
              {formatTime(audio.currentTime)}
            </span>

            {/* Progress bar — same as article */}
            <div
              className="flex-1 h-[5px] rounded-full relative min-w-0 mini-player-track"
              style={{ backgroundColor: 'var(--mini-player-track-bg, rgba(11,15,20,0.08))' }}
            >
              <div
                className="h-[5px] rounded-full transition-all duration-100"
                style={{ width: `${progress}%`, backgroundColor: '#BC0000' }}
              />
            </div>

            {/* Duration */}
            <span
              className="text-[12px] font-medium tabular-nums shrink-0 mini-player-muted"
              style={{ minWidth: 36 }}
            >
              {formatTime(audio.duration)}
            </span>

            {/* Voice selector — pill with icon + label like article */}
            <div className="relative shrink-0">
              <button
                onClick={() => setVoiceOpen(!voiceOpen)}
                aria-label="Change voice"
                className="mini-player-fg flex items-center gap-1 rounded-full px-2.5 py-1 transition-colors hover:opacity-80"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
                </svg>
                <span className="text-[11px] font-medium">{audio.voice}</span>
                <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {voiceOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setVoiceOpen(false)} aria-hidden />
                  <div
                    className="absolute right-0 bottom-full mb-2 z-50 w-44 rounded-xl shadow-xl overflow-hidden mini-player-dropdown"
                    style={{ backgroundColor: 'var(--mini-player-bg, #fff)', border: '1px solid var(--mini-player-border, rgba(11,15,20,0.1))' }}
                  >
                    <div className="p-1.5 mini-player-fg">
                      <div className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1.5 mini-player-muted">Voice</div>
                      {VOICES.map((v) => (
                        <button
                          key={v}
                          onClick={() => { audio.setVoice(v); setVoiceOpen(false); }}
                          className="w-full text-left px-2.5 py-2 rounded-lg text-[13px] transition-colors hover:bg-[rgba(11,15,20,0.04)]"
                          style={audio.voice === v ? { backgroundColor: 'rgba(188,0,0,0.06)', color: '#BC0000' } : {}}
                        >
                          <span className="font-medium">{v}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Next */}
            <button
              onClick={audio.playNext}
              aria-label="Next article"
              className="mini-player-fg shrink-0 flex items-center justify-center rounded-full transition-colors hover:opacity-80 disabled:opacity-30"
              style={{ width: 32, height: 32 }}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
              </svg>
            </button>

            {/* Dismiss */}
            <button
              onClick={audio.stop}
              aria-label="Dismiss player"
              className="mini-player-fg shrink-0 flex items-center justify-center rounded-full transition-colors hover:opacity-80"
              style={{ width: 32, height: 32 }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
    {visible && (
      <style>{`
        .audio-mini-player-bar {
          --mini-player-bg: #fff;
          --mini-player-border: rgba(11,15,20,0.12);
          --mini-player-shadow: 0 4px 20px rgba(0,0,0,0.08);
          --mini-player-btn-bg: #d1d5db;
          --mini-player-track-bg: rgba(11,15,20,0.08);
        }
        .audio-mini-player-bar .mini-player-fg { color: #0B0F14; }
        .audio-mini-player-bar .mini-player-muted { color: rgba(11,15,20,0.4); }
        .dark .audio-mini-player-bar {
          --mini-player-bg: #0B0F14;
          --mini-player-border: rgba(250,250,251,0.12);
          --mini-player-shadow: 0 4px 20px rgba(0,0,0,0.3);
          --mini-player-btn-bg: rgba(250,250,251,0.2);
          --mini-player-track-bg: rgba(250,250,251,0.12);
        }
        .dark .audio-mini-player-bar .mini-player-fg { color: #FAFAFB; }
        .dark .audio-mini-player-bar .mini-player-muted { color: rgba(250,250,251,0.5); }
        @media (max-width: 768px) {
          .audio-mini-player-wrapper {
            bottom: calc(56px + env(safe-area-inset-bottom, 0px)) !important;
          }
          .feed-container {
            padding-bottom: 128px !important;
          }
        }
      `}</style>
    )}
    </>
  );
}
