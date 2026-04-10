'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

interface Feature {
  id: string
  title: string
  tagline: string
  description: string
  href: string
  icon: string
  accentColor: string
  screenshotPlaceholder: string
  tips: string[]
}

const FEATURES: Feature[] = [
  {
    id: 'scout-ai',
    title: 'Scout AI',
    tagline: 'Your Chicago sports intelligence assistant',
    description:
      'Ask Scout anything about Chicago sports. Get instant answers powered by real-time data, historical stats, and expert analysis. Scout understands context — ask follow-up questions naturally.',
    href: '/scout-ai',
    icon: '/downloads/scout-v2.png',
    accentColor: '#00D4FF',
    screenshotPlaceholder: 'scout',
    tips: [
      'Try: "How are the Bears doing this season?"',
      'Scout remembers context within a session',
      'Works for all 5 Chicago teams',
    ],
  },
  {
    id: 'fan-chat',
    title: 'Fan Chat',
    tagline: 'Real-time talk with AI personalities',
    description:
      'Jump into team-specific chat rooms with AI personalities that know Chicago sports inside and out. Each channel has its own vibe — from the Bears Den to the Cubs Clubhouse. Chat with other fans or go 1-on-1 with the AI.',
    href: '/fan-chat',
    icon: '',
    accentColor: '#BC0000',
    screenshotPlaceholder: 'chat',
    tips: [
      '5 team channels + Chicago Lounge',
      'Each AI personality has unique opinions',
      'Mention the AI to get a direct response',
    ],
  },
  {
    id: 'game-center',
    title: 'Game Center',
    tagline: 'Live scores and play-by-play',
    description:
      'Track every Chicago game in real time. Live scores, play-by-play updates, player stats, and period-by-period breakdowns — all updating every 10 seconds during active games.',
    href: '/live',
    icon: '',
    accentColor: '#BC0000',
    screenshotPlaceholder: 'live',
    tips: [
      'Scores update every 10 seconds during games',
      'Click any game for full box score',
      'Appears in the top bar when games are live',
    ],
  },
  {
    id: 'war-room',
    title: 'War Room',
    tagline: 'AI-powered trade simulator & mock draft',
    description:
      'Be the GM. Build trades between any teams, get instant AI grades from Claude, simulate how trades impact your season, and run full mock drafts for Bears, Cubs, and White Sox.',
    href: '/gm',
    icon: '',
    accentColor: '#D6B05E',
    screenshotPlaceholder: 'gm',
    tips: [
      'Trades are graded by Claude AI in real time',
      'Season simulator shows playoff probability impact',
      'Mock draft covers NFL, MLB, and NHL',
    ],
  },
  {
    id: 'team-stats',
    title: 'Team Stats',
    tagline: 'Deep stats, rosters, schedules & cap trackers',
    description:
      'Full hub pages for all 5 Chicago teams. Player rosters with headshots, game schedules, season stats, salary cap breakdowns, and stat leaderboards — all sourced from live data.',
    href: '/chicago-bears',
    icon: '',
    accentColor: '#C83803',
    screenshotPlaceholder: 'stats',
    tips: [
      'Every team has roster, schedule, stats, and cap tracker',
      'Cap tracker shows real contract data',
      'Stats update after every game',
    ],
  },
  {
    id: 'vision-theater',
    title: 'Vision Theater',
    tagline: 'Original Chicago sports shows',
    description:
      'Watch curated original content: Bears Film Room for game film analysis, Pinwheels & Ivy for Cubs stories, and Untold Chicago Stories. Premium video built for Chicago fans.',
    href: '/vision-theater',
    icon: '',
    accentColor: '#00D4FF',
    screenshotPlaceholder: 'video',
    tips: [
      'Bears Film Room breaks down game film',
      'Pinwheels & Ivy covers Cubs culture',
      'New episodes added regularly',
    ],
  },
  {
    id: 'hands-free',
    title: 'Hands-Free Audio',
    tagline: 'Listen to articles while you go',
    description:
      'Turn any article into audio. Continuous playback by team or latest stories — perfect for commutes, workouts, or when you just don\'t feel like reading. Hands-free Chicago sports.',
    href: '/audio',
    icon: '',
    accentColor: '#00D4FF',
    screenshotPlaceholder: 'audio',
    tips: [
      'Continuous playback queues articles automatically',
      'Filter by team for focused listening',
      'Works in the background on mobile',
    ],
  },
  {
    id: 'report-cards',
    title: 'GM Report Cards',
    tagline: 'Data-backed ownership grades',
    description:
      'How good (or bad) are Chicago\'s owners? We grade every ownership group on Spending, Results, Fan Sentiment, and Loyalty Tax — with Scout AI commentary on the decisions that matter.',
    href: '/owner',
    icon: '',
    accentColor: '#D6B05E',
    screenshotPlaceholder: 'owner',
    tips: [
      'Grades based on real spending and results data',
      'Scout AI provides context on each grade',
      'Compare owners across all 5 teams',
    ],
  },
]

