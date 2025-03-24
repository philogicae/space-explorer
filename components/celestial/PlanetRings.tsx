'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Mesh } from 'three'

const PlanetRings = ({ 
  size, 
  innerRadius, 
  outerRadius 
}: { 
  size: number, 
  innerRadius: number, 
  outerRadius: number 
}) => {
  const ringsRef = useRef<Mesh>(null)
  
  useFrame(() => {
    if (!ringsRef.current) return
    ringsRef.current.rotation.z += 0.0005
  })
  
  return (
    <mesh ref={ringsRef} rotation={[Math.PI / 2, 0, 0]}>
      <ringGeometry args={[innerRadius * size, outerRadius * size, 64]} />
      <meshStandardMaterial 
        color="#E0C9A6" 
        transparent 
        opacity={0.7} 
        side={2} 
      />
    </mesh>
  )
}

export default PlanetRings
