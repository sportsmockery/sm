'use client'

import { useState, useEffect } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import NeuralPulse from '@/components/home1/NeuralPulse'
import FeatureGrid from '@/components/home1/FeatureGrid'
import InformationShards from '@/components/home1/InformationShards'
import VisionShard from '@/components/home1/VisionShard'
import SentimentMeter from '@/components/home1/SentimentMeter'
import AIHud from '@/components/home1/AIHud'
import type { EnrichedHeadline } from '@/lib/dataBroker'

export default function Home1Page() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [headlines, setHeadlines] = useState<{ title: string; teamKey: string | null }[]>([])

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/broker?type=headlines&limit=6')
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
        // Silent
      }
    }
    load()
  }, [])

  return (
    <main style={{ minHeight: '100vh', overflow: 'hidden' }}>
      {/* ═══ HERO: Neural Pulse Monitor (Interactive Search Trigger) ═══ */}
      <NeuralPulse headlines={headlines} />

      {/* ═══ TIER 1: The Laboratory (Feature Grid) ═══ */}
      <FeatureGrid />

      {/* ═══ TIER 2: Intelligence (2-Column Split) ═══ */}
      <section
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '0 24px 120px',
        }}
      >
        {/* Section label */}
        <div
          style={{
            fontSize: 10,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: '#bc0000',
            fontFamily: "'SF Mono', 'Fira Code', monospace",
            fontWeight: 600,
            marginBottom: 20,
          }}
        >
          Intelligence Feed
        </div>

        <div
          className="h1-intel-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr',
            gap: 24,
            alignItems: 'start',
          }}
        >
          {/* Left column (66%): Information Shards */}
          <div>
            <InformationShards />
          </div>

          {/* Right column (33%): Sentiment + Vision */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, position: 'sticky', top: 80 }}>
            <SentimentMeter />
            <VisionShard />
          </div>
        </div>
      </section>

      {/* ═══ BOTTOM: Persistent AI-HUD Dock ═══ */}
      <AIHud />

      {/* Responsive override */}
      <style>{`
        @media (max-width: 900px) {
          .h1-intel-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </main>
  )
}
