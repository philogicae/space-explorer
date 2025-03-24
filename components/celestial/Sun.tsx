'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Mesh } from 'three'

const Sun = () => {
  const meshRef = useRef<Mesh>(null)
  
  useFrame((_state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.03
    }
  })

  return (
    <group>

      <mesh ref={meshRef}>
        <sphereGeometry args={[45, 128, 128]} />
        <meshStandardMaterial
          color="#fff9e6"
          emissive="#ffcc33"
          emissiveIntensity={10}
          toneMapped={false}
          roughness={0.5}
          metalness={0.2}
        />
      </mesh>
      

      <mesh>
        <sphereGeometry args={[48, 64, 64]} />
        <meshBasicMaterial
          color="#ffdd55"
          transparent={true}
          opacity={0.3}
          toneMapped={false}
        />
      </mesh>
      

      <pointLight
        color="#ffffff"
        intensity={100}
        distance={8000}
        decay={0.2}
      />
      

      <pointLight
        color="#ffcc66"
        intensity={15}
        distance={400}
        decay={0.6}
      />
      

      <pointLight
        color="#ffffaa"
        intensity={8}
        distance={300}
        decay={1.0}
      />
      

      <hemisphereLight
        color="#ffffdd"
        groundColor="#080820"
        intensity={1.8}
      />
    </group>
  )
}

export default Sun
