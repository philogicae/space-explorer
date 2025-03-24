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

    turboIntervalRef.current = window.setInterval(() => {
      if (shipControlsWindow.shipControls) {
        shipControlsWindow.shipControls.activateTurbo();
      }
    }, 100);
  };

  const handleTurboStop = () => {
    if (turboIntervalRef.current !== null) {
      window.clearInterval(turboIntervalRef.current);
      turboIntervalRef.current = null;
    }

    const shipControlsWindow = window as Window & typeof globalThis & {
      shipControls?: ShipControlsInterface;
    };
    if (!shipControlsWindow.shipControls) {
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

    brakeIntervalRef.current = window.setInterval(() => {
      if (shipControlsWindow.shipControls) {
        shipControlsWindow.shipControls.activateBrake();
      }
    }, 100);
  };

  const handleBrakeStop = () => {
    if (brakeIntervalRef.current !== null) {
      window.clearInterval(brakeIntervalRef.current);
      brakeIntervalRef.current = null;
    }

    const shipControlsWindow = window as Window & typeof globalThis & {
      shipControls?: ShipControlsInterface;
    };
    if (!shipControlsWindow.shipControls) {
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
