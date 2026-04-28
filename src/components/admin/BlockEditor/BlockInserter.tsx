'use client';

import React from 'react';
import { Plus } from 'lucide-react';
import type { BlockType } from './types';

// Backwards-compatible export: existing call sites pass `onInsert(type)`.
// In the new flow, the BlockEditor opens a modal picker on request, so this
// component only needs to be a presentational "+ Add Block" trigger.
//
// To preserve the prop shape, we accept `onInsert` (no-op fallback) and an
// optional `onRequestPicker` — the editor wires the latter to open its modal.
interface BlockInserterProps {
  onInsert?: (type: BlockType) => void; // legacy, retained for compat
  onRequestPicker?: () => void;
  variant?: 'inline' | 'standalone';
}

export function BlockInserter({ onRequestPicker, variant = 'inline' }: BlockInserterProps) {
  if (variant === 'standalone') {
    return (
      <button
        type="button"
        onClick={onRequestPicker}
        className="group flex w-full items-center justify-center gap-2 rounded-xl py-4 transition-all"
        style={{
          backgroundColor: 'rgba(0,212,255,0.06)',
          border: '1px dashed rgba(0,212,255,0.35)',
          color: '#00D4FF',
        }}
      >
        <Plus size={14} />
        <span className="text-[12px] font-semibold uppercase tracking-[0.18em]">
          Add Block
        </span>
      </button>
    );
  }

  return (
    <div className="group/inserter relative flex justify-center py-1.5">
      <button
        type="button"
        onClick={onRequestPicker}
        className="flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] opacity-0 transition-all duration-150 group-hover/inserter:opacity-100 hover:scale-[1.03] focus:opacity-100"
        style={{
          backgroundColor: 'rgba(0,212,255,0.1)',
          color: '#00D4FF',
          border: '1px solid rgba(0,212,255,0.3)',
        }}
        aria-label="Add block here"
      >
        <Plus size={11} />
        Add Block
      </button>
      {/* Faint divider line on hover */}
      <span
        aria-hidden
        className="pointer-events-none absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 opacity-0 transition-opacity duration-150 group-hover/inserter:opacity-100"
        style={{
          background:
            'linear-gradient(90deg, transparent, rgba(0,212,255,0.25), transparent)',
        }}
      />
    </div>
  );
}
