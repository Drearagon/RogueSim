import { useState, useCallback, useEffect } from 'react';
import { GameState } from '../types/game';
import { loadGameState, saveGameState } from '../lib/gameStorage';

export function useGameState() {
  const [gameState, setGameState] = useState<GameState>(loadGameState);

  const updateGameState = useCallback((updates: Partial<GameState>) => {
    setGameState(prev => {
      const newState = { ...prev, ...updates };
      saveGameState(newState);
      return newState;
    });
  }, []);

  const resetGame = useCallback(() => {
    const defaultState = loadGameState();
    setGameState(defaultState);
    saveGameState(defaultState);
  }, []);

  // Auto-save on state changes
  useEffect(() => {
    saveGameState(gameState);
  }, [gameState]);

  return {
    gameState,
    updateGameState,
    resetGame
  };
}
