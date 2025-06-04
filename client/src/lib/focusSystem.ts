export interface FocusState {
  current: number; // 0-100
  maximum: number; // Base maximum focus
  drainRate: number; // Focus drain per action
  regenRate: number; // Focus regeneration per second
  overloadThreshold: number; // When overload effects start
  isOverloaded: boolean;
  lastAction: number;
  effects: FocusEffect[];
  stimulants: Stimulant[];
}

export interface FocusEffect {
  id: string;
  type: 'command_delay' | 'hallucination' | 'typo_injection' | 'false_positive' | 'memory_loss';
  severity: number; // 1-10
  duration: number; // milliseconds
  startTime: number;
  description: string;
}

export interface Stimulant {
  id: string;
  name: string;
  type: 'caffeine' | 'nootropic' | 'energy_drink' | 'meditation' | 'break';
  focusBoost: number;
  duration: number; // milliseconds
  sideEffects: string[];
  appliedAt: number;
  cost: number; // in credits
}

export interface FocusAction {
  command: string;
  baseCost: number;
  complexity: number; // 1-10
  stressLevel: number; // 1-10
}

export class FocusSystem {
  private state: FocusState;
  private actionCosts: Map<string, FocusAction>;

  constructor() {
    this.state = {
      current: 100,
      maximum: 100,
      drainRate: 1,
      regenRate: 0.5,
      overloadThreshold: 20,
      isOverloaded: false,
      lastAction: Date.now(),
      effects: [],
      stimulants: []
    };

    this.actionCosts = new Map();
    this.initializeActionCosts();
    this.startRegeneration();
  }

  private initializeActionCosts(): void {
    const actions: FocusAction[] = [
      // Basic commands
      { command: 'help', baseCost: 1, complexity: 1, stressLevel: 1 },
      { command: 'ls', baseCost: 2, complexity: 2, stressLevel: 1 },
      { command: 'cd', baseCost: 1, complexity: 1, stressLevel: 1 },
      { command: 'pwd', baseCost: 1, complexity: 1, stressLevel: 1 },
      
      // Network scanning
      { command: 'ping', baseCost: 3, complexity: 3, stressLevel: 2 },
      { command: 'nmap', baseCost: 8, complexity: 6, stressLevel: 4 },
      { command: 'scan', baseCost: 5, complexity: 4, stressLevel: 3 },
      
      // Exploitation
      { command: 'exploit', baseCost: 15, complexity: 8, stressLevel: 7 },
      { command: 'inject', baseCost: 12, complexity: 7, stressLevel: 6 },
      { command: 'crack', baseCost: 10, complexity: 6, stressLevel: 5 },
      
      // Advanced operations
      { command: 'backdoor', baseCost: 20, complexity: 9, stressLevel: 8 },
      { command: 'exfiltrate', baseCost: 18, complexity: 8, stressLevel: 7 },
      { command: 'pivot', baseCost: 16, complexity: 7, stressLevel: 6 },
      
      // Stealth operations
      { command: 'stealth', baseCost: 14, complexity: 7, stressLevel: 8 },
      { command: 'cover_tracks', baseCost: 12, complexity: 6, stressLevel: 7 },
      { command: 'spoof', baseCost: 10, complexity: 5, stressLevel: 5 },
      
      // Social engineering
      { command: 'phish', baseCost: 8, complexity: 5, stressLevel: 6 },
      { command: 'social_engineer', baseCost: 12, complexity: 7, stressLevel: 8 },
      
      // System administration
      { command: 'sudo', baseCost: 6, complexity: 4, stressLevel: 5 },
      { command: 'chmod', baseCost: 3, complexity: 3, stressLevel: 2 },
      { command: 'ps', baseCost: 2, complexity: 2, stressLevel: 1 },
      { command: 'kill', baseCost: 4, complexity: 3, stressLevel: 4 }
    ];

    actions.forEach(action => {
      this.actionCosts.set(action.command, action);
    });
  }

  // Calculate focus cost for an action
  calculateFocusCost(command: string, context?: {
    timeSpent?: number;
    difficulty?: number;
    pressure?: number;
    consecutiveActions?: number;
  }): number {
    const action = this.actionCosts.get(command) || {
      command,
      baseCost: 5,
      complexity: 3,
      stressLevel: 3
    };

    let cost = action.baseCost;

    // Apply context modifiers
    if (context) {
      // Time pressure increases cost
      if (context.timeSpent && context.timeSpent > 30000) { // 30 seconds
        cost *= 1.5;
      }

      // Difficulty modifier
      if (context.difficulty) {
        cost *= (1 + context.difficulty * 0.2);
      }

      // Pressure modifier
      if (context.pressure) {
        cost *= (1 + context.pressure * 0.1);
      }

      // Consecutive actions fatigue
      if (context.consecutiveActions && context.consecutiveActions > 5) {
        cost *= (1 + (context.consecutiveActions - 5) * 0.1);
      }
    }

    // Overload penalty
    if (this.state.isOverloaded) {
      cost *= 2;
    }

    // Current focus level affects efficiency
    const focusEfficiency = this.state.current / this.state.maximum;
    if (focusEfficiency < 0.3) {
      cost *= 1.8;
    } else if (focusEfficiency < 0.5) {
      cost *= 1.4;
    }

    return Math.ceil(cost);
  }

