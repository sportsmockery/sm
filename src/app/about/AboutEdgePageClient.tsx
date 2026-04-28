'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion, useReducedMotion } from 'framer-motion'
import type { ReactNode } from 'react'

const SM_RED = '#BC0000'
const EDGE_CYAN = '#00D4FF'
const INK = '#0B0F14'
const PAPER = '#FAFAFB'

function ChicagoStar({
  size = 18,
  color = SM_RED,
  opacity = 1,
  className,
}: {
  size?: number
  color?: string
  opacity?: number
  className?: string
}) {
  const cx = 50
  const cy = 50
  const outer = 48
  const inner = 20
  const points: string[] = []
  for (let i = 0; i < 12; i++) {
    const r = i % 2 === 0 ? outer : inner
    const angle = (Math.PI / 6) * i - Math.PI / 2
    points.push(`${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`)
  }
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      style={{ opacity }}
      aria-hidden="true"
    >
      <polygon points={points.join(' ')} fill={color} />
    </svg>
  )
}

function StarField() {
  const stars = [
    { top: '8%', left: '6%', size: 14, color: SM_RED, opacity: 0.18 },
    { top: '14%', left: '88%', size: 10, color: SM_RED, opacity: 0.12 },
    { top: '32%', left: '14%', size: 8, color: EDGE_CYAN, opacity: 0.1 },
    { top: '46%', left: '92%', size: 16, color: SM_RED, opacity: 0.1 },
    { top: '62%', left: '4%', size: 12, color: SM_RED, opacity: 0.14 },
    { top: '74%', left: '78%', size: 9, color: EDGE_CYAN, opacity: 0.09 },
    { top: '88%', left: '20%', size: 11, color: SM_RED, opacity: 0.11 },
    { top: '96%', left: '64%', size: 7, color: EDGE_CYAN, opacity: 0.08 },
  ]
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {stars.map((s, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            top: s.top,
            left: s.left,
          }}
        >
          <ChicagoStar size={s.size} color={s.color} opacity={s.opacity} />
        </div>
      ))}
    </div>
  )
}

