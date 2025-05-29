import { GameState } from '../types/game';

export interface SocialTarget {
  id: string;
  name: string;
  role: string;
  company: string;
  personality: 'trusting' | 'suspicious' | 'paranoid' | 'naive' | 'professional';
  weaknesses: string[];
  interests: string[];
  accessLevel: 'low' | 'medium' | 'high' | 'admin';
  currentMood: 'happy' | 'stressed' | 'angry' | 'neutral' | 'excited';
  trustLevel: number; // 0-100
  suspicionLevel: number; // 0-100
  lastContact: number;
  compromised: boolean;
  intel: SocialIntel[];
}

export interface SocialIntel {
  id: string;
  type: 'password' | 'access_code' | 'schedule' | 'weakness' | 'contact' | 'system_info';
  value: string;
  reliability: number; // 0-100
  source: string;
  timestamp: number;
  expires?: number;
}

export interface PhishingCampaign {
  id: string;
  name: string;
  type: 'email' | 'sms' | 'social_media' | 'fake_website';
  template: string;
  targets: string[];
  successRate: number;
  deployed: boolean;
  results: PhishingResult[];
  createdAt: number;
  expiresAt: number;
}

export interface PhishingResult {
  targetId: string;
  success: boolean;
  dataObtained: string[];
  suspicionRaised: number;
  timestamp: number;
}

export interface SocialEngineeringState {
  targets: Record<string, SocialTarget>;
  intel: SocialIntel[];
  phishingCampaigns: PhishingCampaign[];
  reputation: {
    trustworthy: number;
    manipulative: number;
    technical: number;
  };
  activeConversations: Record<string, ConversationState>;
}

export interface ConversationState {
  targetId: string;
  messages: ConversationMessage[];
  context: string;
  objective: string;
  progress: number;
  timeLimit?: number;
  startTime: number;
}

export interface ConversationMessage {
  sender: 'player' | 'target';
  content: string;
  timestamp: number;
  effectiveness: number;
  suspicionChange: number;
}

// Social Engineering Templates
export const phishingTemplates = {
  email: {
    urgent_security: {
      subject: "URGENT: Security Breach Detected",
      body: `Dear {name},

We've detected suspicious activity on your account. Please verify your credentials immediately to prevent unauthorized access.

Click here to secure your account: {phishing_link}

This is time-sensitive. Please act within 24 hours.

Best regards,
IT Security Team`,
      effectiveness: 75,
      suspicionRisk: 30
    },
    fake_promotion: {
      subject: "Congratulations! You've been selected",
      body: `Hi {name},

You've been selected for our exclusive promotion! Claim your reward by logging in with your credentials.

{phishing_link}

Limited time offer - expires soon!

Regards,
Marketing Team`,
      effectiveness: 60,
      suspicionRisk: 20
    },
    system_update: {
      subject: "System Maintenance - Action Required",
      body: `Hello {name},

Our systems will undergo maintenance this weekend. Please update your password to ensure continued access.

Update here: {phishing_link}

Thank you for your cooperation.

IT Department`,
      effectiveness: 80,
      suspicionRisk: 25
    }
  },
  social_media: {
    fake_friend: {
      message: "Hey! I think we met at the conference last month. Want to connect?",
      effectiveness: 50,
      suspicionRisk: 15
    },
    shared_interest: {
      message: "I saw your post about {interest}! I'm really into that too. Check out this cool link: {phishing_link}",
      effectiveness: 65,
      suspicionRisk: 20
    }
  }
};

// Conversation Keywords and Responses
export const conversationKeywords = {
  trust_building: ['understand', 'help', 'support', 'colleague', 'team'],
  authority: ['urgent', 'boss', 'manager', 'deadline', 'important'],
  fear: ['security', 'breach', 'hack', 'virus', 'problem'],
  curiosity: ['interesting', 'new', 'exclusive', 'special', 'secret'],
  reciprocity: ['favor', 'help', 'return', 'owe', 'appreciate']
};

export class SocialEngineeringSystem {
  private state: SocialEngineeringState;

