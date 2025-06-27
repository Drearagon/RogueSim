// Enhanced game progression and security features
export interface EnhancedGameState {
  // Core progression
  level: number;
  experience: number;
  skillPoints: number;
  reputation: 'ROOKIE' | 'HACKER' | 'ELITE' | 'LEGEND' | 'MYTHIC';
  
  // Security metrics
  securityBreaches: number;
  stealthRating: number;
  detectionRisk: number;
  
  // Advanced features
  achievements: Achievement[];
  activeContracts: Contract[];
  hackingTools: Tool[];
  networkConnections: NetworkNode[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: 'security' | 'stealth' | 'speed' | 'exploration' | 'mastery';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt: Date;
  rewards: {
    experience: number;
    skillPoints: number;
    credits: number;
    unlocks: string[];
  };
}

export interface Contract {
  id: string;
  title: string;
  client: string;
  difficulty: number;
  reward: number;
  timeLimit: number;
  requirements: string[];
  objectives: Objective[];
  status: 'available' | 'active' | 'completed' | 'failed';
}

export interface Objective {
  id: string;
  description: string;
  type: 'infiltrate' | 'extract' | 'sabotage' | 'reconnaissance';
  target: string;
  completed: boolean;
  optional: boolean;
}

export interface Tool {
  id: string;
  name: string;
  type: 'scanner' | 'exploit' | 'stealth' | 'defense' | 'utility';
  level: number;
  effectiveness: number;
  energyCost: number;
  unlockLevel: number;
}

export interface NetworkNode {
  id: string;
  name: string;
  type: 'server' | 'database' | 'firewall' | 'endpoint';
  securityLevel: number;
  status: 'unknown' | 'scanning' | 'breached' | 'secured';
  services: string[];
  vulnerabilities: Vulnerability[];
}

export interface Vulnerability {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  exploitable: boolean;
  patchLevel: number;
}

// Enhanced progression system
export class GameProgressionEngine {
  private static instance: GameProgressionEngine;
  private gameState: EnhancedGameState;

  constructor() {
    this.gameState = this.loadGameState();
  }

  static getInstance(): GameProgressionEngine {
    if (!GameProgressionEngine.instance) {
      GameProgressionEngine.instance = new GameProgressionEngine();
    }
    return GameProgressionEngine.instance;
  }

  private loadGameState(): EnhancedGameState {
    const saved = localStorage.getItem('roguesim_enhanced_state');
    if (saved) {
      return JSON.parse(saved);
    }

    return {
      level: 1,
      experience: 0,
      skillPoints: 3,
      reputation: 'ROOKIE',
      securityBreaches: 0,
      stealthRating: 100,
      detectionRisk: 0,
      achievements: [],
      activeContracts: [],
      hackingTools: this.getStarterTools(),
      networkConnections: []
    };
  }

  private getStarterTools(): Tool[] {
    return [
      {
        id: 'basic_scanner',
        name: 'Port Scanner',
        type: 'scanner',
        level: 1,
        effectiveness: 60,
        energyCost: 10,
        unlockLevel: 1
      },
      {
        id: 'basic_exploit',
        name: 'Buffer Overflow',
        type: 'exploit',
        level: 1,
        effectiveness: 50,
        energyCost: 15,
        unlockLevel: 1
      }
    ];
  }

  // Experience and leveling
  addExperience(amount: number, source: string): boolean {
    const oldLevel = this.gameState.level;
    this.gameState.experience += amount;
    
    const newLevel = this.calculateLevel(this.gameState.experience);
    if (newLevel > oldLevel) {
      this.levelUp(newLevel - oldLevel);
      this.saveGameState();
      return true;
    }
    
    this.saveGameState();
    return false;
  }

  private calculateLevel(experience: number): number {
    return Math.floor(Math.sqrt(experience / 100)) + 1;
  }

  private levelUp(levels: number): void {
    this.gameState.level += levels;
    this.gameState.skillPoints += levels * 2;
    
    // Check for new achievements
    this.checkLevelAchievements();
    
    // Unlock new tools
    this.unlockToolsByLevel();
  }

