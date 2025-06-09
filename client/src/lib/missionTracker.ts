// @ts-nocheck
import { GameState, Mission, BranchPoint, BranchChoice } from '../types/game';
import { getCurrentMission } from './missions';

// Track mission progress based on executed commands
export function trackMissionProgress(
  command: string, 
  args: string[], 
  success: boolean, 
  gameState: GameState
): Partial<GameState> & { shouldAwardCredits?: boolean } {
  const currentMission = getCurrentMission(gameState);
  if (!currentMission || !success) return {};

  const fullCommand = `${command} ${args.join(' ')}`.trim();
  
  // Get current mission step completion status
  const missionSteps = gameState.missionSteps[currentMission.id] || 
    new Array(currentMission.steps.length).fill(false);
  
  // Handle branching mission logic
  if (command === 'choose' && args.length > 0) {
    return handleBranchChoice(currentMission, args[0], gameState);
  }
  
  // Find the next uncompleted step that matches the command
  let stepIndex = -1;
  const availableSteps = getAvailableSteps(currentMission, gameState);
  
  for (let i = 0; i < availableSteps.length; i++) {
    const step = availableSteps[i];
    const originalIndex = currentMission.steps.findIndex(s => s.id === step.id);
    
    if (originalIndex !== -1 && !missionSteps[originalIndex] && 
        doesCommandMatch(fullCommand, step.command)) {
      stepIndex = originalIndex;
      break;
    }
  }

  if (stepIndex === -1) return {}; // No matching step found

  // Mark step as completed
  const updatedMissionSteps = [...missionSteps];
  updatedMissionSteps[stepIndex] = true;

  // Calculate progress percentage
  const completedSteps = updatedMissionSteps.filter(completed => completed).length;
  const totalSteps = currentMission.steps.length;
  const progressPercentage = Math.round((completedSteps / totalSteps) * 100);

  // Check if mission is complete
  const allStepsCompleted = updatedMissionSteps.every(completed => completed);
  
  const updates: Partial<GameState> & { shouldAwardCredits?: boolean } = {
    missionSteps: {
      ...gameState.missionSteps,
      [currentMission.id]: updatedMissionSteps
    },
    missionProgress: progressPercentage,
    shouldAwardCredits: true // This step completion should award credits
  };

  if (allStepsCompleted) {
    // Only complete mission if it hasn't been completed before
    if (gameState.currentMission === currentMission.id - 1) {
      // Calculate final reward based on choices made
      const finalReward = calculateDynamicReward(currentMission, gameState);
      
      // Trigger mission complete notification
      setTimeout(() => {
        const event = new CustomEvent('missionComplete', {
          detail: {
            missionTitle: currentMission.title,
            reward: finalReward
          }
        });
        window.dispatchEvent(event);
      }, 500);

      updates.credits = gameState.credits + finalReward;
      updates.experience = (gameState.experience || 0) + (currentMission.experienceReward || 0);
      const newLevel = Math.floor(updates.experience / 1000) + 1;
      if (newLevel > gameState.playerLevel) {
        updates.playerLevel = newLevel;
      }
      updates.completedMissions = gameState.completedMissions + 1;
      updates.currentMission = gameState.currentMission + 1;
      updates.missionProgress = 0; // Reset for next mission
      updates.skillTree = {
        ...gameState.skillTree,
        skillPoints: gameState.skillTree.skillPoints + 1
      };
    }
  }

  return updates;
}

