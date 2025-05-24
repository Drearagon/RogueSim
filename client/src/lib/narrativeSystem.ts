import { GameState, NarrativeEvent, NarrativeChoice, EncryptedMessage } from '../types/game';

// Hydra Protocol Narrative Events
export const narrativeEvents: Record<string, NarrativeEvent> = {
  hydra_discovery: {
    id: 'hydra_discovery',
    title: 'Strange Signal Detected',
    description: 'Your ESP32 picks up an unusual encrypted transmission on frequency 433.92MHz. The signal pattern suggests advanced military-grade encryption.',
    choices: [
      {
        id: 'investigate',
        text: 'Investigate the signal further',
        consequences: ['hydra_protocol_discovered'],
        reputation_change: 5,
        suspicion_change: 10,
        unlock_commands: ['decrypt', 'frequency'],
        leads_to: 'hydra_contact'
      },
      {
        id: 'ignore',
        text: 'Ignore and continue standard operations',
        consequences: ['signal_ignored'],
        reputation_change: 0,
        suspicion_change: 0,
        leads_to: 'normal_path'
      }
    ],
    consequences: [],
    unlock_conditions: ['completed_missions >= 3']
  },

  hydra_contact: {
    id: 'hydra_contact',
    title: 'First Contact',
    description: 'You successfully decrypt part of the transmission. A message appears: "SHADOW_NODE_07 seeking capable operator. Hydra Protocol initiative requires discretion. Respond if interested in real work."',
    choices: [
      {
        id: 'respond_cautious',
        text: 'Respond cautiously, ask for more information',
        consequences: ['shadow_org_contact'],
        reputation_change: 3,
        suspicion_change: 5,
        leads_to: 'hydra_briefing'
      },
      {
        id: 'respond_eager',
        text: 'Respond immediately, show enthusiasm',
        consequences: ['eager_response'],
        reputation_change: 8,
        suspicion_change: 15,
        leads_to: 'hydra_test'
      },
      {
        id: 'trace_signal',
        text: 'Try to trace the signal source',
        consequences: ['signal_traced'],
        reputation_change: 10,
        suspicion_change: 25,
        leads_to: 'hydra_exposure'
      }
    ],
    consequences: [],
    unlock_conditions: ['hydra_protocol_discovered']
  },

  hydra_briefing: {
    id: 'hydra_briefing',
    title: 'The Hydra Briefing',
    description: 'SHADOW_NODE_07 reveals more: "Hydra Protocol is a distributed network of elite hackers working to expose corporate corruption. Each node operates independently. Your first task: infiltrate MegaCorp\'s IoT infrastructure."',
    choices: [
      {
        id: 'accept_mission',
        text: 'Accept the mission',
        consequences: ['hydra_member'],
        reputation_change: 15,
        suspicion_change: 20,
        unlock_commands: ['inject', 'exfiltrate'],
        leads_to: 'megacorp_infiltration'
      },
      {
        id: 'negotiate_terms',
        text: 'Negotiate better terms and payment',
        consequences: ['negotiated_deal'],
        reputation_change: 8,
        suspicion_change: 5,
        leads_to: 'hydra_negotiation'
      },
      {
        id: 'decline_politely',
        text: 'Decline politely, too risky',
        consequences: ['declined_hydra'],
        reputation_change: -5,
        suspicion_change: -10,
        leads_to: 'normal_path'
      }
    ],
    consequences: [],
    unlock_conditions: ['shadow_org_contact']
  },

  megacorp_infiltration: {
    id: 'megacorp_infiltration',
    title: 'MegaCorp Infiltration',
    description: 'You\'ve gained access to MegaCorp\'s IoT network. Thousands of smart devices are sending data to their servers. You discover they\'re collecting illegal biometric data from employees.',
    choices: [
      {
        id: 'expose_immediately',
        text: 'Leak the evidence immediately',
        consequences: ['whistleblower', 'megacorp_enemy'],
        reputation_change: 25,
        suspicion_change: 50,
        leads_to: 'public_exposure'
      },
      {
        id: 'gather_more_evidence',
        text: 'Gather more evidence first',
        consequences: ['thorough_investigation'],
        reputation_change: 15,
        suspicion_change: 30,
        leads_to: 'deeper_conspiracy'
      },
      {
        id: 'blackmail_megacorp',
        text: 'Use evidence for blackmail',
        consequences: ['criminal_path', 'megacorp_deal'],
        reputation_change: -10,
        suspicion_change: 40,
        leads_to: 'dark_path'
      }
    ],
    consequences: [],
    unlock_conditions: ['hydra_member']
  },

  deeper_conspiracy: {
    id: 'deeper_conspiracy',
    title: 'The Deeper Conspiracy',
    description: 'Your investigation reveals MegaCorp is just one node in a massive surveillance network. Government agencies, tech giants, and shadow organizations are all connected. The Hydra Protocol might be deeper than you thought.',
    choices: [
      {
        id: 'join_resistance',
        text: 'Join the resistance against surveillance',
        consequences: ['resistance_member'],
        reputation_change: 20,
        suspicion_change: 60,
        leads_to: 'resistance_path'
      },
      {
        id: 'work_from_inside',
        text: 'Infiltrate the system from within',
        consequences: ['double_agent'],
        reputation_change: 5,
        suspicion_change: 20,
        leads_to: 'infiltrator_path'
      },
      {
        id: 'sell_information',
        text: 'Sell information to highest bidder',
        consequences: ['information_broker'],
        reputation_change: -15,
        suspicion_change: 10,
        leads_to: 'broker_path'
      }
    ],
    consequences: [],
    unlock_conditions: ['thorough_investigation']
  }
};

