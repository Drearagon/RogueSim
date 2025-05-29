import { useState, useEffect } from 'react';
import { Terminal } from './Terminal';
import { MissionPanel } from './MissionPanel';
import { MatrixRain } from './MatrixRain';
import { SkillTree } from './SkillTree';
import { EnhancedShopInterface } from './shop/EnhancedShopInterface';
import { MissionCompleteNotification } from './MissionCompleteNotification';
import { SocialEngineeringInterface } from './SocialEngineeringInterface';
import { FocusInterface } from './FocusInterface';
import { NetworkMapInterface } from './NetworkMapInterface';
import { ScriptEditorInterface } from './ScriptEditorInterface';
import { RogueNetInterface } from './RogueNetInterface';
import PsychProfileInterface from './PsychProfileInterface';
import { GameState } from '../types/game';
import { getCurrentMission } from '../lib/missions';
import { soundSystem } from '@/lib/soundSystem';
import { socialEngineeringSystem } from '@/lib/socialEngineering';
import { dynamicNetworkSystem } from '@/lib/dynamicNetworkSystem';
import { focusSystem } from '@/lib/focusSystem';
import { scriptingSystem } from '@/lib/scriptingSystem';

interface GameInterfaceProps {
  gameState: GameState;
  onGameStateUpdate: (updates: Partial<GameState>) => void;
  onShowMultiplayer?: () => void;
  onShowLeaderboard?: () => void;
}

