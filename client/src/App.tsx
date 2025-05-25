import { useState, useEffect } from 'react';
import { BootScreen } from './components/BootScreen';
import { GameInterface } from './components/GameInterface';
import { MultiplayerRoom } from './components/MultiplayerRoom';
import { Leaderboard } from './components/Leaderboard';
import { AuthScreen } from './components/AuthScreen';
import { UserProfile } from './components/UserProfile';
import { useGameState } from './hooks/useGameState';
import { useSound } from './hooks/useSound';

export default function App() {
  const { gameState, updateGameState } = useGameState();
  const { setEnabled } = useSound();
  const [currentView, setCurrentView] = useState<'game' | 'multiplayer' | 'leaderboard' | 'auth' | 'profile'>('game');
  const [currentUser, setCurrentUser] = useState(null);
  
  // Sync sound settings
  useEffect(() => {
    setEnabled(gameState.soundEnabled);
  }, [gameState.soundEnabled, setEnabled]);

  // Listen for navigation events from terminal commands
  useEffect(() => {
    const handleShowMultiplayer = () => setCurrentView('multiplayer');
    const handleShowLeaderboard = () => setCurrentView('leaderboard');
    const handleShowAuth = () => setCurrentView('auth');
    const handleShowProfile = () => setCurrentView('profile');

    window.addEventListener('showMultiplayer', handleShowMultiplayer);
    window.addEventListener('showLeaderboard', handleShowLeaderboard);
    window.addEventListener('showAuth', handleShowAuth);
    window.addEventListener('showProfile', handleShowProfile);

    return () => {
      window.removeEventListener('showMultiplayer', handleShowMultiplayer);
      window.removeEventListener('showLeaderboard', handleShowLeaderboard);
      window.removeEventListener('showAuth', handleShowAuth);
      window.removeEventListener('showProfile', handleShowProfile);
    };
  }, []);

  const handleBootComplete = () => {
    updateGameState({ isBootComplete: true });
  };

  const handleStartMultiplayer = (mode: 'multiplayer') => {
    setCurrentView('game');
  };

  const handleAuthSuccess = (user: any) => {
    setCurrentUser(user);
    setCurrentView('game');
  };

  const handleUpdateProfile = (updates: any) => {
    setCurrentUser(prev => ({ ...prev, ...updates }));
  };

  if (!gameState.isBootComplete) {
    return <BootScreen onBootComplete={handleBootComplete} />;
  }

  if (currentView === 'auth') {
    return (
      <AuthScreen 
        onAuthSuccess={handleAuthSuccess}
      />
    );
  }

  if (currentView === 'profile') {
    return (
      <UserProfile 
        user={currentUser || {
          hackerName: 'Anonymous_Hacker',
          email: 'test@example.com',
          reputation: 'UNKNOWN',
          playerLevel: 1,
          credits: 1000,
          completedMissions: 0,
          bio: 'A mysterious hacker in the digital underworld...'
        }}
        onClose={() => setCurrentView('game')}
        onUpdateProfile={handleUpdateProfile}
      />
    );
  }

  if (currentView === 'multiplayer') {
    return (
      <MultiplayerRoom 
        onStartGame={handleStartMultiplayer}
        onBack={() => setCurrentView('game')}
      />
    );
  }

  if (currentView === 'leaderboard') {
    return (
      <Leaderboard onClose={() => setCurrentView('game')} />
    );
  }

  return (
    <GameInterface 
      gameState={gameState} 
      onGameStateUpdate={updateGameState}
      onShowMultiplayer={() => setCurrentView('multiplayer')}
      onShowLeaderboard={() => setCurrentView('leaderboard')}
    />
  );
}
