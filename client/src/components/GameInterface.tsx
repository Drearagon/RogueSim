// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import { Terminal } from './Terminal';
import { MissionPanel } from './MissionPanel';
import MatrixRain from './MatrixRain';
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
import { MultiplayerChat } from './MultiplayerChat';
import { TeamSystem } from './TeamSystem';
import { MissionMap } from './MissionMap';
import { Users, MapPin } from 'lucide-react';
import { SocialNotificationCenter } from './SocialNotificationCenter';
import { useSocialNotifications } from '../hooks/useSocialNotifications';
import { MessageCenterOverlay } from './MessageCenterOverlay';
import { StaffMessage } from '../types/social';

interface GameInterfaceProps {
  gameState: GameState;
  onGameStateUpdate: (updates: Partial<GameState>) => void;
  onShowMultiplayer: () => void;
  onShowLeaderboard: () => void;
}

export function GameInterface({
  gameState,
  onGameStateUpdate,
  onShowMultiplayer,
  onShowLeaderboard
}: GameInterfaceProps) {
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
  const [showTeamPanel, setShowTeamPanel] = useState(false);
  const [showMissionMap, setShowMissionMap] = useState(false);
  const [showMessageCenter, setShowMessageCenter] = useState(false);
  const [selectedMission, setSelectedMission] = useState<any>(null);
  const [currentTeam, setCurrentTeam] = useState<any>(null);
  const [terminalSettings, setTerminalSettings] = useState({
    primaryColor: '#00ff00',
    backgroundColor: '#000000',
    textColor: '#00ff00'
  });

  const [staffMessages, setStaffMessages] = useState<StaffMessage[]>(() => {
    if (gameState?.staffMessages?.length) {
      return gameState.staffMessages;
    }

    const now = Date.now();
    return [
      {
        id: 'staff_welcome',
        sender: 'Shadow Network Ops',
        subject: 'Welcome to the Shadow Network',
        body: 'Operative, welcome aboard. Keep an eye on this channel for directives, rewards, and critical alerts from command.',
        timestamp: now - 1000 * 60 * 30,
        read: false,
        priority: 'normal'
      },
      {
        id: 'staff_briefing',
        sender: 'Operations Command',
        subject: 'Daily Briefing Update',
        body: 'Intel Summary:\n• Covert recon teams detected increased corp security sweeps.\n• Priority missions marked in crimson require immediate attention.\n• Report unusual activity via the mission terminal.',
        timestamp: now - 1000 * 60 * 60 * 5,
        read: false,
        priority: 'high'
      }
    ];
  });

  const {
    notifications: socialNotifications,
    pushNotification,
    markAsRead: markSocialNotificationAsRead,
    dismissNotification: dismissSocialNotification
  } = useSocialNotifications();

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
    const handleOpenTeamInterface = () => setShowTeamPanel(true);
    const handleOpenMissionMap = () => setShowMissionMap(true);
    const handleOpenMessageCenter = () => setShowMessageCenter(true);
    const handleCloseMessageCenter = () => setShowMessageCenter(false);

    window.addEventListener('openEnhancedShop', handleOpenShop);
    window.addEventListener('openSocialEngineering', handleOpenSocialEngineering);
    window.addEventListener('openNetworkMap', handleOpenNetworkMap);
    window.addEventListener('openScriptEditor', handleOpenScriptEditor);
    window.addEventListener('openRogueNet', handleOpenRogueNet);
    window.addEventListener('openPsychProfile', handleOpenPsychProfile);
    window.addEventListener('openTeamInterface', handleOpenTeamInterface);
    window.addEventListener('openMissionMap', handleOpenMissionMap);
    window.addEventListener('openMessageCenter', handleOpenMessageCenter);
    window.addEventListener('closeMessageCenter', handleCloseMessageCenter);

    return () => {
      window.removeEventListener('openEnhancedShop', handleOpenShop);
      window.removeEventListener('openSocialEngineering', handleOpenSocialEngineering);
      window.removeEventListener('openNetworkMap', handleOpenNetworkMap);
      window.removeEventListener('openScriptEditor', handleOpenScriptEditor);
      window.removeEventListener('openRogueNet', handleOpenRogueNet);
      window.removeEventListener('openPsychProfile', handleOpenPsychProfile);
      window.removeEventListener('openTeamInterface', handleOpenTeamInterface);
      window.removeEventListener('openMissionMap', handleOpenMissionMap);
      window.removeEventListener('openMessageCenter', handleOpenMessageCenter);
      window.removeEventListener('closeMessageCenter', handleCloseMessageCenter);
    };
  }, []);

  useEffect(() => {
    if (gameState?.staffMessages) {
      setStaffMessages(gameState.staffMessages);
    }
  }, [gameState?.staffMessages]);

  const handleMarkStaffMessageRead = (id: string) => {
    setStaffMessages(prev => {
      const updated = prev.map(message =>
        message.id === id ? { ...message, read: true } : message
      );

      if (typeof onGameStateUpdate === 'function') {
        onGameStateUpdate({ staffMessages: updated });
      }

      return updated;
    });
  };

  // Listen for terminal settings changes
  useEffect(() => {
    const handleSettingsChange = (event: CustomEvent) => {
      setTerminalSettings(event.detail);
    };

    window.addEventListener('terminalSettingsChanged', handleSettingsChange as EventListener);
    return () => {
      window.removeEventListener('terminalSettingsChanged', handleSettingsChange as EventListener);
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

  const handleStartTeamMission = (missionId: string, team: any) => {
    console.log('Starting team mission:', missionId, 'with team:', team);
    setSelectedMission(missionId);
    // Implement team mission logic here
    pushNotification({
      type: 'team-update',
      message: `Team mission ${missionId} prepared.`
    });
  };

  const handleSelectMission = (mission: any) => {
    setSelectedMission(mission);
  };

  const handleStartMission = (missionId: string) => {
    console.log('Starting mission:', missionId);
    
    // Close the mission map
    setShowMissionMap(false);
    
    // Find the mission node from mission map
    const selectedMissionNode = selectedMission;
    
    // Convert mission map node to proper Mission object
    const missionData: any = {
      id: missionId,
      title: selectedMissionNode?.name || missionId.toUpperCase().replace('_', ' '),
      description: selectedMissionNode?.description || 'Classified mission operation',
      briefing: selectedMissionNode?.description || 'Mission briefing classified',
      objective: selectedMissionNode?.description || 'Complete assigned objectives',
      difficulty: selectedMissionNode?.difficulty?.toUpperCase() || 'MEDIUM',
      category: 'INFILTRATION',
      type: 'STANDARD',
      requiredLevel: selectedMissionNode?.requiredLevel || 1,
      creditReward: selectedMissionNode?.rewards?.credits || 1000,
      experienceReward: selectedMissionNode?.rewards?.experience || 500,
      isRepeatable: false,
      status: 'ACTIVE',
      reward: selectedMissionNode?.rewards?.credits || 1000,
      dynamicReward: selectedMissionNode?.rewards?.credits || 1000,
      timeLimit: selectedMissionNode?.estimatedTime ? 
        (parseInt(selectedMissionNode.estimatedTime.split('-')[0]) * 60) : undefined,
      intel: [
        `Mission Type: ${selectedMissionNode?.type?.toUpperCase() || 'SOLO'}`,
        `Difficulty: ${selectedMissionNode?.difficulty?.toUpperCase() || 'MEDIUM'}`,
        `Estimated Time: ${selectedMissionNode?.estimatedTime || '30-45 min'}`,
        `Required Level: ${selectedMissionNode?.requiredLevel || 1}`,
        ...(selectedMissionNode?.roleRequirements?.map((role: any) => 
          `• ${role.role.toUpperCase()}: ${role.description}`) || []),
        ...(selectedMissionNode?.rewards?.specialItems?.map((item: string) => 
          `• Special Reward: ${item}`) || [])
      ],
      objectives: selectedMissionNode?.roleRequirements?.map((role: any, index: number) => ({
        id: `obj_${index}`,
        description: role.description,
        type: 'COMMAND',
        completed: false,
        optional: false
      })) || [
        {
          id: 'obj_1',
          description: 'Establish secure connection to target',
          type: 'COMMAND',
          completed: false,
          optional: false
        },
        {
          id: 'obj_2', 
          description: 'Infiltrate target systems',
          type: 'COMMAND',
          completed: false,
          optional: false
        },
        {
          id: 'obj_3',
          description: 'Extract required data',
          type: 'COMMAND', 
          completed: false,
          optional: false
        },
        {
          id: 'obj_4',
          description: 'Exfiltrate without detection',
          type: 'STEALTH',
          completed: false,
          optional: false
        }
      ],
      steps: selectedMissionNode?.roleRequirements?.map((role: any, index: number) => ({
        id: `step_${index}`,
        command: role.role === 'hacker' ? 'exploit' : 
                role.role === 'social_engineer' ? 'social' : 
                role.role === 'analyst' ? 'analyze' : 'scan',
        completed: false,
        description: role.description,
        hint: `Use ${role.role} specialization commands`
      })) || [
        {
          id: 'connect',
          command: 'connect',
          completed: false,
          description: 'Establish connection to target network',
          hint: 'Use connect command with target IP'
        },
        {
          id: 'scan',
          command: 'scan',
          completed: false,
          description: 'Scan for vulnerabilities',
          hint: 'Use scan --deep for comprehensive analysis'
        },
        {
          id: 'exploit',
          command: 'exploit',
          completed: false,
          description: 'Exploit discovered vulnerabilities',
          hint: 'Target the weakest service first'
        },
        {
          id: 'extract',
          command: 'download',
          completed: false,
          description: 'Extract mission critical data',
          hint: 'Look for sensitive file directories'
        }
      ]
    };
    
    // Add a terminal message about mission start
    setTimeout(() => {
      const event = new CustomEvent('addTerminalOutput', {
        detail: {
          output: [
            `▶ MISSION DEPLOYMENT INITIATED ▶`,
            '',
            `✓ Mission "${missionData.title}" selected`,
            `✓ Establishing secure connection...`,
            `✓ Preparing infiltration tools...`,
            `✓ Mission briefing downloaded`,
            '',
            `🎯 Mission is now active!`,
            `Check the mission panel for detailed objectives.`,
            ''
          ]
        }
      });
      window.dispatchEvent(event);
    }, 500);
    
    // Update game state to reflect active mission with proper mission data
    onGameStateUpdate({
      activeMission: missionData,
      networkStatus: "🔴 MISSION ACTIVE",
      // Don't update currentMission number as that's for story missions
      // but provide the active mission data for the panel
    });
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-black text-green-500 relative" style={{ maxWidth: '100vw', overflowX: 'hidden' }}>
      <MatrixRain />
      
      {/* Scanline effect */}
      <div className="absolute inset-0 pointer-events-none z-10">
        <div 
          className="absolute w-full h-0.5 bg-gradient-to-r from-transparent via-green-500/20 to-transparent scanline-animation"
        />
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
            if (updates.showTeamInterface) {
              setShowTeamPanel(true);
            }
            if (updates.showMissionMap) {
              setShowMissionMap(true);
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
      <div className="fixed left-0 top-0 w-80 h-full hidden md:block z-20" style={{ maxHeight: '100vh' }}>
        <MissionPanel 
          gameState={gameState}
          currentMission={currentMission}
        />
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
          gameState={gameState}
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

      {/* Enhanced Multiplayer Chat */}
      <MultiplayerChat 
        gameState={gameState}
        terminalSettings={terminalSettings}
      />

      {/* Team Panel Overlay */}
      {showTeamPanel && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-mono" style={{ color: terminalSettings.primaryColor }}>
                Team Management
              </h2>
              <button
                onClick={() => setShowTeamPanel(false)}
                className="px-4 py-2 border rounded hover:opacity-80 transition-opacity"
                style={{
                  borderColor: terminalSettings.primaryColor,
                  color: terminalSettings.primaryColor
                }}
              >
                Close
              </button>
            </div>
            <TeamSystem
              gameState={gameState}
              currentUserId={gameState.playerId || 'player_1'}
              terminalSettings={terminalSettings}
              onStartTeamMission={handleStartTeamMission}
              onNotify={pushNotification}
              onTeamChange={setCurrentTeam}
            />
          </div>
        </div>
      )}

      {/* Mission Map Overlay */}
      {showMissionMap && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center p-4">
          <div className="w-full max-w-6xl h-[90vh]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-mono" style={{ color: terminalSettings.primaryColor }}>
                Mission Network
              </h2>
              <button
                onClick={() => setShowMissionMap(false)}
                className="px-4 py-2 border rounded hover:opacity-80 transition-opacity"
                style={{
                  borderColor: terminalSettings.primaryColor,
                  color: terminalSettings.primaryColor
                }}
              >
                Close
              </button>
            </div>
            <MissionMap
              gameState={gameState}
              currentTeam={currentTeam}
              terminalSettings={terminalSettings}
              onSelectMission={handleSelectMission}
              onStartMission={handleStartMission}
            />
          </div>
        </div>
      )}

      {showMessageCenter && (
        <MessageCenterOverlay
          notifications={socialNotifications}
          staffMessages={staffMessages}
          onDismissNotification={dismissSocialNotification}
          onMarkNotificationRead={markSocialNotificationAsRead}
          onMarkStaffMessageRead={handleMarkStaffMessageRead}
          onClose={() => setShowMessageCenter(false)}
          primaryColor={terminalSettings.primaryColor}
          textColor={terminalSettings.textColor}
          backgroundColor={terminalSettings.backgroundColor}
        />
      )}

      <SocialNotificationCenter
        notifications={socialNotifications}
        onDismiss={dismissSocialNotification}
        onMarkAsRead={markSocialNotificationAsRead}
        primaryColor={terminalSettings.primaryColor}
        textColor={terminalSettings.textColor}
        backgroundColor={terminalSettings.backgroundColor}
      />

      {/* Mobile mission panel toggle */}
      <div className="md:hidden fixed bottom-4 right-4 z-30">
        <button
          onClick={() => setShowTeamPanel(true)}
          className="bg-black/80 backdrop-blur-sm border rounded-full p-3 hover:opacity-80 transition-opacity"
          style={{
            borderColor: terminalSettings.primaryColor,
            color: terminalSettings.primaryColor
          }}
        >
          <Users className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile mission map toggle */}
      <div className="md:hidden fixed bottom-20 right-4 z-30">
        <button
          onClick={() => setShowMissionMap(true)}
          className="bg-black/80 backdrop-blur-sm border rounded-full p-3 hover:opacity-80 transition-opacity"
          style={{
            borderColor: terminalSettings.primaryColor,
            color: terminalSettings.primaryColor
          }}
        >
          <MapPin className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
