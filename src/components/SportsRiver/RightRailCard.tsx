'use client';

import React from 'react';

interface RightRailCardProps {
  title: string;
  children: React.ReactNode;
  accentColor?: string;
  className?: string;
  /** When true, uses left-rail glass card styling (cyan accent, hover effects) */
  glass?: boolean;
}

export default function RightRailCard({
  title,
  children,
  accentColor,
  className,
  glass,
}: RightRailCardProps) {
  const isGlass = glass ?? (typeof className === 'string' && className.includes('glass-card'));

  if (isGlass) {
    return (
      <div className={`glass-card ${className ?? ''}`.trim()}>
        <div className="title">{title}</div>
        <div className="body">{children}</div>
      </div>
    );
  }

  return (
    <div
      className={`rounded-xl overflow-hidden ${className ?? ''}`}
      style={{
        background: 'var(--sm-card)',
        border: '1px solid var(--sm-border)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      {accentColor && (
        <div style={{ height: 2, width: '100%', backgroundColor: accentColor }} />
      )}
      <div style={{ padding: 'var(--card-padding, 20px)' }}>
        <h3 className="sm-card-title" style={{
          fontSize: 'var(--font-size-card-title, 17px)',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: '#BC0000',
          marginBottom: 12,
        }}>
          {title}
        </h3>
        {children}
      </div>
    </div>
  );
}
