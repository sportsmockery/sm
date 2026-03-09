'use client';

import React from 'react';

interface TagChipProps {
  label: string;
  color?: string;
}

export function TagChip({ label, color = '#00D4FF' }: TagChipProps) {
  return (
    <span
      className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest"
      style={{
        backgroundColor: `${color}15`,
        color,
        border: `1px solid ${color}30`,
      }}
    >
      {label}
    </span>
  );
}
