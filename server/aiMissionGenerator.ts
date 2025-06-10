import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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

export class AIMissionGenerator {
  
  async generateMission(playerLevel: number, completedMissions: string[], reputation: string): Promise<MissionTemplate> {
    let finalDifficulty = 1;
    try {
      // Calculate difficulty based on player progression
      const baseDifficulty = Math.min(playerLevel * 0.5 + 1, 10);
      const difficultyVariance = Math.random() * 2 - 1; // -1 to +1
      finalDifficulty = Math.max(1, Math.min(10, baseDifficulty + difficultyVariance));

      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: `You are an AI mission generator for RogueSim, a cyberpunk hacking terminal game. Generate realistic hacking missions that feel authentic and challenging. 

Player Profile:
- Level: ${playerLevel}
- Reputation: ${reputation}
- Completed Missions: ${completedMissions.length}
- Mission Difficulty: ${finalDifficulty}/10

Create missions that involve real-world hacking concepts like:
- Network penetration testing
- Social engineering
- Database breaches
- IoT device exploitation
- Corporate espionage
- Government surveillance systems
- Cryptocurrency networks
- AI systems infiltration

Make the mission progressively challenging based on player level. Include specific terminal commands they'll need to use (scan, connect, inject, decrypt, exploit, etc.).

Respond with JSON in this exact format:`
          },
          {
            role: "user",
            content: `Generate a cyberpunk hacking mission with difficulty ${finalDifficulty}. Include realistic targets, objectives, and rewards that match the player's current skill level.`
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 1000
      });

      const missionData = JSON.parse(response.choices[0].message.content || '{}');
      
      // Ensure the mission follows our template structure
      const mission: MissionTemplate = {
        id: `ai_mission_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: missionData.title || "AI Generated Mission",
        description: missionData.description || "A challenging hacking mission awaits.",
        difficulty: finalDifficulty,
        target: missionData.target || "Unknown Target",
        objectives: missionData.objectives || ["Complete the mission objectives"],
        rewards: {
          credits: Math.floor(finalDifficulty * 500 + Math.random() * 1000),
          reputation: Math.floor(finalDifficulty * 10),
          unlocks: missionData.rewards?.unlocks || []
        },
        hints: missionData.hints || ["Use the scan command to gather information"],
        commands: missionData.commands || ["scan", "connect", "inject"],
        storyline: missionData.storyline || "Intel suggests this target holds valuable data."
      };

      return mission;
      
    } catch (error) {
      console.error("Error generating AI mission:", error);
      
      // Fallback mission if AI generation fails
      return this.createFallbackMission(playerLevel, finalDifficulty);
    }
  }

  private createFallbackMission(playerLevel: number, difficulty: number): MissionTemplate {
    const targets = [
      "NeoTech Industries Database",
      "CyberCore Financial System",
      "Quantum Labs Research Network",
      "MetroCity Traffic Control",
      "ShadowNet Communications Hub"
    ];

    const randomTarget = targets[Math.floor(Math.random() * targets.length)];
    
    return {
      id: `fallback_mission_${Date.now()}`,
      title: `Infiltrate ${randomTarget}`,
      description: `A high-value target has been identified. Your mission is to penetrate their security systems and extract critical data.`,
      difficulty,
      target: randomTarget,
      objectives: [
        "Scan the target network for vulnerabilities",
        "Establish a secure connection",
        "Inject payload to bypass security",
        "Extract sensitive data files",
        "Cover your tracks and disconnect"
      ],
      rewards: {
        credits: Math.floor(difficulty * 500 + Math.random() * 1000),
        reputation: Math.floor(difficulty * 10),
        unlocks: difficulty > 5 ? ["advanced_payload"] : []
      },
      hints: [
        "Start with a network scan to identify open ports",
        "Look for outdated security protocols",
        "Use stealth mode to avoid detection"
      ],
      commands: ["scan", "connect", "inject", "decrypt", "extract"],
      storyline: "Intelligence reports suggest this target contains valuable corporate secrets that could be worth millions on the dark market."
    };
  }

  async generateMissionBatch(playerLevel: number, completedMissions: string[], reputation: string, count: number = 3): Promise<MissionTemplate[]> {
    const missions: MissionTemplate[] = [];
    
    for (let i = 0; i < count; i++) {
      try {
        const mission = await this.generateMission(playerLevel, completedMissions, reputation);
        missions.push(mission);
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`Error generating mission ${i + 1}:`, error);
      }
    }
    
    return missions;
  }
}

export const aiMissionGenerator = new AIMissionGenerator();