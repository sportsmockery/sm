'use client'

import { useState, useEffect } from 'react'
import { Montserrat } from 'next/font/google'
import dynamic from 'next/dynamic'

const montserrat = Montserrat({ subsets: ['latin'], weight: ['700'] })

// Dynamically import AR components
const AROverlay = dynamic(() => import('@/components/homepage-v2/AROverlay'), {
  ssr: false,
  loading: () => <div className="h-10 bg-zinc-800 animate-pulse rounded" />,
})

// Stadium configurations for each team
const STADIUM_CONFIG: Record<string, {
  name: string
  buttonText: string
  usdzPath: string
  gltfPath: string
  mockeryText: string
}> = {
  'chicago-bears': {
    name: 'Soldier Field',
    buttonText: 'Tour Soldier Field',
    usdzPath: '/models/soldier-field.usdz',
    gltfPath: '/models/soldier-field.gltf',
    mockeryText: 'Home of Bears Heartbreak Since 1924!',
  },
  'chicago-cubs': {
    name: 'Wrigley Field',
    buttonText: 'Tour Wrigley Field',
    usdzPath: '/models/wrigley-field.usdz',
    gltfPath: '/models/wrigley-field.gltf',
    mockeryText: 'The Friendly Confines of Mediocrity!',
  },
  'chicago-white-sox': {
    name: 'Guaranteed Rate Field',
    buttonText: 'Tour Guaranteed Rate Field',
    usdzPath: '/models/guaranteed-rate-field.usdz',
    gltfPath: '/models/guaranteed-rate-field.gltf',
    mockeryText: 'Empty Seats, Full Disappointment!',
  },
  'chicago-bulls': {
    name: 'United Center',
    buttonText: 'Tour United Center',
    usdzPath: '/models/united-center.usdz',
    gltfPath: '/models/united-center.gltf',
    mockeryText: 'Where the Bulls Rebuild... Again!',
  },
  'chicago-blackhawks': {
    name: 'United Center',
    buttonText: 'Tour United Center',
    usdzPath: '/models/united-center.usdz',
    gltfPath: '/models/united-center.gltf',
    mockeryText: 'The Madhouse... Now a Library!',
  },
}

type DeviceType = 'ios' | 'android' | 'desktop' | 'unknown'

interface ARTourButtonProps {
  team: string
  isElite?: boolean
  className?: string
}

/**
 * AR Tour Button
 *
 * Universal AR button with device-specific handling:
 * - iPhone/iPad: AR Quick Look (.usdz) native experience
 * - Android: WebXR immersive-ar with hit-test
 * - Desktop: Interactive 3D viewer fallback (model-viewer)
 *
 * Features:
 * - Automatic device detection
 * - Team-specific stadium models
 * - Mockery text overlays
 * - Elite membership gate option
 */
export default function ARTourButton({
  team,
  isElite = false,
  className = '',
}: ARTourButtonProps) {
  const [deviceType, setDeviceType] = useState<DeviceType>('unknown')
  const [showAR, setShowAR] = useState(false)

  const config = STADIUM_CONFIG[team]

  // Detect device type
  useEffect(() => {
    const detectDevice = (): DeviceType => {
      if (typeof window === 'undefined' || typeof navigator === 'undefined') {
        return 'unknown'
      }

      const ua = navigator.userAgent.toLowerCase()

      // iOS detection
      if (/iphone|ipad|ipod/.test(ua)) {
        return 'ios'
      }

      // Android detection
      if (/android/.test(ua)) {
        return 'android'
      }

      // Desktop
      return 'desktop'
    }

    setDeviceType(detectDevice())
  }, [])

  if (!config) {
    return null
  }

  // iOS: Use AR Quick Look
  if (deviceType === 'ios') {
    return (
      <div className={`bg-zinc-900 dark:bg-zinc-950 p-4 border border-zinc-800 rounded-lg ${className}`}>
        <h3 className={`text-white text-lg mb-2 ${montserrat.className}`}>
          AR Stadium Tour
        </h3>
        <p className="text-zinc-400 text-sm mb-3 font-serif">
          Place {config.name} in your room!
        </p>

        <a
          href={config.usdzPath}
          rel="ar"
          className={`
            block w-full text-center px-4 py-3
            bg-[#FF0000] hover:bg-red-700
            text-white font-bold rounded
            transition-colors
            focus:outline-none focus:ring-2 focus:ring-red-600
            ${montserrat.className}
          `}
          aria-label={`View ${config.name} in AR`}
        >
          <span className="inline-flex items-center gap-2">
            <ARIcon />
            {config.buttonText}
          </span>
        </a>

        <p className="text-zinc-500 text-xs mt-3 text-center">
          Best on iPhone (Safari) – place the stadium in your room!
        </p>
      </div>
    )
  }

  // Android: Use WebXR
  if (deviceType === 'android') {
    return (
      <div className={`bg-zinc-900 dark:bg-zinc-950 p-4 border border-zinc-800 rounded-lg ${className}`}>
        <h3 className={`text-white text-lg mb-2 ${montserrat.className}`}>
          AR Stadium Tour
        </h3>
        <p className="text-zinc-400 text-sm mb-3 font-serif">
          Experience {config.name} in AR!
        </p>

        <button
          onClick={() => setShowAR(true)}
          className={`
            w-full px-4 py-3
            bg-[#FF0000] hover:bg-red-700
            text-white font-bold rounded
            transition-colors
            focus:outline-none focus:ring-2 focus:ring-red-600
            ${montserrat.className}
          `}
          aria-label={`View ${config.name} in AR`}
        >
          <span className="inline-flex items-center gap-2">
            <ARIcon />
            {config.buttonText}
          </span>
        </button>

        <p className="text-zinc-500 text-xs mt-3 text-center">
          Tap to place stadium in your space
        </p>

        {showAR && (
          <AROverlay
            team={team}
            mockeryText={config.mockeryText}
            isElite={true}
            onClose={() => setShowAR(false)}
          />
        )}
      </div>
    )
  }

  // Desktop: Interactive 3D viewer
  return (
    <div className={`bg-zinc-900 dark:bg-zinc-950 p-4 border border-zinc-800 rounded-lg ${className}`}>
      <h3 className={`text-white text-lg mb-2 ${montserrat.className}`}>
        3D Stadium Tour
      </h3>
      <p className="text-zinc-400 text-sm mb-3 font-serif">
        Explore {config.name} in 3D!
      </p>

      <button
        onClick={() => setShowAR(true)}
        className={`
          w-full px-4 py-3
          bg-[#FF0000] hover:bg-red-700
          text-white font-bold rounded
          transition-colors
          focus:outline-none focus:ring-2 focus:ring-red-600
          ${montserrat.className}
        `}
        aria-label={`View ${config.name} in 3D`}
      >
        <span className="inline-flex items-center gap-2">
          <CubeIcon />
          View {config.name} in 3D
        </span>
      </button>

      <p className="text-zinc-500 text-xs mt-3 text-center">
        AR best on mobile • View 3D on desktop
      </p>

      {showAR && (
        <AROverlay
          team={team}
          mockeryText={config.mockeryText}
          isElite={true}
          onClose={() => setShowAR(false)}
        />
      )}
    </div>
  )
}

// AR Icon component
function ARIcon() {
  return (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
      />
    </svg>
  )
}

// Cube Icon component
function CubeIcon() {
  return (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
      />
    </svg>
  )
}
