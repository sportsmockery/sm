'use client'

import { datalabClient } from '@/lib/supabase-datalab'
import { useQuery } from '@tanstack/react-query'
import type { HomepageData } from '../types'

export function useHomepage() {
  return useQuery({
    queryKey: ['homepage'],
    queryFn: async () => {
      const { data, error } = await datalabClient.rpc('get_homepage_cached')
      if (error) throw error
      return data as HomepageData
    },
    refetchInterval: 5 * 60 * 1000,
    staleTime: 2 * 60 * 1000,
  })
}
