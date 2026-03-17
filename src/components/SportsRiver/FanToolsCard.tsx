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
      <img src="/downloads/scout-v2.png" alt="Scout AI" width={16} height={16} style={{ borderRadius: '50%' }} />
    ),
  },
  {
    label: 'War Room',
    href: '/gm',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M3 9h18M9 21V9" />
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
