'use client'

import { useRef, useEffect, useMemo } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'


const constellations = [
  // Big Dipper (part of Ursa Major)
  {
    name: 'Big Dipper',
    stars: [

      { x: 0.5, y: 0.8, z: 0.2, brightness: 2.5, color: 0xA7D8FF },
      { x: 0.45, y: 0.78, z: 0.25, brightness: 2.3, color: 0xF9F5FF },
      { x: 0.4, y: 0.77, z: 0.3, brightness: 2.2, color: 0xD6EBFF },
      { x: 0.35, y: 0.73, z: 0.35, brightness: 2.0, color: 0xFFFCE6 },
      { x: 0.32, y: 0.67, z: 0.38, brightness: 2.2, color: 0xFFE8D1 },
      { x: 0.3, y: 0.6, z: 0.4, brightness: 2.3, color: 0xD1F0FF },
      { x: 0.35, y: 0.55, z: 0.43, brightness: 2.5, color: 0xFFE6C8 },
    ],
    lines: [
      [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6]
    ]
  },

  {
    name: 'Orion',
    stars: [
      { x: -0.5, y: -0.1, z: 0.1, brightness: 2.8, color: 0xFFC9A3 },
      { x: -0.45, y: -0.15, z: 0.08, brightness: 2.0, color: 0xCCE4FF },
      { x: -0.48, y: -0.25, z: 0.15, brightness: 2.2, color: 0x9CCDFF },
      { x: -0.5, y: -0.3, z: 0.14, brightness: 2.1, color: 0xA6E1FF },
      { x: -0.52, y: -0.35, z: 0.13, brightness: 2.2, color: 0xBAE0FF },
      { x: -0.56, y: -0.4, z: 0.08, brightness: 2.9, color: 0x85D6FF },
      { x: -0.42, y: -0.32, z: 0.07, brightness: 2.0, color: 0xB3DAFF },
    ],
    lines: [
      [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 0]
    ]
  },

  {
    name: 'Cassiopeia',
    stars: [
      { x: 0.1, y: 0.4, z: -0.3, brightness: 2.3, color: 0xFFE9C2 },
      { x: 0.15, y: 0.45, z: -0.35, brightness: 2.5, color: 0xFFEBD3 },
      { x: 0.2, y: 0.42, z: -0.38, brightness: 2.7, color: 0xFFDFC0 },
      { x: 0.25, y: 0.38, z: -0.35, brightness: 2.4, color: 0xFFE0C4 },
      { x: 0.3, y: 0.35, z: -0.3, brightness: 2.3, color: 0xFFE6D6 },
    ],
    lines: [
      [0, 1], [1, 2], [2, 3], [3, 4]
    ]
  }
];


const cachedGeometries = {
  tiny: new THREE.BufferGeometry(),
  small: new THREE.BufferGeometry(),
  constellationSphere: new THREE.SphereGeometry(1, 8, 8)
};

const cachedMaterials = {
  tiny: new THREE.PointsMaterial({
    size: 0.4,
    color: 0xFFFFFF,
    sizeAttenuation: false,
    fog: false
  }),
  small: new THREE.PointsMaterial({
    size: 0.7,
    color: 0xFFFFF0,
    sizeAttenuation: false,
    fog: false
  })
};


const Starfield = () => {
  const { scene } = useThree()
  const starsRef = useRef<THREE.Group | null>(null)
  const rotateSpeed = 0.00001
  

  const backgroundStarData = useMemo(() => {
    const backgroundStarCount = 10000
    const radius = 8000
    const verticesTiny = []
    const verticesSmall = []
    

    for (let i = 0; i < backgroundStarCount; i++) {

      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      
      const x = radius * Math.sin(phi) * Math.cos(theta)
      const y = radius * Math.sin(phi) * Math.sin(theta)
      const z = radius * Math.cos(phi)
      

      if (Math.random() > 0.05) {
        verticesTiny.push(x, y, z)
      } else {
        verticesSmall.push(x, y, z)
      }
    }
    
    return { verticesTiny, verticesSmall }
  }, [])
  
  useEffect(() => {

    const starsGroup = new THREE.Group()
    const radius = 8000
    

    cachedGeometries.tiny.setAttribute('position', 
      new THREE.Float32BufferAttribute(backgroundStarData.verticesTiny, 3))
    cachedGeometries.small.setAttribute('position', 
      new THREE.Float32BufferAttribute(backgroundStarData.verticesSmall, 3))
    

    const tinyStars = new THREE.Points(cachedGeometries.tiny, cachedMaterials.tiny)
    const smallStars = new THREE.Points(cachedGeometries.small, cachedMaterials.small)
    starsGroup.add(tinyStars)
    starsGroup.add(smallStars)
    

    for (const constellation of constellations) {

      const constellationGroup = new THREE.Group()
      

      const starObjects: THREE.Mesh[] = []
      

      for (const star of constellation.stars) {

        const material = new THREE.MeshBasicMaterial({ color: star.color })
        const starMesh = new THREE.Mesh(cachedGeometries.constellationSphere, material)
        

        starMesh.scale.set(
          star.brightness * 0.3,
          star.brightness * 0.3,
          star.brightness * 0.3
        )
        

        starMesh.position.set(
          star.x * radius * 0.5,
          star.y * radius * 0.5,
          star.z * radius * 0.5
        )
        
        constellationGroup.add(starMesh)
        starObjects.push(starMesh)
      }
      

      for (const [startIdx, endIdx] of constellation.lines) {
        const startStar = starObjects[startIdx]
        const endStar = starObjects[endIdx]
        

        const lineGeometry = new THREE.BufferGeometry()
        const lineVertices = [
          startStar.position.x, startStar.position.y, startStar.position.z,
          endStar.position.x, endStar.position.y, endStar.position.z
        ]
        
        lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(lineVertices, 3))
        

        let lineColor = 0x444466;
        

        if (constellation.name === 'Big Dipper') {
          lineColor = 0x3A5A80;
        } else if (constellation.name === 'Orion') {
          lineColor = 0x446688;
        } else if (constellation.name === 'Cassiopeia') {
          lineColor = 0x7D5D4E;
        }
        
        const lineMaterial = new THREE.LineBasicMaterial({ 
          color: lineColor, 
          transparent: true, 
          opacity: 0.15,
          fog: false,
        })
        
        const line = new THREE.Line(lineGeometry, lineMaterial)
        constellationGroup.add(line)
      }
      
      starsGroup.add(constellationGroup)
    }
    

    scene.add(starsGroup)
    starsRef.current = starsGroup
    

    return () => {

      scene.remove(starsGroup)
      

      starsGroup.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose()
          if (object.material instanceof THREE.Material) {
            object.material.dispose()
          } else if (Array.isArray(object.material)) {
            for (const material of object.material) {
              material.dispose()
            }
          }
        } else if (object instanceof THREE.Line) {
          object.geometry.dispose()
          if (object.material instanceof THREE.Material) {
            object.material.dispose()
          }
        } else if (object instanceof THREE.Points) {
          object.geometry.dispose()
          if (object.material instanceof THREE.Material) {
            object.material.dispose()
          }
        }
      })
    }
  }, [scene, backgroundStarData.verticesTiny, backgroundStarData.verticesSmall])
  

  useFrame((_, delta) => {
    if (starsRef.current) {
      starsRef.current.rotation.y += delta * rotateSpeed
    }
  })

  return null
}

export default Starfield
