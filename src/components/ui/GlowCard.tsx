'use client'

import { ReactNode } from 'react'

interface GlowCardProps {
  children: ReactNode
  color?: 'red' | 'blue' | 'orange' | 'green'
  className?: string
  onClick?: () => void
}

const glowColors = {
  red: 'hover:shadow-[0_0_30px_rgba(255,0,0,0.3)] hover:border-[#FF0000]/50',
  blue: 'hover:shadow-[0_0_30px_rgba(14,51,134,0.3)] hover:border-[#0E3386]/50',
  orange: 'hover:shadow-[0_0_30px_rgba(200,50,0,0.3)] hover:border-[#C83200]/50',
  green: 'hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:border-emerald-500/50',
}

export default function GlowCard({
  children,
  color = 'red',
  className = '',
  onClick,
}: GlowCardProps) {
  return (
    <div
      onClick={onClick}
      className={`
        relative overflow-hidden rounded-2xl
        transition-all duration-300 ease-out
        ${glowColors[color]}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      style={{ backgroundColor: 'var(--sm-card)', border: '1px solid var(--sm-border)' }}
    >
      {/* Glow effect overlay */}
      <div
        className={`
          pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300
          group-hover:opacity-100
        `}
        style={{
          background: `radial-gradient(circle at center, ${
            color === 'red' ? 'rgba(255,0,0,0.1)' :
            color === 'blue' ? 'rgba(14,51,134,0.1)' :
            color === 'orange' ? 'rgba(200,50,0,0.1)' :
            'rgba(16,185,129,0.1)'
          }, transparent 70%)`,
        }}
      />
      {children}
    </div>
  )
}
