'use client';

import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface BaseGlassCardProps {
  children: React.ReactNode;
  trackingToken: string;
  accentColor: string;
  className?: string;
  isBreathing?: boolean;
}

const springTransition = { type: 'spring' as const, stiffness: 260, damping: 20 };

function BaseGlassCardInner({
  children,
  trackingToken,
  accentColor,
  className,
  isBreathing,
}: BaseGlassCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const dwellTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasSentDwellRef = useRef(false);

  // Dwell tracking via IntersectionObserver
  useEffect(() => {
    const el = cardRef.current;
    if (!el || !trackingToken) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasSentDwellRef.current) {
          // Clear any existing timer before scheduling a new one
          if (dwellTimerRef.current) {
            clearTimeout(dwellTimerRef.current);
          }
          dwellTimerRef.current = setTimeout(() => {
            dwellTimerRef.current = null;
            if (hasSentDwellRef.current) return;
            const blob = new Blob(
              [JSON.stringify({ token: trackingToken, dwell_ms: 1500, action: 'dwell' })],
              { type: 'text/plain' }
            );
            navigator.sendBeacon('/api/track/dwell', blob);
            hasSentDwellRef.current = true;
          }, 1500);
        } else {
          if (dwellTimerRef.current) {
            clearTimeout(dwellTimerRef.current);
            dwellTimerRef.current = null;
          }
        }
      },
      { threshold: 0.6 }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
      if (dwellTimerRef.current) {
        clearTimeout(dwellTimerRef.current);
      }
    };
  }, [trackingToken]);

  // Check for reduced motion preference
  const prefersReduced =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return (
    <motion.div
      ref={cardRef}
      className={`relative overflow-hidden rounded-2xl border border-[#2B3442] ${isBreathing && !prefersReduced ? 'river-breathing' : ''} ${className ?? ''}`}
      style={{
        background: 'rgba(27, 36, 48, 0.72)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
      }}
      initial={prefersReduced ? undefined : { opacity: 0, scale: 0.92, y: 30 }}
      whileInView={prefersReduced ? undefined : { opacity: 1, scale: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={prefersReduced ? undefined : springTransition}
      whileHover={
        prefersReduced
          ? undefined
          : { y: -8, boxShadow: '0 28px 48px rgba(0,0,0,0.5)' }
      }
    >
      {/* Top accent bar */}
      <div
        className="absolute top-0 left-0 w-full h-[2px]"
        style={{ backgroundColor: accentColor }}
      />
      {/* Inner edge highlight */}
      <div className="absolute top-[2px] left-0 w-full h-[1px] bg-[#FAFAFB]/20" />

      <div className="p-4">{children}</div>

      <style>{`
        @keyframes riverBreathing {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.01); }
        }
        .river-breathing {
          animation: riverBreathing 4s ease-in-out infinite;
        }
      `}</style>
    </motion.div>
  );
}

export const BaseGlassCard = React.memo(BaseGlassCardInner);
