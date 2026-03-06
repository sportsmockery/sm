'use client';

import React, { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

type EdgePanel =
  | { type: 'catch-up'; data: { items: { id: string; summary: string }[] } }
  | { type: 'scout'; title: string; prompt: string; answer: string };

const EXAMPLE_PROMPTS = [
  'Give me the Bears in 2 minutes',
  'Only good news about the Cubs',
  'Fix the Bulls with one trade',
] as const;

const TEAM_TILES = [
  { team: 'Bears', text: '28th in pressures, 1st in anxiety.', cssVar: '--bears-primary' },
  { team: 'Bulls', text: 'Net rating last 10: -3.2.', cssVar: '--bulls-primary' },
  { team: 'Cubs', text: 'Playoff odds: 37%.', cssVar: '--cubs-primary' },
] as const;

export default function EdgePage() {
  const router = useRouter();
  const [prompt, setPrompt] = useState('');
  const [panels, setPanels] = useState<EdgePanel[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const promptRef = useRef(prompt);
  promptRef.current = prompt;

  const tagline = getEdgeTagline();

  const scrollToSession = useCallback(() => {
    setTimeout(() => {
      const el = document.getElementById('edge-session');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }, []);

  const dismissError = useCallback(() => setError(null), []);

  const handleModeClick = useCallback(async (mode: 'catch-up' | 'feel-it' | 'control-it') => {
    if (mode === 'control-it') {
      router.push('/gm');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      if (mode === 'catch-up') {
        const res = await fetch('/api/edge/catch-up');
        if (!res.ok) throw new Error('Failed to load recap');
        const recap = await res.json();
        setPanels((prev) => [...prev, { type: 'catch-up', data: recap }]);
      } else if (mode === 'feel-it') {
        const q = 'Give me an emotional, Chicago-real recap of today for my teams in 3-5 bullets.';
        const answer = await callScout(q);
        setPanels((prev) => [...prev, { type: 'scout', title: 'Feel It', prompt: q, answer }]);
      }
      scrollToSession();
    } catch {
      setError('Something went wrong. Try again in a moment.');
    } finally {
      setIsSubmitting(false);
    }
  }, [router, scrollToSession]);

  const handlePromptSubmit = useCallback(async (e?: React.FormEvent, overridePrompt?: string) => {
    if (e) e.preventDefault();
    const question = (overridePrompt ?? promptRef.current).trim();
    if (!question) return;

    setIsSubmitting(true);
    setError(null);
    try {
      const answer = await callScout(question);
      setPanels((prev) => [...prev, { type: 'scout', title: 'EDGE Answer', prompt: question, answer }]);
      setPrompt('');
      scrollToSession();
    } catch {
      setError('Scout had trouble answering. Try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [scrollToSession]);

  const handleExampleClick = useCallback((example: string) => {
    setPrompt(example);
    void handlePromptSubmit(undefined, example);
  }, [handlePromptSubmit]);

  const handleClearSession = useCallback(() => {
    setPanels([]);
    setError(null);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="min-h-screen flex flex-col text-[var(--sm-text)]"
      style={{
        background:
          'radial-gradient(circle at top, rgba(188,0,0,0.18), transparent 55%), radial-gradient(circle at bottom, rgba(14,51,134,0.22), transparent 60%), var(--sm-dark)',
      }}
    >
      {/* EDGE Identity Band */}
      <header
        className="h-[var(--sm-nav-height)] sticky top-0 z-30 border-b border-[var(--sm-border)] backdrop-blur-xl"
        style={{ background: 'var(--sm-nav-bg)' }}
      >
        <div className="max-w-6xl mx-auto h-full flex items-center justify-between px-4">
          <div className="flex items-baseline gap-2">
            <span className="text-xs uppercase tracking-[0.18em]" style={{ color: '#9090a8' }}>
              Sports Mockery
            </span>
            <span className="relative text-xl font-semibold tracking-[0.18em]">
              EDGE
              <span className="pointer-events-none absolute -bottom-1 left-0 h-[2px] w-8 bg-[var(--sm-red)] rotate-[-6deg]" />
            </span>
          </div>

          <div className="hidden md:block text-sm" style={{ color: '#9090a8' }}>
            {tagline}
          </div>

          <nav className="flex items-center gap-2 text-xs font-medium">
            <button
              className="px-3 py-1.5 rounded-[var(--sm-radius-pill)] border border-[var(--sm-border)] bg-[var(--sm-card)] hover:bg-[var(--sm-card-hover)] transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--sm-red)]"
              style={{ color: '#a0a0b8' }}
              onClick={() => router.push('/chicago-bears')}
            >
              Teams
            </button>
            <button
              className="px-3 py-1.5 rounded-[var(--sm-radius-pill)] border border-[var(--sm-border)] bg-[var(--sm-card)] hover:bg-[var(--sm-card-hover)] transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--sm-red)]"
              style={{ color: '#a0a0b8' }}
              onClick={() => router.push('/gm')}
            >
              Tools
            </button>
            <button
              className="px-3 py-1.5 rounded-[var(--sm-radius-pill)] text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--sm-red)]"
              style={{
                background: 'var(--sm-gradient)',
                boxShadow: 'var(--shadow-primary)',
                border: '1px solid rgba(0,0,0,0.4)',
              }}
              onClick={() => router.push('/pricing')}
            >
              SM+
            </button>
            <button
              className="px-3 py-1.5 rounded-[var(--sm-radius-pill)] border border-[var(--sm-border)] transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--sm-red)]"
              style={{ color: '#a0a0b8' }}
              onClick={() => router.push('/login')}
            >
              Log in
            </button>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Error toast */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-4xl mx-auto px-4 pt-4"
            >
              <div className="flex items-center justify-between rounded-[var(--sm-radius-md)] border border-[var(--sm-error)] px-4 py-3 text-sm" style={{ background: 'rgba(255,68,68,0.1)' }}>
                <span style={{ color: '#ff8888' }}>{error}</span>
                <button onClick={dismissError} className="ml-4 font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--sm-red)]" style={{ color: '#ff8888' }}>
                  Dismiss
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modes */}
        <section className="max-w-4xl mx-auto px-4 pt-10 pb-4 flex flex-col items-center gap-6">
          <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-3">
            <EdgeModeButton
              title="Catch Up"
              subtitle="EDGE recap in 90 seconds"
              onClick={() => handleModeClick('catch-up')}
              disabled={isSubmitting}
            />
            <EdgeModeButton
              title="Feel It"
              subtitle="Vents, hype, copium"
              onClick={() => handleModeClick('feel-it')}
              disabled={isSubmitting}
            />
            <EdgeModeButton
              title="Control It"
              subtitle="Trades, drafts, cap"
              onClick={() => handleModeClick('control-it')}
              disabled={isSubmitting}
            />
          </div>
        </section>

        {/* Prompt lane */}
        <section className="max-w-3xl mx-auto px-4 pb-8 flex flex-col items-center gap-3">
          <div
            className="w-full flex items-center gap-2 rounded-[var(--sm-radius-pill)] border border-[var(--sm-border)] px-3 py-2"
            style={{
              background: 'rgba(12,12,18,0.92)',
              backdropFilter: 'blur(24px)',
              boxShadow: '0 4px 30px rgba(0,0,0,0.4), 0 0 60px rgba(188,0,0,0.06)',
            }}
          >
            <motion.button
              className="h-8 w-8 flex-shrink-0 flex items-center justify-center rounded-full border border-[var(--sm-border)] bg-[var(--sm-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--sm-red)]"
              style={{ color: '#a0a0b8' }}
              disabled
              aria-label="Voice input (coming soon)"
              animate={{ scale: [1, 1.06, 1] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
              whileHover={{ scale: 1.12 }}
            >
              🎙
            </motion.button>
            <form
              onSubmit={handlePromptSubmit}
              className="flex-1 flex items-center gap-2"
            >
              <input
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                aria-label="Ask EDGE a question about Chicago sports"
                className="w-full bg-transparent border-0 outline-none text-sm placeholder:text-[#707088] focus:outline-none"
                style={{ color: 'var(--sm-text)' }}
                placeholder="Tell EDGE what you want from Chicago today..."
              />
            </form>
            <motion.button
              onClick={() => handlePromptSubmit()}
              disabled={isSubmitting}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              className="h-9 w-9 flex-shrink-0 flex items-center justify-center rounded-full text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--sm-red)]"
              style={{
                background: 'var(--sm-gradient)',
                boxShadow: '0 0 20px rgba(188,0,0,0.4)',
              }}
              aria-label="Submit question"
            >
              ✶
            </motion.button>
          </div>

          <div className="w-full flex flex-wrap gap-2 text-xs">
            {EXAMPLE_PROMPTS.map((example) => (
              <motion.button
                key={example}
                onClick={() => handleExampleClick(example)}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="px-3 py-1.5 rounded-[var(--sm-radius-pill)] border border-[var(--sm-border)] bg-[var(--sm-card)] hover:bg-[var(--sm-card-hover)] transition focus:outline-none focus:ring-2 focus:ring-[var(--sm-red)]"
                style={{ color: '#a0a0b8' }}
              >
                {example}
              </motion.button>
            ))}
          </div>
        </section>

        {/* Skyline divider */}
        <EdgeSkyline />

        {/* Live Chicago Strip */}
        <section
          className="border-t border-[var(--sm-border)]"
          style={{
            background: 'rgba(12,12,18,0.92)',
            backdropFilter: 'blur(24px)',
          }}
        >
          <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
            <div>
              <div className="text-xs uppercase tracking-[0.18em] mb-1" style={{ color: '#787890' }}>
                Tonight in Chicago
              </div>
              <div className="flex flex-wrap gap-2 text-sm" style={{ color: '#a0a0b8' }}>
                <span>Bears vs GB - 7:15 PM</span>
                <span className="hidden sm:inline">-</span>
                <span>Bulls @ DET - 6:00 PM</span>
              </div>
            </div>

            <div className="flex-1 flex justify-center">
              <div className="flex flex-wrap gap-2 text-xs">
                {TEAM_TILES.map((tile) => (
                  <EdgeTeamTile key={tile.team} {...tile} />
                ))}
              </div>
            </div>

            <div className="text-xs flex items-center gap-2" style={{ color: '#9090a8' }}>
              <span className="inline-block h-[2px] w-6 bg-[var(--sm-red)] rotate-[-6deg]" />
              <span>EDGE reads the city in real time.</span>
            </div>
          </div>
        </section>

        {/* Session area */}
        <section
          id="edge-session"
          className="max-w-4xl mx-auto px-4 py-6 space-y-4"
          aria-live="polite"
          aria-label="EDGE session results"
        >
          {panels.length === 0 && (
            <div className="text-xs text-center border border-dashed border-[var(--sm-border)] rounded-[var(--sm-radius-md)] px-4 py-6" style={{ color: '#787890' }}>
              Your EDGE session will appear here after you choose a mode or ask a question.
            </div>
          )}

          {panels.length > 0 && (
            <div className="flex justify-end">
              <motion.button
                onClick={handleClearSession}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="text-xs px-3 py-1.5 rounded-[var(--sm-radius-pill)] border border-[var(--sm-border)] bg-[var(--sm-card)] hover:bg-[var(--sm-card-hover)] transition focus:outline-none focus:ring-2 focus:ring-[var(--sm-red)]"
                style={{ color: '#a0a0b8' }}
              >
                New Session
              </motion.button>
            </div>
          )}

          <AnimatePresence mode="popLayout">
            {panels.map((panel, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
              >
                <EdgeSessionPanel panel={panel} />
              </motion.div>
            ))}
          </AnimatePresence>
        </section>
      </main>
    </motion.div>
  );
}

// ---- Subcomponents ----

function EdgeModeButton(props: {
  title: string;
  subtitle: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <motion.button
      onClick={props.onClick}
      disabled={props.disabled}
      whileHover={{ y: -2, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      className="group relative overflow-hidden rounded-[var(--sm-radius-lg)] border border-[var(--sm-border)] px-5 py-5 text-left transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--sm-red)]"
      style={{
        background: 'linear-gradient(135deg, rgba(19,19,29,0.96), rgba(10,10,18,0.96))',
        backdropFilter: 'blur(24px)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
      }}
    >
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{
          boxShadow: 'inset 0 0 40px rgba(188,0,0,0.08), 0 0 30px rgba(188,0,0,0.12)',
        }}
      />
      <div className="flex items-center justify-between gap-4 relative z-10">
        <div>
          <div className="text-xs uppercase tracking-[0.18em] mb-1" style={{ color: '#787890' }}>
            Mode
          </div>
          <div className="text-lg font-semibold">{props.title}</div>
          <div className="text-sm mt-1" style={{ color: '#a0a0b8' }}>
            {props.subtitle}
          </div>
        </div>
        <div className="relative h-10 w-10 flex items-center justify-center">
          <motion.span
            className="absolute h-10 w-[2px] bg-[var(--sm-red)] rotate-[18deg] opacity-60 group-hover:opacity-100"
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
      </div>
    </motion.button>
  );
}

function EdgeTeamTile(props: {
  team: string;
  text: string;
  cssVar: string;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
      className="px-3 py-1.5 rounded-[var(--sm-radius-pill)] border bg-[var(--sm-card)] hover:bg-[var(--sm-card-hover)] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--sm-red)]"
      style={{
        borderColor: `var(${props.cssVar})`,
        color: '#a0a0b8',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = `0 0 18px color-mix(in srgb, var(${props.cssVar}) 30%, transparent)`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <span className="font-semibold mr-1 text-[var(--sm-text)]">{props.team}:</span>
      {props.text}
    </motion.button>
  );
}

function EdgeSessionPanel({ panel }: { panel: EdgePanel }) {
  const panelStyle = {
    background: 'linear-gradient(135deg, rgba(19,19,29,0.96), rgba(10,10,18,0.96))',
    backdropFilter: 'blur(24px)',
    boxShadow: '0 4px 30px rgba(0,0,0,0.3), 0 0 1px rgba(255,255,255,0.05)',
  };

  if (panel.type === 'catch-up') {
    return (
      <article
        className="rounded-[var(--sm-radius-lg)] border border-[var(--sm-border)] p-5"
        style={panelStyle}
      >
        <header className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold tracking-[0.12em] uppercase">
            EDGE Recap
          </h2>
          <span className="text-xs" style={{ color: '#787890' }}>Catch Up</span>
        </header>
        <ul className="space-y-2 text-sm" style={{ color: '#b0b0c4' }}>
          {panel.data.items.map((item) => (
            <li key={item.id} className="flex gap-2">
              <span className="text-[var(--sm-red)] flex-shrink-0">-</span>
              <span>{item.summary}</span>
            </li>
          ))}
        </ul>
      </article>
    );
  }

  return (
    <article
      className="rounded-[var(--sm-radius-lg)] border border-[var(--sm-border)] p-5"
      style={panelStyle}
    >
      <header className="flex items-center justify-between mb-3">
        <h2 className="text-base font-semibold">{panel.title}</h2>
        <span className="text-xs" style={{ color: '#787890' }}>Scout take</span>
      </header>
      <p className="text-xs mb-3" style={{ color: '#8888a0' }}>
        Prompt: &quot;{panel.prompt}&quot;
      </p>
      <div className="text-sm whitespace-pre-wrap" style={{ color: '#b0b0c4' }}>
        {panel.answer}
      </div>
    </article>
  );
}

function EdgeSkyline() {
  return (
    <div className="w-full flex justify-center py-2">
      <motion.div
        className="h-6 max-w-xl w-full relative"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <svg
          viewBox="0 0 400 40"
          className="w-full h-full"
          preserveAspectRatio="xMidYMid meet"
          aria-hidden="true"
        >
          <polyline
            points="0,30 40,30 40,10 60,10 60,25 90,25 90,5 120,5 120,20 150,20 150,8 190,8 190,30 230,30 230,15 260,15 260,30 300,30 300,12 330,12 330,30 400,30"
            fill="none"
            stroke="rgba(188,0,0,0.85)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <div className="absolute inset-x-0 bottom-0 h-4 bg-gradient-to-t from-[rgba(188,0,0,0.35)] to-transparent pointer-events-none" />
      </motion.div>
    </div>
  );
}

// ---- Helpers ----

function getEdgeTagline() {
  const hour = typeof window === 'undefined' ? 12 : new Date().getHours();
  if (hour < 11)
    return 'Chicago Sports, On Command — Morning EDGE: What did you miss?';
  if (hour < 17)
    return 'Chicago Sports, On Command — Daytime EDGE: What matters now?';
  return 'Chicago Sports, On Command — Gameday EDGE: How are we winning?';
}

async function callScout(prompt: string): Promise<string> {
  const res = await fetch('/api/edge/scout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  });
  if (!res.ok) throw new Error('Scout request failed');
  const data = await res.json();
  return data.answer ?? '';
}
