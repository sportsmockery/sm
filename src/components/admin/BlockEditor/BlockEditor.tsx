'use client';

import React, { useState, useCallback, useEffect, useRef, useMemo, useImperativeHandle, forwardRef } from 'react';
import {
  Eye, PenLine, Undo2, Redo2, Plus, Sparkles, Type, Heading, ImageIcon,
} from 'lucide-react';
import type { ContentBlock, BlockType, ArticleDocument } from './types';
import { createBlock, migrateBlock } from './types';
import { buildDefaultArticleDocument } from '@/lib/articles/blocks';
import { BlockInserter } from './BlockInserter';
import { BlockPanel } from './BlockEditorPanels';
import { BlockPreviewRenderer } from './BlockPreviewRenderer';
import { BlockPickerModal } from './BlockPickerModal';

interface BlockEditorProps {
  initialBlocks?: ContentBlock[];
  initialTemplate?: string;
  onChange?: (doc: ArticleDocument) => void;
  /** Live values from the post form, shown in the article preview header. */
  previewTitle?: string;
  previewAuthor?: string;
  previewCategory?: string;
  previewStatus?: string;
}

/**
 * Imperative handle exposed via React.forwardRef. Lets the parent push a
 * pre-built block into the editor without lifting the editor's internal
 * state up. Without this escape hatch, calling setState on the parent's
 * doc would silently get clobbered the next time the editor's onChange
 * fires (parent's value replaced with the editor's stale internal blocks).
 *
 * Add new methods sparingly — if a second external-mutation feature
 * lands (paste-from-template, AI block suggestion, etc.), the editor
 * should be refactored to be fully controlled instead of growing more
 * imperative methods.
 */
export interface BlockEditorHandle {
  insertBlock(block: ContentBlock, atIndex: number): void;
}

// ─── Suggestion logic ───────────────────────────────────────────────────────
// Returns up to 2 chip suggestions based on the last block in the document
// and (optionally) the rough length of the first paragraph.

interface ChipSuggestion {
  type: BlockType;
  label: string;
  Icon: React.ComponentType<{ size?: number; className?: string }>;
}

const ICON_FOR: Partial<Record<BlockType, React.ComponentType<{ size?: number; className?: string }>>> = {
  paragraph: Type,
  heading: Heading,
  image: ImageIcon,
};

function chipsFor(
  blocks: ContentBlock[],
  firstParagraphChars: number
): ChipSuggestion[] {
  if (blocks.length === 0) return [];
  const last = blocks[blocks.length - 1];

  // First-paragraph nudge: once the writer has a real opener, suggest
  // structuring with a heading.
  if (
    blocks.length === 1 &&
    last.type === 'paragraph' &&
    firstParagraphChars >= 120
  ) {
    return [
      { type: 'heading', label: 'Heading', Icon: Heading },
      { type: 'image', label: 'Image', Icon: ImageIcon },
    ];
  }

  switch (last.type) {
    case 'heading':
      return [
        { type: 'paragraph', label: 'Paragraph', Icon: Type },
        { type: 'image', label: 'Image', Icon: ImageIcon },
      ];
    case 'image':
    case 'video':
      return [
        { type: 'paragraph', label: 'Caption', Icon: Type },
        { type: 'heading', label: 'Heading', Icon: Heading },
      ];
    case 'divider':
      return [
        { type: 'heading', label: 'Heading', Icon: Heading },
        { type: 'paragraph', label: 'Paragraph', Icon: Type },
      ];
    case 'quote':
    case 'social-embed':
    case 'scout-insight':
    case 'hot-take':
    case 'update':
    case 'sentiment-meter':
    case 'stats-chart':
    case 'player-comparison':
    case 'trade-scenario':
    case 'mock-draft':
      return [
        { type: 'paragraph', label: 'Paragraph', Icon: Type },
        { type: 'heading', label: 'Heading', Icon: Heading },
      ];
    default:
      return [];
  }
}

// Strip HTML for a rough character count of paragraph content.
function stripHtml(html: string | undefined): string {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '');
}

// ─── Component ──────────────────────────────────────────────────────────────

