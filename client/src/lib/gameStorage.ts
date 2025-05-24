import { GameState } from '../types/game';

const STORAGE_KEY = 'roguesim_game_state';

const defaultGameState: GameState = {
  currentMission: 0,
  credits: 2847,
  reputation: 'TRUSTED',
  completedMissions: 12,
  unlockedCommands: ['help', 'scan', 'connect', 'status', 'clear', 'man'],
  missionProgress: 15,
  networkStatus: 'CONNECTED',
  soundEnabled: true,
  isBootComplete: false,
  playerLevel: 1
};

export function loadGameState(): GameState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...defaultGameState, ...parsed };
    }
  } catch (error) {
    console.warn('Failed to load game state:', error);
  }
  return defaultGameState;
}

export function saveGameState(gameState: GameState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
  } catch (error) {
    console.warn('Failed to save game state:', error);
  }
}

export function resetGameState(): GameState {
  localStorage.removeItem(STORAGE_KEY);
  return defaultGameState;
}
