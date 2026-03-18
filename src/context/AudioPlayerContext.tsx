'use client';

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

export interface AudioArticle {
  title: string;
  slug?: string;
  url: string;
}

interface AudioState {
  isPlaying: boolean;
  currentArticle: AudioArticle | null;
  currentTime: number;
  duration: number;
  /**
   * UI voice label shown in the global mini player.
   * - "Will"      → ?voice=will
   * - "Brian"     → ?voice=brian
   * - "Team Voice"→ ?voice=laura
   * - "Scout"     → ?voice=scout (used for Scout insights/briefings)
   */
  voice: 'Will' | 'Brian' | 'Team Voice' | 'Scout';
  cardOutOfView: boolean;
  queue: AudioArticle[];
}

interface AudioPlayerContextValue extends AudioState {
  play: (article: AudioArticle, voice?: string) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  setVoice: (voice: AudioState['voice']) => void;
  setCardOutOfView: (outOfView: boolean) => void;
  playNext: () => void;
  addToQueue: (article: AudioArticle) => void;
  setQueue: (articles: AudioArticle[]) => void;
  updateProgress: (currentTime: number, duration: number) => void;
}

const defaultState: AudioState = {
  isPlaying: false,
  currentArticle: null,
  currentTime: 0,
  duration: 0,
  voice: 'Will',
  cardOutOfView: false,
  queue: [],
};

const AudioPlayerCtx = createContext<AudioPlayerContextValue>({
  ...defaultState,
  play: () => {},
  pause: () => {},
  resume: () => {},
  stop: () => {},
  setVoice: () => {},
  setCardOutOfView: () => {},
  playNext: () => {},
  addToQueue: () => {},
  setQueue: () => {},
  updateProgress: () => {},
});

