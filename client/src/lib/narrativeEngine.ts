interface NarrativeTemplate {
  id: string;
  category: 'corporate' | 'government' | 'criminal' | 'activist' | 'mystery';
  difficulty: number;
  themes: string[];
  protagonists: string[];
  antagonists: string[];
  locations: string[];
  motives: string[];
  complications: string[];
  twists: string[];
}

interface GeneratedNarrative {
  title: string;
  briefing: string;
  backgroundStory: string;
  objectives: string[];
  plotTwists: string[];
  characterDialogue: {
    speaker: string;
    role: string;
    mood: 'neutral' | 'urgent' | 'confident' | 'warning' | 'mysterious';
    text: string;
  }[];
  consequences: {
    success: string;
    failure: string;
    discovery: string;
  };
}

export class NarrativeEngine {
  private templates: NarrativeTemplate[] = [
    {
      id: 'corp_espionage',
      category: 'corporate',
      difficulty: 3,
      themes: ['industrial espionage', 'corporate warfare', 'trade secrets', 'insider threats'],
      protagonists: ['whistleblower employee', 'rival company agent', 'investigative journalist'],
      antagonists: ['security chief', 'corrupt executive', 'private military contractor'],
      locations: ['corporate headquarters', 'data center', 'executive boardroom', 'server farm'],
      motives: ['expose corruption', 'steal technology', 'prevent hostile takeover', 'protect shareholders'],
      complications: ['insider turned double agent', 'advanced AI security', 'federal investigation'],
      twists: ['target is honeypot', 'client is the real enemy', 'data is already compromised']
    },
    {
      id: 'gov_conspiracy',
      category: 'government',
      difficulty: 5,
      themes: ['government surveillance', 'classified operations', 'national security', 'cover-up'],
      protagonists: ['government whistleblower', 'foreign intelligence agent', 'activist hacker'],
      antagonists: ['intelligence director', 'military general', 'shadow organization'],
      locations: ['government facility', 'military base', 'intelligence agency', 'secure bunker'],
      motives: ['expose illegal surveillance', 'prevent war', 'protect democracy', 'reveal truth'],
      complications: ['international incident', 'multiple agencies involved', 'deep state conspiracy'],
      twists: ['operation is legitimate', 'whistleblower is foreign agent', 'data leads to bigger conspiracy']
    },
    {
      id: 'cyber_crime',
      category: 'criminal',
      difficulty: 4,
      themes: ['organized crime', 'money laundering', 'dark web', 'cybercrime syndicate'],
      protagonists: ['law enforcement agent', 'rival criminal', 'reformed hacker'],
      antagonists: ['crime boss', 'corrupt official', 'mercenary hacker'],
      locations: ['underground server farm', 'abandoned warehouse', 'luxury penthouse', 'offshore facility'],
      motives: ['dismantle criminal network', 'recover stolen funds', 'rescue hostage', 'prevent attack'],
      complications: ['law enforcement corruption', 'international borders', 'civilian casualties'],
      twists: ['target is undercover agent', 'crime boss is government asset', 'operation is sting']
    }
  ];

  private corporateNames = [
    'NexaCorp', 'CyberDyne Systems', 'Quantum Industries', 'TechNova', 'DataFlow Inc',
    'NeuroLink', 'Synapse Corp', 'Helix Dynamics', 'Apex Technologies', 'Genesis Labs'
  ];

  private hackerNames = [
    'Shadow_Walker', 'Cipher_Ghost', 'Digital_Phantom', 'Code_Breaker', 'Binary_Viper',
    'Neon_Runner', 'Void_Hacker', 'Quantum_Fox', 'Dark_Protocol', 'Cyber_Wraith'
  ];

  private locations = [
    'Neo Tokyo Data Center', 'Silicon Valley HQ', 'Geneva Research Facility',
    'Hong Kong Financial District', 'Berlin Underground Lab', 'Moscow Server Farm',
    'London Financial Center', 'Singapore Tech Hub', 'Dubai Crypto Exchange'
  ];

