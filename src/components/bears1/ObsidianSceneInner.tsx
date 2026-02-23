'use client'

import { Canvas } from '@react-three/fiber'
import { MeshReflectorMaterial } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import StatFlareDNA from './StatFlareDNA'

interface ObsidianSceneInnerProps {
  hasActivePlayer: boolean
  isDark: boolean
}

function ObsidianFloor({ isDark }: { isDark: boolean }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]}>
      <planeGeometry args={[50, 50]} />
      <MeshReflectorMaterial
        mirror={0}
        blur={[300, 100]}
        resolution={1024}
        mixBlur={1}
        mixStrength={isDark ? 80 : 40}
        roughness={isDark ? 0.05 : 0.2}
        metalness={isDark ? 0.9 : 0.3}
        color={isDark ? '#050505' : '#f0f0f0'}
      />
    </mesh>
  )
}

export default function ObsidianSceneInner({ hasActivePlayer, isDark }: ObsidianSceneInnerProps) {
  return (
    <Canvas
      camera={{ position: [0, 2, 5], fov: 45 }}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
      }}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={0.2} />
      <spotLight position={[0, 10, 0]} color="#bc0000" intensity={0.3} angle={0.6} penumbra={0.5} />
      <pointLight position={[-3, 3, 2]} color="#bc0000" intensity={0.1} />

      <ObsidianFloor isDark={isDark} />
      <StatFlareDNA visible={hasActivePlayer} />

      <EffectComposer>
        <Bloom luminanceThreshold={1} intensity={1.5} mipmapBlur radius={0.4} />
      </EffectComposer>
    </Canvas>
  )
}
