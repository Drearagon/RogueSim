import { 
  Faction, 
  FactionRank, 
  PlayerFactionStanding, 
  FactionMission, 
  FactionEvent,
  FactionWar,
  GameState 
} from '../types/game';

// The Three Core Factions from the Enhancement Plan
export const factions: Record<string, Faction> = {
  serpent_syndicate: {
    id: 'serpent_syndicate',
    name: '🐍 Serpent Syndicate',
    description: 'Masters of stealth and infiltration. They strike from the shadows.',
    philosophy: 'Silence is golden, invisibility is priceless. Leave no trace, take everything.',
    specialization: {
      type: 'stealth',
      bonuses: [
        {
          type: 'detection_reduction',
          value: 25,
          description: 'Reduced detection chance on all operations',
          conditions: ['stealth_missions']
        },
        {
          type: 'time_bonus',
          value: 20,
          description: 'Faster execution of infiltration commands',
          conditions: ['inject', 'backdoor', 'spoof']
        },
        {
          type: 'credit_multiplier',
          value: 1.5,
          description: 'Bonus credits for undetected operations',
          conditions: ['zero_suspicion']
        }
      ],
      penalties: [
        {
          type: 'command_failure',
          value: 15,
          description: 'Reduced success rate for brute force attacks',
          conditions: ['exploit', 'ddos', 'brute_force']
        }
      ]
    },
    color: '#10B981', // Green
    icon: '🐍',
    requirements: [
      {
        type: 'mission_completion',
        value: 5,
        description: 'Complete 5 stealth missions without detection'
      }
    ],
    benefits: [
      {
        type: 'exclusive_access',
        value: 1,
        description: 'Access to stealth-only missions and equipment',
        category: 'missions'
      },
      {
        type: 'discount',
        value: 30,
        description: 'Discount on stealth tools and software',
        category: 'shop'
      }
    ],
    exclusiveCommands: ['ghost_mode', 'silent_inject', 'phantom_scan', 'shadow_tunnel'],
    exclusiveMissions: ['corporate_infiltration', 'data_ghost', 'silent_extraction'],
    rivalFactions: ['crimson_circuit'],
    maxReputation: 10000
  },

  crimson_circuit: {
    id: 'crimson_circuit',
    name: '🛠️ Crimson Circuit',
    description: 'Brute force specialists who believe in overwhelming firepower.',
    philosophy: 'Why pick the lock when you can break down the door? Power through everything.',
    specialization: {
      type: 'brute_force',
      bonuses: [
        {
          type: 'command_success',
          value: 30,
          description: 'Increased success rate for aggressive attacks',
          conditions: ['exploit', 'ddos', 'brute_force', 'crack']
        },
        {
          type: 'credit_multiplier',
          value: 2.0,
          description: 'Double credits for high-damage operations',
          conditions: ['system_damage']
        },
        {
          type: 'time_bonus',
          value: 40,
          description: 'Faster brute force and exploitation commands',
          conditions: ['aggressive_commands']
        }
      ],
      penalties: [
        {
          type: 'detection_increase',
          value: 50,
          description: 'Significantly higher detection rates',
          conditions: ['all_operations']
        },
        {
          type: 'credit_reduction',
          value: 25,
          description: 'Reduced rewards for stealth operations',
          conditions: ['stealth_missions']
        }
      ]
    },
    color: '#EF4444', // Red
    icon: '🛠️',
    requirements: [
      {
        type: 'mission_completion',
        value: 3,
        description: 'Complete 3 high-damage assault missions'
      }
    ],
    benefits: [
      {
        type: 'exclusive_access',
        value: 1,
        description: 'Access to military-grade exploits and weapons',
        category: 'weapons'
      },
      {
        type: 'bonus_rewards',
        value: 50,
        description: 'Bonus credits for destructive operations',
        category: 'missions'
      }
    ],
    exclusiveCommands: ['overload_system', 'emp_blast', 'data_nuke', 'siege_mode'],
    exclusiveMissions: ['corporate_raid', 'infrastructure_assault', 'data_destruction'],
    rivalFactions: ['serpent_syndicate'],
    maxReputation: 10000
  },

  mirage_loop: {
    id: 'mirage_loop',
    name: '👁 Mirage Loop',
    description: 'Masters of deception, manipulation, and social engineering.',
    philosophy: 'The greatest hack is convincing someone to give you the keys willingly.',
    specialization: {
      type: 'deception',
      bonuses: [
        {
          type: 'command_success',
          value: 35,
          description: 'Increased success rate for social engineering',
          conditions: ['phish', 'social_engineer', 'impersonate']
        },
        {
          type: 'unlock_access',
          value: 1,
          description: 'Access to exclusive social manipulation tools',
          conditions: ['reputation_high']
        },
        {
          type: 'credit_multiplier',
          value: 1.8,
          description: 'Bonus credits for manipulation-based operations',
          conditions: ['social_missions']
        }
      ],
      penalties: [
        {
          type: 'command_failure',
          value: 20,
          description: 'Reduced effectiveness of technical exploits',
          conditions: ['technical_commands']
        }
      ]
    },
    color: '#8B5CF6', // Purple
    icon: '👁',
    requirements: [
      {
        type: 'skill_level',
        value: 3,
        description: 'Reach level 3 in social engineering skills'
      }
    ],
    benefits: [
      {
        type: 'special_abilities',
        value: 1,
        description: 'Ability to manipulate faction standings',
        category: 'social'
      },
      {
        type: 'protection',
        value: 25,
        description: 'Reduced reputation loss from failed operations',
        category: 'reputation'
      }
    ],
    exclusiveCommands: ['deep_fake', 'identity_theft', 'mass_manipulation', 'reality_distort'],
    exclusiveMissions: ['corporate_espionage', 'political_manipulation', 'identity_heist'],
    rivalFactions: [],
    maxReputation: 10000
  }
};

