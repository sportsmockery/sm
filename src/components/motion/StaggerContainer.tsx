'use client'

import { ReactNode, Children, isValidElement, cloneElement, useRef, useEffect, useState } from 'react'
import { motion, useReducedMotion, Variants, HTMLMotionProps } from 'framer-motion'

interface StaggerContainerProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children: ReactNode
  /** Delay between each child animation (in seconds) */
  staggerDelay?: number
  /** Initial delay before first child animates (in seconds) */
  initialDelay?: number
  /** Animation duration for each child (in seconds) */
  childDuration?: number
  /** Direction children animate from */
  direction?: 'up' | 'down' | 'left' | 'right'
  /** Distance children travel during animation */
  distance?: number
  /** Whether to animate when in viewport (uses Intersection Observer) */
  animateOnView?: boolean
  /** Viewport threshold for animateOnView */
  threshold?: number
  /** Element to render as */
  as?: 'div' | 'ul' | 'ol' | 'section' | 'article'
}

const getDirectionOffset = (
  direction: 'up' | 'down' | 'left' | 'right',
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
    default:
      return { x: 0, y: distance }
  }
}

/**
 * StaggerContainer
 *
 * A container that orchestrates staggered animations for its children.
 * Each child animates in sequence with a configurable delay.
 *
 * Features:
 * - Automatic stagger timing for children
 * - Configurable direction, distance, and duration
 * - Optional viewport-based triggering
 * - Respects prefers-reduced-motion
 *
 * Usage:
 * ```tsx
 * <StaggerContainer staggerDelay={0.1} direction="up">
 *   <Card>First</Card>
 *   <Card>Second</Card>
 *   <Card>Third</Card>
 * </StaggerContainer>
 * ```
 *
 * Note: For best results, wrap direct children in motion-compatible elements
 * or use with AnimatedCard components that accept an `index` prop.
 */
export default function StaggerContainer({
  children,
  staggerDelay = 0.08,
  initialDelay = 0,
  childDuration = 0.4,
  direction = 'up',
  distance = 20,
  animateOnView = true,
  threshold = 0.1,
  as = 'div',
  className = '',
  ...props
}: StaggerContainerProps) {
  const [isInView, setIsInView] = useState(!animateOnView)
  const ref = useRef<HTMLDivElement>(null)
  const prefersReducedMotion = useReducedMotion()

  useEffect(() => {
    if (!animateOnView || prefersReducedMotion) {
      setIsInView(true)
      return
    }

    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.unobserve(element)
        }
      },
      { threshold }
    )

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [animateOnView, threshold, prefersReducedMotion])

  const offset = getDirectionOffset(direction, distance)

  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: initialDelay,
      },
    },
  }

  const childVariants: Variants = {
    hidden: {
      opacity: 0,
      x: offset.x,
      y: offset.y,
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        duration: childDuration,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  }

  const MotionComponent = motion[as as keyof typeof motion] as typeof motion.div

  // If user prefers reduced motion, render children without animation
  if (prefersReducedMotion) {
    return (
      <div
        ref={ref}
        className={className}
      >
        {children}
      </div>
    )
  }

  // Clone children and wrap them in motion.div for stagger effect
  const animatedChildren = Children.map(children, (child, index) => {
    if (!isValidElement(child)) return child

    // If child already has motion props or is a motion component, just add variants
    // Otherwise, wrap in motion.div
    const childElement = child as React.ReactElement<{ className?: string; style?: React.CSSProperties }>

    return (
      <motion.div
        key={index}
        variants={childVariants}
        className="stagger-item"
      >
        {cloneElement(childElement)}
      </motion.div>
    )
  })

  return (
    <MotionComponent
      ref={ref}
      variants={containerVariants}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      className={className}
      {...props}
    >
      {animatedChildren}
    </MotionComponent>
  )
}
