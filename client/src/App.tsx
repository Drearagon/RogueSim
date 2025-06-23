import { useState, useEffect } from 'react';
import { BootScreen } from './components/BootScreen';
import { GameInterface } from './components/GameInterface';
import { MultiplayerRoom } from './components/MultiplayerRoom';
import { Leaderboard } from './components/Leaderboard';
import { UserProfile } from './components/UserProfile';
import { MatrixRain } from './components/MatrixRain';
import { OnboardingTutorial } from './components/OnboardingTutorial';
import { LoginPage } from './components/LoginPage';
import { AuthScreen } from './components/AuthScreen';
import { UsernameSetup } from './components/UsernameSetup';
import { MiniGameInterface } from './components/MiniGameInterface';
import { useGameState } from './hooks/useGameState';
import { useSound } from './hooks/useSound';
import { useAuth } from './hooks/useAuth';
import { userProfileManager } from './lib/userProfileManager';
import { initializeFactionStandings } from './lib/factionSystem';
import { FactionInterface } from './components/FactionInterface';
import { SkillTreeInterface } from './components/SkillTreeInterface';
import { MissionInterface } from './components/MissionInterface';
import { initializeSkillTree, purchaseSkill } from './lib/skillSystem';
import { GameState, Mission, MiniGameState } from './types/game';

