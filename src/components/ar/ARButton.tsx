'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'

// Dynamic import to avoid SSR issues with Three.js
const AROverlay = dynamic(() => import('./AROverlay'), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
    </div>
  )
})

interface ARButtonProps {
  mockeryText?: string
  articleId?: string
  isPremium?: boolean
  className?: string
}

export function ARButton({
  mockeryText,
  articleId,
  isPremium = false,
  className = ''
}: ARButtonProps) {
  const [showAR, setShowAR] = useState(false)

  // If premium feature and user not premium, show upgrade prompt
  if (isPremium) {
    return (
      <button
        className={`flex items-center gap-2 px-4 py-2 bg-gray-800 text-gray-400 rounded-lg cursor-not-allowed ${className}`}
        disabled
      >
        <span>🥽</span>
        <span>AR (Elite Only)</span>
        <span className="text-xs bg-[#bc0000] text-white px-2 py-0.5 rounded">UPGRADE</span>
      </button>
    )
  }

  return (
    <>
      <button
        onClick={() => setShowAR(true)}
        className={`flex items-center gap-2 px-4 py-2 bg-[#bc0000] hover:bg-[#a00000] text-white rounded-lg font-semibold transition transform hover:scale-105 ${className}`}
      >
        <span>🥽</span>
        <span>View in AR</span>
      </button>

      {showAR && (
        <AROverlay
          mockeryText={mockeryText}
          articleId={articleId}
          onClose={() => setShowAR(false)}
        />
      )}
    </>
  )
}

// Floating AR button for article pages
export function FloatingARButton({ mockeryText, articleId }: ARButtonProps) {
  const [showAR, setShowAR] = useState(false)
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) return null

  return (
    <>
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setShowAR(true)}
          className="flex items-center gap-2 px-5 py-3 bg-[#bc0000] hover:bg-[#a00000] text-white rounded-full font-semibold shadow-lg transition transform hover:scale-105"
        >
          <span className="text-xl">🥽</span>
          <span className="hidden sm:inline">View in AR</span>
        </button>

        {/* Dismiss button */}
        <button
          onClick={() => setIsVisible(false)}
          className="absolute -top-2 -right-2 w-6 h-6 bg-gray-800 text-gray-400 rounded-full text-xs hover:bg-gray-700 transition"
        >
          ✕
        </button>
      </div>

      {showAR && (
        <AROverlay
          mockeryText={mockeryText}
          articleId={articleId}
          onClose={() => setShowAR(false)}
        />
      )}
    </>
  )
}

export default ARButton
