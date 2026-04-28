'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  X, Search, Plus, Type, Heading, ImageIcon, Play, Quote, Share2, Minus,
  Sparkles, BarChart, Users, ArrowRightLeft, List, Thermometer,
  Vote, Swords, Flame, Bell,
} from 'lucide-react';
import { BLOCK_CATEGORIES, type BlockType } from './types';

interface BlockPickerModalProps {
  open: boolean;
  onClose: () => void;
  onInsert: (type: BlockType) => void;
}

// ─── Mock Preview Renderers ───
// Tiny visual mocks rendered inside each picker card.

function PreviewParagraph() {
  return (
    <div
      className="px-1 text-[7.5px] leading-[1.55] text-white/75"
      style={{
        fontFamily:
          'var(--font-space-grotesk), ui-sans-serif, system-ui, -apple-system, sans-serif',
      }}
    >
      Caleb Williams sliced through the Lions secondary on consecutive
      drives, finishing 24-of-31 for 312 yards and three scores. Eberflus
      called it the cleanest pocket play of the season.
    </div>
  );
}

function PreviewHeading() {
  return (
    <div className="flex flex-col gap-1 px-1">
      <span
        className="text-[14px] font-bold leading-[1.05] tracking-[-0.02em] text-white"
        style={{
          fontFamily:
            'var(--font-space-grotesk), ui-sans-serif, system-ui, sans-serif',
        }}
      >
        The Bears Just Changed Everything
      </span>
      <span className="text-[7.5px] uppercase tracking-[0.18em] text-white/35">
        Section heading
      </span>
    </div>
  );
}

function PreviewImage() {
  return (
    <div className="px-1">
      <div
        className="relative h-14 w-full overflow-hidden rounded-md"
        style={{
          backgroundImage:
            'radial-gradient(circle at 22% 30%, #2a4d6e 0%, transparent 55%),' +
            'radial-gradient(circle at 78% 65%, #5b1a1a 0%, transparent 60%),' +
            'radial-gradient(circle at 50% 90%, #6c5a2a 0%, transparent 65%),' +
            'linear-gradient(135deg, #1f2a36 0%, #14202c 100%)',
          filter: 'saturate(1.05)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        {/* Soft sun-flare to suggest a real photo */}
        <div
          aria-hidden
          className="absolute"
          style={{
            top: '8%',
            left: '18%',
            width: '40%',
            height: '40%',
            borderRadius: '9999px',
            background:
              'radial-gradient(circle, rgba(255,255,255,0.35), rgba(255,255,255,0) 70%)',
            filter: 'blur(4px)',
          }}
        />
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(0,0,0,0) 60%, rgba(0,0,0,0.4) 100%)',
          }}
        />
        <div className="absolute bottom-1 left-1.5 right-1.5 truncate text-[7px] text-white/85">
          Soldier Field, Sunday afternoon
        </div>
      </div>
    </div>
  );
}

