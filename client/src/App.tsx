import { useState, useEffect } from 'react';
import { BootScreen } from './components/BootScreen';
import { GameInterface } from './components/GameInterface';
import { MultiplayerRoom } from './components/MultiplayerRoom';
import { Leaderboard } from './components/Leaderboard';
import { UserProfile } from './components/UserProfile';
import { UserHeader } from './components/UserHeader';
import { MatrixRain } from './components/MatrixRain';
import { OnboardingTutorial } from './components/OnboardingTutorial';
import { Landing } from './pages/Landing';
import { AuthScreen } from './components/AuthScreen';
import { UsernameSetup } from './components/UsernameSetup';
import { useGameState } from './hooks/useGameState';
import { useSound } from './hooks/useSound';
import { useAuth } from './hooks/useAuth';
import { userProfileManager } from './lib/userProfileManager';
import { initializeFactionStandings } from './lib/factionSystem';
import { FactionInterface } from './components/FactionInterface';
import { SkillTreeInterface } from './components/SkillTreeInterface';
import { MissionInterface } from './components/MissionInterface';
import { initializeSkillTree, purchaseSkill } from './lib/skillSystem';
import { GameState, Mission } from './types/game';

export default function App() {
  const { gameState, updateGameState, isLoading: gameLoading } = useGameState();
  const { setEnabled } = useSound();
  // Use localStorage-based authentication instead of problematic useAuth hook
  const [user, setUser] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [needsUsername, setNeedsUsername] = useState(false);

  // Check authentication state on app load
  useEffect(() => {
    const checkAuth = () => {
      // Clear any existing localStorage auth data to force proper login
      localStorage.removeItem('authenticated');
      localStorage.removeItem('user');
      setAuthLoading(false);
    };
    
    checkAuth();
  }, []);
  const [currentView, setCurrentView] = useState<'auth' | 'game' | 'multiplayer' | 'leaderboard' | 'profile' | 'onboarding'>('auth');
  const [userProfile, setUserProfile] = useState<any>(null);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [showFactionInterface, setShowFactionInterface] = useState(false);
  const [showSkillTreeInterface, setShowSkillTreeInterface] = useState(false);
  const [showMissionInterface, setShowMissionInterface] = useState(false);

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
              hackerName: user.hackerName || 'Anonymous_Hacker',
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

    window.addEventListener('showMultiplayer', handleShowMultiplayer);
    window.addEventListener('showLeaderboard', handleShowLeaderboard);
    window.addEventListener('showProfile', handleShowProfile);
    window.addEventListener('showFactionInterface', handleShowFactionInterface);

    return () => {
      window.removeEventListener('showMultiplayer', handleShowMultiplayer);
      window.removeEventListener('showLeaderboard', handleShowLeaderboard);
      window.removeEventListener('showProfile', handleShowProfile);
      window.removeEventListener('showFactionInterface', handleShowFactionInterface);
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

  // Show authentication screen if not logged in
  if (!isAuthenticated) {
    return <AuthScreen onAuthSuccess={(user) => {
      // Update authentication state immediately
      setUser(user);
      setIsAuthenticated(true);
      
      // Check if user needs to set a username
      if (!user.hackerName) {
        setNeedsUsername(true);
      }
    }} />;
  }

  // Show username setup if needed
  if (needsUsername) {
    return <UsernameSetup onUsernameSet={(username) => {
      setUser({ ...user, hackerName: username });
      setNeedsUsername(false);
    }} />;
  }

  const handleBootComplete = () => {
    updateGameState({ isBootComplete: true });
  };

  const handleStartMultiplayer = (mode: 'multiplayer') => {
    setCurrentView('game');
  };

  const handleLogout = () => {
    console.log('handleLogout called in App.tsx');
    // Clear authentication state
    setUser(null);
    setIsAuthenticated(false);
    setUserProfile(null);
    setNeedsOnboarding(false);
    setCurrentView('auth');
    
    // Clear any stored auth data
    localStorage.removeItem('authenticated');
    localStorage.removeItem('user');
    
    // Try to call the logout API, but don't depend on it
    fetch('/api/logout', { method: 'POST' }).catch(() => {
      // Ignore errors - we've already cleared local state
    });
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

  // Use real authentication for all users to ensure individual profiles
  const effectiveUser = user;
  const effectiveAuth = isAuthenticated;
  
  // Show landing page if not authenticated
  if (!effectiveAuth) {
    return <Landing />;
  }

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
      <UserHeader 
        user={{
          username: effectiveUser?.hackerName || 'Anonymous_Hacker',
          avatar: effectiveUser?.profileImageUrl || '/default-avatar.png',
          reputation: gameState.reputation,
          level: gameState.playerLevel,
          credits: gameState.credits,
          specialization: 'Network Infiltration'
        }}
        gameState={{
          completedMissions: gameState.completedMissions,
          currentMission: gameState.currentMission,
          activeFaction: gameState.activeFaction,
          skillTree: {
            skillPoints: gameState.skillTree.skillPoints
          }
        }}
        onShowProfile={handleShowProfile}
        onLogout={handleLogout}
      />
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
    </div>
  );
}