  // Consume focus for an action
  consumeFocus(command: string, context?: any): {
    success: boolean;
    focusUsed: number;
    effects: FocusEffect[];
    message?: string;
  } {
    const cost = this.calculateFocusCost(command, context);
    const effects: FocusEffect[] = [];

    // Check if we have enough focus
    if (this.state.current < cost) {
      // Force the action but with severe penalties
      this.state.current = Math.max(0, this.state.current - cost);
      this.triggerOverload();
      
      return {
        success: false,
        focusUsed: cost,
        effects: this.generateOverloadEffects(),
        message: "Focus depleted! Action executed with severe impairment."
      };
    }

    // Normal focus consumption
    this.state.current = Math.max(0, this.state.current - cost);
    this.state.lastAction = Date.now();

    // Check for overload
    if (this.state.current <= this.state.overloadThreshold && !this.state.isOverloaded) {
      this.triggerOverload();
      effects.push(...this.generateOverloadEffects());
    }

    // Generate minor effects based on focus level
    if (this.state.current < 30 && Math.random() < 0.3) {
      effects.push(this.generateMinorEffect());
    }

    return {
      success: true,
      focusUsed: cost,
      effects,
      message: this.getFocusMessage()
    };
  }

  private triggerOverload(): void {
    this.state.isOverloaded = true;
    this.state.drainRate *= 1.5;
    this.state.regenRate *= 0.5;
  }

  private generateOverloadEffects(): FocusEffect[] {
    const effects: FocusEffect[] = [];
    const overloadTypes: FocusEffect['type'][] = [
      'command_delay', 'hallucination', 'typo_injection', 'false_positive', 'memory_loss'
    ];

    // Generate 1-3 effects
    const effectCount = Math.floor(Math.random() * 3) + 1;
    
    for (let i = 0; i < effectCount; i++) {
      const type = overloadTypes[Math.floor(Math.random() * overloadTypes.length)];
      const effect: FocusEffect = {
        id: `effect_${Date.now()}_${i}`,
        type,
        severity: Math.floor(Math.random() * 5) + 6, // 6-10 for overload
        duration: Math.floor(Math.random() * 30000) + 10000, // 10-40 seconds
        startTime: Date.now(),
        description: this.getEffectDescription(type, true)
      };
      effects.push(effect);
      this.state.effects.push(effect);
    }

    return effects;
  }

  private generateMinorEffect(): FocusEffect {
    const minorTypes: FocusEffect['type'][] = ['command_delay', 'typo_injection'];
    const type = minorTypes[Math.floor(Math.random() * minorTypes.length)];
    
    const effect: FocusEffect = {
      id: `effect_${Date.now()}`,
      type,
      severity: Math.floor(Math.random() * 3) + 1, // 1-3 for minor
      duration: Math.floor(Math.random() * 10000) + 5000, // 5-15 seconds
      startTime: Date.now(),
      description: this.getEffectDescription(type, false)
    };

    this.state.effects.push(effect);
    return effect;
  }

  private getEffectDescription(type: FocusEffect['type'], isOverload: boolean): string {
    const descriptions = {
      command_delay: isOverload 
        ? "Severe mental fatigue causing significant command delays"
        : "Slight hesitation before executing commands",
      hallucination: "Visual distortions in terminal output",
      typo_injection: isOverload
        ? "Frequent typos and command errors due to exhaustion"
        : "Occasional typos in command input",
      false_positive: "Misinterpreting scan results and system responses",
      memory_loss: "Difficulty remembering recent actions and discoveries"
    };
    return descriptions[type];
  }

  private getFocusMessage(): string {
    const focusPercent = (this.state.current / this.state.maximum) * 100;
    
    if (focusPercent > 80) return "Sharp focus maintained";
    if (focusPercent > 60) return "Focus slightly diminished";
    if (focusPercent > 40) return "Concentration wavering";
    if (focusPercent > 20) return "Mental fatigue setting in";
    return "Severe exhaustion - critical focus levels";
  }

  // Apply stimulant
  useStimulant(stimulantType: Stimulant['type']): {
    success: boolean;
    stimulant?: Stimulant;
    message: string;
  } {
    const stimulantData = this.getStimulantData(stimulantType);
    
    if (!stimulantData) {
      return {
        success: false,
        message: "Unknown stimulant type"
      };
    }

    // Check for existing stimulants
    const activeStimulants = this.state.stimulants.filter(s => 
      Date.now() - s.appliedAt < s.duration
    );

    if (activeStimulants.length >= 2) {
      return {
        success: false,
        message: "Too many active stimulants - risk of overdose"
      };
    }

    const stimulant: Stimulant = {
      ...stimulantData,
      id: `stim_${Date.now()}`,
      appliedAt: Date.now()
    };

    // Apply focus boost
    this.state.current = Math.min(this.state.maximum, this.state.current + stimulant.focusBoost);
    this.state.stimulants.push(stimulant);

    // Special effects
    if (stimulantType === 'meditation' || stimulantType === 'break') {
      this.state.isOverloaded = false;
      this.state.drainRate = 1;
      this.state.regenRate = 0.5;
      this.clearEffects();
    }

    return {
      success: true,
      stimulant,
      message: `${stimulant.name} applied. Focus restored by ${stimulant.focusBoost} points.`
    };
  }

