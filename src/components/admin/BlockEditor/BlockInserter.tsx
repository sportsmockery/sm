'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  Plus, X, Type, Heading, ImageIcon, Play, Quote, Share2, ArrowRight,
} from 'lucide-react';
import type { BlockType } from './types';

interface QuickBlock {
  type: BlockType;
  label: string;
  Icon: React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>;
}

// Paragraph is intentionally first so that opening the panel and pressing
// Enter (or Tab+Enter) always falls through to the most common block.
const QUICK_BLOCKS: QuickBlock[] = [
  { type: 'paragraph', label: 'Paragraph', Icon: Type },
  { type: 'heading', label: 'Heading', Icon: Heading },
  { type: 'image', label: 'Image', Icon: ImageIcon },
  { type: 'video', label: 'Video', Icon: Play },
  { type: 'quote', label: 'Quote', Icon: Quote },
  { type: 'social-embed', label: 'Embed', Icon: Share2 },
];

interface BlockInserterProps {
  onInsert: (type: BlockType) => void;
  onRequestModal: () => void;
  // When true, the trigger fades in even without hover (used to reveal the
  // adjacent inserter while the writer's cursor is in the neighbouring block).
  revealed?: boolean;
}

export function BlockInserter({ onInsert, onRequestModal, revealed = false }: BlockInserterProps) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const firstBtnRef = useRef<HTMLButtonElement>(null);

  // Close on outside click.
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Close on ESC.
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open]);

  // Focus first quick block when panel opens — so Enter inserts a paragraph.
  useEffect(() => {
    if (open) {
      const t = window.setTimeout(() => firstBtnRef.current?.focus(), 30);
      return () => window.clearTimeout(t);
    }
  }, [open]);

  const handleQuick = (type: BlockType) => {
    onInsert(type);
    setOpen(false);
  };

  const handleBrowse = () => {
    setOpen(false);
    onRequestModal();
  };

  return (
    <div ref={wrapRef} className="block-inserter-wrap">
      <div className="group/inserter relative flex justify-center py-1.5">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className={`block-inserter-trigger flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] transition-all duration-100 hover:scale-[1.03] active:scale-[0.97] focus:outline-none ${
            open || revealed
              ? 'is-revealed'
              : ''
          }`}
          style={{
            backgroundColor: open ? 'rgba(0,212,255,0.18)' : 'rgba(0,212,255,0.1)',
            color: '#00D4FF',
            border: `1px solid rgba(0,212,255,${open ? 0.5 : 0.3})`,
          }}
          aria-expanded={open}
          aria-label="Add block here"
        >
          {open ? <X size={11} /> : <Plus size={11} />}
          {open ? 'Close' : 'Add Block'}
        </button>

        <span
          aria-hidden
          className={`pointer-events-none absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 transition-opacity duration-150 ${
            open || revealed ? 'opacity-100' : 'opacity-0 group-hover/inserter:opacity-100'
          }`}
          style={{
            background:
              'linear-gradient(90deg, transparent, rgba(0,212,255,0.25), transparent)',
          }}
        />

        <style jsx>{`
          .block-inserter-trigger {
            opacity: 0;
            transition-property: opacity, transform, background-color, box-shadow, border-color;
            transition-duration: 120ms;
          }
          .group\\/inserter:hover .block-inserter-trigger,
          .group\\/inserter:focus-within .block-inserter-trigger,
          .block-inserter-trigger.is-revealed {
            opacity: 1;
          }
        `}</style>
      </div>

      {open && (
        <div className="block-inserter-panel mt-1">
          <div
            className="overflow-hidden rounded-2xl"
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid rgba(0,0,0,0.08)',
              boxShadow:
                '0 18px 50px rgba(11,15,20,0.12), 0 2px 6px rgba(11,15,20,0.06)',
            }}
          >
            <div
              className="flex items-center justify-between px-4 py-2.5"
              style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}
            >
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                Quick blocks
              </span>
              <span className="text-[10px] text-slate-400">
                Press{' '}
                <kbd
                  className="rounded px-1 py-px font-mono text-[9px] tracking-tighter text-slate-500"
                  style={{
                    backgroundColor: 'rgba(0,0,0,0.04)',
                    border: '1px solid rgba(0,0,0,0.06)',
                  }}
                >
                  /
                </kbd>{' '}
                anywhere
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 p-3">
              {QUICK_BLOCKS.map(({ type, label, Icon }, i) => (
                <button
                  key={type}
                  ref={i === 0 ? firstBtnRef : undefined}
                  type="button"
                  onClick={() => handleQuick(type)}
                  className="group flex flex-col items-center gap-1.5 rounded-xl px-2 py-3 transition-all hover:-translate-y-[1px] active:scale-[0.97] focus:outline-none focus:ring-2 focus:ring-[#00D4FF]/40"
                  style={{
                    backgroundColor: 'rgba(11,15,20,0.025)',
                    border: '1px solid rgba(11,15,20,0.06)',
                    transitionProperty: 'transform, background-color, box-shadow, border-color',
                    transitionDuration: '120ms',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(0,212,255,0.45)';
                    e.currentTarget.style.boxShadow =
                      '0 0 0 1px rgba(0,212,255,0.25), 0 8px 18px rgba(0,212,255,0.12)';
                    e.currentTarget.style.backgroundColor = 'rgba(0,212,255,0.06)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(11,15,20,0.06)';
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.backgroundColor = 'rgba(11,15,20,0.025)';
                  }}
                >
                  <Icon size={16} className="text-[#0B0F14]" />
                  <span className="text-[11px] font-medium tracking-tight text-[#0B0F14]">
                    {label}
                  </span>
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={handleBrowse}
              className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left text-[12px] font-semibold tracking-[0.005em] transition-colors hover:bg-black/[0.03] active:scale-[0.997]"
              style={{
                color: '#0B0F14',
                borderTop: '1px solid rgba(0,0,0,0.05)',
              }}
            >
              <span>Browse all blocks</span>
              <ArrowRight size={13} className="text-[#00D4FF]" />
            </button>
          </div>

          <style jsx>{`
            .block-inserter-panel {
              animation: inline-picker-fade 120ms cubic-bezier(0.22, 1, 0.36, 1);
            }
            @keyframes inline-picker-fade {
              from {
                opacity: 0;
                transform: translateY(-2px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
            @media (prefers-reduced-motion: reduce) {
              .block-inserter-panel {
                animation: none;
              }
            }
          `}</style>
        </div>
      )}
    </div>
  );
}