// Handle branch choice selection
function handleBranchChoice(
  mission: Mission, 
  choiceIndex: string, 
  gameState: GameState
): Partial<GameState> {
  const choiceNum = parseInt(choiceIndex);
  if (isNaN(choiceNum)) return {};

  // Find the current branch point
  const currentStep = mission.steps.find(step => 
    step.branchPoint && !isStepCompleted(step, mission, gameState)
  );
  
  if (!currentStep?.branchPoint) return {};

  const choice = currentStep.branchPoint.choices[choiceNum - 1];
  if (!choice) return {};

  // Check skill requirements
  if (choice.skillRequirement && !hasRequiredSkill(choice.skillRequirement, gameState)) {
    return {
      // Return error state - this will be handled by the command system
    };
  }

  // Store the choice made
  const branchChoices = {
    ...gameState.branchChoices,
    [mission.id]: {
      ...gameState.branchChoices?.[mission.id],
      [currentStep.branchPoint.id]: choice.id
    }
  };

  // Update mission steps based on choice
  const missionSteps = gameState.missionSteps[mission.id] || 
    new Array(mission.steps.length).fill(false);
  
  // Mark the choice step as completed
  const stepIndex = mission.steps.findIndex(s => s.id === currentStep.id);
  if (stepIndex !== -1) {
    missionSteps[stepIndex] = true;
  }

  // Add dynamic steps based on choice
  const dynamicSteps = generateDynamicSteps(mission, choice, gameState);
  
  return {
    missionSteps: {
      ...gameState.missionSteps,
      [mission.id]: missionSteps
    },
    branchChoices,
    suspicionLevel: gameState.suspicionLevel + (choice.suspicionChange || 0),
    // Store dynamic steps for this mission
    dynamicMissionSteps: {
      ...gameState.dynamicMissionSteps,
      [mission.id]: dynamicSteps
    }
  };
}

// Generate dynamic mission steps based on branch choice
function generateDynamicSteps(mission: Mission, choice: BranchChoice, gameState: GameState) {
  if (!mission.branches) return [];
  
  // Find the branch that matches this choice
  const branch = mission.branches.find(b => 
    choice.nextSteps.some(stepId => 
      b.steps.some(s => s.id === stepId)
    )
  );
  
  if (!branch) return [];
  
  // Return the steps from the chosen branch
  return branch.steps.filter(step => 
    choice.nextSteps.includes(step.id || '')
  );
}

// Get available steps considering prerequisites and branch choices
function getAvailableSteps(mission: Mission, gameState: GameState) {
  const branchChoices = gameState.branchChoices?.[mission.id] || {};
  const dynamicSteps = gameState.dynamicMissionSteps?.[mission.id] || [];
  
  // Combine original steps with dynamic steps
  const allSteps = [...mission.steps, ...dynamicSteps];
  
  return allSteps.filter(step => {
    // Check prerequisites
    if (step.prerequisites) {
      return step.prerequisites.every((prereq: string) => 
        branchChoices[prereq] || isStepCompleted(step, mission, gameState)
      );
    }
    return true;
  });
}

// Check if a step is completed
function isStepCompleted(step: any, mission: Mission, gameState: GameState): boolean {
  const missionSteps = gameState.missionSteps[mission.id] || [];
  const stepIndex = mission.steps.findIndex(s => s.id === step.id);
  return stepIndex !== -1 && missionSteps[stepIndex];
}

// Check if player has required skill
function hasRequiredSkill(skillId: string, gameState: GameState): boolean {
  return gameState.skillTree.nodes.some(node => 
    node.id === skillId && node.purchased
  );
}

// Calculate dynamic reward based on choices made
function calculateDynamicReward(mission: Mission, gameState: GameState): number {
  if (!mission.dynamicReward) return mission.reward;
  
  const branchChoices = gameState.branchChoices?.[mission.id] || {};
  let rewardMultiplier = 1.0;
  
  // Apply reward modifiers from choices
  Object.values(branchChoices).forEach(choiceId => {
    mission.steps.forEach(step => {
      if (step.branchPoint) {
        const choice = step.branchPoint.choices.find(c => c.id === choiceId);
        if (choice) {
          rewardMultiplier *= choice.rewardModifier;
        }
      }
    });
  });
  
  return Math.floor(mission.dynamicReward * rewardMultiplier);
}

