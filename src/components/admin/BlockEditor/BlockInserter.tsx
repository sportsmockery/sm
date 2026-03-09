'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Plus, X, Type, Heading, ImageIcon, Play, Minus,
  Sparkles, Vote, BarChart3, Users, BarChart,
  ArrowRightLeft, Thermometer, List, Swords, Flame,
  MessageCircle, Bell,
} from 'lucide-react';
import { BLOCK_CATEGORIES, type BlockType } from './types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ICON_MAP: Record<string, any> = {
  Type, Heading, Image: ImageIcon, Play, Minus,
  Sparkles, Vote, BarChart3, Users, BarChart,
  ArrowRightLeft, Thermometer, List, Swords, Flame,
  MessageCircle, Bell,
};

interface BlockInserterProps {
  onInsert: (type: BlockType) => void;
}

export function BlockInserter({ onInsert }: BlockInserterProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
  }, [open]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const filteredCategories = BLOCK_CATEGORIES.map((cat) => ({
    ...cat,
    blocks: cat.blocks.filter(
      (b) =>
        b.label.toLowerCase().includes(search.toLowerCase()) ||
        b.description.toLowerCase().includes(search.toLowerCase())
    ),
  })).filter((cat) => cat.blocks.length > 0);

  return (
    <div className="relative flex justify-center my-2" ref={menuRef}>
      <button
        type="button"
        onClick={() => { setOpen(!open); setSearch(''); }}
        className="flex items-center justify-center w-8 h-8 rounded-full transition-all"
        style={{
          backgroundColor: open ? '#00D4FF' : 'rgba(255,255,255,0.06)',
          color: open ? '#0B0F14' : '#A0A8B0',
          border: '1px solid rgba(255,255,255,0.1)',
        }}
        aria-label="Add block"
      >
        {open ? <X size={14} /> : <Plus size={14} />}
      </button>

      {open && (
        <div
          className="absolute top-10 z-50 w-[320px] max-h-[420px] overflow-y-auto rounded-xl shadow-2xl"
          style={{
            backgroundColor: '#1A1F28',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          {/* Search */}
          <div className="p-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
            <input
              ref={inputRef}
              type="text"
              placeholder="Search blocks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent text-sm text-white placeholder-slate-500 outline-none"
            />
          </div>

          {/* Categories */}
          {filteredCategories.map((cat) => (
            <div key={cat.label}>
              <div className="px-3 pt-3 pb-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  {cat.label}
                </span>
              </div>
              {cat.blocks.map((block) => {
                const Icon = ICON_MAP[block.icon] || Type;
                return (
                  <button
                    key={block.type}
                    type="button"
                    onClick={() => { onInsert(block.type); setOpen(false); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-white/5"
                  >
                    <div
                      className="flex items-center justify-center w-8 h-8 rounded-lg shrink-0"
                      style={{ backgroundColor: 'rgba(0,212,255,0.1)' }}
                    >
                      {React.createElement(Icon, { size: 14, color: '#00D4FF' })}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">{block.label}</div>
                      <div className="text-[11px] text-slate-500">{block.description}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          ))}

          {filteredCategories.length === 0 && (
            <div className="p-6 text-center text-sm text-slate-500">No blocks found</div>
          )}
        </div>
      )}
    </div>
  );
}
