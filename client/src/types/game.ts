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
