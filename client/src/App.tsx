import { useState, useEffect } from 'react';
import { BootScreen } from './components/BootScreen';
import { GameInterface } from './components/GameInterface';
import { MultiplayerRoom } from './components/MultiplayerRoom';
import { Leaderboard } from './components/Leaderboard';
import { LoginPage } from './components/LoginPage';
import { UserProfile } from './components/UserProfile';
import { UserHeader } from './components/UserHeader';
import { useGameState } from './hooks/useGameState';
import { useSound } from './hooks/useSound';

export default function App() {
  const { gameState, updateGameState } = useGameState();
  const { setEnabled } = useSound();
  const [currentView, setCurrentView] = useState<'game' | 'multiplayer' | 'leaderboard' | 'profile'>('game');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // Sync sound settings
  useEffect(() => {
    setEnabled(gameState.soundEnabled);
  }, [gameState.soundEnabled, setEnabled]);

  // Listen for navigation events from terminal commands
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

  const handleBootComplete = () => {
    updateGameState({ isBootComplete: true });
  };

  const handleStartMultiplayer = (mode: 'multiplayer') => {
    setCurrentView('game');
  };

  const handleLoginSuccess = (user: any) => {
    // Clear any existing game data to ensure fresh start for this user
    localStorage.removeItem('roguesim_game_state');
    sessionStorage.removeItem('devMode');
    sessionStorage.removeItem('devGameState');
    
    setCurrentUser(user);
    setIsLoggedIn(true);
    
    // Reset game state to ensure this user gets a fresh beginning
    updateGameState({
      currentMission: 0,
      credits: 500,
      reputation: 'UNKNOWN',
      completedMissions: 0,
      unlockedCommands: ['help', 'scan', 'connect', 'status', 'clear'],
      missionProgress: 0,
      networkStatus: 'DISCONNECTED',
      playerLevel: 1,
      isBootComplete: false
    });
  };

  const handleLogout = () => {
    // Clear all stored game data when logging out
    localStorage.removeItem('roguesim_game_state');
    localStorage.removeItem('roguesim_current_user');
    sessionStorage.removeItem('devMode');
    sessionStorage.removeItem('devGameState');
    
    setCurrentUser(null);
    setIsLoggedIn(false);
  };

  const handleUpdateProfile = (updates: any) => {
    setCurrentUser((prev: any) => ({ ...prev, ...updates }));
  };

  // Show login page if not logged in
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center">
        <div className="text-center text-green-400">
          <h1 className="text-4xl font-mono mb-8">RogueSim: ESP32 Hacker Terminal</h1>
          <p className="text-lg mb-8">Access the underground hacking network</p>
          <button 
            onClick={() => window.location.href = '/api/login'}
            className="bg-green-500 hover:bg-green-600 text-black px-8 py-3 rounded font-mono text-lg transition-colors"
          >
            Initialize Connection
          </button>
        </div>
      </div>
    );
  }

  if (!gameState.isBootComplete) {
    return <BootScreen onBootComplete={handleBootComplete} />;
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
        currentUser={currentUser}
      />
    );
  }

  if (currentView === 'leaderboard') {
    return (
      <Leaderboard 
        onClose={() => setCurrentView('game')} 
        currentUser={currentUser}
      />
    );
  }

  return (
    <div className="relative">
      <UserHeader 
        user={currentUser}
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
