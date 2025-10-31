import { Mission, MissionObjective, MissionProgressionState } from '../types/game';
import { apiRequest } from './queryClient';

export interface TieredMissionResponse {
  mission: {
    id: string;
    blueprintId: string;
    tierId: string;
    tierName: string;
    tierDescription: string;
    recommendedLevel: number;
    reputationRequirement: string;
    title: string;
    description: string;
    target: string;
    objectives: string[];
    rewards: {
      credits: number;
      reputation: number;
      unlocks?: string[];
    };
    hints: string[];
    commands: string[];
    difficulty: number;
    storyline: string;
    storyArc: string;
    narrativeBeats: string[];
    tags: string[];
    repeatable: boolean;
  };
  tier: {
    id: string;
    label: string;
    description: string;
    unlock: {
      minLevel: number;
      minReputation: string;
      recommendedCompletions?: number;
    };
    missionCount: number;
  };
  progression: {
    unlockedTiers: string[];
    recommendedTier: string;
    nextTier?: {
      id: string;
      label: string;
      minLevel: number;
      minReputation: string;
      recommendedCompletions?: number;
    };
    lastUpdated: number;
  };
}

export interface TieredMissionBatchResult {
  missions: Mission[];
  progression?: MissionProgressionState;
  raw: TieredMissionResponse[];
}

function difficultyFromScore(score: number): Mission['difficulty'] {
  if (score <= 2) return 'TRIVIAL';
  if (score <= 4) return 'EASY';
  if (score <= 6) return 'MEDIUM';
  if (score <= 8) return 'HARD';
  if (score <= 9) return 'BRUTAL';
  return 'LEGENDARY';
}

function categoryFromTags(tags: string[]): Mission['category'] {
  if (tags.includes('INFILTRATION')) return 'INFILTRATION';
  if (tags.includes('SABOTAGE')) return 'SABOTAGE';
  if (tags.includes('EXTRACTION')) return 'EXTRACTION';
  if (tags.includes('RECON')) return 'RECONNAISSANCE';
  if (tags.includes('SOCIAL')) return 'SOCIAL_ENGINEERING';
  if (tags.includes('CYBER_WARFARE')) return 'CYBER_WARFARE';
  if (tags.includes('SPECIAL')) return 'SPECIAL_OPS';
  return 'SPECIAL_OPS';
}

function buildObjectives(response: TieredMissionResponse['mission']): MissionObjective[] {
  return response.objectives.map((objective, index) => {
    const command = response.commands[index];
    return {
      id: `${response.blueprintId}_obj_${index}`,
      description: objective,
      type: command ? 'COMMAND' : 'CONDITION',
      command,
      completed: false,
    };
  });
}

function mapProgression(progression?: TieredMissionResponse['progression']): MissionProgressionState | undefined {
  if (!progression) return undefined;
  return {
    unlockedTiers: progression.unlockedTiers,
    recommendedTier: progression.recommendedTier,
    nextTier: progression.nextTier,
    lastUpdated: progression.lastUpdated,
  };
}

function convertToMission(response: TieredMissionResponse): Mission {
  const { mission } = response;
  const objectives = buildObjectives(mission);
  const creditReward = mission.rewards.credits;
  const experienceReward = Math.max(150, Math.round(creditReward * 0.6));

  const missionData: Mission = {
    id: mission.id,
    blueprintId: mission.blueprintId,
    title: mission.title,
    description: mission.description,
    briefing: mission.storyline,
    difficulty: difficultyFromScore(mission.difficulty),
    category: categoryFromTags(mission.tags),
    type: 'DYNAMIC',
    requiredLevel: mission.recommendedLevel,
    creditReward,
    experienceReward,
    reputationReward: mission.rewards.reputation,
    isRepeatable: mission.repeatable,
    objectives,
    unlocks: mission.rewards.unlocks,
    loreText: mission.storyline,
    storyArc: mission.storyArc,
    narrativeBeats: mission.narrativeBeats,
    tierId: mission.tierId,
    tierName: mission.tierName,
    tierDescription: mission.tierDescription,
    reputationRequirement: mission.reputationRequirement,
    recommendedLevelHint: mission.recommendedLevel,
    tags: mission.tags,
    consequences: mission.narrativeBeats?.slice(-2),
    dynamicContext: {
      tierId: response.tier.id,
      tierLabel: response.tier.label,
      progression: mapProgression(response.progression),
    },
    // Default optional mission fields
    requiredFaction: undefined,
    requiredSkills: undefined,
    requiredItems: undefined,
    timeLimit: undefined,
    stealthRequired: undefined,
    maxSuspicion: undefined,
    cooldownHours: undefined,
    factionReputationChanges: undefined,
    itemRewards: undefined,
    skillPointReward: undefined,
    availableFrom: undefined,
    availableUntil: undefined,
    maxAttempts: undefined,
    failureConditions: undefined,
    successConditions: undefined,
    eventId: undefined,
    dynamicEnvironment: true,
  } as Mission;

  return missionData;
}

export async function fetchTieredMissionBatch(
  playerLevel: number,
  completedMissionIds: string[],
  reputation: string,
  count: number = 3,
): Promise<TieredMissionBatchResult> {
  const response = await apiRequest('POST', '/api/missions/generate-batch', {
    playerLevel,
    completedMissions: completedMissionIds,
    reputation,
    count,
  });
  const payload: TieredMissionResponse[] = await response.json();
  const missions = payload.map(convertToMission);
  const progression = payload[payload.length - 1]?.progression
    ? mapProgression(payload[payload.length - 1].progression)
    : undefined;

  return {
    missions,
    progression,
    raw: payload,
  };
}

export async function fetchTieredMission(
  playerLevel: number,
  completedMissionIds: string[],
  reputation: string,
): Promise<{ mission: Mission; raw: TieredMissionResponse; progression?: MissionProgressionState }> {
  const response = await apiRequest('POST', '/api/missions/generate', {
    playerLevel,
    completedMissions: completedMissionIds,
    reputation,
  });
  const payload: TieredMissionResponse = await response.json();
  const mission = convertToMission(payload);

  return {
    mission,
    raw: payload,
    progression: mapProgression(payload.progression),
  };
}
