'use client'

import { Suspense, useState, useRef, useEffect, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { PerspectiveCamera } from '@react-three/drei'
import { Vector3 } from 'three'
import type { Group } from 'three'
import SolarSystem from './systems/SolarSystem'
import Starfield from './environment/Starfield'
import Spaceship from './spacecraft/Spaceship'
import ShipStatsDisplay, { ShipStatsTracker } from './ui/ShipStatsDisplay'

interface SceneProps {
	gameStarted: boolean
	onStartGame: () => void
}


function ShipCamera({ target }: { target: React.RefObject<Group> }) {
	const { camera } = useThree()
	const cameraRigRef = useRef<Group>(null)


	const [distance, setDistance] = useState(100) // Distance from ship (closer initial view)
	const [rotation, setRotation] = useState({ x: 0, y: 0 }) // Orbit angles
	const mouseDown = useRef(false)
	const lastMousePos = useRef({ x: 0, y: 0 })
	

	const cameraPosition = useMemo(() => new Vector3(), [])


	useEffect(() => {
		let lastWheelTimestamp = 0
		
		const handleWheel = (e: WheelEvent) => {
			const now = performance.now()

			if (now - lastWheelTimestamp < 16) return
			lastWheelTimestamp = now
			

			setDistance(Math.max(30, Math.min(5000, distance + e.deltaY * 0.5)))
		}

		window.addEventListener('wheel', handleWheel, { passive: true })
		return () => window.removeEventListener('wheel', handleWheel)
	}, [distance])


	useEffect(() => {
		const handleMouseDown = (e: MouseEvent) => {
			mouseDown.current = true
			lastMousePos.current = { x: e.clientX, y: e.clientY }
		}

		const handleMouseUp = () => {
			mouseDown.current = false
		}

		let lastMoveTimestamp = 0
		const handleMouseMove = (e: MouseEvent) => {
			if (!mouseDown.current) return
			
			const now = performance.now()

			if (now - lastMoveTimestamp < 16) return
			lastMoveTimestamp = now


			const deltaX = e.clientX - lastMousePos.current.x
			const deltaY = e.clientY - lastMousePos.current.y


			setRotation({

				x: Math.max(-1.48, Math.min(1.48, rotation.x - deltaY * 0.005)),
				y: rotation.y - deltaX * 0.005,
			})

			lastMousePos.current = { x: e.clientX, y: e.clientY }
		}

		window.addEventListener('mousedown', handleMouseDown)
		window.addEventListener('mouseup', handleMouseUp)
		window.addEventListener('mousemove', handleMouseMove)

		const handleTouchStart = (e: TouchEvent) => {
			if (e.touches.length === 1) {
				mouseDown.current = true
				lastMousePos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
			}
		}
		
		const handleTouchEnd = () => {
			mouseDown.current = false
		}
		
		const handleTouchMove = (e: TouchEvent) => {
			if (!mouseDown.current || e.touches.length !== 1) return
			const now = performance.now()
			if (now - lastMoveTimestamp < 16) return
			lastMoveTimestamp = now
			
			const deltaX = e.touches[0].clientX - lastMousePos.current.x
			const deltaY = e.touches[0].clientY - lastMousePos.current.y
			
			setRotation({
				x: Math.max(-1.48, Math.min(1.48, rotation.x - deltaY * 0.005)),
				y: rotation.y - deltaX * 0.005,
			})
			
			lastMousePos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
			e.preventDefault()
		}
		
		window.addEventListener('touchstart', handleTouchStart)
		window.addEventListener('touchend', handleTouchEnd)
		window.addEventListener('touchmove', handleTouchMove, { passive: false })

		return () => {
			window.removeEventListener('mousedown', handleMouseDown)
			window.removeEventListener('mouseup', handleMouseUp)
			window.removeEventListener('mousemove', handleMouseMove)
			window.removeEventListener('touchstart', handleTouchStart)
			window.removeEventListener('touchend', handleTouchEnd)
			window.removeEventListener('touchmove', handleTouchMove)
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
				position={[0, 0, 0]}
				fov={40}
				near={0.1}
				far={100000}
			/>
		</group>
	)
}


function ShipWithCamera({ shipRef }: { shipRef: React.RefObject<Group> }) {
	return <Spaceship initialPosition={[250, 50, 150]} ref={shipRef} />
}

export default function Scene({ gameStarted, onStartGame }: SceneProps) {

	const [showControls, setShowControls] = useState(true)


	const spaceshipRef = useRef<Group>(null)




	useEffect(() => {
		if (gameStarted) {
			const timer = setTimeout(() => {
				setShowControls(false)
			}, 10000)
			return () => clearTimeout(timer)
		}
	}, [gameStarted])

	if (!gameStarted) {
		return (
			<div
				className='relative w-full h-full'
				style={{ backgroundColor: '#000000' }}
			>
				<Canvas
					camera={{ position: [0, 300, 300], fov: 45, far: 1000000 }}
					gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
					dpr={typeof window !== 'undefined' ? (window.devicePixelRatio > 1 ? 1.5 : 1) : 1}
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
			className='relative w-full h-full'
			style={{ backgroundColor: '#000000' }}
		>

			{gameStarted && <ShipStatsDisplay />}

			{showControls && (
				<div className='absolute top-5 left-5 z-10 p-3 text-sm text-white rounded bg-black/70'>
					<h3 className='mb-2 font-bold'>Spaceship Controls</h3>
					<ul>
						<li>
							<span className='px-2 py-1 bg-gray-700 rounded'>W</span> - Move
							forward
						</li>
						<li>
							<span className='px-2 py-1 bg-gray-700 rounded'>S</span> - Move
							backward
						</li>
						<li>
							<span className='px-2 py-1 bg-gray-700 rounded'>A</span> - Rotate
							left
						</li>
						<li>
							<span className='px-2 py-1 bg-gray-700 rounded'>D</span> - Rotate
							right
						</li>
						<li>
							<span className='px-2 py-1 bg-gray-700 rounded'>Q</span> - Pitch
							up
						</li>
						<li>
							<span className='px-2 py-1 bg-gray-700 rounded'>E</span> - Pitch
							down
						</li>
					</ul>
				</div>
			)}
			<Canvas
				camera={{
					position: [250, 150, 350],
					fov: 40,
					far: 100000,
					near: 0.1
				}}
				gl={{ 
					antialias: true, 
					alpha: true,
					powerPreference: 'high-performance',
					stencil: false
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
