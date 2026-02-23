'use client'

import { useState, useEffect } from 'react'
import NeuralPulse from '@/components/home1/NeuralPulse'
import InformationShards from '@/components/home1/InformationShards'
import AIHud from '@/components/home1/AIHud'
import type { EnrichedHeadline } from '@/lib/dataBroker'

export default function Home1Page() {
  const [headlines, setHeadlines] = useState<{ title: string; teamKey: string | null }[]>([])

  // Pre-fetch headlines for Neural Pulse hover display
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/broker?type=headlines&limit=4')
        const envelope = await res.json()
        if (envelope.data) {
          setHeadlines(
            envelope.data.map((h: EnrichedHeadline) => ({
              title: h.title,
              teamKey: h.teamKey,
            }))
          )
        }
      } catch {
        // Silent — Neural Pulse works without headlines
      }
    }
    load()
  }, [])

  return (
    <main
      style={{
        minHeight: '100vh',
        overflow: 'hidden',
      }}
    >
      {/* Hero — ECG heartbeat */}
      <NeuralPulse headlines={headlines} />

      {/* Feed — asymmetric glass shards */}
      <InformationShards />

      {/* Persistent AI dock */}
      <AIHud />
    </main>
  )
}
