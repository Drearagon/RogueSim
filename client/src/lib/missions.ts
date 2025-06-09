// @ts-nocheck
import { Mission, GameState } from '../types/game';

export const storyMissions: Mission[] = [
  {
    id: 1,
    title: "DATA_BREACH", 
    objective: "Infiltrate secure network and establish persistent backdoor",
    status: "PENDING",
    steps: [
      { 
        id: "scan_wifi",
        command: "scan wifi", 
        completed: false, 
        description: "Discover available networks" 
      },
      { 
        id: "connect_target",
        command: "connect TARGET_NET", 
        completed: false, 
        description: "Connect to target network" 
      },
      { 
        id: "deploy_payload",
        command: "inject payload", 
        completed: false, 
        description: "Deploy basic injection payload" 
      },
      { 
        id: "check_status",
        command: "status", 
        completed: false, 
        description: "Check system status" 
      }
    ],
    reward: 500,
    difficulty: "EASY",
    intel: [
      "• Run 'scan wifi' to discover networks",
      "• Use 'connect TARGET_NET' to join network", 
      "• Execute 'inject payload' to deploy basic tools",
      "• Check 'status' to verify connection",
      "• Use 'complete' command when finished",
      "",
      "💡 Advanced tip: Purchase enhanced payloads from shop for better results"
    ]
  },
  {
    id: 2,
    title: "SHADOW_NETWORK",
    objective: "Establish covert communication channel with Shadow Organization",
    status: "PENDING",
    steps: [
      { 
        id: "scan_ble",
        command: "scan ble", 
        completed: false, 
        description: "Locate Shadow beacons" 
      },
      { 
        id: "spoof_device",
        command: "spoof ble --mac SHADOW_MAC", 
        completed: false, 
        description: "Impersonate trusted device" 
      },
      { 
        id: "init_hydra",
        command: "inject hydra_handshake", 
        completed: false, 
        description: "Initialize Hydra Protocol" 
      },
      { 
        id: "decrypt_messages",
        command: "decrypt shadow_key", 
        completed: false, 
        description: "Decode Shadow messages" 
      }
    ],
    reward: 750,
    difficulty: "MEDIUM",
    intel: [
      "• Shadow Organization uses BLE protocol",
      "• Hydra Protocol encryption required",
      "• Rotating MAC addresses every 60 seconds",
      "• Multiple decoy beacons active"
    ]
  },
  {
    id: 3,
    title: "QUANTUM_BREACH",
    objective: "Breach quantum-encrypted corporate network using advanced algorithms",
    status: "PENDING",
    steps: [
      { 
        id: "scan_quantum",
        command: "scan ports --target QUANTUM_CORP", 
        completed: false, 
        description: "Map corporate infrastructure" 
      },
      { 
        id: "deploy_quantum",
        command: "inject quantum_payload", 
        completed: false, 
        description: "Deploy quantum interference" 
      },
      { 
        id: "bypass_firewall",
        command: "bypass firewall --method HYDRA", 
        completed: false, 
        description: "Circumvent quantum firewall" 
      },
      { 
        id: "extract_data",
        command: "extract --data CLASSIFIED", 
        completed: false, 
        description: "Exfiltrate classified data" 
      }
    ],
    reward: 1200,
    difficulty: "HARD",
    timeLimit: 300, // 5 minutes
    intel: [
      "• Quantum encryption detected",
      "• Advanced AI security system",
      "• Time-sensitive mission",
      "• Corporate counterintelligence active"
    ]
  },
  {
    id: 4,
    title: "CORPORATE_INFILTRATION",
    objective: "Infiltrate MegaCorp's secure network - choose your approach",
    status: "PENDING",
    steps: [
      { 
        id: "recon_phase",
        command: "scan wifi", 
        completed: false, 
        description: "Perform initial reconnaissance" 
      },
      { 
        id: "approach_choice",
        command: "choose", 
        completed: false, 
        description: "Select infiltration method",
        branchPoint: {
          id: "infiltration_method",
          description: "MegaCorp's network has multiple entry points. Choose your approach:",
          choices: [
            {
              id: "stealth_approach",
              text: "Stealth Infiltration",
              description: "Quietly bypass security systems",
              consequences: ["Lower detection risk", "Longer mission time", "Higher skill requirement"],
              nextSteps: ["stealth_scan", "stealth_connect", "stealth_extract"],
              rewardModifier: 1.5,
              suspicionChange: -10
            },
            {
              id: "brute_force",
              text: "Brute Force Attack", 
              description: "Overwhelm their defenses with raw power",
              consequences: ["High detection risk", "Faster completion", "May trigger countermeasures"],
              nextSteps: ["brute_scan", "brute_exploit", "brute_extract"],
              rewardModifier: 1.0,
              suspicionChange: 25
            },
            {
              id: "social_engineering",
              text: "Social Engineering",
              description: "Manipulate employees for access",
              consequences: ["Medium detection risk", "Requires social skills", "Unique intel access"],
              nextSteps: ["social_recon", "social_phish", "social_extract"],
              rewardModifier: 1.3,
              suspicionChange: 5,
              skillRequirement: "social_engineering"
            }
          ],
          timeLimit: 30,
          defaultChoice: "brute_force"
        }
      }
    ],
    reward: 1000,
    dynamicReward: 1000, // Will be modified by choices
    difficulty: "MEDIUM",
    branches: [
      {
        id: "stealth_branch",
        name: "Ghost Protocol",
        description: "Silent infiltration with minimal traces",
        steps: [
          { 
            id: "stealth_scan",
            command: "scan --passive", 
            completed: false, 
            description: "Passive network scanning",
            prerequisites: ["stealth_approach"]
          },
          { 
            id: "stealth_connect",
            command: "connect --stealth TARGET_NET", 
            completed: false, 
            description: "Establish covert connection" 
          },
          { 
            id: "stealth_extract",
            command: "extract_data --silent", 
            completed: false, 
            description: "Silently extract corporate data" 
          }
        ],
        rewardModifier: 1.5,
        difficultyModifier: 1.2
      },
      {
        id: "brute_branch", 
        name: "Shock and Awe",
        description: "Overwhelming force approach",
        steps: [
          { 
            id: "brute_scan",
            command: "nmap --aggressive", 
            completed: false, 
            description: "Aggressive port scanning",
            prerequisites: ["brute_force"]
          },
          { 
            id: "brute_exploit",
            command: "exploit --payload heavy", 
            completed: false, 
            description: "Deploy heavy exploitation payload" 
          },
          { 
            id: "brute_extract",
            command: "extract_data --force", 
            completed: false, 
            description: "Force data extraction" 
          }
        ],
        rewardModifier: 1.0,
        difficultyModifier: 0.8
      },
      {
        id: "social_branch",
        name: "Human Factor",
        description: "Psychological manipulation approach", 
        steps: [
          { 
            id: "social_recon",
            command: "recon --employees", 
            completed: false, 
            description: "Research employee profiles",
            prerequisites: ["social_engineering"]
          },
          { 
            id: "social_phish",
            command: "phish --target ceo@megacorp.com", 
            completed: false, 
            description: "Execute targeted phishing attack" 
          },
          { 
            id: "social_extract",
            command: "extract_data --credentials", 
            completed: false, 
            description: "Use stolen credentials for data access" 
          }
        ],
        rewardModifier: 1.3,
        difficultyModifier: 1.1,
        unlockConditions: ["social_engineering_skill"]
      }
    ],
    intel: [
      "• MegaCorp has multiple security layers",
      "• Choose your approach carefully - it affects the entire mission",
      "• Stealth: Harder but more rewarding",
      "• Brute Force: Fast but risky", 
      "• Social Engineering: Requires special skills"
    ]
  },
  {
    id: 5,
    title: "ZERO_DAY_CRISIS",
    objective: "Stop a zero-day exploit before it spreads globally",
    status: "PENDING", 
    steps: [
      { 
        id: "detect_threat",
        command: "scan --threats", 
        completed: false, 
        description: "Detect the zero-day exploit" 
      },
      { 
        id: "crisis_response",
        command: "choose", 
        completed: false, 
        description: "Choose crisis response strategy",
        branchPoint: {
          id: "crisis_strategy",
          description: "URGENT: Zero-day exploit detected spreading across networks. Immediate action required:",
          choices: [
            {
              id: "contain_spread",
              text: "Contain the Spread",
              description: "Focus on stopping the exploit from spreading further",
              consequences: ["Saves more systems", "Exploit remains active", "Requires coordination"],
              nextSteps: ["isolate_networks", "patch_systems", "monitor_spread"],
              rewardModifier: 1.4,
              suspicionChange: 0
            },
            {
              id: "trace_source",
              text: "Trace the Source", 
              description: "Hunt down the attackers behind the exploit",
              consequences: ["May stop future attacks", "Current spread continues", "High skill requirement"],
              nextSteps: ["trace_origin", "infiltrate_attackers", "neutralize_threat"],
              rewardModifier: 1.6,
              suspicionChange: 15
            },
            {
              id: "reverse_engineer",
              text: "Reverse Engineer",
              description: "Analyze the exploit to create a universal patch",
              consequences: ["Permanent solution", "Takes longer", "Technical expertise required"],
              nextSteps: ["analyze_exploit", "develop_patch", "deploy_fix"],
              rewardModifier: 2.0,
              suspicionChange: -5
            }
          ],
          timeLimit: 20, // Only 20 seconds to decide!
          defaultChoice: "contain_spread"
        }
      }
    ],
    reward: 2000,
    dynamicReward: 2000,
    difficulty: "HARD",
    timeLimit: 600, // 10 minute mission
    intel: [
      "• CRITICAL: Zero-day exploit spreading rapidly",
      "• Time is of the essence - every second counts",
      "• Your choice will affect millions of systems",
      "• Different approaches require different skills"
    ]
  },
  {
    id: 6,
    title: "NEURAL_NEXUS_HEIST",
    objective: "Infiltrate the Neural Nexus AI research facility - a multi-stage operation",
    status: "PENDING",
    steps: [
      { 
        id: "recon_phase",
        command: "scan --deep NEURAL_NEXUS", 
        completed: false, 
        description: "Deep reconnaissance of Neural Nexus facility" 
      },
      { 
        id: "entry_method",
        command: "choose", 
        completed: false, 
        description: "Select infiltration vector",
        branchPoint: {
          id: "entry_vector",
          description: "Neural Nexus has multiple security layers. Choose your entry point:",
          choices: [
            {
              id: "employee_phishing",
              text: "Social Engineering",
              description: "Phish employee credentials for legitimate access",
              consequences: ["Low initial suspicion", "Requires social skills", "Access to internal systems"],
              nextSteps: ["phish_employees", "credential_harvest", "internal_recon"],
              rewardModifier: 1.3,
              suspicionChange: 5,
              unlocks: ["employee_database"]
            },
            {
              id: "physical_breach",
              text: "Physical Infiltration", 
              description: "Breach physical security systems",
              consequences: ["Medium suspicion", "Bypasses digital defenses", "Limited time window"],
              nextSteps: ["disable_cameras", "bypass_locks", "access_terminals"],
              rewardModifier: 1.4,
              suspicionChange: 15,
              unlocks: ["security_blueprints"]
            },
            {
              id: "zero_day_exploit",
              text: "Zero-Day Attack",
              description: "Use advanced exploits against their AI systems",
              consequences: ["High technical difficulty", "Massive data access", "AI countermeasures"],
              nextSteps: ["deploy_zero_day", "ai_battle", "core_access"],
              rewardModifier: 2.0,
              suspicionChange: 30,
              skillRequirement: "advanced_exploitation",
              unlocks: ["ai_warfare_tools"]
            }
          ],
          timeLimit: 45,
          defaultChoice: "employee_phishing"
        }
      },
      { 
        id: "stage_two_choice",
        command: "choose", 
        completed: false, 
        description: "Navigate facility defenses",
        branchPoint: {
          id: "defense_strategy",
          description: "Security is tightening. How do you proceed?",
          choices: [
            {
              id: "stealth_mode",
              text: "Ghost Protocol",
              description: "Remain undetected at all costs",
              consequences: ["Slower progress", "Minimal traces", "Bonus intel"],
              nextSteps: ["stealth_navigation", "silent_extraction"],
              rewardModifier: 1.6,
              suspicionChange: -10
            },
            {
              id: "speed_run",
              text: "Blitz Operation",
              description: "Move fast before they can respond",
              consequences: ["High speed", "Increased detection risk", "Time pressure"],
              nextSteps: ["rapid_extraction", "emergency_exit"],
              rewardModifier: 1.2,
              suspicionChange: 25
            },
            {
              id: "chaos_mode",
              text: "Scorched Earth",
              description: "Create maximum disruption as cover",
              consequences: ["High chaos", "Destroys evidence", "Burns bridges"],
              nextSteps: ["system_sabotage", "data_destruction", "explosive_exit"],
              rewardModifier: 1.0,
              suspicionChange: 50,
              unlocks: ["chaos_protocols"]
            }
          ],
          timeLimit: 30,
          defaultChoice: "stealth_mode"
        }
      }
    ],
    reward: 2500,
    dynamicReward: 2500,
    difficulty: "BRUTAL",
    timeLimit: 900, // 15 minutes total
    intel: [
      "• Neural Nexus houses experimental AI research",
      "• Multiple security layers: physical, digital, AI-based",
      "• High-value target with significant countermeasures",
      "• Mission choices will affect future opportunities",
      "• Advanced skills may unlock unique paths"
    ],
    branches: [
      {
        id: "social_branch",
        name: "The Inside Job",
        description: "Leverage human psychology and social engineering",
        steps: [
          { 
            id: "phish_employees",
            command: "phish --target NEURAL_EMPLOYEES", 
            completed: false, 
            description: "Launch targeted phishing campaign",
            prerequisites: ["employee_phishing"]
          },
          { 
            id: "credential_harvest",
            command: "harvest --credentials", 
            completed: false, 
            description: "Collect employee login credentials" 
          },
          { 
            id: "internal_recon",
            command: "recon --internal", 
            completed: false, 
            description: "Map internal network from employee access" 
          }
        ],
        rewardModifier: 1.3,
        difficultyModifier: 0.9
      },
      {
        id: "physical_branch",
        name: "Ghost in the Machine",
        description: "Physical infiltration and hardware manipulation",
        steps: [
          { 
            id: "disable_cameras",
            command: "disable --cameras", 
            completed: false, 
            description: "Neutralize surveillance systems",
            prerequisites: ["physical_breach"]
          },
          { 
            id: "bypass_locks",
            command: "bypass --locks ELECTRONIC", 
            completed: false, 
            description: "Override electronic lock systems" 
          },
          { 
            id: "access_terminals",
            command: "access --terminal SECURE", 
            completed: false, 
            description: "Gain direct terminal access" 
          }
        ],
        rewardModifier: 1.4,
        difficultyModifier: 1.1
      },
      {
        id: "ai_branch",
        name: "Digital Warfare",
        description: "Advanced AI exploitation and cyber warfare",
        steps: [
          { 
            id: "deploy_zero_day",
            command: "exploit --zero-day AI_CORE", 
            completed: false, 
            description: "Deploy zero-day exploit against AI core",
            prerequisites: ["zero_day_exploit"]
          },
          { 
            id: "ai_battle",
            command: "battle --ai NEURAL_NEXUS_AI", 
            completed: false, 
            description: "Engage in AI-vs-AI combat" 
          },
          { 
            id: "core_access",
            command: "access --core NEURAL_MATRIX", 
            completed: false, 
            description: "Penetrate the neural matrix core" 
          }
        ],
        rewardModifier: 2.0,
        difficultyModifier: 1.5
      }
    ],
    consequences: {
      global: {
        "stealth_completion": {
          description: "Completed without detection",
          effects: ["reputation_boost", "stealth_mastery_unlock"],
          permanentUnlocks: ["ghost_protocols"]
        },
        "chaos_completion": {
          description: "Caused maximum disruption",
          effects: ["infamy_increase", "chaos_mastery_unlock"],
          permanentUnlocks: ["destruction_protocols"]
        },
        "speed_completion": {
          description: "Completed in record time",
          effects: ["efficiency_boost", "speed_mastery_unlock"],
          permanentUnlocks: ["blitz_protocols"]
        }
      }
    }
  }
];

