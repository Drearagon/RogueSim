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
  const sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  localStorage.setItem(SESSION_KEY, sessionId);
  return sessionId;
}

export async function loadGameState(): Promise<GameState> {
  // For deployment stability, always start with fresh default state
  return defaultGameState;
}

export async function saveGameState(gameState: GameState): Promise<void> {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
  } catch (error) {
    console.error('Failed to save game state:', error);
  }
}

export async function logCommand(command: string, args: string[], success: boolean): Promise<void> {
  // For deployment stability, just log to console
  console.log(`Command executed: ${command} ${args.join(' ')} - ${success ? 'SUCCESS' : 'FAILED'}`);
}