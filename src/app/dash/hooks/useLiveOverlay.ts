'use client'

import { datalabClient } from '@/lib/supabase-datalab'
import { useQuery } from '@tanstack/react-query'
import type { LiveOverlayData } from '../types'

export function useLiveOverlay(heroMode: string | undefined) {
  return useQuery({
    queryKey: ['homepage-live'],
    queryFn: async () => {
      const { data, error } = await datalabClient.rpc('get_homepage_live')
      if (error) throw error
      return data as LiveOverlayData
    },
    refetchInterval: heroMode === 'live' ? 30_000 : false,
    enabled: heroMode === 'live',
  })
}
