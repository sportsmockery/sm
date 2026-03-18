'use client'

import { datalabClient } from '@/lib/supabase-datalab'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { VoteResult } from '../types'

export function useVote() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async ({ pollId, optionIndex }: { pollId: string; optionIndex: number }) => {
      const ipHash = await getIpHash()
      const { data, error } = await datalabClient.rpc('cast_vote', {
        p_poll_id: pollId,
        p_option_index: optionIndex,
        p_ip_hash: ipHash,
      })
      if (error) throw error
      return data as VoteResult
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['homepage'] })
    },
  })
}

async function getIpHash(): Promise<string> {
  const text = navigator.userAgent + screen.width + screen.height
  const encoder = new TextEncoder()
  const data = encoder.encode(text)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('')
}
