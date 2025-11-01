import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useSound } from '../hooks/useSound';
import { commands, isCommandAvailable, getInitialUnlockedCommands, SOCIAL_COMMANDS } from '../lib/commands';
import { GameState, Mission } from '../types/game';
import { logCommand } from '../lib/gameStorage';
import { checkEasterEgg, discoverEasterEgg, checkKonamiCode, loadDiscoveredEasterEggs, getEasterEggStats, EasterEgg } from '../lib/easterEggs';
import { MemoryTrace } from './MemoryTrace';
import { MissionCompleteNotification } from './MissionCompleteNotification';
import { trackMissionProgress, checkStepCompletion } from '../lib/missionTracker';
import { TerminalSettings } from './TerminalSettings';
import { ResponsiveUserProfile } from './ResponsiveUserProfile';
import { getCurrentUser } from '@/lib/userStorage';
import { focusSystem } from '../lib/focusSystem';
import { Brain, ChevronDown, ChevronUp, Coffee, Heart, Zap, Pause, AlertTriangle } from 'lucide-react';
import BackgroundController from './BackgroundController';
import { TutorialOverlay } from './TutorialOverlay';

interface TerminalProps {
  gameState: GameState;
  onGameStateUpdate: (updates: Partial<GameState>) => void;
}

export interface TerminalSettingsType {
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

export function Terminal({ gameState, onGameStateUpdate }: TerminalProps) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const [output, setOutput] = useState<string[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [cursorVisible, setCursorVisible] = useState(true);
  const [showMemoryTrace, setShowMemoryTrace] = useState(false);
  const [showMissionComplete, setShowMissionComplete] = useState(false);
  const [missionCompleteData, setMissionCompleteData] = useState<{
    missionTitle: string;
    reward: number;
  } | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showFocusDropdown, setShowFocusDropdown] = useState(false);
  const [focusState, setFocusState] = useState(focusSystem.getState());
  const focusDropdownRef = useRef<HTMLDivElement>(null);
  const [terminalSettings, setTerminalSettings] = useState<TerminalSettingsType>({
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
  const { playKeypress, playError, playSuccess } = useSound();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [gameActivity, setGameActivity] = useState<'idle' | 'typing' | 'hacking' | 'breach' | 'defense'>('idle');
  const [lastActivityTime, setLastActivityTime] = useState(Date.now());
  const [showTutorialPrompt, setShowTutorialPrompt] = useState(false);
  const [showTutorialOverlay, setShowTutorialOverlay] = useState(false);
  const gameStateUpdateRef = useRef(onGameStateUpdate);

  useEffect(() => {
    gameStateUpdateRef.current = onGameStateUpdate;
  }, [onGameStateUpdate]);

  const dispatchGameStateUpdates = useCallback((updates: Partial<GameState>) => {
    gameStateUpdateRef.current(updates);
  }, []);

  const beginTutorial = useCallback(() => {
    localStorage.setItem('roguesim_tutorial_status', 'in-progress');
    setShowTutorialOverlay(true);
    setShowTutorialPrompt(false);
    dispatchGameStateUpdates({ tutorialStatus: 'in-progress' });
  }, [dispatchGameStateUpdates]);

  const skipTutorial = useCallback(() => {
    localStorage.setItem('roguesim_tutorial_status', 'skipped');
    setShowTutorialOverlay(false);
    setShowTutorialPrompt(false);
    dispatchGameStateUpdates({ tutorialStatus: 'skipped' });

    const event = new CustomEvent('addTerminalOutput', {
      detail: {
        output: [
          '⏭️  Tutorial skipped.',
          'Use "tutorial" anytime if you want to revisit the interactive guide.',
          ''
        ]
      }
    });
    window.dispatchEvent(event);
  }, [dispatchGameStateUpdates]);

  const completeTutorial = useCallback(() => {
    localStorage.setItem('roguesim_tutorial_status', 'completed');
    setShowTutorialOverlay(false);
    setShowTutorialPrompt(false);
    dispatchGameStateUpdates({ tutorialStatus: 'completed' });

    const event = new CustomEvent('addTerminalOutput', {
      detail: {
        output: [
          '✅ Tutorial complete. Shadow Network access confirmed.',
          'You can relaunch the briefing later with the "tutorial" command.',
          ''
        ]
      }
    });
    window.dispatchEvent(event);
  }, [dispatchGameStateUpdates]);

  const openMissionMapOverlay = useCallback(() => {
    window.dispatchEvent(new CustomEvent('openMissionMap'));
  }, []);

  const openShopInterface = useCallback(() => {
    window.dispatchEvent(new CustomEvent('openEnhancedShop'));
  }, []);

  const openSkillTreeInterface = useCallback(() => {
    window.dispatchEvent(new CustomEvent('openSkillTree'));
  }, []);

  const openNetworkMapInterface = useCallback(() => {
    window.dispatchEvent(new CustomEvent('openNetworkMap'));
  }, []);

  const openTeamInterface = useCallback(() => {
    window.dispatchEvent(new CustomEvent('openTeamInterface'));
  }, []);

  const startDemoMission = useCallback(() => {
    const demoMission: Mission = {
      id: 'tutorial_demo_mission',
      title: 'Tutorial: Breach the Training Node',
      description: 'A guided infiltration against a hardened training environment.',
      briefing: 'Follow the prompts to scan, infiltrate, and extract data from the simulation node without risk.',
      difficulty: 'TRIVIAL',
      category: 'RECONNAISSANCE',
      type: 'STANDARD',
      requiredLevel: 1,
      creditReward: 250,
      experienceReward: 150,
      isRepeatable: true,
      objectives: [
        {
          id: 'scan-node',
          description: 'Execute `scan training-node` to identify the simulation entry point.',
          type: 'COMMAND',
          command: 'scan training-node',
          completed: false
        },
        {
          id: 'connect-node',
          description: 'Establish a secure link using `connect training-node`.',
          type: 'COMMAND',
          command: 'connect training-node',
          completed: false
        },
        {
          id: 'exploit-node',
          description: 'Deploy a payload with `inject payload training-node` to gain access.',
          type: 'COMMAND',
          command: 'inject payload training-node',
          completed: false
        },
        {
          id: 'extract-intel',
          description: 'Use `download training-intel.dat` to retrieve the flagged intel package.',
          type: 'COMMAND',
          command: 'download training-intel.dat',
          completed: false
        }
      ]
    };

    dispatchGameStateUpdates({
      activeMission: demoMission,
      networkStatus: '🟢 TRAINING SIMULATION ACTIVE',
      tutorialStatus: 'in-progress'
    });

    const event = new CustomEvent('addTerminalOutput', {
      detail: {
        output: [
          '🎯 Launching tutorial mission: "Tutorial: Breach the Training Node"',
          'Mission objectives have been loaded into your mission panel.',
          'Follow the on-screen guidance to complete each step.',
          ''
        ]
      }
    });
    window.dispatchEvent(event);
  }, [dispatchGameStateUpdates]);

  // Load command history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('roguesim_history');
    if (saved) {
      try {
        setCommandHistory(JSON.parse(saved));
      } catch {}
    }
  }, []);

