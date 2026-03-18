'use client'

import { useCallback, useMemo } from 'react'

const STORAGE_KEY = 'sm_city_pulse'

interface PulsePrefs {
  lastSeen: number
  favoriteTeam: string | null
}

function getPrefs(): PulsePrefs {
  if (typeof window === 'undefined') return { lastSeen: 0, favoriteTeam: null }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { lastSeen: 0, favoriteTeam: null }
    return JSON.parse(raw) as PulsePrefs
  } catch {
    return { lastSeen: 0, favoriteTeam: null }
  }
}

function savePrefs(prefs: PulsePrefs): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs))
  } catch {}
}

export function usePulsePersonalization() {
  const prefs = useMemo(() => getPrefs(), [])

  const markSeen = useCallback(() => {
    savePrefs({ ...getPrefs(), lastSeen: Date.now() })
  }, [])

  const setFavoriteTeam = useCallback((teamKey: string | null) => {
    savePrefs({ ...getPrefs(), favoriteTeam: teamKey })
  }, [])

  const timeSinceLastVisit = useMemo(() => {
    if (!prefs.lastSeen) return null
    const diff = Date.now() - prefs.lastSeen
    const hours = Math.floor(diff / 3600000)
    if (hours < 1) return 'just now'
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    return `${days}d ago`
  }, [prefs.lastSeen])

  return {
    lastSeen: prefs.lastSeen,
    favoriteTeam: prefs.favoriteTeam,
    timeSinceLastVisit,
    markSeen,
    setFavoriteTeam,
  }
}