export const BlockEditor = forwardRef<BlockEditorHandle, BlockEditorProps>(function BlockEditor({
  initialBlocks,
  initialTemplate,
  onChange,
  previewTitle,
  previewAuthor,
  previewCategory,
  previewStatus,
}, ref) {
  // Auto-seed a paragraph for new posts so writers land on real content.
  // EmptyCanvas only renders if the user explicitly deletes everything.
  const [blocks, setBlocks] = useState<ContentBlock[]>(() => {
    const seeded = (initialBlocks || [])
      .filter((b) => b.type !== 'reaction-stream')
      .map(migrateBlock);
    if (seeded.length > 0) return seeded;
    // Editorial scaffold for new posts (gated — flip in Vercel env to disable
    // without redeploying if the seeded template ever breaks the editor).
    if (process.env.NEXT_PUBLIC_SEED_DEFAULT_BLOCKS === 'true') {
      return buildDefaultArticleDocument().blocks;
    }
    return [createBlock('paragraph')];
  });

  const [template] = useState(initialTemplate || '');
  const [mode, setMode] = useState<'edit' | 'preview'>('edit');
  const [history, setHistory] = useState<ContentBlock[][]>([]);
  const [future, setFuture] = useState<ContentBlock[][]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const pickerInsertIndexRef = useRef<number | null>(null);
  const [pendingFocusId, setPendingFocusId] = useState<string | null>(null);
  // Inline-inserter reveal: which block is currently focused?
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  // Container ref so AmbientFeedback can position itself relative to it.
  const containerRef = useRef<HTMLDivElement>(null);

  const pushHistory = useCallback((prev: ContentBlock[]) => {
    setHistory((h) => [...h.slice(-30), prev]);
    setFuture([]);
  }, []);

  const updateBlocks = useCallback(
    (next: ContentBlock[]) => {
      pushHistory(blocks);
      setBlocks(next);
      onChange?.({ version: 1, template, blocks: next });
    },
    [blocks, template, onChange, pushHistory]
  );

  // Insert a pre-built block at a specific index. Routes through
  // updateBlocks so history + onChange both fire — without that,
  // the next user keystroke would clobber the inserted block (the
  // editor's onChange would push its stale internal state up).
  const insertBlockAt = useCallback(
    (block: ContentBlock, atIndex: number) => {
      const next = [...blocks];
      const idx = Math.max(0, Math.min(atIndex, next.length));
      next.splice(idx, 0, block);
      updateBlocks(next);
    },
    [blocks, updateBlocks]
  );

  useImperativeHandle(ref, () => ({
    insertBlock: insertBlockAt,
  }), [insertBlockAt]);

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

  const insertBlock = useCallback(
    (type: BlockType, afterIndex?: number | null) => {
      let newBlock: ContentBlock;
      try {
        newBlock = createBlock(type);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('[BlockEditor] createBlock failed for type:', type, err);
        return;
      }
      const idx =
        afterIndex === undefined || afterIndex === null
          ? blocks.length
          : afterIndex + 1;
      const next = [...blocks];
      next.splice(idx, 0, newBlock);
      updateBlocks(next);
      setPendingFocusId(newBlock.id);
    },
    [blocks, updateBlocks]
  );

  const updateBlock = useCallback(
    (index: number, updated: ContentBlock) => {
      const next = [...blocks];
      next[index] = updated;
      updateBlocks(next);
    },
    [blocks, updateBlocks]
  );

  const deleteBlock = useCallback(
    (index: number) => {
      updateBlocks(blocks.filter((_, i) => i !== index));
    },
    [blocks, updateBlocks]
  );

  const moveBlock = useCallback(
    (from: number, to: number) => {
      if (to < 0 || to >= blocks.length) return;
      const next = [...blocks];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      updateBlocks(next);
    },
    [blocks, updateBlocks]
  );

  const openPicker = useCallback((afterIndex: number | null) => {
    pickerInsertIndexRef.current = afterIndex;
    setPickerOpen(true);
  }, []);

  const handlePickerInsert = useCallback(
    (type: BlockType) => {
      insertBlock(type, pickerInsertIndexRef.current);
      setPickerOpen(false);
    },
    [insertBlock]
  );

  // Scroll + focus newly-inserted block.
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
    const t = window.setTimeout(() => focusable?.focus(), 120);
    setPendingFocusId(null);
    return () => window.clearTimeout(t);
  }, [pendingFocusId, blocks]);

  // "/" shortcut → open modal picker (only when not typing in an editable).
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
      openPicker(null);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [pickerOpen, openPicker]);

  // External "focus body" event from the title input.
  useEffect(() => {
    const handler = () => {
      // Find the first editable inside any block. Auto-seed guarantees one
      // exists for new posts; if the user has cleared everything, seed one.
      const anyBlock = document.querySelector<HTMLElement>('[data-block-id]');
      if (!anyBlock) {
        // Insert a paragraph so the writer has somewhere to land.
        insertBlock('paragraph', null);
        return;
      }
      const focusable = anyBlock.querySelector<HTMLElement>(
        'textarea, input:not([type="hidden"]), [contenteditable="true"]'
      );
      focusable?.focus();
    };
    document.addEventListener('sm-editor:focus-body', handler);
    return () => document.removeEventListener('sm-editor:focus-body', handler);
  }, [insertBlock]);

  const hasStarted = blocks.length > 0;
  const firstParagraphChars = useMemo(() => {
    const first = blocks[0];
    if (!first || first.type !== 'paragraph') return 0;
    return stripHtml((first.data as { html?: string })?.html).trim().length;
  }, [blocks]);
  const chips = useMemo(
    () => (hasStarted ? chipsFor(blocks, firstParagraphChars) : []),
    [hasStarted, blocks, firstParagraphChars]
  );

  return (
    <div ref={containerRef} className="relative space-y-4">
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
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-all duration-100 active:scale-[0.97]"
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
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-all duration-100 active:scale-[0.97]"
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
              Press{' '}
              <kbd className="rounded bg-black/5 px-1 py-px font-mono text-[10px] tracking-tighter text-slate-600">
                /
              </kbd>{' '}
              to add a block
            </span>
            <span className="text-[11px] text-slate-500">{blocks.length} blocks</span>
            <button
              type="button"
              onClick={undo}
              disabled={history.length === 0}
              className="p-1.5 rounded-lg transition-all duration-100 disabled:opacity-30 active:scale-[0.92]"
              style={{ color: '#A0A8B0' }}
              aria-label="Undo"
            >
              <Undo2 size={14} />
            </button>
            <button
              type="button"
              onClick={redo}
              disabled={future.length === 0}
              className="p-1.5 rounded-lg transition-all duration-100 disabled:opacity-30 active:scale-[0.92]"
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
                <div
                  data-block-id={block.id}
                  onFocusCapture={() => setFocusedIndex(index)}
                  onBlurCapture={() => {
                    // Defer so focus moving to a sibling (or inline picker) can
                    // update focusedIndex first.
                    window.setTimeout(() => {
                      setFocusedIndex((prev) =>
                        prev === index ? null : prev
                      );
                    }, 80);
                  }}
                >
                  <BlockPanel
                    block={block}
                    onChange={(updated) => updateBlock(index, updated)}
                    onDelete={() => deleteBlock(index)}
                    onMoveUp={index > 0 ? () => moveBlock(index, index - 1) : undefined}
                    onMoveDown={index < blocks.length - 1 ? () => moveBlock(index, index + 1) : undefined}
                  />
                </div>
                <BlockInserter
                  // Reveal when this block (above) or the next (below) is focused
                  revealed={focusedIndex === index || focusedIndex === index + 1}
                  onRequestModal={() => openPicker(index)}
                />
              </React.Fragment>
            ))}

            {chips.length > 0 && (
              <ActionChips
                chips={chips}
                onPick={(type) => insertBlock(type, blocks.length - 1)}
              />
            )}
          </div>
        ) : (
          <EmptyCanvas
            onAddContent={() => openPicker(null)}
            onQuickInsert={(type) => insertBlock(type, null)}
          />
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
                {previewCategory?.trim() || 'Category'}
              </span>
            </div>
            <h1 className="text-[28px] sm:text-[32px] font-bold tracking-tight mb-2" style={{ color: '#0B0F14' }}>
              {previewTitle?.trim() || 'Article Headline'}
            </h1>
            <div className="flex items-center gap-2 text-[13px] text-slate-500">
              <span>By {previewAuthor?.trim() || 'Author'}</span>
              <span className="w-1 h-1 rounded-full bg-slate-600" />
              <span className="capitalize">{previewStatus?.trim() || 'Draft'}</span>
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

      {hasStarted && mode === 'edit' && (
        <AmbientFeedback containerRef={containerRef} />
      )}
    </div>
  );
});