  useEffect(() => {
    let promptTimer: number | undefined;
    const status = localStorage.getItem('roguesim_tutorial_status');

    if (!status || status === 'pending') {
      promptTimer = window.setTimeout(() => setShowTutorialPrompt(true), 1200);
      dispatchGameStateUpdates({ tutorialStatus: 'pending' });
    } else if (status === 'in-progress') {
      setShowTutorialOverlay(true);
      dispatchGameStateUpdates({ tutorialStatus: 'in-progress' });
    } else if (status === 'completed') {
      dispatchGameStateUpdates({ tutorialStatus: 'completed' });
    } else if (status === 'skipped') {
      dispatchGameStateUpdates({ tutorialStatus: 'skipped' });
    }

    return () => {
      if (promptTimer) {
        window.clearTimeout(promptTimer);
      }
    };
  }, [dispatchGameStateUpdates]);

  useEffect(() => {
    const handleStartTutorial = () => {
      beginTutorial();
    };

    window.addEventListener('startTutorial', handleStartTutorial as EventListener);
    return () => {
      window.removeEventListener('startTutorial', handleStartTutorial as EventListener);
    };
  }, [beginTutorial]);

  // Persist command history
  useEffect(() => {
    localStorage.setItem('roguesim_history', JSON.stringify(commandHistory.slice(-50)));
  }, [commandHistory]);

