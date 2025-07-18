// Static mission generator - no AI integration needed

export interface MissionTemplate {
  id: string;
  title: string;
  description: string;
  difficulty: number;
  target: string;
  objectives: string[];
  rewards: {
    credits: number;
    reputation: number;
    unlocks: string[];
  };
  hints: string[];
  commands: string[];
  storyline: string;
}

export class StaticMissionGenerator {
  
  async generateMission(playerLevel: number, completedMissions: string[], reputation: string): Promise<MissionTemplate> {
    // Calculate difficulty based on player progression
    const baseDifficulty = Math.min(playerLevel * 0.5 + 1, 10);
    const difficultyVariance = Math.random() * 2 - 1; // -1 to +1
    const finalDifficulty = Math.max(1, Math.min(10, baseDifficulty + difficultyVariance));

    return this.createMission(playerLevel, finalDifficulty, completedMissions);
  }

  private createMission(playerLevel: number, difficulty: number, completedMissions: string[]): MissionTemplate {
    const missionTemplates = [
      {
        title: "Corporate Data Breach",
        description: "Infiltrate a major corporation's database and extract sensitive financial records.",
        target: "NeoTech Industries Database",
        objectives: [
          "Scan the corporate network for vulnerabilities",
          "Bypass the firewall using social engineering",
          "Access the financial database",
          "Extract quarterly earnings reports",
          "Erase access logs and disconnect"
        ],
        hints: [
          "Look for employees with weak passwords",
          "Check for outdated SSL certificates",
          "Use the 'stealth' command to avoid detection"
        ],
        commands: ["scan", "social_eng", "connect", "decrypt", "extract", "stealth"],
        storyline: "A whistleblower contacted you about illegal offshore accounts. The data could expose major tax evasion schemes."
      },
      {
        title: "Government Surveillance Hack",
        description: "Penetrate government surveillance systems to expose unconstitutional monitoring programs.",
        target: "Federal Security Agency Network",
        objectives: [
          "Identify surveillance network entry points",
          "Exploit zero-day vulnerabilities",
          "Access classified monitoring data",
          "Download surveillance program files",
          "Plant evidence for media leak"
        ],
        hints: [
          "Government systems use legacy software",
          "Look for insider access credentials",
          "Use 'proxy' to mask your location"
        ],
        commands: ["scan", "exploit", "proxy", "decrypt", "download", "plant"],
        storyline: "Citizens' privacy rights are being violated. This mission could spark a constitutional crisis."
      },
      {
        title: "Cryptocurrency Exchange Heist",
        description: "Target a major cryptocurrency exchange to redistribute funds to charity wallets.",
        target: "CryptoVault Exchange",
        objectives: [
          "Map the exchange's security architecture",
          "Compromise hot wallet systems",
          "Bypass multi-factor authentication",
          "Transfer funds to charity addresses",
          "Cover transaction traces"
        ],
        hints: [
          "Hot wallets are less secure than cold storage",
          "Look for API key vulnerabilities",
          "Use 'mixer' to obscure transaction trails"
        ],
        commands: ["scan", "crack", "bypass", "transfer", "mixer"],
        storyline: "The exchange has been hoarding funds while users lose access. Time to redistribute the wealth."
      },
      {
        title: "IoT Botnet Disruption",
        description: "Dismantle a criminal botnet composed of compromised IoT devices.",
        target: "MiraiNet Botnet Infrastructure",
        objectives: [
          "Locate botnet command servers",
          "Identify compromised IoT devices",
          "Inject liberation payload",
          "Restore devices to factory settings",
          "Document criminal network structure"
        ],
        hints: [
          "IoT devices often use default passwords",
          "Check for telnet access on port 23",
          "Use 'liberate' command to free devices"
        ],
        commands: ["scan", "telnet", "crack", "liberate", "document"],
        storyline: "Thousands of smart cameras and routers are being used for DDoS attacks. Help free them."
      },
      {
        title: "Medical Data Liberation",
        description: "Free patient data from a corrupt healthcare monopoly's proprietary systems.",
        target: "MedCorp Patient Database",
        objectives: [
          "Access patient record systems",
          "Identify data portability barriers",
          "Extract standardized medical records",
          "Anonymize sensitive information",
          "Provide data to ethical competitors"
        ],
        hints: [
          "Healthcare systems prioritize availability over security",
          "Look for HL7 FHIR API endpoints",
          "Use 'anonymize' to protect patient privacy"
        ],
        commands: ["scan", "connect", "extract", "anonymize", "transfer"],
        storyline: "Patients are locked into expensive systems. Help them own their own medical data."
      }
    ];

    const completedTitles = completedMissions.map(m => m.toLowerCase());
    const availableTemplates = missionTemplates.filter(template => 
      !completedTitles.includes(template.title.toLowerCase())
    );

    const selectedTemplate = availableTemplates.length > 0 
      ? availableTemplates[Math.floor(Math.random() * availableTemplates.length)]
      : missionTemplates[Math.floor(Math.random() * missionTemplates.length)];

    return {
      id: `static_mission_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: selectedTemplate.title,
      description: selectedTemplate.description,
      difficulty,
      target: selectedTemplate.target,
      objectives: selectedTemplate.objectives,
      rewards: {
        credits: Math.floor(difficulty * 500 + Math.random() * 1000),
        reputation: Math.floor(difficulty * 10),
        unlocks: difficulty > 5 ? ["advanced_payload"] : []
      },
      hints: selectedTemplate.hints,
      commands: selectedTemplate.commands,
      storyline: selectedTemplate.storyline
    };
  }

  async generateMissionBatch(playerLevel: number, completedMissions: string[], reputation: string, count: number = 3): Promise<MissionTemplate[]> {
    const missions: MissionTemplate[] = [];
    
    for (let i = 0; i < count; i++) {
      try {
        const mission = await this.generateMission(playerLevel, completedMissions, reputation);
        missions.push(mission);
        
        // Small delay to ensure unique IDs
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`Error generating mission ${i + 1}:`, error);
      }
    }
    
    return missions;
  }
}

export const missionGenerator = new StaticMissionGenerator();