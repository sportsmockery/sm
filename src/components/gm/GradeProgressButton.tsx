'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface GradeProgressButtonProps {
  grading: boolean
  canGrade: boolean
  isBlocked: boolean
  onGrade: () => void
  isDark: boolean
  label?: string
  blockedLabel?: string
}

// Estimated time for grading in ms (AI response typically takes 5-10 seconds)
const ESTIMATED_DURATION = 8000

export function GradeProgressButton({
  grading,
  canGrade,
  isBlocked,
  onGrade,
  isDark,
  label = 'GRADE TRADE',
  blockedLabel = 'FIX ISSUES TO GRADE',
}: GradeProgressButtonProps) {
  const [progress, setProgress] = useState(0)
  const [phase, setPhase] = useState<'idle' | 'validating' | 'analyzing' | 'grading' | 'complete'>('idle')

  const canClick = canGrade && !grading && !isBlocked
  const subText = 'var(--sm-text-muted)'

  // Progress animation when grading
  useEffect(() => {
    if (!grading) {
      setProgress(0)
      setPhase('idle')
      return
    }

    setPhase('validating')
    let startTime = Date.now()
    let animationFrame: number

    const updateProgress = () => {
      const elapsed = Date.now() - startTime
      // Use an easing function that slows down as it approaches 95%
      // This gives the illusion of progress even if the API takes longer
      const rawProgress = elapsed / ESTIMATED_DURATION
      const easedProgress = 1 - Math.pow(1 - Math.min(rawProgress, 1), 3) // Cubic ease-out
      const cappedProgress = Math.min(easedProgress * 95, 95) // Never exceed 95% until complete

      setProgress(cappedProgress)

      // Update phase based on progress
      if (cappedProgress < 15) {
        setPhase('validating')
      } else if (cappedProgress < 60) {
        setPhase('analyzing')
      } else {
        setPhase('grading')
      }

      if (grading && cappedProgress < 95) {
        animationFrame = requestAnimationFrame(updateProgress)
      }
    }

    animationFrame = requestAnimationFrame(updateProgress)

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame)
      }
    }
  }, [grading])

  // When grading completes, animate to 100%
  useEffect(() => {
    if (!grading && progress > 0) {
      setProgress(100)
      setPhase('complete')
      // Reset after animation
      const timer = setTimeout(() => {
        setProgress(0)
        setPhase('idle')
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [grading, progress])

  const getPhaseText = () => {
    switch (phase) {
      case 'validating':
        return 'Validating trade...'
      case 'analyzing':
        return 'Analyzing player values...'
      case 'grading':
        return 'Generating grade...'
      case 'complete':
        return 'Complete!'
      default:
        return isBlocked ? blockedLabel : label
    }
  }

  const getProgressColor = () => {
    if (progress < 30) return '#eab308' // Yellow - validating
    if (progress < 70) return '#3b82f6' // Blue - analyzing
    return '#22c55e' // Green - grading/complete
  }

  return (
    <button
      onClick={onGrade}
      disabled={!canClick}
      style={{
        width: '100%',
        padding: 0,
        borderRadius: '12px',
        border: 'none',
        backgroundColor: canClick ? '#bc0000' : (isDark ? '#374151' : '#d1d5db'),
        color: canClick ? '#fff' : subText,
        fontWeight: 800,
        fontSize: '16px',
        cursor: canClick ? 'pointer' : 'not-allowed',
        letterSpacing: '0.5px',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Progress bar background */}
      <AnimatePresence>
        {grading && (
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: progress / 100 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1, ease: 'linear' }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: getProgressColor(),
              transformOrigin: 'left',
              opacity: 0.3,
            }}
          />
        )}
      </AnimatePresence>

      {/* Shimmer effect during grading */}
      <AnimatePresence>
        {grading && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: '200%' }}
            transition={{
              repeat: Infinity,
              duration: 1.5,
              ease: 'linear',
            }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '50%',
              height: '100%',
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
            }}
          />
        )}
      </AnimatePresence>

      {/* Button content */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          padding: '14px 32px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: grading ? 8 : 0,
        }}
      >
        <span>{getPhaseText()}</span>

        {/* Progress indicator */}
        <AnimatePresence>
          {grading && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
              }}
            >
              {/* Progress bar track */}
              <div
                style={{
                  width: '80%',
                  height: 4,
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  borderRadius: 2,
                  overflow: 'hidden',
                }}
              >
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.1, ease: 'linear' }}
                  style={{
                    height: '100%',
                    backgroundColor: '#fff',
                    borderRadius: 2,
                  }}
                />
              </div>

              {/* Percentage text */}
              <span style={{ fontSize: 11, opacity: 0.8 }}>
                {Math.round(progress)}%
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </button>
  )
}

export default GradeProgressButton
