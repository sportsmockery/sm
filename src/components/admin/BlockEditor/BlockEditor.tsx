'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Eye, PenLine, Undo2, Redo2, Plus, Sparkles } from 'lucide-react';
import type { ContentBlock, BlockType, ArticleDocument } from './types';
import { createBlock, migrateBlock } from './types';
import { BlockInserter } from './BlockInserter';
import { BlockPanel } from './BlockEditorPanels';
import { BlockPreviewRenderer } from './BlockPreviewRenderer';
import { BlockPickerModal } from './BlockPickerModal';

interface BlockEditorProps {
  initialBlocks?: ContentBlock[];
  initialTemplate?: string;
  onChange?: (doc: ArticleDocument) => void;
}

export function BlockEditor({ initialBlocks, initialTemplate, onChange }: BlockEditorProps) {
  const [blocks, setBlocks] = useState<ContentBlock[]>(() =>
    (initialBlocks || []).filter(b => b.type !== 'reaction-stream').map(migrateBlock)
  );
  // Template state is preserved internally so existing drafts continue to
  // round-trip their template id through save/load. The UI no longer surfaces
  // the template picker — writers always start with a blank canvas.
  const [template] = useState(initialTemplate || '');
  const [mode, setMode] = useState<'edit' | 'preview'>('edit');
  const [history, setHistory] = useState<ContentBlock[][]>([]);
  const [future, setFuture] = useState<ContentBlock[][]>([]);

  // Block picker modal state
  const [pickerOpen, setPickerOpen] = useState(false);
  // Insert position: index *after* which to insert. null = append at end.
  const pickerInsertIndexRef = useRef<number | null>(null);
  // Track the most recently inserted block so we can scroll to it + focus.
  const [pendingFocusId, setPendingFocusId] = useState<string | null>(null);

  const pushHistory = useCallback((prev: ContentBlock[]) => {
    setHistory((h) => [...h.slice(-30), prev]);
    setFuture([]);
  }, []);

  const updateBlocks = useCallback((next: ContentBlock[]) => {
    pushHistory(blocks);
    setBlocks(next);
    onChange?.({ version: 1, template, blocks: next });
  }, [blocks, template, onChange, pushHistory]);

  const undo = useCallback(() => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setHistory((h) => h.slice(0, -1));
    setFuture((f) => [...f, blocks]);
    setBlocks(prev);
    onChange?.({ version: 1, template, blocks: prev });
  }, [history, blocks, template, onChange]);

  const redo = useCallback(() => {
    if (future.length === 0) return;
    const next = future[future.length - 1];
    setFuture((f) => f.slice(0, -1));
    setHistory((h) => [...h, blocks]);
    setBlocks(next);
    onChange?.({ version: 1, template, blocks: next });
  }, [future, blocks, template, onChange]);

  const insertBlock = useCallback((type: BlockType, afterIndex?: number | null) => {
    const newBlock = createBlock(type);
    const idx = afterIndex === undefined || afterIndex === null
      ? blocks.length
      : afterIndex + 1;
    const next = [...blocks];
    next.splice(idx, 0, newBlock);
    updateBlocks(next);
    setPendingFocusId(newBlock.id);
  }, [blocks, updateBlocks]);

  const updateBlock = useCallback((index: number, updated: ContentBlock) => {
    const next = [...blocks];
    next[index] = updated;
    updateBlocks(next);
  }, [blocks, updateBlocks]);

  const deleteBlock = useCallback((index: number) => {
    updateBlocks(blocks.filter((_, i) => i !== index));
  }, [blocks, updateBlocks]);

  const moveBlock = useCallback((from: number, to: number) => {
    if (to < 0 || to >= blocks.length) return;
    const next = [...blocks];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    updateBlocks(next);
  }, [blocks, updateBlocks]);

  const openPicker = useCallback((afterIndex: number | null) => {
    pickerInsertIndexRef.current = afterIndex;
    setPickerOpen(true);
  }, []);

  const handlePickerInsert = useCallback((type: BlockType) => {
    insertBlock(type, pickerInsertIndexRef.current);
    setPickerOpen(false);
  }, [insertBlock]);

  // After a block is inserted, scroll it into view and focus its first input.
  useEffect(() => {
    if (!pendingFocusId) return;
    const el = document.querySelector<HTMLElement>(
      `[data-block-id="${pendingFocusId}"]`
    );
    if (!el) {
      setPendingFocusId(null);
      return;
    }
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    const focusable = el.querySelector<HTMLElement>(
      'textarea, input:not([type="hidden"]), [contenteditable="true"]'
    );
    // Defer focus until the smooth scroll has had a tick to start.
    const t = window.setTimeout(() => {
      focusable?.focus();
    }, 120);
    setPendingFocusId(null);
    return () => window.clearTimeout(t);
  }, [pendingFocusId, blocks]);

  // "/" keyboard shortcut to open the picker — only when not already typing
  // in an editable surface.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key !== '/') return;
      if (pickerOpen) return;
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName?.toLowerCase();
      const isEditable =
        tag === 'input' ||
        tag === 'textarea' ||
        target?.isContentEditable === true;
      if (isEditable) return;
      e.preventDefault();
      // Append at end when triggered by shortcut.
      openPicker(null);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [pickerOpen, openPicker]);

  const hasStarted = blocks.length > 0;

  return (
    <div className="space-y-4">
      {hasStarted && (
        <div
          className="flex items-center justify-between px-4 py-2 rounded-xl"
          style={{
            backgroundColor: '#f8f9fa',
            border: '1px solid rgba(0,0,0,0.1)',
          }}
        >
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMode('edit')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-colors"
              style={{
                backgroundColor: mode === 'edit' ? 'rgba(0,212,255,0.15)' : 'transparent',
                color: mode === 'edit' ? '#00D4FF' : '#A0A8B0',
              }}
            >
              <PenLine size={13} /> Edit
            </button>
            <button
              type="button"
              onClick={() => setMode('preview')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-colors"
              style={{
                backgroundColor: mode === 'preview' ? 'rgba(0,212,255,0.15)' : 'transparent',
                color: mode === 'preview' ? '#00D4FF' : '#A0A8B0',
              }}
            >
              <Eye size={13} /> Preview
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden sm:inline text-[11px] text-slate-500">
              Press <kbd className="rounded bg-black/5 px-1 py-px font-mono text-[10px] tracking-tighter text-slate-600">/</kbd> to add a block
            </span>
            <span className="text-[11px] text-slate-500">{blocks.length} blocks</span>
            <button
              type="button"
              onClick={undo}
              disabled={history.length === 0}
              className="p-1.5 rounded-lg transition-colors disabled:opacity-30"
              style={{ color: '#A0A8B0' }}
              aria-label="Undo"
            >
              <Undo2 size={14} />
            </button>
            <button
              type="button"
              onClick={redo}
              disabled={future.length === 0}
              className="p-1.5 rounded-lg transition-colors disabled:opacity-30"
              style={{ color: '#A0A8B0' }}
              aria-label="Redo"
            >
              <Redo2 size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Editor / Preview */}
      {mode === 'edit' ? (
        hasStarted ? (
          <div className="space-y-2">
            {blocks.map((block, index) => (
              <React.Fragment key={block.id}>
                <div data-block-id={block.id}>
                  <BlockPanel
                    block={block}
                    onChange={(updated) => updateBlock(index, updated)}
                    onDelete={() => deleteBlock(index)}
                    onMoveUp={index > 0 ? () => moveBlock(index, index - 1) : undefined}
                    onMoveDown={index < blocks.length - 1 ? () => moveBlock(index, index + 1) : undefined}
                  />
                </div>
                <BlockInserter onRequestPicker={() => openPicker(index)} />
              </React.Fragment>
            ))}
            <div className="pt-1">
              <BlockInserter
                variant="standalone"
                onRequestPicker={() => openPicker(blocks.length - 1)}
              />
            </div>
          </div>
        ) : (
          <EmptyCanvas onAddContent={() => openPicker(null)} />
        )
      ) : (
        <div
          className="rounded-xl min-h-[400px] overflow-hidden"
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid rgba(0,0,0,0.1)',
          }}
        >
          <div
            className="flex items-center justify-between px-4 py-3 border-b"
            style={{ borderColor: 'rgba(0,0,0,0.08)', backgroundColor: '#f8f9fa' }}
          >
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Article Preview</span>
            <span className="text-[10px] text-slate-600">{blocks.length} blocks</span>
          </div>
          <div className="px-6 pt-8 pb-4 sm:px-10 max-w-[720px] mx-auto">
            <div className="flex items-center gap-2 mb-3">
              <span
                className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded"
                style={{ backgroundColor: 'rgba(188,0,0,0.12)', color: '#BC0000' }}
              >
                Category
              </span>
            </div>
            <h1 className="text-[28px] sm:text-[32px] font-bold tracking-tight mb-2" style={{ color: '#0B0F14' }}>
              Article Headline
            </h1>
            <div className="flex items-center gap-2 text-[13px] text-slate-500">
              <span>By Author</span>
              <span className="w-1 h-1 rounded-full bg-slate-600" />
              <span>Draft</span>
            </div>
          </div>
          <div className="px-6 pb-8 sm:px-10">
            <BlockPreviewRenderer blocks={blocks} />
          </div>
        </div>
      )}

      <BlockPickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onInsert={handlePickerInsert}
      />
    </div>
  );
}

