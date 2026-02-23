'use client'

import Link from 'next/link'
import { useTheme } from '@/contexts/ThemeContext'
import { motion } from 'framer-motion'

export default function VisionShard() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  // Static BFR thumbnail — always available
  const thumbnail = 'https://i.ytimg.com/vi/BFR_bears_placeholder/hqdefault.jpg'
  const fallbackBg = isDark ? '#0a0a0a' : '#f0f0f0'

  return (
    <Link href="/vision-theater?mode=modern" style={{ textDecoration: 'none', display: 'block' }}>
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="h1-shard"
        style={{
          position: 'relative',
          aspectRatio: '16/9',
          background: fallbackBg,
          overflow: 'hidden',
          border: `1px solid ${isDark ? 'rgba(188,0,0,0.3)' : 'rgba(188,0,0,0.15)'}`,
          cursor: 'pointer',
        }}
      >
        {/* Gradient background as thumbnail placeholder */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: isDark
              ? 'linear-gradient(135deg, #0a0a0a 0%, #1a0000 50%, #0a0a0a 100%)'
              : 'linear-gradient(135deg, #f5f5f5 0%, #ffe8e8 50%, #f5f5f5 100%)',
          }}
        />

        {/* SM Logo watermark */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            fontSize: 48,
            fontWeight: 900,
            fontStyle: 'italic',
            color: isDark ? 'rgba(188,0,0,0.15)' : 'rgba(188,0,0,0.08)',
            letterSpacing: '-0.05em',
            userSelect: 'none',
          }}
        >
          SM
        </div>

        {/* Gradient overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 50%, transparent 100%)',
          }}
        />

        {/* Scanline overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            zIndex: 2,
            backgroundImage:
              'linear-gradient(rgba(18,16,16,0) 50%, rgba(0,0,0,0.15) 50%), linear-gradient(90deg, rgba(188,0,0,0.04), rgba(0,0,0,0), rgba(188,0,0,0.04))',
            backgroundSize: '100% 2px, 3px 100%',
          }}
        />

        {/* HUD content */}
        <div
          style={{
            position: 'absolute',
            bottom: 16,
            left: 16,
            right: 16,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            zIndex: 3,
          }}
        >
          <div>
            <span
              style={{
                color: '#bc0000',
                fontSize: 9,
                fontWeight: 900,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
              }}
            >
              Live from Vision Theater
            </span>
            <h4
              style={{
                color: '#ffffff',
                fontSize: 16,
                fontWeight: 900,
                fontStyle: 'italic',
                textTransform: 'uppercase',
                lineHeight: 1.1,
                margin: '4px 0 0',
              }}
            >
              Bears Film Room
            </h4>
          </div>

          {/* Pulsing play button */}
          <motion.div
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              border: '2px solid #bc0000',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(0,0,0,0.5)',
              flexShrink: 0,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#bc0000">
              <polygon points="8,5 20,12 8,19" />
            </svg>
          </motion.div>
        </div>
      </motion.div>
    </Link>
  )
}
