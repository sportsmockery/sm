'use client';

import React, { useState, useCallback } from 'react';
import { Eye, PenLine, Undo2, Redo2 } from 'lucide-react';
import type { ContentBlock, BlockType, ArticleDocument } from './types';
import { createBlock } from './types';
import { BlockInserter } from './BlockInserter';
import { BlockPanel } from './BlockEditorPanels';
import { BlockPreviewRenderer } from './BlockPreviewRenderer';
import { TemplateSelector } from './TemplatePresets';

interface BlockEditorProps {
  initialBlocks?: ContentBlock[];
  initialTemplate?: string;
  onChange?: (doc: ArticleDocument) => void;
}

export function BlockEditor({ initialBlocks, initialTemplate, onChange }: BlockEditorProps) {
  const [blocks, setBlocks] = useState<ContentBlock[]>(initialBlocks || []);
  const [template, setTemplate] = useState(initialTemplate || '');
  const [mode, setMode] = useState<'edit' | 'preview'>('edit');
  const [history, setHistory] = useState<ContentBlock[][]>([]);
  const [future, setFuture] = useState<ContentBlock[][]>([]);
  const hasStarted = blocks.length > 0;

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

  const insertBlock = useCallback((type: BlockType, afterIndex?: number) => {
    const newBlock = createBlock(type);
    const idx = afterIndex !== undefined ? afterIndex + 1 : blocks.length;
    const next = [...blocks];
    next.splice(idx, 0, newBlock);
    updateBlocks(next);
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

  const handleTemplateSelect = useCallback((templateBlocks: ContentBlock[], templateId: string) => {
    setTemplate(templateId);
    setBlocks(templateBlocks);
    setHistory([]);
    setFuture([]);
    onChange?.({ version: 1, template: templateId, blocks: templateBlocks });
  }, [onChange]);

  // Template selector when no blocks yet
  if (!hasStarted) {
    return <TemplateSelector onSelect={handleTemplateSelect} />;
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div
        className="flex items-center justify-between px-4 py-2 rounded-xl"
        style={{
          backgroundColor: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
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

      {/* Editor / Preview */}
      {mode === 'edit' ? (
        <div className="space-y-2">
          {blocks.map((block, index) => (
            <React.Fragment key={block.id}>
              <BlockPanel
                block={block}
                onChange={(updated) => updateBlock(index, updated)}
                onDelete={() => deleteBlock(index)}
                onMoveUp={index > 0 ? () => moveBlock(index, index - 1) : undefined}
                onMoveDown={index < blocks.length - 1 ? () => moveBlock(index, index + 1) : undefined}
              />
              <BlockInserter onInsert={(type) => insertBlock(type, index)} />
            </React.Fragment>
          ))}

          {/* Bottom inserter when empty or at end */}
          {blocks.length === 0 && (
            <BlockInserter onInsert={(type) => insertBlock(type)} />
          )}
        </div>
      ) : (
        <div
          className="rounded-xl p-6 min-h-[400px]"
          style={{
            backgroundColor: '#0B0F14',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <BlockPreviewRenderer blocks={blocks} />
        </div>
      )}
    </div>
  );
}