  generateMissionNarrative(
    playerLevel: number,
    reputation: string,
    completedMissions: string[],
    preferences?: {
      category?: string;
      complexity?: 'simple' | 'complex';
      theme?: string;
    }
  ): GeneratedNarrative {
    // Select appropriate template based on player level and preferences
    const availableTemplates = this.templates.filter(template => {
      const levelMatch = template.difficulty <= Math.min(playerLevel + 2, 6);
      const categoryMatch = !preferences?.category || template.category === preferences.category;
      return levelMatch && categoryMatch;
    });

    const template = availableTemplates[Math.floor(Math.random() * availableTemplates.length)] || this.templates[0];
    
    // Generate core narrative elements
    const protagonist = this.selectRandom(template.protagonists);
    const antagonist = this.selectRandom(template.antagonists);
    const location = this.selectRandom([...template.locations, ...this.locations]);
    const motive = this.selectRandom(template.motives);
    const complication = this.selectRandom(template.complications);
    const twist = this.selectRandom(template.twists);
    const theme = this.selectRandom(template.themes);

    // Generate corporate/organization names
    const targetOrg = this.selectRandom(this.corporateNames);
    const clientOrg = this.selectRandom(this.corporateNames.filter(name => name !== targetOrg));

    // Create narrative based on template and elements
    const narrative = this.buildNarrative(template, {
      protagonist,
      antagonist,
      location,
      motive,
      complication,
      twist,
      theme,
      targetOrg,
      clientOrg,
      playerLevel,
      reputation
    });

    return narrative;
  }

  private selectRandom<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  private buildNarrative(template: NarrativeTemplate, elements: any): GeneratedNarrative {
    const { category, difficulty } = template;
    const { protagonist, antagonist, location, motive, complication, twist, theme, targetOrg, clientOrg, playerLevel, reputation } = elements;

    // Generate title
    const titlePrefixes = {
      corporate: ['Operation', 'Project', 'Initiative'],
      government: ['Classified', 'Operation', 'Protocol'],
      criminal: ['Heist', 'Takedown', 'Infiltration'],
      activist: ['Liberation', 'Revelation', 'Exposure'],
      mystery: ['Enigma', 'Shadow', 'Phantom']
    };

    const titleSuffixes = [
      'Blackout', 'Nexus', 'Phoenix', 'Catalyst', 'Vortex',
      'Eclipse', 'Prism', 'Matrix', 'Cipher', 'Vector'
    ];

    const title = `${this.selectRandom(titlePrefixes[category])} ${this.selectRandom(titleSuffixes)}`;

    // Generate briefing
    const briefing = this.generateBriefing(category, elements);

    // Generate background story
    const backgroundStory = this.generateBackgroundStory(category, elements);

    // Generate objectives
    const objectives = this.generateObjectives(category, elements, difficulty);

    // Generate plot twists
    const plotTwists = this.generatePlotTwists(template, elements);

    // Generate character dialogue
    const characterDialogue = this.generateDialogue(category, elements);

    // Generate consequences
    const consequences = this.generateConsequences(category, elements);

    return {
      title,
      briefing,
      backgroundStory,
      objectives,
      plotTwists,
      characterDialogue,
      consequences
    };
  }

