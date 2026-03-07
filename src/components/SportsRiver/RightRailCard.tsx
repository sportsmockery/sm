'use client';

import React from 'react';

interface RightRailCardProps {
  title: string;
  children: React.ReactNode;
  accentColor?: string;
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
        background: 'rgba(12, 12, 18, 0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
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
