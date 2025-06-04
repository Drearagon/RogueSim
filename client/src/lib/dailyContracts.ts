import { Mission, GameState } from '../types/game';

export interface DailyContract extends Mission {
  contractType: 'SPEED_RUN' | 'STEALTH_MISSION' | 'HIGH_VALUE_TARGET' | 'PUZZLE_CHALLENGE' | 'FACTION_SPECIAL';
  expiresAt: number;
  bonusObjectives: BonusObjective[];
  contractorName: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';
}

export interface BonusObjective {
  id: string;
  description: string;
  requirement: string;
  bonusReward: number;
  completed: boolean;
}

const contractorNames = [
  'Shadow Broker', 'Digital Phoenix', 'Quantum Collective', 'Neon Syndicate',
  'Cyber Wraith', 'Data Phantom', 'Neural Network', 'Binary Ghost',
  'Code Reaper', 'System Anarchist', 'Void Walker', 'Crypto Sage'
];

const speedRunTargets = [
  'CORPORATE_MAINFRAME', 'GOVERNMENT_DATABASE', 'RESEARCH_FACILITY',
  'FINANCIAL_NETWORK', 'SECURITY_GRID', 'COMMUNICATION_HUB'
];

const stealthTargets = [
  'HIGH_SECURITY_VAULT', 'CLASSIFIED_ARCHIVE', 'EXECUTIVE_TERMINAL',
  'INTELLIGENCE_SERVER', 'DIPLOMATIC_NETWORK', 'MILITARY_SYSTEM'
];

const highValueTargets = [
  'CENTRAL_BANK_CORE', 'NATIONAL_DEFENSE_AI', 'GLOBAL_TRADE_SYSTEM',
  'SPACE_COMMAND_NET', 'QUANTUM_COMPUTER', 'AI_RESEARCH_LAB'
];

export function generateDailyContracts(gameState: GameState): DailyContract[] {
  const contracts: DailyContract[] = [];
  const now = Date.now();
  const contractCount = Math.min(3 + Math.floor(gameState.playerLevel / 10), 6);
  
  for (let i = 0; i < contractCount; i++) {
    const contractType = getRandomContractType(gameState);
    const contract = generateContractByType(contractType, gameState, now);
    contracts.push(contract);
  }
  
  return contracts;
}

function getRandomContractType(gameState: GameState): DailyContract['contractType'] {
  const types: DailyContract['contractType'][] = ['SPEED_RUN', 'STEALTH_MISSION', 'HIGH_VALUE_TARGET', 'PUZZLE_CHALLENGE'];
  
  // Add faction contracts if player is in a faction
  if (gameState.activeFaction) {
    types.push('FACTION_SPECIAL');
  }
  
  return types[Math.floor(Math.random() * types.length)];
}

function generateContractByType(
  contractType: DailyContract['contractType'],
  gameState: GameState,
  currentTime: number
): DailyContract {
  const baseId = 5000 + Math.floor(Math.random() * 1000);
  const contractor = contractorNames[Math.floor(Math.random() * contractorNames.length)];
  const expiresAt = currentTime + (24 * 60 * 60 * 1000); // 24 hours
  
  switch (contractType) {
    case 'SPEED_RUN':
      return generateSpeedRunContract(baseId, contractor, expiresAt, gameState);
    case 'STEALTH_MISSION':
      return generateStealthContract(baseId, contractor, expiresAt, gameState);
    case 'HIGH_VALUE_TARGET':
      return generateHighValueContract(baseId, contractor, expiresAt, gameState);
    case 'PUZZLE_CHALLENGE':
      return generatePuzzleContract(baseId, contractor, expiresAt, gameState);
    case 'FACTION_SPECIAL':
      return generateFactionContract(baseId, contractor, expiresAt, gameState);
    default:
      return generateSpeedRunContract(baseId, contractor, expiresAt, gameState);
  }
}

