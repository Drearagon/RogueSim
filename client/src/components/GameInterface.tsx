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
    <div className="h-screen flex flex-col md:flex-row bg-black text-green-500 overflow-hidden relative">
      <MatrixRain />
      
      {/* Scanline effect */}
      <div className="absolute inset-0 pointer-events-none z-10">
        <div 
          className="absolute w-full h-0.5 bg-gradient-to-r from-transparent via-green-500/20 to-transparent scanline-animation"
        />
      </div>
      
      {/* Mobile: Mission panel on top, Desktop: Mission panel on left */}
      <div className="md:order-1 order-2">
        <MissionPanel gameState={gameState} currentMission={currentMission} />
      </div>
      
      {/* Terminal takes remaining space */}
      <div className="flex-1 md:order-2 order-1">
        <Terminal gameState={gameState} onGameStateUpdate={onGameStateUpdate} />
      </div>
      

    </div>
  );
}
