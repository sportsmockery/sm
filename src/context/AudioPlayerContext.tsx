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
  voice: 'Voice A' | 'Voice B' | 'Team Voice';
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
  updateProgress: (currentTime: number, duration: number) => void;
}

const defaultState: AudioState = {
  isPlaying: false,
  currentArticle: null,
  currentTime: 0,
  duration: 0,
  voice: 'Voice A',
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

  // Wire up timeupdate and ended events
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
          audio.play().catch(() => {});
          return { ...prev, isPlaying: true, currentArticle: next, currentTime: 0, duration: 0, queue: rest };
        }
        return { ...prev, isPlaying: false, currentTime: 0 };
      });
    };

    const onLoadedMetadata = () => {
      setState(prev => ({ ...prev, duration: audio.duration || 0 }));
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
    };
  }, []);

  const play = useCallback((article: AudioArticle, voice?: string) => {
    const audio = audioRef.current;
    if (audio) {
      audio.src = article.url;
      audio.play().catch(() => {});
    }
    setState(prev => ({
      ...prev,
      isPlaying: true,
      currentArticle: article,
      currentTime: 0,
      duration: 0,
      voice: (voice as AudioState['voice']) ?? prev.voice,
    }));
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
    if (audio && audio.src) {
      // Crossfade: save position, change voice (src would change in real impl), seek back
      const currentPos = audio.currentTime;
      // In a real implementation, the URL would change based on voice
      // For now, just update the state
      audio.currentTime = currentPos;
    }
    setState(prev => ({ ...prev, voice }));
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

  const updateProgress = useCallback((currentTime: number, duration: number) => {
    setState(prev => ({ ...prev, currentTime, duration }));
  }, []);

  return (
    <AudioPlayerCtx.Provider value={{
      ...state,
      play, pause, resume, stop, setVoice,
      setCardOutOfView, playNext, addToQueue, updateProgress,
    }}>
      {children}
    </AudioPlayerCtx.Provider>
  );
}

export function useAudioPlayer() {
  return useContext(AudioPlayerCtx);
}

export { AudioPlayerCtx as AudioPlayerContext };
