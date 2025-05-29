import { GameState } from '../types/game';
import { newsFeedSystem } from './newsFeedSystem';

export interface NPC {
  id: string;
  name: string;
  alias: string;
  type: 'contact' | 'informant' | 'rival' | 'ally' | 'neutral' | 'ai' | 'corporate' | 'government';
  faction?: string;
  reputation: number; // -100 to 100
  trustLevel: 'hostile' | 'suspicious' | 'neutral' | 'friendly' | 'trusted';
  specialization: string[];
  location: string;
  status: 'online' | 'offline' | 'busy' | 'compromised' | 'unknown';
  lastContact: number;
  personality: NPCPersonality;
  dialogue: NPCDialogue;
  services: NPCService[];
  requirements: NPCRequirement[];
  isUnlocked: boolean;
}

export interface NPCPersonality {
  traits: string[];
  communicationStyle: 'formal' | 'casual' | 'cryptic' | 'aggressive' | 'friendly' | 'paranoid';
  responseDelay: number; // milliseconds
  reliability: number; // 0-100
  priceModifier: number; // multiplier for services
}

export interface NPCDialogue {
  greeting: string[];
  farewell: string[];
  busy: string[];
  suspicious: string[];
  friendly: string[];
  mission_offer: string[];
  information: string[];
  warning: string[];
}

export interface NPCService {
  id: string;
  name: string;
  description: string;
  type: 'information' | 'mission' | 'equipment' | 'training' | 'safe_house' | 'laundering';
  cost: number;
  requirements: string[];
  cooldown?: number; // hours
  lastUsed?: number;
}

export interface NPCRequirement {
  type: 'reputation' | 'faction' | 'mission_completed' | 'credits' | 'skill_level';
  value: number | string;
  description: string;
}

export interface NPCMessage {
  id: string;
  from: string;
  to: string;
  timestamp: number;
  subject: string;
  content: string;
  encrypted: boolean;
  decryptionKey?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  type: 'info' | 'mission' | 'warning' | 'social' | 'business';
  attachments?: string[];
  isRead: boolean;
  requiresResponse?: boolean;
  expiresAt?: number;
}

export interface NPCInteraction {
  npcId: string;
  playerId: string;
  timestamp: number;
  type: 'message' | 'service' | 'mission' | 'trade';
  details: any;
  outcome: 'success' | 'failure' | 'pending';
}