export function AudioPlayerProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AudioState>(defaultState);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Create audio element once
  useEffect(() => {
    if (typeof window !== 'undefined' && !audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.preload = 'metadata';
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);

  // Wire up timeupdate, ended, and error events
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => {
      setState(prev => ({
        ...prev,
        currentTime: audio.currentTime,
        duration: audio.duration || 0,
      }));
    };

    const onEnded = () => {
      setState(prev => {
        if (prev.queue.length > 0) {
          const [next, ...rest] = prev.queue;
          audio.src = next.url;
          audio.load();
          audio.play().catch(() => {});
          return { ...prev, isPlaying: true, currentArticle: next, currentTime: 0, duration: 0, queue: rest };
        }
        return { ...prev, isPlaying: false, currentTime: 0 };
      });
    };

    const onLoadedMetadata = () => {
      setState(prev => ({ ...prev, duration: audio.duration || 0 }));
    };

    const onError = () => {
      setState(prev => ({ ...prev, isPlaying: false, currentArticle: null, currentTime: 0, duration: 0 }));
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('error', onError);
    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('error', onError);
    };
  }, []);

  const play = useCallback((article: AudioArticle, voice?: string) => {
    const audio = audioRef.current;
    setState(prev => ({
      ...prev,
      isPlaying: true,
      currentArticle: article,
      currentTime: 0,
      duration: 0,
      voice: (voice as AudioState['voice']) ?? prev.voice,
    }));
    if (audio) {
      audio.src = article.url;
      audio.load();
      // If play() fails (e.g. autoplay restrictions or slow load), we still keep
      // currentArticle set so the mini player can appear; users can retry.
      audio.play().catch(() => {
        setState(prev => ({ ...prev, isPlaying: false }));
      });
    }
  }, []);

  const pause = useCallback(() => {
    audioRef.current?.pause();
    setState(prev => ({ ...prev, isPlaying: false }));
  }, []);

  const resume = useCallback(() => {
    audioRef.current?.play().catch(() => {});
    setState(prev => ({ ...prev, isPlaying: true }));
  }, []);

  const stop = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
      audio.src = '';
    }
    setState(prev => ({
      ...prev,
      isPlaying: false,
      currentArticle: null,
      currentTime: 0,
      duration: 0,
      cardOutOfView: false,
    }));
  }, []);

  const setVoice = useCallback((voice: AudioState['voice']) => {
    const audio = audioRef.current;
    setState(prev => {
      if (!audio || !prev.currentArticle) {
        return { ...prev, voice };
      }

      // Map UI voice names to API voice params for /api/audio
      const voiceMap: Record<string, string> = {
        Will: 'will',
        Brian: 'brian',
        'Team Voice': 'laura',
        Scout: 'scout',
      };
      const voiceParam = voiceMap[voice] || 'will';

      // Build new audio URL with voice query param
      const slug = prev.currentArticle.slug || prev.currentArticle.url;
      const newSrc = `/api/audio/${encodeURIComponent(slug)}?voice=${voiceParam}`;

      const wasPlaying = prev.isPlaying;
      const savedTime = audio.currentTime;
      const FADE_DURATION = 100; // ms per fade direction, ~200ms total

      // Fade out volume
      const originalVolume = audio.volume;
      const fadeOut = () => {
        return new Promise<void>(resolve => {
          const steps = 5;
          const stepTime = FADE_DURATION / steps;
          let step = 0;
          const interval = setInterval(() => {
            step++;
            audio.volume = Math.max(0, originalVolume * (1 - step / steps));
            if (step >= steps) {
              clearInterval(interval);
              resolve();
            }
          }, stepTime);
        });
      };

      const fadeIn = () => {
        const steps = 5;
        const stepTime = FADE_DURATION / steps;
        let step = 0;
        const interval = setInterval(() => {
          step++;
          audio.volume = Math.min(originalVolume, originalVolume * (step / steps));
          if (step >= steps) {
            clearInterval(interval);
          }
        }, stepTime);
      };

      fadeOut().then(() => {
        audio.src = newSrc;
        const onLoaded = () => {
          audio.removeEventListener('loadedmetadata', onLoaded);
          audio.currentTime = savedTime;
          if (wasPlaying) {
            audio.play().catch(() => {});
          }
          fadeIn();
        };
        audio.addEventListener('loadedmetadata', onLoaded);
        audio.load();
      });

      return { ...prev, voice };
    });
  }, []);

  const setCardOutOfView = useCallback((outOfView: boolean) => {
    setState(prev => ({ ...prev, cardOutOfView: outOfView }));
  }, []);

  const playNext = useCallback(() => {
    setState(prev => {
      if (prev.queue.length === 0) {
        // No next article — stop
        const audio = audioRef.current;
        if (audio) { audio.pause(); audio.currentTime = 0; audio.src = ''; }
        return { ...prev, isPlaying: false, currentArticle: null, currentTime: 0, duration: 0 };
      }
      const [next, ...rest] = prev.queue;
      const audio = audioRef.current;
      if (audio) {
        audio.src = next.url;
        audio.play().catch(() => {});
      }
      return { ...prev, isPlaying: true, currentArticle: next, currentTime: 0, duration: 0, queue: rest };
    });
  }, []);

  const addToQueue = useCallback((article: AudioArticle) => {
    setState(prev => ({ ...prev, queue: [...prev.queue, article] }));
  }, []);

  const setQueue = useCallback((articles: AudioArticle[]) => {
    setState(prev => ({ ...prev, queue: articles }));
  }, []);

  const updateProgress = useCallback((currentTime: number, duration: number) => {
    setState(prev => ({ ...prev, currentTime, duration }));
  }, []);

  return (
    <AudioPlayerCtx.Provider value={{
      ...state,
      play, pause, resume, stop, setVoice,
      setCardOutOfView, playNext, addToQueue, setQueue, updateProgress,
    }}>
      {children}
    </AudioPlayerCtx.Provider>
  );
}

export function useAudioPlayer() {
  return useContext(AudioPlayerCtx);
}

export { AudioPlayerCtx as AudioPlayerContext };
