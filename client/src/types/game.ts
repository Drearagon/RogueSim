export interface GameState {
  currentMission: number;
  credits: number;
  reputation: string;
  completedMissions: number;
  unlockedCommands: string[];
  missionProgress: number;
  networkStatus: string;
  soundEnabled: boolean;
  isBootComplete: boolean;
  currentNetwork?: string;
  playerLevel: number;
  hydraProtocol: HydraProtocolState;
  narrativeChoices: string[];
  suspicionLevel: number;
  skillTree: SkillTree;
  inventory: PlayerInventory;
  ui: UIState;
  missionSteps: Record<number, boolean[]>;
  branchChoices?: Record<number, Record<string, string>>;
  dynamicMissionSteps?: Record<number, MissionStep[]>;
  // Mini-games state
  miniGameState?: MiniGameState;
  // Faction system state
  factionStandings: Record<string, PlayerFactionStanding>;
  activeFaction?: string;
  factionEvents: FactionEvent[];
  completedFactionMissions: string[];
  factionMissionCooldowns: Record<string, number>;
  activeFactionWars: string[];
  factionAchievements: string[];
  // Mission hints system
  hintsUsed?: number;
  // Enhanced Mission System
  availableMissions: Mission[];
  activeMission?: Mission;
  currentMissionProgress?: MissionProgress;
  completedMissionIds: string[];
  failedMissionIds: string[];
  missionHistory: MissionProgress[];
  // Special Mission State
  specialMissionActive?: boolean;
  specialMissionData?: any;
  customTerminalState?: {
    theme: string;
    colors: Record<string, string>;
    effects: string[];
  };
  // Mission Cooldowns and Availability
  missionCooldowns: Record<string, number>;
  emergencyMissions: Mission[];
  // Psychological Profile System
  psychProfile?: PsychProfile;
}

export interface UIState {
  activeInterface: 'none' | 'shop' | 'skills' | 'inventory' | 'missions';
  shopTab: ShopCategory;
  selectedItem: string | null;
}

export interface PlayerInventory {
  hardware: string[];
  software: string[];
  payloads: string[];
  intel: string[];
}

export type ShopCategory = 'hardware' | 'software' | 'skills' | 'blackmarket';

export interface HydraProtocolState {
  discovered: boolean;
  access_level: number;
  current_branch: string;
  completed_nodes: string[];
  active_contacts: string[];
  shadow_org_standing: 'UNKNOWN' | 'SUSPICIOUS' | 'TRUSTED' | 'COMPROMISED' | 'ELITE';
  encrypted_messages: EncryptedMessage[];
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  briefing: string;
  difficulty: 'TRIVIAL' | 'EASY' | 'MEDIUM' | 'HARD' | 'BRUTAL' | 'LEGENDARY';
  category: 'INFILTRATION' | 'SABOTAGE' | 'EXTRACTION' | 'RECONNAISSANCE' | 'SOCIAL_ENGINEERING' | 'CYBER_WARFARE' | 'SPECIAL_OPS';
  type: 'STANDARD' | 'FACTION' | 'SPECIAL' | 'DYNAMIC' | 'EMERGENCY';
  
  // Requirements
  requiredLevel: number;
  requiredFaction?: string;
  requiredSkills?: string[];
  requiredItems?: string[];
  
  // Rewards
  creditReward: number;
  experienceReward: number;
  reputationReward?: number;
  factionReputationChanges?: Record<string, number>; // Can be positive or negative
  itemRewards?: string[];
  skillPointReward?: number;
  unlocks?: string[]; // Commands, areas, etc.
  
  // Mission Properties
  timeLimit?: number; // in seconds
  stealthRequired?: boolean;
  maxSuspicion?: number;
  isRepeatable: boolean;
  cooldownHours?: number;
  
  // Mission Steps/Objectives
  objectives: MissionObjective[];
  
  // Special Properties
  isSpecial?: boolean;
  specialType?: 'TERMINAL_TAKEOVER' | 'REAL_TIME_HACK' | 'STEALTH_INFILTRATION' | 'AI_BATTLE' | 'SOCIAL_MANIPULATION';
  dynamicEnvironment?: boolean;
  
