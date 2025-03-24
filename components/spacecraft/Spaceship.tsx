'use client'

import { useRef, useEffect, useState, forwardRef, useMemo, useCallback } from 'react'
import type { ForwardedRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Vector3, CylinderGeometry, ConeGeometry, SphereGeometry, MeshStandardMaterial, MeshBasicMaterial } from 'three'
import type { Group } from 'three'
import type { ShipControlsInterface } from '../types/controls'

interface SpaceshipProps {
	initialPosition?: [number, number, number]
}

const Spaceship = forwardRef(
	(
		{ initialPosition = [250, 50, 150] }: SpaceshipProps,
		ref: ForwardedRef<Group>
	) => {
		const shipRef = useRef<Group>(null)

		useEffect(() => {
			if (shipRef.current) {
				shipRef.current.position.set(
					initialPosition[0],
					initialPosition[1],
					initialPosition[2]
				)

				const direction = new Vector3(
					-initialPosition[0],
					-initialPosition[1],
					-initialPosition[2]
				).normalize()

				const angleY = Math.atan2(direction.x, direction.z)

				shipRef.current.rotation.set(0, angleY + Math.PI, 0)
			}
		}, [initialPosition])


		const [keys, setKeys] = useState({
			forward: false,
			backward: false,
			left: false,
			right: false,
			pitchUp: false,
			pitchDown: false,
			turbo: false,
			brake: false,
		})

		const handleKeyDown = useCallback((e: KeyboardEvent) => {
			const key = e.key.toLowerCase()
			setKeys(prev => {
				if (
					(key === 'q' && !prev.forward) ||
					(key === 'e' && !prev.backward) ||
					(key === 'a' && !prev.left) ||
					(key === 'd' && !prev.right) ||
					(key === 'w' && !prev.pitchUp) ||
					(key === 's' && !prev.pitchDown)
				) {
					const newKeys = { ...prev }
					
					switch (key) {
						case 'q': newKeys.forward = true; break
						case 'e': newKeys.backward = true; break
						case 'a': newKeys.left = true; break
						case 'd': newKeys.right = true; break
						case 'w': newKeys.pitchUp = true; break
						case 's': newKeys.pitchDown = true; break
					}
					
					return newKeys
				}
				return prev
			})
		}, [])

		const handleKeyUp = useCallback((e: KeyboardEvent) => {
			const key = e.key.toLowerCase()
			setKeys(prev => {
				if (
					(key === 'q' && prev.forward) ||
					(key === 'e' && prev.backward) ||
					(key === 'a' && prev.left) ||
					(key === 'd' && prev.right) ||
					(key === 'w' && prev.pitchUp) ||
					(key === 's' && prev.pitchDown)
				) {
					const newKeys = { ...prev }
					
					switch (key) {
						case 'q': newKeys.forward = false; break
						case 'e': newKeys.backward = false; break
						case 'a': newKeys.left = false; break
						case 'd': newKeys.right = false; break
						case 'w': newKeys.pitchUp = false; break
						case 's': newKeys.pitchDown = false; break
					}
					
					return newKeys
				}
				return prev
			})
		}, [])

		useEffect(() => {
			window.addEventListener('keydown', handleKeyDown)
			window.addEventListener('keyup', handleKeyUp)

			return () => {
				window.removeEventListener('keydown', handleKeyDown)
				window.removeEventListener('keyup', handleKeyUp)
			}
		}, [handleKeyDown, handleKeyUp])


		const velocity = useRef(new Vector3(0, 0, 0))
		const rotationVelocity = useRef(0)
		const pitchVelocity = useRef(0)
		
		const directionVector = useMemo(() => new Vector3(), [])

		const [thrustersActive, setThrustersActive] = useState({
			forward: false,
			backward: false,
		})

		useFrame((_, delta) => {
			if (!shipRef.current) return

			const cappedDelta = Math.min(delta, 0.05)

			// Base movement parameters
			let acceleration = 10 * cappedDelta
			let maxSpeed = 1000
			const rotAcceleration = 0.5 * cappedDelta
			const maxRotSpeed = 5

			// Apply turbo/brake effects
			if (keys.turbo && !keys.brake) {
				// Turbo increases acceleration and max speed
				acceleration *= 2.0
				maxSpeed *= 1.5
			} else if (keys.brake && !keys.turbo) {
				// Brake decreases acceleration and max speed - inverse of turbo
				acceleration *= 0.5
				maxSpeed *= 0.66
			}

			setThrustersActive({
				forward: keys.forward,
				backward: keys.backward,
			})

			if (keys.forward) {
				directionVector.set(0, 0, -1).applyQuaternion(
					shipRef.current.quaternion
				)
				velocity.current.addScaledVector(directionVector, acceleration)
			}
			if (keys.backward) {
				directionVector.set(0, 0, 1).applyQuaternion(
					shipRef.current.quaternion
				)
				velocity.current.addScaledVector(directionVector, acceleration)
			}

			if (keys.left) {
				rotationVelocity.current += rotAcceleration
			}
			if (keys.right) {
				rotationVelocity.current -= rotAcceleration
			}

			if (keys.pitchUp) {
				pitchVelocity.current += rotAcceleration
			}
			if (keys.pitchDown) {
				pitchVelocity.current -= rotAcceleration
			}

			if (velocity.current.length() > maxSpeed) {
				velocity.current.normalize().multiplyScalar(maxSpeed)
			}

			rotationVelocity.current = Math.max(
				-maxRotSpeed,
				Math.min(maxRotSpeed, rotationVelocity.current)
			)
			pitchVelocity.current = Math.max(
				-maxRotSpeed,
				Math.min(maxRotSpeed, pitchVelocity.current)
			)

			directionVector.copy(velocity.current).multiplyScalar(cappedDelta)
			shipRef.current.position.add(directionVector)

			if (Math.abs(rotationVelocity.current) > 0.001) {
				shipRef.current.rotateY(rotationVelocity.current * cappedDelta)
			}

			if (Math.abs(pitchVelocity.current) > 0.001) {
				shipRef.current.rotateX(pitchVelocity.current * cappedDelta)
			}
		})


		useEffect(() => {
			if (ref && typeof ref === 'object' && shipRef.current) {
				ref.current = shipRef.current
			}

			// Register ship controls interface globally
			const shipControlsWindow = window as Window & typeof globalThis & {
				shipControls?: ShipControlsInterface
			}

			if (shipControlsWindow.shipControls) {
				// Override the setTurbo and setBrake methods to update our local state
				const originalSetTurbo = shipControlsWindow.shipControls.setTurbo
				shipControlsWindow.shipControls.setTurbo = (active: boolean) => {
					// Call the original implementation
					originalSetTurbo(active)

					// Update our local state
					setKeys(prev => ({ ...prev, turbo: active }))
				}

				const originalSetBrake = shipControlsWindow.shipControls.setBrake
				shipControlsWindow.shipControls.setBrake = (active: boolean) => {
					// Call the original implementation
					originalSetBrake(active)

					// Update our local state
					setKeys(prev => ({ ...prev, brake: active }))
				}
			}
		}, [ref])

		const shipGeometries = useMemo(() => ({
			body: new CylinderGeometry(1, 1, 5, 16),
			noseCone: new ConeGeometry(1, 2, 16),
			engine: new ConeGeometry(1.5, 1.5, 16),
			thrusterFlame: new ConeGeometry(0.5, 2, 16),
			thrusterGlow: new SphereGeometry(0.2, 8, 8),
			frontThruster: new SphereGeometry(0.3, 16, 16)
		}), [])
		
		const shipMaterials = useMemo(() => ({
			body: new MeshStandardMaterial({ color: 'white' }),
			noseCone: new MeshStandardMaterial({ color: 'red' }),
			engine: new MeshStandardMaterial({ color: '#333333' }),
			orangeFlame: new MeshBasicMaterial({ color: 'orange' }),
			blueFlame: new MeshBasicMaterial({ color: '#00a8ff' }),
			cyanThruster: new MeshStandardMaterial({ 
				color: 'cyan', 
				emissive: 'cyan', 
				emissiveIntensity: 2 
			})
		}), [])

		return (
			<group ref={shipRef} name='shipRef'>
				<group>
					<mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]} geometry={shipGeometries.body} material={shipMaterials.body} />

					<mesh position={[0, 0, -3]} rotation={[-Math.PI / 2, 0, 0]} geometry={shipGeometries.noseCone} material={shipMaterials.noseCone} />

					<mesh position={[0, 0, 2.5]} rotation={[-Math.PI / 2, 0, 0]} geometry={shipGeometries.engine} material={shipMaterials.engine} />

					{thrustersActive.backward && (
						<group>
							<mesh 
								position={[0, 0, -2.5]} 
								rotation={[Math.PI / 2, 0, 0]}
								geometry={shipGeometries.thrusterFlame}
								material={shipMaterials.blueFlame}
							/>
							<pointLight
								position={[0, 0, -3]}
								intensity={1.2}
								distance={4}
								color='#00a8ff'
							/>
						</group>
					)}


					{thrustersActive.forward && (
						<mesh 
							position={[0, 0, 3.5]} 
							rotation={[Math.PI / 2, 0, 0]}
							geometry={shipGeometries.thrusterFlame}
							material={shipMaterials.orangeFlame}
						/>
					)}

					{thrustersActive.forward && (
						<pointLight
							position={[0, 0, 4]}
							intensity={1.5}
							distance={5}
							color='orange'
						/>
					)}

					{keys.left && (
						<group position={[1.0, 0, -2.5]}>
							<mesh 
								rotation={[0, Math.PI / 2, 0]}
								geometry={shipGeometries.thrusterGlow}
								material={shipMaterials.orangeFlame}
							/>
							<pointLight
								position={[0.5, 0, 0]}
								intensity={1}
								distance={3}
								color='orange'
							/>
						</group>
					)}

					{keys.right && (
						<group position={[-1.0, 0, -2.5]}>
							<mesh 
								rotation={[0, -Math.PI / 2, 0]}
								geometry={shipGeometries.thrusterGlow}
								material={shipMaterials.orangeFlame}
							/>
							<pointLight
								position={[-0.5, 0, 0]}
								intensity={1}
								distance={3}
								color='orange'
							/>
						</group>
					)}

					{keys.pitchUp && (
						<group position={[0, -1.0, -2.5]}>
							<mesh 
								rotation={[Math.PI / 2, 0, 0]}
								geometry={shipGeometries.thrusterGlow}
								material={shipMaterials.orangeFlame}
							/>
							<pointLight
								position={[0, -0.5, 0]}
								intensity={1}
								distance={3}
								color='orange'
							/>
						</group>
					)}

					{keys.pitchDown && (
						<group position={[0, 1.0, -2.5]}>
							<mesh 
								rotation={[-Math.PI / 2, 0, 0]}
								geometry={shipGeometries.thrusterGlow}
								material={shipMaterials.orangeFlame}
							/>
							<pointLight
								position={[0, 0.5, 0]}
								intensity={1}
								distance={3}
								color='orange'
							/>
						</group>
					)}

					{keys.backward && (
						<group position={[0, 0, -2.5]}>
							<mesh 
								rotation={[Math.PI / 2, 0, 0]}
								geometry={shipGeometries.thrusterGlow}
								material={shipMaterials.orangeFlame}
							/>
							<pointLight
								position={[0, 0, -0.5]}
								intensity={1}
								distance={3}
								color='orange'
							/>
						</group>
					)}

					{keys.backward && (
						<group position={[0, 0, -4]}>
							<mesh
								geometry={shipGeometries.frontThruster}
								material={shipMaterials.cyanThruster}
							/>
							<pointLight
								position={[0, 0, -0.2]}
								intensity={3}
								distance={5}
								color='cyan'
							/>
						</group>
					)}
				</group>
			</group>
		)
	}
)

export default Spaceship
