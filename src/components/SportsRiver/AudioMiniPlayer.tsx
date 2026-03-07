'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAudioPlayer } from '@/context/AudioPlayerContext';

const VOICES = ['Voice A', 'Voice B', 'Team Voice'] as const;

export default function AudioMiniPlayer() {
  const audio = useAudioPlayer();
  const [voiceOpen, setVoiceOpen] = useState(false);

  const visible = (audio.isPlaying || audio.currentArticle) && audio.cardOutOfView;
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
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 680,
              height: 64,
              background: 'rgba(27, 36, 48, 0.95)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              borderTop: '1px solid #2B3442',
              boxShadow: '0 -8px 32px rgba(0,0,0,0.4)',
              display: 'flex',
              alignItems: 'center',
              padding: '0 12px',
              gap: 12,
            }}
          >
            {/* Play/Pause */}
            <button
              onClick={() => audio.isPlaying ? audio.pause() : audio.resume()}
              aria-label={audio.isPlaying ? 'Pause' : 'Play'}
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                backgroundColor: '#BC0000',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {audio.isPlaying ? (
                <svg width="16" height="16" viewBox="0 0 20 20" fill="white">
                  <rect x="4" y="3" width="4" height="14" rx="1" />
                  <rect x="12" y="3" width="4" height="14" rx="1" />
                </svg>
              ) : (
                <svg width="14" height="16" viewBox="0 0 20 24" fill="none">
                  <path d="M0 0L20 12L0 24V0Z" fill="white" />
                </svg>
              )}
            </button>

            {/* Title + Progress */}
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 4 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: '#FAFAFB',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    flex: 1,
                  }}
                >
                  {audio.currentArticle?.title ?? 'Now Playing'}
                </span>
                <span style={{ fontSize: 11, color: '#8899AA', flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}>
                  {formatTime(audio.currentTime)}{audio.duration > 0 ? ` / ${formatTime(audio.duration)}` : ''}
                </span>
              </div>
              {/* Progress bar */}
              <div style={{ height: 2, borderRadius: 1, backgroundColor: '#2B3442', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${progress}%`,
                    backgroundColor: '#BC0000',
                    borderRadius: 1,
                    transition: 'width 0.3s linear',
                  }}
                />
              </div>
            </div>

            {/* Voice selector */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <button
                onClick={() => setVoiceOpen(!voiceOpen)}
                aria-label="Change voice"
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  backgroundColor: voiceOpen ? 'rgba(255,255,255,0.1)' : 'transparent',
                  border: '1px solid #2B3442',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#8899AA',
                }}
              >
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4M12 15a3 3 0 003-3V5a3 3 0 00-6 0v7a3 3 0 003 3z" />
                </svg>
              </button>
              {voiceOpen && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: '100%',
                    right: 0,
                    marginBottom: 8,
                    background: 'rgba(18, 24, 33, 0.98)',
                    border: '1px solid #2B3442',
                    borderRadius: 10,
                    padding: 4,
                    minWidth: 120,
                    boxShadow: '0 -4px 16px rgba(0,0,0,0.4)',
                  }}
                >
                  {VOICES.map(v => (
                    <button
                      key={v}
                      onClick={() => { audio.setVoice(v); setVoiceOpen(false); }}
                      style={{
                        display: 'block',
                        width: '100%',
                        padding: '6px 10px',
                        fontSize: 12,
                        fontWeight: audio.voice === v ? 700 : 400,
                        color: audio.voice === v ? '#FAFAFB' : '#8899AA',
                        backgroundColor: audio.voice === v ? 'rgba(188, 0, 0, 0.2)' : 'transparent',
                        border: 'none',
                        borderRadius: 6,
                        cursor: 'pointer',
                        textAlign: 'left',
                      }}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Next */}
            <button
              onClick={audio.playNext}
              aria-label="Next article"
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                backgroundColor: 'transparent',
                border: '1px solid #2B3442',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#8899AA',
                flexShrink: 0,
                opacity: audio.queue.length > 0 ? 1 : 0.4,
              }}
            >
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                <path d="M5 5v14l11-7L5 5zm13 0v14h2V5h-2z" />
              </svg>
            </button>

            {/* Dismiss */}
            <button
              onClick={audio.stop}
              aria-label="Dismiss player"
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#8899AA',
                flexShrink: 0,
              }}
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
    {visible && (
      <style>{`
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
