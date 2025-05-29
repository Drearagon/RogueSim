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
    // Try to load from localStorage first
    const savedState = localStorage.getItem(STORAGE_KEY);
    if (savedState) {
      const parsedState = JSON.parse(savedState);
      // Merge with default state to ensure all properties exist
      return { ...defaultGameState, ...parsedState };
    }
  } catch (error) {
    console.error("Failed to load game state from localStorage:", error);
  }
  
  // Return default state if loading fails or no saved state exists
  return defaultGameState;
}

export async function saveGameState(gameState: GameState): Promise<void> {
  try {
    // Validate gameState before saving
    if (!gameState || typeof gameState !== 'object') {
      throw new Error('Invalid game state object');
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
    console.log('Game state saved successfully');
  } catch (error: unknown) {
    console.error("Local storage failed:", error);
    
    // Provide user-friendly feedback for storage issues
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      alert("Game save failed! Your browser storage is full. Please clear some space.");
    } else {
      alert("Game save failed! Check browser settings and try again.");
    }
    
    // Still throw the error so calling code can handle it
    throw error;
  }
}

export async function logCommand(command: string, args: string[], success: boolean): Promise<void> {
  // For deployment stability, just log to console
  console.log(`Command executed: ${command} ${args.join(' ')} - ${success ? 'SUCCESS' : 'FAILED'}`);
}