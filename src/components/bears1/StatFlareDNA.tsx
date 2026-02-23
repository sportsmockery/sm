'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface StatFlareDNAProps {
  visible: boolean
}

export default function StatFlareDNA({ visible }: StatFlareDNAProps) {
  const groupRef = useRef<THREE.Group>(null)

  // Create helix geometry
  const { geometry1, geometry2 } = useMemo(() => {
    const points1: THREE.Vector3[] = []
    const points2: THREE.Vector3[] = []
    const turns = 3
    const segments = 100
    const radius = 0.3
    const height = 2.5

    for (let i = 0; i <= segments; i++) {
      const t = i / segments
      const angle = t * Math.PI * 2 * turns
      const y = t * height - height / 2

      points1.push(new THREE.Vector3(
        Math.cos(angle) * radius,
        y,
        Math.sin(angle) * radius
      ))
      points2.push(new THREE.Vector3(
        Math.cos(angle + Math.PI) * radius,
        y,
        Math.sin(angle + Math.PI) * radius
      ))
    }

    const curve1 = new THREE.CatmullRomCurve3(points1)
    const curve2 = new THREE.CatmullRomCurve3(points2)

    return {
      geometry1: new THREE.TubeGeometry(curve1, 80, 0.015, 6, false),
      geometry2: new THREE.TubeGeometry(curve2, 80, 0.015, 6, false),
    }
  }, [])

  // Cross-links between helices
  const crossLinks = useMemo(() => {
    const links: THREE.BufferGeometry[] = []
    const turns = 3
    const radius = 0.3
    const height = 2.5
    const count = 12

    for (let i = 0; i < count; i++) {
      const t = (i + 0.5) / count
      const angle = t * Math.PI * 2 * turns
      const y = t * height - height / 2

      const p1 = new THREE.Vector3(Math.cos(angle) * radius, y, Math.sin(angle) * radius)
      const p2 = new THREE.Vector3(Math.cos(angle + Math.PI) * radius, y, Math.sin(angle + Math.PI) * radius)

      const geom = new THREE.BufferGeometry().setFromPoints([p1, p2])
      links.push(geom)
    }
    return links
  }, [])

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.3
    }
  })

  if (!visible) return null

  return (
    <group ref={groupRef} position={[1.5, 0.5, -1]}>
      {/* Helix strand 1 */}
      <mesh geometry={geometry1}>
        <meshBasicMaterial color="#bc0000" wireframe transparent opacity={0.8} />
      </mesh>
      {/* Helix strand 2 */}
      <mesh geometry={geometry2}>
        <meshBasicMaterial color="#bc0000" wireframe transparent opacity={0.8} />
      </mesh>
      {/* Cross-links */}
      {crossLinks.map((geom, i) => (
        <lineSegments key={i} geometry={geom}>
          <lineBasicMaterial color="#bc0000" transparent opacity={0.3} />
        </lineSegments>
      ))}
    </group>
  )
}
