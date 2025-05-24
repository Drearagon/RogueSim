import { GameState, Mission } from '../types/game';
import { getCurrentMission } from './missions';

// Track mission progress based on executed commands
export function trackMissionProgress(
  command: string, 
  args: string[], 
  success: boolean, 
  gameState: GameState
): Partial<GameState> {
  const currentMission = getCurrentMission(gameState);
  if (!currentMission) return {};

  const fullCommand = `${command} ${args.join(' ')}`.trim();
  
  // Find matching step in current mission
  const stepIndex = currentMission.steps.findIndex(step => 
    step.command === fullCommand && !step.completed
  );

  if (stepIndex === -1 || !success) return {};

  // Mark step as completed
  const updatedMission = {
    ...currentMission,
    steps: currentMission.steps.map((step, index) => 
      index === stepIndex ? { ...step, completed: true } : step
    )
  };

  // Check if mission is complete
  const allStepsCompleted = updatedMission.steps.every(step => step.completed);
  
  if (allStepsCompleted) {
    return {
      credits: gameState.credits + currentMission.reward,
      completedMissions: gameState.completedMissions + 1,
      currentMission: gameState.currentMission + 1,
      skillTree: {
        ...gameState.skillTree,
        skillPoints: gameState.skillTree.skillPoints + 1 // Earn skill point for completing mission
      }
    };
  }

  return {};
}