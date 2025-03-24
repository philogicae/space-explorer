'use client'

import { useEffect, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { Vector3 } from 'three'
import type { Group } from 'three'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'

interface CameraManagerProps {
  target: React.RefObject<Group>
  offset?: Vector3
}


export default function CameraManager({ 
  target, 
  offset = new Vector3(0, 50, 150) 
}: CameraManagerProps) {
  const { camera } = useThree()
  const controls = useRef<OrbitControlsImpl>(null)
  

  const lastTargetPos = useRef(new Vector3())
  const isInitialized = useRef(false)
  

  useEffect(() => {

    const setupCamera = () => {
      if (!target.current || isInitialized.current) return
      

      const pos = target.current.position.clone()
      lastTargetPos.current.copy(pos)
      

      camera.position.copy(pos).add(offset)
      camera.lookAt(pos)
      
      // Update orbit controls
      if (controls.current) {
        controls.current.target.copy(pos)
        controls.current.update()
      }
      
      isInitialized.current = true
    }
    

    if (target.current) {
      setupCamera()
    } else {
      const checkInterval = setInterval(() => {
        if (target.current) {
          setupCamera()
          clearInterval(checkInterval)
        }
      }, 100)
      
      return () => clearInterval(checkInterval)
    }
  }, [camera, target, offset])
  

  useEffect(() => {

    if (!isInitialized.current) return
    

    const updateCamera = () => {
      if (!target.current) return
      
      const currentPos = target.current.position
      

      const movement = new Vector3().subVectors(currentPos, lastTargetPos.current)
      

      if (movement.length() > 0.001) {

        if (controls.current) {
          controls.current.target.add(movement)
        }
        

        camera.position.add(movement)
        

        lastTargetPos.current.copy(currentPos)
      }
    }
    

    let frameId: number
    const animate = () => {
      updateCamera()
      frameId = requestAnimationFrame(animate)
    }
    

    frameId = requestAnimationFrame(animate)
    

    return () => {
      cancelAnimationFrame(frameId)
    }
  }, [camera, target])
  
  return (
    <OrbitControls
      ref={controls}
      enablePan={false}
      minDistance={30}
      maxDistance={5000}
      enableDamping
      dampingFactor={0.2}
      rotateSpeed={0.5}
      zoomSpeed={1.0}
    />
  )
}