  constructor(initialState?: Partial<SocialEngineeringState>) {
    this.state = {
      targets: {},
      intel: [],
      phishingCampaigns: [],
      reputation: { trustworthy: 50, manipulative: 50, technical: 50 },
      activeConversations: {},
      ...initialState
    };
  }

  // Generate random social targets
  generateTargets(count: number = 5): SocialTarget[] {
    const names = ['Sarah Chen', 'Mike Rodriguez', 'Emily Johnson', 'David Kim', 'Lisa Wang', 'Tom Anderson', 'Maria Garcia', 'James Wilson'];
    const roles = ['Developer', 'Manager', 'Admin', 'Analyst', 'Director', 'Intern', 'Consultant', 'Specialist'];
    const companies = ['TechCorp', 'DataSys', 'CyberSec Inc', 'InfoTech', 'NetSolutions', 'CloudBase', 'SecureNet'];
    
    const targets: SocialTarget[] = [];
    
    for (let i = 0; i < count; i++) {
      const target: SocialTarget = {
        id: `target_${Date.now()}_${i}`,
        name: names[Math.floor(Math.random() * names.length)],
        role: roles[Math.floor(Math.random() * roles.length)],
        company: companies[Math.floor(Math.random() * companies.length)],
        personality: ['trusting', 'suspicious', 'paranoid', 'naive', 'professional'][Math.floor(Math.random() * 5)] as any,
        weaknesses: this.generateWeaknesses(),
        interests: this.generateInterests(),
        accessLevel: ['low', 'medium', 'high', 'admin'][Math.floor(Math.random() * 4)] as any,
        currentMood: ['happy', 'stressed', 'angry', 'neutral', 'excited'][Math.floor(Math.random() * 5)] as any,
        trustLevel: Math.floor(Math.random() * 100),
        suspicionLevel: Math.floor(Math.random() * 30),
        lastContact: 0,
        compromised: false,
        intel: []
      };
      
      targets.push(target);
      this.state.targets[target.id] = target;
    }
    
    return targets;
  }

  private generateWeaknesses(): string[] {
    const allWeaknesses = [
      'authority_respect', 'time_pressure', 'social_proof', 'curiosity',
      'helpfulness', 'fear_of_consequences', 'technical_ignorance', 'overconfidence'
    ];
    const count = Math.floor(Math.random() * 3) + 1;
    return allWeaknesses.sort(() => 0.5 - Math.random()).slice(0, count);
  }

  private generateInterests(): string[] {
    const allInterests = [
      'technology', 'sports', 'music', 'travel', 'food', 'movies',
      'gaming', 'fitness', 'photography', 'books', 'art', 'science'
    ];
    const count = Math.floor(Math.random() * 4) + 2;
    return allInterests.sort(() => 0.5 - Math.random()).slice(0, count);
  }

  // Start a social engineering conversation
  startConversation(targetId: string, objective: string, approach: string): ConversationState {
    const target = this.state.targets[targetId];
    if (!target) throw new Error('Target not found');

    const conversation: ConversationState = {
      targetId,
      messages: [],
      context: approach,
      objective,
      progress: 0,
      timeLimit: 300, // 5 minutes
      startTime: Date.now()
    };

    this.state.activeConversations[targetId] = conversation;
    return conversation;
  }

  // Process conversation message
  processMessage(targetId: string, playerMessage: string): ConversationMessage[] {
    const conversation = this.state.activeConversations[targetId];
    const target = this.state.targets[targetId];
    
    if (!conversation || !target) throw new Error('Conversation or target not found');

    // Analyze player message effectiveness
    const effectiveness = this.analyzeMessageEffectiveness(playerMessage, target);
    const suspicionChange = this.calculateSuspicionChange(playerMessage, target);

    // Add player message
    const playerMsg: ConversationMessage = {
      sender: 'player',
      content: playerMessage,
      timestamp: Date.now(),
      effectiveness,
      suspicionChange
    };
    conversation.messages.push(playerMsg);

    // Update target state
    target.suspicionLevel = Math.max(0, Math.min(100, target.suspicionLevel + suspicionChange));
    target.trustLevel = Math.max(0, Math.min(100, target.trustLevel + (effectiveness - 50) / 2));

    // Generate target response
    const targetResponse = this.generateTargetResponse(target, playerMessage, effectiveness);
    const targetMsg: ConversationMessage = {
      sender: 'target',
      content: targetResponse,
      timestamp: Date.now(),
      effectiveness: 0,
      suspicionChange: 0
    };
    conversation.messages.push(targetMsg);

    // Update conversation progress
    conversation.progress += effectiveness / 100;

    return [playerMsg, targetMsg];
  }