// ─── Empty State ────────────────────────────────────────────────────────────

const SMART_START: {
  type: BlockType;
  label: string;
  Icon: React.ComponentType<{ size?: number; className?: string }>;
}[] = [
  { type: 'paragraph', label: 'Paragraph', Icon: Type },
  { type: 'heading', label: 'Heading', Icon: Heading },
  { type: 'image', label: 'Image', Icon: ImageIcon },
];

function EmptyCanvas({
  onAddContent,
  onQuickInsert,
}: {
  onAddContent: () => void;
  onQuickInsert: (type: BlockType) => void;
}) {
  return (
    <div
      className="empty-canvas-fadein relative overflow-hidden rounded-2xl"
      style={{
        backgroundColor: '#ffffff',
        border: '1px solid rgba(0,0,0,0.08)',
        boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
      }}
    >
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
          className="mt-9 inline-flex h-12 items-center gap-2 rounded-full px-7 text-[14px] font-semibold tracking-wide transition-all duration-100 hover:scale-[1.02] focus:scale-[1.02] active:scale-[0.97] focus:outline-none"
          style={{
            backgroundColor: '#0B0F14',
            color: '#FAFAFB',
            boxShadow: '0 12px 32px rgba(11,15,20,0.25)',
          }}
        >
          <Plus size={16} strokeWidth={2.4} />
          Add Content
        </button>

        <div className="mt-10 flex flex-col items-center gap-3">
          <span className="text-[11px] uppercase tracking-[0.22em] text-slate-400">
            Start with
          </span>
          <div className="flex flex-wrap justify-center gap-2">
            {SMART_START.map(({ type, label, Icon }) => (
              <button
                key={type}
                type="button"
                onClick={() => onQuickInsert(type)}
                className="group flex items-center gap-2 rounded-full px-4 py-2 text-[12.5px] font-medium tracking-tight transition-all duration-100 hover:-translate-y-[1px] active:scale-[0.97]"
                style={{
                  backgroundColor: 'rgba(11,15,20,0.04)',
                  border: '1px solid rgba(11,15,20,0.08)',
                  color: '#0B0F14',
                  transitionProperty: 'transform, background-color, box-shadow, border-color',
                  transitionDuration: '120ms',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(0,212,255,0.45)';
                  e.currentTarget.style.backgroundColor = 'rgba(0,212,255,0.06)';
                  e.currentTarget.style.boxShadow =
                    '0 0 0 1px rgba(0,212,255,0.25), 0 6px 14px rgba(0,212,255,0.12)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(11,15,20,0.08)';
                  e.currentTarget.style.backgroundColor = 'rgba(11,15,20,0.04)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <Icon size={13} className="text-slate-600 group-hover:text-[#00D4FF]" />
                {label}
              </button>
            ))}
          </div>
        </div>
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

// ─── Action Chips ───────────────────────────────────────────────────────────
// Replaces the text "Next: ..." suggestion. Shows up to 2 floating chips.
// Disappears on selection (because the new last block changes the suggestion).

function ActionChips({
  chips,
  onPick,
}: {
  chips: ChipSuggestion[];
  onPick: (type: BlockType) => void;
}) {
  return (
    <div className="action-chips-fadein flex justify-center pt-2">
      <div className="flex flex-wrap items-center justify-center gap-2">
        {chips.slice(0, 2).map(({ type, label, Icon }) => (
          <button
            key={type}
            type="button"
            onClick={() => onPick(type)}
            className="group flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12px] font-medium tracking-tight transition-all duration-100 hover:-translate-y-[1px] active:scale-[0.97]"
            style={{
              backgroundColor: 'rgba(0,212,255,0.06)',
              border: '1px dashed rgba(0,212,255,0.4)',
              color: '#0B0F14',
              transitionProperty: 'transform, background-color, box-shadow, border-color',
              transitionDuration: '120ms',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(0,212,255,0.12)';
              e.currentTarget.style.borderStyle = 'solid';
              e.currentTarget.style.borderColor = 'rgba(0,212,255,0.55)';
              e.currentTarget.style.boxShadow =
                '0 0 0 1px rgba(0,212,255,0.25), 0 6px 16px rgba(0,212,255,0.18)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(0,212,255,0.06)';
              e.currentTarget.style.borderStyle = 'dashed';
              e.currentTarget.style.borderColor = 'rgba(0,212,255,0.4)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <Plus size={12} strokeWidth={2.4} className="text-[#00D4FF]" />
            <Icon size={12} className="text-[#00D4FF]" />
            {label}
          </button>
        ))}
      </div>
      <style jsx>{`
        .action-chips-fadein {
          animation: chips-fade 200ms cubic-bezier(0.22, 1, 0.36, 1);
        }
        @keyframes chips-fade {
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
          .action-chips-fadein {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}

// ─── Ambient Feedback ───────────────────────────────────────────────────────
// Two-mode ambient toast that lives at the bottom-right of the editor:
//
// 1. Micro-praise — when the writer has been typing continuously for ~2s and
//    at least 30s have passed since the last praise. Phrase never repeats.
// 2. Dead-time hint — when typing stops for 5+s while the editor is focused.
//
// Both fade in/out. They never overlap.

const PRAISE_PHRASES = ['Good flow', 'Keep going', 'Nice', 'Strong start', 'Great pace'];

function AmbientFeedback({
  containerRef,
}: {
  containerRef: React.RefObject<HTMLDivElement | null>;
}) {
  const [text, setText] = useState<string | null>(null);
  const [textKind, setTextKind] = useState<'praise' | 'hint' | null>(null);
  const lastPraiseAtRef = useRef<number>(0);
  const lastPraiseIndexRef = useRef<number>(-1);
  const lastTypeAtRef = useRef<number>(0);
  const streakStartAtRef = useRef<number>(0);
  const idleTimerRef = useRef<number | null>(null);
  const fadeOutTimerRef = useRef<number | null>(null);

  const showFor = useCallback((value: string, kind: 'praise' | 'hint', ms = 2200) => {
    if (fadeOutTimerRef.current) {
      window.clearTimeout(fadeOutTimerRef.current);
    }
    setText(value);
    setTextKind(kind);
    fadeOutTimerRef.current = window.setTimeout(() => {
      setText(null);
      setTextKind(null);
      fadeOutTimerRef.current = null;
    }, ms);
  }, []);

  const pickPraise = useCallback(() => {
    if (PRAISE_PHRASES.length <= 1) return PRAISE_PHRASES[0];
    let next = Math.floor(Math.random() * PRAISE_PHRASES.length);
    if (next === lastPraiseIndexRef.current) {
      next = (next + 1) % PRAISE_PHRASES.length;
    }
    lastPraiseIndexRef.current = next;
    return PRAISE_PHRASES[next];
  }, []);

  // Keystroke listener confined to the editor container.
  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;

    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      // Only count keys typed inside an editable surface.
      const tag = target.tagName?.toLowerCase();
      const editable =
        tag === 'textarea' ||
        tag === 'input' ||
        target.isContentEditable === true;
      if (!editable) return;
      // Ignore non-character keys.
      if (e.key.length !== 1 && e.key !== 'Backspace' && e.key !== 'Enter') return;

      const now = Date.now();
      // Reset streak if there was a gap > 1.5s.
      if (now - lastTypeAtRef.current > 1500) {
        streakStartAtRef.current = now;
      }
      lastTypeAtRef.current = now;

      const streak = now - streakStartAtRef.current;
      const sinceLastPraise = now - lastPraiseAtRef.current;
      // Random within 30-60s gap to feel less clockwork.
      const minGap = 30_000 + Math.random() * 30_000;
      if (streak >= 2_000 && sinceLastPraise >= minGap) {
        const phrase = pickPraise();
        lastPraiseAtRef.current = now;
        // After a praise, reset streak so we don't spam.
        streakStartAtRef.current = now;
        showFor(phrase, 'praise', 1800);
      }

      // Reset idle timer.
      if (idleTimerRef.current) {
        window.clearTimeout(idleTimerRef.current);
      }
      idleTimerRef.current = window.setTimeout(() => {
        // Only show hint if focus is still inside an editable in this editor.
        const active = document.activeElement as HTMLElement | null;
        if (!active || !root.contains(active)) return;
        const aTag = active.tagName?.toLowerCase();
        const aEditable =
          aTag === 'textarea' ||
          aTag === 'input' ||
          active.isContentEditable === true;
        if (!aEditable) return;
        showFor('Press / to add anything', 'hint', 2400);
      }, 5_000);
    };

    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      if (idleTimerRef.current) window.clearTimeout(idleTimerRef.current);
      if (fadeOutTimerRef.current) window.clearTimeout(fadeOutTimerRef.current);
    };
  }, [containerRef, pickPraise, showFor]);

  if (!text) return null;
  const accent = textKind === 'praise' ? '#00D4FF' : '#0B0F14';
  return (
    <div
      className="ambient-toast pointer-events-none fixed bottom-6 right-6 z-40"
      role="status"
      aria-live="polite"
    >
      <div
        className="flex items-center gap-2 rounded-full px-3.5 py-2 text-[12px] font-medium tracking-tight"
        style={{
          backgroundColor:
            textKind === 'praise'
              ? 'rgba(0,212,255,0.12)'
              : 'rgba(11,15,20,0.85)',
          color: textKind === 'praise' ? accent : '#FAFAFB',
          border:
            textKind === 'praise'
              ? '1px solid rgba(0,212,255,0.35)'
              : '1px solid rgba(255,255,255,0.08)',
          boxShadow:
            textKind === 'praise'
              ? '0 8px 24px rgba(0,212,255,0.15)'
              : '0 12px 28px rgba(11,15,20,0.25)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
        }}
      >
        {textKind === 'praise' && <Sparkles size={12} />}
        <span>{text}</span>
      </div>
      <style jsx>{`
        .ambient-toast {
          animation: ambient-toast-fade 220ms cubic-bezier(0.22, 1, 0.36, 1);
        }
        @keyframes ambient-toast-fade {
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
          .ambient-toast {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
