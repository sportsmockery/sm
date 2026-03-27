'use client';

import React from 'react';
import Image from 'next/image';

export type EdgeLogoVariant = 'full' | 'compact' | 'wordmark';

interface EdgeLogoProps {
  /** full = SM + star + EDGE; compact = same, smaller spacing; wordmark = EDGE only */
  variant?: EdgeLogoVariant;
  /** Height in pixels; width scales to preserve aspect */
  height?: number;
  className?: string;
  /** Prefer PNG from public for pixel-perfect match; false = use this SVG (scalable) */
  preferImage?: boolean;
}

/**
 * Scalable SM EDGE logo. Use for nav, headers, and any size — always sharp.
 * PNG variants live in /images/edge/ for social and exact brand match.
 */
export function EdgeLogo({
  variant = 'full',
  height = 28,
  className = '',
  preferImage = false,
}: EdgeLogoProps) {
  if (preferImage && typeof window !== 'undefined') {
    return (
      <Image
        src="/images/edge/edge-compact.png"
        alt="SM EDGE"
        height={height}
        width={Math.round(height * 4.2)}
        className={className}
        style={{ height, width: 'auto', objectFit: 'contain' }}
      />
    );
  }

  const isWordmark = variant === 'wordmark';
  const w = isWordmark ? 180 : 420;
  const h = 100;
  const viewBox = `0 0 ${w} ${h}`;

  return (
    <svg
      viewBox={viewBox}
      height={height}
      width={undefined}
      className={className}
      style={{
        height,
        width: 'auto',
        maxWidth: '100%',
      }}
      aria-label="SM EDGE"
      role="img"
      preserveAspectRatio="xMinYMid meet"
    >
      <defs>
        <linearGradient id="edge-sm-silver" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#e8e8f0" />
          <stop offset="100%" stopColor="#a0a0b0" />
        </linearGradient>
        <linearGradient id="edge-blue" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6dd5ed" />
          <stop offset="100%" stopColor="#0e3386" />
        </linearGradient>
        <filter id="edge-outline" x="-20%" y="-20%" width="140%" height="140%">
          <feMorphology in="SourceAlpha" operator="dilate" radius="0.6" result="dilated" />
          <feFlood floodColor="#0a0a12" result="flood" />
          <feComposite in="flood" in2="dilated" operator="in" result="outline" />
          <feMerge>
            <feMergeNode in="outline" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {!isWordmark && (
        <>
          {/* SM — metallic silver */}
          <text
            x={0}
            y={72}
            fontFamily="var(--font-space-grotesk), Space Grotesk, sans-serif"
            fontWeight="800"
            fontSize="52"
            fill="url(#edge-sm-silver)"
            filter="url(#edge-outline)"
          >
            SM
          </text>

          {/* Chicago star — brand red */}
          <path
            d="M 155 20 L 162 48 L 192 48 L 168 66 L 175 94 L 155 78 L 135 94 L 142 66 L 118 48 L 148 48 Z"
            fill="var(--sm-red, #bc0000)"
            stroke="#0a0a12"
            strokeWidth="1.2"
          />
        </>
      )}

      {/* EDGE — blue gradient; grunge behind for full/compact */}
      <g filter="url(#edge-outline)">
        {!isWordmark && (
          <ellipse
            cx={320}
            cy={52}
            rx={95}
            ry={28}
            fill="rgba(10,10,20,0.85)"
            opacity={0.9}
          />
        )}
        <text
          x={isWordmark ? 0 : 248}
          y={72}
          fontFamily="var(--font-space-grotesk), Space Grotesk, sans-serif"
          fontWeight="800"
          fontSize="48"
          fontStyle="italic"
          fill="url(#edge-blue)"
        >
          EDGE
        </text>
      </g>
    </svg>
  );
}
