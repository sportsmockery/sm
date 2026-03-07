'use client';

import React from 'react';

interface FanTool {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const FAN_TOOLS: FanTool[] = [
  {
    label: 'Scout AI',
    href: '/ask-ai',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="m16 10-4 4-4-4" />
      </svg>
    ),
  },
  {
    label: 'Trade Sim',
    href: '/gm',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 3h5v5M8 3H3v5M21 3l-7 7M3 3l7 7M16 21h5v-5M8 21H3v-5M21 21l-7-7M3 21l7-7" />
      </svg>
    ),
  },
  {
    label: 'Mock Draft',
    href: '/mock-draft',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
        <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
      </svg>
    ),
  },
  {
    label: 'Fan Chat',
    href: '/fan-hub',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
];

export default function FanToolsCard() {
  return (
    <div className="grid grid-cols-2 gap-2">
      {FAN_TOOLS.map((tool) => (
        <a
          key={tool.label}
          href={tool.href}
          className="group flex items-center gap-2 rounded-lg p-2.5 transition-colors duration-150"
          style={{
            backgroundColor: 'var(--sm-surface)',
            border: '1px solid var(--sm-border)',
          }}
        >
          <span
            className="transition-colors duration-150"
            style={{ color: 'var(--sm-text-muted)' }}
          >
            {tool.icon}
          </span>
          <span
            className="text-xs font-semibold transition-colors duration-150"
            style={{ color: 'var(--sm-text)' }}
          >
            {tool.label}
          </span>
        </a>
      ))}
    </div>
  );
}