export function GameInterface({ gameState, onGameStateUpdate, onShowMultiplayer, onShowLeaderboard }: GameInterfaceProps) {
  const currentMission = getCurrentMission(gameState);
  const [showSkillTree, setShowSkillTree] = useState(false);
  const [showShop, setShowShop] = useState(false);
  const [showSocialEngineering, setShowSocialEngineering] = useState(false);
  const [showNetworkMap, setShowNetworkMap] = useState(false);
  const [showScriptEditor, setShowScriptEditor] = useState(false);
  const [showRogueNet, setShowRogueNet] = useState(false);
  const [showPsychProfile, setShowPsychProfile] = useState(false);
  const [showMissionComplete, setShowMissionComplete] = useState(false);
  const [missionCompleteData, setMissionCompleteData] = useState<{
    missionTitle: string;
    reward: number;
  } | null>(null);

  // Initialize default psych profile if not exists
  const defaultPsychProfile = {
    cunning: 50,
    empathy: 50,
    aggression: 30,
    patience: 40,
    paranoia: 60,
    curiosity: 70,
    ethicalAlignment: 0,
    corporateReputation: 0,
    hackivistReputation: 0,
    criminalReputation: 0,
    governmentReputation: 0,
    mentalStability: 80,
    moralConflict: 20,
    unlockedStoryPaths: [],
    permanentConsequences: [],
    majorDecisions: []
  };

  // Listen for mission completion events
  useEffect(() => {
    const handleMissionComplete = (event: CustomEvent) => {
      setMissionCompleteData(event.detail);
      setShowMissionComplete(true);
    };

    window.addEventListener('missionComplete', handleMissionComplete as EventListener);
    return () => {
      window.removeEventListener('missionComplete', handleMissionComplete as EventListener);
    };
  }, []);

  // Listen for interface open events
  useEffect(() => {
    const handleOpenShop = () => setShowShop(true);
    const handleOpenSocialEngineering = () => setShowSocialEngineering(true);
    const handleOpenNetworkMap = () => setShowNetworkMap(true);
    const handleOpenScriptEditor = () => setShowScriptEditor(true);
    const handleOpenRogueNet = () => setShowRogueNet(true);
    const handleOpenPsychProfile = () => setShowPsychProfile(true);
    
    window.addEventListener('openEnhancedShop', handleOpenShop);
    window.addEventListener('openSocialEngineering', handleOpenSocialEngineering);
    window.addEventListener('openNetworkMap', handleOpenNetworkMap);
    window.addEventListener('openScriptEditor', handleOpenScriptEditor);
    window.addEventListener('openRogueNet', handleOpenRogueNet);
    window.addEventListener('openPsychProfile', handleOpenPsychProfile);
    
    return () => {
      window.removeEventListener('openEnhancedShop', handleOpenShop);
      window.removeEventListener('openSocialEngineering', handleOpenSocialEngineering);
      window.removeEventListener('openNetworkMap', handleOpenNetworkMap);
      window.removeEventListener('openScriptEditor', handleOpenScriptEditor);
      window.removeEventListener('openRogueNet', handleOpenRogueNet);
      window.removeEventListener('openPsychProfile', handleOpenPsychProfile);
    };
  }, []);

  // Start ambient cyberpunk atmosphere when game interface loads
  useEffect(() => {
    const startAmbient = async () => {
      await soundSystem.resumeContext();
      soundSystem.startAmbient();
    };
    
    startAmbient();
    
    return () => {
      soundSystem.stopAmbient();
    };
  }, []);

  return (
    <div className="min-h-screen w-full flex flex-col bg-black text-green-500 relative" style={{ maxWidth: '100vw', overflowX: 'hidden' }}>
      <MatrixRain />
      
      {/* Scanline effect */}
      <div className="absolute inset-0 pointer-events-none z-10">
        <div 
          className="absolute w-full h-0.5 bg-gradient-to-r from-transparent via-green-500/20 to-transparent scanline-animation"
        />
      </div>

      {/* Focus Interface - Always visible in top right */}
      <div className="fixed top-4 right-4 z-30">
        <FocusInterface />
      </div>
      
      {/* Mobile-first layout: Terminal on top, mission panel as collapsible bottom */}
      <div className="flex-1 min-h-0 md:ml-80" style={{ maxWidth: '100vw', overflowX: 'hidden' }}>
        <Terminal 
          gameState={gameState} 
          onGameStateUpdate={(updates) => {
            // Check for interface triggers
            if (updates.narrativeChoices) {
              const hasShopTrigger = updates.narrativeChoices.some(choice => choice === 'TRIGGER_SHOP_UI');
              const hasSkillsTrigger = updates.narrativeChoices.some(choice => choice === 'open_skills_interface');
              const hasSocialTrigger = updates.narrativeChoices.some(choice => choice === 'open_social_engineering');
              const hasNetworkTrigger = updates.narrativeChoices.some(choice => choice === 'open_network_map');
              const hasScriptTrigger = updates.narrativeChoices.some(choice => choice === 'open_script_editor');
              const hasRogueNetTrigger = updates.narrativeChoices.some(choice => choice === 'open_roguenet');
              const hasPsychProfileTrigger = updates.narrativeChoices.some(choice => choice === 'open_psych_profile');
              
              if (hasShopTrigger) {
                setShowShop(true);
                updates.narrativeChoices = updates.narrativeChoices.filter(choice => choice !== 'TRIGGER_SHOP_UI');
              }
              if (hasSkillsTrigger) {
                setShowSkillTree(true);
                updates.narrativeChoices = updates.narrativeChoices.filter(choice => choice !== 'open_skills_interface');
              }
              if (hasSocialTrigger) {
                setShowSocialEngineering(true);
                updates.narrativeChoices = updates.narrativeChoices.filter(choice => choice !== 'open_social_engineering');
              }
              if (hasNetworkTrigger) {
                setShowNetworkMap(true);
                updates.narrativeChoices = updates.narrativeChoices.filter(choice => choice !== 'open_network_map');
              }
              if (hasScriptTrigger) {
                setShowScriptEditor(true);
                updates.narrativeChoices = updates.narrativeChoices.filter(choice => choice !== 'open_script_editor');
              }
              if (hasRogueNetTrigger) {
                setShowRogueNet(true);
                updates.narrativeChoices = updates.narrativeChoices.filter(choice => choice !== 'open_roguenet');
              }
              if (hasPsychProfileTrigger) {
                setShowPsychProfile(true);
                updates.narrativeChoices = updates.narrativeChoices.filter(choice => choice !== 'open_psych_profile');
              }
            }
            onGameStateUpdate(updates);
          }}
        />
      </div>
      
      {/* Mission panel - collapsible on mobile */}
      <div className="md:hidden" style={{ maxWidth: '100vw', overflowX: 'hidden' }}>
        <MissionPanel gameState={gameState} currentMission={currentMission} />
      </div>
      
      {/* Desktop: Mission panel on side */}
      <div className="hidden md:block md:fixed md:left-0 md:top-0 md:h-full md:z-20">
        <MissionPanel gameState={gameState} currentMission={currentMission} />
      </div>
      
      {/* Skill Tree Interface */}
      {showSkillTree && (
        <SkillTree 
          gameState={gameState}
          onUpdateGameState={onGameStateUpdate}
          onClose={() => setShowSkillTree(false)}
        />
      )}
      
      {/* Shop Interface */}
      {showShop && (
        <EnhancedShopInterface 
          gameState={gameState}
          onUpdateGameState={onGameStateUpdate}
          onClose={() => setShowShop(false)}
        />
      )}

      {/* Social Engineering Interface */}
      {showSocialEngineering && (
        <SocialEngineeringInterface 
          onClose={() => setShowSocialEngineering(false)}
        />
      )}

      {/* Network Map Interface */}
      {showNetworkMap && (
        <NetworkMapInterface 
          onClose={() => setShowNetworkMap(false)}
        />
      )}

      {/* Script Editor Interface */}
      {showScriptEditor && (
        <ScriptEditorInterface 
          onClose={() => setShowScriptEditor(false)}
        />
      )}
      
      {/* RogueNet Interface */}
      {showRogueNet && (
        <RogueNetInterface 
          onClose={() => setShowRogueNet(false)}
          currentUser={{
            id: gameState.playerLevel?.toString() || 'anonymous',
            hackerName: 'CyberOp_' + (gameState.playerLevel || 1),
            credits: gameState.credits || 0,
            reputation: gameState.reputation || 'Novice'
          }}
        />
      )}
      
      {/* Psych Profile Interface */}
      {showPsychProfile && (
        <PsychProfileInterface 
          psychProfile={gameState.psychProfile || defaultPsychProfile}
          onProfileUpdate={(updatedProfile) => {
            onGameStateUpdate({ psychProfile: updatedProfile });
          }}
          onMakeDecision={(decisionId, choice) => {
            // Handle decision consequences
            console.log(`Decision made: ${decisionId} -> ${choice}`);
          }}
          onClose={() => setShowPsychProfile(false)}
        />
      )}
      
      {/* Mission Complete Notification */}
      {showMissionComplete && missionCompleteData && (
        <MissionCompleteNotification
          isVisible={showMissionComplete}
          missionTitle={missionCompleteData.missionTitle}
          reward={missionCompleteData.reward}
          onClose={() => setShowMissionComplete(false)}
        />
      )}
    </div>
  );
}
