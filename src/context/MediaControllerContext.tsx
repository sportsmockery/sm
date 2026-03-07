'use client';

import React, { createContext, useCallback, useContext, useRef, useState } from 'react';

export interface MediaControllerRegistration {
  play: () => void | Promise<void>;
  pause: () => void;
  mute: () => void;
}

interface MediaControllerContextValue {
  register: (id: string, controls: MediaControllerRegistration) => void;
  unregister: (id: string) => void;
  /** Claim focus: pauses/mutes current, sets active to id, plays id. Only one active at a time. */
  setActive: (id: string | null) => void;
  activeId: string | null;
}

const MediaControllerContext = createContext<MediaControllerContextValue | null>(null);

export function MediaControllerProvider({ children }: { children: React.ReactNode }) {
  const registryRef = useRef<Map<string, MediaControllerRegistration>>(new Map());
  const [activeId, setActiveId] = useState<string | null>(null);

  const register = useCallback((id: string, controls: MediaControllerRegistration) => {
    registryRef.current.set(id, controls);
  }, []);

  const unregister = useCallback((id: string) => {
    const reg = registryRef.current.get(id);
    if (reg) {
      reg.pause();
      reg.mute();
    }
    registryRef.current.delete(id);
    setActiveId((prev) => (prev === id ? null : prev));
  }, []);

  const setActive = useCallback((id: string | null) => {
    setActiveId((prev) => {
      if (prev === id) return prev;

      if (prev) {
        const prevReg = registryRef.current.get(prev);
        if (prevReg) {
          prevReg.pause();
          prevReg.mute();
        }
      }

      if (id) {
        const nextReg = registryRef.current.get(id);
        if (nextReg) {
          Promise.resolve(nextReg.play()).catch(() => {});
        }
      }
      return id;
    });
  }, []);

  const value: MediaControllerContextValue = {
    register,
    unregister,
    setActive,
    activeId,
  };

  return (
    <MediaControllerContext.Provider value={value}>
      {children}
    </MediaControllerContext.Provider>
  );
}

export function useMediaController(): MediaControllerContextValue {
  const ctx = useContext(MediaControllerContext);
  if (!ctx) {
    throw new Error('useMediaController must be used within MediaControllerProvider');
  }
  return ctx;
}

/** Returns null when outside provider — use when card may render without River layout. */
export function useOptionalMediaController(): MediaControllerContextValue | null {
  return useContext(MediaControllerContext);
}
