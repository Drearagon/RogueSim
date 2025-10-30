import { Mission, SpecialMission, MissionObjective } from '../types/game';

// Standard Missions - Available to all players
export const standardMissions: Mission[] = [
  {
    id: 'tutorial_scan',
    title: 'Network Discovery',
    description: 'Learn the basics of network scanning and reconnaissance.',
    briefing: 'Welcome to the underground, hacker. Your first task is simple: learn to see what others cannot. Use the scan command to discover nearby networks and begin your journey into the digital shadows.',
    difficulty: 'TRIVIAL',
    category: 'RECONNAISSANCE',
    type: 'STANDARD',
    requiredLevel: 1,
    creditReward: 100,
    experienceReward: 50,
    isRepeatable: false,
    objectives: [
      {
        id: 'scan_wifi',
        description: 'Scan for WiFi networks',
        type: 'COMMAND',
        command: 'scan wifi',
        completed: false
      },
      {
        id: 'scan_ble',
        description: 'Scan for Bluetooth devices',
        type: 'COMMAND',
        command: 'scan ble',
        completed: false
      }
    ],
    unlocks: ['connect', 'status'],
    loreText: 'Every hacker starts somewhere. Today, you take your first step into a larger world.'
  },

  {
    id: 'first_infiltration',
    title: 'Digital Trespassing',
    description: 'Perform your first network infiltration and establish a foothold.',
    briefing: 'Time to get your hands dirty. Target: a small corporate network with basic security. Your mission: get in, establish persistence, and get out without triggering alarms.',
    difficulty: 'EASY',
    category: 'INFILTRATION',
    type: 'STANDARD',
    requiredLevel: 2,
    creditReward: 300,
    experienceReward: 100,
    reputationReward: 10,
    isRepeatable: false,
    maxSuspicion: 50,
    objectives: [
      {
        id: 'connect_target',
        description: 'Connect to target network',
        type: 'COMMAND',
        command: 'connect',
        completed: false
      },
      {
        id: 'inject_payload',
        description: 'Deploy basic payload',
        type: 'COMMAND',
        command: 'inject payload',
        completed: false
      },
      {
        id: 'maintain_stealth',
        description: 'Keep suspicion below 50%',
        type: 'CONDITION',
        condition: 'suspicion < 50',
        completed: false
      }
    ],
    unlocks: ['inject', 'stealth_mode'],
    consequences: ['Corporate security protocols updated', 'Your digital signature is now in their logs']
  },

  {
    id: 'data_heist',
    title: 'Corporate Espionage',
    description: 'Steal sensitive corporate data from a medium-security network.',
    briefing: 'A client needs financial records from MidCorp Industries. The pay is good, but their security is tighter than your last target. Use advanced techniques and stay invisible.',
    difficulty: 'MEDIUM',
    category: 'EXTRACTION',
    type: 'STANDARD',
    requiredLevel: 5,
    creditReward: 750,
    experienceReward: 200,
    reputationReward: 25,
    skillPointReward: 1,
    isRepeatable: true,
    cooldownHours: 24,
    timeLimit: 600, // 10 minutes
    stealthRequired: true,
    maxSuspicion: 30,
    objectives: [
      {
        id: 'bypass_firewall',
        description: 'Bypass corporate firewall',
        type: 'COMMAND',
        command: 'bypass firewall',
        completed: false
      },
      {
        id: 'locate_database',
        description: 'Find the financial database',
        type: 'COMMAND',
        command: 'scan database',
        completed: false
      },
      {
        id: 'extract_data',
        description: 'Extract financial records',
        type: 'COMMAND',
        command: 'extract data',
        completed: false
      },
      {
        id: 'clean_traces',
        description: 'Remove evidence of intrusion',
        type: 'COMMAND',
        command: 'clean logs',
        completed: false
      }
    ],
    unlocks: ['bypass', 'extract', 'clean'],
    itemRewards: ['encrypted_drive', 'corporate_keycard'],
    factionReputationChanges: {
      'serpent_syndicate': 15,
      'crimson_circuit': -5
    }
  },

  {
    id: 'bank_heist',
    title: 'Digital Bank Robbery',
    description: 'Infiltrate a major bank\'s systems and transfer funds to offshore accounts.',
    briefing: 'This is the big leagues. National Bank\'s quantum-encrypted systems have never been breached. Your reputation depends on this. One mistake and you\'ll have federal agents at your door.',
    difficulty: 'HARD',
    category: 'INFILTRATION',
    type: 'STANDARD',
    requiredLevel: 10,
    requiredSkills: ['advanced_encryption', 'quantum_bypass'],
    creditReward: 2500,
    experienceReward: 500,
    reputationReward: 100,
    skillPointReward: 3,
    isRepeatable: false,
    timeLimit: 1200, // 20 minutes
    stealthRequired: true,
    maxSuspicion: 20,
    objectives: [
      {
        id: 'quantum_decrypt',
        description: 'Break quantum encryption',
        type: 'COMMAND',
        command: 'decrypt quantum',
        completed: false
      },
      {
        id: 'access_vault',
        description: 'Access digital vault systems',
        type: 'COMMAND',
        command: 'access vault',
        completed: false
      },
      {
        id: 'transfer_funds',
        description: 'Transfer funds to offshore accounts',
        type: 'COMMAND',
        command: 'transfer funds',
        completed: false
      },
      {
        id: 'create_alibi',
        description: 'Plant false evidence',
        type: 'COMMAND',
        command: 'plant evidence',
        completed: false
      }
    ],
    unlocks: ['quantum_tools', 'offshore_banking', 'evidence_planting'],
    consequences: [
      'Federal investigation launched',
      'Banking security protocols worldwide updated',
      'Your legend grows in the underground'
    ]
  },

  {
    id: 'offensive_bootcamp',
    title: 'Offensive Bootcamp',
    description: 'Practice exploitation basics in a controlled environment.',
    briefing: 'Hone your offensive skills against simulated targets.',
    difficulty: 'EASY',
    category: 'INFILTRATION',
    type: 'STANDARD',
    requiredLevel: 2,
    creditReward: 150,
    experienceReward: 75,
    skillPointReward: 1,
    isRepeatable: true,
    objectives: [
      {
        id: 'exploit_training',
        description: 'Run a basic exploit',
        type: 'COMMAND',
        command: 'exploit',
        completed: false
      },
      {
        id: 'escalate_training',
        description: 'Escalate privileges',
        type: 'COMMAND',
        command: 'escalate',
        completed: false
      }
    ],
    unlocks: ['exploit', 'escalate']
  },

  {
    id: 'defensive_drill',
    title: 'Defensive Systems Drill',
    description: 'Test your defensive protocols against incoming attacks.',
    briefing: 'Stop simulated intrusions and secure the system.',
    difficulty: 'EASY',
    category: 'EXTRACTION',
    type: 'STANDARD',
    requiredLevel: 2,
    creditReward: 150,
    experienceReward: 75,
    skillPointReward: 1,
    isRepeatable: true,
    objectives: [
      {
        id: 'deploy_defenses',
        description: 'Activate basic defenses',
        type: 'COMMAND',
        command: 'defend',
        completed: false
      },
      {
        id: 'analyze_logs',
        description: 'Analyze intrusion logs',
        type: 'COMMAND',
        command: 'analyze logs',
        completed: false
      }
    ],
    unlocks: ['defend', 'analyze']
  },

  {
    id: 'social_training',
    title: 'Social Engineering 101',
    description: 'Learn fundamental manipulation techniques.',
    briefing: 'Practice phishing and persuasion on volunteer targets.',
    difficulty: 'EASY',
    category: 'SOCIAL_ENGINEERING',
    type: 'STANDARD',
    requiredLevel: 2,
    creditReward: 150,
    experienceReward: 75,
    skillPointReward: 1,
    isRepeatable: true,
    objectives: [
      {
        id: 'gather_info',
        description: 'Gather basic intel',
        type: 'COMMAND',
        command: 'gather intel',
        completed: false
      },
      {
        id: 'phish_target',
        description: 'Send a phishing email',
        type: 'COMMAND',
        command: 'phish',
        completed: false
      }
    ],
    unlocks: ['phish', 'social_engineering']
  },

  {
    id: 'government_breach',
    title: 'Shadow Government',
    description: 'Infiltrate classified government systems to uncover hidden operations.',
    briefing: 'The deepest secrets lie in the most protected systems. Government black sites, classified operations, the truth behind the headlines. This mission will change everything you know.',
    difficulty: 'BRUTAL',
    category: 'SPECIAL_OPS',
    type: 'STANDARD',
    requiredLevel: 15,
    requiredSkills: ['government_protocols', 'ai_warfare', 'quantum_stealth'],
    creditReward: 5000,
    experienceReward: 1000,
    reputationReward: 250,
    skillPointReward: 5,
    isRepeatable: false,
    timeLimit: 1800, // 30 minutes
    stealthRequired: true,
    maxSuspicion: 10,
    objectives: [
      {
        id: 'infiltrate_mainframe',
        description: 'Penetrate government mainframe',
        type: 'COMMAND',
        command: 'infiltrate mainframe',
        completed: false
      },
      {
        id: 'defeat_ai_guardian',
        description: 'Defeat AI security system',
        type: 'COMBAT',
        command: 'battle ai',
        completed: false
      },
      {
        id: 'access_classified',
        description: 'Access classified files',
        type: 'COMMAND',
        command: 'access classified',
        completed: false
      },
      {
        id: 'escape_detection',
        description: 'Escape without triggering alerts',
        type: 'STEALTH',
        condition: 'suspicion < 10',
        completed: false
      }
    ],
    unlocks: ['government_access', 'ai_warfare', 'classified_intel'],
    consequences: [
      'You now know too much',
      'Government agencies are aware of your existence',
      'The Shadow Organization takes notice'
    ]
  }
];

