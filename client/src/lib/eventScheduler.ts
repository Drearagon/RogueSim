import { GameState, Mission, ScheduledEventState, EventScheduleState, EventProgress } from '../types/game';

const HOURS_TO_MS = 60 * 60 * 1000;

interface EventDefinition {
  id: string;
  title: string;
  description: string;
  anchor: number;
  rotationHours: number;
  durationHours: number;
  buildMissions: (context: { startTime: number; endTime: number; iteration: number }) => Mission[];
}

const eventDefinitions: EventDefinition[] = [
  {
    id: 'shadow_market_siege',
    title: 'Shadow Market Siege',
    description: 'Disrupt the Shadow Market cartel and seize their illicit data caches before they vanish.',
    anchor: Date.UTC(2024, 0, 5, 0, 0, 0),
    rotationHours: 24 * 14,
    durationHours: 72,
    buildMissions: ({ startTime, endTime, iteration }) => {
      const eventId = 'shadow_market_siege';
      return [
        {
          id: `${eventId}_${iteration}_breach_supply_lines`,
          eventId,
          title: 'Seize Shadow Market Supply Lines',
          description: 'Intercept cartel shipments and reroute valuable payloads to our network before they disappear.',
          briefing:
            'The Shadow Market cartel is rotating their encrypted shipments through a ghost network. Break their chain before the window closes.',
          difficulty: 'HARD',
          category: 'SABOTAGE',
          type: 'EVENT',
          requiredLevel: 7,
          creditReward: 2200,
          experienceReward: 600,
          reputationReward: 120,
          isRepeatable: false,
          timeLimit: 45 * 60,
          availableFrom: startTime,
          availableUntil: endTime,
          objectives: [
            {
              id: `${eventId}_${iteration}_scan_convoys`,
              description: 'Trace encrypted convoy routes in the Shadow Market overlay.',
              type: 'COMMAND',
              command: 'trace convoy --shadow',
              completed: false
            },
            {
              id: `${eventId}_${iteration}_inject_payloads`,
              description: 'Deploy counter payloads to divert the shipments.',
              type: 'COMMAND',
              command: 'inject payload --diversion',
              completed: false
            },
            {
              id: `${eventId}_${iteration}_exfiltrate_assets`,
              description: 'Exfiltrate seized assets to secure vaults before suspicion spikes.',
              type: 'COMMAND',
              command: 'exfiltrate assets --vault',
              completed: false
            }
          ]
        },
        {
          id: `${eventId}_${iteration}_dismantle_financiers`,
          eventId,
          title: 'Expose Cartel Financiers',
          description: 'Trace the Shadow Market backers and trigger cascading account freezes across their network.',
          briefing:
            'Shadow Market financiers are laundering credits through shell networks. Follow the money, seize the ledgers, and erase our trail.',
          difficulty: 'MEDIUM',
          category: 'RECONNAISSANCE',
          type: 'EVENT',
          requiredLevel: 6,
          creditReward: 1500,
          experienceReward: 400,
          reputationReward: 80,
          isRepeatable: false,
          availableFrom: startTime,
          availableUntil: endTime,
          objectives: [
            {
              id: `${eventId}_${iteration}_map_accounts`,
              description: 'Map hidden accounts connected to the Shadow Market.',
              type: 'COMMAND',
              command: 'map accounts --shadow',
              completed: false
            },
            {
              id: `${eventId}_${iteration}_breach_ledger`,
              description: 'Breach the encrypted ledger hub and duplicate critical records.',
              type: 'COMMAND',
              command: 'breach ledger --mirror',
              completed: false
            },
            {
              id: `${eventId}_${iteration}_deploy_locks`,
              description: 'Deploy automated account freezes to cut off their funding.',
              type: 'COMMAND',
              command: 'deploy locks --cascade',
              completed: false
            }
          ]
        }
      ];
    }
  },
  {
    id: 'quantum_breach_protocol',
    title: 'Quantum Breach Protocol',
    description: 'Counter a corporate quantum-defense rollout before it hardens the entire grid.',
    anchor: Date.UTC(2024, 1, 1, 12, 0, 0),
    rotationHours: 24 * 10,
    durationHours: 36,
    buildMissions: ({ startTime, endTime, iteration }) => {
      const eventId = 'quantum_breach_protocol';
      return [
        {
          id: `${eventId}_${iteration}_penetrate_array`,
          eventId,
          title: 'Penetrate Quantum Defense Array',
          description: 'Slip into the prototype quantum-defense lattice before it calibrates to hostile signatures.',
          briefing:
            'A megacorp is moments away from activating their quantum-defense array. Breach the array, tamper with calibration, and leave no trace.',
          difficulty: 'BRUTAL',
          category: 'CYBER_WARFARE',
          type: 'EVENT',
          requiredLevel: 11,
          creditReward: 3200,
          experienceReward: 950,
          reputationReward: 180,
          timeLimit: 30 * 60,
          isRepeatable: false,
          availableFrom: startTime,
          availableUntil: endTime,
          objectives: [
            {
              id: `${eventId}_${iteration}_deploy_quantum_tap`,
              description: 'Deploy a quantum tap to mirror lattice telemetry.',
              type: 'COMMAND',
              command: 'deploy tap --quantum',
              completed: false
            },
            {
              id: `${eventId}_${iteration}_forge_calibration`,
              description: 'Forge calibration data to delay their activation sequence.',
              type: 'COMMAND',
              command: 'forge calibration --delay',
              completed: false
            },
            {
              id: `${eventId}_${iteration}_seal_exit`,
              description: 'Seal your exit vectors before counter-intrusion engages.',
              type: 'COMMAND',
              command: 'seal exit --quantum',
              completed: false
            }
          ]
        },
        {
          id: `${eventId}_${iteration}_liberate_research`,
          eventId,
          title: 'Liberate Quantum Research Notes',
          description: 'Extract the research team’s encrypted notebooks before the lockout propagates.',
          briefing:
            'The research division is syncing their encrypted notebooks with the array. Copy their work, plant false signatures, and vanish.',
          difficulty: 'HARD',
          category: 'EXTRACTION',
          type: 'EVENT',
          requiredLevel: 10,
          creditReward: 2400,
          experienceReward: 700,
          reputationReward: 140,
          isRepeatable: false,
          availableFrom: startTime,
          availableUntil: endTime,
          objectives: [
            {
              id: `${eventId}_${iteration}_locate_notebooks`,
              description: 'Locate the encrypted research notebooks before lockdown.',
              type: 'COMMAND',
              command: 'scan research --quantum',
              completed: false
            },
            {
              id: `${eventId}_${iteration}_decrypt_notebooks`,
              description: 'Run synchronized decryption routines on the notebooks.',
              type: 'COMMAND',
              command: 'decrypt notebooks --sync',
              completed: false
            },
            {
              id: `${eventId}_${iteration}_plant_forged_logs`,
              description: 'Plant forged access logs to misdirect investigators.',
              type: 'COMMAND',
              command: 'plant logs --forged',
              completed: false
            }
          ]
        }
      ];
    }
  }
];

