import { GameState } from '../types/game';

export interface EasterEgg {
  id: string;
  name: string;
  description: string;
  trigger: string | string[]; // Command or sequence that triggers it
  type: 'command' | 'sequence' | 'hidden_file' | 'konami' | 'time_based';
  discovered: boolean;
  reward: {
    credits?: number;
    reputation?: string;
    unlockedCommands?: string[];
    specialItems?: string[];
    achievement?: string;
    secretMessage?: string;
  };
  hint?: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export const easterEggs: Record<string, EasterEgg> = {
  // Hidden Commands
  matrix: {
    id: 'matrix',
    name: 'The Matrix',
    description: 'Follow the white rabbit...',
    trigger: 'matrix',
    type: 'command',
    discovered: false,
    reward: {
      credits: 1337,
      achievement: 'Matrix Walker',
      secretMessage: 'Welcome to the real world, Neo.'
    },
    hint: 'Try typing a famous movie reference',
    rarity: 'rare'
  },

  konami: {
    id: 'konami',
    name: 'Konami Code',
    description: 'The legendary cheat code',
    trigger: ['up', 'up', 'down', 'down', 'left', 'right', 'left', 'right', 'b', 'a'],
    type: 'konami',
    discovered: false,
    reward: {
      credits: 30000,
      unlockedCommands: ['godmode'],
      achievement: 'Code Warrior',
      secretMessage: '30 lives! Wait, wrong game...'
    },
    hint: 'Arrow keys and letters hold power',
    rarity: 'legendary'
  },

  leet: {
    id: 'leet',
    name: '1337 Speak',
    description: 'Speak the language of hackers',
    trigger: '1337',
    type: 'command',
    discovered: false,
    reward: {
      credits: 1337,
      specialItems: ['Elite Badge'],
      achievement: 'L33T H4X0R'
    },
    hint: 'Numbers have meaning in hacker culture',
    rarity: 'common'
  },

  caffeine: {
    id: 'caffeine',
    name: 'Caffeine Fix',
    description: 'Every hacker needs their fuel',
    trigger: 'coffee',
    type: 'command',
    discovered: false,
    reward: {
      credits: 500,
      secretMessage: 'You feel more alert. Typing speed increased!'
    },
    hint: 'What keeps programmers awake?',
    rarity: 'common'
  },

  midnight: {
    id: 'midnight',
    name: 'Midnight Hacker',
    description: 'Some secrets only reveal themselves in darkness',
    trigger: 'midnight_scan',
    type: 'time_based',
    discovered: false,
    reward: {
      credits: 2000,
      unlockedCommands: ['shadow_net'],
      achievement: 'Night Owl',
      secretMessage: 'The shadows whisper secrets...'
    },
    hint: 'Late night sessions reveal hidden networks',
    rarity: 'epic'
  },

  binary: {
    id: 'binary',
    name: 'Binary Prophet',
    description: 'Speak in the language of machines',
    trigger: '01001000 01100101 01101100 01101100 01101111',
    type: 'command',
    discovered: false,
    reward: {
      credits: 2048,
      specialItems: ['Binary Decoder'],
      achievement: 'Binary Fluent'
    },
    hint: 'Machines speak in ones and zeros',
    rarity: 'rare'
  },

  answer: {
    id: 'answer',
    name: 'The Answer',
    description: 'To the ultimate question of life, universe, and everything',
    trigger: '42',
    type: 'command',
    discovered: false,
    reward: {
      credits: 4200,
      achievement: 'Deep Thought',
      secretMessage: "Don't panic! You've found the answer to everything."
    },
    hint: 'What is the meaning of life?',
    rarity: 'epic'
  },

  root: {
    id: 'root',
    name: 'Root Access',
    description: 'The ultimate privilege escalation',
    trigger: ['sudo', 'su', 'root'],
    type: 'sequence',
    discovered: false,
    reward: {
      credits: 5000,
      unlockedCommands: ['admin_panel'],
      reputation: 'ELITE',
      achievement: 'Root Master'
    },
    hint: 'Elevation of privileges requires the right sequence',
    rarity: 'legendary'
  },

  whale: {
    id: 'whale',
    name: 'Docker Whale',
    description: 'Container magic',
    trigger: 'docker run hello-world',
    type: 'command',
    discovered: false,
    reward: {
      credits: 1000,
      specialItems: ['Container Badge'],
      achievement: 'Containerized'
    },
    hint: 'Containerization is the future',
    rarity: 'rare'
  },

  vim: {
    id: 'vim',
    name: 'Vim Master',
    description: 'Exit the inescapable editor',
    trigger: ':wq',
    type: 'command',
    discovered: false,
    reward: {
      credits: 777,
      achievement: 'Vim Escapist',
      secretMessage: 'You have successfully exited vim. Achievement unlocked!'
    },
    hint: 'How do you exit the legendary editor?',
    rarity: 'rare'
  }
};

// Sequence tracking for multi-command easter eggs
let commandSequence: string[] = [];
let konamiSequence: string[] = [];

export function checkEasterEgg(command: string, gameState: GameState): EasterEgg | null {
  const normalizedCommand = command.toLowerCase().trim();
  
  // Check single command easter eggs
  for (const egg of Object.values(easterEggs)) {
    if (egg.discovered) continue;
    
    if (egg.type === 'command' && typeof egg.trigger === 'string') {
      if (normalizedCommand === egg.trigger.toLowerCase()) {
        return egg;
      }
    }
    
    // Check binary easter egg (special case)
    if (egg.id === 'binary' && command.trim() === egg.trigger) {
      return egg;
    }
  }
  
  // Track command sequences
  commandSequence.push(normalizedCommand);
  if (commandSequence.length > 10) {
    commandSequence = commandSequence.slice(-10);
  }
  
  // Check sequence-based easter eggs
  for (const egg of Object.values(easterEggs)) {
    if (egg.discovered || egg.type !== 'sequence') continue;
    
    if (Array.isArray(egg.trigger)) {
      const triggerSequence = egg.trigger.map(t => t.toLowerCase());
      if (commandSequence.slice(-triggerSequence.length).join(',') === triggerSequence.join(',')) {
        return egg;
      }
    }
  }
  
  return null;
}

export function checkKonamiCode(key: string): EasterEgg | null {
  const konamiPattern = ['arrowup', 'arrowup', 'arrowdown', 'arrowdown', 
                        'arrowleft', 'arrowright', 'arrowleft', 'arrowright', 'keyb', 'keya'];
  
  konamiSequence.push(key.toLowerCase());
  if (konamiSequence.length > konamiPattern.length) {
    konamiSequence = konamiSequence.slice(-konamiPattern.length);
  }
  
  if (konamiSequence.length === konamiPattern.length && 
      konamiSequence.join(',') === konamiPattern.join(',')) {
    const egg = easterEggs.konami;
    if (!egg.discovered) {
      konamiSequence = []; // Reset sequence
      return egg;
    }
  }
  
  return null;
}

export function checkTimeBasedEasterEggs(gameState: GameState): EasterEgg | null {
  const now = new Date();
  const hour = now.getHours();
  
  // Midnight easter egg (11 PM to 1 AM)
  if ((hour >= 23 || hour <= 1) && !easterEggs.midnight.discovered) {
    return easterEggs.midnight;
  }
  
  return null;
}

export function discoverEasterEgg(eggId: string): void {
  if (easterEggs[eggId]) {
    easterEggs[eggId].discovered = true;
    // Save to localStorage
    const discovered = getDiscoveredEasterEggs();
    discovered.push(eggId);
    localStorage.setItem('roguesim_easter_eggs', JSON.stringify(discovered));
  }
}

export function getDiscoveredEasterEggs(): string[] {
  const stored = localStorage.getItem('roguesim_easter_eggs');
  return stored ? JSON.parse(stored) : [];
}

export function loadDiscoveredEasterEggs(): void {
  const discovered = getDiscoveredEasterEggs();
  discovered.forEach(eggId => {
    if (easterEggs[eggId]) {
      easterEggs[eggId].discovered = true;
    }
  });
}

export function getEasterEggHints(): string[] {
  return Object.values(easterEggs)
    .filter(egg => !egg.discovered && egg.hint)
    .map(egg => `💡 ${egg.hint}`)
    .slice(0, 3); // Show max 3 hints
}

export function getEasterEggStats(): { total: number; discovered: number; remaining: number } {
  const total = Object.keys(easterEggs).length;
  const discovered = Object.values(easterEggs).filter(egg => egg.discovered).length;
  return {
    total,
    discovered,
    remaining: total - discovered
  };
}