import {
  missionTierCatalog,
  type MissionTierDefinition,
  type MissionTierId,
  type TierMissionBlueprint,
  type ReputationRank,
} from './missions/missionData';

export interface MissionTemplate {
  id: string;
  blueprintId: string;
  tierId: MissionTierId;
  tierName: string;
  tierDescription: string;
  recommendedLevel: number;
  reputationRequirement: ReputationRank;
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
}

export interface MissionProgressionSnapshot {
  unlockedTiers: MissionTierId[];
  recommendedTier: MissionTierId;
  nextTier?: {
    id: MissionTierId;
    label: string;
    minLevel: number;
    minReputation: ReputationRank;
    recommendedCompletions?: number;
  };
  lastUpdated: number;
}

export interface GeneratedMission {
  mission: MissionTemplate;
  tier: {
    id: MissionTierId;
    label: string;
    description: string;
    unlock: MissionTierDefinition['unlock'];
    missionCount: number;
  };
  progression: MissionProgressionSnapshot;
}

const reputationHierarchy: ReputationRank[] = [
  'UNKNOWN',
  'NOVICE',
  'ROOKIE',
  'OPERATIVE',
  'VETERAN',
  'ELITE',
  'LEGEND',
  'MYTHIC',
];

const blueprintIndex = new Map<string, { tier: MissionTierDefinition; blueprint: TierMissionBlueprint }>();
missionTierCatalog.forEach((tier) => {
  tier.missions.forEach((blueprint) => {
    blueprintIndex.set(blueprint.id, { tier, blueprint });
  });
});

function normalizeReputation(value: string): ReputationRank {
  const upper = value?.toUpperCase?.() ?? 'UNKNOWN';
  const matched = reputationHierarchy.find((rank) => rank === upper);
  if (matched) return matched;
  // Handle descriptive ranks that may not match exactly (e.g., 'LEGENDARY').
  if (upper.startsWith('LEGEND')) return 'LEGEND';
  if (upper.startsWith('VETERAN')) return 'VETERAN';
  if (upper.startsWith('ELITE')) return 'ELITE';
  if (upper.startsWith('ROOKIE')) return 'ROOKIE';
  if (upper.startsWith('OPERATIVE')) return 'OPERATIVE';
  if (upper.startsWith('NOVICE')) return 'NOVICE';
  return 'UNKNOWN';
}

function reputationScore(rank: ReputationRank): number {
  const idx = reputationHierarchy.indexOf(rank);
  return idx === -1 ? 0 : idx;
}

