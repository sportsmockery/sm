// components/article/ArticleAudioPlayer.tsx
"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import type { ArticleMeta, NextArticleMode } from "@/lib/audioPlayer";

interface ArticleAudioPlayerProps {
  initialArticle: ArticleMeta;
  initialAudioUrl: string;
  articleContent?: string;
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
  const handleEnded = () => {
    setIsPlaying(false);
    setProgress(0);
    loadNextArticle();
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
    <div className="border border-zinc-200 dark:border-white/30 p-4 rounded-lg mt-4 bg-zinc-50 dark:bg-zinc-900">
      {/* Hidden audio element for iOS background playback compatibility */}
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
      <div className="flex justify-between items-center gap-3 mb-3 text-sm">
        <span className="font-medium text-zinc-900 dark:text-white flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
          </svg>
          Listen to this article
        </span>
        <span className="text-xs text-zinc-500 dark:text-zinc-400 truncate max-w-[200px]">
          {playlist.currentArticle.title}
        </span>
      </div>

      {/* Progress bar - clickable for seeking */}
      <div
        className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-1.5 mb-2 cursor-pointer"
        onClick={handleSeek}
      >
        <div
          className="bg-[#bc0000] h-1.5 rounded-full transition-all duration-150"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Time display */}
      <div className="flex justify-between text-xs text-zinc-500 dark:text-zinc-400 mb-3">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
        <div className="flex gap-2 items-center">
          <button
            type="button"
            onClick={handlePlayPause}
            disabled={isLoading}
            className="px-3 py-1.5 rounded border border-zinc-300 dark:border-white/50 bg-white dark:bg-transparent hover:bg-zinc-100 dark:hover:bg-white/10 disabled:opacity-50 text-zinc-900 dark:text-white transition-colors text-sm flex items-center gap-1.5"
          >
            {isLoading ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                Loading...
              </>
            ) : isPlaying ? (
              <>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                </svg>
                Pause
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
                Play
              </>
            )}
          </button>
          {(isPlaying || progress > 0) && (
            <button
              type="button"
              onClick={handleStop}
              className="px-3 py-1.5 rounded border border-zinc-300 dark:border-white/50 bg-white dark:bg-transparent hover:bg-zinc-100 dark:hover:bg-white/10 text-zinc-900 dark:text-white transition-colors text-sm flex items-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 6h12v12H6z"/>
              </svg>
              Stop
            </button>
          )}
          <button
            type="button"
            onClick={() => loadNextArticle()}
            disabled={isLoadingNext}
            className="px-3 py-1.5 rounded border border-zinc-300 dark:border-white/50 bg-white dark:bg-transparent hover:bg-zinc-100 dark:hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed text-zinc-900 dark:text-white transition-colors text-sm flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
            </svg>
            {isLoadingNext ? "Loading..." : "Next"}
          </button>
        </div>

        <div className="flex gap-2 items-center flex-wrap">
          {/* Voice selector */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowVoiceSelector(!showVoiceSelector)}
              className="px-2.5 py-1 rounded-full text-xs transition-colors border border-zinc-300 dark:border-white/50 bg-white dark:bg-transparent text-zinc-700 dark:text-white hover:bg-zinc-100 dark:hover:bg-white/10 flex items-center gap-1"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              {currentVoiceProfile.name}
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {/* Voice selector - mobile: bottom sheet, desktop: dropdown */}
            {showVoiceSelector && (
              <>
                {/* Mobile overlay backdrop */}
                <div
                  className="fixed inset-0 bg-black/50 z-40 md:hidden"
                  onClick={() => setShowVoiceSelector(false)}
                />
                {/* Mobile: bottom sheet, Desktop: dropdown */}
                <div className="fixed inset-x-0 bottom-0 z-50 md:absolute md:inset-auto md:right-0 md:bottom-auto md:mt-1 w-full md:w-52 bg-white dark:bg-zinc-800 border-t md:border border-zinc-200 dark:border-zinc-700 md:rounded-lg shadow-lg max-h-[50vh] md:max-h-none overflow-y-auto">
                  <div className="p-3 md:p-2">
                    <div className="flex justify-between items-center md:block mb-2 md:mb-1">
                      <div className="text-sm md:text-xs font-medium text-zinc-700 dark:text-zinc-300 md:text-zinc-500 md:dark:text-zinc-400 px-2 py-1">
                        Select Voice
                      </div>
                      {/* Close button for mobile */}
                      <button
                        type="button"
                        onClick={() => setShowVoiceSelector(false)}
                        className="md:hidden p-1 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-700"
                      >
                        <svg className="w-5 h-5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    {VOICE_PROFILES.map((profile) => (
                      <button
                        key={profile.id}
                        type="button"
                        onClick={() => handleVoiceChange(profile.id)}
                        className={`w-full text-left px-3 md:px-2 py-3 md:py-1.5 rounded text-sm md:text-xs transition-colors ${
                          selectedVoice === profile.id
                            ? 'bg-red-50 dark:bg-red-900/20 text-[#bc0000] dark:text-red-400'
                            : 'hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300'
                        }`}
                      >
                        <div className="font-medium">{profile.name}</div>
                        <div className="text-zinc-500 dark:text-zinc-400">{profile.description}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          <span className="text-zinc-500 dark:text-white/60 text-xs">Next by:</span>
          <button
            type="button"
            onClick={() => handleModeChange("team")}
            className={`px-2.5 py-1 rounded-full text-xs transition-colors ${
              playlist.mode === "team"
                ? "border border-[#bc0000] bg-red-50 dark:bg-red-900/30 text-[#bc0000] dark:text-red-400"
                : "border border-zinc-300 dark:border-white/50 bg-white dark:bg-transparent text-zinc-700 dark:text-white hover:bg-zinc-100 dark:hover:bg-white/10"
            }`}
          >
            Team
          </button>
          <button
            type="button"
            onClick={() => handleModeChange("recent")}
            className={`px-2.5 py-1 rounded-full text-xs transition-colors ${
              playlist.mode === "recent"
                ? "border border-[#bc0000] bg-red-50 dark:bg-red-900/30 text-[#bc0000] dark:text-red-400"
                : "border border-zinc-300 dark:border-white/50 bg-white dark:bg-transparent text-zinc-700 dark:text-white hover:bg-zinc-100 dark:hover:bg-white/10"
            }`}
          >
            Recent
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-3 text-xs text-red-600 dark:text-red-400">
          {error}
        </div>
      )}
    </div>
  );
}

export default ArticleAudioPlayer;
