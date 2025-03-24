'use client'

import { useRef, useState, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import { Vector3, MeshPhysicalMaterial } from 'three'
import type { Group } from 'three'

import PlanetRings from './PlanetRings'
import Moon from './Moon'
import OrbitLine from './OrbitLine'
const Planet = ({ 
  orbitalRadius, 
  orbitalSpeed, 
  size, 
  color, 
  orbitalOffset = 0,
  orbitalInclination = 0,
  hasRings = false,
  name,
  moons = []
}: { 
  orbitalRadius: number, 
  orbitalSpeed: number, 
  size: number, 
  color: string, 
  orbitalOffset?: number,
  orbitalInclination?: number,
  hasRings?: boolean,
  name?: string,
  moons?: Array<{
    orbitalRadius: number, 
    orbitalSpeed: number, 
    size: number, 
    color: string, 
    orbitalOffset?: number,
    orbitalInclination?: number
  }>
}) => {
  const planetRef = useRef<Group>(null)
  const [position] = useState(new Vector3(orbitalRadius, 0, 0))
  const [showLabel, setShowLabel] = useState(false)
  

  const inclinationRad = useMemo(
    () => (orbitalInclination * Math.PI) / 180,
    [orbitalInclination]
  )


  const planetMaterial = useMemo(
    () => new MeshPhysicalMaterial({
      color,
      emissive: color,
      emissiveIntensity: 0.2,
      roughness: 0.5,
      metalness: 0.3,
      clearcoat: 0.4,
      clearcoatRoughness: 0.3,
      envMapIntensity: 2.0,
    }),
    [color]
  )

  useFrame(({ clock }) => {
    if (planetRef.current) {
      const angle = clock.getElapsedTime() * orbitalSpeed + orbitalOffset
      

      const x = Math.cos(angle) * orbitalRadius
      const flatZ = Math.sin(angle) * orbitalRadius
      

      const y = flatZ * Math.sin(inclinationRad)
      const z = flatZ * Math.cos(inclinationRad)
      

      planetRef.current.position.x = x
      planetRef.current.position.y = y
      planetRef.current.position.z = z
      position.set(x, y, z)
      

      planetRef.current.rotation.y += 0.005 / (size * 0.5)
    }
  })
  
  return (
    <>
      <group 
        ref={planetRef} 
        onPointerOver={() => setShowLabel(true)}
        onPointerOut={() => setShowLabel(false)}
      >
        <mesh>

          <sphereGeometry args={[size * 10, Math.max(24, Math.min(128, Math.floor(32 * size))), Math.max(24, Math.min(128, Math.floor(32 * size)))]} />

          <primitive object={planetMaterial} />
        </mesh>
        

        <pointLight
          color={color}
          intensity={0.8}
          distance={size * 10}
          decay={2}
        />
        
        {hasRings && <PlanetRings size={size} innerRadius={14} outerRadius={22} />}
        
        {name && showLabel && (
          <Text
            position={[0, size * 2, 0]}
            color="white"
            fontSize={size * 0.3}
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.05}
            outlineColor="#000000"
            renderOrder={2}
            frustumCulled={true}
          >
            {name}
          </Text>
        )}
      </group>
      

      {useMemo(() => moons.map((moon, index) => {
        const moonInclination = moon.orbitalInclination || (index * 3.5) % 20;
        const moonId = `moon-${name}-${moon.orbitalRadius}-${moon.size}-${moon.orbitalSpeed}-${index}`;
        
        return (
          <group key={`orbit-${moonId}`} position={[position.x, position.y, position.z]}>

            <OrbitLine 
              radius={moon.orbitalRadius} 
              color={moon.color} 
              opacity={0.15} 
              lineWidth={0.2} 
              inclination={moonInclination}
              segments={32}
            />
            

            <Moon 
              key={moonId}
              planetPosition={position}
              orbitalRadius={moon.orbitalRadius}
              orbitalSpeed={moon.orbitalSpeed}
              size={moon.size}
              color={moon.color}
              orbitalOffset={moon.orbitalOffset || 0}
              orbitalInclination={moonInclination}
            />
          </group>
        );
      }), [moons, name, position])}
    </>
  )
}

export default Planet