// Faction-Specific Missions
export const factionMissions: Mission[] = [
  // Serpent Syndicate Missions
  {
    id: 'serpent_stealth_training',
    title: 'Ghost Protocol Training',
    description: 'Master the art of digital invisibility.',
    briefing: 'The Serpent Syndicate values those who can move unseen. Prove your stealth capabilities by completing this training exercise without detection.',
    difficulty: 'EASY',
    category: 'INFILTRATION',
    type: 'FACTION',
    requiredLevel: 3,
    requiredFaction: 'serpent_syndicate',
    creditReward: 400,
    experienceReward: 150,
    reputationReward: 30,
    isRepeatable: true,
    cooldownHours: 12,
    stealthRequired: true,
    maxSuspicion: 5,
    objectives: [
      {
        id: 'stealth_scan',
        description: 'Perform passive reconnaissance',
        type: 'COMMAND',
        command: 'scan --passive',
        completed: false
      },
      {
        id: 'ghost_connect',
        description: 'Connect without leaving traces',
        type: 'COMMAND',
        command: 'connect --ghost',
        completed: false
      },
      {
        id: 'silent_extract',
        description: 'Extract data silently',
        type: 'COMMAND',
        command: 'extract --silent',
        completed: false
      }
    ],
    factionReputationChanges: {
      'serpent_syndicate': 50
    },
    unlocks: ['ghost_mode', 'silent_tools']
  },

  // Crimson Circuit Missions
  {
    id: 'crimson_assault_training',
    title: 'Digital Warfare Basics',
    description: 'Learn the Crimson Circuit way: overwhelming force.',
    briefing: 'Subtlety is for the weak. The Crimson Circuit believes in decisive action and overwhelming firepower. Show us your destructive potential.',
    difficulty: 'EASY',
    category: 'CYBER_WARFARE',
    type: 'FACTION',
    requiredLevel: 3,
    requiredFaction: 'crimson_circuit',
    creditReward: 500,
    experienceReward: 150,
    reputationReward: 30,
    isRepeatable: true,
    cooldownHours: 12,
    objectives: [
      {
        id: 'aggressive_scan',
        description: 'Perform aggressive network scan',
        type: 'COMMAND',
        command: 'scan --aggressive',
        completed: false
      },
      {
        id: 'brute_force',
        description: 'Brute force target system',
        type: 'COMMAND',
        command: 'brute force',
        completed: false
      },
      {
        id: 'system_damage',
        description: 'Cause system damage',
        type: 'COMMAND',
        command: 'damage system',
        completed: false
      }
    ],
    factionReputationChanges: {
      'crimson_circuit': 50,
      'serpent_syndicate': -10
    },
    unlocks: ['brute_force_tools', 'system_damage']
  },

  // Mirage Loop Missions
  {
    id: 'mirage_social_engineering',
    title: 'The Art of Deception',
    description: 'Master social engineering and human manipulation.',
    briefing: 'The greatest security system is the human mind, and the greatest weakness is human nature. Learn to exploit both.',
    difficulty: 'MEDIUM',
    category: 'SOCIAL_ENGINEERING',
    type: 'FACTION',
    requiredLevel: 4,
    requiredFaction: 'mirage_loop',
    creditReward: 600,
    experienceReward: 200,
    reputationReward: 40,
    isRepeatable: true,
    cooldownHours: 18,
    objectives: [
      {
        id: 'gather_intel',
        description: 'Gather personal information on targets',
        type: 'COMMAND',
        command: 'gather intel',
        completed: false
      },
      {
        id: 'craft_phishing',
        description: 'Create convincing phishing campaign',
        type: 'COMMAND',
        command: 'craft phishing',
        completed: false
      },
      {
        id: 'manipulate_target',
        description: 'Successfully manipulate target',
        type: 'COMMAND',
        command: 'social engineer',
        completed: false
      }
    ],
    factionReputationChanges: {
      'mirage_loop': 50
    },
    unlocks: ['social_engineering', 'phishing_tools', 'psychological_profiles']
  }
];