  // Availability
  availableFrom?: number; // timestamp
  availableUntil?: number; // timestamp
  maxAttempts?: number;
  
  // Story/Lore
  loreText?: string;
  consequences?: string[];
  
  // Success/Failure conditions
  successConditions?: MissionCondition[];
  failureConditions?: MissionCondition[];
}

export interface MissionObjective {
  id: string;
  description: string;
  type: 'COMMAND' | 'CONDITION' | 'CHOICE' | 'TIME_BASED' | 'STEALTH' | 'COMBAT';
  target?: string;
  command?: string;
  condition?: string;
  completed: boolean;
  optional?: boolean;
  hidden?: boolean; // Revealed during mission
  points?: number; // For scoring
}

export interface MissionCondition {
  type: 'SUSPICION_LEVEL' | 'TIME_LIMIT' | 'HEALTH' | 'RESOURCES' | 'DETECTION';
  operator: 'LESS_THAN' | 'GREATER_THAN' | 'EQUALS' | 'NOT_EQUALS';
  value: number;
  description: string;
}

export interface SpecialMission extends Mission {
  specialType: 'TERMINAL_TAKEOVER' | 'REAL_TIME_HACK' | 'STEALTH_INFILTRATION' | 'AI_BATTLE' | 'SOCIAL_MANIPULATION';
  customInterface?: {
    backgroundColor: string;
    textColor: string;
    accentColor: string;
    fontFamily?: string;
    effects?: string[];
  };
  customCommands?: string[];
  environmentChanges?: {
    terminalTheme?: string;
    backgroundMusic?: string;
    soundEffects?: string[];
    visualEffects?: string[];
  };
  realTimeElements?: {
    countdown?: boolean;
    progressBars?: boolean;
    liveUpdates?: boolean;
    interactiveElements?: boolean;
  };
}

export interface MissionProgress {
  missionId: string;
  startTime: number;
  currentObjective: number;
  completedObjectives: string[];
  timeElapsed: number;
  suspicionLevel: number;
  score: number;
  attempts: number;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'ABANDONED';
}

export interface MissionReward {
  type: 'CREDITS' | 'EXPERIENCE' | 'REPUTATION' | 'ITEMS' | 'SKILLS' | 'UNLOCKS';
  amount?: number;
  items?: string[];
  description: string;
}

export interface MissionStep {
  command: string;
  completed: boolean;
  description: string;
  hint?: string;
  id?: string;
  branchPoint?: BranchPoint;
  prerequisites?: string[];
  consequences?: string[];
}

export interface MissionBranch {
  id: string;
  name: string;
  description: string;
  steps: MissionStep[];
  rewardModifier: number;
  difficultyModifier: number;
  unlockConditions?: string[];
}

export interface BranchPoint {
  id: string;
  description: string;
  choices: BranchChoice[];
  timeLimit?: number;
  defaultChoice?: string;
}

export interface BranchChoice {
  id: string;
  text: string;
  description: string;
  consequences: string[];
  nextSteps: string[];
  blockedSteps?: string[];
  rewardModifier: number;
  suspicionChange?: number;
  skillRequirement?: string;
  unlocks?: string[];
}

export interface Command {
  description: string;
  usage: string;
  execute: (args: string[], gameState: GameState) => CommandResult;
  unlockLevel?: number;
}

export interface CommandResult {
  output: string[];
  success: boolean;
  updateGameState?: Partial<GameState>;
  soundEffect?: string;
}

export interface Network {
  ssid: string;
  channel: number;
  power: number;
  security: string;
  connected?: boolean;
}

export interface Device {
  name: string;
  mac: string;
  type: string;
  services?: string[];
}

export interface EncryptedMessage {
  id: string;
  from: string;
  timestamp: number;
  encrypted_content: string;
  decryption_key?: string;
  is_decrypted: boolean;
  content?: string;
}