function FadeIn({
  children,
  delay = 0,
  y = 18,
  className,
}: {
  children: ReactNode
  delay?: number
  y?: number
  className?: string
}) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export default function AboutEdgePageClient() {
  return (
    <main
      className="relative min-h-screen w-full overflow-hidden"
      style={{ backgroundColor: INK, color: PAPER }}
    >
      {/* Ambient page atmosphere */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[120vh]"
        style={{
          background:
            'radial-gradient(60% 50% at 50% 0%, rgba(188,0,0,0.18) 0%, rgba(188,0,0,0.06) 35%, rgba(11,15,20,0) 70%)',
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)',
          backgroundSize: '36px 36px',
          maskImage:
            'linear-gradient(to bottom, rgba(0,0,0,0.6), rgba(0,0,0,0.15) 60%, rgba(0,0,0,0))',
        }}
      />
      <StarField />

      {/* 1. HERO */}
      <section className="relative">
        <div className="mx-auto flex min-h-[88vh] max-w-6xl flex-col items-center justify-center px-6 pb-24 pt-32 text-center sm:pt-40">
          <FadeIn>
            <div
              className="mb-8 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-[12px] uppercase tracking-[0.18em]"
              style={{
                borderColor: 'rgba(255,255,255,0.12)',
                backgroundColor: 'rgba(255,255,255,0.04)',
                color: 'rgba(250,250,251,0.78)',
              }}
            >
              <span
                aria-hidden
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: SM_RED, boxShadow: `0 0 12px ${SM_RED}` }}
              />
              Sports Mockery EDGE
            </div>
          </FadeIn>

          <FadeIn delay={0.05}>
            <h1
              className="mx-auto max-w-4xl font-bold leading-[1.04] tracking-[-0.02em]"
              style={{ fontSize: 'clamp(40px, 6.4vw, 76px)', color: PAPER }}
            >
              Chicago sports move fast.
              <br className="hidden sm:block" />{' '}
              <span style={{ color: PAPER }}>EDGE keeps you</span>{' '}
              <span style={{ color: SM_RED }}>ahead.</span>
            </h1>
          </FadeIn>

          <FadeIn delay={0.12}>
            <p
              className="mx-auto mt-7 max-w-2xl text-[17px] leading-[1.7] sm:text-[19px]"
              style={{ color: 'rgba(250,250,251,0.72)' }}
            >
              We built Sports Mockery EDGE for fans who want more than recycled
              headlines. Every story is designed to add context, local
              perspective, fan reaction, and smarter analysis around what
              Chicago is already talking about.
            </p>
          </FadeIn>

          <FadeIn delay={0.2}>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
              <Link
                href="/edge"
                className="inline-flex h-12 items-center justify-center rounded-full px-7 text-[14px] font-semibold tracking-wide transition-transform hover:scale-[1.02]"
                style={{
                  backgroundColor: SM_RED,
                  color: PAPER,
                  boxShadow: '0 10px 40px rgba(188,0,0,0.35)',
                }}
              >
                Explore EDGE
              </Link>
              <Link
                href="#coverage-framework"
                className="inline-flex h-12 items-center justify-center rounded-full border px-7 text-[14px] font-semibold tracking-wide transition-colors hover:bg-white/5"
                style={{
                  borderColor: 'rgba(255,255,255,0.18)',
                  color: PAPER,
                }}
              >
                See How We Cover Stories
              </Link>
            </div>
          </FadeIn>

          <FadeIn delay={0.3}>
            <div className="mt-16 opacity-70">
              <Image
                src="/edge_logo.svg"
                alt="EDGE"
                width={360}
                height={108}
                priority
                style={{ height: 84, width: 'auto', opacity: 0.85 }}
              />
            </div>
          </FadeIn>
        </div>
      </section>

      {/* 2. WHAT EDGE IS */}
      <section className="relative px-6 py-24 sm:py-32">
        <div className="mx-auto max-w-6xl">
          <FadeIn>
            <h2
              className="mx-auto max-w-3xl text-center font-bold leading-[1.08] tracking-[-0.02em]"
              style={{ fontSize: 'clamp(30px, 4.4vw, 52px)' }}
            >
              More than headlines.{' '}
              <span style={{ color: 'rgba(250,250,251,0.55)' }}>
                More than reaction.
              </span>
            </h2>
          </FadeIn>

          <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-3 md:gap-6">
            {[
              {
                title: 'Fast',
                accent: SM_RED,
                text: 'We move at fan speed. When something breaks, Chicago fans should not have to wait hours to understand why it matters.',
              },
              {
                title: 'Contextual',
                accent: EDGE_CYAN,
                text: 'Reports, rumors, quotes, stats, local reaction, roster impact, cap meaning, and fan sentiment — pulled together in one place.',
              },
              {
                title: 'Local',
                accent: '#D6B05E',
                text: 'Chicago sports are emotional, loud, skeptical, loyal, and personal. EDGE is built around that reality.',
              },
            ].map((card, i) => (
              <FadeIn key={card.title} delay={i * 0.06}>
                <article
                  className="group relative h-full overflow-hidden rounded-2xl border p-8 backdrop-blur-xl transition-colors"
                  style={{
                    borderColor: 'rgba(255,255,255,0.08)',
                    backgroundColor: 'rgba(255,255,255,0.03)',
                  }}
                >
                  <div
                    aria-hidden
                    className="absolute inset-x-0 top-0 h-px"
                    style={{
                      background: `linear-gradient(90deg, transparent, ${card.accent}66, transparent)`,
                    }}
                  />
                  <div className="mb-5 flex items-center gap-2">
                    <span
                      aria-hidden
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ backgroundColor: card.accent }}
                    />
                    <span
                      className="text-[11px] uppercase tracking-[0.18em]"
                      style={{ color: 'rgba(250,250,251,0.55)' }}
                    >
                      Pillar
                    </span>
                  </div>
                  <h3
                    className="text-[28px] font-semibold tracking-[-0.01em]"
                    style={{ color: PAPER }}
                  >
                    {card.title}
                  </h3>
                  <p
                    className="mt-3 text-[15px] leading-[1.7]"
                    style={{ color: 'rgba(250,250,251,0.72)' }}
                  >
                    {card.text}
                  </p>
                </article>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* 3. COVERAGE TRANSPARENCY */}
      <section
        id="coverage-framework"
        className="relative scroll-mt-24 px-6 py-24 sm:py-32"
      >
        <div className="mx-auto max-w-5xl">
          <FadeIn>
            <p
              className="text-[12px] uppercase tracking-[0.22em]"
              style={{ color: SM_RED }}
            >
              How we cover stories
            </p>
          </FadeIn>
          <FadeIn delay={0.05}>
            <h2
              className="mt-4 max-w-3xl font-bold leading-[1.08] tracking-[-0.02em]"
              style={{ fontSize: 'clamp(30px, 4.4vw, 52px)' }}
            >
              We do not just chase headlines.{' '}
              <span style={{ color: 'rgba(250,250,251,0.55)' }}>
                We explain why they matter.
              </span>
            </h2>
          </FadeIn>
          <FadeIn delay={0.1}>
            <p
              className="mt-6 max-w-3xl text-[17px] leading-[1.7]"
              style={{ color: 'rgba(250,250,251,0.72)' }}
            >
              Some stories begin with a national report. Some begin with a
              local quote. Some begin with what fans are already debating. Our
              job is to identify what matters, credit where information comes
              from, and add the Chicago-specific context fans actually care
              about.
            </p>
          </FadeIn>

          <FadeIn delay={0.15}>
            <ol
              className="mt-12 overflow-hidden rounded-2xl border backdrop-blur-xl"
              style={{
                borderColor: 'rgba(255,255,255,0.08)',
                backgroundColor: 'rgba(255,255,255,0.03)',
              }}
            >
              {[
                'What happened?',
                'Where did it come from?',
                'What are we adding?',
                'Why does it matter to Chicago fans?',
                'What should fans watch next?',
              ].map((q, i, arr) => (
                <li
                  key={q}
                  className="flex items-center gap-5 px-6 py-5 sm:px-8 sm:py-6"
                  style={{
                    borderBottom:
                      i === arr.length - 1
                        ? 'none'
                        : '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  <span
                    className="flex h-9 w-9 flex-none items-center justify-center rounded-full text-[12px] font-semibold tabular-nums"
                    style={{
                      backgroundColor: 'rgba(188,0,0,0.12)',
                      color: SM_RED,
                      border: '1px solid rgba(188,0,0,0.28)',
                    }}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span
                    className="text-[17px] font-medium tracking-[-0.005em] sm:text-[19px]"
                    style={{ color: PAPER }}
                  >
                    {q}
                  </span>
                </li>
              ))}
            </ol>
          </FadeIn>
        </div>
      </section>

      {/* 4. SOURCE + CONTEXT DEMO MODULE */}
      <section className="relative px-6 py-24 sm:py-32">
        <div className="mx-auto max-w-5xl">
          <FadeIn>
            <div className="mb-10 flex items-center gap-3">
              <span
                className="text-[12px] uppercase tracking-[0.22em]"
                style={{ color: EDGE_CYAN }}
              >
                Worked example
              </span>
              <span
                aria-hidden
                className="h-px flex-1"
                style={{
                  background:
                    'linear-gradient(90deg, rgba(0,212,255,0.4), transparent)',
                }}
              />
            </div>
          </FadeIn>

          <FadeIn delay={0.05}>
            <article
              className="overflow-hidden rounded-3xl border backdrop-blur-2xl"
              style={{
                borderColor: 'rgba(255,255,255,0.1)',
                backgroundColor: 'rgba(255,255,255,0.04)',
                boxShadow:
                  '0 30px 80px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)',
              }}
            >
              <header
                className="flex items-center justify-between gap-4 border-b px-6 py-5 sm:px-10"
                style={{ borderColor: 'rgba(255,255,255,0.08)' }}
              >
                <div className="flex items-center gap-3">
                  <span
                    aria-hidden
                    className="h-2 w-2 rounded-full"
                    style={{
                      backgroundColor: EDGE_CYAN,
                      boxShadow: `0 0 14px ${EDGE_CYAN}`,
                    }}
                  />
                  <h3
                    className="text-[18px] font-semibold tracking-[-0.005em] sm:text-[20px]"
                    style={{ color: PAPER }}
                  >
                    Source + Context
                  </h3>
                </div>
                <span
                  className="hidden text-[11px] uppercase tracking-[0.18em] sm:block"
                  style={{ color: 'rgba(250,250,251,0.55)' }}
                >
                  Live worked example
                </span>
              </header>

              <div className="grid grid-cols-1 gap-px md:grid-cols-2"
                style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}
              >
                {[
                  {
                    label: 'Source',
                    color: 'rgba(250,250,251,0.55)',
                    body: 'National report on Bears offensive line interest.',
                  },
                  {
                    label: 'What we’re adding',
                    color: EDGE_CYAN,
                    body: 'How the move could affect Chicago’s current depth chart, cap flexibility, and draft priorities.',
                  },
                  {
                    label: 'Why it matters',
                    color: SM_RED,
                    body: 'The Bears may be signaling they are not done reshaping protection around Caleb Williams.',
                  },
                  {
                    label: 'What to watch',
                    color: '#D6B05E',
                    body: 'Veteran cuts, post-draft signings, and minicamp reps.',
                  },
                ].map((cell) => (
                  <div
                    key={cell.label}
                    className="px-6 py-7 sm:px-10 sm:py-9"
                    style={{ backgroundColor: INK }}
                  >
                    <div
                      className="mb-3 text-[11px] uppercase tracking-[0.22em]"
                      style={{ color: cell.color }}
                    >
                      {cell.label}
                    </div>
                    <p
                      className="text-[17px] leading-[1.6] tracking-[-0.005em] sm:text-[19px]"
                      style={{ color: PAPER }}
                    >
                      {cell.body}
                    </p>
                  </div>
                ))}
              </div>
            </article>
          </FadeIn>
        </div>
      </section>

      {/* 5. POWERED BY SCOUT */}
      <section className="relative px-6 py-24 sm:py-32">
        <div className="mx-auto max-w-5xl text-center">
          <FadeIn>
            <p
              className="text-[12px] uppercase tracking-[0.22em]"
              style={{ color: EDGE_CYAN }}
            >
              Powered by Scout
            </p>
          </FadeIn>
          <FadeIn delay={0.05}>
            <h2
              className="mx-auto mt-4 max-w-3xl font-bold leading-[1.08] tracking-[-0.02em]"
              style={{ fontSize: 'clamp(30px, 4.4vw, 52px)' }}
            >
              Scout gives every fan{' '}
              <span style={{ color: EDGE_CYAN }}>the quick read.</span>
            </h2>
          </FadeIn>
          <FadeIn delay={0.1}>
            <p
              className="mx-auto mt-6 max-w-2xl text-[17px] leading-[1.7]"
              style={{ color: 'rgba(250,250,251,0.72)' }}
            >
              Scout is our intelligence layer built to summarize stories,
              surface key details, connect related developments, and help fans
              understand the bigger picture without digging through five
              different tabs.
            </p>
          </FadeIn>

          <FadeIn delay={0.15}>
            <ul className="mx-auto mt-10 flex max-w-3xl flex-wrap justify-center gap-2.5">
              {[
                'Quick story summaries',
                'Key context',
                'Related articles',
                'Fan reaction signals',
                'Team-specific insights',
              ].map((pill) => (
                <li
                  key={pill}
                  className="rounded-full border px-4 py-2 text-[13px] font-medium backdrop-blur-md"
                  style={{
                    borderColor: 'rgba(0,212,255,0.22)',
                    backgroundColor: 'rgba(0,212,255,0.06)',
                    color: 'rgba(250,250,251,0.9)',
                  }}
                >
                  {pill}
                </li>
              ))}
            </ul>
          </FadeIn>
        </div>
      </section>

      {/* 6. MANIFESTO */}
      <section className="relative px-6 py-28 sm:py-40">
        <div className="mx-auto max-w-4xl text-center">
          <FadeIn>
            <h2
              className="mx-auto font-bold leading-[1.06] tracking-[-0.025em]"
              style={{ fontSize: 'clamp(34px, 5.4vw, 64px)' }}
            >
              Built for the Chicago fan{' '}
              <span style={{ color: SM_RED }}>who wants the edge.</span>
            </h2>
          </FadeIn>

          <FadeIn delay={0.08}>
            <div
              className="mx-auto mt-12 space-y-5 text-[18px] leading-[1.7] sm:text-[22px] sm:leading-[1.55]"
              style={{ color: 'rgba(250,250,251,0.86)' }}
            >
              <p>We believe fans deserve speed without confusion.</p>
              <p>Entertainment without deception.</p>
              <p>Opinion without pretending it is fact.</p>
              <p>Aggregation with credit.</p>
              <p>Analysis with local feel.</p>
              <p>And coverage that respects how deeply Chicago fans care.</p>
            </div>
          </FadeIn>

          <FadeIn delay={0.16}>
            <div
              aria-hidden
              className="mx-auto my-14 h-px w-24"
              style={{
                background:
                  'linear-gradient(90deg, transparent, rgba(188,0,0,0.6), transparent)',
              }}
            />
          </FadeIn>

          <FadeIn delay={0.2}>
            <p
              className="mx-auto max-w-2xl text-[19px] leading-[1.6] sm:text-[24px]"
              style={{ color: PAPER }}
            >
              Sports Mockery EDGE exists because the modern fan does not just
              want to know what happened.{' '}
              <span style={{ color: 'rgba(250,250,251,0.55)' }}>
                They want to know what it means.
              </span>
            </p>
          </FadeIn>
        </div>
      </section>

      {/* 7. FINAL CTA */}
      <section className="relative px-6 pb-32 pt-12 sm:pb-40">
        <div className="mx-auto max-w-5xl">
          <FadeIn>
            <div
              className="relative overflow-hidden rounded-3xl border px-8 py-16 text-center sm:px-16 sm:py-24"
              style={{
                borderColor: 'rgba(255,255,255,0.1)',
                backgroundColor: 'rgba(255,255,255,0.03)',
              }}
            >
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    'radial-gradient(50% 70% at 50% 0%, rgba(188,0,0,0.22) 0%, rgba(188,0,0,0) 70%)',
                }}
              />
              <div className="relative">
                <h2
                  className="mx-auto max-w-3xl font-bold leading-[1.06] tracking-[-0.02em]"
                  style={{ fontSize: 'clamp(30px, 4.6vw, 56px)' }}
                >
                  This is not old sports media.{' '}
                  <span style={{ color: SM_RED }}>
                    This is Chicago sports with an EDGE.
                  </span>
                </h2>

                <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
                  <Link
                    href="/edge"
                    className="inline-flex h-12 items-center justify-center rounded-full px-7 text-[14px] font-semibold tracking-wide transition-transform hover:scale-[1.02]"
                    style={{
                      backgroundColor: SM_RED,
                      color: PAPER,
                      boxShadow: '0 10px 40px rgba(188,0,0,0.35)',
                    }}
                  >
                    Enter EDGE
                  </Link>
                  <Link
                    href="/"
                    className="inline-flex h-12 items-center justify-center rounded-full border px-7 text-[14px] font-semibold tracking-wide transition-colors hover:bg-white/5"
                    style={{
                      borderColor: 'rgba(255,255,255,0.18)',
                      color: PAPER,
                    }}
                  >
                    Read Latest Stories
                  </Link>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>
    </main>
  )
}