  private generateBriefing(category: string, elements: any): string {
    const briefings = {
      corporate: `A ${elements.protagonist} has contacted us with critical intelligence about ${elements.targetOrg}. 
                 They claim the corporation is involved in ${elements.theme} and has requested our assistance to ${elements.motive}. 
                 The primary target is located at ${elements.location}, but intelligence suggests ${elements.complication}. 
                 This operation requires maximum discretion and advanced technical skills.`,
      
      government: `Classified intelligence indicates a potential security breach at ${elements.location}. 
                  A ${elements.protagonist} has provided evidence suggesting ${elements.theme} operations are ongoing. 
                  Your mission is to ${elements.motive} while avoiding detection by ${elements.antagonist}. 
                  Be aware that ${elements.complication} which significantly increases operational risk.`,
      
      criminal: `Underground sources report unusual activity at ${elements.targetOrg}'s ${elements.location}. 
                A ${elements.protagonist} claims the organization is involved in ${elements.theme} and wants to ${elements.motive}. 
                However, intelligence suggests the presence of ${elements.antagonist} and ${elements.complication}. 
                This job pays well but carries significant personal risk.`,
      
      activist: `Leaked documents reveal ${elements.targetOrg} is engaged in ${elements.theme}. 
                A ${elements.protagonist} has provided evidence and is asking for help to ${elements.motive}. 
                The target facility at ${elements.location} contains the proof needed to expose the truth. 
                Expect resistance from ${elements.antagonist} and be prepared for ${elements.complication}.`,
      
      mystery: `Strange signals have been detected from ${elements.location}. 
               A ${elements.protagonist} has gone missing while investigating ${elements.theme}. 
               Your task is to ${elements.motive} and uncover the truth behind their disappearance. 
               Preliminary investigation suggests involvement of ${elements.antagonist} and ${elements.complication}.`
    };

    return briefings[category] || briefings.corporate;
  }

  private generateBackgroundStory(category: string, elements: any): string {
    return `Three months ago, ${elements.protagonist} discovered disturbing evidence of ${elements.theme} 
            within ${elements.targetOrg}. Initial investigations revealed a complex network involving ${elements.antagonist} 
            and operations spanning multiple locations including ${elements.location}. 
            The situation became critical when ${elements.complication} was discovered, 
            forcing our client to seek external assistance. Recent intelligence suggests that ${elements.twist}, 
            adding another layer of complexity to an already dangerous operation.`;
  }

  private generateObjectives(category: string, elements: any, difficulty: number): string[] {
    const baseObjectives = [
      `Infiltrate ${elements.location} without triggering security alerts`,
      `Locate and extract data related to ${elements.theme}`,
      `Identify the role of ${elements.antagonist} in the operation`,
      `Gather evidence to ${elements.motive}`
    ];

    const advancedObjectives = [
      `Plant surveillance malware in primary servers`,
      `Extract encrypted communication logs`,
      `Identify and document all personnel involved`,
      `Establish persistent backdoor access for future operations`,
      `Sabotage security systems to aid future infiltration`
    ];

    const objectives = [...baseObjectives];
    
    if (difficulty >= 4) {
      objectives.push(...advancedObjectives.slice(0, difficulty - 3));
    }

    return objectives;
  }

  private generatePlotTwists(template: NarrativeTemplate, elements: any): string[] {
    return [
      `Discovery that ${elements.twist}`,
      `${elements.protagonist} reveals hidden agenda`,
      `Security breach exposes operation to ${elements.antagonist}`,
      `Evidence points to larger conspiracy involving ${elements.clientOrg}`
    ];
  }