// ─── Empty State ────────────────────────────────────────────────────────────
// Apple-style centered start panel. Replaces the old TemplateSelector entry
// point. No template picking — writers go straight to "+ Add Content".

function EmptyCanvas({ onAddContent }: { onAddContent: () => void }) {
  return (
    <div
      className="empty-canvas-fadein relative overflow-hidden rounded-2xl"
      style={{
        backgroundColor: '#ffffff',
        border: '1px solid rgba(0,0,0,0.08)',
        boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
      }}
    >
      {/* Soft cyan glow accent */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-48"
        style={{
          background:
            'radial-gradient(60% 100% at 50% 0%, rgba(0,212,255,0.10) 0%, rgba(0,212,255,0) 70%)',
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -bottom-24 h-48"
        style={{
          background:
            'radial-gradient(60% 100% at 50% 100%, rgba(188,0,0,0.06) 0%, rgba(188,0,0,0) 70%)',
        }}
      />

      <div className="relative flex flex-col items-center justify-center px-8 py-20 text-center sm:py-24">
        <div
          className="mb-7 flex h-16 w-16 items-center justify-center rounded-2xl"
          style={{
            background:
              'linear-gradient(135deg, rgba(0,212,255,0.16), rgba(0,212,255,0.04))',
            border: '1px solid rgba(0,212,255,0.25)',
            boxShadow: '0 8px 24px rgba(0,212,255,0.18)',
          }}
        >
          <Sparkles size={26} className="text-[#00D4FF]" />
        </div>

        <h2
          className="text-[28px] font-semibold tracking-[-0.02em] sm:text-[32px]"
          style={{ color: '#0B0F14' }}
        >
          Start your story
        </h2>
        <p className="mt-3 max-w-md text-[15px] leading-[1.6] text-slate-500">
          Write freely or build with blocks. Press{' '}
          <kbd
            className="rounded-md px-1.5 py-0.5 font-mono text-[12px] text-slate-600"
            style={{
              backgroundColor: 'rgba(0,0,0,0.05)',
              border: '1px solid rgba(0,0,0,0.08)',
            }}
          >
            /
          </kbd>{' '}
          anywhere to add a block.
        </p>

        <button
          type="button"
          onClick={onAddContent}
          className="mt-9 inline-flex h-12 items-center gap-2 rounded-full px-7 text-[14px] font-semibold tracking-wide transition-all hover:scale-[1.02] focus:scale-[1.02] focus:outline-none"
          style={{
            backgroundColor: '#0B0F14',
            color: '#FAFAFB',
            boxShadow: '0 12px 32px rgba(11,15,20,0.25)',
          }}
        >
          <Plus size={16} strokeWidth={2.4} />
          Add Content
        </button>
      </div>

      <style jsx>{`
        .empty-canvas-fadein {
          animation: empty-canvas-fade 360ms cubic-bezier(0.22, 1, 0.36, 1);
        }
        @keyframes empty-canvas-fade {
          from {
            opacity: 0;
            transform: translateY(6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .empty-canvas-fadein {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