// Faction Ranks System
export const factionRanks: Record<string, FactionRank[]> = {
  serpent_syndicate: [
    {
      id: 'initiate',
      name: 'Shadow Initiate',
      level: 1,
      requiredReputation: 0,
      benefits: ['Basic stealth training', 'Access to beginner missions'],
      title: 'Initiate',
      permissions: ['basic_stealth_missions']
    },
    {
      id: 'operative',
      name: 'Ghost Operative',
      level: 2,
      requiredReputation: 1000,
      benefits: ['Advanced stealth tools', '15% detection reduction'],
      title: 'Operative',
      permissions: ['intermediate_stealth_missions', 'stealth_equipment']
    },
    {
      id: 'assassin',
      name: 'Digital Assassin',
      level: 3,
      requiredReputation: 3000,
      benefits: ['Elite stealth missions', '25% detection reduction', 'Phantom protocols'],
      title: 'Assassin',
      permissions: ['advanced_stealth_missions', 'phantom_protocols']
    },
    {
      id: 'shadow_master',
      name: 'Shadow Master',
      level: 4,
      requiredReputation: 6000,
      benefits: ['Master-tier missions', '35% detection reduction', 'Shadow network access'],
      title: 'Shadow Master',
      permissions: ['master_stealth_missions', 'shadow_network', 'recruit_operatives']
    },
    {
      id: 'serpent_lord',
      name: 'Serpent Lord',
      level: 5,
      requiredReputation: 10000,
      benefits: ['Legendary missions', '50% detection reduction', 'Command authority'],
      title: 'Lord of Serpents',
      permissions: ['legendary_missions', 'faction_leadership', 'shadow_council']
    }
  ],
  crimson_circuit: [
    {
      id: 'recruit',
      name: 'Circuit Recruit',
      level: 1,
      requiredReputation: 0,
      benefits: ['Basic assault training', 'Access to demolition tools'],
      title: 'Recruit',
      permissions: ['basic_assault_missions']
    },
    {
      id: 'enforcer',
      name: 'Data Enforcer',
      level: 2,
      requiredReputation: 1000,
      benefits: ['Advanced exploits', '20% damage bonus'],
      title: 'Enforcer',
      permissions: ['intermediate_assault_missions', 'heavy_exploits']
    },
    {
      id: 'destroyer',
      name: 'System Destroyer',
      level: 3,
      requiredReputation: 3000,
      benefits: ['Military-grade tools', '35% damage bonus', 'EMP capabilities'],
      title: 'Destroyer',
      permissions: ['advanced_assault_missions', 'emp_weapons']
    },
    {
      id: 'warlord',
      name: 'Cyber Warlord',
      level: 4,
      requiredReputation: 6000,
      benefits: ['Siege protocols', '50% damage bonus', 'Command squad'],
      title: 'Warlord',
      permissions: ['siege_missions', 'command_squad', 'territory_control']
    },
    {
      id: 'circuit_overlord',
      name: 'Circuit Overlord',
      level: 5,
      requiredReputation: 10000,
      benefits: ['Apocalypse protocols', '75% damage bonus', 'Faction supremacy'],
      title: 'Overlord of Circuits',
      permissions: ['apocalypse_missions', 'faction_warfare', 'crimson_throne']
    }
  ],
  mirage_loop: [
    {
      id: 'apprentice',
      name: 'Mirage Apprentice',
      level: 1,
      requiredReputation: 0,
      benefits: ['Basic manipulation training', 'Social engineering tools'],
      title: 'Apprentice',
      permissions: ['basic_social_missions']
    },
    {
      id: 'illusionist',
      name: 'Digital Illusionist',
      level: 2,
      requiredReputation: 1000,
      benefits: ['Advanced deception tools', '20% manipulation success'],
      title: 'Illusionist',
      permissions: ['intermediate_social_missions', 'identity_tools']
    },
    {
      id: 'puppeteer',
      name: 'Mind Puppeteer',
      level: 3,
      requiredReputation: 3000,
      benefits: ['Mass manipulation', '35% social success', 'Deep fake technology'],
      title: 'Puppeteer',
      permissions: ['advanced_social_missions', 'deep_fake_tech']
    },
    {
      id: 'architect',
      name: 'Reality Architect',
      level: 4,
      requiredReputation: 6000,
      benefits: ['Reality distortion', '50% social success', 'Perception control'],
      title: 'Architect',
      permissions: ['reality_missions', 'perception_control', 'mind_networks']
    },
    {
      id: 'loop_master',
      name: 'Loop Master',
      level: 5,
      requiredReputation: 10000,
      benefits: ['Total reality control', '75% social success', 'Dimensional authority'],
      title: 'Master of the Loop',
      permissions: ['dimensional_missions', 'reality_sovereignty', 'mirage_throne']
    }
  ]
};