  // Achievement system
  unlockAchievement(achievementId: string): Achievement | null {
    const achievement = this.getAchievementById(achievementId);
    if (!achievement || this.hasAchievement(achievementId)) {
      return null;
    }

    const unlockedAchievement: Achievement = {
      ...achievement,
      unlockedAt: new Date()
    };

    this.gameState.achievements.push(unlockedAchievement);
    this.applyAchievementRewards(unlockedAchievement);
    this.saveGameState();
    
    return unlockedAchievement;
  }

  private getAchievementById(id: string): Achievement | null {
    const achievements: Achievement[] = [
      {
        id: 'first_hack',
        title: 'First Steps',
        description: 'Complete your first successful hack',
        category: 'exploration',
        rarity: 'common',
        unlockedAt: new Date(),
        rewards: { experience: 100, skillPoints: 1, credits: 500, unlocks: ['advanced_scanner'] }
      },
      {
        id: 'stealth_master',
        title: 'Ghost in the Machine',
        description: 'Complete 10 missions without detection',
        category: 'stealth',
        rarity: 'epic',
        unlockedAt: new Date(),
        rewards: { experience: 1000, skillPoints: 3, credits: 2000, unlocks: ['stealth_suite'] }
      },
      {
        id: 'speed_demon',
        title: 'Lightning Fast',
        description: 'Complete a mission in under 60 seconds',
        category: 'speed',
        rarity: 'rare',
        unlockedAt: new Date(),
        rewards: { experience: 500, skillPoints: 2, credits: 1000, unlocks: ['rapid_exploit'] }
      }
    ];

    return achievements.find(a => a.id === id) || null;
  }

  private hasAchievement(id: string): boolean {
    return this.gameState.achievements.some(a => a.id === id);
  }

  private applyAchievementRewards(achievement: Achievement): void {
    this.gameState.experience += achievement.rewards.experience;
    this.gameState.skillPoints += achievement.rewards.skillPoints;
    // Handle credits and unlocks...
  }

  private checkLevelAchievements(): void {
    const levelMilestones = [5, 10, 25, 50, 100];
    levelMilestones.forEach(milestone => {
      if (this.gameState.level >= milestone && !this.hasAchievement(`level_${milestone}`)) {
        this.unlockAchievement(`level_${milestone}`);
      }
    });
  }

  private unlockToolsByLevel(): void {
    // Unlock tools based on level progression
    const toolUnlocks = [
      { level: 5, toolId: 'advanced_scanner' },
      { level: 10, toolId: 'encryption_cracker' },
      { level: 15, toolId: 'stealth_module' },
      { level: 20, toolId: 'ai_assistant' }
    ];

    toolUnlocks.forEach(unlock => {
      if (this.gameState.level >= unlock.level && 
          !this.gameState.hackingTools.some(t => t.id === unlock.toolId)) {
        // Add new tool to inventory
      }
    });
  }

  // Contract system
  generateDynamicContracts(): Contract[] {
    const contractTemplates = [
      {
        title: 'Corporate Espionage',
        client: 'Anonymous',
        baseReward: 2000,
        objectives: ['infiltrate', 'extract']
      },
      {
        title: 'Security Audit',
        client: 'SecCorp Inc.',
        baseReward: 1500,
        objectives: ['reconnaissance', 'infiltrate']
      },
      {
        title: 'Whistleblower Protection',
        client: 'Activist Network',
        baseReward: 1000,
        objectives: ['stealth', 'extract']
      }
    ];

    return contractTemplates.map((template, index) => ({
      id: `contract_${Date.now()}_${index}`,
      title: template.title,
      client: template.client,
      difficulty: Math.floor(Math.random() * 5) + 1,
      reward: template.baseReward * (1 + Math.random()),
      timeLimit: 3600000, // 1 hour
      requirements: this.generateRequirements(),
      objectives: this.generateObjectives(template.objectives),
      status: 'available' as const
    }));
  }

