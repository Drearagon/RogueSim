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
}

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
  id: number;
  title: string;
  objective: string;
  status: 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'FAILED';
  steps: MissionStep[];
  reward: number;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'BRUTAL';
  timeLimit?: number;
  intel: string[];
}

export interface MissionStep {
  command: string;
  completed: boolean;
  description: string;
  hint?: string;
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
  category: 'reconnaissance' | 'exploitation' | 'persistence' | 'evasion' | 'social';
  cost: number;
  prerequisites: string[];
  unlocks: string[];
  position: { x: number; y: number };
  unlocked: boolean;
  purchased: boolean;
}

export interface SkillTree {
  nodes: SkillNode[];
  skillPoints: number;
}
