'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Vector3 } from 'three'
import type { Mesh } from 'three'
const Moon = ({ 
  planetPosition, 
  orbitalRadius, 
  orbitalSpeed, 
  size, 
  color, 
  orbitalOffset = 0,
  orbitalInclination = 5.0 // Most moons have some inclination relative to planet's equator 
}: { 
  planetPosition: Vector3, 
  orbitalRadius: number, 
  orbitalSpeed: number, 
  size: number, 
  color: string, 
  orbitalOffset?: number,
  orbitalInclination?: number 
}) => {
  const moonRef = useRef<Mesh>(null)
  
  useFrame(({ clock }) => {
    if (!moonRef.current) return
    
    const time = clock.getElapsedTime()
    const angle = time * orbitalSpeed + orbitalOffset
    const inclinationRad = (orbitalInclination * Math.PI) / 180
    
    // Calculate base orbital position
    const x = Math.cos(angle) * orbitalRadius
    const flatZ = Math.sin(angle) * orbitalRadius
    
    // Apply orbital inclination
    const y = flatZ * Math.sin(inclinationRad)
    const z = flatZ * Math.cos(inclinationRad)
    
    // Update moon position relative to its planet
    moonRef.current.position.x = planetPosition.x + x
    moonRef.current.position.y = planetPosition.y + y
    moonRef.current.position.z = planetPosition.z + z
    
    // Add rotation to the moon
    moonRef.current.rotation.y += 0.01
  })
  
  return (
    <mesh ref={moonRef} position={[planetPosition.x + orbitalRadius, planetPosition.y, planetPosition.z]}>
      <sphereGeometry args={[size * 10, 32, 32]} />
      <meshPhysicalMaterial 
        color={color} 
        roughness={0.65}
        metalness={0.1}
        clearcoat={0.2}
        emissive={color}
        emissiveIntensity={0.05}
      />
    </mesh>
  )
}

export default Moon
