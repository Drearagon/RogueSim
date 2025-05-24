import { useCallback } from 'react';
import { soundSystem } from '../lib/soundSystem';

export function useSound() {
  const playKeypress = useCallback(() => {
    soundSystem.playKeypress();
  }, []);

  const playError = useCallback(() => {
    soundSystem.playError();
  }, []);

  const playSuccess = useCallback(() => {
    soundSystem.playSuccess();
  }, []);

  const playBoot = useCallback(() => {
    soundSystem.playBoot();
  }, []);

  const playAlert = useCallback(() => {
    soundSystem.playAlert();
  }, []);

  const setEnabled = useCallback((enabled: boolean) => {
    soundSystem.setEnabled(enabled);
  }, []);

  return {
    playKeypress,
    playError,
    playSuccess,
    playBoot,
    playAlert,
    setEnabled
  };
}