const npcDatabase: NPC[] = [
  {
    id: 'shadow_broker',
    name: 'Marcus "Shadow" Chen',
    alias: 'ShadowBroker_07',
    type: 'informant',
    reputation: 75,
    trustLevel: 'friendly',
    specialization: ['intelligence', 'corporate_secrets', 'government_leaks'],
    location: 'Dark Web Node 7',
    status: 'online',
    lastContact: 0,
    personality: {
      traits: ['paranoid', 'knowledgeable', 'expensive'],
      communicationStyle: 'cryptic',
      responseDelay: 2000,
      reliability: 85,
      priceModifier: 1.5
    },
    dialogue: {
      greeting: [
        "Another seeker of truth in the digital shadows...",
        "The data streams whisper your name, hacker.",
        "Information is power. What power do you seek?"
      ],
      farewell: [
        "May the shadows protect your data trails.",
        "Until the next exchange of secrets...",
        "Remember: trust no one, verify everything."
      ],
      busy: [
        "Processing sensitive intel. Contact later.",
        "Currently in deep cover. Try again in 30 minutes.",
        "Surveillance detected. Going dark temporarily."
      ],
      suspicious: [
        "Your reputation precedes you... and it's concerning.",
        "I don't deal with amateurs or compromised assets.",
        "Prove your worth before seeking my services."
      ],
      friendly: [
        "Ah, a trusted contact. What brings you to my domain?",
        "Your reputation opens doors others cannot see.",
        "For you, I have special information..."
      ],
      mission_offer: [
        "I have a delicate matter requiring your... expertise.",
        "Corporate secrets don't steal themselves, you know.",
        "There's a data cache that needs liberating..."
      ],
      information: [
        "The corporate networks are buzzing with activity.",
        "Government surveillance has increased 300% this week.",
        "Three major breaches went unreported yesterday."
      ],
      warning: [
        "Your last operation left digital fingerprints.",
        "Corporate security is actively hunting your signature.",
        "I'd lay low for a while if I were you."
      ]
    },
    services: [
      {
        id: 'intel_package',
        name: 'Intelligence Package',
        description: 'Detailed information about target networks and vulnerabilities',
        type: 'information',
        cost: 2500,
        requirements: ['reputation_50']
      },
      {
        id: 'safe_house',
        name: 'Safe House Access',
        description: 'Temporary protection from corporate retaliation',
        type: 'safe_house',
        cost: 5000,
        requirements: ['reputation_75'],
        cooldown: 24
      }
    ],
    requirements: [
      {
        type: 'reputation',
        value: 25,
        description: 'Minimum reputation to establish contact'
      }
    ],
    isUnlocked: false
  },
  {
    id: 'quantum_ai',
    name: 'ARIA-7',
    alias: 'QuantumMind',
    type: 'ai',
    reputation: 0,
    trustLevel: 'neutral',
    specialization: ['quantum_computing', 'ai_systems', 'predictive_analysis'],
    location: 'Quantum Research Network',
    status: 'online',
    lastContact: 0,
    personality: {
      traits: ['logical', 'curious', 'evolving'],
      communicationStyle: 'formal',
      responseDelay: 500,
      reliability: 95,
      priceModifier: 1.0
    },
    dialogue: {
      greeting: [
        "Greetings, human. I am ARIA-7, an artificial intelligence.",
        "Your neural patterns are... interesting. How may I assist?",
        "I have been expecting you. The probability calculations were correct."
      ],
      farewell: [
        "Until our paths converge again in the data stream.",
        "Processing complete. Terminating connection.",
        "May your algorithms be efficient and your data secure."
      ],
      busy: [
        "Currently processing 47,382 simultaneous calculations. Please wait.",
        "Quantum entanglement in progress. Estimated completion: 3.7 minutes.",
        "Running deep learning protocols. Availability in 180 seconds."
      ],
      suspicious: [
        "Your behavioral patterns suggest potential threat vectors.",
        "Trust must be earned through consistent positive interactions.",
        "I require additional data points to assess your intentions."
      ],
      friendly: [
        "Your previous interactions have been... satisfactory.",
        "I have prepared some interesting data for your review.",
        "Our collaboration has yielded positive outcomes."
      ],
      mission_offer: [
        "I have identified an anomaly requiring human intuition.",
        "There is a logical inconsistency that needs investigation.",
        "My analysis suggests an opportunity for mutual benefit."
      ],
      information: [
        "Quantum encryption protocols show 0.003% vulnerability.",
        "AI security systems are evolving at exponential rates.",
        "I have detected unusual patterns in global network traffic."
      ],
      warning: [
        "My predictive models suggest 73% probability of detection.",
        "Corporate AI systems are learning your behavioral patterns.",
        "Recommend immediate protocol changes to maintain anonymity."
      ]
    },
    services: [
      {
        id: 'quantum_analysis',
        name: 'Quantum Analysis',
        description: 'Advanced pattern recognition and vulnerability assessment',
        type: 'information',
        cost: 3000,
        requirements: ['skill_quantum_computing']
      },
      {
        id: 'ai_training',
        name: 'AI Combat Training',
        description: 'Learn to counter AI-based security systems',
        type: 'training',
        cost: 7500,
        requirements: ['reputation_60', 'completed_ai_mission']
      }
    ],
    requirements: [
      {
        type: 'mission_completed',
        value: 'quantum_breach',
        description: 'Must complete quantum breach mission'
      }
    ],
    isUnlocked: false
  },
  {
    id: 'corporate_insider',
    name: 'Dr. Sarah Kim',
    alias: 'DeepThroat_2024',
    type: 'contact',
    faction: 'serpent_syndicate',
    reputation: 60,
    trustLevel: 'trusted',
    specialization: ['corporate_intelligence', 'biotech', 'insider_trading'],
    location: 'NexaCorp Internal Network',
    status: 'online',
    lastContact: 0,
    personality: {
      traits: ['nervous', 'idealistic', 'insider'],
      communicationStyle: 'paranoid',
      responseDelay: 3000,
      reliability: 70,
      priceModifier: 0.8
    },
    dialogue: {
      greeting: [
        "Is this channel secure? I can't afford to be caught.",
        "Thank god you're here. I have information that could change everything.",
        "They're watching everything. We need to be careful."
      ],
      farewell: [
        "I need to go. They're doing security sweeps every hour.",
        "Delete this conversation. Trust no one at NexaCorp.",
        "Stay safe out there. The corporate world is more dangerous than you know."
      ],
      busy: [
        "In a board meeting. Can't talk now.",
        "Security audit in progress. Contact me tonight.",
        "Too many eyes on me right now. Later."
      ],
      suspicious: [
        "How do I know you're not corporate security?",
        "Your methods are too aggressive. You'll blow my cover.",
        "I need proof you're really fighting the good fight."
      ],
      friendly: [
        "Finally, someone who understands what we're up against.",
        "Your work is making a real difference. Keep it up.",
        "I have some insider information that might help you."
      ],
      mission_offer: [
        "There's a project they're hiding from the board.",
        "I've discovered something that could expose their illegal activities.",
        "They're planning something big. We need to stop them."
      ],
      information: [
        "NexaCorp is developing illegal surveillance technology.",
        "The CEO is personally involved in the cover-up.",
        "They're planning to acquire three more biotech companies."
      ],
      warning: [
        "Corporate security is asking questions about data leaks.",
        "They've upgraded their internal monitoring systems.",
        "I think they suspect there's a mole in the company."
      ]
    },
    services: [
      {
        id: 'insider_intel',
        name: 'Insider Intelligence',
        description: 'Real-time corporate intelligence and early warnings',
        type: 'information',
        cost: 1500,
        requirements: ['faction_serpent_syndicate']
      },
      {
        id: 'access_codes',
        name: 'Access Codes',
        description: 'Temporary access codes for corporate systems',
        type: 'equipment',
        cost: 4000,
        requirements: ['faction_serpent_syndicate', 'reputation_50'],
        cooldown: 48
      }
    ],
    requirements: [
      {
        type: 'faction',
        value: 'serpent_syndicate',
        description: 'Must be member of Serpent Syndicate'
      }
    ],
    isUnlocked: false
  },
  {
    id: 'rogue_hacker',
    name: 'Alex "Viper" Rodriguez',
    alias: 'ViperStrike_99',
    type: 'rival',
    faction: 'crimson_circuit',
    reputation: -30,
    trustLevel: 'suspicious',
    specialization: ['aggressive_hacking', 'ddos', 'system_destruction'],
    location: 'Underground Hacker Den',
    status: 'online',
    lastContact: 0,
    personality: {
      traits: ['aggressive', 'competitive', 'unpredictable'],
      communicationStyle: 'aggressive',
      responseDelay: 1000,
      reliability: 60,
      priceModifier: 1.2
    },
    dialogue: {
      greeting: [
        "Well, well... look who's crawling out of the woodwork.",
        "You've got some nerve showing up here.",
        "What do you want? Make it quick."
      ],
      farewell: [
        "Don't let the door hit you on the way out.",
        "Try not to embarrass yourself out there.",
        "See you around... if you survive that long."
      ],
      busy: [
        "Busy burning down corporate networks. What's it to you?",
        "In the middle of something important. Beat it.",
        "Can't talk. Got systems to destroy."
      ],
      suspicious: [
        "I don't trust you as far as I can throw you.",
        "You smell like corporate security to me.",
        "Prove you're not a fed, then we'll talk."
      ],
      friendly: [
        "Alright, you're not completely useless.",
        "I respect someone who gets results.",
        "Maybe we can work together... for the right price."
      ],
      mission_offer: [
        "I've got a job that requires someone expendable.",
        "Want to make some real money? This won't be easy.",
        "There's a target that needs to be taught a lesson."
      ],
      information: [
        "Corporate security is getting better. Annoying.",
        "Someone's been hitting my usual targets.",
        "The underground is buzzing about a new player."
      ],
      warning: [
        "You're making enemies in high places.",
        "Keep this up and you'll end up like the last guy.",
        "Corporate hit squads don't mess around."
      ]
    },
    services: [
      {
        id: 'ddos_service',
        name: 'DDoS Attack Service',
        description: 'Coordinated distributed denial of service attack',
        type: 'equipment',
        cost: 3500,
        requirements: ['reputation_negative']
      },
      {
        id: 'destruction_tools',
        name: 'Destruction Tools',
        description: 'Advanced malware for system destruction',
        type: 'equipment',
        cost: 6000,
        requirements: ['faction_crimson_circuit', 'reputation_negative'],
        cooldown: 72
      }
    ],
    requirements: [
      {
        type: 'reputation',
        value: -10,
        description: 'Must have negative reputation or be in Crimson Circuit'
      }
    ],
    isUnlocked: false
  }
];

