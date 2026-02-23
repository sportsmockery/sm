'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useTheme } from '@/contexts/ThemeContext'
import { motion } from 'framer-motion'
import type { EnrichedHeadline } from '@/lib/dataBroker'

type BootState = 'initial' | 'verifying' | 'resolved'

// Deterministic shard widths based on index
const SHARD_WIDTHS = [380, 300, 420, 280, 360, 340, 400, 310, 370, 290, 350, 320]
const SHARD_ROTATIONS = [-0.5, 0.3, -0.2, 0.4, -0.3, 0.1, -0.4, 0.2, -0.1, 0.3, -0.3, 0.2]
const FLOAT_DURATIONS = [7, 8.5, 6, 9, 7.5, 8, 6.5, 9.5, 7, 8, 6.5, 9]

// Highlight key stats in title text
function highlightStats(text: string, stats: { value: string }[]): React.ReactNode {
  if (!stats.length) return text

  let result = text
  const parts: React.ReactNode[] = []
  let lastIndex = 0

  for (const stat of stats) {
    const idx = result.indexOf(stat.value, lastIndex)
    if (idx === -1) continue

    if (idx > lastIndex) {
      parts.push(result.slice(lastIndex, idx))
    }
    parts.push(
      <mark key={idx} className="h1-stat-highlight">
        {stat.value}
      </mark>
    )
    lastIndex = idx + stat.value.length
  }

  if (lastIndex < result.length) {
    parts.push(result.slice(lastIndex))
  }

  return parts.length > 0 ? parts : text
}

function getCategorySlug(headline: EnrichedHeadline): string {
  if (headline.teamKey) {
    const teamToSlug: Record<string, string> = {
      bears: 'chicago-bears',
      bulls: 'chicago-bulls',
      blackhawks: 'chicago-blackhawks',
      cubs: 'chicago-cubs',
      'white-sox': 'chicago-white-sox',
    }
    return teamToSlug[headline.teamKey] || headline.category || 'news'
  }
  return headline.category || 'news'
}

