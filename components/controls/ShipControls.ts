import type { ShipControlsInterface } from '../types/controls';

export const createTurboHandler = (turboIntervalRef: React.MutableRefObject<number | null>) => {
  const handleTurboStart = () => {
    if (turboIntervalRef.current !== null) {
      window.clearInterval(turboIntervalRef.current);
      turboIntervalRef.current = null;
    }

    const shipControlsWindow = window as Window & typeof globalThis & {
      shipControls?: ShipControlsInterface;
    };

    if (!shipControlsWindow.shipControls) {
      const downEvent = new KeyboardEvent('keydown', {
        key: 'q',
        bubbles: true,
        cancelable: true
      });
      window.dispatchEvent(downEvent);
    }

    // Use setTurbo instead of activateTurbo for direct state control
    if (shipControlsWindow.shipControls) {
      shipControlsWindow.shipControls.setTurbo(true);
    }
  };

  const handleTurboStop = () => {
    if (turboIntervalRef.current !== null) {
      window.clearInterval(turboIntervalRef.current);
      turboIntervalRef.current = null;
    }

    const shipControlsWindow = window as Window & typeof globalThis & {
      shipControls?: ShipControlsInterface;
    };
    
    // Set turbo state to false on stop
    if (shipControlsWindow.shipControls) {
      shipControlsWindow.shipControls.setTurbo(false);
    } else {
      const upEvent = new KeyboardEvent('keyup', {
        key: 'q',
        bubbles: true,
        cancelable: true
      });
      window.dispatchEvent(upEvent);
    }
  };

  return { handleTurboStart, handleTurboStop };
};

export const createBrakeHandler = (brakeIntervalRef: React.MutableRefObject<number | null>) => {
  const handleBrakeStart = () => {
    if (brakeIntervalRef.current !== null) {
      window.clearInterval(brakeIntervalRef.current);
      brakeIntervalRef.current = null;
    }

    const shipControlsWindow = window as Window & typeof globalThis & {
      shipControls?: ShipControlsInterface;
    };

    if (!shipControlsWindow.shipControls) {
      const downEvent = new KeyboardEvent('keydown', {
        key: 'e',
        bubbles: true,
        cancelable: true
      });
      window.dispatchEvent(downEvent);
    }

    // Use setBrake instead of activateBrake for direct state control
    if (shipControlsWindow.shipControls) {
      shipControlsWindow.shipControls.setBrake(true);
    }
  };

  const handleBrakeStop = () => {
    if (brakeIntervalRef.current !== null) {
      window.clearInterval(brakeIntervalRef.current);
      brakeIntervalRef.current = null;
    }

    const shipControlsWindow = window as Window & typeof globalThis & {
      shipControls?: ShipControlsInterface;
    };
    
    // Set brake state to false on stop
    if (shipControlsWindow.shipControls) {
      shipControlsWindow.shipControls.setBrake(false);
    } else {
      const upEvent = new KeyboardEvent('keyup', {
        key: 'e',
        bubbles: true,
        cancelable: true
      });
      window.dispatchEvent(upEvent);
    }
  };

  return { handleBrakeStart, handleBrakeStop };
};