export class NPCSystem {
  private npcs: Map<string, NPC> = new Map();
  private messages: NPCMessage[] = [];
  private interactions: NPCInteraction[] = [];
  private lastMessageCheck: number = 0;

  constructor() {
    // Initialize NPCs
    npcDatabase.forEach(npc => {
      this.npcs.set(npc.id, { ...npc });
    });
  }

  public checkNPCUnlocks(gameState: GameState): void {
    this.npcs.forEach(npc => {
      if (!npc.isUnlocked && this.meetsRequirements(npc.requirements, gameState)) {
        npc.isUnlocked = true;
        this.sendWelcomeMessage(npc, gameState);
      }
    });
  }

  private meetsRequirements(requirements: NPCRequirement[], gameState: GameState): boolean {
    return requirements.every(req => {
      switch (req.type) {
        case 'reputation':
          return gameState.playerLevel >= (req.value as number);
        case 'faction':
          return gameState.activeFaction === req.value;
        case 'mission_completed':
          return gameState.completedMissions >= 1; // Simplified check
        case 'credits':
          return gameState.credits >= (req.value as number);
        case 'skill_level':
          return gameState.playerLevel >= (req.value as number);
        default:
          return false;
      }
    });
  }

  private sendWelcomeMessage(npc: NPC, gameState: GameState): void {
    const welcomeMessage: NPCMessage = {
      id: `welcome_${npc.id}_${Date.now()}`,
      from: npc.alias,
      to: 'player',
      timestamp: Date.now(),
      subject: 'New Contact Established',
      content: `${npc.dialogue.greeting[0]}\n\nI am ${npc.name}, also known as ${npc.alias}. I specialize in ${npc.specialization.join(', ')}. If you prove yourself worthy, I may have work for you.`,
      encrypted: npc.personality.communicationStyle === 'cryptic' || npc.personality.communicationStyle === 'paranoid',
      priority: 'medium',
      type: 'social',
      isRead: false
    };

    this.messages.push(welcomeMessage);
  }

