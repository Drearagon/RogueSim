import React, { useState, useEffect } from 'react';
import { ResponsiveUserProfile } from './ResponsiveUserProfile';

interface UserHeaderProps {
  user: {
    username: string;
    avatar: string;
    reputation: string;
    level: number;
    credits: number;
    specialization?: string;
  };
  gameState?: {
    completedMissions?: number;
    currentMission?: number;
    activeFaction?: string;
    skillTree?: {
      skillPoints?: number;
    };
  };
  onShowProfile: () => void;
  onLogout: () => void;
}

interface TerminalSettings {
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

export function UserHeader({ user, gameState, onShowProfile, onLogout }: UserHeaderProps) {
  const [terminalSettings, setTerminalSettings] = useState<TerminalSettings>({
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

  // Listen for terminal settings changes
  useEffect(() => {
    const handleTerminalSettingsChanged = (event: CustomEvent) => {
      if (event.detail) {
        setTerminalSettings(event.detail);
      }
    };

    window.addEventListener('terminalSettingsChanged', handleTerminalSettingsChanged as EventListener);
    
    return () => {
      window.removeEventListener('terminalSettingsChanged', handleTerminalSettingsChanged as EventListener);
    };
  }, []);

  const handleUpdateProfile = (updates: any) => {
    // Handle profile updates - this can be extended to integrate with your profile management system
    console.log('Profile updated:', updates);
    // You might want to call an API here or update local storage
  };

  return (
    <ResponsiveUserProfile
      user={user}
      gameState={gameState}
      onUpdateProfile={handleUpdateProfile}
      onLogout={onLogout}
      terminalSettings={{
        primaryColor: terminalSettings.primaryColor,
        backgroundColor: terminalSettings.backgroundColor,
        textColor: terminalSettings.textColor
      }}
    />
  );
}