  private analyzeMessageEffectiveness(message: string, target: SocialTarget): number {
    let effectiveness = 50; // Base effectiveness
    const lowerMessage = message.toLowerCase();

    // Check for keywords that match target weaknesses
    target.weaknesses.forEach(weakness => {
      const keywords = conversationKeywords[weakness as keyof typeof conversationKeywords] || [];
      keywords.forEach(keyword => {
        if (lowerMessage.includes(keyword)) {
          effectiveness += 15;
        }
      });
    });

    // Personality modifiers
    switch (target.personality) {
      case 'trusting':
        effectiveness += 10;
        break;
      case 'suspicious':
        effectiveness -= 15;
        break;
      case 'paranoid':
        effectiveness -= 25;
        break;
      case 'naive':
        effectiveness += 20;
        break;
      case 'professional':
        if (lowerMessage.includes('business') || lowerMessage.includes('work')) {
          effectiveness += 10;
        }
        break;
    }

    // Mood modifiers
    switch (target.currentMood) {
      case 'stressed':
        if (lowerMessage.includes('help') || lowerMessage.includes('urgent')) {
          effectiveness += 15;
        }
        break;
      case 'happy':
        effectiveness += 5;
        break;
      case 'angry':
        effectiveness -= 10;
        break;
    }

    return Math.max(0, Math.min(100, effectiveness));
  }

  private calculateSuspicionChange(message: string, target: SocialTarget): number {
    let suspicionChange = 0;
    const lowerMessage = message.toLowerCase();

    // Suspicious phrases
    const suspiciousPhrases = ['password', 'login', 'credentials', 'access', 'urgent', 'immediately'];
    suspiciousPhrases.forEach(phrase => {
      if (lowerMessage.includes(phrase)) {
        suspicionChange += 5;
      }
    });

    // Personality modifiers
    switch (target.personality) {
      case 'paranoid':
        suspicionChange += 10;
        break;
      case 'suspicious':
        suspicionChange += 5;
        break;
      case 'naive':
        suspicionChange -= 5;
        break;
    }

    return suspicionChange;
  }

  private generateTargetResponse(target: SocialTarget, playerMessage: string, effectiveness: number): string {
    const responses = {
      high_effectiveness: [
        "That makes sense. I can help you with that.",
        "Oh, I see. Let me think about this...",
        "You're right, that is important.",
        "I appreciate you bringing this to my attention."
      ],
      medium_effectiveness: [
        "Hmm, I'm not sure about that.",
        "Can you tell me more?",
        "That's interesting, but...",
        "I need to think about this."
      ],
      low_effectiveness: [
        "I don't think that's right.",
        "That sounds suspicious to me.",
        "I'm not comfortable with this.",
        "I think I should check with my supervisor."
      ],
      suspicious: [
        "Wait, who are you exactly?",
        "This doesn't seem legitimate.",
        "I'm going to report this.",
        "Something's not right here."
      ]
    };

    let responseCategory: keyof typeof responses;
    
    if (target.suspicionLevel > 70) {
      responseCategory = 'suspicious';
    } else if (effectiveness > 70) {
      responseCategory = 'high_effectiveness';
    } else if (effectiveness > 40) {
      responseCategory = 'medium_effectiveness';
    } else {
      responseCategory = 'low_effectiveness';
    }

    const categoryResponses = responses[responseCategory];
    return categoryResponses[Math.floor(Math.random() * categoryResponses.length)];
  }

