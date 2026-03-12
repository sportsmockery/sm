'use client';

import React from 'react';

/* ─── Brand Palette (single source of truth for preview components) ─── */

export const BRAND = {
  black: '#0B0F14',
  white: '#FAFAFB',
  red: '#BC0000',
  cyan: '#00D4FF',
  gold: '#D6B05E',
} as const;

/* ─── Base Primitives ─── */

/** Shared container styles used by all block-level primitives */
const BASE_CONTAINER: React.CSSProperties = {
  backgroundColor: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
};

/** Standard spacing wrapper — every preview block gets consistent vertical rhythm */
export function PreviewSection({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={`mb-6 ${className || ''}`}>{children}</div>;
}

/** Consistent empty-state placeholder for blocks without content */
export function EmptyState({ label, accent = '#A0A8B0' }: { label: string; accent?: string }) {
  return (
    <PreviewSection>
      <div
        className="rounded-xl px-5 py-4 flex items-center gap-3"
        style={{
          backgroundColor: 'rgba(255,255,255,0.02)',
          border: '1px dashed rgba(255,255,255,0.10)',
        }}
      >
        <div
          className="w-2 h-2 rounded-full shrink-0"
          style={{ backgroundColor: accent, opacity: 0.5 }}
        />
        <span className="text-[13px] text-slate-500">{label}</span>
      </div>
    </PreviewSection>
  );
}

/* ─── Article Container Structure ─── */

/** ArticleMeta — brand identifier + status shown above article body */
export function ArticleMeta() {
  return (
    <div className="flex items-center gap-2 mb-6 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: BRAND.cyan }} />
      <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: BRAND.cyan }}>SM Edge</span>
      <span className="text-[11px] text-slate-600 ml-auto">Draft Preview</span>
    </div>
  );
}

/** ArticleBody — constrains content to readable article width */
export function ArticleBody({ children }: { children: React.ReactNode }) {
  return <div className="max-w-[720px] mx-auto">{children}</div>;
}

/* ─── Intelligence Primitives (cyan) ─── */

/** InsightBlock — wraps Scout AI analysis with cyan intelligence styling */
export function InsightBlock({ children }: { children: React.ReactNode }) {
  return <PreviewSection>{children}</PreviewSection>;
}

/* ─── Poll Primitives (cyan) ─── */

export type PollVariant = 'binary' | 'multi' | 'gm-decision' | 'prediction';

interface PollBlockProps {
  variant?: PollVariant;
  children: React.ReactNode;
}

/** PollBlock — engagement wrapper supporting multiple interaction styles */
export function PollBlock({ variant = 'binary', children }: PollBlockProps) {
  const variantLabel: Record<PollVariant, string> = {
    'binary': 'Fan Poll',
    'multi': 'Community Vote',
    'gm-decision': 'GM Pulse',
    'prediction': 'Prediction',
  };
  const variantAccent: Record<PollVariant, string> = {
    'binary': BRAND.cyan,
    'multi': BRAND.cyan,
    'gm-decision': BRAND.cyan,
    'prediction': BRAND.gold,
  };
  const accent = variantAccent[variant];

  return (
    <PreviewSection>
      <div className="relative">
        {/* Variant label badge */}
        <div className="flex items-center gap-2 mb-1">
          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: accent }} />
          <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: accent }}>
            {variantLabel[variant]}
          </span>
        </div>
        {children}
      </div>
    </PreviewSection>
  );
}

/* ─── Chart Primitives (cyan) ─── */

/** ChartBlock — analytics chart wrapper (bar/line charts, stat visualizations) */
export function ChartBlock({ children }: { children: React.ReactNode }) {
  return <PreviewSection>{children}</PreviewSection>;
}

/** PlayerComparisonBlock — side-by-side player metrics wrapper */
export function PlayerComparisonBlock({ children }: { children: React.ReactNode }) {
  return (
    <PreviewSection>
      <div className="rounded-xl overflow-hidden" style={BASE_CONTAINER}>
        <div
          className="flex items-center gap-2 px-5 py-2.5"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: BRAND.cyan }} />
          <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: BRAND.cyan }}>
            Player Comparison
          </span>
        </div>
        {children}
      </div>
    </PreviewSection>
  );
}

/** DraftPickBlock — mock draft scenario wrapper with gold highlight for top picks */
export function DraftPickBlock({ children }: { children: React.ReactNode }) {
  return (
    <PreviewSection>
      <div className="rounded-xl overflow-hidden" style={BASE_CONTAINER}>
        <div
          className="flex items-center gap-2 px-5 py-2.5"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: BRAND.gold }} />
          <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: BRAND.gold }}>
            Mock Draft
          </span>
        </div>
        <div className="p-4">
          {children}
        </div>
      </div>
    </PreviewSection>
  );
}

/* ─── Debate Primitives (red) ─── */

/** PreviewDebateBlock — tension/conflict wrapper for PRO vs CON */
export function PreviewDebateBlock({ children }: { children: React.ReactNode }) {
  return (
    <PreviewSection>
      <div className="rounded-xl overflow-hidden" style={BASE_CONTAINER}>
        <div
          className="flex items-center gap-2 px-5 py-2.5"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: BRAND.red }} />
          <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: BRAND.red }}>
            Debate
          </span>
        </div>
        {children}
      </div>
    </PreviewSection>
  );
}

/* ─── Rumor / Breaking Primitives (red) ─── */

/** RumorConfidenceBlock — red confidence meter with editorial severity emphasis */
export function RumorConfidenceBlock({ children, label = 'Rumor Confidence' }: { children: React.ReactNode; label?: string }) {
  return (
    <PreviewSection>
      <div
        className="rounded-xl p-5"
        style={{
          backgroundColor: 'rgba(188,0,0,0.04)',
          border: '1px solid rgba(188,0,0,0.15)',
        }}
      >
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: BRAND.red }} />
          <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: BRAND.red }}>
            {label}
          </span>
        </div>
        {children}
      </div>
    </PreviewSection>
  );
}

/** BreakingUpdateBlock — editorial callout style for breaking updates */
export function BreakingUpdateBlock({ children }: { children: React.ReactNode }) {
  return (
    <PreviewSection>
      <div
        className="rounded-xl border-l-4 p-4"
        style={{
          borderLeftColor: BRAND.red,
          backgroundColor: 'rgba(188,0,0,0.03)',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          borderRight: '1px solid rgba(255,255,255,0.06)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div className="flex items-center gap-2 mb-2">
          <span
            className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded"
            style={{ backgroundColor: 'rgba(188,0,0,0.12)', color: BRAND.red }}
          >
            Breaking
          </span>
        </div>
        {children}
      </div>
    </PreviewSection>
  );
}

/** RumorBlock — general trade/rumor wrapper for trade scenarios */
export function RumorBlock({ children }: { children: React.ReactNode }) {
  return <PreviewSection>{children}</PreviewSection>;
}

/* ─── Premium / Gold Primitives ─── */

/** TopTakeBlock — gold-accented wrapper for elite/featured takes */
export function TopTakeBlock({ children }: { children: React.ReactNode }) {
  return (
    <PreviewSection>
      <div
        className="rounded-xl p-5"
        style={{ backgroundColor: 'rgba(214,176,94,0.06)', border: '1px solid rgba(214,176,94,0.2)' }}
      >
        <div className="flex items-center gap-2 mb-2">
          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: BRAND.gold }} />
          <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: BRAND.gold }}>Top Take</span>
        </div>
        {children}
      </div>
    </PreviewSection>
  );
}