export interface NarrativeEvent {
  id: string;
  title: string;
  description: string;
  choices: NarrativeChoice[];
  consequences: string[];
  unlock_conditions: string[];
}

export interface NarrativeChoice {
  id: string;
  text: string;
  consequences: string[];
  reputation_change: number;
  suspicion_change: number;
  unlock_commands?: string[];
  leads_to?: string;
}

export interface SkillNode {
  id: string;
  name: string;
  description: string;
  category: 'offensive' | 'defensive' | 'social';
  specialization: string; // Sub-category within the main category
  tier: number; // 1-5, representing skill tier/power level
  cost: number;
  prerequisites: string[];
  unlocks: string[]; // Commands, abilities, or other skills
  bonuses: SkillBonus[];
  position: { x: number; y: number };
  unlocked: boolean;
  purchased: boolean;
  maxLevel: number; // Skills can be upgraded multiple times
  currentLevel: number;
}

export interface SkillBonus {
  type: 'command_success' | 'credit_multiplier' | 'time_reduction' | 'detection_reduction' | 
        'damage_bonus' | 'resource_efficiency' | 'unlock_access' | 'passive_income' | 
        'skill_point_bonus' | 'experience_multiplier' | 'faction_reputation' | 'special_ability';
  value: number;
  description: string;
  conditions?: string[];
  stackable: boolean; // Whether multiple levels stack
}

export interface SkillTree {
  nodes: SkillNode[];
  skillPoints: number;
  totalSkillsUnlocked: number;
  specializationBonuses: Record<string, number>; // Track specialization focus for bonus effects
}

// Terminal Mini-Games System
export interface MiniGame {
  id: string;
  type: 'pattern_crack' | 'signal_trace' | 'binary_tree' | 'memory_sequence';
  title: string;
  description: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT';
  timeLimit: number; // seconds
  reward: {
    credits: number;
    experience: number;
    unlocks?: string[];
  };
  config: MiniGameConfig;
}

export interface MiniGameConfig {
  // Pattern Cracking
  patternLength?: number;
  sequenceCount?: number;
  allowedMistakes?: number;
  
  // Signal Tracing
  gridSize?: { width: number; height: number };
  obstacles?: number;
  signalStrength?: number;
  
  // Binary Tree
  treeDepth?: number;
  nodeCount?: number;
  targetPath?: string[];
  
  // Memory Sequence
  memorySize?: number;
  displayTime?: number;
  sequenceLength?: number;
}

export interface MiniGameState {
  isActive: boolean;
  currentGame: MiniGame | null;
  gameData: any; // Game-specific state
  startTime: number;
  score: number;
  mistakes: number;
  completed: boolean;
  success: boolean;
}

export interface PatternCrackGame {
  patterns: string[];
  currentPattern: number;
  userInput: string;
  correctSequences: number;
  timeRemaining: number;
}

export interface SignalTraceGame {
  grid: ('empty' | 'obstacle' | 'signal' | 'target' | 'player')[][];
  playerPosition: { x: number; y: number };
  targetPosition: { x: number; y: number };
  signalPath: { x: number; y: number }[];
  signalStrength: number;
  movesUsed: number;
  maxMoves: number;
}

export interface BinaryTreeGame {
  nodes: TreeNode[];
  currentNode: string;
  targetNode: string;
  path: string[];
  correctPath: string[];
  maxDepth: number;
}

export interface TreeNode {
  id: string;
  value: string;
  left?: string;
  right?: string;
  parent?: string;
  depth: number;
  isTarget?: boolean;
}

// Faction & Reputation System
export interface Faction {
  id: string;
  name: string;
  description: string;
  philosophy: string;
  specialization: FactionSpecialization;
  color: string;
  icon: string;
  requirements: FactionRequirement[];
  benefits: FactionBenefit[];
  exclusiveCommands: string[];
  exclusiveMissions: string[];
  rivalFactions: string[];
  maxReputation: number;
}

export interface FactionSpecialization {
  type: 'stealth' | 'brute_force' | 'deception' | 'technical' | 'social';
  bonuses: SpecializationBonus[];
  penalties: SpecializationPenalty[];
}