function matchCompletedBlueprints(completedMissions: string[]): Set<string> {
  if (!completedMissions?.length) return new Set();
  const completedSet = new Set<string>();
  const lookup = Array.from(blueprintIndex.keys());
  const lowered = completedMissions.map((id) => id.toLowerCase());

  lowered.forEach((entry) => {
    const match = lookup.find((blueprintId) => entry.includes(blueprintId.toLowerCase()));
    if (match) {
      completedSet.add(match);
    }
  });

  return completedSet;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function chooseCategoryWeight(blueprint: TierMissionBlueprint, playerLevel: number): number {
  const levelDelta = Math.abs(blueprint.recommendedLevel - playerLevel);
  const base = levelDelta;
  const repeatPenalty = blueprint.repeatable ? 0.5 : 0;
  return base + repeatPenalty;
}

export class TieredMissionGenerator {
  private buildProgression(
    playerLevel: number,
    reputation: ReputationRank,
  ): { unlockedTiers: MissionTierDefinition[]; nextTier?: MissionTierDefinition } {
    const unlocked = missionTierCatalog.filter(
      (tier) =>
        playerLevel >= tier.unlock.minLevel &&
        reputationScore(reputation) >= reputationScore(tier.unlock.minReputation),
    );

    const nextTier = missionTierCatalog.find((tier) => !unlocked.some((unlockedTier) => unlockedTier.id === tier.id));

    return { unlockedTiers: unlocked, nextTier };
  }

  private selectBlueprint(
    playerLevel: number,
    completedBlueprints: Set<string>,
    availableTiers: MissionTierDefinition[],
  ): { tier: MissionTierDefinition; blueprint: TierMissionBlueprint } {
    const candidates: Array<{ tier: MissionTierDefinition; blueprint: TierMissionBlueprint; weight: number }> = [];

    availableTiers.forEach((tier) => {
      tier.missions.forEach((blueprint) => {
        if (blueprint.prerequisites?.some((prereq) => !completedBlueprints.has(prereq))) {
          return;
        }

        const alreadyCompleted = completedBlueprints.has(blueprint.id);
        if (alreadyCompleted && !blueprint.repeatable) {
          return;
        }

        const weight = chooseCategoryWeight(blueprint, playerLevel) + (alreadyCompleted ? 5 : 0);
        candidates.push({ tier, blueprint, weight });
      });
    });

    if (candidates.length === 0) {
      // As a fallback, surface something from the first tier even if everything is completed.
      const fallbackTier = availableTiers[0] ?? missionTierCatalog[0];
      const fallbackBlueprint = fallbackTier.missions[0];
      return { tier: fallbackTier, blueprint: fallbackBlueprint };
    }

    candidates.sort((a, b) => a.weight - b.weight);
    return { tier: candidates[0].tier, blueprint: candidates[0].blueprint };
  }

  private buildMissionTemplate(
    tier: MissionTierDefinition,
    blueprint: TierMissionBlueprint,
    playerLevel: number,
    reputation: ReputationRank,
  ): MissionTemplate {
    const difficultyAdjustment = (playerLevel - blueprint.recommendedLevel) * 0.25;
    const difficulty = Math.round(clamp(blueprint.difficulty + difficultyAdjustment, 1, 10));

    const creditScale = blueprint.rewards.credits;
    const rewardMultiplier = 1 + Math.max(0, playerLevel - blueprint.recommendedLevel) * 0.12;
    const credits = Math.round(creditScale * rewardMultiplier);

    const reputationBonus = blueprint.rewards.reputation + Math.max(0, reputationScore(tier.unlock.minReputation) - reputationScore(reputation)) * 2;

    return {
      id: `${blueprint.id}::${Date.now().toString(36)}`,
      blueprintId: blueprint.id,
      tierId: tier.id,
      tierName: tier.label,
      tierDescription: tier.description,
      recommendedLevel: blueprint.recommendedLevel,
      reputationRequirement: tier.unlock.minReputation,
      title: blueprint.title,
      description: blueprint.synopsis,
      target: blueprint.target,
      objectives: [...blueprint.objectives],
      rewards: {
        credits,
        reputation: reputationBonus,
        unlocks: blueprint.rewards.unlocks,
      },
      hints: [...blueprint.hints],
      commands: [...blueprint.commands],
      difficulty,
      storyline: blueprint.storyline,
      storyArc: tier.label,
      narrativeBeats: [...blueprint.narrativeBeats],
      tags: [...blueprint.tags],
      repeatable: Boolean(blueprint.repeatable),
    };
  }

  async generateMission(
    playerLevel: number,
    completedMissions: string[],
    reputation: string,
  ): Promise<GeneratedMission> {
    const normalizedReputation = normalizeReputation(reputation);
    const { unlockedTiers, nextTier } = this.buildProgression(playerLevel, normalizedReputation);
    const availableTiers = unlockedTiers.length > 0 ? unlockedTiers : [missionTierCatalog[0]];

    const completedBlueprints = matchCompletedBlueprints(completedMissions);

    const { tier, blueprint } = this.selectBlueprint(playerLevel, completedBlueprints, availableTiers);
    const mission = this.buildMissionTemplate(tier, blueprint, playerLevel, normalizedReputation);

    const progression: MissionProgressionSnapshot = {
      unlockedTiers: availableTiers.map((available) => available.id),
      recommendedTier: tier.id,
      nextTier: nextTier
        ? {
            id: nextTier.id,
            label: nextTier.label,
            minLevel: nextTier.unlock.minLevel,
            minReputation: nextTier.unlock.minReputation,
            recommendedCompletions: nextTier.unlock.recommendedCompletions,
          }
        : undefined,
      lastUpdated: Date.now(),
    };

    return {
      mission,
      tier: {
        id: tier.id,
        label: tier.label,
        description: tier.description,
        unlock: tier.unlock,
        missionCount: tier.missions.length,
      },
      progression,
    };
  }

  async generateMissionBatch(
    playerLevel: number,
    completedMissions: string[],
    reputation: string,
    count: number = 3,
  ): Promise<GeneratedMission[]> {
    const results: GeneratedMission[] = [];
    const completedBlueprints = new Set(completedMissions);

    for (let i = 0; i < count; i++) {
      const missionResult = await this.generateMission(playerLevel, Array.from(completedBlueprints), reputation);
      results.push(missionResult);
      completedBlueprints.add(missionResult.mission.blueprintId);
    }

    return results;
  }
}

export const missionGenerator = new TieredMissionGenerator();
