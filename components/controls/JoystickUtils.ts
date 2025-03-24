type JoystickUpdateFn = (x: number, y: number, joystickElement: HTMLElement) => void;

export const createJoystickPositionUpdater = (
  joystickKnobRef: React.RefObject<HTMLDivElement>,
  updateCameraControls = true
): JoystickUpdateFn => {
  return (x: number, y: number, joystickElement: HTMLElement) => {
    const centerX = joystickElement.clientWidth / 2;
    const centerY = joystickElement.clientHeight / 2;
    const maxDistance = Math.min(centerX, centerY) - 14;

    const distance = Math.sqrt(x * x + y * y);

    let normalizedX = x;
    let normalizedY = y;

    if (distance > maxDistance) {
      normalizedX = (x / distance) * maxDistance;
      normalizedY = (y / distance) * maxDistance;
    }

    if (joystickKnobRef.current) {
      const tiltFactor = 15;
      const tiltX = (normalizedY / maxDistance) * tiltFactor;
      const tiltY = (-normalizedX / maxDistance) * tiltFactor;
      joystickKnobRef.current.style.transform = `translate3d(${normalizedX}px, ${normalizedY}px, 0) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
    }

    if (updateCameraControls) {
      (
        window as Window &
          typeof globalThis & {
            cameraControls?: {
              updateJoystick: (x: number, y: number) => void;
            };
          }
      ).cameraControls?.updateJoystick(normalizedX * 0.5, normalizedY * 0.5);
    }
  };
};

export const createShipJoystickPositionUpdater = (
  shipJoystickKnobRef: React.RefObject<HTMLDivElement>
): JoystickUpdateFn => {
  return (x: number, y: number, joystickElement: HTMLElement) => {
    const centerX = joystickElement.clientWidth / 2;
    const centerY = joystickElement.clientHeight / 2;
    const maxDistance = Math.min(centerX, centerY) - 8;

    const distance = Math.sqrt(x * x + y * y);

    let normalizedX = x;
    let normalizedY = y;

    if (distance > maxDistance) {
      normalizedX = (x / distance) * maxDistance;
      normalizedY = (y / distance) * maxDistance;
    }

    const deadzone = 2;
    if (distance < deadzone) {
      normalizedX = 0;
      normalizedY = 0;
    }

    if (shipJoystickKnobRef.current) {
      const tiltFactor = 10;
      const tiltX = maxDistance > 0 ? (normalizedY / maxDistance) * tiltFactor : 0;
      const tiltY = maxDistance > 0 ? (-normalizedX / maxDistance) * tiltFactor : 0;
      
      shipJoystickKnobRef.current.style.transition = '';
      shipJoystickKnobRef.current.style.transform = `translate3d(${normalizedX}px, ${normalizedY}px, 0) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
    }

    const applyPrecisionCurve = (value: number): number => {
      const sign = Math.sign(value);
      const absVal = Math.abs(value);
      return sign * (absVal * absVal) / (maxDistance * 2);
    };

    const inputX = applyPrecisionCurve(normalizedX);
    const inputY = applyPrecisionCurve(normalizedY);

    const shipControls = (window as Window & typeof globalThis & { 
      shipControls?: {
        updateShipJoystick: (x: number, y: number) => void;
      } 
    }).shipControls;
    
    if (shipControls) {
      shipControls.updateShipJoystick(inputX, inputY);
    }
  };
};
