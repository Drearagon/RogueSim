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
  const [currentView, setCurrentView] = useState<'game' | 'multiplayer' | 'leaderboard'>('game');
  
  // Sync sound settings
  useEffect(() => {
    setEnabled(gameState.soundEnabled);
  }, [gameState.soundEnabled, setEnabled]);

  // Listen for multiplayer and leaderboard events from terminal commands
  useEffect(() => {
    const handleShowMultiplayer = () => setCurrentView('multiplayer');
    const handleShowLeaderboard = () => setCurrentView('leaderboard');

    window.addEventListener('showMultiplayer', handleShowMultiplayer);
    window.addEventListener('showLeaderboard', handleShowLeaderboard);

    return () => {
      window.removeEventListener('showMultiplayer', handleShowMultiplayer);
      window.removeEventListener('showLeaderboard', handleShowLeaderboard);
    };
  }, []);

  const handleBootComplete = () => {
    updateGameState({ isBootComplete: true });
  };

  const handleStartMultiplayer = (mode: 'multiplayer') => {
    updateGameState({ currentMode: mode });
    setCurrentView('game');
  };

  if (!gameState.isBootComplete) {
    return <BootScreen onBootComplete={handleBootComplete} />;
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
