'use client'

import { useMemo } from 'react'
import * as THREE from 'three'

const OrbitLine = ({ 
  radius, 
  color = '#ffffff', 
  opacity = 0.2,
  segments = 128,
  lineWidth = 0.5,
  inclination = 0
}: { 
  radius: number,
  color?: string, 
  opacity?: number,
  segments?: number,
  lineWidth?: number,
  inclination?: number
}) => {

  const points = useMemo(() => {
    const pts = []
    const inclinationRad = (inclination * Math.PI) / 180
    
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2
      const x = Math.cos(angle) * radius
      const z = Math.sin(angle) * radius
      

      const y = z * Math.sin(inclinationRad)
      const newZ = z * Math.cos(inclinationRad)
      
      pts.push(new THREE.Vector3(x, y, newZ))
    }
    return pts
  }, [radius, segments, inclination])


  const lineGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry()
    geometry.setFromPoints(points)
    return geometry
  }, [points])


  const line = useMemo(() => {
    const material = new THREE.LineBasicMaterial({
      color: color,
      transparent: true,
      opacity: opacity,
      linewidth: lineWidth
    })
    

    return new THREE.Line(lineGeometry, material)
  }, [lineGeometry, color, opacity, lineWidth])

  return (
    <primitive object={line} />
  )
}

export default OrbitLine
