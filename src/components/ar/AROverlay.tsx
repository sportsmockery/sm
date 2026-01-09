'use client'

import { useEffect, useState, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { createXRStore, XR } from '@react-three/xr'
import { Text, Plane } from '@react-three/drei'

interface AROverlayProps {
  mockeryText?: string
  articleId?: string
  onClose?: () => void
}

export default function AROverlay({
  mockeryText = "Bears Flop Probability: 42%",
  articleId,
  onClose
}: AROverlayProps) {
  const [supported, setSupported] = useState<boolean | null>(null)
  const [sessionActive, setSessionActive] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Create XR store
  const store = useMemo(() => createXRStore({
    hand: true,
    controller: true,
  }), [])

  // Check AR support once on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'xr' in navigator) {
      (navigator as any).xr.isSessionSupported('immersive-ar')
        .then((isSupported: boolean) => setSupported(isSupported))
        .catch((err: Error) => {
          console.error('AR Support Check Failed:', err)
          setSupported(false)
        })
    } else {
      setSupported(false)
    }
  }, [])

  // Start AR session
  const startAR = async () => {
    if (!supported) return
    try {
      await store.enterAR()
      setSessionActive(true)
      setError(null)
    } catch (err: any) {
      console.error('Failed to start AR session:', err)
      setError('Could not start AR. Try another device or browser.')
    }
  }

  const handleClose = () => {
    if (sessionActive) {
      store.getState().session?.end()
    }
    setSessionActive(false)
    onClose?.()
  }

  // Loading state
  if (supported === null) {
    return (
      <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p>Checking AR support...</p>
        </div>
      </div>
    )
  }

  // Not supported
  if (!supported) {
    return (
      <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
        <div className="bg-[#1c1c1f] rounded-2xl p-8 max-w-md text-center">
          <div className="text-4xl mb-4">📱</div>
          <h3 className="text-xl font-bold text-white mb-3">AR Not Supported</h3>
          <p className="text-gray-400 mb-6">
            AR requires Android Chrome with ARCore installed, or iOS Safari 16+.
          </p>
          <button
            onClick={handleClose}
            className="px-6 py-3 bg-[#bc0000] text-white rounded-lg font-semibold hover:bg-[#a00000] transition"
          >
            Close
          </button>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
        <div className="bg-[#1c1c1f] rounded-2xl p-8 max-w-md text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h3 className="text-xl font-bold text-white mb-3">AR Error</h3>
          <p className="text-gray-400 mb-6">{error}</p>
          <button
            onClick={handleClose}
            className="px-6 py-3 bg-[#bc0000] text-white rounded-lg font-semibold hover:bg-[#a00000] transition"
          >
            Close
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center">
      {/* AR Entry Screen */}
      {!sessionActive && (
        <div className="text-center p-8">
          <div className="text-6xl mb-6">🥽</div>
          <h2 className="text-2xl font-bold text-white mb-4">AR Mockery Experience</h2>
          <p className="text-gray-400 mb-8 max-w-md">
            Point your camera at a flat surface to see Chicago sports mockery overlays in augmented reality.
          </p>
          <div className="flex flex-col gap-4">
            <button
              onClick={startAR}
              className="px-8 py-4 bg-[#bc0000] text-white text-lg font-bold rounded-xl shadow-lg hover:bg-[#a00000] transition transform hover:scale-105"
            >
              Launch AR Experience
            </button>
            <button
              onClick={handleClose}
              className="px-6 py-3 text-gray-400 hover:text-white transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* AR Canvas when session active */}
      {sessionActive && (
        <>
          <Canvas className="w-full h-full">
            <XR store={store}>
              {/* Mockery Overlay Panel */}
              <group position={[0, 0, -0.8]}>
                {/* Background panel */}
                <mesh>
                  <Plane args={[1.4, 0.7]}>
                    <meshBasicMaterial color="#bc0000" opacity={0.85} transparent />
                  </Plane>
                </mesh>

                {/* Border effect */}
                <mesh position={[0, 0, -0.001]}>
                  <Plane args={[1.45, 0.75]}>
                    <meshBasicMaterial color="#000000" opacity={0.9} transparent />
                  </Plane>
                </mesh>

                {/* Mockery text */}
                <Text
                  position={[0, 0.1, 0.01]}
                  fontSize={0.1}
                  color="#FFFFFF"
                  anchorX="center"
                  anchorY="middle"
                  maxWidth={1.2}
                >
                  SPORTS MOCKERY
                </Text>

                <Text
                  position={[0, -0.1, 0.01]}
                  fontSize={0.08}
                  color="#FFFFFF"
                  anchorX="center"
                  anchorY="middle"
                  maxWidth={1.2}
                >
                  {mockeryText}
                </Text>
              </group>

              {/* Chicago Star decoration */}
              <Text
                position={[0.5, 0.2, -0.75]}
                fontSize={0.15}
                color="#FFD700"
                anchorX="center"
                anchorY="middle"
              >
                ✶
              </Text>
            </XR>

            {/* Lighting */}
            <ambientLight intensity={0.8} />
            <pointLight position={[5, 5, 5]} intensity={1} />
          </Canvas>

          {/* Exit Button Overlay */}
          <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-4 z-10">
            <button
              onClick={handleClose}
              className="px-6 py-3 bg-gray-900/80 backdrop-blur text-white rounded-xl font-bold hover:bg-gray-800 transition"
            >
              Exit AR
            </button>
          </div>

          {/* Instructions */}
          <div className="absolute top-8 left-0 right-0 flex justify-center z-10">
            <div className="px-4 py-2 bg-black/60 backdrop-blur rounded-full text-white text-sm">
              Point at a surface - Tap to place
            </div>
          </div>
        </>
      )}
    </div>
  )
}
