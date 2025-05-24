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
    <div className="h-screen flex bg-black text-green-500 overflow-hidden relative">
      <MatrixRain />
      
      {/* Scanline effect */}
      <div className="absolute inset-0 pointer-events-none z-10">
        <div 
          className="absolute w-full h-0.5 bg-gradient-to-r from-transparent via-green-500/20 to-transparent"
          style={{
            top: '50%',
            animation: 'scanline 2s linear infinite'
          }}
        />
      </div>
      
      <MissionPanel gameState={gameState} currentMission={currentMission} />
      <Terminal gameState={gameState} onGameStateUpdate={onGameStateUpdate} />
      
      <style jsx>{`
        @keyframes scanline {
          0% { transform: translateY(-100vh); }
          100% { transform: translateY(100vh); }
        }
      `}</style>
    </div>
  );
}
