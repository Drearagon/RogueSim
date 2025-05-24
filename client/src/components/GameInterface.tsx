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
    <div className="h-screen flex flex-col bg-black text-green-500 overflow-hidden relative">
      <MatrixRain />
      
      {/* Scanline effect */}
      <div className="absolute inset-0 pointer-events-none z-10">
        <div 
          className="absolute w-full h-0.5 bg-gradient-to-r from-transparent via-green-500/20 to-transparent scanline-animation"
        />
      </div>
      
      {/* Mobile-first layout: Terminal on top, mission panel as collapsible bottom */}
      <div className="flex-1 order-1">
        <Terminal gameState={gameState} onGameStateUpdate={onGameStateUpdate} />
      </div>
      
      {/* Mission panel - collapsible on mobile */}
      <div className="order-2 md:hidden">
        <MissionPanel gameState={gameState} currentMission={currentMission} />
      </div>
      
      {/* Desktop: Mission panel on side */}
      <div className="hidden md:block md:absolute md:left-0 md:top-0 md:h-full">
        <MissionPanel gameState={gameState} currentMission={currentMission} />
      </div>

    </div>
  );
}