export default function InformationShards() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [bootState, setBootState] = useState<BootState>('initial')
  const [headlines, setHeadlines] = useState<EnrichedHeadline[]>([])
  const [dataOverlay, setDataOverlay] = useState(false)

  useEffect(() => {
    const fetchHeadlines = async () => {
      setBootState('verifying')

      try {
        const res = await fetch('/api/broker?type=headlines&limit=12')
        const envelope = await res.json()

        if (envelope.data) {
          setHeadlines(envelope.data)
          // Brief delay for the verifying → resolved transition
          setTimeout(() => setBootState('resolved'), 600)
        } else {
          setBootState('resolved')
        }
      } catch {
        setBootState('resolved')
      }
    }

    // Start boot sequence
    const timer = setTimeout(fetchHeadlines, 300)
    return () => clearTimeout(timer)
  }, [])

  // Expose data overlay toggle for AIHud
  useEffect(() => {
    const handler = (e: CustomEvent) => {
      setDataOverlay(e.detail?.active ?? false)
    }
    window.addEventListener('h1-data-overlay' as string, handler as EventListener)
    return () => window.removeEventListener('h1-data-overlay' as string, handler as EventListener)
  }, [])

  return (
    <section
      style={{
        maxWidth: 1400,
        margin: '0 auto',
        padding: '80px 24px 120px',
        display: 'flex',
        flexWrap: 'wrap',
        gap: 20,
        justifyContent: 'center',
        position: 'relative',
        transition: 'filter 0.5s ease',
        filter: dataOverlay ? 'brightness(0.5)' : 'brightness(1)',
      }}
    >
      {/* Section label */}
      <div
        style={{
          width: '100%',
          marginBottom: 16,
          fontSize: 10,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: isDark ? '#333' : '#ccc',
          fontFamily: "'SF Mono', 'Fira Code', monospace",
        }}
      >
        Information Shards
        {bootState !== 'resolved' && (
          <span style={{ marginLeft: 8, color: '#bc0000' }}>
            {bootState === 'initial' ? 'INITIALIZING...' : 'VERIFYING...'}
          </span>
        )}
      </div>

      {headlines.length === 0 && bootState === 'resolved' && (
        <div
          style={{
            width: '100%',
            textAlign: 'center',
            padding: '60px 0',
            color: isDark ? '#444' : '#bbb',
            fontSize: 14,
          }}
        >
          No data available
        </div>
      )}

      {headlines.map((headline, i) => {
        const shardWidth = SHARD_WIDTHS[i % SHARD_WIDTHS.length]
        const rotation = SHARD_ROTATIONS[i % SHARD_ROTATIONS.length]
        const floatDur = FLOAT_DURATIONS[i % FLOAT_DURATIONS.length]
        const slug = getCategorySlug(headline)
        const hasGlow = dataOverlay && headline.keyStats.length > 0

        return (
          <motion.div
            key={headline.postId}
            className={`h1-shard h1-glass h1-boot-${bootState}`}
            initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
            animate={
              bootState === 'resolved'
                ? {
                    opacity: 1,
                    y: 0,
                    filter: 'blur(0px)',
                  }
                : {}
            }
            transition={{
              duration: 0.5,
              delay: i * 0.08,
              ease: [0.16, 1, 0.3, 1],
            }}
            style={{
              width: shardWidth,
              maxWidth: '100%',
              padding: 20,
              borderRadius: 'var(--h1-radius-md)',
              transform: `rotate(${rotation}deg)`,
              animation:
                bootState === 'resolved'
                  ? `h1-float ${floatDur}s ease-in-out infinite`
                  : undefined,
              animationDelay: `${i * 0.5}s`,
              cursor: 'pointer',
              textDecoration: 'none',
              color: 'inherit',
              boxShadow: hasGlow ? '0 0 20px rgba(188,0,0,0.4), inset 0 0 20px rgba(188,0,0,0.1)' : undefined,
              borderColor: hasGlow ? '#bc0000' : undefined,
              transition: 'box-shadow 0.4s ease, border-color 0.4s ease',
            }}
          >
            <Link href={`/${slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              {/* Category + reliability */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 10,
                }}
              >
                {headline.teamKey && (
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 600,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      color: '#bc0000',
                    }}
                  >
                    {headline.teamKey.replace('-', ' ')}
                  </span>
                )}
                <span
                  style={{
                    fontSize: 9,
                    color: isDark ? '#555' : '#aaa',
                    fontFamily: "'SF Mono', monospace",
                  }}
                >
                  {headline.reliabilityScore}%
                </span>
              </div>

              {/* Featured image */}
              {headline.featuredImage && (
                <div
                  style={{
                    position: 'relative',
                    width: '100%',
                    height: 140,
                    borderRadius: 8,
                    overflow: 'hidden',
                    marginBottom: 12,
                  }}
                >
                  <Image
                    src={headline.featuredImage}
                    alt={headline.title}
                    fill
                    sizes="420px"
                    style={{ objectFit: 'cover' }}
                  />
                </div>
              )}

              {/* Title with highlighted stats */}
              <h3
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  lineHeight: 1.35,
                  margin: 0,
                  marginBottom: headline.excerpt ? 8 : 0,
                  color: isDark ? '#ffffff' : '#111111',
                  letterSpacing: '-0.01em',
                }}
              >
                {highlightStats(headline.title, headline.keyStats)}
              </h3>

              {/* Excerpt */}
              {headline.excerpt && (
                <p
                  style={{
                    fontSize: 12,
                    lineHeight: 1.5,
                    color: isDark ? '#888' : '#666',
                    margin: 0,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {headline.excerpt}
                </p>
              )}

              {/* Key stats badges (visible in data overlay mode) */}
              {dataOverlay && headline.keyStats.length > 0 && (
                <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
                  {headline.keyStats.map((stat, si) => (
                    <span
                      key={si}
                      style={{
                        fontSize: 10,
                        fontWeight: 600,
                        padding: '2px 8px',
                        borderRadius: 4,
                        backgroundColor: 'rgba(188,0,0,0.15)',
                        color: '#bc0000',
                        fontFamily: "'SF Mono', monospace",
                      }}
                    >
                      {stat.value}
                    </span>
                  ))}
                </div>
              )}
            </Link>
          </motion.div>
        )
      })}
    </section>
  )
}
