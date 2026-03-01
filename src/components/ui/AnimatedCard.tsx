'use client'

import { useRef, useState } from 'react'

interface AnimatedCardProps {
  children: React.ReactNode
  className?: string
  hoverScale?: number
  hoverRotate?: number
  glowColor?: string
  maxTilt?: number
}

export default function AnimatedCard({
  children,
  className = '',
  hoverScale = 1.02,
  hoverRotate = 0,
  glowColor,
  maxTilt = 2.5,
}: AnimatedCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [transform, setTransform] = useState('')
  const [isHovered, setIsHovered] = useState(false)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return

    const rect = cardRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2

    const rotateX = ((y - centerY) / centerY) * -maxTilt
    const rotateY = ((x - centerX) / centerX) * maxTilt

    setTransform(
      `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${hoverScale})`
    )
  }

  const handleMouseLeave = () => {
    setTransform('')
    setIsHovered(false)
  }

  const handleMouseEnter = () => {
    setIsHovered(true)
  }

  return (
    <div
      ref={cardRef}
      className={`relative transition-all duration-300 ease-out ${className}`}
      style={{
        transform: isHovered ? transform : 'perspective(1000px) rotateX(0) rotateY(0) scale(1)',
        transformStyle: 'preserve-3d',
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Glow effect */}
      {glowColor && isHovered && (
        <div
          className="absolute -inset-1 rounded-xl opacity-30 blur-lg transition-opacity duration-300"
          style={{ backgroundColor: glowColor }}
        />
      )}

      {/* Card content */}
      <div className="relative">
        {children}
      </div>

      {/* Shine effect */}
      <div
        className={`absolute inset-0 rounded-xl pointer-events-none transition-opacity duration-300 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          background:
            'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.1) 45%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 55%, transparent 60%)',
        }}
      />
    </div>
  )
}
