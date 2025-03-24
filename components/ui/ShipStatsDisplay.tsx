'use client'

import { useState, useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Vector3, Group } from 'three'

export interface ShipStatsType {
  position: { x: number; y: number; z: number };
  speed: number;
}

export function ShipStatsTracker({ shipRef }: { shipRef: React.RefObject<Group> }) {
  const [position, setPosition] = useState({ x: 0, y: 0, z: 0 })
  const [speed, setSpeed] = useState(0)
  
  const prevPosition = useRef<Vector3 | null>(null)
  const lastUpdateTime = useRef<number>(Date.now())
  const lastSpeed = useRef<number>(0)
  const lastDistanceAU = useRef<number>(0)
  const frameCounter = useRef<number>(0)
  const lastStablePosition = useRef<{x: number, y: number, z: number}>({x: 0, y: 0, z: 0})
  
  const SCALE_FACTOR = 149600
  const AU = 1000
  const SPEED_OF_LIGHT = 299792

  useFrame(() => {
    frameCounter.current += 1
    
    if (frameCounter.current % 30 !== 0) return
    if (!shipRef.current) return
    
    const currentPosition = shipRef.current.position
    
    const roundedPosition = {
      x: Math.round(currentPosition.x),
      y: Math.round(currentPosition.y),
      z: Math.round(currentPosition.z)
    }
    
    const positionChanged = 
      Math.abs(roundedPosition.x - lastStablePosition.current.x) >= 1 ||
      Math.abs(roundedPosition.y - lastStablePosition.current.y) >= 1 ||
      Math.abs(roundedPosition.z - lastStablePosition.current.z) >= 1
    
    if (positionChanged) {
      setPosition(roundedPosition)
      lastStablePosition.current = roundedPosition
    }
    
    if (prevPosition.current) {
      const distance = currentPosition.distanceTo(prevPosition.current)
      const now = Date.now()
      const timeDelta = (now - lastUpdateTime.current) / 1000 // Convert to seconds
      
      const speedKmS = distance * SCALE_FACTOR / timeDelta
      const speedLightMultiple = speedKmS / SPEED_OF_LIGHT
      const roundedSpeed = Math.round(speedLightMultiple * 10) / 10
      
      if (Math.abs(roundedSpeed - lastSpeed.current) < 0.1) {
      } else {
        setSpeed(roundedSpeed)
        lastSpeed.current = roundedSpeed
      }
      
      prevPosition.current.copy(currentPosition)
      lastUpdateTime.current = now
    } else {
      prevPosition.current = currentPosition.clone()
    }
  })
  
  useEffect(() => {
    const distanceToSun = Math.sqrt(
      position.x * position.x + 
      position.y * position.y + 
      position.z * position.z
    )
    
    const distanceInAU_raw = distanceToSun / AU
    
    if (Math.abs(distanceInAU_raw - lastDistanceAU.current) >= 0.01 || frameCounter.current % 120 === 0) {
      lastDistanceAU.current = Math.round(distanceInAU_raw * 100) / 100
    }
    
    const distanceInAU = lastDistanceAU.current.toFixed(2)
    const nearestBody = calculateNearestCelestialBody(position)
    
    window.shipStats = { 
      position, 
      speed,
      distanceInAU,
      nearestBody 
    }
  }, [position, speed])
  
  
  function calculateNearestCelestialBody(pos: {x: number, y: number, z: number}) {
    const bodies = [
      { name: 'Sun', position: {x: 0, y: 0, z: 0} },
      { name: 'Mercury', position: {x: 0.39 * AU, y: 0, z: 0} },
      { name: 'Venus', position: {x: 0.72 * AU, y: 0, z: 0} },
      { name: 'Earth', position: {x: 1.0 * AU, y: 0, z: 0} },
      { name: 'Mars', position: {x: 1.52 * AU, y: 0, z: 0} },
      { name: 'Asteroid Belt', position: {x: 2.7 * AU, y: 0, z: 0} },
      { name: 'Jupiter', position: {x: 5.2 * AU, y: 0, z: 0} },
      { name: 'Saturn', position: {x: 9.58 * AU, y: 0, z: 0} },
      { name: 'Uranus', position: {x: 19.22 * AU, y: 0, z: 0} },
      { name: 'Neptune', position: {x: 30.05 * AU, y: 0, z: 0} },
    ]
    
    let nearest = bodies[0]
    let minDistance = Number.MAX_VALUE
    
    for (const body of bodies) {
      const distance = Math.sqrt(
        (pos.x - body.position.x) ** 2 +
        (pos.y - body.position.y) ** 2 +
        (pos.z - body.position.z) ** 2
      )
      
      if (distance < minDistance) {
        minDistance = distance
        nearest = body
      }
    }
    
    return nearest.name
  }
  
  return null
}

export default function ShipStatsDisplay() {
  const [stats, setStats] = useState({
    position: { x: 0, y: 0, z: 0 },
    speed: 0,
    distanceInAU: '0.00',
    nearestBody: 'Sun'
  })
  
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (window.shipStats) {
        setStats(window.shipStats)
      }
    }, 500) 
    
    if (window.shipStats) {
      setStats(window.shipStats)
    }
    
    return () => {
      clearInterval(intervalId)
      window.shipStats = undefined
    }
  }, [])
  
  return (
    <div className="absolute top-4 left-4 bg-black bg-opacity-70 text-white p-3 rounded font-mono text-sm z-10">
      <div className="font-bold mb-1 text-cyan-300">SHIP TELEMETRY</div>
      <div className="grid grid-cols-[auto_1fr] gap-x-2">
        <span className="text-gray-400">Position:</span>
        <span>X: {stats.position.x} Y: {stats.position.y} Z: {stats.position.z}</span>
        <span className="text-gray-400">Speed:</span>
        <span>x{stats.speed === 0 ? "0.00" : stats.speed.toFixed(2)} Light speed</span>
        <span className="text-gray-400">Distance from Sun:</span>
        <span>{Number.parseFloat(stats.distanceInAU).toFixed(2)} AU</span>
        <span className="text-gray-400">Nearest body:</span>
        <span className="text-yellow-300">{stats.nearestBody}</span>
      </div>
    </div>
  )
}

// Add this to global Window interface
declare global {
  interface Window {
    shipStats?: {
      position: { x: number; y: number; z: number };
      speed: number;
      distanceInAU: string;
      nearestBody: string;
    };
  }
}
