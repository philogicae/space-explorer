'use client'

import { useEffect, useRef, useState, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { PerspectiveCamera } from '@react-three/drei'
import { Vector3 } from 'three'
import type { Group } from 'three'
import type { CameraControlsInterface } from '../types/controls'
import { 
  DEFAULT_DISTANCE, 
  DEFAULT_ROTATION_X, 
  DEFAULT_ROTATION_Y,
  MIN_DISTANCE,
  MAX_DISTANCE,
  MIN_ROTATION_X,
  MAX_ROTATION_X
} from '../types/controls'

interface ShipCameraProps {
  target: React.RefObject<Group>
}

export default function ShipCamera({ target }: ShipCameraProps) {
  const { camera } = useThree()
  const cameraRigRef = useRef<Group>(null)
  const cameraPosition = useMemo(() => new Vector3(), [])

  const [distance, setDistance] = useState(DEFAULT_DISTANCE)
  const [rotation, setRotation] = useState({
    x: DEFAULT_ROTATION_X,
    y: DEFAULT_ROTATION_Y,
  })

  useEffect(() => {
    if (!window) return

    const cameraControlsObj: CameraControlsInterface = {
      zoomIn: () => setDistance((prev) => Math.max(MIN_DISTANCE, prev - 10)),
      zoomOut: () => setDistance((prev) => Math.min(MAX_DISTANCE, prev + 10)),
      rotate: (x: number, y: number) =>
        setRotation({
          x: Math.max(MIN_ROTATION_X, Math.min(MAX_ROTATION_X, rotation.x + x)),
          y: rotation.y + y,
        }),
      updateJoystick: (x: number, y: number) => {
        const baseSensitivity = 0.003

        const xInput =
          x === 0 ? 0 : Math.sign(x) * (Math.abs(x) / 40) ** 1.5 * 40
        const yInput =
          y === 0 ? 0 : Math.sign(y) * (Math.abs(y) / 40) ** 1.5 * 40

        const deltaX = xInput * baseSensitivity
        const deltaY = -yInput * baseSensitivity

        setRotation({
          x: Math.max(
            MIN_ROTATION_X,
            Math.min(MAX_ROTATION_X, rotation.x + deltaY)
          ),
          y: rotation.y + deltaX,
        })
      },
      resetCamera: () => {
        setRotation({ x: DEFAULT_ROTATION_X, y: DEFAULT_ROTATION_Y })
        setDistance(DEFAULT_DISTANCE)
      },
    };

    // Assign controls to window object
    const windowWithControls = window as Window &
      typeof globalThis & { cameraControls?: CameraControlsInterface };
    windowWithControls.cameraControls = cameraControlsObj;

    return () => {
      windowWithControls.cameraControls = undefined;
    }
  }, [rotation])

  useFrame(() => {
    if (!target.current || !cameraRigRef.current) return

    cameraRigRef.current.position.copy(target.current.position)

    cameraPosition.set(
      distance * Math.sin(rotation.y) * Math.cos(rotation.x),
      distance * Math.sin(rotation.x),
      distance * Math.cos(rotation.y) * Math.cos(rotation.x)
    )

    camera.position.copy(cameraPosition)
    camera.lookAt(cameraRigRef.current.position)
  }, 0)

  return (
    <group ref={cameraRigRef}>
      <PerspectiveCamera
        makeDefault
        position={[0, 0, DEFAULT_DISTANCE]}
        fov={50}
        near={0.1}
        far={100000}
      />
    </group>
  )
}
