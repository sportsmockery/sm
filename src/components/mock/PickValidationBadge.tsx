'use client'

import { useEffect, useState } from 'react'
import type { PickFeedback } from '@/types/gm'

interface PickValidationBadgeProps {
  feedback: PickFeedback
  className?: string
}

function getBadgeColor(score: number): string {
  if (score >= 15) return 'rgba(34, 197, 94, 0.9)'   // green — steal
  if (score >= -5) return 'rgba(234, 179, 8, 0.9)'    // yellow — fair value
  return 'rgba(239, 68, 68, 0.9)'                      // red — reach
}

function getBadgeBorder(score: number): string {
  if (score >= 15) return 'rgba(34, 197, 94, 0.3)'
  if (score >= -5) return 'rgba(234, 179, 8, 0.3)'
  return 'rgba(239, 68, 68, 0.3)'
}

function getNeedFitText(needFit: PickFeedback['needFit']): string {
  switch (needFit) {
    case 'critical': return 'Critical Need'
    case 'high': return 'High Need'
    case 'moderate': return 'Moderate Need'
    case 'low': return 'Low Need'
    default: return ''
  }
}

export function PickValidationBadge({ feedback, className = '' }: PickValidationBadgeProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 10)
    return () => clearTimeout(timer)
  }, [])

  const needFitText = getNeedFitText(feedback.needFit)

  return (
    <div
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.2s ease-in',
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: `1px solid ${getBadgeBorder(feedback.score)}`,
        borderRadius: '8px',
        padding: '8px 12px',
        display: 'inline-flex',
        flexDirection: 'column',
        gap: '4px',
        maxWidth: '280px',
      }}
    >
      {/* Label row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span
          style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontWeight: 600,
            fontSize: '12px',
            color: getBadgeColor(feedback.score),
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
          }}
        >
          {feedback.label}
        </span>
        {needFitText && (
          <span
            style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontWeight: 500,
              fontSize: '10px',
              color: 'rgba(255, 255, 255, 0.5)',
              background: 'rgba(255, 255, 255, 0.08)',
              borderRadius: '4px',
              padding: '2px 6px',
            }}
          >
            {needFitText}
          </span>
        )}
      </div>

      {/* Feedback message */}
      <p
        style={{
          fontFamily: 'Space Grotesk, sans-serif',
          fontSize: '11px',
          color: 'rgba(255, 255, 255, 0.7)',
          margin: 0,
          lineHeight: 1.4,
        }}
      >
        {feedback.message}
      </p>
    </div>
  )
}
