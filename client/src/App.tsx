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
import { useGameState } from './hooks/useGameState';
import { useSound } from './hooks/useSound';
import { useAuth } from './hooks/useAuth';
import { userProfileManager } from './lib/userProfileManager';

export default function App() {
  const { gameState, updateGameState, isLoading: gameLoading } = useGameState();
  const { setEnabled } = useSound();
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const [currentView, setCurrentView] = useState<'game' | 'multiplayer' | 'leaderboard' | 'profile'>('game');

  // All hooks must be called before any conditional returns
  useEffect(() => {
    if (gameState?.soundEnabled !== undefined) {
      setEnabled(gameState.soundEnabled);
    }
  }, [gameState?.soundEnabled, setEnabled]);

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



  const handleBootComplete = () => {
    updateGameState({ isBootComplete: true });
  };

  const handleStartMultiplayer = (mode: 'multiplayer') => {
    setCurrentView('game');
  };



  const handleLogout = () => {
    window.location.href = '/api/logout';
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
          username: effectiveUser?.firstName || 'Anonymous_Hacker',
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
          username: effectiveUser?.firstName || 'Anonymous_Hacker',
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
          username: effectiveUser?.firstName || 'Anonymous_Hacker',
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