// Special Missions - Unique gameplay experiences
export const specialMissions: SpecialMission[] = [
  {
    id: 'terminal_takeover',
    title: 'System Override',
    description: 'Take complete control of a corporate network in real-time.',
    briefing: 'This isn\'t just hacking - this is digital warfare. You\'ll be fighting their AI security system in real-time while maintaining control of critical systems.',
    difficulty: 'HARD',
    category: 'CYBER_WARFARE',
    type: 'SPECIAL',
    specialType: 'TERMINAL_TAKEOVER',
    requiredLevel: 8,
    creditReward: 1500,
    experienceReward: 400,
    reputationReward: 75,
    skillPointReward: 2,
    isRepeatable: true,
    cooldownHours: 48,
    timeLimit: 900, // 15 minutes
    objectives: [
      {
        id: 'gain_admin',
        description: 'Gain administrator access',
        type: 'COMMAND',
        command: 'escalate privileges',
        completed: false
      },
      {
        id: 'control_systems',
        description: 'Take control of critical systems',
        type: 'COMMAND',
        command: 'control systems',
        completed: false
      },
      {
        id: 'defend_access',
        description: 'Defend against AI countermeasures',
        type: 'COMBAT',
        command: 'defend',
        completed: false
      }
    ],
    customInterface: {
      backgroundColor: '#0a0a0a',
      textColor: '#ff0000',
      accentColor: '#ff4444',
      effects: ['glitch', 'scan_lines']
    },
    customCommands: ['override', 'countermeasure', 'system_control'],
    environmentChanges: {
      terminalTheme: 'hostile_takeover',
      soundEffects: ['alarm', 'system_breach', 'ai_voice'],
      visualEffects: ['red_alert', 'system_warnings']
    },
    realTimeElements: {
      countdown: true,
      progressBars: true,
      liveUpdates: true,
      interactiveElements: true
    },
    dynamicEnvironment: true
  },

  {
    id: 'pulsebreak_protocol',
    title: 'Pulsebreak Protocol',
    description: 'Synchronize with a volatile network pulse to hijack live data streams in real-time.',
    briefing: 'A rival collective is siphoning crypto markets using a pulse-synced exploit. Slip into the live stream, desync their timing, and reroute the payload before they notice.',
    difficulty: 'MEDIUM',
    category: 'CYBER_WARFARE',
    type: 'SPECIAL',
    specialType: 'REAL_TIME_HACK',
    requiredLevel: 7,
    creditReward: 900,
    experienceReward: 260,
    reputationReward: 40,
    skillPointReward: 1,
    isRepeatable: true,
    cooldownHours: 36,
    timeLimit: 600, // 10 minutes
    objectives: [
      {
        id: 'sync_with_pulse',
        description: 'Match the hostile network\'s pulse timing',
        type: 'TIME_BASED',
        command: 'synchronize pulse',
        completed: false
      },
      {
        id: 'reroute_payload',
        description: 'Hijack and reroute the live exploit payload',
        type: 'COMMAND',
        command: 'reroute payload',
        completed: false
      },
      {
        id: 'stabilize_stream',
        description: 'Stabilize your foothold before the stream resets',
        type: 'CONDITION',
        condition: 'stability >= 80%',
        completed: false
      }
    ],
    customInterface: {
      backgroundColor: '#061229',
      textColor: '#8dfffb',
      accentColor: '#ffb347',
      effects: ['waveform_overlay', 'latency_counter']
    },
    customCommands: ['pulse_sync', 'payload_reroute', 'stream_lock'],
    environmentChanges: {
      terminalTheme: 'real_time_flux',
      soundEffects: ['pulse_tick', 'bandwidth_surge'],
      visualEffects: ['data_wave', 'pulse_shift']
    },
    realTimeElements: {
      countdown: true,
      progressBars: true,
      liveUpdates: true,
      interactiveElements: true
    }
  },

  {
    id: 'hollow_step_infiltration',
    title: 'Hollow Step Infiltration',
    description: 'Ghost through a corporate arcology undetected to plant a quantum sniffer.',
    briefing: 'A megacorp has gone dark to everyone but themselves. Slip through their internal mesh, plant a sniffer in the executive loop, and leave without their sentries ever flagging your presence.',
    difficulty: 'MEDIUM',
    category: 'INFILTRATION',
    type: 'SPECIAL',
    specialType: 'STEALTH_INFILTRATION',
    requiredLevel: 5,
    creditReward: 800,
    experienceReward: 220,
    reputationReward: 35,
    isRepeatable: true,
    cooldownHours: 24,
    timeLimit: 900, // 15 minutes
    stealthRequired: true,
    maxSuspicion: 25,
    objectives: [
      {
        id: 'mask_signature',
        description: 'Mask your digital signature with executive credentials',
        type: 'STEALTH',
        command: 'cloak signature',
        completed: false
      },
      {
        id: 'navigate_mesh',
        description: 'Traverse the internal mesh without triggering motion heuristics',
        type: 'STEALTH',
        command: 'ghost step',
        completed: false
      },
      {
        id: 'plant_sniffer',
        description: 'Install the quantum sniffer in the executive loop',
        type: 'COMMAND',
        command: 'plant sniffer',
        completed: false
      }
    ],
    customInterface: {
      backgroundColor: '#020d0a',
      textColor: '#9fffe0',
      accentColor: '#3ddc97',
      effects: ['heartbeat_monitor', 'ambient_particles']
    },
    customCommands: ['ghost_step', 'scent_mask', 'sniffer_deploy'],
    environmentChanges: {
      terminalTheme: 'silent_infiltration',
      soundEffects: ['muffled_steps', 'whispered_status'],
      visualEffects: ['low_light', 'sensor_overlay']
    },
    realTimeElements: {
      countdown: true,
      progressBars: true,
      liveUpdates: true
    }
  },

  {
    id: 'velvet_conclave',
    title: 'Velvet Conclave',
    description: 'Conduct a social-engineering offensive to manipulate a syndicate vote.',
    briefing: 'The Velvet Conclave meet tonight to decide who controls the docks. Posing as a trusted fixer, influence the delegates, leak falsified intel, and steer the vote without revealing your hand.',
    difficulty: 'MEDIUM',
    category: 'SOCIAL_ENGINEERING',
    type: 'SPECIAL',
    specialType: 'SOCIAL_MANIPULATION',
    requiredLevel: 6,
    creditReward: 1000,
    experienceReward: 280,
    reputationReward: 50,
    isRepeatable: false,
    cooldownHours: 72,
    objectives: [
      {
        id: 'assume_identity',
        description: 'Assume the fixer identity and gain access to the chamber',
        type: 'CHOICE',
        command: 'select persona',
        completed: false
      },
      {
        id: 'sway_delegate',
        description: 'Convince a neutral delegate to back your client',
        type: 'CHOICE',
        command: 'leverage dossier',
        completed: false
      },
      {
        id: 'plant_evidence',
        description: 'Leak falsified intel to discredit the opposition',
        type: 'COMMAND',
        command: 'release intel',
        completed: false
      }
    ],
    customInterface: {
      backgroundColor: '#1a0f23',
      textColor: '#f4d9ff',
      accentColor: '#c084fc',
      fontFamily: '"Playfair Display", serif',
      effects: ['holographic_overlay', 'soft_glow']
    },
    customCommands: ['persona_select', 'influence', 'intel_release'],
    environmentChanges: {
      terminalTheme: 'gala_suite',
      backgroundMusic: 'lounge_noir',
      soundEffects: ['glass_clink', 'hushed_whispers'],
      visualEffects: ['ambient_particles', 'delegate_highlights']
    },
    realTimeElements: {
      countdown: false,
      progressBars: true,
      liveUpdates: true,
      interactiveElements: true
    }
  },

  {
    id: 'ai_battle',
    title: 'Neural Network Warfare',
    description: 'Engage in direct combat with an advanced AI system.',
    briefing: 'The target has deployed a military-grade AI guardian. This isn\'t about stealth anymore - it\'s about proving that human ingenuity can overcome artificial intelligence.',
    difficulty: 'BRUTAL',
    category: 'CYBER_WARFARE',
    type: 'SPECIAL',
    specialType: 'AI_BATTLE',
    requiredLevel: 12,
    requiredSkills: ['ai_warfare', 'neural_hacking'],
    creditReward: 3000,
    experienceReward: 750,
    reputationReward: 150,
    skillPointReward: 4,
    isRepeatable: true,
    cooldownHours: 72,
    timeLimit: 1200, // 20 minutes
    objectives: [
      {
        id: 'analyze_ai',
        description: 'Analyze AI behavior patterns',
        type: 'COMMAND',
        command: 'analyze ai',
        completed: false
      },
      {
        id: 'deploy_virus',
        description: 'Deploy neural virus',
        type: 'COMBAT',
        command: 'deploy virus',
        completed: false
      },
      {
        id: 'defeat_ai',
        description: 'Defeat the AI guardian',
        type: 'COMBAT',
        command: 'neural attack',
        completed: false
      }
    ],
    customInterface: {
      backgroundColor: '#001122',
      textColor: '#00ffff',
      accentColor: '#0088ff',
      effects: ['neural_network', 'data_streams']
    },
    customCommands: ['neural_attack', 'ai_analyze', 'virus_deploy', 'mind_hack'],
    environmentChanges: {
      terminalTheme: 'neural_warfare',
      soundEffects: ['ai_processing', 'neural_feedback', 'data_corruption'],
      visualEffects: ['neural_patterns', 'ai_consciousness', 'digital_synapses']
    },
    realTimeElements: {
      countdown: true,
      progressBars: true,
      liveUpdates: true,
      interactiveElements: true
    },
    dynamicEnvironment: true
  }
];