// Faction-specific missions
export const factionMissions: Record<string, FactionMission[]> = {
  serpent_syndicate: [
    {
      id: 'shadow_infiltration',
      factionId: 'serpent_syndicate',
      title: 'Shadow Infiltration',
      description: 'Infiltrate a corporate network without triggering any alarms',
      difficulty: 'MEDIUM',
      reputationReward: 200,
      creditReward: 1500,
      requirements: [
        {
          type: 'reputation',
          value: 500,
          description: 'Minimum Serpent Syndicate reputation'
        }
      ],
      consequences: [
        {
          targetFaction: 'crimson_circuit',
          reputationChange: -50,
          description: 'Crimson Circuit disapproves of stealth tactics',
          permanent: false
        }
      ],
      isRepeatable: true,
      cooldownHours: 24
    },
    {
      id: 'phantom_extraction',
      factionId: 'serpent_syndicate',
      title: 'Phantom Data Extraction',
      description: 'Extract sensitive data without leaving any digital footprints',
      difficulty: 'HARD',
      reputationReward: 400,
      creditReward: 3000,
      requirements: [
        {
          type: 'reputation',
          value: 1500,
          description: 'Advanced Serpent Syndicate standing required'
        }
      ],
      consequences: [],
      isRepeatable: false
    }
  ],
  crimson_circuit: [
    {
      id: 'data_siege',
      factionId: 'crimson_circuit',
      title: 'Data Center Siege',
      description: 'Launch a full-scale assault on a fortified data center',
      difficulty: 'HARD',
      reputationReward: 300,
      creditReward: 2500,
      requirements: [
        {
          type: 'reputation',
          value: 800,
          description: 'Proven combat effectiveness required'
        }
      ],
      consequences: [
        {
          targetFaction: 'serpent_syndicate',
          reputationChange: -75,
          description: 'Serpent Syndicate condemns reckless destruction',
          permanent: false
        }
      ],
      isRepeatable: true,
      cooldownHours: 48
    },
    {
      id: 'infrastructure_demolition',
      factionId: 'crimson_circuit',
      title: 'Infrastructure Demolition',
      description: 'Systematically destroy enemy digital infrastructure',
      difficulty: 'BRUTAL',
      reputationReward: 600,
      creditReward: 5000,
      requirements: [
        {
          type: 'reputation',
          value: 2500,
          description: 'Elite Crimson Circuit status required'
        }
      ],
      consequences: [],
      isRepeatable: false
    }
  ],
  mirage_loop: [
    {
      id: 'corporate_manipulation',
      factionId: 'mirage_loop',
      title: 'Corporate Board Manipulation',
      description: 'Manipulate corporate executives to gain insider access',
      difficulty: 'MEDIUM',
      reputationReward: 250,
      creditReward: 2000,
      requirements: [
        {
          type: 'reputation',
          value: 600,
          description: 'Demonstrated social engineering skills'
        }
      ],
      consequences: [],
      isRepeatable: true,
      cooldownHours: 36
    },
    {
      id: 'reality_distortion',
      factionId: 'mirage_loop',
      title: 'Reality Distortion Campaign',
      description: 'Launch a massive disinformation campaign to reshape public perception',
      difficulty: 'LEGENDARY',
      reputationReward: 800,
      creditReward: 7500,
      requirements: [
        {
          type: 'reputation',
          value: 4000,
          description: 'Master-level manipulation abilities required'
        }
      ],
      consequences: [
        {
          targetFaction: 'serpent_syndicate',
          reputationChange: 25,
          description: 'Serpent Syndicate appreciates the subtlety',
          permanent: false
        },
        {
          targetFaction: 'crimson_circuit',
          reputationChange: -25,
          description: 'Crimson Circuit finds it too indirect',
          permanent: false
        }
      ],
      isRepeatable: false
    }
  ]
};

