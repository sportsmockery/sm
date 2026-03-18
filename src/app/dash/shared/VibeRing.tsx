'use client'

import { motion } from 'framer-motion'

interface VibeRingProps {
  score: number
  color: string
  logoUrl: string
  isLive?: boolean
  size?: number
}

export function VibeRing({ score, color, logoUrl, isLive, size = 64 }: VibeRingProps) {
  const r = (size / 2) - 2
  const circumference = 2 * Math.PI * r
  const isCrisis = score < 40

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {(isCrisis || isLive) && (
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute inset-0 rounded-full"
          style={{ border: `2px solid ${color}` }}
        />
      )}
      <svg className="absolute inset-0 w-full h-full -rotate-90">
        <circle cx={size/2} cy={size/2} r={r} fill="transparent" stroke="currentColor" strokeWidth="3" className="text-gray-200 dark:text-[#1a1a1a]" />
        <motion.circle
          cx={size/2} cy={size/2} r={r}
          fill="transparent" stroke={color} strokeWidth="3"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - (circumference * score) / 100 }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          strokeLinecap="round"
        />
      </svg>
      <div
        className="z-10 overflow-hidden rounded-full border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0B0F14]"
        style={{ width: size - 12, height: size - 12 }}
      >
        <img src={logoUrl} alt="" className="w-full h-full object-contain p-1" />
      </div>
    </div>
  )
}