export interface SpecializationBonus {
  type: 'command_success' | 'credit_multiplier' | 'time_bonus' | 'detection_reduction' | 'unlock_access';
  value: number;
  description: string;
  conditions?: string[];
}

export interface SpecializationPenalty {
  type: 'command_failure' | 'credit_reduction' | 'time_penalty' | 'detection_increase';
  value: number;
  description: string;
  conditions?: string[];
}

export interface FactionRequirement {
  type: 'reputation' | 'mission_completion' | 'skill_level' | 'credits' | 'faction_standing';
  value: number;
  description: string;
  targetFaction?: string;
}

export interface FactionBenefit {
  type: 'discount' | 'exclusive_access' | 'bonus_rewards' | 'special_abilities' | 'protection';
  value: number;
  description: string;
  category?: string;
}

export interface PlayerFactionStanding {
  factionId: string;
  reputation: number;
  rank: FactionRank;
  joinedDate: number;
  missionsCompleted: number;
  creditsEarned: number;
  specialAchievements: string[];
  isActive: boolean;
  canLeave: boolean;
}

export interface FactionRank {
  id: string;
  name: string;
  level: number;
  requiredReputation: number;
  benefits: string[];
  title: string;
  permissions: string[];
}

export interface FactionMission {
  id: string;
  factionId: string;
  title: string;
  description: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'BRUTAL' | 'LEGENDARY';
  reputationReward: number;
  creditReward: number;
  requirements: FactionRequirement[];
  consequences: FactionConsequence[];
  timeLimit?: number;
  isRepeatable: boolean;
  cooldownHours?: number;
}

export interface FactionConsequence {
  targetFaction: string;
  reputationChange: number;
  description: string;
  permanent: boolean;
}

export interface FactionEvent {
  id: string;
  title: string;
  description: string;
  factionId?: string;
  choices: FactionEventChoice[];
  timeLimit?: number;
  consequences: string[];
}

export interface FactionEventChoice {
  id: string;
  text: string;
  description: string;
  reputationChanges: Record<string, number>; // factionId -> reputation change
  creditChange: number;
  unlocks?: string[];
  blocks?: string[];
  requirements?: FactionRequirement[];
}

export interface FactionWar {
  id: string;
  name: string;
  description: string;
  participatingFactions: string[];
  startDate: number;
  endDate?: number;
  isActive: boolean;
  objectives: FactionWarObjective[];
  rewards: FactionWarReward[];
}

export interface FactionWarObjective {
  id: string;
  description: string;
  targetFaction: string;
  progress: number;
  maxProgress: number;
  completed: boolean;
}

export interface FactionWarReward {
  factionId: string;
  type: 'credits' | 'reputation' | 'exclusive_access' | 'special_title';
  value: number;
  description: string;
}

export interface PsychProfile {
  // Core Personality Traits (0-100)
  cunning: number;        // Strategic thinking and manipulation
  empathy: number;        // Care for others and moral consideration  
  aggression: number;     // Willingness to use force/destructive methods
  patience: number;       // Long-term planning vs impulsiveness
  paranoia: number;       // Suspicion and security consciousness
  curiosity: number;      // Drive to explore and learn

  // Moral Alignment (-100 to +100)
  ethicalAlignment: number; // -100 (chaotic evil) to +100 (lawful good)
  
  // Reputation Scores
  corporateReputation: number;    // Standing with corporations
  hackivistReputation: number;    // Standing with activist groups
  criminalReputation: number;     // Standing with criminal organizations
  governmentReputation: number;   // Standing with government agencies
  
  // Psychological State
  mentalStability: number;        // Current psychological health
  moralConflict: number;         // Internal conflict from contradictory actions
  
  // Unlocked Paths and Consequences
  unlockedStoryPaths: string[];
  permanentConsequences: string[];
  
  // Profile History
  majorDecisions: Array<{
    id: string;
    description: string;
    ethicalWeight: number;
    traitImpacts: Record<string, number>;
    timestamp: number;
    consequences: string[];
  }>;
}