function PreviewVideo() {
  return (
    <div
      className="relative h-16 w-full overflow-hidden rounded-md"
      style={{
        background:
          'radial-gradient(circle at 30% 35%, #1a2c3d 0%, transparent 55%),' +
          'linear-gradient(135deg, #0b0f14 0%, #050709 100%)',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      {/* Subtle scan-line glow */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-1/2"
        style={{
          background:
            'linear-gradient(180deg, rgba(0,212,255,0.07) 0%, transparent 100%)',
        }}
      />
      {/* Play button overlay */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="flex h-8 w-8 items-center justify-center rounded-full"
          style={{
            backgroundColor: 'rgba(255,255,255,0.95)',
            boxShadow: '0 4px 14px rgba(0,0,0,0.45)',
          }}
        >
          <Play size={12} className="ml-0.5 text-black" fill="black" />
        </div>
      </div>
      {/* Timecode chip */}
      <div
        className="absolute bottom-1 right-1 rounded px-1 text-[7.5px] font-medium tabular-nums text-white/90"
        style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}
      >
        0:42
      </div>
    </div>
  );
}

function PreviewQuote() {
  return (
    <div className="flex items-stretch gap-2 px-1">
      <div
        className="w-[3px] rounded-full"
        style={{ backgroundColor: '#BC0000' }}
      />
      <div className="flex flex-1 flex-col gap-1">
        <span
          className="text-[8.5px] italic leading-[1.45] text-white/85"
          style={{
            fontFamily:
              'var(--font-space-grotesk), ui-sans-serif, system-ui, serif',
          }}
        >
          “We&rsquo;re not playing for moral victories anymore. We&rsquo;re
          playing for January.”
        </span>
        <span className="text-[7px] uppercase tracking-[0.18em] text-white/45">
          — Head Coach
        </span>
      </div>
    </div>
  );
}

function PreviewSocialEmbed() {
  return (
    <div
      className="flex items-start gap-2 rounded-md p-2"
      style={{
        backgroundColor: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.1)',
      }}
    >
      <div
        className="h-6 w-6 shrink-0 rounded-full"
        style={{
          background:
            'conic-gradient(from 220deg, #00D4FF, #BC0000, #D6B05E, #00D4FF)',
        }}
      />
      <div className="flex flex-1 flex-col gap-0.5">
        <div className="flex items-center gap-1 text-[8px]">
          <span className="font-semibold text-white">Sports Mockery</span>
          <span className="text-white/40">@sportsmockery</span>
        </div>
        <div className="text-[7.5px] leading-[1.45] text-white/75">
          BREAKING: Bears reportedly engaged on a tackle. Front office not
          done reshaping the line.
        </div>
        <div className="mt-1 flex items-center gap-3 text-[7px] text-white/45">
          <span>♥ 2.1k</span>
          <span>↻ 487</span>
        </div>
      </div>
    </div>
  );
}

function PreviewDivider() {
  return (
    <div className="flex flex-col gap-2 px-1 pt-2">
      <div className="h-1 w-[70%] rounded-full bg-white/30" />
      <div className="h-px w-full bg-white/40" />
      <div className="h-1 w-[55%] rounded-full bg-white/30" />
    </div>
  );
}

function PreviewScoutInsight() {
  return (
    <div
      className="flex items-start gap-2 rounded-md p-2"
      style={{
        background:
          'linear-gradient(135deg, rgba(0,212,255,0.15), rgba(0,212,255,0.04))',
        border: '1px solid rgba(0,212,255,0.25)',
      }}
    >
      <Sparkles size={12} className="mt-0.5 shrink-0 text-[#00D4FF]" />
      <div className="flex flex-1 flex-col gap-1">
        <div className="h-1 w-[80%] rounded-full bg-white/55" />
        <div className="h-1 w-[60%] rounded-full bg-white/35" />
      </div>
    </div>
  );
}

function PreviewChart() {
  const bars = [40, 75, 55, 92, 68];
  return (
    <div className="flex h-14 items-end gap-1.5 px-1">
      {bars.map((h, i) => (
        <div
          key={i}
          className="flex-1 rounded-t"
          style={{
            height: `${h}%`,
            background:
              'linear-gradient(180deg, rgba(0,212,255,0.85), rgba(0,212,255,0.35))',
          }}
        />
      ))}
    </div>
  );
}

function PreviewPlayerComparison() {
  return (
    <div className="flex items-center justify-between gap-2 px-1">
      <div className="flex flex-col items-center gap-1">
        <div
          className="h-7 w-7 rounded-full"
          style={{ background: 'linear-gradient(135deg, #00D4FF, #0088aa)' }}
        />
        <div className="h-1 w-8 rounded-full bg-white/45" />
      </div>
      <div className="text-[9px] font-bold uppercase tracking-widest text-white/55">vs</div>
      <div className="flex flex-col items-center gap-1">
        <div
          className="h-7 w-7 rounded-full"
          style={{ background: 'linear-gradient(135deg, #BC0000, #7a0000)' }}
        />
        <div className="h-1 w-8 rounded-full bg-white/45" />
      </div>
    </div>
  );
}

function PreviewTradeScenario() {
  return (
    <div className="flex items-center justify-between gap-2 px-1">
      <div className="flex h-9 flex-1 items-center justify-center rounded-md text-[10px] font-bold text-white/85"
        style={{ backgroundColor: 'rgba(0,212,255,0.15)', border: '1px solid rgba(0,212,255,0.3)' }}>
        A
      </div>
      <ArrowRightLeft size={14} className="text-white/55" />
      <div className="flex h-9 flex-1 items-center justify-center rounded-md text-[10px] font-bold text-white/85"
        style={{ backgroundColor: 'rgba(188,0,0,0.15)', border: '1px solid rgba(188,0,0,0.3)' }}>
        B
      </div>
    </div>
  );
}

function PreviewMockDraft() {
  return (
    <div className="flex flex-col gap-1 px-1">
      {[1, 2, 3].map((n) => (
        <div key={n} className="flex items-center gap-1.5">
          <span
            className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded text-[8px] font-bold tabular-nums"
            style={{ backgroundColor: 'rgba(214,176,94,0.2)', color: '#D6B05E' }}
          >
            {n}
          </span>
          <div className="h-1 w-[70%] rounded-full bg-white/45" />
        </div>
      ))}
    </div>
  );
}

function PreviewSentimentMeter() {
  return (
    <div className="flex flex-col gap-1.5 px-1">
      <div className="flex h-3 w-full overflow-hidden rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}>
        <div className="h-full" style={{ width: '65%', background: 'linear-gradient(90deg, #00D4FF, #BC0000)' }} />
      </div>
      <div className="flex justify-between text-[8px] uppercase tracking-widest text-white/45">
        <span>Low</span>
        <span>Strong</span>
      </div>
    </div>
  );
}

function PreviewInteraction() {
  return (
    <div className="flex flex-col gap-1.5 px-1">
      <div className="flex items-center gap-1.5">
        <div
          className="h-3 w-3 rounded-sm"
          style={{
            border: '1.5px solid rgba(0,212,255,0.7)',
            backgroundColor: 'rgba(0,212,255,0.15)',
          }}
        />
        <div className="h-1.5 flex-1 rounded-full bg-white/40" />
      </div>
      <div className="flex items-center gap-1.5">
        <div className="h-3 w-3 rounded-sm" style={{ border: '1.5px solid rgba(255,255,255,0.25)' }} />
        <div className="h-1.5 w-[70%] rounded-full bg-white/30" />
      </div>
    </div>
  );
}

function PreviewDebate() {
  return (
    <div className="grid grid-cols-2 gap-1.5 px-1">
      <div
        className="flex h-9 items-center justify-center rounded-md text-[9px] font-bold uppercase tracking-widest"
        style={{
          backgroundColor: 'rgba(0,212,255,0.15)',
          color: '#00D4FF',
          border: '1px solid rgba(0,212,255,0.3)',
        }}
      >
        Pro
      </div>
      <div
        className="flex h-9 items-center justify-center rounded-md text-[9px] font-bold uppercase tracking-widest"
        style={{
          backgroundColor: 'rgba(188,0,0,0.15)',
          color: '#BC0000',
          border: '1px solid rgba(188,0,0,0.35)',
        }}
      >
        Con
      </div>
    </div>
  );
}

function PreviewHotTake() {
  return (
    <div
      className="flex items-start gap-2 rounded-md p-2"
      style={{
        background:
          'linear-gradient(135deg, rgba(188,0,0,0.18), rgba(188,0,0,0.04))',
        border: '1px solid rgba(188,0,0,0.3)',
      }}
    >
      <Flame size={12} className="mt-0.5 shrink-0 text-[#BC0000]" />
      <div className="flex flex-1 flex-col gap-1">
        <div className="h-1 w-[80%] rounded-full bg-white/65" />
        <div className="h-1 w-[55%] rounded-full bg-white/40" />
      </div>
    </div>
  );
}

function PreviewUpdate() {
  return (
    <div
      className="flex items-start gap-2 rounded-md p-2"
      style={{
        backgroundColor: 'rgba(188,0,0,0.06)',
        border: '1px solid rgba(188,0,0,0.2)',
      }}
    >
      <Bell size={12} className="mt-0.5 shrink-0 text-[#BC0000]" />
      <div className="flex flex-1 flex-col gap-1">
        <div className="flex items-center gap-1">
          <span className="text-[8px] font-bold uppercase tracking-widest text-[#BC0000]">Update</span>
          <span className="text-[8px] text-white/40">12:42 PM CT</span>
        </div>
        <div className="h-1 w-[78%] rounded-full bg-white/55" />
      </div>
    </div>
  );
}

const PREVIEW_MAP: Record<BlockType, React.ReactNode> = {
  paragraph: <PreviewParagraph />,
  heading: <PreviewHeading />,
  image: <PreviewImage />,
  video: <PreviewVideo />,
  quote: <PreviewQuote />,
  'social-embed': <PreviewSocialEmbed />,
  divider: <PreviewDivider />,
  'scout-insight': <PreviewScoutInsight />,
  'stats-chart': <PreviewChart />,
  'player-comparison': <PreviewPlayerComparison />,
  'trade-scenario': <PreviewTradeScenario />,
  'mock-draft': <PreviewMockDraft />,
  'sentiment-meter': <PreviewSentimentMeter />,
  interaction: <PreviewInteraction />,
  debate: <PreviewDebate />,
  'hot-take': <PreviewHotTake />,
  update: <PreviewUpdate />,
  // Legacy types — not surfaced in picker; mapped to new ones at create time
  'gm-interaction': <PreviewInteraction />,
  poll: <PreviewInteraction />,
  'rumor-meter': <PreviewSentimentMeter />,
  'heat-meter': <PreviewSentimentMeter />,
  'reaction-stream': <PreviewParagraph />,
};

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; style?: React.CSSProperties; className?: string }>> = {
  Type, Heading, Image: ImageIcon, Play, Minus, Quote, Share2,
  Sparkles, BarChart, Users, ArrowRightLeft, List, Thermometer,
  Vote, Swords, Flame, Bell,
};

const RED_BLOCKS: BlockType[] = ['sentiment-meter', 'hot-take', 'update', 'debate'];

export function BlockPickerModal({ open, onClose, onInsert }: BlockPickerModalProps) {
  const [search, setSearch] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setSearch('');
    const t = setTimeout(() => searchRef.current?.focus(), 50);
    return () => clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return BLOCK_CATEGORIES.map((cat) => ({
      ...cat,
      blocks: cat.blocks.filter(
        (b) =>
          !q ||
          b.label.toLowerCase().includes(q) ||
          b.description.toLowerCase().includes(q)
      ),
    })).filter((c) => c.blocks.length > 0);
  }, [search]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-start justify-center px-4 pt-16 pb-8 sm:pt-24"
      role="dialog"
      aria-modal="true"
      aria-label="Add content block"
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close block picker"
        onClick={onClose}
        className="absolute inset-0 cursor-default"
        style={{
          backgroundColor: 'rgba(11,15,20,0.72)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}
      />

      {/* Panel */}
      <div
        className="relative z-10 w-full max-w-4xl overflow-hidden rounded-3xl"
        style={{
          backgroundColor: 'rgba(15,20,28,0.92)',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow:
            '0 30px 90px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
        }}
        onAnimationEnd={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center gap-3 px-6 py-5"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div
            className="flex h-9 w-9 items-center justify-center rounded-xl"
            style={{
              backgroundColor: 'rgba(0,212,255,0.12)',
              border: '1px solid rgba(0,212,255,0.25)',
            }}
          >
            <Plus size={16} className="text-[#00D4FF]" />
          </div>
          <div className="flex-1">
            <div className="text-[15px] font-semibold tracking-[-0.01em] text-white">
              Add a block
            </div>
            <div className="text-[12px] text-white/50">
              Choose how to build the next part of your story
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-white/10"
            aria-label="Close"
          >
            <X size={16} className="text-white/70" />
          </button>
        </div>

        {/* Search */}
        <div className="px-6 pb-3 pt-4">
          <div
            className="flex items-center gap-2 rounded-xl px-3 py-2.5"
            style={{
              backgroundColor: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <Search size={14} className="text-white/45" />
            <input
              ref={searchRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search blocks..."
              className="flex-1 bg-transparent text-[14px] text-white placeholder-white/35 outline-none"
            />
            <kbd
              className="hidden items-center rounded-md px-1.5 py-0.5 text-[10px] font-medium tracking-wider text-white/45 sm:flex"
              style={{
                backgroundColor: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              ESC
            </kbd>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="max-h-[64vh] overflow-y-auto px-6 pb-7 pt-2">
          {filtered.length === 0 ? (
            <div className="py-16 text-center text-[13px] text-white/45">
              No blocks match &ldquo;{search}&rdquo;
            </div>
          ) : (
            filtered.map((cat) => {
              const catAccent =
                cat.label === 'Fan Interaction' ? '#BC0000' : '#00D4FF';
              return (
                <section key={cat.label} className="mt-5 first:mt-0">
                  <div className="mb-3 flex items-center gap-2">
                    <span
                      aria-hidden
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ backgroundColor: catAccent }}
                    />
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/55">
                      {cat.label}
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
                    {cat.blocks.map((block) => {
                      const Icon = ICON_MAP[block.icon] || Type;
                      const isRed = RED_BLOCKS.includes(block.type);
                      const accent = isRed ? '#BC0000' : catAccent;
                      return (
                        <BlockCard
                          key={block.type}
                          icon={Icon}
                          label={block.label}
                          description={block.description}
                          accent={accent}
                          preview={PREVIEW_MAP[block.type]}
                          onInsert={() => {
                            onInsert(block.type);
                          }}
                        />
                      );
                    })}
                  </div>
                </section>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

type IconLike = React.ComponentType<{
  size?: number;
  style?: React.CSSProperties;
  className?: string;
}>;

function BlockCard({
  icon: Icon,
  label,
  description,
  accent,
  preview,
  onInsert,
}: {
  icon: IconLike;
  label: string;
  description: string;
  accent: string;
  preview: React.ReactNode;
  onInsert: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onInsert}
      className="group relative flex w-full flex-col overflow-hidden rounded-2xl text-left transition-all duration-200 hover:-translate-y-[2px]"
      style={{
        backgroundColor: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.06)',
        boxShadow: '0 0 0 0 rgba(0,212,255,0)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = `${accent}66`;
        e.currentTarget.style.boxShadow = `0 0 0 1px ${accent}40, 0 12px 32px rgba(0,0,0,0.35)`;
        e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
        e.currentTarget.style.boxShadow = '0 0 0 0 rgba(0,212,255,0)';
        e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)';
      }}
    >
      {/* Preview frame */}
      <div
        className="flex h-[88px] w-full items-center justify-center px-4 py-3"
        style={{
          background:
            'linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0))',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        <div className="w-full">{preview}</div>
      </div>

      {/* Body */}
      <div className="flex items-start gap-3 p-4">
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
          style={{
            backgroundColor: `${accent}1f`,
            border: `1px solid ${accent}3a`,
          }}
        >
          <Icon size={14} style={{ color: accent }} />
        </div>
        <div className="flex-1">
          <div className="text-[13.5px] font-semibold tracking-[-0.005em] text-white">
            {label}
          </div>
          <div className="mt-0.5 text-[11.5px] leading-snug text-white/55">
            {description}
          </div>
        </div>
      </div>

      {/* Add Block badge — visible on hover */}
      <div
        className="pointer-events-none absolute right-3 top-3 flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider opacity-0 transition-all duration-200 group-hover:opacity-100"
        style={{
          backgroundColor: accent,
          color: accent === '#BC0000' ? '#FAFAFB' : '#0B0F14',
          boxShadow: `0 6px 20px ${accent}50`,
        }}
      >
        <Plus size={11} strokeWidth={2.6} />
        Add
      </div>
    </button>
  );
}