function generateSpeedRunContract(
  id: number,
  contractor: string,
  expiresAt: number,
  gameState: GameState
): DailyContract {
  const target = speedRunTargets[Math.floor(Math.random() * speedRunTargets.length)];
  const timeLimit = 180 + (gameState.playerLevel * 10); // 3+ minutes based on level
  const baseReward = 800 + (gameState.playerLevel * 50);
  
  return {
    id,
    title: `SPEED_BREACH_${target.split('_')[0]}`,
    objective: `Breach ${target} within ${timeLimit} seconds`,
    status: 'PENDING',
    contractType: 'SPEED_RUN',
    contractorName: contractor,
    expiresAt,
    riskLevel: 'MEDIUM',
    steps: [
      {
        id: 'rapid_scan',
        command: 'scan --fast',
        completed: false,
        description: 'Quick network reconnaissance'
      },
      {
        id: 'speed_exploit',
        command: 'exploit --rapid',
        completed: false,
        description: 'Deploy rapid exploitation tools'
      },
      {
        id: 'data_grab',
        command: 'extract_data --priority',
        completed: false,
        description: 'Extract high-priority data quickly'
      }
    ],
    reward: baseReward,
    difficulty: 'MEDIUM',
    timeLimit,
    intel: [
      `• Target: ${target}`,
      `• Time Limit: ${timeLimit} seconds`,
      '• Speed is critical - every second counts',
      '• Bonus rewards for sub-optimal completion times'
    ],
    bonusObjectives: [
      {
        id: 'speed_demon',
        description: 'Complete in under 60% of time limit',
        requirement: `complete_under_${Math.floor(timeLimit * 0.6)}`,
        bonusReward: Math.floor(baseReward * 0.5),
        completed: false
      },
      {
        id: 'no_detection',
        description: 'Complete without triggering alarms',
        requirement: 'zero_suspicion_increase',
        bonusReward: Math.floor(baseReward * 0.3),
        completed: false
      }
    ]
  };
}

function generateStealthContract(
  id: number,
  contractor: string,
  expiresAt: number,
  gameState: GameState
): DailyContract {
  const target = stealthTargets[Math.floor(Math.random() * stealthTargets.length)];
  const baseReward = 1200 + (gameState.playerLevel * 75);
  
  return {
    id,
    title: `GHOST_OP_${target.split('_')[0]}`,
    objective: `Infiltrate ${target} without detection`,
    status: 'PENDING',
    contractType: 'STEALTH_MISSION',
    contractorName: contractor,
    expiresAt,
    riskLevel: 'HIGH',
    steps: [
      {
        id: 'stealth_recon',
        command: 'scan --passive',
        completed: false,
        description: 'Passive reconnaissance to avoid detection'
      },
      {
        id: 'ghost_entry',
        command: 'connect --stealth',
        completed: false,
        description: 'Establish covert connection'
      },
      {
        id: 'silent_exploit',
        command: 'exploit --silent',
        completed: false,
        description: 'Deploy stealth exploitation techniques'
      },
      {
        id: 'clean_extraction',
        command: 'extract_data --silent',
        completed: false,
        description: 'Extract data without leaving traces'
      }
    ],
    reward: baseReward,
    difficulty: 'HARD',
    intel: [
      `• Target: ${target}`,
      '• Stealth is paramount - avoid all detection',
      '• Advanced security systems active',
      '• Any suspicion increase will compromise mission'
    ],
    bonusObjectives: [
      {
        id: 'perfect_stealth',
        description: 'Complete with zero suspicion increase',
        requirement: 'zero_suspicion_increase',
        bonusReward: Math.floor(baseReward * 0.8),
        completed: false
      },
      {
        id: 'data_integrity',
        description: 'Extract all data without corruption',
        requirement: 'perfect_extraction',
        bonusReward: Math.floor(baseReward * 0.4),
        completed: false
      }
    ]
  };
}