// Emergency Missions - Time-sensitive, high-reward missions
export const emergencyMissions: Mission[] = [
  {
    id: 'data_breach_response',
    title: 'Emergency Data Recovery',
    description: 'A client\'s systems have been compromised. Recover their data before it\'s destroyed.',
    briefing: 'URGENT: Corporate client under active attack. Their financial data is being systematically destroyed. You have 10 minutes to get in, recover what you can, and get out.',
    difficulty: 'HARD',
    category: 'EXTRACTION',
    type: 'EMERGENCY',
    requiredLevel: 7,
    creditReward: 2000,
    experienceReward: 500,
    reputationReward: 100,
    skillPointReward: 2,
    isRepeatable: false,
    timeLimit: 600, // 10 minutes
    availableFrom: Date.now(),
    availableUntil: Date.now() + (2 * 60 * 60 * 1000), // Available for 2 hours
    objectives: [
      {
        id: 'emergency_access',
        description: 'Gain emergency access to compromised systems',
        type: 'COMMAND',
        command: 'emergency access',
        completed: false
      },
      {
        id: 'locate_data',
        description: 'Locate undamaged data stores',
        type: 'COMMAND',
        command: 'scan data',
        completed: false
      },
      {
        id: 'rapid_extraction',
        description: 'Extract data before destruction',
        type: 'TIME_BASED',
        command: 'extract --priority',
        completed: false
      }
    ],
    unlocks: ['emergency_protocols', 'rapid_extraction'],
    consequences: ['Client relationship improved', 'Emergency response reputation gained']
  }
];