  private generateRequirements(): string[] {
    const requirements = [
      'Stealth Level 3+',
      'Scanner Tool Required',
      'No Detection Allowed',
      'Complete within time limit'
    ];
    return requirements.slice(0, Math.floor(Math.random() * 3) + 1);
  }

  private generateObjectives(types: string[]): Objective[] {
    return types.map((type, index) => ({
      id: `obj_${Date.now()}_${index}`,
      description: this.getObjectiveDescription(type),
      type: type as any,
      target: this.generateTarget(),
      completed: false,
      optional: Math.random() < 0.3
    }));
  }

  private getObjectiveDescription(type: string): string {
    const descriptions = {
      infiltrate: 'Gain access to the target system',
      extract: 'Retrieve sensitive data files',
      sabotage: 'Disrupt system operations',
      reconnaissance: 'Gather intelligence on security measures'
    };
    return descriptions[type as keyof typeof descriptions] || 'Complete the objective';
  }

  private generateTarget(): string {
    const targets = [
      'Corporate Database',
      'Firewall System',
      'Email Server',
      'Financial Records',
      'Security Logs'
    ];
    return targets[Math.floor(Math.random() * targets.length)];
  }

  // Security and stealth mechanics
  updateSecurityMetrics(action: string, success: boolean): void {
    if (action === 'hack_attempt') {
      if (success) {
        this.gameState.stealthRating = Math.max(0, this.gameState.stealthRating - 5);
      } else {
        this.gameState.securityBreaches++;
        this.gameState.detectionRisk += 15;
        this.gameState.stealthRating = Math.max(0, this.gameState.stealthRating - 10);
      }
    }

    // Stealth rating recovery over time
    if (this.gameState.stealthRating < 100) {
      this.gameState.stealthRating = Math.min(100, this.gameState.stealthRating + 1);
    }

    this.saveGameState();
  }

  // Data persistence
  saveGameState(): void {
    localStorage.setItem('roguesim_enhanced_state', JSON.stringify(this.gameState));
  }

  getGameState(): EnhancedGameState {
    return { ...this.gameState };
  }

  // Network simulation
  scanNetwork(): NetworkNode[] {
    const nodes: NetworkNode[] = [
      {
        id: 'node_1',
        name: 'Mail Server',
        type: 'server',
        securityLevel: 3,
        status: 'unknown',
        services: ['SMTP', 'POP3', 'IMAP'],
        vulnerabilities: [
          {
            id: 'vuln_1',
            type: 'Buffer Overflow',
            severity: 'high',
            exploitable: true,
            patchLevel: 2
          }
        ]
      },
      {
        id: 'node_2',
        name: 'Database Server',
        type: 'database',
        securityLevel: 5,
        status: 'unknown',
        services: ['MySQL', 'PostgreSQL'],
        vulnerabilities: [
          {
            id: 'vuln_2',
            type: 'SQL Injection',
            severity: 'critical',
            exploitable: true,
            patchLevel: 1
          }
        ]
      }
    ];

    this.gameState.networkConnections = nodes;
    this.saveGameState();
    return nodes;
  }
}

// Real-time game events
export class GameEventEngine {
  private eventQueue: Array<{
    id: string;
    type: string;
    timestamp: Date;
    data: any;
  }> = [];

  addEvent(type: string, data: any): void {
    this.eventQueue.push({
      id: `event_${Date.now()}`,
      type,
      timestamp: new Date(),
      data
    });
  }

  processEvents(): void {
    // Process queued events
    this.eventQueue.forEach(event => {
      switch (event.type) {
        case 'security_alert':
          this.handleSecurityAlert(event.data);
          break;
        case 'contract_expired':
          this.handleContractExpired(event.data);
          break;
        case 'achievement_unlock':
          this.handleAchievementUnlock(event.data);
          break;
      }
    });

    this.eventQueue = [];
  }

  private handleSecurityAlert(data: any): void {
    console.log('🚨 Security Alert:', data);
  }

  private handleContractExpired(data: any): void {
    console.log('⏰ Contract Expired:', data);
  }

  private handleAchievementUnlock(data: any): void {
    console.log('🏆 Achievement Unlocked:', data);
  }
}