'use client'

import { ReactNode, useRef, useEffect, useState } from 'react'
import { motion, useReducedMotion, Variants, HTMLMotionProps } from 'framer-motion'

type FadeDirection = 'up' | 'down' | 'left' | 'right' | 'none'

interface FadeInViewProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children: ReactNode
  /** Direction the element fades in from */
  direction?: FadeDirection
  /** Distance to travel during animation (in pixels) */
  distance?: number
  /** Animation duration (in seconds) */
  duration?: number
  /** Delay before animation starts (in seconds) */
  delay?: number
  /** Viewport threshold (0-1) - how much of element must be visible */
  threshold?: number
  /** Whether to animate only once or every time element enters viewport */
  once?: boolean
  /** Root margin for intersection observer */
  rootMargin?: string
  /** Element to render as */
  as?: 'div' | 'section' | 'article' | 'aside' | 'header' | 'footer' | 'main' | 'span'
}

const getDirectionOffset = (
  direction: FadeDirection,
  distance: number
): { x: number; y: number } => {
  switch (direction) {
    case 'up':
      return { x: 0, y: distance }
    case 'down':
      return { x: 0, y: -distance }
    case 'left':
      return { x: distance, y: 0 }
    case 'right':
      return { x: -distance, y: 0 }
    case 'none':
    default:
      return { x: 0, y: 0 }
  }
}

const createVariants = (direction: FadeDirection, distance: number): Variants => {
  const offset = getDirectionOffset(direction, distance)

  return {
    hidden: {
      opacity: 0,
      x: offset.x,
      y: offset.y,
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
    },
  }
}

/**
 * FadeInView
 *
 * A component that animates its children when they enter the viewport.
 * Uses Intersection Observer for performance.
 *
 * Features:
 * - Configurable fade direction (up, down, left, right, none)
 * - Adjustable animation distance, duration, and delay
 * - Viewport threshold control
 * - Option to animate once or on every viewport entry
 * - Respects prefers-reduced-motion
 *
 * Usage:
 * ```tsx
 * <FadeInView direction="up" delay={0.2}>
 *   <Content />
 * </FadeInView>
 * ```
 */
export default function FadeInView({
  children,
  direction = 'up',
  distance = 24,
  duration = 0.5,
  delay = 0,
  threshold = 0.1,
  once = true,
  rootMargin = '0px',
  as = 'div',
  className = '',
  ...props
}: FadeInViewProps) {
  const [isInView, setIsInView] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const prefersReducedMotion = useReducedMotion()

  useEffect(() => {
    const element = ref.current
    if (!element) return

    // Skip animation setup if user prefers reduced motion
    if (prefersReducedMotion) {
      setIsInView(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          if (once) {
            observer.unobserve(element)
          }
        } else if (!once) {
          setIsInView(false)
        }
      },
      {
        threshold,
        rootMargin,
      }
    )

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [threshold, rootMargin, once, prefersReducedMotion])

  const variants = createVariants(direction, distance)
  const MotionComponent = motion[as as keyof typeof motion] as typeof motion.div

  // If user prefers reduced motion, render without animation
  if (prefersReducedMotion) {
    const StaticComponent = as
    return (
      <StaticComponent
        ref={ref as React.RefObject<HTMLDivElement>}
        className={className}
        {...(props as React.HTMLAttributes<HTMLDivElement>)}
      >
        {children}
      </StaticComponent>
    )
  }

  return (
    <MotionComponent
      ref={ref}
      variants={variants}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      transition={{
        duration,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94], // Custom ease for natural feel
      }}
      className={className}
      {...props}
    >
      {children}
    </MotionComponent>
  )
}
