'use client';

import React, { createContext, useCallback, useContext, useState } from 'react';

interface AudioState {
  isPlaying: boolean;
  currentArticle: { title: string; url: string } | null;
  currentTime: number;
  voice: string;
}

interface AudioPlayerContextValue extends AudioState {
  play: (article: { title: string; url: string }, voice?: string) => void;
  pause: () => void;
  setVoice: (voice: string) => void;
}

const defaultState: AudioState = {
  isPlaying: false,
  currentArticle: null,
  currentTime: 0,
  voice: 'Voice A',
};

const AudioPlayerCtx = createContext<AudioPlayerContextValue>({
  ...defaultState,
  play: () => {},
  pause: () => {},
  setVoice: () => {},
});

export function AudioPlayerProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AudioState>(defaultState);

  const play = useCallback((article: { title: string; url: string }, voice?: string) => {
    setState((prev) => ({
      ...prev,
      isPlaying: true,
      currentArticle: article,
      currentTime: 0,
      voice: voice ?? prev.voice,
    }));
  }, []);

  const pause = useCallback(() => {
    setState((prev) => ({ ...prev, isPlaying: false }));
  }, []);

  const setVoice = useCallback((voice: string) => {
    setState((prev) => ({ ...prev, voice }));
  }, []);

  return (
    <AudioPlayerCtx.Provider value={{ ...state, play, pause, setVoice }}>
      {children}
    </AudioPlayerCtx.Provider>
  );
}

export function useAudioPlayer() {
  return useContext(AudioPlayerCtx);
}

export { AudioPlayerCtx as AudioPlayerContext };
