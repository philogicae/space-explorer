export interface CameraControlsInterface {
	zoomIn: () => void
	zoomOut: () => void
	rotate: (x: number, y: number) => void
	updateJoystick: (x: number, y: number) => void
	resetCamera: () => void
}

export interface ShipControlsInterface {
	moveForward: (active: boolean) => void
	moveBackward: (active: boolean) => void
	turnLeft: (active: boolean) => void
	turnRight: (active: boolean) => void
	pitchUp: (active: boolean) => void
	pitchDown: (active: boolean) => void
	activateTurbo: () => void
	activateBrake: () => void
	// New continuous state methods for Q and E keys
	setTurbo: (active: boolean) => void
	setBrake: (active: boolean) => void
	updateShipJoystick: (x: number, y: number) => void
}

// Camera constants
export const DEFAULT_ROTATION_X = 0.5
export const DEFAULT_ROTATION_Y = 1
export const DEFAULT_DISTANCE = 50

export const MIN_DISTANCE = 30
export const MAX_DISTANCE = 500
export const MIN_ROTATION_X = -1.2
export const MAX_ROTATION_X = 1.2