// Faction utility functions
export function getPlayerFactionRank(factionId: string, reputation: number): FactionRank {
  const ranks = factionRanks[factionId] || [];
  let currentRank = ranks[0];
  
  for (const rank of ranks) {
    if (reputation >= rank.requiredReputation) {
      currentRank = rank;
    } else {
      break;
    }
  }
  
  return currentRank;
}

export function canJoinFaction(factionId: string, gameState: GameState): { canJoin: boolean; reason?: string } {
  const faction = factions[factionId];
  if (!faction) return { canJoin: false, reason: 'Faction not found' };
  
  // Check if already in a rival faction
  for (const rivalId of faction.rivalFactions) {
    if (gameState.factionStandings[rivalId]?.isActive) {
      return { 
        canJoin: false, 
        reason: `Cannot join due to active membership in rival faction: ${factions[rivalId]?.name}` 
      };
    }
  }
  
  // Check requirements
  for (const requirement of faction.requirements) {
    switch (requirement.type) {
      case 'mission_completion':
        if (gameState.completedMissions < requirement.value) {
          return { 
            canJoin: false, 
            reason: `Need ${requirement.value} completed missions (have ${gameState.completedMissions})` 
          };
        }
        break;
      case 'credits':
        if (gameState.credits < requirement.value) {
          return { 
            canJoin: false, 
            reason: `Need ${requirement.value} credits (have ${gameState.credits})` 
          };
        }
        break;
      case 'reputation':
        const standing = gameState.factionStandings[factionId];
        if (!standing || standing.reputation < requirement.value) {
          return { 
            canJoin: false, 
            reason: `Need ${requirement.value} reputation with this faction` 
          };
        }
        break;
    }
  }
  
  return { canJoin: true };
}

