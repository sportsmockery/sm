'use client';

import { useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';

/**
 * Renders `children` only when reduced motion is OFF. Use to gate purely
 * decorative animations.
 */
export function ReducedMotionGate({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) {
  const reduced = useReducedMotion();
  if (reduced) return <>{fallback}</>;
  return <>{children}</>;
}