export default function App() {
  const { gameState, updateGameState, isLoading: gameLoading } = useGameState();
  const { setEnabled } = useSound();
  // Use proper backend authentication system
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [needsUsername, setNeedsUsername] = useState(false);
  const [currentView, setCurrentView] = useState<'auth' | 'game' | 'multiplayer' | 'leaderboard' | 'profile' | 'onboarding'>('auth');
  const [userProfile, setUserProfile] = useState<any>(null);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [showFactionInterface, setShowFactionInterface] = useState(false);
  const [showSkillTreeInterface, setShowSkillTreeInterface] = useState(false);
  const [showMissionInterface, setShowMissionInterface] = useState(false);
  const [activeMiniGame, setActiveMiniGame] = useState<MiniGameState | null>(null);

  // Load user profile and handle onboarding
  useEffect(() => {
    if (isAuthenticated && user) {
      const loadUserProfile = async () => {
        try {
          const profile = await userProfileManager.loadProfile();
          if (profile) {
            setUserProfile(profile);
            // Check if user needs onboarding
            if (!profile.hasCompletedTutorial) {
              setNeedsOnboarding(true);
              setCurrentView('onboarding');
            }
            // Sync profile data with game state
            updateGameState({
              credits: profile.credits,
              playerLevel: profile.level,
              reputation: profile.reputation
            });
          } else {
            // Create new profile for first-time user
            const newProfile = await userProfileManager.createProfile({
              hackerName: user.hackerName,
              email: user.email || '',
              profileImageUrl: user.profileImageUrl || ''
            });
            setUserProfile(newProfile);
            setNeedsOnboarding(true);
            setCurrentView('onboarding');
          }
        } catch (error) {
          console.error('Failed to load user profile:', error);
        }
      };
      
      loadUserProfile();
    }
  }, [isAuthenticated, user]);

  // All hooks must be called before any conditional returns
  useEffect(() => {
    if (gameState?.soundEnabled !== undefined) {
      setEnabled(gameState.soundEnabled);
    }
  }, [gameState?.soundEnabled, setEnabled]);

  // Auto-save game progress
  useEffect(() => {
    if (userProfile && gameState) {
      const saveProgress = async () => {
        await userProfileManager.saveGameState(gameState);
      };
      
      // Save every 30 seconds
      const interval = setInterval(saveProgress, 30000);
      return () => clearInterval(interval);
    }
  }, [userProfile, gameState]);

  // Navigation event listeners
  useEffect(() => {
    const handleShowMultiplayer = () => setCurrentView('multiplayer');
    const handleShowLeaderboard = () => setCurrentView('leaderboard');
    const handleShowProfile = () => setCurrentView('profile');
    const handleShowFactionInterface = () => setShowFactionInterface(true);
    const handleUserLogout = () => handleLogout();

    window.addEventListener('showMultiplayer', handleShowMultiplayer);
    window.addEventListener('showLeaderboard', handleShowLeaderboard);
    window.addEventListener('showProfile', handleShowProfile);
    window.addEventListener('showFactionInterface', handleShowFactionInterface);
    window.addEventListener('userLogout', handleUserLogout);

    return () => {
      window.removeEventListener('showMultiplayer', handleShowMultiplayer);
      window.removeEventListener('showLeaderboard', handleShowLeaderboard);
      window.removeEventListener('showProfile', handleShowProfile);
      window.removeEventListener('showFactionInterface', handleShowFactionInterface);
      window.removeEventListener('userLogout', handleUserLogout);
    };
  }, []);

  // Event listeners for faction interface
  useEffect(() => {
    const handleShowFactionInterface = () => setShowFactionInterface(true);
    const handleShowSkillTree = () => setShowSkillTreeInterface(true);
    const handleShowMissionInterface = () => setShowMissionInterface(true);
    
    window.addEventListener('showFactionInterface', handleShowFactionInterface);
    window.addEventListener('showSkillTree', handleShowSkillTree);
    window.addEventListener('showMissionInterface', handleShowMissionInterface);
    
    return () => {
      window.removeEventListener('showFactionInterface', handleShowFactionInterface);
      window.removeEventListener('showSkillTree', handleShowSkillTree);
      window.removeEventListener('showMissionInterface', handleShowMissionInterface);
    };
  }, []);

  // Mini-game event listener
  useEffect(() => {
    const handleStartMiniGame = (event: CustomEvent) => {
      const { miniGameState } = event.detail;
      setActiveMiniGame(miniGameState);
    };

    window.addEventListener('startMiniGame', handleStartMiniGame as EventListener);
    
    return () => {
      window.removeEventListener('startMiniGame', handleStartMiniGame as EventListener);
    };
  }, []);

  // Initialize faction standings and skill tree if not present
  useEffect(() => {
    try {
      let needsUpdate = false;
      const updates: Partial<GameState> = {};

      // Check and initialize faction standings
      if (!gameState.factionStandings || Object.keys(gameState.factionStandings).length === 0) {
        updates.factionStandings = initializeFactionStandings();
        needsUpdate = true;
      }

      // Check and initialize skill tree
      if (!gameState.skillTree || !gameState.skillTree.nodes || gameState.skillTree.nodes.length === 0) {
        updates.skillTree = initializeSkillTree();
        needsUpdate = true;
      }

      // Initialize mission-related properties
      if (!gameState.availableMissions) {
        updates.availableMissions = [];
        needsUpdate = true;
      }
      if (!gameState.completedMissionIds) {
        updates.completedMissionIds = [];
        needsUpdate = true;
      }
      if (!gameState.failedMissionIds) {
        updates.failedMissionIds = [];
        needsUpdate = true;
      }
      if (!gameState.missionHistory) {
        updates.missionHistory = [];
        needsUpdate = true;
      }
      if (!gameState.missionCooldowns) {
        updates.missionCooldowns = {};
        needsUpdate = true;
      }
      if (!gameState.emergencyMissions) {
        updates.emergencyMissions = [];
        needsUpdate = true;
      }

      // Apply all updates at once to avoid multiple re-renders
      if (needsUpdate) {
        updateGameState(updates);
      }
    } catch (error) {
      console.error('Error during game state initialization:', error);
    }
  }, []);

  // Show loading while authentication is being determined
  if (authLoading || gameLoading) {
    return (
      <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center">
        <MatrixRain />
        <div className="text-green-400 text-center z-10">
          <div className="animate-pulse text-2xl font-mono mb-4">INITIALIZING SYSTEM...</div>
          <div className="text-sm">Establishing secure connection</div>
        </div>
      </div>
    );
  }

  // Show username setup if needed (for backward compatibility)
  if (needsUsername && user && !user.hackerName) {
    return <UsernameSetup onUsernameSet={(username) => {
      // Username update will be handled by the backend
      setNeedsUsername(false);
      // Trigger a re-fetch of user data
      window.location.reload();
    }} />;
  }

  const handleBootComplete = () => {
    updateGameState({ isBootComplete: true });
  };

  const handleStartMultiplayer = (mode: 'multiplayer') => {
    setCurrentView('game');
  };

  const handleLogout = async () => {
    console.log('handleLogout called in App.tsx');
    
    try {
      // Use the enhanced logout function
      const { logoutUser } = await import('./lib/userStorage');
      await logoutUser();
    } catch (error) {
      console.error('Logout error:', error);
    }
    
    // Clear profile and UI state
    setUserProfile(null);
    setNeedsOnboarding(false);
    setCurrentView('auth');
    
    // Clear localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('authenticated');
    localStorage.removeItem('roguesim_current_user');
    
    // Refresh page to reset authentication state
    window.location.reload();
  };

  const handleShowProfile = () => {
    // Profile is now handled by ResponsiveUserProfile component
    // No longer need to change views for profile
    console.log('Profile access handled by ResponsiveUserProfile component');
  };

  const handleOnboardingComplete = async () => {
    if (userProfile) {
      await userProfileManager.markTutorialComplete();
      setUserProfile({ ...userProfile, hasCompletedTutorial: true });
      setNeedsOnboarding(false);
      setCurrentView('game');
    }
  };

  const handleOnboardingSkip = async () => {
    if (userProfile) {
      await userProfileManager.markTutorialComplete();
      setUserProfile({ ...userProfile, hasCompletedTutorial: true });
      setNeedsOnboarding(false);
      setCurrentView('game');
    }
  };

  const handleSkillPurchase = (skillId: string) => {
    const result = purchaseSkill(skillId, gameState.skillTree);
    const newUnlockedCommands = [...gameState.unlockedCommands, ...result.unlockedCommands];
    
    updateGameState({ 
      skillTree: result.skillTree,
      unlockedCommands: newUnlockedCommands
    });
  };

  const handleFactionAction = (action: string, data?: any) => {
    // Handle faction-related actions
    switch (action) {
      case 'join':
        // This would be handled by the faction command in the terminal
        break;
      case 'leave':
        // This would be handled by the faction command in the terminal
        break;
      case 'start_mission':
        // This would be handled by the faction_mission command in the terminal
        break;
    }
    setShowFactionInterface(false);
  };

  const handleMissionStart = (mission: Mission) => {
    // Start the selected mission
    const missionProgress = {
      missionId: mission.id,
      startTime: Date.now(),
      currentObjective: 0,
      completedObjectives: [],
      timeElapsed: 0,
      suspicionLevel: 0,
      score: 0,
      attempts: 1,
      status: 'IN_PROGRESS' as const
    };

    updateGameState({
      activeMission: mission,
      currentMissionProgress: missionProgress,
      missionCooldowns: {
        ...gameState.missionCooldowns,
        [mission.id]: Date.now()
      }
    });

    setShowMissionInterface(false);
  };

  const handleMiniGameComplete = (success: boolean, score: number) => {
    if (activeMiniGame && activeMiniGame.currentGame) {
      const game = activeMiniGame.currentGame;
      if (success) {
        updateGameState({
          credits: gameState.credits + game.reward.credits,
          experience: gameState.experience + (game.reward.experience || 10)
        });
      }
    }
    setActiveMiniGame(null);
  };

  const handleMiniGameExit = () => {
    setActiveMiniGame(null);
  };

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return (
      <LoginPage
        onLoginSuccess={() => {
          // useAuth listens for login events, so just trigger re-fetch
          window.dispatchEvent(new Event('userLoggedIn'));
        }}
      />
    );
  }

  // Add effectiveUser for backward compatibility
  const effectiveUser = user;

  if (!gameState.isBootComplete) {
    return <BootScreen onBootComplete={handleBootComplete} />;
  }

  if (currentView === 'onboarding') {
    return (
      <OnboardingTutorial 
        onComplete={handleOnboardingComplete}
        onSkip={handleOnboardingSkip}
      />
    );
  }

  if (currentView === 'multiplayer') {
    return (
      <MultiplayerRoom 
        onStartGame={handleStartMultiplayer}
        onBack={() => setCurrentView('game')}
        currentUser={{
          username: effectiveUser?.hackerName || 'Anonymous_Hacker',
          avatar: effectiveUser?.profileImageUrl || '/default-avatar.png',
          id: effectiveUser?.id || 'mobile_user'
        }}
      />
    );
  }

  if (currentView === 'leaderboard') {
    return (
      <Leaderboard 
        onClose={() => setCurrentView('game')} 
        currentUser={{
          username: effectiveUser?.hackerName || 'Anonymous_Hacker',
          avatar: effectiveUser?.profileImageUrl || '/default-avatar.png',
          id: effectiveUser?.id || 'mobile_user',
          level: gameState.playerLevel,
          credits: gameState.credits,
          reputation: gameState.reputation
        }}
      />
    );
  }

  // Ensure gameState is properly initialized before rendering
  if (!gameState || !gameState.skillTree) {
    return (
      <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center">
        <MatrixRain />
        <div className="text-green-400 text-center z-10">
          <div className="animate-pulse text-2xl font-mono mb-4">INITIALIZING NEURAL MATRIX...</div>
          <div className="text-sm">Loading skill systems</div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <GameInterface 
        gameState={gameState} 
        onGameStateUpdate={updateGameState}
        onShowMultiplayer={() => setCurrentView('multiplayer')}
        onShowLeaderboard={() => setCurrentView('leaderboard')}
      />
      
      {/* Faction Interface */}
      {showFactionInterface && (
        <FactionInterface
          gameState={gameState}
          onFactionAction={handleFactionAction}
          onClose={() => setShowFactionInterface(false)}
        />
      )}

      {showSkillTreeInterface && (
        <SkillTreeInterface
          gameState={gameState}
          onSkillPurchase={handleSkillPurchase}
          onClose={() => setShowSkillTreeInterface(false)}
        />
      )}

      {/* Mission Interface */}
      {showMissionInterface && (
        <MissionInterface       
          gameState={gameState} 
          onMissionStart={handleMissionStart}
          onClose={() => setShowMissionInterface(false)}
        />
      )}

      {/* Mini-Game Interface */}
      {activeMiniGame && (
        <MiniGameInterface
          miniGameState={activeMiniGame}
          onGameComplete={handleMiniGameComplete}
          onGameExit={handleMiniGameExit}
        />
      )}

    </div>
  );
}