// Mission difficulty multipliers for rewards
export const difficultyMultipliers = {
  'TRIVIAL': 0.5,
  'EASY': 1.0,
  'MEDIUM': 1.5,
  'HARD': 2.0,
  'BRUTAL': 3.0,
  'LEGENDARY': 5.0
};

// Get all available missions for a player
export function getAvailableMissions(gameState: any): Mission[] {
  const allMissions = [
    ...standardMissions,
    ...factionMissions,
    ...specialMissions,
    ...emergencyMissions
  ];

  return allMissions.filter(mission => {
    // Check level requirement
    if (mission.requiredLevel > gameState.playerLevel) return false;

    // Check faction requirement
    if (mission.requiredFaction && gameState.activeFaction !== mission.requiredFaction) return false;

    // Check if already completed (for non-repeatable missions)
    if (!mission.isRepeatable && gameState.completedMissionIds?.includes(mission.id)) return false;

    // Check cooldown
    if (mission.cooldownHours && gameState.missionCooldowns?.[mission.id]) {
      const cooldownEnd = gameState.missionCooldowns[mission.id] + (mission.cooldownHours * 60 * 60 * 1000);
      if (Date.now() < cooldownEnd) return false;
    }

    // Check availability window for emergency missions
    if (mission.type === 'EMERGENCY') {
      const now = Date.now();
      if (mission.availableFrom && now < mission.availableFrom) return false;
      if (mission.availableUntil && now > mission.availableUntil) return false;
    }

    // Check required skills
    if (mission.requiredSkills) {
      const playerSkills = gameState.skillTree?.nodes?.filter((n: any) => n.purchased).map((n: any) => n.id) || [];
      if (!mission.requiredSkills.every(skill => playerSkills.includes(skill))) return false;
    }

    // Check required items
    if (mission.requiredItems) {
      const playerItems = [
        ...(gameState.inventory?.hardware || []),
        ...(gameState.inventory?.software || []),
        ...(gameState.inventory?.payloads || [])
      ];
      if (!mission.requiredItems.every(item => playerItems.includes(item))) return false;
    }

    return true;
  });
}