export function generateProceduralMission(difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'BRUTAL', missionNumber: number): Mission {
  const missionTemplates = {
    DATA_HEIST: {
      objectives: [
        "Infiltrate corporate database and extract classified files",
        "Breach financial records system and steal transaction data", 
        "Penetrate research facility and acquire experimental data",
        "Hack government database and extract sensitive documents"
      ],
      targets: ["CORP_DB", "FINANCE_SYS", "RESEARCH_LAB", "GOV_ARCHIVE"],
      commands: ["scan --deep", "connect --stealth", "exploit --database", "extract_data --classified"]
    },
    SYSTEM_OVERRIDE: {
      objectives: [
        "Gain control of smart city infrastructure systems",
        "Override security protocols in high-tech facility",
        "Hijack autonomous vehicle network control",
        "Commandeer satellite communication array"
      ],
      targets: ["SMART_CITY", "SECURITY_HUB", "AUTO_FLEET", "SAT_COMM"],
      commands: ["scan ports", "exploit --infrastructure", "backdoor --persistent", "override --systems"]
    },
    TRACE_WIPE: {
      objectives: [
        "Eliminate all evidence of previous infiltration",
        "Wipe forensic traces from compromised networks",
        "Clean digital footprints across multiple systems",
        "Erase activity logs from security databases"
      ],
      targets: ["FORENSIC_DB", "SECURITY_LOGS", "AUDIT_TRAIL", "BACKUP_SYS"],
      commands: ["scan --logs", "access --forensics", "wipe --traces", "reboot --clean"]
    },
    PUZZLE_NODE: {
      objectives: [
        "Decode encrypted AI communication protocols",
        "Solve quantum encryption puzzle to access vault",
        "Crack neural network authentication sequence",
        "Decipher alien-tech security algorithms"
      ],
      targets: ["AI_COMM", "QUANTUM_VAULT", "NEURAL_AUTH", "ALIEN_TECH"],
      commands: ["decrypt --quantum", "minigame pattern_crack", "analyze --neural", "solve --puzzle"]
    }
  };

  const missionTypes = Object.keys(missionTemplates);
  const selectedType = missionTypes[Math.floor(Math.random() * missionTypes.length)] as keyof typeof missionTemplates;
  const template = missionTemplates[selectedType];
  
  const difficultyMultipliers = {
    EASY: { reward: 300, complexity: 1, timeLimit: undefined },
    MEDIUM: { reward: 600, complexity: 2, timeLimit: 600 },
    HARD: { reward: 1000, complexity: 3, timeLimit: 450 },
    BRUTAL: { reward: 1800, complexity: 4, timeLimit: 300 }
  };

  const multiplier = difficultyMultipliers[difficulty];
  const objectiveIndex = Math.floor(Math.random() * template.objectives.length);
  const objective = template.objectives[objectiveIndex];
  const target = template.targets[objectiveIndex] + "_" + Math.floor(Math.random() * 999);

  // Create dynamic steps based on mission type
  const baseSteps = template.commands.map((cmd, index) => ({
    id: `step_${index + 1}`,
    command: cmd.replace(/TARGET/g, target),
    completed: false,
    description: getStepDescription(cmd, selectedType, index)
  }));

  // Add complexity layers based on difficulty
  const complexSteps = [...baseSteps];
  if (multiplier.complexity >= 2) {
    complexSteps.splice(1, 0, {
      id: "security_bypass",
      command: "bypass --security",
      completed: false,
      description: "Circumvent advanced security measures"
    });
  }
  if (multiplier.complexity >= 3) {
    complexSteps.splice(-1, 0, {
      id: "countermeasure_evasion", 
      command: "evade --countermeasures",
      completed: false,
      description: "Avoid active countermeasures"
    });
  }
  if (multiplier.complexity >= 4) {
    complexSteps.push({
      id: "ai_battle",
      command: "battle --ai DEFENSE_AI",
      completed: false,
      description: "Defeat AI security system"
    });
  }

  return {
    id: 1000 + missionNumber,
    title: `${selectedType}_${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
    objective,
    status: "PENDING",
    steps: complexSteps,
    reward: multiplier.reward + Math.floor(Math.random() * 300),
    difficulty,
    timeLimit: multiplier.timeLimit,
    intel: generateMissionIntel(selectedType, target, difficulty, multiplier.complexity)
  };
}

function getStepDescription(command: string, missionType: string, stepIndex: number): string {
  const descriptions = {
    DATA_HEIST: [
      "Perform deep reconnaissance of target database",
      "Establish covert connection to target system", 
      "Deploy database exploitation tools",
      "Extract and secure classified data"
    ],
    SYSTEM_OVERRIDE: [
      "Scan infrastructure control ports",
      "Exploit system vulnerabilities",
      "Install persistent backdoor access",
      "Override critical system controls"
    ],
    TRACE_WIPE: [
      "Scan for forensic evidence and logs",
      "Access forensic analysis systems",
      "Wipe all traces of previous activity",
      "Clean reboot to remove artifacts"
    ],
    PUZZLE_NODE: [
      "Decrypt quantum-encrypted communications",
      "Solve pattern-based security puzzle",
      "Analyze neural network structures",
      "Solve complex algorithmic challenge"
    ]
  };
  
  return descriptions[missionType as keyof typeof descriptions]?.[stepIndex] || "Complete mission objective";
}

function generateMissionIntel(missionType: string, target: string, difficulty: string, complexity: number): string[] {
  const baseIntel = [
    `• Mission Type: ${missionType.replace('_', ' ')}`,
    `• Primary Target: ${target}`,
    `• Difficulty Rating: ${difficulty}`,
    `• Security Level: ${complexity === 1 ? 'MINIMAL' : complexity === 2 ? 'STANDARD' : complexity === 3 ? 'HIGH' : 'MAXIMUM'}`
  ];
  
  const typeSpecificIntel = {
    DATA_HEIST: [
      "• Database encryption: AES-256 with quantum keys",
      "• Active monitoring: Real-time intrusion detection",
      "• Data integrity: Checksums and blockchain verification"
    ],
    SYSTEM_OVERRIDE: [
      "• Infrastructure: Critical city systems connected",
      "• Failsafes: Multiple redundancy layers active", 
      "• Response time: Emergency protocols in 90 seconds"
    ],
    TRACE_WIPE: [
      "• Forensic tools: Advanced log analysis systems",
      "• Backup systems: Multiple redundant storage locations",
      "• Recovery protocols: Automated restoration procedures"
    ],
    PUZZLE_NODE: [
      "• Encryption: Quantum-resistant algorithms",
      "• AI assistance: Neural network pattern recognition",
      "• Time pressure: Rotating security keys every 5 minutes"
    ]
  };
  
  return [
    ...baseIntel,
    ...(typeSpecificIntel[missionType as keyof typeof typeSpecificIntel] || [])
  ];
}

// Mission consequence tracking system
export function applyMissionConsequences(mission: Mission, gameState: GameState, completionType: string) {
  const consequences = mission.consequences?.global?.[completionType];
  if (!consequences) return gameState;
  
  const updates: Partial<GameState> = {};
  
  consequences.effects.forEach(effect => {
    switch (effect) {
      case 'reputation_boost':
        updates.reputation = 'ELITE';
        break;
      case 'infamy_increase':
        updates.suspicionLevel = (gameState.suspicionLevel || 0) + 25;
        break;
      case 'efficiency_boost':
        updates.credits = gameState.credits + 500;
        break;
    }
  });
  
  if (consequences.permanentUnlocks) {
    updates.unlockedCommands = [
      ...gameState.unlockedCommands,
      ...consequences.permanentUnlocks
    ];
  }
  
  return { ...gameState, ...updates };
}

// Mission chain system
export function generateMissionChain(previousMission: Mission, gameState: GameState): Mission[] {
  const chainTypes = ['REVENGE', 'ESCALATION', 'CLEANUP', 'DISCOVERY'];
  const chainType = chainTypes[Math.floor(Math.random() * chainTypes.length)];
  
  const chainMissions: Mission[] = [];
  
  switch (chainType) {
    case 'REVENGE':
      chainMissions.push(generateRevengeMission(previousMission, gameState));
      break;
    case 'ESCALATION':
      chainMissions.push(generateEscalationMission(previousMission, gameState));
      break;
    case 'CLEANUP':
      chainMissions.push(generateCleanupMission(previousMission, gameState));
      break;
    case 'DISCOVERY':
      chainMissions.push(generateDiscoveryMission(previousMission, gameState));
      break;
  }
  
  return chainMissions;
}

function generateRevengeMission(previousMission: Mission, gameState: GameState): Mission {
  return {
    id: 2000 + Math.floor(Math.random() * 1000),
    title: `REVENGE_${previousMission.title.split('_')[1]}`,
    objective: `Counter-attack against forces that detected your previous operation`,
    status: "PENDING",
    steps: [
      {
        id: "trace_attackers",
        command: "trace --source",
        completed: false,
        description: "Identify who detected your previous mission"
      },
      {
        id: "gather_intel",
        command: "recon --deep",
        completed: false,
        description: "Gather intelligence on enemy capabilities"
      },
      {
        id: "launch_counter",
        command: "exploit --revenge",
        completed: false,
        description: "Launch devastating counter-attack"
      }
    ],
    reward: Math.floor(previousMission.reward * 1.5),
    difficulty: previousMission.difficulty,
    intel: [
      "• Chain Mission: Revenge operation",
      `• Previous target has identified you`,
      "• Counter-intelligence measures active",
      "• High-stakes retaliation mission"
    ]
  };
}

function generateEscalationMission(previousMission: Mission, gameState: GameState): Mission {
  return {
    id: 2100 + Math.floor(Math.random() * 1000),
    title: `ESCALATION_${previousMission.title.split('_')[1]}`,
    objective: `Escalate operations against the same target with advanced techniques`,
    status: "PENDING", 
    steps: [
      {
        id: "advanced_recon",
        command: "scan --quantum",
        completed: false,
        description: "Deploy advanced reconnaissance tools"
      },
      {
        id: "deep_infiltration",
        command: "exploit --zero-day",
        completed: false,
        description: "Use zero-day exploits for deeper access"
      },
      {
        id: "total_compromise",
        command: "backdoor --permanent",
        completed: false,
        description: "Establish permanent control"
      }
    ],
    reward: Math.floor(previousMission.reward * 2),
    difficulty: previousMission.difficulty === 'EASY' ? 'MEDIUM' : 
                previousMission.difficulty === 'MEDIUM' ? 'HARD' : 'BRUTAL',
    intel: [
      "• Chain Mission: Escalation operation",
      "• Target has upgraded security since last breach",
      "• Advanced techniques required",
      "• Maximum impact objective"
    ]
  };
}

function generateCleanupMission(previousMission: Mission, gameState: GameState): Mission {
  return {
    id: 2200 + Math.floor(Math.random() * 1000),
    title: `CLEANUP_${previousMission.title.split('_')[1]}`,
    objective: `Clean up traces and evidence from previous operations`,
    status: "PENDING",
    steps: [
      {
        id: "trace_analysis",
        command: "scan --forensics",
        completed: false,
        description: "Analyze what traces were left behind"
      },
      {
        id: "evidence_wipe",
        command: "wipe --evidence",
        completed: false,
        description: "Eliminate all forensic evidence"
      },
      {
        id: "false_trail",
        command: "spoof --identity",
        completed: false,
        description: "Create false trails to misdirect investigation"
      }
    ],
    reward: Math.floor(previousMission.reward * 0.8),
    difficulty: 'MEDIUM',
    intel: [
      "• Chain Mission: Cleanup operation",
      "• Previous mission left forensic traces",
      "• Investigation teams are active",
      "• Stealth and misdirection required"
    ]
  };
}

function generateDiscoveryMission(previousMission: Mission, gameState: GameState): Mission {
  return {
    id: 2300 + Math.floor(Math.random() * 1000),
    title: `DISCOVERY_${previousMission.title.split('_')[1]}`,
    objective: `Investigate mysterious data discovered during previous mission`,
    status: "PENDING",
    steps: [
      {
        id: "data_analysis",
        command: "analyze --mysterious",
        completed: false,
        description: "Analyze the strange data you discovered"
      },
      {
        id: "source_trace",
        command: "trace --origin",
        completed: false,
        description: "Trace the origin of the mysterious data"
      },
      {
        id: "deep_investigation",
        command: "investigate --conspiracy",
        completed: false,
        description: "Uncover the larger conspiracy"
      }
    ],
    reward: Math.floor(previousMission.reward * 1.3),
    difficulty: 'HARD',
    intel: [
      "• Chain Mission: Discovery operation",
      "• Mysterious data found in previous mission",
      "• Potential conspiracy uncovered",
      "• High-level secrets may be revealed"
    ]
  };
}

export function getCurrentMission(gameState: GameState): Mission | null {
  if (gameState.currentMission < storyMissions.length) {
    return storyMissions[gameState.currentMission];
  }
  
  // Generate procedural mission
  const proceduralNumber = gameState.currentMission - storyMissions.length;
  const difficulties: Array<'EASY' | 'MEDIUM' | 'HARD' | 'BRUTAL'> = ['EASY', 'MEDIUM', 'HARD', 'BRUTAL'];
  const difficultyIndex = Math.min(Math.floor(proceduralNumber / 3), 3);
  const difficulty = difficulties[difficultyIndex];
  
  return generateProceduralMission(difficulty, proceduralNumber);
}
