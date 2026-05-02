'use client';

import { useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface TooltipProps {
  label: string;
  children: ReactNode;
  className?: string;
}

/**
 * Lean Liquid Glass tooltip. Tap-to-toggle for touch; hover for cursor.
 * Keep it simple — no portal, no positioning engine. Used for ineligible-team
 * disabled states in mock-draft.
 */
export function Tooltip({ label, children, className }: TooltipProps) {
  const [open, setOpen] = useState(false);
  return (
    <span
      className={cn('relative inline-flex', className)}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onClick={() => setOpen((v) => !v)}
    >
      {children}
      {open && (
        <span
          role="tooltip"
          className="absolute -top-2 left-1/2 -translate-x-1/2 -translate-y-full px-3 py-1.5 rounded-lg liquid-glass-dark text-[11px] whitespace-nowrap text-white/90 z-30"
        >
          {label}
        </span>
      )}
    </span>
  );
}