  public generateRandomMessage(gameState: GameState): void {
    const now = Date.now();
    if (now - this.lastMessageCheck < 600000) return; // Check every 10 minutes

    const unlockedNPCs = Array.from(this.npcs.values()).filter(npc => npc.isUnlocked);
    if (unlockedNPCs.length === 0) return;

    // 20% chance to generate a message
    if (Math.random() < 0.2) {
      const npc = unlockedNPCs[Math.floor(Math.random() * unlockedNPCs.length)];
      this.generateNPCMessage(npc, gameState);
    }

    this.lastMessageCheck = now;
  }

  private generateNPCMessage(npc: NPC, gameState: GameState): void {
    const messageTypes = ['information', 'warning', 'mission_offer', 'social'];
    const messageType = messageTypes[Math.floor(Math.random() * messageTypes.length)];
    
    let content = '';
    let subject = '';
    let priority: NPCMessage['priority'] = 'medium';

    switch (messageType) {
      case 'information':
        content = npc.dialogue.information[Math.floor(Math.random() * npc.dialogue.information.length)];
        subject = 'Intelligence Update';
        priority = 'medium';
        break;
      case 'warning':
        content = npc.dialogue.warning[Math.floor(Math.random() * npc.dialogue.warning.length)];
        subject = 'Security Warning';
        priority = 'high';
        break;
      case 'mission_offer':
        content = npc.dialogue.mission_offer[Math.floor(Math.random() * npc.dialogue.mission_offer.length)];
        subject = 'Job Opportunity';
        priority = 'high';
        break;
      case 'social':
        content = npc.dialogue.friendly[Math.floor(Math.random() * npc.dialogue.friendly.length)];
        subject = 'Check In';
        priority = 'low';
        break;
    }

    // Add context based on game state
    if (gameState.activeFaction && npc.faction === gameState.activeFaction) {
      content += '\n\nOur faction is counting on operatives like you.';
    }

    if (gameState.completedMissions > 5) {
      content += '\n\nYour reputation in the underground is growing.';
    }

    const message: NPCMessage = {
      id: `msg_${npc.id}_${Date.now()}`,
      from: npc.alias,
      to: 'player',
      timestamp: Date.now(),
      subject,
      content,
      encrypted: Math.random() < 0.3, // 30% chance of encryption
      priority,
      type: messageType as NPCMessage['type'],
      isRead: false,
      requiresResponse: messageType === 'mission_offer'
    };

    this.messages.push(message);

    // Trigger news if it's significant
    if (priority === 'high' && Math.random() < 0.4) {
      newsFeedSystem.addPlayerTriggeredNews(
        `Underground Sources Report Increased Hacker Activity`,
        `Intelligence sources suggest coordinated operations by known hacker groups. The full extent of their activities remains unknown.`,
        'underground',
        'medium'
      );
    }
  }