  // Load current user on component mount and when profile updates
  useEffect(() => {
    const loadUser = async () => {
      try {
        const user = await getCurrentUser();
        console.log('🔄 Terminal: Loaded user:', user?.hackerName || 'None');
        setCurrentUser(user);
      } catch (error) {
        console.log('No authenticated user found');
        setCurrentUser(null);
      }
    };
    
    loadUser();
    
    // Listen for profile updates and authentication events
    const handleProfileUpdate = () => {
      console.log('🔄 Terminal: Profile update event received');
      loadUser();
    };
    
    const handleAuthChange = () => {
      console.log('🔄 Terminal: Authentication change event received');
      loadUser();
    };
    
    window.addEventListener('profileUpdated', handleProfileUpdate);
    window.addEventListener('userLoggedIn', handleAuthChange);
    window.addEventListener('userLoggedOut', handleAuthChange);
    window.addEventListener('userVerified', handleAuthChange);
    
    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate);
      window.removeEventListener('userLoggedIn', handleAuthChange);
      window.removeEventListener('userLoggedOut', handleAuthChange);
      window.removeEventListener('userVerified', handleAuthChange);
    };
  }, []);

  // Listen for mission completion events
  useEffect(() => {
    const handleMissionComplete = (event: CustomEvent) => {
      setMissionCompleteData(event.detail);
      setShowMissionComplete(true);
      playSuccess(); // Play success sound
    };

    const handleOpenSettings = () => {
      setShowSettings(true);
    };

    const handleAddTerminalOutput = (event: CustomEvent) => {
      const { output: newOutput } = event.detail;
      setOutput(prev => [...prev, ...newOutput]);
      playSuccess(); // Play success sound for mission start
    };

    window.addEventListener('missionComplete', handleMissionComplete as EventListener);
    window.addEventListener('openSettings', handleOpenSettings);
    window.addEventListener('addTerminalOutput', handleAddTerminalOutput as EventListener);
    
    return () => {
      window.removeEventListener('missionComplete', handleMissionComplete as EventListener);
      window.removeEventListener('openSettings', handleOpenSettings);
      window.removeEventListener('addTerminalOutput', handleAddTerminalOutput as EventListener);
    };
  }, [playSuccess]);

  // Emit terminal settings changes to other components
  useEffect(() => {
    const event = new CustomEvent('terminalSettingsChanged', {
      detail: terminalSettings
    });
    window.dispatchEvent(event);
  }, [terminalSettings]);

  // Update focus state periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setFocusState(focusSystem.getState());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Close focus dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (focusDropdownRef.current && !focusDropdownRef.current.contains(event.target as Node)) {
        setShowFocusDropdown(false);
      }
    }

    if (showFocusDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showFocusDropdown]);

  // Cursor blink effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCursorVisible(prev => !prev);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // Initial welcome message
  useEffect(() => {
    const welcomeMessage = [
      '╔═══════════════════════════════════════╗',
      '║           ROGUE-SIM v1.0              ║',
      '║       ESP32 HACKER TERMINAL           ║',
      '╠═══════════════════════════════════════╣',
      '║ Welcome to the Shadow Network.        ║',
      '║ Type "help" for available commands.   ║',
      '║ Type "shop" to access marketplace.    ║',
      '║                                       ║',
      '║ Remember: We never existed.           ║',
      '╚═══════════════════════════════════════╝',
      ''
    ];
    setOutput(welcomeMessage);
    
    // Ensure all initial commands are available
    const initialCommands = getInitialUnlockedCommands(gameState.tutorialStatus);
    const currentCommands = gameState.unlockedCommands || [];
    const missingCommands = initialCommands.filter(cmd => !currentCommands.includes(cmd));

    if (missingCommands.length > 0) {
      dispatchGameStateUpdates({
        unlockedCommands: [...currentCommands, ...missingCommands]
      });
    }
  }, [dispatchGameStateUpdates, gameState.tutorialStatus, gameState.unlockedCommands]);

  useEffect(() => {
    const currentCommands = gameState.unlockedCommands || [];
    const tutorialComplete = gameState.tutorialStatus === 'completed' || gameState.tutorialStatus === 'skipped';
    const hasSocial = SOCIAL_COMMANDS.some(command => currentCommands.includes(command));

    if (tutorialComplete) {
      const missingSocial = SOCIAL_COMMANDS.filter(command => !currentCommands.includes(command));
      if (missingSocial.length > 0) {
        dispatchGameStateUpdates({
          unlockedCommands: [...currentCommands, ...missingSocial]
        });
      }
    } else if (hasSocial) {
      const filteredCommands = currentCommands.filter(command => !SOCIAL_COMMANDS.includes(command));
      dispatchGameStateUpdates({ unlockedCommands: filteredCommands });
    }
  }, [dispatchGameStateUpdates, gameState.tutorialStatus, gameState.unlockedCommands]);

  // Activity detection and management
  const updateActivity = useCallback((activity: typeof gameActivity) => {
    setGameActivity(activity);
    setLastActivityTime(Date.now());
    
    // Auto-return to idle after period of inactivity
    setTimeout(() => {
      setGameActivity('idle');
    }, activity === 'typing' ? 2000 : activity === 'hacking' ? 5000 : 3000);
  }, []);

  // Detect activity patterns based on commands
  const detectCommandActivity = useCallback((command: string) => {
    const lowerCmd = command.toLowerCase();
    
    if (lowerCmd.includes('scan') || lowerCmd.includes('probe') || lowerCmd.includes('exploit')) {
      updateActivity('hacking');
    } else if (lowerCmd.includes('break') || lowerCmd.includes('crack') || lowerCmd.includes('override')) {
      updateActivity('breach');
    } else if (lowerCmd.includes('firewall') || lowerCmd.includes('secure') || lowerCmd.includes('defend')) {
      updateActivity('defense');
    } else {
      updateActivity('typing');
    }
  }, [updateActivity]);

  // Auto-scroll to bottom, but keep input visible
  useEffect(() => {
    if (terminalRef.current) {
      const terminal = terminalRef.current;
      
      // Always scroll to bottom to keep input visible
      requestAnimationFrame(() => {
        terminal.scrollTop = terminal.scrollHeight;
      });
    }
  }, [output]);

  // Ensure input stays visible when user types
  useEffect(() => {
    if (terminalRef.current) {
      const terminal = terminalRef.current;
      
      // Scroll to bottom when input changes to keep cursor visible
      requestAnimationFrame(() => {
        terminal.scrollTop = terminal.scrollHeight;
      });
    }
  }, [currentInput]);

  const executeCommand = async (input: string) => {
    if (!input.trim()) return;

    // Detect activity based on command
    detectCommandActivity(input);

    // Add command to history
    setCommandHistory(prev => [...prev, input]);
    setHistoryIndex(-1);

    // Add command to output  
    const promptName = currentUser?.hackerName || 'shadow';
    setOutput(prev => [...prev, `${promptName}@roguesim:~$ ${input}`]);

    // Check for easter eggs first!
    const easterEgg = checkEasterEgg(input, gameState);
    if (easterEgg) {
      handleEasterEggDiscovery(easterEgg);
      return;
    }

    // Parse command
    const parts = input.trim().split(' ');
    const commandAliases: Record<string, string> = {
      inv: 'inventory',
      stat: 'status',
      minigames: 'minigame'
    };

    let commandName = parts[0].toLowerCase();
    commandName = commandAliases[commandName] || commandName;
    const args = parts.slice(1);

    // Check if command exists and is unlocked
    if (!commands[commandName]) {
      setOutput(prev => [...prev, `Command not found: ${commandName}`, 'Type "help" for available commands.', '']);
      playError();
      return;
    }

    if (!isCommandAvailable(commandName, gameState)) {
      setOutput(prev => [...prev, 'ERROR: Command locked. Complete missions or purchase from shop to unlock.', '']);
      playError();
      return;
    }

    // Execute command
    let result: CommandResult;
    try {
      const execution = commands[commandName].execute(args, gameState);
      result = execution instanceof Promise ? await execution : execution;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Command failed.';
      setOutput(prev => [...prev, `ERROR: ${message}`, '']);
      playError();
      return;
    }
    
    // Track mission progress if command was successful
    if (result.success && checkStepCompletion(commandName, args, result.success, gameState)) {
      const missionUpdates = trackMissionProgress(commandName, args, result.success, gameState);
      if (Object.keys(missionUpdates).length > 0) {
        // Merge mission updates with any existing game state updates
        const combinedUpdates = {
          ...result.updateGameState,
          ...missionUpdates
        };
        onGameStateUpdate(combinedUpdates);
      }
    }
    
    // Log command execution to database
    logCommand(commandName, args, result.success).catch(error => {
      console.warn('Failed to log command:', error);
    });
    
    // Handle special commands
    if (result.output.includes('CLEAR_SCREEN')) {
      setOutput([]);
      return;
    }

    // Add output
    setOutput(prev => [...prev, ...result.output]);

    // Handle game state updates
    if (result.updateGameState) {
      onGameStateUpdate(result.updateGameState);
    }

    // Handle Memory Trace display
    if ((result as any).showMemoryTrace) {
      setShowMemoryTrace(true);
    }

    // Handle sound effects
    if (result.soundEffect) {
      switch (result.soundEffect) {
        case 'success':
          playSuccess();
          break;
        case 'error':
          playError();
          break;
        case 'keypress':
          playKeypress();
          break;
      }
    } else if (result.success) {
      playKeypress();
    } else {
      playError();
    }

    // Add empty line for readability
    setOutput(prev => [...prev, '']);
  }

  const handleEasterEggDiscovery = (easterEgg: EasterEgg) => {
    discoverEasterEgg(easterEgg.id);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('easterEggDiscovered', {
        detail: { eggId: easterEgg.id }
      }));
    }

    const rarityColors = {
      'common': '🟢',
      'rare': '🔵',
      'epic': '🟣',
      'legendary': '🟡'
    };

    const eggOutput = [
      `${rarityColors[easterEgg.rarity]} EASTER EGG DISCOVERED! ${rarityColors[easterEgg.rarity]}`,
      "",
      `🎉 ${easterEgg.name}`,
      `📝 ${easterEgg.description}`,
      ""
    ];

    const updates: Partial<GameState> = {};

    if (easterEgg.reward.credits) {
      eggOutput.push(`💰 Earned ${easterEgg.reward.credits} credits!`);
      updates.credits = (gameState.credits || 0) + easterEgg.reward.credits;
    }

    if (easterEgg.reward.reputation) {
      eggOutput.push(`⭐ Reputation upgraded to ${easterEgg.reward.reputation}!`);
      updates.reputation = easterEgg.reward.reputation;
    }

    if (easterEgg.reward.unlockedCommands) {
      eggOutput.push(`🔓 Unlocked commands: ${easterEgg.reward.unlockedCommands.join(', ')}`);
      updates.unlockedCommands = [...(gameState.unlockedCommands || []), ...easterEgg.reward.unlockedCommands];
    }

    if (easterEgg.reward.specialItems) {
      eggOutput.push(`🎁 Special items: ${easterEgg.reward.specialItems.join(', ')}`);
    }

    if (easterEgg.reward.achievement) {
      eggOutput.push(`🏆 Achievement unlocked: ${easterEgg.reward.achievement}`);
    }

    if (easterEgg.reward.secretMessage) {
      eggOutput.push("", `💬 Secret Message:`);
      eggOutput.push(`"${easterEgg.reward.secretMessage}"`);
    }

    const stats = getEasterEggStats();
    eggOutput.push("", `🔍 Easter Eggs: ${stats.discovered}/${stats.total} discovered`);

    setOutput(prev => [...prev, ...eggOutput, '']);
    
    if (Object.keys(updates).length > 0) {
      onGameStateUpdate(updates);
    }
    
    playSuccess();
  };

  // Load discovered easter eggs on mount
  useEffect(() => {
    loadDiscoveredEasterEggs();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Check for Konami code
    const konamiEgg = checkKonamiCode(e.code);
    if (konamiEgg) {
      handleEasterEggDiscovery(konamiEgg);
      return;
    }

    switch (e.key) {
      case 'Enter':
        void executeCommand(currentInput);
        setCurrentInput('');
        break;
      
      case 'Backspace':
        setCurrentInput(prev => prev.slice(0, -1));
        break;
      
      case 'ArrowUp':
        e.preventDefault();
        if (historyIndex < commandHistory.length - 1) {
          const newIndex = historyIndex + 1;
          setHistoryIndex(newIndex);
          setCurrentInput(commandHistory[commandHistory.length - 1 - newIndex]);
        }
        break;
      
      case 'ArrowDown':
        e.preventDefault();
        if (historyIndex > 0) {
          const newIndex = historyIndex - 1;
          setHistoryIndex(newIndex);
          setCurrentInput(commandHistory[commandHistory.length - 1 - newIndex]);
        } else if (historyIndex === 0) {
          setHistoryIndex(-1);
          setCurrentInput('');
        }
        break;
      
      default:
        if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
          setCurrentInput(prev => prev + e.key);
          playKeypress();
        }
        break;
    }
  };

  return (
    <div 
      className="flex flex-col h-screen w-full relative"
      style={{
        backgroundColor: terminalSettings.backgroundColor,
        fontFamily: terminalSettings.fontFamily,
        fontSize: `${terminalSettings.fontSize}px`,
        maxWidth: '100vw',
        overflowX: 'hidden'
      }}
    >
      {/* Background Network Visualization */}
      <BackgroundController
        isActive={true}
        visualizationType="combined"
        intensity="medium"
        theme={terminalSettings.colorScheme === 'classic' ? 'green' : 
               terminalSettings.colorScheme === 'blue' ? 'blue' :
               terminalSettings.colorScheme === 'red' ? 'red' : 'purple'}
        gameActivity={gameActivity}
        className="z-0"
      />

      {/* Scanline effect */}
      {terminalSettings.scanlineEffect && (
        <div className="absolute inset-0 pointer-events-none z-10">
          <div 
            className="absolute w-full h-0.5 animate-pulse" 
            style={{ 
              top: '50%', 
              animation: 'scanline 2s linear infinite',
              background: `linear-gradient(to right, transparent, ${terminalSettings.primaryColor}30, transparent)`
            }}>
          </div>
        </div>
      )}
      
      {/* Status bar */}
      <div 
        className="border-b px-2 md:px-4 py-2 flex items-center justify-between text-xs md:text-sm backdrop-blur-sm flex-shrink-0 relative z-20"
        style={{
          backgroundColor: `${terminalSettings.backgroundColor}cc`,
          borderColor: `${terminalSettings.primaryColor}80`,
          color: terminalSettings.textColor
        }}
      >
        <div className="flex items-center space-x-2 md:space-x-4">
          <span className="hidden md:inline" style={{ color: terminalSettings.primaryColor }}>RogueSim v1.0</span>
          <span className="md:hidden" style={{ color: terminalSettings.primaryColor }}>RS</span>
          <span className="animate-pulse" style={{ color: terminalSettings.primaryColor }}>●</span>
          <span className="truncate" style={{ color: terminalSettings.textColor }}>{gameState.networkStatus}</span>
          <ResponsiveUserProfile
            user={{
              username: currentUser?.hackerName || currentUser?.username || 'CyberOp_' + (gameState.playerLevel || 1),
              hackerName: currentUser?.hackerName || currentUser?.username || 'CyberOp_' + (gameState.playerLevel || 1),
              email: currentUser?.email || 'unknown@roguesim.net',
              avatar: currentUser?.profileImageUrl || '/default-avatar.png',
              reputation: gameState.reputation || 'NOVICE',
              level: gameState.playerLevel || 1,
              credits: gameState.credits || 0,
              specialization: 'Network Infiltration',
              id: currentUser?.id || 'guest',
              bio: currentUser?.bio || 'Elite hacker in the shadow network.'
            }}
            gameState={{
              completedMissions: gameState.completedMissions || 0,
              currentMission: gameState.currentMission || 0,
              activeFaction: gameState.activeFaction || 'None',
              skillTree: {
                skillPoints: gameState.skillTree?.skillPoints || 0
              }
            }}
            onUpdateProfile={(updates) => {
              console.log('Profile updated:', updates);
              // Could integrate with gameState updates here if needed
            }}
            onLogout={() => {
              console.log('Logout triggered from terminal profile');
              // Trigger the main logout function directly
              const handleLogout = async () => {
                try {
                  const { logoutUser } = await import('../lib/userStorage');
                  await logoutUser();
                  
                  // Also trigger the custom event for other components
                  window.dispatchEvent(new CustomEvent('userLoggedOut'));
                  
                  // Reload page to reset state
                  window.location.reload();
                } catch (error) {
                  console.error('Logout error:', error);
                  // Force reload on error
                  window.location.reload();
                }
              };
              handleLogout();
            }}
            terminalSettings={{
              primaryColor: terminalSettings.primaryColor,
              backgroundColor: terminalSettings.backgroundColor,
              textColor: terminalSettings.textColor
            }}
          />
          {/* Enhanced Focus Display */}
          <div className="relative" ref={focusDropdownRef}>
            <div 
              className="flex items-center gap-2 px-3 py-1 rounded text-xs cursor-pointer hover:opacity-80 transition-opacity"
              style={{
                backgroundColor: `${terminalSettings.backgroundColor}80`,
                borderColor: `${terminalSettings.primaryColor}60`,
                border: `1px solid ${terminalSettings.primaryColor}60`,
                minWidth: '80px'
              }}
              onClick={() => setShowFocusDropdown(!showFocusDropdown)}
            >
              <Brain className="w-4 h-4" style={{ color: terminalSettings.primaryColor }} />
              <div className="flex-1 h-1.5 bg-black/40 rounded-full overflow-hidden min-w-[40px]">
                <div 
                  className="h-full transition-all duration-300 rounded-full"
                  style={{ 
                    width: `${focusSystem.getFocusPercentage()}%`,
                    backgroundColor: focusSystem.getFocusPercentage() > 60 ? terminalSettings.primaryColor : '#f59e0b'
                  }}
                />
              </div>
              <span 
                className="font-mono text-xs"
                style={{ color: terminalSettings.textColor }}
              >
                {Math.round(focusSystem.getFocusPercentage())}%
              </span>
              {focusState.isOverloaded && (
                <AlertTriangle className="w-3 h-3 text-red-400" />
              )}
              {showFocusDropdown ? (
                <ChevronUp className="w-3 h-3" style={{ color: terminalSettings.primaryColor }} />
              ) : (
                <ChevronDown className="w-3 h-3" style={{ color: terminalSettings.primaryColor }} />
              )}
            </div>

            {/* Focus Dropdown */}
            {showFocusDropdown && (
              <div 
                className="absolute top-full left-0 mt-2 p-3 bg-black/90 backdrop-blur-sm rounded-lg shadow-2xl z-50 border min-w-[200px]"
                style={{ 
                  borderColor: `${terminalSettings.primaryColor}50`,
                  boxShadow: `0 0 20px ${terminalSettings.primaryColor}20`
                }}
              >
                <div className="space-y-2">
                  <div className="text-xs" style={{ color: terminalSettings.primaryColor }}>
                    Focus: {focusState.current}/{focusState.maximum}
                  </div>
                  
                  {focusState.isOverloaded && (
                    <div className="text-xs text-red-400 mb-2">
                      ⚠️ Mental Overload Active
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-1">
                    <button
                      className="text-xs px-2 py-1 border rounded hover:opacity-80"
                      style={{
                        borderColor: `${terminalSettings.primaryColor}40`,
                        color: terminalSettings.textColor
                      }}
                      onClick={() => {
                        focusSystem.useStimulant('caffeine');
                        setShowFocusDropdown(false);
                      }}
                    >
                      <Coffee className="w-3 h-3 inline mr-1" />
                      Coffee
                    </button>
                    <button
                      className="text-xs px-2 py-1 border rounded hover:opacity-80"
                      style={{
                        borderColor: `${terminalSettings.primaryColor}40`,
                        color: terminalSettings.textColor
                      }}
                      onClick={() => {
                        focusSystem.useStimulant('meditation');
                        setShowFocusDropdown(false);
                      }}
                    >
                      <Heart className="w-3 h-3 inline mr-1" />
                      Meditate
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2 md:space-x-4">
            <span className="hidden md:inline" style={{ color: '#ffb000' }}>{new Date().toLocaleTimeString('en-US', { hour12: false })}</span>
            <span className="hidden md:inline" style={{ color: terminalSettings.textColor }}>UNDISCLOSED</span>
            <button 
              className="border bg-transparent px-2 py-1 text-xs hover:opacity-80 transition-colors flex-shrink-0"
              style={{
                borderColor: terminalSettings.primaryColor,
                color: terminalSettings.primaryColor,
                minWidth: '32px'
              }}
              onClick={() => {
                const newEnabled = !gameState.soundEnabled;
                onGameStateUpdate({ soundEnabled: newEnabled });
              }}
            >
              {gameState.soundEnabled ? '🔊' : '🔇'}
            </button>
          </div>
        </div>
      </div>
      
      {/* Terminal content */}
      <div 
        ref={terminalRef}
        className="flex-1 min-h-0 p-2 md:p-4 font-mono focus:outline-none text-xs md:text-sm terminal-scroll relative z-10"
        style={{
          color: terminalSettings.textColor,
          textShadow: terminalSettings.glowEffect ? `0 0 5px ${terminalSettings.primaryColor}` : 'none',
          maxWidth: '100%',
          overflowX: 'hidden'
        }}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onClick={() => terminalRef.current?.focus()}
      >
        <div className="min-h-full w-full" style={{ maxWidth: '100%', overflowWrap: 'break-word' }}>
          {output.map((line, index) => (
            <div key={index} className="whitespace-pre-wrap break-all w-full" style={{ maxWidth: '100%', overflowWrap: 'break-word' }}>
              {line}
            </div>
          ))}
          
          {/* Current input line */}
          <div className="flex items-center w-full" style={{ maxWidth: '100%' }}>
            <span className="flex-shrink-0" style={{ color: terminalSettings.primaryColor }}>
              {currentUser?.hackerName || 'shadow'}@roguesim:~$ 
            </span>
            <div className="flex items-center flex-1 min-w-0">
              <span className="break-all" style={{ overflowWrap: 'break-word' }}>{currentInput}</span>
              <span 
                className={`${cursorVisible ? 'opacity-100' : 'opacity-0'} transition-opacity`}
                style={{ 
                  backgroundColor: terminalSettings.primaryColor,
                  width: '2px',
                  height: '1.2em',
                  display: 'inline-block',
                  marginLeft: '1px'
                }}
              >|</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile input area */}
      <div 
        className="md:hidden border-t p-3 flex-shrink-0"
        style={{
          backgroundColor: `${terminalSettings.backgroundColor}e6`,
          borderColor: `${terminalSettings.primaryColor}80`
        }}
      >
        <div className="flex items-center space-x-2">
          <span className="text-sm" style={{ color: terminalSettings.primaryColor }}>$</span>
          <input
            type="text"
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                void executeCommand(currentInput);
                setCurrentInput('');
                e.preventDefault();
              }
            }}
            className="flex-1 bg-transparent border text-sm font-mono focus:outline-none min-w-0"
            style={{
              borderColor: `${terminalSettings.primaryColor}80`,
              color: terminalSettings.textColor
            }}
            placeholder="Type command here..."
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck="false"
          />
          <button
            onClick={() => {
              void executeCommand(currentInput);
              setCurrentInput('');
            }}
            className="px-3 py-2 text-sm font-bold hover:opacity-80 transition-colors flex-shrink-0"
            style={{
              backgroundColor: terminalSettings.primaryColor,
              color: terminalSettings.backgroundColor
            }}
          >
            EXEC
          </button>
        </div>
        
        {/* Quick command buttons for mobile */}
        <div className="flex flex-wrap gap-1 mt-2">
          {['help', 'scan wifi', 'status', 'clear'].map((cmd) => (
            <button
              key={cmd}
              onClick={() => setCurrentInput(cmd)}
              className="border bg-transparent px-2 py-1 text-xs hover:opacity-80 transition-colors"
              style={{
                borderColor: `${terminalSettings.primaryColor}80`,
                color: terminalSettings.primaryColor
              }}
            >
              {cmd}
            </button>
          ))}
        </div>
      </div>
      
      {/* Command hints - Positioned to avoid blocking UI elements */}
      <div 
        className="absolute top-40 right-1 border p-1 rounded backdrop-blur-sm opacity-50 hover:opacity-80 transition-opacity hidden md:block z-20 max-w-24"
        style={{
          backgroundColor: `${terminalSettings.backgroundColor}ee`,
          borderColor: `${terminalSettings.primaryColor}40`
        }}
      >
        <div className="text-xs space-y-0.5">
          <div style={{ color: '#00ffff', fontSize: '9px' }}>Quick:</div>
          <div className="grid grid-cols-1 gap-0.5">
            {['help', 'status'].map((cmd) => (
              <span 
                key={cmd}
                className="cursor-pointer hover:opacity-80 px-1 py-0.5 border rounded text-center transition-opacity"
                style={{
                  color: terminalSettings.textColor,
                  borderColor: `${terminalSettings.primaryColor}30`,
                  fontSize: '9px'
                }}
                onClick={() => setCurrentInput(cmd)}
              >
                {cmd}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Memory Trace Interface */}
      {showMemoryTrace && (
        <MemoryTrace 
          gameState={gameState}
          onClose={() => setShowMemoryTrace(false)}
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

      {showTutorialPrompt && (
        <div className="absolute inset-0 z-40 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-md border rounded-lg p-6 space-y-4 shadow-2xl"
            style={{
              borderColor: `${terminalSettings.primaryColor}80`,
              backgroundColor: `${terminalSettings.backgroundColor}f0`,
              color: terminalSettings.textColor
            }}
          >
            <div className="space-y-2">
              <h2 className="text-xl font-mono font-semibold" style={{ color: terminalSettings.primaryColor }}>
                Initiate Training Protocol?
              </h2>
              <p className="text-sm font-mono opacity-80">
                A guided tutorial is available to explain every interface and launch a practice mission.
                Would you like to run the tutorial now?
              </p>
            </div>
            <div className="grid grid-cols-1 gap-3">
              <button
                onClick={beginTutorial}
                className="px-4 py-3 font-mono text-sm border rounded hover:opacity-90 transition"
                style={{
                  borderColor: `${terminalSettings.primaryColor}a0`,
                  backgroundColor: terminalSettings.primaryColor,
                  color: '#000'
                }}
              >
                Start Interactive Tutorial
              </button>
              <button
                onClick={skipTutorial}
                className="px-4 py-3 font-mono text-sm border rounded hover:opacity-80 transition"
                style={{
                  borderColor: `${terminalSettings.primaryColor}50`,
                  color: terminalSettings.textColor,
                  backgroundColor: `${terminalSettings.backgroundColor}cc`
                }}
              >
                Skip For Now
              </button>
            </div>
            <p className="text-xs font-mono opacity-60">
              Hint: run <span style={{ color: terminalSettings.primaryColor }}>&quot;tutorial&quot;</span> any time to reopen this guide.
            </p>
          </div>
        </div>
      )}

      {showTutorialOverlay && (
        <TutorialOverlay
          onComplete={completeTutorial}
          onSkip={skipTutorial}
          onStartDemoMission={startDemoMission}
          onOpenMissionMap={openMissionMapOverlay}
          onOpenShop={openShopInterface}
          onOpenSkillTree={openSkillTreeInterface}
          onOpenNetworkMap={openNetworkMapInterface}
          onOpenTeamInterface={openTeamInterface}
          primaryColor={terminalSettings.primaryColor}
          textColor={terminalSettings.textColor}
          backgroundColor={terminalSettings.backgroundColor}
        />
      )}

      {/* Terminal Settings */}
      {showSettings && (
        <TerminalSettings
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          settings={terminalSettings}
          onSettingsChange={setTerminalSettings}
        />
      )}
    </div>
  );
}
