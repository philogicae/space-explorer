'use client'

import type { Group } from 'three'
import Spaceship from './Spaceship'

interface ShipWithCameraProps {
  shipRef: React.RefObject<Group>
}

export default function ShipWithCamera({ shipRef }: ShipWithCameraProps) {
  return <Spaceship initialPosition={[250, 50, 150]} ref={shipRef} />
}