  private generateDialogue(category: string, elements: any) {
    const dialogues = {
      corporate: [
        {
          speaker: 'Anonymous Contact',
          role: 'Whistleblower',
          mood: 'urgent' as const,
          text: `Listen carefully. ${elements.targetOrg} isn't what it appears to be. They're involved in ${elements.theme} and it goes all the way to the top. I can't talk long - they're watching everything.`
        },
        {
          speaker: 'Security Chief',
          role: 'Antagonist',
          mood: 'warning' as const,
          text: `We've detected unusual network activity. Increase security protocols immediately. If there's a breach, heads will roll. No one gets in or out without my authorization.`
        },
        {
          speaker: 'Deep Throat',
          role: 'Informant',
          mood: 'mysterious' as const,
          text: `The real question isn't what they're hiding, but why they want you to find it. Sometimes the most dangerous trap is the one that looks like a treasure chest.`
        }
      ],
      government: [
        {
          speaker: 'Agent Phoenix',
          role: 'Handler',
          mood: 'confident' as const,
          text: `This operation is classified at the highest levels. What you're about to uncover could change everything we thought we knew about ${elements.theme}. Trust no one except this channel.`
        },
        {
          speaker: 'The Director',
          role: 'Authority',
          mood: 'warning' as const,
          text: `I don't care what your clearance level is. This facility is off-limits for a reason. Turn back now, or face the consequences of your unauthorized intrusion.`
        },
        {
          speaker: 'Rogue Agent',
          role: 'Ally',
          mood: 'urgent' as const,
          text: `They burned my cover when I got too close to the truth. ${elements.location} isn't just a facility - it's the heart of something much bigger. Watch your back in there.`
        }
      ],
      criminal: [
        {
          speaker: 'The Broker',
          role: 'Client',
          mood: 'neutral' as const,
          text: `${elements.targetOrg} has something that belongs to my employer. Retrieve it quietly, leave no traces, and there's a substantial bonus waiting for you. Fail, and you're on your own.`
        },
        {
          speaker: 'Rival Hacker',
          role: 'Competitor',
          mood: 'confident' as const,
          text: `You're not the only one after that data. I've been watching ${elements.location} for weeks. Maybe we should work together... or maybe I should just take you out of the equation.`
        },
        {
          speaker: 'Crime Boss',
          role: 'Antagonist',
          mood: 'warning' as const,
          text: `Word is someone's been asking questions about my operation. I don't like questions. I especially don't like people who ask them. Consider this your only warning.`
        }
      ]
    };

    return dialogues[category] || dialogues.corporate;
  }

  private generateConsequences(category: string, elements: any) {
    return {
      success: `Mission accomplished! Evidence of ${elements.theme} has been secured and ${elements.motive} achieved. 
               ${elements.protagonist} can now expose ${elements.targetOrg}'s activities. 
               Your reputation in the hacker community has increased significantly.`,
      
      failure: `Mission compromised! ${elements.antagonist} detected the intrusion and activated security countermeasures. 
              ${elements.protagonist} has gone dark and may be compromised. 
              ${elements.targetOrg} is now aware of the investigation and will increase security measures.`,
      
      discovery: `Partial success with complications. While the primary objective was achieved, 
                 the discovery that ${elements.twist} has changed everything. 
                 New intel suggests this is just the beginning of a much larger conspiracy.`
    };
  }

  generateRandomEncounter(difficulty: number): {
    title: string;
    description: string;
    choices: Array<{
      text: string;
      outcome: string;
      effect: 'positive' | 'negative' | 'neutral';
    }>;
  } {
    const encounters = [
      {
        title: 'Security Alert',
        description: 'Motion sensors have detected your presence. Security is investigating.',
        choices: [
          {
            text: 'Hide and wait for patrol to pass',
            outcome: 'You remain undetected but lose valuable time.',
            effect: 'neutral' as const
          },
          {
            text: 'Create distraction in another area',
            outcome: 'Guards investigate the distraction, giving you a clear path.',
            effect: 'positive' as const
          },
          {
            text: 'Disable the security system',
            outcome: 'System disabled but your hack is detected. Alert level increased.',
            effect: 'negative' as const
          }
        ]
      },
      {
        title: 'Encrypted Database',
        description: 'You\'ve found the target data but it\'s protected by advanced encryption.',
        choices: [
          {
            text: 'Attempt to crack encryption immediately',
            outcome: 'Encryption broken but triggers intrusion detection systems.',
            effect: 'negative' as const
          },
          {
            text: 'Copy encrypted data for later analysis',
            outcome: 'Data secured safely but requires additional time to decrypt.',
            effect: 'neutral' as const
          },
          {
            text: 'Search for encryption keys in system files',
            outcome: 'Keys found! Data accessed without triggering alarms.',
            effect: 'positive' as const
          }
        ]
      }
    ];

    return this.selectRandom(encounters);
  }
}