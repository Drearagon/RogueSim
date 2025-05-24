import { Terminal } from './Terminal';
import { MissionPanel } from './MissionPanel';
import { MatrixRain } from './MatrixRain';
import { GameState } from '../types/game';
import { getCurrentMission } from '../lib/missions';

interface GameInterfaceProps {
  gameState: GameState;
  onGameStateUpdate: (updates: Partial<GameState>) => void;
}

export function GameInterface({ gameState, onGameStateUpdate }: GameInterfaceProps) {
  const currentMission = getCurrentMission(gameState);

  return (
    <div className="min-h-screen w-full max-w-full flex flex-col bg-black text-green-500 relative overflow-x-hidden">
      <MatrixRain />
      
      {/* Scanline effect */}
      <div className="absolute inset-0 pointer-events-none z-10">
        <div 
          className="absolute w-full h-0.5 bg-gradient-to-r from-transparent via-green-500/20 to-transparent scanline-animation"
        />
      </div>
      
      {/* Mobile-first layout: Terminal on top, mission panel as collapsible bottom */}
      <div className="flex-1 min-h-0 md:ml-80">
        <Terminal gameState={gameState} onGameStateUpdate={onGameStateUpdate} />
      </div>
      
      {/* Mission panel - collapsible on mobile */}
      <div className="md:hidden">
        <MissionPanel gameState={gameState} currentMission={currentMission} />
      </div>
      
      {/* Desktop: Mission panel on side */}
      <div className="hidden md:block md:fixed md:left-0 md:top-0 md:h-full md:z-20">
        <MissionPanel gameState={gameState} currentMission={currentMission} />
      </div>

    </div>
  );
}
