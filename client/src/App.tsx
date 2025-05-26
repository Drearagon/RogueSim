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
import { useGameState } from './hooks/useGameState';
import { useSound } from './hooks/useSound';
import { useAuth } from './hooks/useAuth';
import { userProfileManager } from './lib/userProfileManager';

export default function App() {
  const { gameState, updateGameState, isLoading: gameLoading } = useGameState();
  const { setEnabled } = useSound();
  // Use localStorage-based authentication instead of problematic useAuth hook
  const [user, setUser] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

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
  const [currentView, setCurrentView] = useState<'game' | 'multiplayer' | 'leaderboard' | 'profile' | 'onboarding'>('game');
  const [userProfile, setUserProfile] = useState<any>(null);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

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

    window.addEventListener('showMultiplayer', handleShowMultiplayer);
    window.addEventListener('showLeaderboard', handleShowLeaderboard);
    window.addEventListener('showProfile', handleShowProfile);

    return () => {
      window.removeEventListener('showMultiplayer', handleShowMultiplayer);
      window.removeEventListener('showLeaderboard', handleShowLeaderboard);
      window.removeEventListener('showProfile', handleShowProfile);
    };
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
    }} />;
  }



  const handleBootComplete = () => {
    updateGameState({ isBootComplete: true });
  };

  const handleStartMultiplayer = (mode: 'multiplayer') => {
    setCurrentView('game');
  };



  const handleLogout = () => {
    window.location.href = '/api/logout';
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

  if (currentView === 'profile') {
    return (
      <UserProfile 
        user={effectiveUser || {
          id: 'default_user',
          firstName: 'Player',
          lastName: 'User',
          email: 'player@roguesim.dev'
        }}
        onClose={() => setCurrentView('game')}
        onUpdateProfile={() => {}} // Profile updates handled by Replit Auth
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
        onShowProfile={() => setCurrentView('profile')}
        onLogout={handleLogout}
      />
      <GameInterface 
        gameState={gameState} 
        onGameStateUpdate={updateGameState}
        onShowMultiplayer={() => setCurrentView('multiplayer')}
        onShowLeaderboard={() => setCurrentView('leaderboard')}
      />
    </div>
  );
}
