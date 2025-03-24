'use client'

import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import { PerspectiveCamera } from 'three'
import Sun from '../celestial/Sun'
import Planet from '../celestial/Planet'
import OrbitLine from '../celestial/OrbitLine'
import AsteroidBelt from '../celestial/AsteroidBelt'

// 1 AU = 1000 units
const AU = 1000

// Earth completes one orbit in 1 minute (60 seconds)
const EARTH_ORBITAL_PERIOD = 60


const SolarSystem = () => {

	const { camera } = useThree()


	useEffect(() => {
		camera.far = 1000000
		camera.near = 1

		if (camera instanceof PerspectiveCamera) {
			camera.fov = 40
		}
		camera.updateProjectionMatrix()
	}, [camera])
	return (
		<>

			<Sun />


			<AsteroidBelt 
				innerRadius={AU * 2.2}
				outerRadius={AU * 3.2}
				count={8000}
				color="#E8D5B7"
				size={8}
			/>


			<OrbitLine
				radius={AU * 0.39}
				color='#d0cdc8'
				opacity={0.2}
				lineWidth={0.3}
				inclination={7.0}
			/>{' '}
			<OrbitLine
				radius={AU * 0.72}
				color='#e6c99c'
				opacity={0.2}
				lineWidth={0.3}
				inclination={3.4}
			/>{' '}
			<OrbitLine
				radius={AU * 1.0}
				color='#6b8cc7'
				opacity={0.2}
				lineWidth={0.3}
				inclination={0.0}
			/>{' '}
			<OrbitLine
				radius={AU * 1.52}
				color='#da6e4b'
				opacity={0.2}
				lineWidth={0.3}
				inclination={1.8}
			/>{' '}
			<OrbitLine
				radius={AU * 5.2}
				color='#e5c28f'
				opacity={0.2}
				lineWidth={0.4}
				inclination={1.3}
			/>{' '}
			<OrbitLine
				radius={AU * 9.58}
				color='#f5db6f'
				opacity={0.2}
				lineWidth={0.4}
				inclination={2.5}
			/>{' '}
			<OrbitLine
				radius={AU * 19.22}
				color='#7dcad9'
				opacity={0.2}
				lineWidth={0.3}
				inclination={0.8}
			/>{' '}
			<OrbitLine
				radius={AU * 30.05}
				color='#5aa1df'
				opacity={0.2}
				lineWidth={0.3}
				inclination={1.8}
			/>{' '}
			<OrbitLine
				radius={AU * 39.5}
				color='#dbd8cc'
				opacity={0.2}
				lineWidth={0.3}
				inclination={17.0}
			/>{' '}

			<Planet
				name='Mercury'
				orbitalRadius={AU * 0.39}
				orbitalSpeed={4.15 / EARTH_ORBITAL_PERIOD}
				size={0.3}
				color='#a39f93'
				orbitalInclination={7.0}
			/>

			<Planet
				name='Venus'
				orbitalRadius={AU * 0.72}
				orbitalSpeed={1.62 / EARTH_ORBITAL_PERIOD}
				size={0.6}
				color='#e6b87c'
				orbitalOffset={Math.PI * 0.5}
				orbitalInclination={3.4}
			/>

			<Planet
				name='Earth'
				orbitalRadius={AU * 1.0}
				orbitalSpeed={1.0 / EARTH_ORBITAL_PERIOD}
				size={0.65}
				color='#4b6cb7'
				orbitalOffset={Math.PI * 1.2}
				orbitalInclination={0.0}
				moons={[
					{
						orbitalRadius: 10.0,
						orbitalSpeed: 12 / EARTH_ORBITAL_PERIOD,
						size: 0.15,
						color: '#c9c9c9',
						orbitalInclination: 5.14
					},
				]}
			/>

			<Planet
				name='Mars'
				orbitalRadius={AU * 1.52}
				orbitalSpeed={0.53 / EARTH_ORBITAL_PERIOD}
				size={0.45}
				color='#c1440e'
				orbitalOffset={Math.PI * 0.8}
				orbitalInclination={1.8}
				moons={[
					{
						orbitalRadius: 7.0,
						orbitalSpeed: 8 / EARTH_ORBITAL_PERIOD,
						size: 0.1,
						color: '#a8a8a8',
						orbitalOffset: 0,
						orbitalInclination: 1.1
					},
					{
						orbitalRadius: 10.0,
						orbitalSpeed: 6 / EARTH_ORBITAL_PERIOD,
						size: 0.08,
						color: '#a8a8a8',
						orbitalOffset: Math.PI,
						orbitalInclination: 1.8
					},
				]}
			/>

			<Planet
				name='Jupiter'
				orbitalRadius={AU * 5.2}
				orbitalSpeed={0.084 / EARTH_ORBITAL_PERIOD}
				size={2.5}
				color='#e0ae6f'
				orbitalOffset={Math.PI * 1.7}
				orbitalInclination={1.3}
				moons={[
					{
						orbitalRadius: 30.0,
						orbitalSpeed: 5 / EARTH_ORBITAL_PERIOD,
						size: 0.25,
						color: '#c9c9c9',
						orbitalOffset: 0,
						orbitalInclination: 0.4
					},
					{
						orbitalRadius: 38.0,
						orbitalSpeed: 4 / EARTH_ORBITAL_PERIOD,
						size: 0.3,
						color: '#a8a8a8',
						orbitalOffset: Math.PI * 0.5,
						orbitalInclination: 0.5
					},
					{
						orbitalRadius: 45.0,
						orbitalSpeed: 3 / EARTH_ORBITAL_PERIOD,
						size: 0.22,
						color: '#d0d0d0',
						orbitalOffset: Math.PI,
						orbitalInclination: 0.2
					},
					{
						orbitalRadius: 52.0,
						orbitalSpeed: 2 / EARTH_ORBITAL_PERIOD,
						size: 0.28,
						color: '#b0b0b0',
						orbitalOffset: Math.PI * 1.5,
						orbitalInclination: 0.3
					},
				]}
			/>

			<Planet
				name='Saturn'
				orbitalRadius={AU * 9.58}
				orbitalSpeed={0.034 / EARTH_ORBITAL_PERIOD}
				size={2.2}
				color='#f4d03f'
				orbitalOffset={Math.PI * 0.3}
				orbitalInclination={2.5}
				hasRings={true}
				moons={[
					{
						orbitalRadius: 30.0,
						orbitalSpeed: 3 / EARTH_ORBITAL_PERIOD,
						size: 0.25,
						color: '#c9c9c9',
						orbitalOffset: 0,
						orbitalInclination: 14.7
					},
					{
						orbitalRadius: 40.0,
						orbitalSpeed: 2 / EARTH_ORBITAL_PERIOD,
						size: 0.2,
						color: '#a8a8a8',
						orbitalOffset: Math.PI * 0.7,
						orbitalInclination: 27.0
					},
				]}
			/>

			<Planet
				name='Uranus'
				orbitalRadius={AU * 19.22}
				orbitalSpeed={0.012 / EARTH_ORBITAL_PERIOD}
				size={1.5}
				color='#5d8d94'
				orbitalOffset={Math.PI * 1.1}
				orbitalInclination={0.8}
				hasRings={true}
				moons={[
					{
						orbitalRadius: 22.0,
						orbitalSpeed: 2 / EARTH_ORBITAL_PERIOD,
						size: 0.18,
						color: '#c9c9c9',
						orbitalOffset: Math.PI * 0.3,
						orbitalInclination: 0.3,
					},
				]}
			/>
			
			<Planet
				name='Neptune'
				orbitalRadius={AU * 30.05}
				orbitalSpeed={0.006 / EARTH_ORBITAL_PERIOD}
				size={1.4}
				color='#3498db'
				orbitalOffset={Math.PI * 0.6}
				orbitalInclination={1.8}
				moons={[
					{
						orbitalRadius: 20.0,
						orbitalSpeed: 1.8 / EARTH_ORBITAL_PERIOD,
						size: 0.2,
						color: '#c9c9c9',
						orbitalOffset: 0,
						orbitalInclination: 23.0,
					},
				]}
			/>
			<Planet
				name='Pluto'
				orbitalRadius={AU * 39.5}
				orbitalSpeed={0.004 / EARTH_ORBITAL_PERIOD}
				size={0.3}
				color='#cdc1b4'
				orbitalOffset={Math.PI * 1.9}
				orbitalInclination={17.0}
			/>
		</>
	)
}

export default SolarSystem
