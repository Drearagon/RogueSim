import { GameState } from '../types/game';
import { apiRequest } from './queryClient';
import { createDefaultSkillTree } from './skillTree';
import { getCurrentUser } from './userStorage';

const STORAGE_KEY = 'roguesim_game_state';
const SESSION_KEY = 'roguesim_session_id';

const defaultGameState: GameState = {
  currentMission: 0,
  credits: 500,
  reputation: 'UNKNOWN',
  completedMissions: 0,
  unlockedCommands: ['help', 'scan', 'connect', 'status', 'clear', 'devmode', 'multiplayer', 'mission-map', 'chat', 'team', 'players', 'login'],
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
  },
  missionSteps: {},
  branchChoices: {},
  dynamicMissionSteps: {}
};

// Generate or get persistent session ID per user session
function getSessionId(): string {
  let sessionId = localStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    // Generate unique session ID that persists for this browser session
    sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    try {
      localStorage.setItem(SESSION_KEY, sessionId);
    } catch (error) {
      console.error("Failed to save session ID:", error);
      // Fallback to memory-based session ID if localStorage fails
      sessionId = 'temp_' + Date.now();
    }
  }
  return sessionId;
}

export async function loadGameState(): Promise<GameState> {
  try {
    // Check if user is authenticated first
    const user = await getCurrentUser();
    
    if (user) {
      // Try to load from backend if user is authenticated
      try {
        const response = await apiRequest('GET', '/api/game/load/single', undefined);
        const savedState = await response.json();
        
        if (savedState && savedState.gameState) {
          console.log('Game state loaded from backend successfully');
          // Ensure all required properties exist by merging with default
          const gameState = { ...defaultGameState, ...savedState.gameState };
          
          // Also update localStorage cache
          localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
          
          return gameState;
        }
      } catch (error) {
        console.warn('Failed to load game state from backend:', error);
        // Fall through to localStorage
      }
    }
    
    // Try to load from localStorage as fallback
    const savedState = localStorage.getItem(STORAGE_KEY);
    if (savedState) {
      const parsedState = JSON.parse(savedState);
      // Merge with default state to ensure all properties exist
      return { ...defaultGameState, ...parsedState };
    }
  } catch (error) {
    console.error("Failed to load game state:", error);
  }
  
  // Return default state if all loading fails
  return defaultGameState;
}

export async function saveGameState(gameState: GameState): Promise<void> {
  try {
    // Validate gameState before saving
    if (!gameState || typeof gameState !== 'object') {
      throw new Error('Invalid game state object');
    }
    
    // Always save to localStorage first for immediate availability
    localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
    
    // Try to save to backend if user is authenticated
    try {
      const user = await getCurrentUser();
      if (user) {
        await apiRequest('POST', '/api/game/save', {
          gameState: gameState,
          sessionId: 'current', // This will be set by the backend
          gameMode: 'single'
        });
        console.log('Game state saved to backend successfully');
      } else {
        console.log('Game state saved to localStorage only (not authenticated)');
      }
    } catch (backendError) {
      console.warn('Failed to save to backend, saved to localStorage only:', backendError);
    }
  } catch (error: unknown) {
    console.error("Game save failed:", error);
    
    // Provide user-friendly feedback for storage issues
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      alert("Game save failed! Your browser storage is full. Please clear some space.");
    } else {
      console.error("Game save error:", error);
    }
    
    throw error;
  }
}

export async function logCommand(command: string, args: string[], success: boolean): Promise<void> {
  try {
    // Try to log to backend if user is authenticated
    const user = await getCurrentUser();
    if (user) {
      await apiRequest('POST', '/api/commands/log', {
        command: command,
        args: args,
        success: success,
        executedAt: new Date().toISOString()
      });
    } else {
      // Fall back to console logging
      console.log(`Command executed: ${command} ${args.join(' ')} - ${success ? 'SUCCESS' : 'FAILED'}`);
    }
  } catch (error) {
    // Always fall back to console logging if backend fails
    console.log(`Command executed: ${command} ${args.join(' ')} - ${success ? 'SUCCESS' : 'FAILED'}`);
    console.warn('Failed to log command to backend:', error);
  }
}