// Get missions by category
export function getMissionsByCategory(category: string, gameState: any): Mission[] {
  return getAvailableMissions(gameState).filter(mission => mission.category === category);
}

// Get missions by difficulty
export function getMissionsByDifficulty(difficulty: string, gameState: any): Mission[] {
  return getAvailableMissions(gameState).filter(mission => mission.difficulty === difficulty);
}

// Get special missions
export function getSpecialMissions(gameState: any): SpecialMission[] {
  return getAvailableMissions(gameState).filter(mission => mission.type === 'SPECIAL') as SpecialMission[];
}

// Generate random emergency mission
export function generateEmergencyMission(): Mission {
  const emergencyTypes = [
    {
      title: 'System Breach Alert',
      description: 'Respond to an active security breach',
      category: 'CYBER_WARFARE' as const,
      baseReward: 1500
    },
    {
      title: 'Data Recovery Emergency',
      description: 'Recover critical data before it\'s lost',
      category: 'EXTRACTION' as const,
      baseReward: 1200
    },
    {
      title: 'Counter-Intelligence Op',
      description: 'Stop enemy hackers from completing their mission',
      category: 'SABOTAGE' as const,
      baseReward: 1800
    }
  ];

  const type = emergencyTypes[Math.floor(Math.random() * emergencyTypes.length)];
  const difficulties = ['MEDIUM', 'HARD', 'BRUTAL'] as const;
  const difficulty = difficulties[Math.floor(Math.random() * 3)];
  const timeLimit = [300, 600, 900][Math.floor(Math.random() * 3)]; // 5, 10, or 15 minutes

  return {
    id: `emergency_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    title: type.title,
    description: type.description,
    briefing: `URGENT MISSION: ${type.description}. Time is critical - complete objectives before the window closes.`,
    difficulty,
    category: type.category,
    type: 'EMERGENCY',
    requiredLevel: difficulty === 'MEDIUM' ? 5 : difficulty === 'HARD' ? 8 : 12,
    creditReward: Math.floor(type.baseReward * difficultyMultipliers[difficulty]),
    experienceReward: Math.floor(200 * difficultyMultipliers[difficulty]),
    reputationReward: Math.floor(50 * difficultyMultipliers[difficulty]),
    isRepeatable: false,
    timeLimit,
    availableFrom: Date.now(),
    availableUntil: Date.now() + (2 * 60 * 60 * 1000), // Available for 2 hours
    objectives: [
      {
        id: 'emergency_obj_1',
        description: 'Complete primary objective',
        type: 'COMMAND',
        command: 'emergency_action',
        completed: false
      }
    ]
  };
} 