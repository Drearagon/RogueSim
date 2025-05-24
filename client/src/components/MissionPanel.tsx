import { GameState, Mission } from '../types/game';

interface MissionPanelProps {
  gameState: GameState;
  currentMission: Mission | null;
}

export function MissionPanel({ gameState, currentMission }: MissionPanelProps) {
  if (!currentMission) {
    return (
      <div className="w-80 bg-black/90 border border-green-500/50 p-4 overflow-y-auto backdrop-blur-lg">
        <div className="text-center text-green-400">
          <div className="text-xl font-bold mb-4">MISSION COMPLETE</div>
          <div className="text-sm">Awaiting new assignment...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full md:w-80 h-64 md:h-full bg-black/90 border border-green-500/50 p-4 overflow-y-auto backdrop-blur-lg">
      <div className="space-y-4">
        <div className="border-b border-green-400 pb-2">
          <h2 className="text-lg md:text-xl font-bold text-cyan-400">MISSION BRIEFING</h2>
          <div className="text-xs md:text-sm text-green-400">Operation: {currentMission.title}</div>
        </div>
        
        <div className="space-y-3">
          <div>
            <div className="text-yellow-400 font-semibold">PRIMARY OBJECTIVE:</div>
            <div className="text-sm pl-4 text-green-300">
              {currentMission.objective}
            </div>
          </div>
          
          <div>
            <div className="text-cyan-400 font-semibold">STATUS:</div>
            <div className="text-sm pl-4 text-green-400">
              {currentMission.status} - {Math.floor(gameState.missionProgress)}% Complete
            </div>
          </div>
          
          <div>
            <div className="text-cyan-400 font-semibold">PROGRESS:</div>
            <div className="w-full bg-gray-700 rounded h-2 mt-1">
              <div 
                className="bg-gradient-to-r from-green-500 to-green-400 h-full rounded transition-all shadow-lg shadow-green-500/50"
                style={{ width: `${gameState.missionProgress}%` }}
              ></div>
            </div>
            <div className="text-xs text-green-400 mt-1">{Math.floor(gameState.missionProgress)}% Complete</div>
          </div>
        </div>
        
        <div className="border-t border-gray-600 pt-3">
          <div className="text-cyan-400 font-semibold mb-2">MISSION STEPS:</div>
          <div className="space-y-2 text-xs">
            {currentMission.steps.map((step, index) => (
              <div key={index} className={`flex items-center space-x-2 ${step.completed ? 'text-green-400' : 'text-gray-400'}`}>
                <span>{step.completed ? '✓' : '○'}</span>
                <span>{step.description}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="border-t border-gray-600 pt-3">
          <div className="text-cyan-400 font-semibold mb-2">AVAILABLE TOOLS:</div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {gameState.unlockedCommands.slice(0, 4).map((cmd, index) => (
              <div key={index} className="border border-green-500 bg-transparent text-green-500 px-2 py-1 text-center hover:bg-green-500 hover:text-black transition-colors cursor-pointer">
                {cmd.toUpperCase()}
              </div>
            ))}
          </div>
        </div>
        
        {currentMission.intel && (
          <div className="space-y-2">
            <div className="text-cyan-400 font-semibold">INTEL:</div>
            <div className="text-xs space-y-1 text-green-400">
              {currentMission.intel.map((info, index) => (
                <div key={index} className={info.includes('Unknown') || info.includes('warning') ? 'text-yellow-400' : ''}>
                  {info}
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="border-t border-gray-600 pt-3">
          <div className="flex justify-between text-sm">
            <span>CREDITS:</span>
            <span className="text-yellow-400">{gameState.credits.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>REPUTATION:</span>
            <span className="text-cyan-400">{gameState.reputation}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>MISSIONS:</span>
            <span className="text-green-400">{gameState.completedMissions}/∞</span>
          </div>
          {currentMission.timeLimit && (
            <div className="flex justify-between text-sm">
              <span>TIME LIMIT:</span>
              <span className="text-red-400">{Math.floor(currentMission.timeLimit / 60)}m {currentMission.timeLimit % 60}s</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