export function calculateFactionBonus(
  factionId: string, 
  command: string, 
  gameState: GameState
): { successBonus: number; creditMultiplier: number; timeBonus: number } {
  const standing = gameState.factionStandings[factionId];
  if (!standing?.isActive) {
    return { successBonus: 0, creditMultiplier: 1, timeBonus: 0 };
  }
  
  const faction = factions[factionId];
  if (!faction) {
    return { successBonus: 0, creditMultiplier: 1, timeBonus: 0 };
  }
  
  let successBonus = 0;
  let creditMultiplier = 1;
  let timeBonus = 0;
  
  for (const bonus of faction.specialization.bonuses) {
    const conditionsMet = bonus.conditions?.every(condition => {
      switch (condition) {
        case 'stealth_missions':
          return ['inject', 'backdoor', 'spoof', 'ghost_mode'].includes(command);
        case 'aggressive_commands':
          return ['exploit', 'ddos', 'crack', 'overload_system'].includes(command);
        case 'social_missions':
          return ['phish', 'social_engineer', 'impersonate'].includes(command);
        case 'zero_suspicion':
          return gameState.suspicionLevel === 0;
        default:
          return true;
      }
    }) ?? true;
    
    if (conditionsMet) {
      switch (bonus.type) {
        case 'command_success':
          successBonus += bonus.value;
          break;
        case 'credit_multiplier':
          creditMultiplier *= bonus.value;
          break;
        case 'time_bonus':
          timeBonus += bonus.value;
          break;
        case 'detection_reduction':
          // This would be handled in the suspicion system
          break;
      }
    }
  }
  
  return { successBonus, creditMultiplier, timeBonus };
}

export function initializeFactionStandings(): Record<string, PlayerFactionStanding> {
  const standings: Record<string, PlayerFactionStanding> = {};
  
  Object.keys(factions).forEach(factionId => {
    standings[factionId] = {
      factionId,
      reputation: 0,
      rank: factionRanks[factionId][0],
      joinedDate: 0,
      missionsCompleted: 0,
      creditsEarned: 0,
      specialAchievements: [],
      isActive: false,
      canLeave: true
    };
  });
  
  return standings;
}

export function getAvailableFactionMissions(factionId: string, gameState: GameState): FactionMission[] {
  const missions = factionMissions[factionId] || [];
  const standing = gameState.factionStandings[factionId];
  
  if (!standing?.isActive) return [];
  
  return missions.filter(mission => {
    // Check if already completed (for non-repeatable missions)
    if (!mission.isRepeatable && gameState.completedFactionMissions.includes(mission.id)) {
      return false;
    }
    
    // Check cooldown
    if (mission.cooldownHours) {
      const lastCompleted = gameState.factionMissionCooldowns[mission.id];
      if (lastCompleted && Date.now() - lastCompleted < mission.cooldownHours * 60 * 60 * 1000) {
        return false;
      }
    }
    
    // Check requirements
    return mission.requirements.every(req => {
      switch (req.type) {
        case 'reputation':
          return standing.reputation >= req.value;
        case 'mission_completion':
          return gameState.completedMissions >= req.value;
        case 'credits':
          return gameState.credits >= req.value;
        default:
          return true;
      }
    });
  });
}

// Faction events system
export function generateRandomFactionEvent(gameState: GameState): FactionEvent | null {
  // Only generate events if player is in a faction
  if (!gameState.activeFaction) return null;
  
  const events: FactionEvent[] = [
    {
      id: 'rival_faction_offer',
      title: 'Rival Faction Approach',
      description: 'A rival faction has approached you with a lucrative offer to switch sides.',
      choices: [
        {
          id: 'accept_offer',
          text: 'Accept the offer',
          description: 'Switch factions and gain immediate benefits',
          reputationChanges: {
            [gameState.activeFaction]: -1000,
            // Would be set dynamically based on rival faction
          },
          creditChange: 5000,
          unlocks: ['faction_traitor_achievement']
        },
        {
          id: 'reject_offer',
          text: 'Reject and report',
          description: 'Stay loyal and report the approach',
          reputationChanges: {
            [gameState.activeFaction]: 200
          },
          creditChange: 1000,
          unlocks: ['faction_loyalty_achievement']
        },
        {
          id: 'double_agent',
          text: 'Become a double agent',
          description: 'Pretend to accept while staying loyal',
          reputationChanges: {
            [gameState.activeFaction]: 100
          },
          creditChange: 2500,
          unlocks: ['double_agent_achievement'],
          requirements: [
            {
              type: 'reputation',
              value: 2000,
              description: 'High reputation required for this risky move'
            }
          ]
        }
      ],
      timeLimit: 300, // 5 minutes
      consequences: ['Faction relationships will be permanently affected']
    }
  ];
  
  // Return random event with 10% chance
  return Math.random() < 0.1 ? events[Math.floor(Math.random() * events.length)] : null;
} 