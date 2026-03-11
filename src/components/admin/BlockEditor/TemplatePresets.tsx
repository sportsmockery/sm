'use client';

import React from 'react';
import {
  Newspaper, BarChart, Radio, Flame, MessageCircle,
} from 'lucide-react';
import type { ContentBlock } from './types';
import { createBlock } from './types';

interface TemplatePreset {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  blocks: () => ContentBlock[];
}

export const TEMPLATE_PRESETS: TemplatePreset[] = [
  {
    id: 'standard-news',
    label: 'Standard News',
    description: 'Editorial article with Scout analysis and GM Pulse engagement',
    icon: Newspaper,
    blocks: () => [
      createBlock('paragraph'),
      createBlock('paragraph'),
      createBlock('gm-interaction'),
      createBlock('paragraph'),
      createBlock('scout-insight'),
      createBlock('paragraph'),
      createBlock('update'),
      createBlock('paragraph'),
    ],
  },
  {
    id: 'stats-comparison',
    label: 'Stats / Player Comparison',
    description: 'Data-driven article with player matchups and chart analysis',
    icon: BarChart,
    blocks: () => [
      createBlock('paragraph'),
      createBlock('player-comparison'),
      createBlock('paragraph'),
      createBlock('stats-chart'),
      createBlock('paragraph'),
      createBlock('stats-chart'),
      createBlock('gm-interaction'),
    ],
  },
  {
    id: 'rumor-trade',
    label: 'Rumor / Trade Simulator',
    description: 'Rumor confidence, trade scenarios, and mock draft picks',
    icon: Radio,
    blocks: () => [
      createBlock('rumor-meter'),
      createBlock('paragraph'),
      createBlock('trade-scenario'),
      createBlock('paragraph'),
      createBlock('mock-draft'),
      createBlock('paragraph'),
      createBlock('gm-interaction'),
    ],
  },
  {
    id: 'trending',
    label: 'Trending',
    description: 'Trending topic with heat gauge, reactions, and fan polling',
    icon: Flame,
    blocks: () => [
      createBlock('heat-meter'),
      createBlock('paragraph'),
      createBlock('reaction-stream'),
      createBlock('hot-take'),
      createBlock('poll'),
      createBlock('scout-insight'),
    ],
  },
  {
    id: 'fan-debate',
    label: 'Fan Debate',
    description: 'PRO vs CON debate with Scout AI verdict',
    icon: MessageCircle,
    blocks: () => [
      createBlock('paragraph'),
      createBlock('debate'),
      createBlock('paragraph'),
      createBlock('scout-insight'),
    ],
  },
];

interface TemplateSelectorProps {
  onSelect: (blocks: ContentBlock[], templateId: string) => void;
}

export function TemplateSelector({ onSelect }: TemplateSelectorProps) {
  return (
    <div
      className="rounded-xl p-6"
      style={{
        backgroundColor: '#f8f9fa',
        border: '1px solid rgba(0,0,0,0.1)',
      }}
    >
      <h3 className="text-sm font-bold mb-1" style={{ color: '#0B0F14' }}>Choose an article template</h3>
      <p className="text-xs mb-4" style={{ color: '#6b7280' }}>Select a composition or start blank</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {TEMPLATE_PRESETS.map((preset) => {
          const Icon = preset.icon;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => onSelect(preset.blocks(), preset.id)}
              className="flex items-start gap-3 p-4 rounded-xl text-left transition-all"
              style={{
                border: '1px solid rgba(0,0,0,0.1)',
                backgroundColor: '#ffffff',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f0f4f8' }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#ffffff' }}
            >
              <div
                className="flex items-center justify-center w-10 h-10 rounded-lg shrink-0"
                style={{ backgroundColor: 'rgba(0,212,255,0.1)' }}
              >
                {React.createElement(Icon, { size: 18, color: '#00D4FF' })}
              </div>
              <div>
                <div className="text-sm font-bold" style={{ color: '#0B0F14' }}>{preset.label}</div>
                <div className="text-[11px]" style={{ color: '#6b7280' }}>{preset.description}</div>
              </div>
            </button>
          );
        })}

        {/* Blank option */}
        <button
          type="button"
          onClick={() => onSelect([createBlock('paragraph')], 'blank')}
          className="flex items-start gap-3 p-4 rounded-xl text-left transition-all"
          style={{
            border: '1px dashed rgba(0,0,0,0.2)',
            backgroundColor: '#ffffff',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f0f4f8' }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#ffffff' }}
        >
          <div
            className="flex items-center justify-center w-10 h-10 rounded-lg shrink-0"
            style={{ backgroundColor: 'rgba(0,0,0,0.05)' }}
          >
            <span style={{ color: '#6b7280', fontSize: 18 }}>+</span>
          </div>
          <div>
            <div className="text-sm font-bold" style={{ color: '#0B0F14' }}>Blank</div>
            <div className="text-[11px]" style={{ color: '#6b7280' }}>Start from scratch</div>
          </div>
        </button>
      </div>
    </div>
  );
}
