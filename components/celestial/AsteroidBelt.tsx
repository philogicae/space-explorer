'use client'

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface AsteroidBeltProps {
  innerRadius: number
  outerRadius: number
  count: number
  color?: string
  size?: number
}

const AsteroidBelt = ({ 
  innerRadius, 
  outerRadius, 
  count = 2000, 
  color = '#aaaaaa',
  size = 1
}: AsteroidBeltProps) => {
  const groupRef = useRef<THREE.Group>(null)
  

  const asteroids = useMemo(() => {
    const positions = []
    const sizes = []
    

    for (let i = 0; i < count; i++) {

      const radius = innerRadius + (Math.random() ** 1.1) * (outerRadius - innerRadius)
      

      const theta = Math.random() * Math.PI * 2
      

      const inclination = (Math.random() - 0.5) * Math.PI / 8
      

      const x = radius * Math.cos(theta)
      const z = radius * Math.sin(theta)
      const y = radius * Math.sin(inclination)
      
      positions.push(x, y, z)
      

      sizes.push(Math.random() * 2 + 3 * size)
    }
    
    return { positions, sizes }
  }, [count, innerRadius, outerRadius, size])
  

  useFrame(({ clock }) => {
    if (groupRef.current) {

      groupRef.current.rotation.y = clock.getElapsedTime() * 0.02
    }
  })
  
  return (
    <group ref={groupRef}>

      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={asteroids.positions.length / 3}
            array={new Float32Array(asteroids.positions)}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-size"
            count={asteroids.sizes.length}
            array={new Float32Array(asteroids.sizes)}
            itemSize={1}
          />
        </bufferGeometry>
        <pointsMaterial
          size={5}
          sizeAttenuation={true}
          color={color}
          transparent={true}
          opacity={0.8}
          fog={true}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
      

      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[innerRadius, outerRadius, 128]} />
        <meshBasicMaterial 
          color={color} 
          transparent={true} 
          opacity={0.1} 
          side={THREE.DoubleSide} 
        />
      </mesh>
    </group>
  )
}

export default AsteroidBelt