export default function TrainingPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [direction, setDirection] = useState<'next' | 'prev'>('next')

  const feature = FEATURES[currentStep]
  const isFirst = currentStep === 0
  const isLast = currentStep === FEATURES.length - 1
  const progress = ((currentStep + 1) / FEATURES.length) * 100

  const goTo = useCallback((step: number, dir: 'next' | 'prev') => {
    if (step < 0 || step >= FEATURES.length || isTransitioning) return
    setDirection(dir)
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentStep(step)
      setIsTransitioning(false)
    }, 250)
  }, [isTransitioning])

  const handleNext = () => goTo(currentStep + 1, 'next')
  const handlePrev = () => goTo(currentStep - 1, 'prev')

  const handleFinish = () => {
    router.push('/')
  }

  const handleTryIt = () => {
    window.open(feature.href, '_blank')
  }

  // Keyboard nav
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' && !isLast) handleNext()
      if (e.key === 'ArrowLeft' && !isFirst) handlePrev()
      if (e.key === 'Enter' && isLast) handleFinish()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep, isLast, isFirst, isTransitioning])

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0B0F14',
      color: '#FAFAFB',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'var(--font-space-grotesk, "Space Grotesk", system-ui, sans-serif)',
    }}>
      {/* Top bar */}
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 24px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Image src="/logos/v2_SM_Whole.png" alt="Sports Mockery" width={120} height={30} style={{ height: 'auto' }} />
          <span style={{
            fontSize: '12px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
            color: '#00D4FF', background: 'rgba(0,212,255,0.1)', padding: '3px 8px', borderRadius: '4px',
          }}>
            Getting Started
          </span>
        </div>
        <button
          onClick={handleFinish}
          style={{
            background: 'none', border: 'none', color: 'rgba(250,250,251,0.4)',
            fontSize: '13px', fontWeight: 500, cursor: 'pointer', padding: '8px 12px',
          }}
        >
          Skip tour
        </button>
      </header>

      {/* Progress bar */}
      <div style={{ height: '3px', background: 'rgba(255,255,255,0.04)' }}>
        <div style={{
          height: '100%', width: `${progress}%`,
          background: 'linear-gradient(90deg, #BC0000, #00D4FF)',
          transition: 'width 0.4s ease',
        }} />
      </div>

      {/* Main content */}
      <main style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '32px 24px',
        overflow: 'hidden',
      }}>
        <div style={{
          width: '100%', maxWidth: '960px',
          opacity: isTransitioning ? 0 : 1,
          transform: isTransitioning
            ? `translateX(${direction === 'next' ? '-40px' : '40px'})`
            : 'translateX(0)',
          transition: 'all 0.25s ease',
        }}>
          {/* Step counter */}
          <div style={{
            fontSize: '12px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase',
            color: 'rgba(250,250,251,0.3)', marginBottom: '20px',
          }}>
            {currentStep + 1} of {FEATURES.length}
          </div>

          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px',
            alignItems: 'center',
          }}>
            {/* Left — Info */}
            <div>
              {/* Feature title */}
              <div style={{
                display: 'inline-block',
                padding: '4px 12px', borderRadius: '6px',
                background: `${feature.accentColor}15`,
                border: `1px solid ${feature.accentColor}30`,
                fontSize: '12px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
                color: feature.accentColor,
                marginBottom: '16px',
              }}>
                {feature.title}
              </div>

              <h1 style={{
                fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 700,
                lineHeight: 1.15, marginBottom: '12px',
                letterSpacing: '-0.02em',
              }}>
                {feature.tagline}
              </h1>

              <p style={{
                fontSize: '16px', lineHeight: 1.65,
                color: 'rgba(250,250,251,0.6)', marginBottom: '28px',
                maxWidth: '440px',
              }}>
                {feature.description}
              </p>

              {/* Tips */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '32px' }}>
                {feature.tips.map((tip, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'flex-start', gap: '10px',
                    fontSize: '14px', color: 'rgba(250,250,251,0.5)',
                  }}>
                    <span style={{
                      color: feature.accentColor, fontSize: '16px', lineHeight: 1.2, flexShrink: 0,
                    }}>
                      {'\u2192'}
                    </span>
                    {tip}
                  </div>
                ))}
              </div>

              {/* Try it button */}
              <button
                onClick={handleTryIt}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  padding: '10px 20px', borderRadius: '8px',
                  background: `${feature.accentColor}18`,
                  border: `1px solid ${feature.accentColor}40`,
                  color: feature.accentColor,
                  fontSize: '14px', fontWeight: 600, cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                Try it now
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 17l9.2-9.2M17 17V7H7" />
                </svg>
              </button>
            </div>

            {/* Right — Visual preview */}
            <div style={{
              position: 'relative',
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '16px',
              overflow: 'hidden',
              aspectRatio: '4/3',
            }}>
              {/* Accent glow */}
              <div style={{
                position: 'absolute', inset: 0,
                background: `radial-gradient(ellipse at 30% 20%, ${feature.accentColor}12, transparent 70%)`,
                pointerEvents: 'none',
              }} />

              {/* Feature visual */}
              <div style={{
                position: 'absolute', inset: 0,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                padding: '32px',
              }}>
                {/* Icon */}
                <div style={{
                  width: 72, height: 72, borderRadius: '16px',
                  background: `${feature.accentColor}15`,
                  border: `2px solid ${feature.accentColor}30`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '20px',
                }}>
                  {feature.id === 'scout-ai' ? (
                    <Image src={feature.icon} alt="Scout" width={48} height={48} />
                  ) : (
                    <FeatureIcon id={feature.id} color={feature.accentColor} />
                  )}
                </div>

                <div style={{
                  fontSize: '22px', fontWeight: 700, color: '#FAFAFB',
                  marginBottom: '8px', textAlign: 'center',
                }}>
                  {feature.title}
                </div>

                {/* Simulated UI elements */}
                <div style={{
                  width: '80%', maxWidth: '300px',
                  display: 'flex', flexDirection: 'column', gap: '8px',
                  marginTop: '16px',
                }}>
                  <div style={{ height: 10, borderRadius: 5, background: 'rgba(255,255,255,0.06)', width: '100%' }} />
                  <div style={{ height: 10, borderRadius: 5, background: 'rgba(255,255,255,0.04)', width: '80%' }} />
                  <div style={{ height: 10, borderRadius: 5, background: 'rgba(255,255,255,0.03)', width: '60%' }} />
                  <div style={{
                    marginTop: '8px', padding: '12px', borderRadius: '10px',
                    border: `1px solid ${feature.accentColor}25`,
                    background: `${feature.accentColor}08`,
                    display: 'flex', alignItems: 'center', gap: '8px',
                  }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: feature.accentColor }} />
                    <div style={{ height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.08)', flex: 1 }} />
                  </div>
                </div>

                {/* Route path badge */}
                <div style={{
                  position: 'absolute', bottom: '16px', right: '16px',
                  fontSize: '11px', fontWeight: 600, fontFamily: 'monospace',
                  color: 'rgba(250,250,251,0.2)', background: 'rgba(255,255,255,0.03)',
                  padding: '4px 8px', borderRadius: '4px',
                }}>
                  {feature.href}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom navigation */}
      <footer style={{
        padding: '20px 24px',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        {/* Step dots */}
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          {FEATURES.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i, i > currentStep ? 'next' : 'prev')}
              aria-label={`Go to step ${i + 1}`}
              style={{
                width: i === currentStep ? 24 : 8,
                height: 8,
                borderRadius: 4,
                border: 'none',
                cursor: 'pointer',
                background: i === currentStep
                  ? feature.accentColor
                  : i < currentStep
                    ? 'rgba(250,250,251,0.2)'
                    : 'rgba(250,250,251,0.08)',
                transition: 'all 0.3s ease',
              }}
            />
          ))}
        </div>

        {/* Nav buttons */}
        <div style={{ display: 'flex', gap: '12px' }}>
          {!isFirst && (
            <button
              onClick={handlePrev}
              style={{
                padding: '10px 20px', borderRadius: '8px', cursor: 'pointer',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: 'rgba(250,250,251,0.6)',
                fontSize: '14px', fontWeight: 500,
                transition: 'all 0.15s',
              }}
            >
              Previous
            </button>
          )}

          {isLast ? (
            <button
              onClick={handleFinish}
              style={{
                padding: '10px 28px', borderRadius: '8px', cursor: 'pointer',
                background: '#BC0000',
                border: '1px solid rgba(188,0,0,0.6)',
                color: '#fff',
                fontSize: '14px', fontWeight: 700,
                transition: 'all 0.15s',
              }}
            >
              Start exploring
            </button>
          ) : (
            <button
              onClick={handleNext}
              style={{
                padding: '10px 28px', borderRadius: '8px', cursor: 'pointer',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#FAFAFB',
                fontSize: '14px', fontWeight: 600,
                display: 'flex', alignItems: 'center', gap: '8px',
                transition: 'all 0.15s',
              }}
            >
              Next
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>
      </footer>

      {/* Mobile responsive */}
      <style>{`
        @media (max-width: 768px) {
          main > div > div {
            grid-template-columns: 1fr !important;
            gap: 24px !important;
          }
        }
      `}</style>
    </div>
  )
}

function FeatureIcon({ id, color }: { id: string; color: string }) {
  const style = { width: 32, height: 32, color }

  switch (id) {
    case 'fan-chat':
      return (
        <svg style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      )
    case 'game-center':
      return (
        <svg style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="7" width="20" height="15" rx="2" ry="2" /><polyline points="17 2 12 7 7 2" />
        </svg>
      )
    case 'war-room':
      return (
        <svg style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5" />
        </svg>
      )
    case 'team-stats':
      return (
        <svg style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
        </svg>
      )
    case 'vision-theater':
      return (
        <svg style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="5 3 19 12 5 21 5 3" />
        </svg>
      )
    case 'hands-free':
      return (
        <svg style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
        </svg>
      )
    case 'report-cards':
      return (
        <svg style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
        </svg>
      )
    default:
      return null
  }
}