// Enhanced mission progress calculation using persistent storage
export function calculateMissionProgress(gameState: GameState): number {
  const currentMission = getCurrentMission(gameState);
  if (!currentMission) return 0;

  const missionSteps = gameState.missionSteps[currentMission.id] || 
    new Array(currentMission.steps.length).fill(false);
  
  const completedSteps = missionSteps.filter(completed => completed).length;
  const totalSteps = currentMission.steps.length;
  
  return Math.round((completedSteps / totalSteps) * 100);
}

// Get mission with current progress applied
export function getMissionWithProgress(gameState: GameState): Mission | null {
  const currentMission = getCurrentMission(gameState);
  if (!currentMission) return null;

  const missionSteps = gameState.missionSteps[currentMission.id] || 
    new Array(currentMission.steps.length).fill(false);
  
  // Get available steps based on branch choices
  const availableSteps = getAvailableSteps(currentMission, gameState);

  return {
    ...currentMission,
    steps: availableSteps.map((step, index) => {
      const originalIndex = currentMission.steps.findIndex(s => s.id === step.id);
      return {
        ...step,
        completed: originalIndex !== -1 ? missionSteps[originalIndex] : false
      };
    })
  };
}

// Check if specific mission step should be marked as completed
export function checkStepCompletion(
  command: string,
  args: string[],
  success: boolean,
  gameState: GameState
): boolean {
  const currentMission = getCurrentMission(gameState);
  if (!currentMission || !success) return false;

  const fullCommand = `${command} ${args.join(' ')}`.trim();
  const availableSteps = getAvailableSteps(currentMission, gameState);
  const missionSteps = gameState.missionSteps[currentMission.id] || 
    new Array(currentMission.steps.length).fill(false);
  
  // Check if there's a next uncompleted step that matches
  for (const step of availableSteps) {
    const originalIndex = currentMission.steps.findIndex(s => s.id === step.id);
    if (originalIndex !== -1 && !missionSteps[originalIndex] && 
        doesCommandMatch(fullCommand, step.command)) {
      return true;
    }
  }
  
  return false;
}

// Improved command matching function
function doesCommandMatch(inputCommand: string, stepCommand: string): boolean {
  const input = inputCommand.toLowerCase().trim();
  const step = stepCommand.toLowerCase().trim();
  
  // Exact match
  if (input === step) return true;
  
  // Handle command variations
  const inputParts = input.split(' ');
  const stepParts = step.split(' ');
  
  // Must have same base command
  if (inputParts[0] !== stepParts[0]) return false;
  
  // Special cases for flexible matching
  switch (inputParts[0]) {
    case 'scan':
      // "scan wifi" matches "scan wifi", "scan --passive" matches "scan --passive"
      return inputParts.slice(1).join(' ') === stepParts.slice(1).join(' ');
      
    case 'connect':
      // "connect TARGET_NET" matches "connect TARGET_NET"
      return inputParts[1] === stepParts[1];
      
    case 'inject':
      // "inject payload" or "inject basic_payload" matches "inject payload"
      if (step === 'inject payload') {
        return inputParts[1] === 'payload' || inputParts[1] === 'basic_payload';
      }
      return inputParts[1] === stepParts[1];
      
    case 'choose':
      // "choose" command for branch points
      return step === 'choose';
      
    default:
      // For other commands, require exact match
      return input === step;
  }
}

// Check if a command should award credits (only if it's completing a mission step)
export function shouldAwardCommandCredits(
  command: string,
  args: string[],
  success: boolean,
  gameState: GameState
): boolean {
  const currentMission = getCurrentMission(gameState);
  if (!currentMission || !success) return false;

  const fullCommand = `${command} ${args.join(' ')}`.trim();
  const availableSteps = getAvailableSteps(currentMission, gameState);
  const missionSteps = gameState.missionSteps[currentMission.id] || 
    new Array(currentMission.steps.length).fill(false);
  
  // Check if there's a next uncompleted step that matches
  for (const step of availableSteps) {
    const originalIndex = currentMission.steps.findIndex(s => s.id === step.id);
    if (originalIndex !== -1 && !missionSteps[originalIndex] && 
        doesCommandMatch(fullCommand, step.command)) {
      return true;
    }
  }
  
  return false;
}