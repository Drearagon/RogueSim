import { GameState } from '../types/game';
import { apiRequest } from './queryClient';
import { createDefaultSkillTree } from './skillTree';

const STORAGE_KEY = 'roguesim_game_state';
const SESSION_KEY = 'roguesim_session_id';

const defaultGameState: GameState = {
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
  skillTree: createDefaultSkillTree(),
  inventory: {
    hardware: [],
    software: [],
    payloads: [],
    intel: []
  },
  ui: {
    activeInterface: 'none',
    shopTab: 'hardware',
    selectedItem: null
  }
};

// Generate or get session ID
function getSessionId(): string {
  let sessionId = localStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem(SESSION_KEY, sessionId);
  }
  return sessionId;
}

export async function loadGameState(): Promise<GameState> {
  try {
    const sessionId = getSessionId();
    
    // Try to load from database first
    try {
      const response = await fetch(`/api/game/load/${sessionId}`);
      if (response.ok) {
        const dbState = await response.json();
        // Convert database format to game state format
        const gameState: GameState = {
          currentMission: dbState.currentMission,
          credits: dbState.credits,
          reputation: dbState.reputation,
          completedMissions: dbState.completedMissions,
          unlockedCommands: dbState.unlockedCommands,
          missionProgress: dbState.missionProgress,
          networkStatus: dbState.networkStatus,
          soundEnabled: dbState.soundEnabled,
          isBootComplete: dbState.isBootComplete,
          currentNetwork: dbState.currentNetwork,
          playerLevel: dbState.playerLevel,
          hydraProtocol: dbState.hydraProtocol || defaultGameState.hydraProtocol,
          narrativeChoices: dbState.narrativeChoices || [],
          suspicionLevel: dbState.suspicionLevel || 0,
          skillTree: dbState.skillTree || defaultGameState.skillTree,
          inventory: dbState.inventory || defaultGameState.inventory,
          ui: dbState.ui || defaultGameState.ui
        };
        return gameState;
      }
    } catch (error) {
      console.warn('Failed to load from database, falling back to localStorage:', error);
    }
    
    // Fallback to localStorage
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

export async function saveGameState(gameState: GameState): Promise<void> {
  try {
    const sessionId = getSessionId();
    
    // Save to database
    const dbGameState = {
      sessionId,
      currentMission: gameState.currentMission,
      credits: gameState.credits,
      reputation: gameState.reputation,
      completedMissions: gameState.completedMissions,
      unlockedCommands: gameState.unlockedCommands,
      missionProgress: gameState.missionProgress,
      networkStatus: gameState.networkStatus,
      soundEnabled: gameState.soundEnabled,
      isBootComplete: gameState.isBootComplete,
      currentNetwork: gameState.currentNetwork,
      playerLevel: gameState.playerLevel,
      gameData: {}
    };
    
    try {
      await apiRequest('/api/game/save', 'POST', dbGameState);
    } catch (error) {
      console.warn('Failed to save to database, saving to localStorage only:', error);
    }
    
    // Also save to localStorage as backup
    localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
  } catch (error) {
    console.warn('Failed to save game state:', error);
  }
}

export async function logCommand(command: string, args: string[], success: boolean, output: string[]): Promise<void> {
  try {
    const sessionId = getSessionId();
    const commandLog = {
      sessionId,
      command,
      args,
      success,
      output
    };
    
    await apiRequest('/api/commands/log', 'POST', commandLog);
  } catch (error) {
    console.warn('Failed to log command:', error);
  }
}

export function resetGameState(): GameState {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(SESSION_KEY);
  return defaultGameState;
}

export { getSessionId };
