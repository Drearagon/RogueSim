import { GameState } from '../types/game';

export const createDevAccount = (): GameState => {
  return {
    isBootComplete: true,
    playerLevel: 100,
    credits: 999999999,
    inventory: {},
    skillTree: {
      skillPoints: 999
    },
    networkMap: {
      discovered: ['TARGET_NET', 'HomeNetwork_5G', 'NETGEAR_Guest', 'IoT_Device_001', '[HIDDEN]'],
      compromised: ['TARGET_NET', 'HomeNetwork_5G', 'NETGEAR_Guest', 'IoT_Device_001']
    },
    activeConnections: [
      { ssid: 'TARGET_NET', status: 'CONNECTED', quality: 100 },
      { ssid: 'HomeNetwork_5G', status: 'BACKDOOR', quality: 95 },
      { ssid: 'IoT_Device_001', status: 'COMPROMISED', quality: 85 }
    ],
    encryptedMessages: [
      {
        id: 'dev_msg_1',
        sender: 'SHADOW_ADMIN',
        recipient: 'DEV_USER',
        subject: 'FULL ACCESS GRANTED',
        content: 'Welcome to developer mode. All systems unlocked.',
        decryptionKey: 'DEV_KEY_001',
        timestamp: new Date().toISOString()
      }
    ],
    completedNarrativeEvents: [
      'first_contact', 'shadow_introduction', 'hydra_discovery', 'quantum_revelation'
    ],
    reputation: 'LEGENDARY',
    currentMissionId: null, // No active mission constraints
    soundEnabled: true,
    networkStatus: 'HYPER_CONNECTED',
    suspicionLevel: 0, // Never get caught
    completedMissions: 250,
    currentMission: 999, // Access to all missions
    unlockedCommands: [
      'help', 'scan', 'connect', 'inject', 'deauth', 'crack', 'exploit', 'backdoor',
      'decrypt', 'nmap', 'keylog', 'shop', 'skills', 'mission', 'complete',
      'hydra', 'choose', 'multiplayer', 'leaderboard'
    ],
    hydraProtocol: {
      discovered: true,
      access_level: 10,
      current_branch: 'OMEGA_CLEARANCE',
      completed_nodes: ['alpha', 'beta', 'gamma', 'delta', 'epsilon', 'zeta', 'eta', 'theta', 'iota', 'kappa'],
      shadow_org_standing: 'LEGENDARY',
      active_contacts: ['SHADOW_ADMIN', 'QUANTUM_ORACLE', 'NEXUS_PRIME', 'VOID_WALKER'],
      encrypted_messages: [
        {
          id: 'omega_1',
          from: 'SHADOW_ADMIN',
          content: 'All systems at your disposal',
          is_decrypted: true,
          timestamp: new Date().toISOString()
        }
      ]
    },
    narrativeChoices: [],
    sessionId: 'dev_account_' + Date.now(),
    
    // Multiplayer-specific dev stats
    multiplayerStats: {
      totalGames: 500,
      wins: 450,
      losses: 50,
      winRate: 90,
      averageCompletionTime: 45, // seconds
      bestTime: 23,
      favoriteMode: 'competitive',
      roomsCreated: 100,
      playersHelped: 1000
    }
  };
};

// Command to activate developer mode
export const activateDevMode = () => {
  const devState = createDevAccount();
  
  // Save to localStorage for immediate use
  localStorage.setItem('gameState', JSON.stringify(devState));
  
  // Also save to session storage as backup
  sessionStorage.setItem('devMode', 'true');
  sessionStorage.setItem('devGameState', JSON.stringify(devState));
  
  return devState;
};

// Check if dev mode is active
export const isDevModeActive = (): boolean => {
  return sessionStorage.getItem('devMode') === 'true';
};

// Get dev account data
export const getDevAccountData = (): GameState | null => {
  const devData = sessionStorage.getItem('devGameState');
  return devData ? JSON.parse(devData) : null;
};