function generateHighValueContract(
  id: number,
  contractor: string,
  expiresAt: number,
  gameState: GameState
): DailyContract {
  const target = highValueTargets[Math.floor(Math.random() * highValueTargets.length)];
  const baseReward = 2000 + (gameState.playerLevel * 100);
  
  return {
    id,
    title: `APEX_TARGET_${target.split('_')[0]}`,
    objective: `Compromise ${target} - maximum security expected`,
    status: 'PENDING',
    contractType: 'HIGH_VALUE_TARGET',
    contractorName: contractor,
    expiresAt,
    riskLevel: 'EXTREME',
    steps: [
      {
        id: 'deep_recon',
        command: 'scan --deep',
        completed: false,
        description: 'Comprehensive target analysis'
      },
      {
        id: 'security_bypass',
        command: 'bypass --advanced',
        completed: false,
        description: 'Overcome advanced security measures'
      },
      {
        id: 'zero_day_deploy',
        command: 'exploit --zero-day',
        completed: false,
        description: 'Deploy zero-day exploits'
      },
      {
        id: 'ai_battle',
        command: 'battle --ai',
        completed: false,
        description: 'Defeat AI security systems'
      },
      {
        id: 'core_extraction',
        command: 'extract_data --core',
        completed: false,
        description: 'Extract core system data'
      }
    ],
    reward: baseReward,
    difficulty: 'BRUTAL',
    timeLimit: 900, // 15 minutes
    intel: [
      `• Target: ${target}`,
      '• Extreme security measures active',
      '• AI-powered defense systems',
      '• Quantum encryption protocols',
      '• High-value intelligence expected'
    ],
    bonusObjectives: [
      {
        id: 'total_compromise',
        description: 'Gain complete system control',
        requirement: 'full_system_access',
        bonusReward: Math.floor(baseReward * 1.0),
        completed: false
      },
      {
        id: 'intelligence_bonus',
        description: 'Extract additional classified intelligence',
        requirement: 'bonus_intel_extracted',
        bonusReward: Math.floor(baseReward * 0.6),
        completed: false
      }
    ]
  };
}

function generatePuzzleContract(
  id: number,
  contractor: string,
  expiresAt: number,
  gameState: GameState
): DailyContract {
  const puzzleTypes = ['QUANTUM_CIPHER', 'NEURAL_MAZE', 'CRYPTO_PUZZLE', 'LOGIC_GATE'];
  const puzzleType = puzzleTypes[Math.floor(Math.random() * puzzleTypes.length)];
  const baseReward = 600 + (gameState.playerLevel * 40);
  
  return {
    id,
    title: `PUZZLE_BREACH_${puzzleType}`,
    objective: `Solve ${puzzleType} to unlock secure vault`,
    status: 'PENDING',
    contractType: 'PUZZLE_CHALLENGE',
    contractorName: contractor,
    expiresAt,
    riskLevel: 'LOW',
    steps: [
      {
        id: 'puzzle_analysis',
        command: 'analyze --puzzle',
        completed: false,
        description: 'Analyze puzzle structure and requirements'
      },
      {
        id: 'pattern_recognition',
        command: 'minigame pattern_crack',
        completed: false,
        description: 'Complete pattern recognition challenge'
      },
      {
        id: 'logic_solving',
        command: 'solve --algorithm',
        completed: false,
        description: 'Solve algorithmic logic puzzle'
      },
      {
        id: 'vault_access',
        command: 'access --vault',
        completed: false,
        description: 'Access unlocked secure vault'
      }
    ],
    reward: baseReward,
    difficulty: 'MEDIUM',
    timeLimit: 600, // 10 minutes
    intel: [
      `• Puzzle Type: ${puzzleType}`,
      '• Requires logical thinking and pattern recognition',
      '• No security systems to worry about',
      '• Focus on puzzle-solving skills'
    ],
    bonusObjectives: [
      {
        id: 'perfect_solve',
        description: 'Solve all puzzles on first attempt',
        requirement: 'no_puzzle_mistakes',
        bonusReward: Math.floor(baseReward * 0.5),
        completed: false
      },
      {
        id: 'speed_solver',
        description: 'Complete in under 5 minutes',
        requirement: 'complete_under_300',
        bonusReward: Math.floor(baseReward * 0.3),
        completed: false
      }
    ]
  };
}

