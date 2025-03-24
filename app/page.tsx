'use client'

import { useState } from 'react'
import Scene from '../components/Scene'

export default function Home() {
	const [gameStarted, setGameStarted] = useState(false)

	return (
		<main className='flex flex-col justify-between items-center min-h-screen bg-black'>
			<div className='absolute inset-0 z-0'>
				<Scene
					gameStarted={gameStarted}
					onStartGame={() => setGameStarted(true)}
				/>
			</div>

			{!gameStarted ? (
				<div className='flex absolute inset-0 z-10 flex-col justify-center items-center w-full h-full bg-black'>
					{/* Starry background with gradient overlay */}
					<div className='overflow-hidden absolute inset-0'>
						{/* Animated stars */}
						<div
							className='absolute inset-0'
							style={{
								background:
									'radial-gradient(circle at center, rgba(16, 24, 52, 0.8) 0%, rgba(0, 0, 0, 1) 70%)',
							}}
						/>

						{/* Animated glow */}
						<div className='absolute top-1/4 left-1/2 w-96 h-96 rounded-full blur-3xl animate-pulse -translate-x-1/2 bg-blue-500/10' />
					</div>

					{/* Content */}
					<div className='relative z-20 px-4 max-w-2xl text-center'>
						{/* Logo */}
						<div className='mb-6 animate-pulse'>
							<div className='mx-auto w-28 h-28'>
								<svg
									viewBox='0 0 24 24'
									fill='none'
									xmlns='http://www.w3.org/2000/svg'
									aria-labelledby='starLogoTitle'
									role='img'
								>
									<title id='starLogoTitle'>Space Explorer Logo</title>
									<path
										d='M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z'
										fill='#3B82F6'
									/>
								</svg>
							</div>
						</div>

						{/* Title */}
						<h1 className='mb-6 text-7xl font-bold tracking-tight text-white'>
							<span className='text-blue-500'>Space</span> Explorer
						</h1>

						{/* Tagline */}
						<p className='mb-12 text-2xl font-light text-blue-100'>
							Embark on an epic journey
						</p>

						{/* Start button */}
						<button
							type='button'
							onClick={() => setGameStarted(true)}
							className='overflow-hidden relative px-10 py-4 text-xl font-medium text-white bg-transparent rounded-full border-2 border-blue-500 transition-all duration-300 group hover:bg-blue-500/20 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-black'
						>
							<span className='relative z-10'>Launch Mission</span>
							<span className='absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-400 opacity-0 transition-opacity duration-300 group-hover:opacity-20' />
						</button>
					</div>
				</div>
			) : null}
		</main>
	)
}