  private getStimulantData(type: Stimulant['type']): Omit<Stimulant, 'id' | 'appliedAt'> | null {
    const stimulants: Record<Stimulant['type'], Omit<Stimulant, 'id' | 'appliedAt'>> = {
      caffeine: {
        name: "Coffee",
        type: 'caffeine',
        focusBoost: 20,
        duration: 300000, // 5 minutes
        sideEffects: ["Jitters", "Crash after effect"],
        cost: 50
      },
      nootropic: {
        name: "Nootropic Supplement",
        type: 'nootropic',
        focusBoost: 35,
        duration: 600000, // 10 minutes
        sideEffects: ["Mild headache"],
        cost: 150
      },
      energy_drink: {
        name: "Energy Drink",
        type: 'energy_drink',
        focusBoost: 30,
        duration: 240000, // 4 minutes
        sideEffects: ["Heart palpitations", "Severe crash"],
        cost: 75
      },
      meditation: {
        name: "Deep Focus Meditation",
        type: 'meditation',
        focusBoost: 50,
        duration: 900000, // 15 minutes
        sideEffects: [],
        cost: 0
      },
      break: {
        name: "Short Break",
        type: 'break',
        focusBoost: 25,
        duration: 180000, // 3 minutes
        sideEffects: [],
        cost: 0
      }
    };

    return stimulants[type] || null;
  }

  // Clear expired effects
  private clearExpiredEffects(): void {
    const now = Date.now();
    this.state.effects = this.state.effects.filter(effect => 
      now - effect.startTime < effect.duration
    );
    this.state.stimulants = this.state.stimulants.filter(stim =>
      now - stim.appliedAt < stim.duration
    );
  }

  private clearEffects(): void {
    this.state.effects = [];
  }

  // Start focus regeneration
  private startRegeneration(): void {
    setInterval(() => {
      this.clearExpiredEffects();
      
      // Natural regeneration
      const timeSinceLastAction = Date.now() - this.state.lastAction;
      if (timeSinceLastAction > 5000) { // 5 seconds of inactivity
        const regenAmount = this.state.regenRate;
        this.state.current = Math.min(this.state.maximum, this.state.current + regenAmount);
        
        // Recovery from overload
        if (this.state.isOverloaded && this.state.current > this.state.overloadThreshold * 2) {
          this.state.isOverloaded = false;
          this.state.drainRate = 1;
          this.state.regenRate = 0.5;
        }
      }
    }, 1000);
  }

  // Apply command effects (for UI)
  applyCommandEffects(command: string): string {
    const activeEffects = this.state.effects.filter(effect => 
      Date.now() - effect.startTime < effect.duration
    );

    let modifiedCommand = command;

    activeEffects.forEach(effect => {
      switch (effect.type) {
        case 'typo_injection':
          if (Math.random() < effect.severity * 0.1) {
            modifiedCommand = this.injectTypos(modifiedCommand);
          }
          break;
        case 'command_delay':
          // This would be handled by the UI with setTimeout
          break;
        case 'hallucination':
          // This would modify terminal output
          break;
      }
    });

    return modifiedCommand;
  }

  private injectTypos(command: string): string {
    if (command.length < 3) return command;
    
    const chars = command.split('');
    const typoIndex = Math.floor(Math.random() * chars.length);
    
    // Random character substitution
    const randomChar = String.fromCharCode(97 + Math.floor(Math.random() * 26));
    chars[typoIndex] = randomChar;
    
    return chars.join('');
  }

  // Get current state
  getState(): FocusState {
    this.clearExpiredEffects();
    return { ...this.state };
  }

  // Get active effects
  getActiveEffects(): FocusEffect[] {
    return this.state.effects.filter(effect => 
      Date.now() - effect.startTime < effect.duration
    );
  }

  // Get focus percentage
  getFocusPercentage(): number {
    return (this.state.current / this.state.maximum) * 100;
  }

  // Check if action should be delayed
  getCommandDelay(): number {
    const delayEffects = this.state.effects.filter(effect => 
      effect.type === 'command_delay' && 
      Date.now() - effect.startTime < effect.duration
    );

    if (delayEffects.length === 0) return 0;

    const maxSeverity = Math.max(...delayEffects.map(e => e.severity));
    return maxSeverity * 500; // 500ms per severity point
  }

  // Reset focus (for testing or special events)
  resetFocus(): void {
    this.state.current = this.state.maximum;
    this.state.isOverloaded = false;
    this.state.effects = [];
    this.state.stimulants = [];
    this.state.drainRate = 1;
    this.state.regenRate = 0.5;
  }
}

// Export singleton instance
export const focusSystem = new FocusSystem(); 