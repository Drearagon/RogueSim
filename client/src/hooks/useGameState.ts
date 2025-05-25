import { useState, useCallback, useEffect } from 'react';
import { GameState } from '../types/game';
import { loadGameState, saveGameState } from '../lib/gameStorage';

export function useGameState() {
  const [gameState, setGameState] = useState<GameState>({
    currentMission: 0,
    credits: 500,
    reputation: 'UNKNOWN',
    completedMissions: 0,
    unlockedCommands: ['help', 'scan', 'connect', 'status', 'clear'],
    missionProgress: 0,
    networkStatus: 'DISCONNECTED',
    soundEnabled: true,
    isBootComplete: false,
    playerLevel: 1,
    hydraProtocol: {
      discovered: false,
      access_level: 0,
      current_branch: 'main',
      completed_nodes: [],
      active_contacts: [],
      shadow_org_standing: 'UNKNOWN',
      encrypted_messages: []
    },
    narrativeChoices: [],
    suspicionLevel: 0,
    skillTree: {
      nodes: [],
      skillPoints: 5
    }
  });

  const [isLoading, setIsLoading] = useState(true);

  // Load initial state
  useEffect(() => {
    const initializeGameState = async () => {
      try {
        const loadedState = await loadGameState();
        setGameState(loadedState);
      } catch (error) {
        console.warn('Failed to load initial game state:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeGameState();
  }, []);

  const updateGameState = useCallback((updates: Partial<GameState>) => {
    setGameState(prev => {
      const newState = { ...prev, ...updates };
      // Save asynchronously without blocking UI
      saveGameState(newState).catch(error => {
        console.warn('Failed to save game state:', error);
      });
      return newState;
    });
  }, []);

  const resetGame = useCallback(async () => {
    try {
      const defaultState = await loadGameState();
      setGameState(defaultState);
      await saveGameState(defaultState);
    } catch (error) {
      console.warn('Failed to reset game:', error);
    }
  }, []);

  return {
    gameState,
    updateGameState,
    resetGame,
    isLoading
  };
}