function ensureProgress(existing: EventProgress | undefined, eventId: string, timestamp: number): EventProgress {
  if (!existing) {
    return {
      eventId,
      missionStatus: {},
      isCompleted: false,
      lastUpdated: timestamp
    };
  }

  return {
    ...existing,
    missionStatus: { ...existing.missionStatus },
    lastUpdated: timestamp
  };
}

function mergeMissionStatus(
  progress: EventProgress,
  missions: Mission[]
): EventProgress {
  const missionStatus = { ...progress.missionStatus };
  missions.forEach(mission => {
    if (!missionStatus[mission.id]) {
      missionStatus[mission.id] = 'AVAILABLE';
    }
  });

  return {
    ...progress,
    missionStatus
  };
}

function createEventState(
  def: EventDefinition,
  iteration: number,
  startTime: number,
  endTime: number,
  missions: Mission[],
  isActive: boolean,
  progress: EventProgress
): ScheduledEventState {
  return {
    id: def.id,
    title: def.title,
    description: def.description,
    startTime,
    endTime,
    missionIds: missions.map(mission => mission.id),
    isActive,
    isCompleted: progress.isCompleted,
    missions,
    iteration
  };
}

export function applyEventSchedule(gameState: GameState, now: number = Date.now()): GameState {
  const baseSchedule: EventScheduleState = gameState.eventSchedule ?? {
    activeEvents: [],
    upcomingEvents: [],
    pastEvents: [],
    progress: {}
  };

  const updatedProgress: Record<string, EventProgress> = { ...baseSchedule.progress };
  const activeEvents: ScheduledEventState[] = [];
  const upcomingEvents: ScheduledEventState[] = [];
  const pastEvents: ScheduledEventState[] = [];
  const activeEventMissions: Mission[] = [];

  eventDefinitions.forEach(definition => {
    const rotationMs = definition.rotationHours * HOURS_TO_MS;
    const durationMs = definition.durationHours * HOURS_TO_MS;
    const progress = mergeMissionStatus(
      ensureProgress(updatedProgress[definition.id], definition.id, now),
      []
    );

    if (now < definition.anchor) {
      const startTime = definition.anchor;
      const endTime = startTime + durationMs;
      const upcomingMissions = definition.buildMissions({ startTime, endTime, iteration: 0 });
      const progressWithMissions = mergeMissionStatus(progress, upcomingMissions);

      updatedProgress[definition.id] = progressWithMissions;
      upcomingEvents.push(
        createEventState(definition, 0, startTime, endTime, upcomingMissions, false, progressWithMissions)
      );
      return;
    }

    const cyclesSinceAnchor = Math.floor((now - definition.anchor) / rotationMs);
    const currentStart = definition.anchor + cyclesSinceAnchor * rotationMs;
    const currentEnd = currentStart + durationMs;
    const nextStart = currentStart + rotationMs;
    const nextEnd = nextStart + durationMs;

    const currentMissions = definition.buildMissions({
      startTime: currentStart,
      endTime: currentEnd,
      iteration: cyclesSinceAnchor
    });
    const progressCurrent = mergeMissionStatus(progress, currentMissions);

    if (now <= currentEnd) {
      activeEvents.push(
        createEventState(definition, cyclesSinceAnchor, currentStart, currentEnd, currentMissions, true, progressCurrent)
      );

      if (!progressCurrent.isCompleted) {
        currentMissions.forEach(mission => {
          activeEventMissions.push({
            ...mission,
            availableFrom: currentStart,
            availableUntil: currentEnd,
            eventId: definition.id
          });
        });
      }
    } else {
      pastEvents.push(
        createEventState(definition, cyclesSinceAnchor, currentStart, currentEnd, currentMissions, false, progressCurrent)
      );
    }

    const nextIteration = cyclesSinceAnchor + 1;
    const upcomingMissions = definition.buildMissions({
      startTime: nextStart,
      endTime: nextEnd,
      iteration: nextIteration
    });
    const progressWithUpcoming = mergeMissionStatus(progressCurrent, upcomingMissions);

    upcomingEvents.push(
      createEventState(definition, nextIteration, nextStart, nextEnd, upcomingMissions, false, progressWithUpcoming)
    );

    progressWithUpcoming.lastUpdated = now;
    updatedProgress[definition.id] = progressWithUpcoming;
  });

  activeEvents.sort((a, b) => a.startTime - b.startTime);
  upcomingEvents.sort((a, b) => a.startTime - b.startTime);
  pastEvents.sort((a, b) => b.startTime - a.startTime);

  return {
    ...gameState,
    eventSchedule: {
      activeEvents,
      upcomingEvents,
      pastEvents,
      progress: updatedProgress
    },
    eventMissions: activeEventMissions
  };
}

export function getEventSchedule(gameState: GameState, now: number = Date.now()): EventScheduleState {
  return applyEventSchedule(gameState, now).eventSchedule;
}

export function getActiveEventMissions(gameState: GameState, now: number = Date.now()): Mission[] {
  return applyEventSchedule(gameState, now).eventMissions;
}
