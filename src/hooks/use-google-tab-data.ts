'use client'

import { useCallback, useEffect, useState } from 'react'
import type { GoogleTabPayload, TransparencyAsset, TransparencyAssetEvaluation } from '@/lib/google/types'

interface UseGoogleTabDataResult {
  data: GoogleTabPayload | null
  loading: boolean
  error: string | null
  source: 'db' | 'mock' | 'mock-fallback' | 'mock-articles+db-transparency' | null
  refresh: () => void
  // Transparency surfaces re-exported for ergonomic access from panels that
  // only need the asset slice (so they don't have to defensively read .data?).
  transparencyAssets: TransparencyAsset[]
  transparencyEvaluations: TransparencyAssetEvaluation[]
}

export function useGoogleTabData(active: boolean): UseGoogleTabDataResult {
  const [data, setData] = useState<GoogleTabPayload | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [source, setSource] = useState<UseGoogleTabDataResult['source']>(null)
  const [tick, setTick] = useState(0)

  const refresh = useCallback(() => setTick((t) => t + 1), [])

  useEffect(() => {
    if (!active) return
    let cancelled = false
    setLoading(true)
    setError(null)
    fetch('/api/admin/google-intelligence', { cache: 'no-store' })
      .then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json() as Promise<GoogleTabPayload & { source: UseGoogleTabDataResult['source'] }>
      })
      .then((payload) => {
        if (cancelled) return
        const { source: src, ...rest } = payload
        setData(rest as GoogleTabPayload)
        setSource(src ?? 'db')
      })
      .catch((e) => {
        if (cancelled) return
        setError(e instanceof Error ? e.message : String(e))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [active, tick])

  return {
    data, loading, error, source, refresh,
    transparencyAssets:      data?.transparencyAssets      ?? [],
    transparencyEvaluations: data?.transparencyEvaluations ?? [],
  }
}
