import { Mission, GameState } from '../types/game';

export const storyMissions: Mission[] = [
  {
    id: 1,
    title: "GHOST_PROTOCOL",
    objective: "Infiltrate target network 192.168.4.1 and extract encrypted payload",
    status: "ACTIVE",
    steps: [
      { command: "scan wifi", completed: false, description: "Discover available networks" },
      { command: "connect TARGET_NET", completed: false, description: "Connect to target network" },
      { command: "inject payload", completed: false, description: "Deploy extraction tool" },
      { command: "decrypt --key AUTO", completed: false, description: "Extract encrypted data" }
    ],
    reward: 500,
    difficulty: "EASY",
    intel: [
      "• Target uses WPA2 encryption",
      "• Multiple IoT devices detected", 
      "• Firewall appears to be active",
      "• Unknown security protocols"
    ]
  },
  {
    id: 2,
    title: "SHADOW_NETWORK",
    objective: "Establish covert communication channel with Shadow Organization",
    status: "PENDING",
    steps: [
      { command: "scan ble", completed: false, description: "Locate Shadow beacons" },
      { command: "spoof ble --mac SHADOW_MAC", completed: false, description: "Impersonate trusted device" },
      { command: "inject hydra_handshake", completed: false, description: "Initialize Hydra Protocol" },
      { command: "decrypt shadow_key", completed: false, description: "Decode Shadow messages" }
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
      { command: "scan ports --target QUANTUM_CORP", completed: false, description: "Map corporate infrastructure" },
      { command: "inject quantum_payload", completed: false, description: "Deploy quantum interference" },
      { command: "bypass firewall --method HYDRA", completed: false, description: "Circumvent quantum firewall" },
      { command: "extract --data CLASSIFIED", completed: false, description: "Exfiltrate classified data" }
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
  }
];

export function generateProceduralMission(difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'BRUTAL', missionNumber: number): Mission {
  const objectives = [
    "Scan and decrypt rogue access point",
    "Spoof BLE device for data extraction",
    "Deploy Hydra worm on compromised node",
    "Infiltrate IoT device network",
    "Extract encrypted payload from target",
    "Establish backdoor in secure network",
    "Compromise smart home security system",
    "Intercept encrypted communications"
  ];

  const targets = [
    "CORP_NETWORK_" + Math.floor(Math.random() * 999),
    "IOT_HUB_" + Math.floor(Math.random() * 999),
    "SECURE_NET_" + Math.floor(Math.random() * 999),
    "HIDDEN_AP_" + Math.floor(Math.random() * 999)
  ];

  const difficultyMultipliers = {
    EASY: { reward: 200, complexity: 1 },
    MEDIUM: { reward: 400, complexity: 2 },
    HARD: { reward: 600, complexity: 3 },
    BRUTAL: { reward: 1000, complexity: 4 }
  };

  const multiplier = difficultyMultipliers[difficulty];
  const objective = objectives[Math.floor(Math.random() * objectives.length)];
  const target = targets[Math.floor(Math.random() * targets.length)];

  const baseSteps = [
    { command: "scan wifi", completed: false, description: "Discover target networks" },
    { command: `connect ${target}`, completed: false, description: "Establish connection" },
    { command: "inject payload", completed: false, description: "Deploy payload" },
    { command: "decrypt --key AUTO", completed: false, description: "Extract data" }
  ];

  // Add complexity based on difficulty
  const complexSteps = [...baseSteps];
  if (multiplier.complexity >= 2) {
    complexSteps.splice(1, 0, { command: "bypass firewall", completed: false, description: "Circumvent security" });
  }
  if (multiplier.complexity >= 3) {
    complexSteps.splice(2, 0, { command: "spoof ble --stealth", completed: false, description: "Maintain stealth" });
  }
  if (multiplier.complexity >= 4) {
    complexSteps.push({ command: "reboot --clean", completed: false, description: "Cover tracks" });
  }

  return {
    id: 1000 + missionNumber,
    title: `OPERATION_${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
    objective: `${objective} on ${target}`,
    status: "PENDING",
    steps: complexSteps,
    reward: multiplier.reward + Math.floor(Math.random() * 200),
    difficulty,
    timeLimit: difficulty === 'BRUTAL' ? 180 : difficulty === 'HARD' ? 300 : undefined,
    intel: [
      `• Target: ${target}`,
      `• Difficulty: ${difficulty}`,
      `• Security Level: ${multiplier.complexity === 1 ? 'LOW' : multiplier.complexity === 2 ? 'MEDIUM' : multiplier.complexity === 3 ? 'HIGH' : 'MAXIMUM'}`,
      `• Estimated Reward: ${multiplier.reward}+ credits`
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