function generateFactionContract(
  id: number,
  contractor: string,
  expiresAt: number,
  gameState: GameState
): DailyContract {
  const factionNames = {
    'serpent_syndicate': 'Serpent Syndicate',
    'crimson_circuit': 'Crimson Circuit',
    'mirage_loop': 'Mirage Loop'
  };
  
  const factionName = factionNames[gameState.activeFaction as keyof typeof factionNames] || 'Unknown Faction';
  const baseReward = 1500 + (gameState.playerLevel * 80);
  
  return {
    id,
    title: `FACTION_OP_${gameState.activeFaction?.toUpperCase()}`,
    objective: `Execute special operation for ${factionName}`,
    status: 'PENDING',
    contractType: 'FACTION_SPECIAL',
    contractorName: `${factionName} Command`,
    expiresAt,
    riskLevel: 'HIGH',
    steps: [
      {
        id: 'faction_briefing',
        command: 'faction status',
        completed: false,
        description: 'Review faction standing and objectives'
      },
      {
        id: 'special_recon',
        command: 'recon --faction',
        completed: false,
        description: 'Perform faction-specific reconnaissance'
      },
      {
        id: 'faction_exploit',
        command: getFactionSpecialCommand(gameState.activeFaction),
        completed: false,
        description: 'Execute faction-specific techniques'
      },
      {
        id: 'faction_extraction',
        command: 'extract_data --faction',
        completed: false,
        description: 'Extract data for faction analysis'
      }
    ],
    reward: baseReward,
    difficulty: 'HARD',
    intel: [
      `• Faction: ${factionName}`,
      '• Special faction techniques available',
      '• Increased reputation rewards',
      '• Faction-exclusive intelligence'
    ],
    bonusObjectives: [
      {
        id: 'faction_loyalty',
        description: 'Complete using only faction techniques',
        requirement: 'faction_methods_only',
        bonusReward: Math.floor(baseReward * 0.6),
        completed: false
      },
      {
        id: 'reputation_boost',
        description: 'Exceed mission expectations',
        requirement: 'exceptional_performance',
        bonusReward: Math.floor(baseReward * 0.4),
        completed: false
      }
    ]
  };
}

function getFactionSpecialCommand(factionId: string | undefined): string {
  switch (factionId) {
    case 'serpent_syndicate':
      return 'ghost_mode';
    case 'crimson_circuit':
      return 'overload_system';
    case 'mirage_loop':
      return 'deep_fake';
    default:
      return 'exploit --advanced';
  }
}

export function checkContractExpiration(contracts: DailyContract[]): DailyContract[] {
  const now = Date.now();
  return contracts.filter(contract => contract.expiresAt > now);
}

export function calculateContractReward(contract: DailyContract, gameState: GameState): number {
  let totalReward = contract.reward;
  
  // Add bonus rewards for completed bonus objectives
  contract.bonusObjectives.forEach(bonus => {
    if (bonus.completed) {
      totalReward += bonus.bonusReward;
    }
  });
  
  // Apply faction bonuses if applicable
  if (contract.contractType === 'FACTION_SPECIAL' && gameState.activeFaction) {
    totalReward = Math.floor(totalReward * 1.2); // 20% faction bonus
  }
  
  return totalReward;
}

export function checkBonusObjectiveCompletion(
  contract: DailyContract,
  objectiveId: string,
  gameState: GameState
): boolean {
  const objective = contract.bonusObjectives.find(obj => obj.id === objectiveId);
  if (!objective || objective.completed) return false;
  
  // Check if requirement is met based on game state
  switch (objective.requirement) {
    case 'zero_suspicion_increase':
      return gameState.suspicionLevel <= 0;
    case 'perfect_extraction':
      return true; // Would need to track extraction quality
    case 'full_system_access':
      return true; // Would need to track access level
    case 'no_puzzle_mistakes':
      return true; // Would need to track puzzle attempts
    default:
      if (objective.requirement.startsWith('complete_under_')) {
        const timeLimit = parseInt(objective.requirement.split('_')[2]);
        // Would need to track mission completion time
        return true;
      }
      return false;
  }
}

export function getActiveContracts(gameState: GameState): DailyContract[] {
  // This would typically load from game state or localStorage
  // For now, generate fresh contracts
  return generateDailyContracts(gameState);
} 