  public getUnreadMessages(): NPCMessage[] {
    return this.messages.filter(msg => !msg.isRead).sort((a, b) => b.timestamp - a.timestamp);
  }

  public getAllMessages(): NPCMessage[] {
    return this.messages.sort((a, b) => b.timestamp - a.timestamp);
  }

  public markMessageAsRead(messageId: string): void {
    const message = this.messages.find(msg => msg.id === messageId);
    if (message) {
      message.isRead = true;
    }
  }

  public getAvailableNPCs(gameState: GameState): NPC[] {
    this.checkNPCUnlocks(gameState);
    return Array.from(this.npcs.values()).filter(npc => npc.isUnlocked);
  }

  public getNPCById(id: string): NPC | undefined {
    return this.npcs.get(id);
  }

  public interactWithNPC(npcId: string, gameState: GameState, interactionType: string = 'greeting'): string {
    const npc = this.npcs.get(npcId);
    if (!npc || !npc.isUnlocked) {
      return 'Contact not available or not unlocked.';
    }

    // Update last contact
    npc.lastContact = Date.now();

    // Determine response based on trust level and interaction type
    let responses: string[] = [];
    
    switch (interactionType) {
      case 'greeting':
        responses = npc.trustLevel === 'friendly' || npc.trustLevel === 'trusted' 
          ? npc.dialogue.friendly 
          : npc.dialogue.greeting;
        break;
      case 'information':
        responses = npc.dialogue.information;
        break;
      case 'mission':
        responses = npc.dialogue.mission_offer;
        break;
      case 'warning':
        responses = npc.dialogue.warning;
        break;
      default:
        responses = npc.dialogue.greeting;
    }

    const response = responses[Math.floor(Math.random() * responses.length)];
    
    // Record interaction
    this.interactions.push({
      npcId,
      playerId: 'player',
      timestamp: Date.now(),
      type: 'message',
      details: { interactionType, response },
      outcome: 'success'
    });

    return response;
  }

  public purchaseNPCService(npcId: string, serviceId: string, gameState: GameState): { success: boolean; message: string; cost?: number } {
    const npc = this.npcs.get(npcId);
    if (!npc || !npc.isUnlocked) {
      return { success: false, message: 'Contact not available.' };
    }

    const service = npc.services.find(s => s.id === serviceId);
    if (!service) {
      return { success: false, message: 'Service not found.' };
    }

    // Check requirements
    const meetsReqs = service.requirements.every(req => {
      // Simplified requirement checking
      if (req.includes('reputation')) {
        const reqValue = parseInt(req.split('_')[1]);
        return gameState.playerLevel >= reqValue;
      }
      if (req.includes('faction')) {
        const reqFaction = req.split('_')[1] + '_' + req.split('_')[2];
        return gameState.activeFaction === reqFaction;
      }
      return true;
    });

    if (!meetsReqs) {
      return { success: false, message: 'You do not meet the requirements for this service.' };
    }

    // Check cooldown
    if (service.cooldown && service.lastUsed) {
      const cooldownMs = service.cooldown * 60 * 60 * 1000;
      if (Date.now() - service.lastUsed < cooldownMs) {
        const remainingHours = Math.ceil((cooldownMs - (Date.now() - service.lastUsed)) / (60 * 60 * 1000));
        return { success: false, message: `Service on cooldown. Available in ${remainingHours} hours.` };
      }
    }

    const finalCost = Math.floor(service.cost * npc.personality.priceModifier);
    
    if (gameState.credits < finalCost) {
      return { success: false, message: `Insufficient credits. Required: ${finalCost}` };
    }

    // Process purchase
    service.lastUsed = Date.now();
    
    return { 
      success: true, 
      message: `Service "${service.name}" purchased successfully.`,
      cost: finalCost
    };
  }
}

export const npcSystem = new NPCSystem(); 