// Generate encrypted messages based on narrative progress
export function generateEncryptedMessage(gameState: GameState, eventId: string): EncryptedMessage {
  const messages: Record<string, EncryptedMessage> = {
    hydra_discovery: {
      id: 'msg_001',
      from: 'UNKNOWN_NODE',
      timestamp: Date.now(),
      encrypted_content: 'RklSU1QgQ09OVEFDVCA6OiBIWURSQSBQUk9UT0NPTCBBQ1RJVkU=',
      is_decrypted: false,
      decryption_key: 'SHADOW07'
    },
    hydra_contact: {
      id: 'msg_002',
      from: 'SHADOW_NODE_07',
      timestamp: Date.now(),
      encrypted_content: 'V0UgSEFWRSBCRUVOIFdBVENISU5HIFlPVVIgV09SSw==',
      is_decrypted: false,
      decryption_key: 'HYDRA_INIT',
      content: 'WE HAVE BEEN WATCHING YOUR WORK'
    },
    megacorp_infiltration: {
      id: 'msg_003',
      from: 'SHADOW_NODE_07',
      timestamp: Date.now(),
      encrypted_content: 'TUVHQUNPUFBGIE1JU1NJT04gQ09NUExFVEU=',
      is_decrypted: false,
      decryption_key: 'MEGACORP_OP',
      content: 'MEGACORP MISSION COMPLETE'
    }
  };

  return messages[eventId] || messages.hydra_discovery;
}

// Check if narrative event should trigger
export function checkNarrativeConditions(gameState: GameState, eventId: string): boolean {
  const event = narrativeEvents[eventId];
  if (!event) return false;

  for (const condition of event.unlock_conditions) {
    if (condition.includes('>=')) {
      const [property, value] = condition.split(' >= ');
      const gameValue = getNestedProperty(gameState, property.trim());
      if (gameValue < parseInt(value.trim())) return false;
    } else if (condition.includes('==')) {
      const [property, value] = condition.split(' == ');
      const gameValue = getNestedProperty(gameState, property.trim());
      if (gameValue !== value.trim().replace(/'/g, '')) return false;
    } else {
      // Simple condition check (e.g., 'hydra_protocol_discovered')
      if (!gameState.narrativeChoices.includes(condition)) return false;
    }
  }

  return true;
}

// Get nested property from object using dot notation
function getNestedProperty(obj: any, path: string): any {
  return path.split('.').reduce((current, prop) => current?.[prop], obj);
}

// Process narrative choice and update game state
export function processNarrativeChoice(
  gameState: GameState,
  eventId: string,
  choiceId: string
): Partial<GameState> {
  const event = narrativeEvents[eventId];
  const choice = event?.choices.find(c => c.id === choiceId);
  
  if (!choice) return {};

  const updates: Partial<GameState> = {
    reputation: updateReputation(gameState.reputation, choice.reputation_change),
    suspicionLevel: Math.max(0, Math.min(100, gameState.suspicionLevel + choice.suspicion_change)),
    narrativeChoices: [...gameState.narrativeChoices, ...choice.consequences],
    hydraProtocol: {
      ...gameState.hydraProtocol,
      current_branch: choice.leads_to || gameState.hydraProtocol.current_branch,
      completed_nodes: [...gameState.hydraProtocol.completed_nodes, eventId]
    }
  };

  // Unlock new commands
  if (choice.unlock_commands) {
    updates.unlockedCommands = [...gameState.unlockedCommands, ...choice.unlock_commands];
  }

  // Update shadow organization standing
  if (choice.consequences.includes('hydra_member')) {
    updates.hydraProtocol = {
      ...updates.hydraProtocol!,
      discovered: true,
      access_level: 1,
      shadow_org_standing: 'TRUSTED',
      active_contacts: ['SHADOW_NODE_07']
    };
  }

  return updates;
}

// Update reputation based on numeric change
function updateReputation(currentRep: string, change: number): string {
  const repLevels = ['UNKNOWN', 'SUSPICIOUS', 'TRUSTED', 'ELITE', 'LEGENDARY'];
  const currentIndex = repLevels.indexOf(currentRep);
  
  if (change > 0 && change >= 20) return 'LEGENDARY';
  if (change > 0 && change >= 15) return 'ELITE';
  if (change > 0 && change >= 10) return 'TRUSTED';
  if (change < 0 && change <= -10) return 'SUSPICIOUS';
  if (change < 0 && change <= -20) return 'UNKNOWN';
  
  return currentRep;
}

// Get next narrative event based on current game state
export function getNextNarrativeEvent(gameState: GameState): NarrativeEvent | null {
  // Check for available events based on current branch and conditions
  const availableEvents = Object.values(narrativeEvents).filter(event => 
    checkNarrativeConditions(gameState, event.id) &&
    !gameState.hydraProtocol.completed_nodes.includes(event.id)
  );

  return availableEvents[0] || null;
}

// Format narrative event for terminal display
export function formatNarrativeEvent(event: NarrativeEvent): string[] {
  const output = [
    '┌─ ENCRYPTED TRANSMISSION ─┐',
    `│ ${event.title.substring(0, 22).padEnd(22)} │`,
    '├─────────────────────────┤',
    ...event.description.match(/.{1,23}/g)?.map(line => `│ ${line.padEnd(23)} │`) || [],
    '├─────────────────────────┤',
    ...event.choices.map((choice, index) => 
      `│ ${(index + 1)}. ${choice.text.substring(0, 20).padEnd(20)} │`
    ),
    '└─────────────────────────┘',
    '',
    'Use "choose <number>" to respond'
  ];

  return output;
}