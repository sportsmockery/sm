'use client'

import { ReactNode, useState, useEffect } from 'react'
import { useScrollAnimation, scrollAnimations, AnimationType } from '@/hooks/useScrollAnimation'

interface ScrollRevealProps {
  children: ReactNode
  animation?: AnimationType
  delay?: number
  threshold?: number
  className?: string
  as?: 'div' | 'section' | 'article' | 'span' | 'li'
}

export default function ScrollReveal({
  children,
  animation = 'fadeInUp',
  delay = 0,
  threshold = 0.1,
  className = '',
  as: Component = 'div',
}: ScrollRevealProps) {
  const [ref, isVisible] = useScrollAnimation<HTMLElement>({ threshold })
  const animationClass = scrollAnimations[animation]

  return (
    <Component
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ref={ref as any}
      className={`${className} ${isVisible ? animationClass.visible : animationClass.hidden}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </Component>
  )
}

// Staggered list animation component
interface StaggeredListProps {
  children: ReactNode[]
  animation?: AnimationType
  baseDelay?: number
  staggerDelay?: number
  threshold?: number
  className?: string
  itemClassName?: string
}

export function StaggeredList({
  children,
  animation = 'fadeInUp',
  baseDelay = 0,
  staggerDelay = 100,
  threshold = 0.1,
  className = '',
  itemClassName = '',
}: StaggeredListProps) {
  const [ref, isVisible] = useScrollAnimation<HTMLDivElement>({ threshold })
  const animationClass = scrollAnimations[animation]

  return (
    <div ref={ref} className={className}>
      {children.map((child, index) => (
        <div
          key={index}
          className={`${itemClassName} ${isVisible ? animationClass.visible : animationClass.hidden}`}
          style={{ transitionDelay: `${baseDelay + index * staggerDelay}ms` }}
        >
          {child}
        </div>
      ))}
    </div>
  )
}

// Parallax scroll effect component
interface ParallaxProps {
  children: ReactNode
  speed?: number // 0-1 range, 0 = no parallax, 1 = full parallax
  className?: string
}

export function Parallax({ children, speed = 0.5, className = '' }: ParallaxProps) {
  const [ref, isVisible] = useScrollAnimation<HTMLDivElement>({
    threshold: 0,
    rootMargin: '100px',
    triggerOnce: false,
  })

  return (
    <div ref={ref} className={`relative ${className}`}>
      <div
        className={`transition-transform duration-100 ${isVisible ? '' : ''}`}
        style={{
          transform: isVisible ? `translateY(${speed * -20}px)` : 'translateY(0)',
        }}
      >
        {children}
      </div>
    </div>
  )
}

// Counter animation for numbers
interface CountUpProps {
  end: number
  duration?: number
  suffix?: string
  prefix?: string
  className?: string
}

export function CountUp({
  end,
  duration = 2000,
  suffix = '',
  prefix = '',
  className = '',
}: CountUpProps) {
  const [ref, isVisible] = useScrollAnimation<HTMLSpanElement>({ threshold: 0.5 })
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!isVisible) return

    let startTime: number | null = null
    let animationFrame: number

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      setCount(Math.floor(progress * end))
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      }
    }
    animationFrame = requestAnimationFrame(animate)

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame)
      }
    }
  }, [isVisible, end, duration])

  return (
    <span ref={ref} className={className}>
      {prefix}
      {count}
      {suffix}
    </span>
  )
}
