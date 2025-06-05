import { GameState, Mission } from '../types/game';
import { calculateMissionProgress, getMissionWithProgress } from '../lib/missionTracker';
import { Clock, AlertTriangle, Zap } from 'lucide-react';
import { useState, useEffect } from 'react';

interface MissionPanelProps {
  gameState: GameState;
  currentMission: Mission | null;
}

interface TerminalSettings {
  colorScheme: string;
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
  fontSize: number;
  fontFamily: string;
  soundEnabled: boolean;
  scanlineEffect: boolean;
  glowEffect: boolean;
  typingSpeed: number;
}

export function MissionPanel({ gameState, currentMission }: MissionPanelProps) {
  // Prioritize activeMission from gameState (mission map missions) over story missions
  const activeMissionFromGameState = gameState.activeMission;
  const storyMissionWithProgress = getMissionWithProgress(gameState);
  
  // Use mission map mission if available, otherwise fall back to story mission
  const missionWithProgress = activeMissionFromGameState || storyMissionWithProgress || currentMission;
  
  // Calculate progress differently for mission map missions vs story missions
  const missionProgress = activeMissionFromGameState ? 
    0 : // Mission map missions start at 0% until we implement their progress tracking
    (missionWithProgress ? calculateMissionProgress(gameState) : 0);
    
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [terminalSettings, setTerminalSettings] = useState<TerminalSettings>({
    colorScheme: 'classic',
    primaryColor: '#00ff00',
    backgroundColor: '#000000',
    textColor: '#00ff00',
    fontSize: 14,
    fontFamily: 'JetBrains Mono, monospace',
    soundEnabled: true,
    scanlineEffect: true,
    glowEffect: true,
    typingSpeed: 5
  });

  // Listen for terminal settings changes
  useEffect(() => {
    const handleTerminalSettingsChanged = (event: CustomEvent) => {
      setTerminalSettings(event.detail);
    };

    window.addEventListener('terminalSettingsChanged', handleTerminalSettingsChanged as EventListener);
    
    return () => {
      window.removeEventListener('terminalSettingsChanged', handleTerminalSettingsChanged as EventListener);
    };
  }, []);

  // Find current branch point if any (for old-style missions)
  const currentBranchPoint = (missionWithProgress as any)?.steps?.find((step: any) => 
    step.branchPoint && !step.completed
  )?.branchPoint;

  // Handle branch point timer
  useEffect(() => {
    if (currentBranchPoint?.timeLimit) {
      setTimeLeft(currentBranchPoint.timeLimit);
      
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev === null || prev <= 1) {
            clearInterval(timer);
            // Auto-select default choice when time runs out
            if (currentBranchPoint.defaultChoice) {
              // Trigger default choice selection
              setTimeout(() => {
                const event = new CustomEvent('autoSelectChoice', {
                  detail: { choiceId: currentBranchPoint.defaultChoice }
                });
                window.dispatchEvent(event);
              }, 100);
            }
            return null;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [currentBranchPoint]);

  if (!missionWithProgress) {
    return (
      <div 
        className="w-80 border p-4 overflow-y-auto backdrop-blur-lg"
        style={{
          backgroundColor: `${terminalSettings.backgroundColor}e6`,
          borderColor: `${terminalSettings.primaryColor}80`,
          color: terminalSettings.textColor,
          fontFamily: terminalSettings.fontFamily
        }}
      >
        <div className="text-center" style={{ color: terminalSettings.primaryColor }}>
          <div className="text-xl font-bold mb-4">MISSION COMPLETE</div>
          <div className="text-sm">Awaiting new assignment...</div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="w-full md:w-80 h-48 md:h-full border p-2 md:p-4 overflow-y-auto backdrop-blur-lg"
      style={{
        backgroundColor: `${terminalSettings.backgroundColor}e6`,
        borderColor: `${terminalSettings.primaryColor}80`,
        color: terminalSettings.textColor,
        fontFamily: terminalSettings.fontFamily,
        fontSize: `${terminalSettings.fontSize}px`
      }}
    >
      <div className="font-mono">
        <div 
          className="text-lg font-bold mb-2 text-center border-b pb-2"
          style={{ 
            color: terminalSettings.primaryColor,
            borderColor: `${terminalSettings.primaryColor}50`
          }}
        >
          {missionWithProgress.title}
        </div>
        
        <div className="text-xs mb-3" style={{ color: `${terminalSettings.textColor}cc` }}>
          <div className="mb-1">
            <span style={{ color: terminalSettings.primaryColor }}>OBJECTIVE:</span> {(missionWithProgress as any).objective || (missionWithProgress as any).description || 'Mission objective'}
          </div>
          <div className="mb-1">
            <span style={{ color: terminalSettings.primaryColor }}>DIFFICULTY:</span> {missionWithProgress.difficulty}
          </div>
          <div className="mb-1">
            <span style={{ color: terminalSettings.primaryColor }}>REWARD:</span> {(missionWithProgress as any).dynamicReward || (missionWithProgress as any).reward || (missionWithProgress as any).creditReward}₵
          </div>
          {missionWithProgress.timeLimit && (
            <div className="mb-1 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span className="text-yellow-400">TIME LIMIT:</span> {Math.floor(missionWithProgress.timeLimit / 60)}:{(missionWithProgress.timeLimit % 60).toString().padStart(2, '0')}
            </div>
          )}
        </div>

        {/* Branch Choice Display */}
        {currentBranchPoint && (
          <div 
            className="mb-4 p-3 border rounded"
            style={{
              borderColor: '#ffff0080',
              backgroundColor: '#ffff0010'
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-yellow-400" />
              <span className="text-yellow-400 font-bold">DECISION POINT</span>
              {timeLeft !== null && (
                <div className="ml-auto flex items-center gap-1 text-red-400">
                  <Clock className="w-3 h-3" />
                  <span className="font-bold">{timeLeft}s</span>
                </div>
              )}
            </div>
            
            <div className="text-xs text-yellow-200 mb-3">
              {currentBranchPoint.description}
            </div>
            
            <div className="space-y-2">
              {currentBranchPoint.choices.map((choice: any, index: number) => (
                <div 
                  key={choice.id} 
                  className="p-2 border rounded text-xs"
                  style={{
                    borderColor: `${terminalSettings.primaryColor}50`,
                    backgroundColor: `${terminalSettings.primaryColor}05`
                  }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span style={{ color: terminalSettings.primaryColor }} className="font-bold">{index + 1}.</span>
                    <span style={{ color: `${terminalSettings.textColor}cc` }} className="font-semibold">{choice.text}</span>
                    {choice.rewardModifier !== 1.0 && (
                      <div className="ml-auto flex items-center gap-1">
                        <Zap className="w-3 h-3 text-yellow-400" />
                        <span className="text-yellow-400">{choice.rewardModifier}x</span>
                      </div>
                    )}
                  </div>
                  <div style={{ color: `${terminalSettings.textColor}aa` }} className="mb-1">{choice.description}</div>
                  {choice.skillRequirement && (
                    <div className="text-purple-400 text-xs mb-1">
                      Requires: {choice.skillRequirement}
                    </div>
                  )}
                  <div className="text-xs text-gray-400">
                    {choice.consequences.slice(0, 2).map((consequence: string, i: number) => (
                      <div key={i}>• {consequence}</div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-3 text-xs text-yellow-300 text-center">
              Type: choose &lt;number&gt; to select
            </div>
          </div>
        )}

        {/* Progress Bar */}
        <div className="mb-3">
          <div className="flex justify-between text-xs mb-1">
            <span>PROGRESS</span>
            <span>{missionProgress}%</span>
          </div>
          <div className="w-full bg-gray-800 h-2 rounded">
            <div 
              className="h-2 rounded transition-all duration-500"
              style={{ 
                width: `${missionProgress}%`,
                backgroundColor: terminalSettings.primaryColor
              }}
            />
          </div>
        </div>

        {/* Mission Steps */}
        <div className="space-y-1">
          <div 
            className="text-sm font-semibold mb-2"
            style={{ color: `${terminalSettings.textColor}cc` }}
          >
            MISSION STEPS:
          </div>
          {((missionWithProgress as any).steps || []).map((step: any, index: number) => (
            <div key={step.id || index} className="flex items-start gap-2 text-xs">
              <span 
                className="mt-0.5"
                style={{ color: step.completed ? terminalSettings.primaryColor : '#666666' }}
              >
                {step.completed ? '✓' : '○'}
              </span>
              <div style={{ color: step.completed ? `${terminalSettings.textColor}cc` : '#666666' }}>
                <div className="font-medium">{step.description}</div>
                {step.hint && !step.completed && (
                  <div className="text-xs text-blue-400 mt-1">💡 {step.hint}</div>
                )}
                {step.branchPoint && !step.completed && (
                  <div className="text-xs text-yellow-400 mt-1">⚡ Decision Required</div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Intel Section */}
        {(missionWithProgress as any).intel && (missionWithProgress as any).intel.length > 0 && (
          <div 
            className="mt-4 pt-3 border-t"
            style={{ borderColor: `${terminalSettings.primaryColor}50` }}
          >
            <div 
              className="text-sm font-semibold mb-2"
              style={{ color: `${terminalSettings.textColor}cc` }}
            >
              INTEL:
            </div>
            <div className="space-y-1">
              {(missionWithProgress as any).intel.map((intel: string, index: number) => (
                <div key={index} className="text-xs" style={{ color: '#cccccc' }}>
                  {intel}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mission Complete Indicator */}
        {missionProgress === 100 && (
          <div 
            className="mt-4 p-2 border rounded text-center"
            style={{
              backgroundColor: `${terminalSettings.primaryColor}20`,
              borderColor: terminalSettings.primaryColor
            }}
          >
            <div className="font-bold" style={{ color: terminalSettings.primaryColor }}>MISSION READY</div>
            <div className="text-xs" style={{ color: `${terminalSettings.textColor}cc` }}>Type 'complete' to finish</div>
          </div>
        )}
      </div>
    </div>
  );
}
