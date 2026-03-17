// components/article/ArticleAudioPlayer.tsx
"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import type { ArticleMeta, NextArticleMode } from "@/lib/audioPlayer";

interface ArticleAudioPlayerProps {
  initialArticle: ArticleMeta;
  initialAudioUrl: string;
  articleContent?: string;
  /** Auto-start playback on mount (e.g. from feed "Listen" button) */
  autoPlay?: boolean;
}

interface PlaylistState {
  currentArticle: ArticleMeta;
  currentAudioUrl: string;
  mode: NextArticleMode;
}

// Voice profile configuration
type VoiceProfileId = 'will' | 'brian' | 'sarah' | 'laura';

interface VoiceProfile {
  id: VoiceProfileId;
  name: string;
  description: string;
}

const VOICE_PROFILES: VoiceProfile[] = [
  {
    id: 'will',
    name: 'Will',
    description: 'Young male, energetic',
  },
  {
    id: 'brian',
    name: 'Brian',
    description: 'Mature male, authoritative',
  },
  {
    id: 'sarah',
    name: 'Sarah',
    description: 'Young female, expressive',
  },
  {
    id: 'laura',
    name: 'Laura',
    description: 'Young female, warm',
  },
];

export function ArticleAudioPlayer({
  initialArticle,
  initialAudioUrl,
  autoPlay = false,
}: ArticleAudioPlayerProps) {
  const [playlist, setPlaylist] = useState<PlaylistState>({
    currentArticle: initialArticle,
    currentAudioUrl: initialAudioUrl,
    mode: "team",
  });
  const [isLoadingNext, setIsLoadingNext] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [selectedVoice, setSelectedVoice] = useState<VoiceProfileId>('will');
  const [showVoiceSelector, setShowVoiceSelector] = useState(false);

  // Use ref to DOM audio element for iOS compatibility
  const audioRef = useRef<HTMLAudioElement>(null);

  // Build audio URL with voice parameter
  const getAudioUrl = useCallback((slug: string, voice: VoiceProfileId) => {
    return `/api/audio/${encodeURIComponent(slug)}?voice=${voice}`;
  }, []);

  // Update Media Session metadata for lock screen controls
  const updateMediaSession = useCallback((article: ArticleMeta) => {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: article.title,
        artist: 'Sports Mockery',
        album: article.team || 'Chicago Sports',
        artwork: article.featuredImage ? [
          { src: article.featuredImage, sizes: '512x512', type: 'image/jpeg' }
        ] : []
      });
    }
  }, []);

  // Set up Media Session action handlers for lock screen controls
  useEffect(() => {
    if (!('mediaSession' in navigator)) return;

    const handlePlay = () => {
      audioRef.current?.play();
    };
    const handlePause = () => {
      audioRef.current?.pause();
    };
    const handleSeekBackward = () => {
      if (audioRef.current) {
        audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 10);
      }
    };
    const handleSeekForward = () => {
      if (audioRef.current) {
        audioRef.current.currentTime = Math.min(
          audioRef.current.duration || 0,
          audioRef.current.currentTime + 10
        );
      }
    };

    navigator.mediaSession.setActionHandler('play', handlePlay);
    navigator.mediaSession.setActionHandler('pause', handlePause);
    navigator.mediaSession.setActionHandler('seekbackward', handleSeekBackward);
    navigator.mediaSession.setActionHandler('seekforward', handleSeekForward);

    return () => {
      navigator.mediaSession.setActionHandler('play', null);
      navigator.mediaSession.setActionHandler('pause', null);
      navigator.mediaSession.setActionHandler('seekbackward', null);
      navigator.mediaSession.setActionHandler('seekforward', null);
    };
  }, []);

  // Initialize media session with current article
  useEffect(() => {
    updateMediaSession(playlist.currentArticle);
  }, [playlist.currentArticle, updateMediaSession]);

  // Auto-play on mount if requested (e.g. from feed "Listen" button)
  useEffect(() => {
    if (!autoPlay || !audioRef.current) return;
    const audio = audioRef.current;
    audio.src = getAudioUrl(initialArticle.slug, selectedVoice);
    setIsLoading(true);
    audio.play().catch(() => {
      setIsLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally run once on mount

  const handleModeChange = (mode: NextArticleMode) => {
    setPlaylist((prev) => ({ ...prev, mode }));
  };

  const handleVoiceChange = useCallback((voiceId: VoiceProfileId) => {
    setSelectedVoice(voiceId);
    setShowVoiceSelector(false);

    // If currently playing, restart with new voice
    if (audioRef.current && (isPlaying || audioRef.current.src)) {
      const audio = audioRef.current;
      const wasPlaying = isPlaying;
      audio.pause();
      audio.src = getAudioUrl(playlist.currentArticle.slug, voiceId);
      if (wasPlaying) {
        setIsLoading(true);
        audio.play().catch(err => {
          console.error('Play error:', err);
          setError('Failed to play audio');
          setIsLoading(false);
        });
      }
    }
  }, [isPlaying, playlist.currentArticle.slug, getAudioUrl]);

  const loadNextArticle = useCallback(async () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsLoadingNext(true);
    setError(null);

    try {
      const res = await fetch(
        `/api/audio/next?articleId=${playlist.currentArticle.id}&mode=${playlist.mode}&team=${playlist.currentArticle.team ?? ""}`
      );
      if (!res.ok) {
        throw new Error(`Failed to load next article: ${res.status}`);
      }
      const data = (await res.json()) as {
        article: ArticleMeta;
        audioUrl: string;
      } | null;

      if (!data) {
        setError("No more articles available in this sequence.");
        setIsLoadingNext(false);
        return;
      }

      setPlaylist({
        currentArticle: data.article,
        currentAudioUrl: data.audioUrl,
        mode: playlist.mode,
      });

      // Auto-play next article
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.src = getAudioUrl(data.article.slug, selectedVoice);
          setIsLoading(true);
          audioRef.current.play().catch(err => {
            console.error('Auto-play error:', err);
            setIsLoading(false);
          });
        }
      }, 300);
    } catch (e) {
      console.error(e);
      setError("Error loading next article.");
    } finally {
      setIsLoadingNext(false);
    }
  }, [playlist.currentArticle.id, playlist.currentArticle.team, playlist.mode, selectedVoice, getAudioUrl]);

  const handlePlayPause = useCallback(() => {
    if (!audioRef.current) return;

    const audio = audioRef.current;

    if (isPlaying) {
      audio.pause();
    } else {
      // If no source or different source, load the current article
      const expectedUrl = getAudioUrl(playlist.currentArticle.slug, selectedVoice);
      if (!audio.src || !audio.src.includes(playlist.currentArticle.slug)) {
        audio.src = expectedUrl;
      }
      setIsLoading(true);
      setError(null);
      audio.play().catch(err => {
        console.error('Play error:', err);
        setError('Failed to play audio. Please try again.');
        setIsLoading(false);
      });
    }
  }, [isPlaying, playlist.currentArticle.slug, selectedVoice, getAudioUrl]);

  const handleStop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setProgress(0);
  }, []);

  const handleSeek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !duration) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    audioRef.current.currentTime = percent * duration;
  }, [duration]);

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    if (!seconds || !isFinite(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentVoiceProfile = VOICE_PROFILES.find(v => v.id === selectedVoice) || VOICE_PROFILES[0];
  const currentTime = audioRef.current?.currentTime || 0;

  // Audio event handlers for the DOM element
  const handleLoadStart = () => setIsLoading(true);
  const handleCanPlay = () => setIsLoading(false);
  const handlePlaying = () => {
    setIsPlaying(true);
    setIsLoading(false);
    if ('mediaSession' in navigator) {
      navigator.mediaSession.playbackState = 'playing';
    }
  };
  const handlePause = () => {
    setIsPlaying(false);
    if ('mediaSession' in navigator) {
      navigator.mediaSession.playbackState = 'paused';
    }
  };
  const [showNextPrompt, setShowNextPrompt] = useState(false);
  const handleEnded = () => {
    setIsPlaying(false);
    setProgress(0);
    setShowNextPrompt(true);
  };
  const handleAudioError = () => {
    setError('Failed to load audio. Please try again.');
    setIsLoading(false);
    setIsPlaying(false);
  };
  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (audio && audio.duration) {
      setProgress((audio.currentTime / audio.duration) * 100);
    }
  };
  const handleDurationChange = () => {
    const audio = audioRef.current;
    if (audio) {
      setDuration(audio.duration);
    }
  };

  return (
    <div className="mt-1 relative">
      <audio
        ref={audioRef}
        preload="metadata"
        playsInline
        onLoadStart={handleLoadStart}
        onCanPlay={handleCanPlay}
        onPlaying={handlePlaying}
        onPause={handlePause}
        onEnded={handleEnded}
        onError={handleAudioError}
        onTimeUpdate={handleTimeUpdate}
        onDurationChange={handleDurationChange}
        className="hidden"
      />

      {/* Single-row player bar */}
      <div
        className="flex items-center gap-3 rounded-full px-2 py-1.5"
        style={{ backgroundColor: '#fff', border: '1px solid rgba(11,15,20,0.12)' }}
      >
        {/* Play/Pause */}
        <button
          type="button"
          onClick={handlePlayPause}
          disabled={isLoading}
          className="shrink-0 flex items-center justify-center rounded-full transition-transform hover:scale-105 disabled:opacity-50"
          style={{ width: 38, height: 38, backgroundColor: '#d1d5db' }}
        >
          {isLoading ? (
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="#fff" strokeWidth="3"/>
              <path className="opacity-75" fill="#fff" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
            </svg>
          ) : isPlaying ? (
            <svg className="w-4 h-4" fill="#fff" viewBox="0 0 24 24">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
            </svg>
          ) : (
            <svg className="w-4 h-4 ml-0.5" fill="#fff" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
          )}
        </button>

        {/* Current time */}
        <span className="text-[12px] font-medium tabular-nums shrink-0" style={{ color: '#0B0F14', minWidth: 36 }}>{formatTime(currentTime)}</span>

        {/* Progress bar */}
        <div
          className="flex-1 h-[5px] rounded-full cursor-pointer relative"
          style={{ backgroundColor: 'rgba(11,15,20,0.08)' }}
          onClick={handleSeek}
        >
          <div
            className="h-[5px] rounded-full transition-all duration-100"
            style={{ width: `${progress}%`, backgroundColor: '#BC0000' }}
          />
        </div>

        {/* Duration */}
        <span className="text-[12px] font-medium tabular-nums shrink-0" style={{ color: 'rgba(11,15,20,0.4)', minWidth: 36 }}>{formatTime(duration)}</span>

        {/* Voice selector */}
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => setShowVoiceSelector(!showVoiceSelector)}
            className="flex items-center gap-1 rounded-full px-2.5 py-1 transition-colors hover:bg-[rgba(11,15,20,0.06)]"
            style={{ color: '#0B0F14' }}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
            </svg>
            <span className="text-[11px] font-medium">{currentVoiceProfile.name}</span>
            <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {showVoiceSelector && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowVoiceSelector(false)} />
              <div className="absolute right-0 bottom-full mb-2 z-50 w-44 rounded-xl shadow-xl overflow-hidden" style={{ backgroundColor: '#fff', border: '1px solid rgba(11,15,20,0.1)' }}>
                <div className="p-1.5">
                  <div className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1.5" style={{ color: 'rgba(11,15,20,0.3)' }}>Voice</div>
                  {VOICE_PROFILES.map((profile) => (
                    <button
                      key={profile.id}
                      type="button"
                      onClick={() => handleVoiceChange(profile.id)}
                      className="w-full text-left px-2.5 py-2 rounded-lg text-[13px] transition-colors hover:bg-[rgba(11,15,20,0.04)]"
                      style={selectedVoice === profile.id ? { backgroundColor: 'rgba(188,0,0,0.06)', color: '#BC0000' } : { color: '#0B0F14' }}
                    >
                      <span className="font-medium">{profile.name}</span>
                      <span className="text-[11px] ml-1.5" style={{ color: 'rgba(11,15,20,0.35)' }}>{profile.description}</span>
                    </button>
                  ))}
                  <div className="mt-1 pt-1" style={{ borderTop: '1px solid rgba(11,15,20,0.06)' }}>
                    <div className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1.5" style={{ color: 'rgba(11,15,20,0.3)' }}>Up next</div>
                    {(['team', 'recent'] as const).map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => { handleModeChange(mode); setShowVoiceSelector(false); }}
                        className="w-full text-left px-2.5 py-2 rounded-lg text-[13px] transition-colors hover:bg-[rgba(11,15,20,0.04)]"
                        style={playlist.mode === mode ? { backgroundColor: 'rgba(188,0,0,0.06)', color: '#BC0000' } : { color: '#0B0F14' }}
                      >
                        <span className="font-medium">{mode === 'team' ? 'Same team' : 'Latest articles'}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Next */}
        <button
          type="button"
          onClick={() => loadNextArticle()}
          disabled={isLoadingNext}
          className="shrink-0 flex items-center justify-center rounded-full transition-colors hover:bg-[rgba(11,15,20,0.06)] disabled:opacity-30"
          style={{ width: 32, height: 32 }}
          aria-label="Next article"
        >
          <svg className="w-4 h-4" fill="#0B0F14" viewBox="0 0 24 24">
            <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
          </svg>
        </button>
      </div>

      {/* End-of-track prompt popup */}
      {showNextPrompt && (
        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-50 rounded-xl shadow-xl overflow-hidden" style={{ backgroundColor: '#fff', border: '1px solid rgba(11,15,20,0.1)', width: 220 }}>
          <div className="p-3">
            <div className="text-[12px] font-semibold mb-2.5" style={{ color: '#0B0F14' }}>What to listen to next?</div>
            <div className="flex flex-col gap-1.5">
              <button
                type="button"
                onClick={() => { setShowNextPrompt(false); handleModeChange('team'); loadNextArticle(); }}
                className="w-full text-left px-3 py-2 rounded-lg text-[13px] font-medium transition-colors hover:bg-[rgba(11,15,20,0.04)]"
                style={{ color: '#0B0F14' }}
              >
                More from this team
              </button>
              <button
                type="button"
                onClick={() => { setShowNextPrompt(false); handleModeChange('recent'); loadNextArticle(); }}
                className="w-full text-left px-3 py-2 rounded-lg text-[13px] font-medium transition-colors hover:bg-[rgba(11,15,20,0.04)]"
                style={{ color: '#0B0F14' }}
              >
                Latest articles
              </button>
              <button
                type="button"
                onClick={() => setShowNextPrompt(false)}
                className="w-full text-left px-3 py-2 rounded-lg text-[12px] transition-colors hover:bg-[rgba(11,15,20,0.04)]"
                style={{ color: 'rgba(11,15,20,0.4)' }}
              >
                Stop listening
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-1 text-center text-[11px]" style={{ color: '#BC0000' }}>{error}</div>
      )}
    </div>
  );
}

export default ArticleAudioPlayer;
