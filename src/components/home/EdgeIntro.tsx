'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

const FADE_IN_MS = 800
const SHIMMER_DELAY_MS = 400
const SHIMMER_MS = 1200
const FADE_OUT_MS = 600

export default function EdgeIntro({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<'fade-in' | 'shimmer' | 'fade-out' | 'done'>('fade-in')

  useEffect(() => {
    // Phase 1: fade in
    const t1 = setTimeout(() => setPhase('shimmer'), FADE_IN_MS + SHIMMER_DELAY_MS)
    // Phase 2: shimmer runs via CSS animation
    const t2 = setTimeout(() => setPhase('fade-out'), FADE_IN_MS + SHIMMER_DELAY_MS + SHIMMER_MS)
    // Phase 3: fade out, then done
    const t3 = setTimeout(() => {
      setPhase('done')
      window.scrollTo(0, 0)
      onComplete()
    }, FADE_IN_MS + SHIMMER_DELAY_MS + SHIMMER_MS + FADE_OUT_MS)

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [onComplete])

  if (phase === 'done') return null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#FAFAFB',
        opacity: phase === 'fade-out' ? 0 : 1,
        transition: `opacity ${FADE_OUT_MS}ms ease-out`,
      }}
    >
      <div
        style={{
          position: 'relative',
          width: 720,
          height: 264,
          opacity: phase === 'fade-in' ? 0 : 1,
          transition: `opacity ${FADE_IN_MS}ms ease-in`,
          overflow: 'hidden',
        }}
      >
        <Image
          src="/edge_logo.svg"
          alt="SM Edge"
          width={720}
          height={264}
          style={{ width: 720, height: 264 }}
          className="object-contain"
          priority
        />

        {/* Silver shimmer overlay — clipped to logo bounds only */}
        {(phase === 'shimmer' || phase === 'fade-out') && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: 720,
              height: 264,
              pointerEvents: 'none',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: '-100%',
                width: '60%',
                height: '100%',
                background: 'linear-gradient(105deg, transparent 20%, rgba(192,192,192,0.15) 35%, rgba(220,220,220,0.5) 45%, rgba(255,255,255,0.8) 50%, rgba(220,220,220,0.5) 55%, rgba(192,192,192,0.15) 65%, transparent 80%)',
                animation: `edge-shimmer ${SHIMMER_MS}ms ease-in-out forwards`,
              }}
            />
          </div>
        )}
      </div>

      <style>{`
        @keyframes edge-shimmer {
          0% { left: -60%; }
          100% { left: 120%; }
        }
      `}</style>
    </div>
  )
}
