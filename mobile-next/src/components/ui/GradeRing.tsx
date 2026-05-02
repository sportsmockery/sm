'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useMemo } from 'react';
import { cn } from '@/lib/utils';

export interface GradeRingProps {
  /** 0–100 grade. */
  value: number;
  size?: number;
  thickness?: number;
  label?: string;
  className?: string;
}

function gradeColor(v: number): string {
  if (v >= 80) return 'var(--color-grade-green)';
  if (v >= 60) return 'var(--color-grade-amber)';
  return 'var(--color-grade-red)';
}

function gradeLetter(v: number): string {
  if (v >= 95) return 'A+';
  if (v >= 90) return 'A';
  if (v >= 85) return 'A-';
  if (v >= 80) return 'B+';
  if (v >= 75) return 'B';
  if (v >= 70) return 'B-';
  if (v >= 65) return 'C+';
  if (v >= 60) return 'C';
  if (v >= 50) return 'D';
  return 'F';
}

/**
 * Animated 0–100 grade ring. This is a permitted Framer "hero moment"
 * (Directive 2): the ring uses pathLength spring physics on reveal.
 */
export function GradeRing({ value, size = 220, thickness = 14, label, className }: GradeRingProps) {
  const reduced = useReducedMotion();
  const clamped = Math.max(0, Math.min(100, value));
  const radius = (size - thickness) / 2;
  const center = size / 2;
  const stroke = useMemo(() => gradeColor(clamped), [clamped]);

  return (
    <div className={cn('relative grid place-items-center', className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`Grade ${Math.round(clamped)} of 100`}>
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={thickness}
        />
        <motion.circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={stroke}
          strokeWidth={thickness}
          strokeLinecap="round"
          transform={`rotate(-90 ${center} ${center})`}
          initial={{ pathLength: reduced ? clamped / 100 : 0, opacity: reduced ? 1 : 0 }}
          animate={{ pathLength: clamped / 100, opacity: 1 }}
          transition={{
            pathLength: { type: 'spring', stiffness: 60, damping: 18, restDelta: 0.001 },
            opacity: { duration: 0.3 },
          }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <div className="text-center">
          <div className="font-bold leading-none" style={{ fontSize: size * 0.32, color: stroke }}>
            {Math.round(clamped)}
          </div>
          <div className="mt-1 text-xs uppercase tracking-[0.2em] text-white/60">
            {label ?? gradeLetter(clamped)}
          </div>
        </div>
      </div>
    </div>
  );
}