  // Create phishing campaign
  createPhishingCampaign(name: string, type: keyof typeof phishingTemplates, templateKey: string, targets: string[]): PhishingCampaign {
    const template = phishingTemplates[type][templateKey as keyof typeof phishingTemplates[typeof type]];
    if (!template) throw new Error('Template not found');

    const campaign: PhishingCampaign = {
      id: `campaign_${Date.now()}`,
      name,
      type,
      template: JSON.stringify(template),
      targets,
      successRate: 0,
      deployed: false,
      results: [],
      createdAt: Date.now(),
      expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days
    };

    this.state.phishingCampaigns.push(campaign);
    return campaign;
  }

  // Deploy phishing campaign
  deployPhishingCampaign(campaignId: string): PhishingResult[] {
    const campaign = this.state.phishingCampaigns.find(c => c.id === campaignId);
    if (!campaign) throw new Error('Campaign not found');

    const template = JSON.parse(campaign.template);
    const results: PhishingResult[] = [];

    campaign.targets.forEach(targetId => {
      const target = this.state.targets[targetId];
      if (!target) return;

      // Calculate success probability
      let successChance = template.effectiveness;
      
      // Personality modifiers
      switch (target.personality) {
        case 'naive':
          successChance += 20;
          break;
        case 'trusting':
          successChance += 10;
          break;
        case 'suspicious':
          successChance -= 15;
          break;
        case 'paranoid':
          successChance -= 30;
          break;
      }

      // Suspicion level modifier
      successChance -= target.suspicionLevel / 2;

      const success = Math.random() * 100 < successChance;
      const suspicionRaised = success ? template.suspicionRisk / 2 : template.suspicionRisk;

      const result: PhishingResult = {
        targetId,
        success,
        dataObtained: success ? this.generateObtainedData(target) : [],
        suspicionRaised,
        timestamp: Date.now()
      };

      results.push(result);
      
      // Update target state
      target.suspicionLevel = Math.min(100, target.suspicionLevel + suspicionRaised);
      if (success) {
        target.compromised = true;
        // Add intel
        result.dataObtained.forEach(data => {
          const intel: SocialIntel = {
            id: `intel_${Date.now()}_${Math.random()}`,
            type: this.categorizeIntel(data),
            value: data,
            reliability: 85,
            source: target.name,
            timestamp: Date.now()
          };
          this.state.intel.push(intel);
          target.intel.push(intel);
        });
      }
    });

    campaign.results = results;
    campaign.deployed = true;
    campaign.successRate = (results.filter(r => r.success).length / results.length) * 100;

    return results;
  }

  private generateObtainedData(target: SocialTarget): string[] {
    const possibleData = [
      `${target.name.toLowerCase().replace(' ', '.')}@${target.company.toLowerCase()}.com`,
      `Password: ${this.generateFakePassword()}`,
      `Access Code: ${Math.floor(Math.random() * 9000) + 1000}`,
      `Manager: ${['John Smith', 'Jane Doe', 'Bob Johnson'][Math.floor(Math.random() * 3)]}`,
      `Department: ${target.role} Team`,
      `Phone: ${Math.floor(Math.random() * 9000000000) + 1000000000}`,
      `Badge ID: ${Math.floor(Math.random() * 90000) + 10000}`
    ];

    const count = Math.floor(Math.random() * 3) + 1;
    return possibleData.sort(() => 0.5 - Math.random()).slice(0, count);
  }

  private generateFakePassword(): string {
    const words = ['password', 'admin', 'user', 'login', 'secure'];
    const numbers = Math.floor(Math.random() * 999) + 1;
    const word = words[Math.floor(Math.random() * words.length)];
    return `${word}${numbers}`;
  }

  private categorizeIntel(data: string): SocialIntel['type'] {
    if (data.includes('@')) return 'contact';
    if (data.includes('Password')) return 'password';
    if (data.includes('Access Code')) return 'access_code';
    if (data.includes('Manager') || data.includes('Department')) return 'contact';
    return 'system_info';
  }

  // Get current state
  getState(): SocialEngineeringState {
    return { ...this.state };
  }

  // Update state
  updateState(newState: Partial<SocialEngineeringState>): void {
    this.state = { ...this.state, ...newState };
  }
}

// Export singleton instance
export const socialEngineeringSystem = new SocialEngineeringSystem(); 