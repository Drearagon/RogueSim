import { useState, useCallback, useEffect } from 'react';
import { GameState } from '../types/game';
import { loadGameState, saveGameState } from '../lib/gameStorage';
import { initializeFactionStandings } from '../lib/factionSystem';
import { getInitialUnlockedCommands } from '../lib/commands';
import { applyEventSchedule } from '../lib/eventScheduler';

export function useGameState() {
  const [gameState, setGameState] = useState<GameState>(() => applyEventSchedule({
    currentMission: 0,
    credits: 500,
    reputation: 'UNKNOWN',
    completedMissions: 0,
    unlockedCommands: getInitialUnlockedCommands(),
    missionProgress: 0,
    networkStatus: 'DISCONNECTED',
    soundEnabled: true,
    isBootComplete: false,
    tutorialStatus: 'pending',
    playerLevel: 1,
    experience: 0,
    hydraProtocol: {
      discovered: false,
      access_level: 0,
      current_branch: 'main',
      completed_nodes: [],
      active_contacts: [],
      shadow_org_standing: 'UNKNOWN',
      encrypted_messages: []
    },
    narrativeChoices: [],
    suspicionLevel: 0,
    skillTree: {
      nodes: [],
      skillPoints: 5,
      totalSkillsUnlocked: 0,
      specializationBonuses: {}
    },
    inventory: {
      hardware: [],
      software: [],
      payloads: [],
      intel: []
    },
    ui: {
      activeInterface: 'none',
      shopTab: 'hardware',
      selectedItem: null
    },
    missionSteps: {},
    branchChoices: {},
    dynamicMissionSteps: {},
    // Faction system state - properly initialized
    factionStandings: initializeFactionStandings(),
    activeFaction: undefined,
    factionEvents: [],
    completedFactionMissions: [],
    factionMissionCooldowns: {},
    activeFactionWars: [],
    factionAchievements: [],
    // Enhanced Mission System
    availableMissions: [],
    activeMission: undefined,
    currentMissionProgress: undefined,
    completedMissionIds: [],
    failedMissionIds: [],
    missionHistory: [],
    specialMissionActive: false,
    specialMissionData: undefined,
    customTerminalState: undefined,
    missionCooldowns: {},
    emergencyMissions: [],
    eventSchedule: {
      activeEvents: [],
      upcomingEvents: [],
      pastEvents: [],
      progress: {}
    },
    eventMissions: []
  }));

  const [isLoading, setIsLoading] = useState(true);

  // Load initial state when component mounts
  useEffect(() => {
    const initializeGameState = async () => {
      try {
        const loadedState = await loadGameState();
        // Ensure faction standings are initialized even in loaded state
        if (!loadedState.factionStandings || Object.keys(loadedState.factionStandings).length === 0) {
          loadedState.factionStandings = initializeFactionStandings();
        }
        if (!loadedState.tutorialStatus) {
          loadedState.tutorialStatus = 'pending';
        }
        setGameState(applyEventSchedule(loadedState));
      } catch (error) {
        console.warn('Failed to load game state, using defaults:', error);
        // Keep default state if loading fails
      } finally {
        setIsLoading(false);
      }
    };

    initializeGameState();
  }, []);

  const updateGameState = useCallback((updates: Partial<GameState>) => {
    setGameState(prev => {
      const newState = applyEventSchedule({ ...prev, ...updates });
      
      // Immediate synchronous save for critical updates like skill purchases
      try {
        saveGameState(newState);
        
        // Log skill tree updates for debugging
        if (updates.skillTree) {
          console.log('Skill tree state updated:', {
            skillPoints: newState.skillTree.skillPoints,
            totalSkills: newState.skillTree.totalSkillsUnlocked,
            nodes: newState.skillTree.nodes.filter(n => n.purchased).length
          });
        }
      } catch (error) {
        console.error('Critical: Failed to save game state:', error);
      }
      
      return newState;
    });
  }, []);

  const resetGame = useCallback(async () => {
    try {
      const defaultState = await loadGameState();
      // Ensure faction standings are initialized in reset state
      if (!defaultState.factionStandings || Object.keys(defaultState.factionStandings).length === 0) {
        defaultState.factionStandings = initializeFactionStandings();
      }
      // Ensure mission properties are initialized
      if (!defaultState.availableMissions) defaultState.availableMissions = [];
      if (!defaultState.completedMissionIds) defaultState.completedMissionIds = [];
      if (!defaultState.failedMissionIds) defaultState.failedMissionIds = [];
      if (!defaultState.missionHistory) defaultState.missionHistory = [];
      if (!defaultState.missionCooldowns) defaultState.missionCooldowns = {};
      if (!defaultState.emergencyMissions) defaultState.emergencyMissions = [];
      
      const scheduledState = applyEventSchedule(defaultState);
      setGameState(scheduledState);
      await saveGameState(scheduledState);
    } catch (error) {
      console.warn('Failed to reset game:', error);
    }
  }, []);

  return {
    gameState,
    updateGameState,
    resetGame,
    isLoading
  };
}
