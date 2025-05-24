import { useState, useEffect } from 'react';
import { BootScreen } from './components/BootScreen';
import { GameInterface } from './components/GameInterface';
import { useGameState } from './hooks/useGameState';
import { useSound } from './hooks/useSound';

export default function App() {
  const { gameState, updateGameState } = useGameState();
  const { setEnabled } = useSound();
  
  // Sync sound settings
  useEffect(() => {
    setEnabled(gameState.soundEnabled);
  }, [gameState.soundEnabled, setEnabled]);

  const handleBootComplete = () => {
    updateGameState({ isBootComplete: true });
  };

  if (!gameState.isBootComplete) {
    return <BootScreen onBootComplete={handleBootComplete} />;
  }

  return <GameInterface gameState={gameState} onGameStateUpdate={updateGameState} />;
}
