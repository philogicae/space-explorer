'use client'

import { Suspense, useRef, useEffect, useCallback } from 'react'
import { Canvas } from '@react-three/fiber'
import type { Group } from 'three'
import type {
	ShipControlsInterface,
	CameraControlsInterface,
} from './types/controls'
import SolarSystem from './systems/SolarSystem'
import Starfield from './environment/Starfield'
import ShipStatsDisplay, { ShipStatsTracker } from './ui/ShipStatsDisplay'
import ShipCamera from './camera/ShipCamera'
import ShipWithCamera from './spacecraft/ShipWithCamera'
import {
	createJoystickPositionUpdater,
	createShipJoystickPositionUpdater,
} from './controls/JoystickUtils'
import { createTurboHandler, createBrakeHandler } from './controls/ShipControls'

interface SceneProps {
	gameStarted: boolean
	onStartGame: () => void
}

export default function Scene({ gameStarted, onStartGame }: SceneProps) {
	const spaceshipRef = useRef<Group>(null)
	const joystickKnobRef = useRef<HTMLDivElement>(null)
	const shipJoystickKnobRef = useRef<HTMLDivElement>(null)
	const turboIntervalRef = useRef<number | null>(null)
	const brakeIntervalRef = useRef<number | null>(null)

	// Use the extracted control handlers from ShipControls.ts
	const { handleTurboStart, handleTurboStop } = useCallback(
		() => createTurboHandler(turboIntervalRef),
		[]
	)()

	const { handleBrakeStart, handleBrakeStop } = useCallback(
		() => createBrakeHandler(brakeIntervalRef),
		[]
	)()

	// Use the extracted joystick position updater from JoystickUtils.ts
	const updateJoystickPosition = useCallback(
		(x: number, y: number, joystickElement: HTMLElement) => {
			createJoystickPositionUpdater(joystickKnobRef)(x, y, joystickElement)
		},
		[]
	)

	// Use the extracted ship joystick position updater from JoystickUtils.ts
	const updateShipJoystickPosition = useCallback(
		(x: number, y: number, joystickElement: HTMLElement) => {
			createShipJoystickPositionUpdater(shipJoystickKnobRef)(
				x,
				y,
				joystickElement
			)
		},
		[]
	)

	useEffect(() => {
		if (!gameStarted || !window) return

		const shipKeyStep = 15
		const keysPressed: Record<string, boolean> = {}

		const handleKeyDown = (e: KeyboardEvent) => {
			if (['w', 'a', 's', 'd', 'q', 'e'].includes(e.key.toLowerCase())) {
				keysPressed[e.key.toLowerCase()] = true
			}
		}

		const handleKeyUp = (e: KeyboardEvent) => {
			if (['w', 'a', 's', 'd', 'q', 'e'].includes(e.key.toLowerCase())) {
				keysPressed[e.key.toLowerCase()] = false
			}
		}

		// Process key states and update ship joystick visually
		const updateShipJoystickVisual = () => {
			let x = 0
			let y = 0

			if (keysPressed.d) x += shipKeyStep
			if (keysPressed.a) x -= shipKeyStep
			if (keysPressed.w) y -= shipKeyStep
			if (keysPressed.s) y += shipKeyStep

			if (keysPressed.q && window) {
				const shipControlsWindow = window as Window &
					typeof globalThis & {
						shipControls?: ShipControlsInterface
					}
				if (shipControlsWindow.shipControls) {
					shipControlsWindow.shipControls.activateTurbo()
				}
			}
			if (keysPressed.e && window) {
				const shipControlsWindow = window as Window &
					typeof globalThis & {
						shipControls?: ShipControlsInterface
					}
				if (shipControlsWindow.shipControls) {
					shipControlsWindow.shipControls.activateBrake()
				}
			}

			if (x !== 0 || y !== 0) {
				if (shipJoystickKnobRef.current?.parentElement) {
					updateShipJoystickPosition(
						x,
						y,
						shipJoystickKnobRef.current.parentElement
					)
				}
			} else if (shipJoystickKnobRef.current) {
				shipJoystickKnobRef.current.style.transform =
					'translate3d(0px, 0px, 0) rotateX(0deg) rotateY(0deg)'
			}

			requestAnimationFrame(updateShipJoystickVisual)
		}

		window.addEventListener('keydown', handleKeyDown)
		window.addEventListener('keyup', handleKeyUp)

		const animationId = requestAnimationFrame(updateShipJoystickVisual)

		return () => {
			window.removeEventListener('keydown', handleKeyDown)
			window.removeEventListener('keyup', handleKeyUp)
			cancelAnimationFrame(animationId)
		}
	}, [gameStarted, updateShipJoystickPosition])

	// Ship controls setup
	useEffect(() => {
		if (!gameStarted || !window) return

		const controls: ShipControlsInterface = {
			moveForward: (active: boolean) => {
				const event = new KeyboardEvent(active ? 'keydown' : 'keyup', {
					key: 'w',
				}) // Forward should be W
				window.dispatchEvent(event)
			},
			moveBackward: (active: boolean) => {
				const event = new KeyboardEvent(active ? 'keydown' : 'keyup', {
					key: 's',
				}) // Backward should be S
				window.dispatchEvent(event)
			},
			turnLeft: (active: boolean) => {
				const event = new KeyboardEvent(active ? 'keydown' : 'keyup', {
					key: 'a',
				})
				window.dispatchEvent(event)
			},
			turnRight: (active: boolean) => {
				const event = new KeyboardEvent(active ? 'keydown' : 'keyup', {
					key: 'd',
				})
				window.dispatchEvent(event)
			},
			pitchUp: (active: boolean) => {
				const event = new KeyboardEvent(active ? 'keydown' : 'keyup', {
					key: 'w',
				})
				window.dispatchEvent(event)
			},
			pitchDown: (active: boolean) => {
				const event = new KeyboardEvent(active ? 'keydown' : 'keyup', {
					key: 's',
				})
				window.dispatchEvent(event)
			},
			activateTurbo: () => {
				// Dispatch both keydown and keyup with bubbles and cancelable properties set to true for better event propagation
				const downEvent = new KeyboardEvent('keydown', {
					key: 'q', // Use Q for Turbo
					bubbles: true,
					cancelable: true,
				})
				window.dispatchEvent(downEvent)
				setTimeout(() => {
					const upEvent = new KeyboardEvent('keyup', {
						key: 'q', // Use Q for Turbo
						bubbles: true,
						cancelable: true,
					})
					window.dispatchEvent(upEvent)
				}, 200)
			},
			activateBrake: () => {
				// Dispatch both keydown and keyup with bubbles and cancelable properties set to true for better event propagation
				const downEvent = new KeyboardEvent('keydown', {
					key: 'e', // Use E for Brake
					bubbles: true,
					cancelable: true,
				})
				window.dispatchEvent(downEvent)
				setTimeout(() => {
					const upEvent = new KeyboardEvent('keyup', {
						key: 'e', // Use E for Brake
						bubbles: true,
						cancelable: true,
					})
					window.dispatchEvent(upEvent)
				}, 200)
			},
			updateShipJoystick: (x: number, y: number) => {
				// Map joystick x,y to WASD controls
				const threshold = 0.1

				controls.pitchUp(y < -threshold)
				controls.pitchDown(y > threshold)
				controls.turnLeft(x < -threshold)
				controls.turnRight(x > threshold)
			},
		}
		;(
			window as Window &
				typeof globalThis & {
					shipControls?: ShipControlsInterface
				}
		).shipControls = controls

		return () => {
			;(
				window as Window &
					typeof globalThis & {
						shipControls?: ShipControlsInterface
					}
			).shipControls = undefined
		}
	}, [gameStarted])

	useEffect(() => {
		if (!gameStarted || !window) return

		const arrowKeyStep = 15
		const keysPressed: Record<string, boolean> = {}

		const handleKeyDown = (e: KeyboardEvent) => {
			if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
				keysPressed[e.key] = true
				e.preventDefault()
			}
		}

		const handleKeyUp = (e: KeyboardEvent) => {
			if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
				keysPressed[e.key] = false
				e.preventDefault()
			}
		}

		const updateCamera = () => {
			let x = 0
			let y = 0

			if (keysPressed.ArrowRight) x += arrowKeyStep
			if (keysPressed.ArrowLeft) x -= arrowKeyStep
			if (keysPressed.ArrowUp) y -= arrowKeyStep
			if (keysPressed.ArrowDown) y += arrowKeyStep

			if (x !== 0 || y !== 0) {
				// Get the joystick container element to use with our helper function
				if (joystickKnobRef.current?.parentElement) {
					updateJoystickPosition(x, y, joystickKnobRef.current.parentElement)
				}
			} else if (joystickKnobRef.current) {
				joystickKnobRef.current.style.transform =
					'translate3d(0px, 0px, 0) rotateX(0deg) rotateY(0deg)'
			}

			requestAnimationFrame(updateCamera)
		}

		window.addEventListener('keydown', handleKeyDown)
		window.addEventListener('keyup', handleKeyUp)

		const animationId = requestAnimationFrame(updateCamera)

		return () => {
			window.removeEventListener('keydown', handleKeyDown)
			window.removeEventListener('keyup', handleKeyUp)
			cancelAnimationFrame(animationId)
		}
	}, [gameStarted, updateJoystickPosition])

	// Conditional rendering based on game state
	if (!gameStarted) {
		return (
			<div
				className='relative w-full h-full'
				style={{ backgroundColor: '#000000' }}
			>
				<Canvas
					camera={{ position: [0, 300, 300], fov: 45, far: 1000000 }}
					gl={{
						antialias: true,
						alpha: true,
						powerPreference: 'high-performance',
					}}
					dpr={
						typeof window !== 'undefined'
							? window.devicePixelRatio > 1
								? 1.5
								: 1
							: 1
					}
					style={{ backgroundColor: '#000' }}
					performance={{ min: 0.5 }}
				>
					<color attach='background' args={['#000000']} />
					<Suspense fallback={null}>
						<Starfield />
					</Suspense>
				</Canvas>
				<button
					type='button'
					className='absolute top-1/2 left-1/2 px-4 py-2 font-bold text-white bg-blue-600 rounded transform -translate-x-1/2 -translate-y-1/2 hover:bg-blue-700'
					onClick={onStartGame}
				>
					Start Exploring
				</button>
			</div>
		)
	}

	return (
		<div
			className='relative w-full h-full select-none'
			style={{ backgroundColor: '#000000' }}
		>
			<ShipStatsDisplay />

			{/* Ship Control UI */}
			{gameStarted && (
				<div className='flex absolute bottom-6 left-6 z-10 flex-col gap-4 items-center'>
					{/* Turbo and Brake Buttons */}
					<div className='flex gap-3'>
						<button
							type='button'
							className='flex justify-center items-center w-14 h-14 font-bold text-white rounded-md shadow-lg transition-all text-md bg-green-600/90 hover:bg-green-500/90'
							onMouseDown={handleTurboStart}
							onMouseUp={handleTurboStop}
							onMouseLeave={handleTurboStop}
							onClick={() => {
								// Keep the onClick for compatibility
								// No-op since we're handling with mouse events
							}}
							onTouchStart={handleTurboStart}
							onTouchEnd={handleTurboStop}
						>
							Turbo (Q)
						</button>
						<button
							type='button'
							className='flex justify-center items-center w-14 h-14 font-bold text-white rounded-md shadow-lg transition-all text-md bg-red-600/90 hover:bg-red-500/90'
							onMouseDown={handleBrakeStart}
							onMouseUp={handleBrakeStop}
							onMouseLeave={handleBrakeStop}
							onClick={() => {
								// Keep the onClick for compatibility
								// No-op since we're handling with mouse events
							}}
							onTouchStart={handleBrakeStart}
							onTouchEnd={handleBrakeStop}
						>
							Brake (E)
						</button>
					</div>

					{/* Ship Joystick Control */}
					<div
						className='relative w-36 h-36 rounded-full border shadow-lg bg-gray-800/80 border-gray-700/50'
						onMouseDown={(e) => {
							e.preventDefault()
							e.stopPropagation()

							const joystickElement = e.currentTarget
							const rect = joystickElement.getBoundingClientRect()
							const centerX = rect.width / 2
							const centerY = rect.height / 2

							const rawX = e.clientX - rect.left - centerX
							const rawY = e.clientY - rect.top - centerY

							if (shipJoystickKnobRef.current) {
								shipJoystickKnobRef.current.style.transition = 'none'
							}

							updateShipJoystickPosition(rawX, rawY, joystickElement)

							// Handle mouse movement while button is held down
							const handleMouseMove = (moveEvent: MouseEvent) => {
								moveEvent.preventDefault()
								moveEvent.stopPropagation()

								// Get current position relative to the joystick center
								// We use the original rect because the joystick element hasn't moved
								const x = moveEvent.clientX - rect.left - centerX
								const y = moveEvent.clientY - rect.top - centerY

								// Make sure there's no transition for direct control
								if (shipJoystickKnobRef.current) {
									shipJoystickKnobRef.current.style.transition = 'none'
								}

								// Update joystick visual position and ship controls
								updateShipJoystickPosition(x, y, joystickElement)
							}

							const handleMouseUp = () => {
								if (shipJoystickKnobRef.current) {
									shipJoystickKnobRef.current.style.transition =
										'transform 0.2s ease-out'
									shipJoystickKnobRef.current.style.transform =
										'translate3d(0px, 0px, 0) rotateX(0deg) rotateY(0deg)'

									setTimeout(() => {
										if (shipJoystickKnobRef.current) {
											shipJoystickKnobRef.current.style.transition = ''
										}
									}, 200)
								}

								const shipControls = (
									window as Window &
										typeof globalThis & { shipControls?: ShipControlsInterface }
								).shipControls
								if (shipControls) {
									shipControls.pitchUp(false)
									shipControls.pitchDown(false)
									shipControls.turnLeft(false)
									shipControls.turnRight(false)

									shipControls.updateShipJoystick(0, 0)
								}

								document.removeEventListener('mousemove', handleMouseMove)
								document.removeEventListener('mouseup', handleMouseUp)
							}
							document.addEventListener('mousemove', handleMouseMove)
							document.addEventListener('mouseup', handleMouseUp)
						}}
						onTouchStart={(e) => {
							const joystickElement = e.currentTarget
							const rect = joystickElement.getBoundingClientRect()
							const centerX = rect.width / 2
							const centerY = rect.height / 2

							if (e.touches.length > 0) {
								const touch = e.touches[0]
								const x = touch.clientX - rect.left - centerX
								const y = touch.clientY - rect.top - centerY

								updateShipJoystickPosition(x, y, joystickElement)
							}

							const handleTouchMove = (moveEvent: TouchEvent) => {
								moveEvent.preventDefault()

								if (moveEvent.touches.length === 0) return

								const touch = moveEvent.touches[0]
								const x = touch.clientX - rect.left - centerX
								const y = touch.clientY - rect.top - centerY

								updateShipJoystickPosition(x, y, joystickElement)
							}

							const handleTouchEnd = () => {
								if (shipJoystickKnobRef.current) {
									shipJoystickKnobRef.current.style.transform =
										'translate3d(0px, 0px, 0) rotateX(0deg) rotateY(0deg)'
								}

								const shipControls = (
									window as Window &
										typeof globalThis & { shipControls?: ShipControlsInterface }
								).shipControls
								if (shipControls) {
									shipControls.pitchUp(false)
									shipControls.pitchDown(false)
									shipControls.turnLeft(false)
									shipControls.turnRight(false)

									shipControls.updateShipJoystick(0, 0)
								}

								document.removeEventListener('touchmove', handleTouchMove)
								document.removeEventListener('touchend', handleTouchEnd)
							}

							// Add event listeners
							document.addEventListener('touchmove', handleTouchMove, {
								passive: false,
							})
							document.addEventListener('touchend', handleTouchEnd)
						}}
					>
						{/* WASD Labels */}
						<div className='absolute top-2 left-1/2 font-bold text-white transform -translate-x-1/2'>
							W
						</div>
						<div className='absolute bottom-2 left-1/2 font-bold text-white transform -translate-x-1/2'>
							S
						</div>
						<div className='absolute left-2 top-1/2 font-bold text-white transform -translate-y-1/2'>
							A
						</div>
						<div className='absolute right-2 top-1/2 font-bold text-white transform -translate-y-1/2'>
							D
						</div>

						{/* Joystick Crosshair */}
						<div className='flex absolute inset-0 justify-center items-center pointer-events-none'>
							<div className='w-1/2 h-1/2 rounded-full border-2 border-gray-600/50' />
							<div className='absolute w-full h-px bg-gray-600/30' />
							<div className='absolute w-px h-full bg-gray-600/30' />
						</div>

						{/* Joystick Knob */}
						<div
							ref={shipJoystickKnobRef}
							className='absolute top-1/2 left-1/2 -mt-7 -ml-7 w-14 h-14 bg-red-500 rounded-full shadow-lg transition-all duration-75 ease-out joystick-knob'
							style={{ transformStyle: 'preserve-3d' }}
						>
							<div className='absolute inset-0 bg-gradient-to-br from-red-400 to-red-600 rounded-full opacity-90' />
							<div className='absolute inset-2 rounded-full border border-red-300/30' />
						</div>
					</div>
				</div>
			)}

			{/* Camera Control UI */}
			{gameStarted && (
				<div className='flex absolute right-6 bottom-6 z-10 flex-col gap-4 items-center'>
					{/* Zoom Controls */}
					<div className='flex gap-3'>
						<button
							type='button'
							className='flex justify-center items-center w-14 h-14 text-2xl font-bold text-white rounded-md shadow-lg transition-all bg-blue-600/90 hover:bg-blue-500/90'
							onClick={() =>
								(
									window as Window &
										typeof globalThis & {
											cameraControls?: CameraControlsInterface
										}
								).cameraControls?.zoomIn()
							}
						>
							+
						</button>
						<button
							type='button'
							className='flex justify-center items-center w-14 h-14 text-2xl font-bold text-white rounded-md shadow-lg transition-all bg-blue-600/90 hover:bg-blue-500/90'
							onClick={() =>
								(
									window as Window &
										typeof globalThis & {
											cameraControls?: CameraControlsInterface
										}
								).cameraControls?.zoomOut()
							}
						>
							-
						</button>
					</div>

					{/* Joystick Control */}
					<div
						className='relative w-36 h-36 rounded-full border shadow-lg bg-gray-800/80 border-gray-700/50'
						onMouseDown={(e) => {
							const joystickElement = e.currentTarget
							const rect = joystickElement.getBoundingClientRect()
							const centerX = rect.width / 2
							const centerY = rect.height / 2

							const rawX = e.clientX - rect.left - centerX
							const rawY = e.clientY - rect.top - centerY

							const x = rawX
							const y = rawY

							updateJoystickPosition(x, y, joystickElement)

							// Handle mouse movement while button is held down
							const handleMouseMove = (moveEvent: MouseEvent) => {
								const x = moveEvent.clientX - rect.left - centerX
								const y = moveEvent.clientY - rect.top - centerY

								updateJoystickPosition(x, y, joystickElement)
							}

							const handleMouseUp = () => {
								if (joystickKnobRef.current) {
									joystickKnobRef.current.style.transform =
										'translate3d(0px, 0px, 0) rotateX(0deg) rotateY(0deg)'
								}

								document.removeEventListener('mousemove', handleMouseMove)
								document.removeEventListener('mouseup', handleMouseUp)
							}
							document.addEventListener('mousemove', handleMouseMove)
							document.addEventListener('mouseup', handleMouseUp)
						}}
						onTouchStart={(e) => {
							const joystickElement = e.currentTarget
							const rect = joystickElement.getBoundingClientRect()
							const centerX = rect.width / 2
							const centerY = rect.height / 2

							if (e.touches.length > 0) {
								const touch = e.touches[0]
								const x = touch.clientX - rect.left - centerX
								const y = touch.clientY - rect.top - centerY

								updateJoystickPosition(x, y, joystickElement)
							}

							const handleTouchMove = (moveEvent: TouchEvent) => {
								moveEvent.preventDefault()

								if (moveEvent.touches.length === 0) return

								const touch = moveEvent.touches[0]
								const x = touch.clientX - rect.left - centerX
								const y = touch.clientY - rect.top - centerY

								updateJoystickPosition(x, y, joystickElement)
							}

							const handleTouchEnd = () => {
								if (joystickKnobRef.current) {
									joystickKnobRef.current.style.transform =
										'translate3d(0px, 0px, 0) rotateX(0deg) rotateY(0deg)'
								}

								document.removeEventListener('touchmove', handleTouchMove)
								document.removeEventListener('touchend', handleTouchEnd)
							}

							// Add event listeners
							document.addEventListener('touchmove', handleTouchMove, {
								passive: false,
							})
							document.addEventListener('touchend', handleTouchEnd)
						}}
					>
						{/* Arrow Labels */}
						<div className='absolute top-2 left-1/2 font-bold text-white transform -translate-x-1/2'>
							↑
						</div>
						<div className='absolute bottom-2 left-1/2 font-bold text-white transform -translate-x-1/2'>
							↓
						</div>
						<div className='absolute left-2 top-1/2 font-bold text-white transform -translate-y-1/2'>
							←
						</div>
						<div className='absolute right-2 top-1/2 font-bold text-white transform -translate-y-1/2'>
							→
						</div>

						{/* Joystick Crosshair */}
						<div className='flex absolute inset-0 justify-center items-center pointer-events-none'>
							<div className='w-1/2 h-1/2 rounded-full border-2 border-gray-600/50' />
							<div className='absolute w-full h-px bg-gray-600/30' />
							<div className='absolute w-px h-full bg-gray-600/30' />
						</div>

						{/* Joystick Knob */}
						<div
							ref={joystickKnobRef}
							className='absolute top-1/2 left-1/2 -mt-7 -ml-7 w-14 h-14 bg-blue-500 rounded-full shadow-lg transition-all duration-75 ease-out joystick-knob'
							style={{ transformStyle: 'preserve-3d' }}
						>
							<div className='absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full opacity-90' />
							<div className='absolute inset-2 rounded-full border border-blue-300/30' />
						</div>
					</div>
				</div>
			)}

			<Canvas
				camera={{
					position: [250, 150, 350],
					fov: 40,
					far: 100000,
					near: 0.1,
				}}
				gl={{
					antialias: true,
					alpha: true,
					powerPreference: 'high-performance',
					stencil: false,
				}}
				dpr={window.devicePixelRatio > 1 ? 1.5 : 1}
				style={{ backgroundColor: '#000' }}
				performance={{ min: 0.5 }}
			>
				<color attach='background' args={['#000000']} />
				<Suspense fallback={null}>
					<Starfield />
					<ambientLight intensity={0.4} />
					<directionalLight
						position={[0, 200, 200]}
						intensity={1.6}
						castShadow={false}
					/>
					<pointLight
						position={[0, 0, 0]}
						intensity={8}
						distance={2000}
						decay={0.1}
					/>
					<SolarSystem />
					<ShipWithCamera shipRef={spaceshipRef} />

					{gameStarted && <ShipCamera target={spaceshipRef} />}

					{gameStarted && <ShipStatsTracker shipRef={spaceshipRef} />}
				</Suspense>
			</Canvas>
		</div>
	)
}
