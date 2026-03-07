'use client';

import React from 'react';

interface RightRailCardProps {
  title: string;
  children: React.ReactNode;
  accentColor?: string; // micro-accent for top border only
  className?: string;
}

export default function RightRailCard({
  title,
  children,
  accentColor,
  className,
}: RightRailCardProps) {
  return (
    <div
      className={`rounded-xl overflow-hidden ${className ?? ''}`}
      style={{
        background: 'var(--sm-card)',
        border: '1px solid var(--sm-border)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
      }}
    >
      {/* 2px top accent bar */}
      {accentColor && (
        <div
          className="h-[2px] w-full"
          style={{ backgroundColor: accentColor }}
        />
      )}
      <div className="p-4">
        <h3
          className="text-xs font-bold uppercase tracking-wider mb-3"
          style={{ color: 'var(--sm-text-muted)' }}
        >
          {title}
        </h3>
        {children}
      </div>
    </div>
  );
}
