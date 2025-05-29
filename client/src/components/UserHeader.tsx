import { useState, useEffect } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  LogOut, 
  Settings, 
  Trophy, 
  Coins,
  ChevronDown,
  User,
  Target,
  Shield
} from 'lucide-react';

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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
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

  const getReputationColor = (rep: string) => {
    switch (rep?.toUpperCase()) {
      case 'NOVICE': return 'bg-gray-500';
      case 'SCRIPT_KIDDIE': return 'bg-green-500';
      case 'HACKER': return 'bg-blue-500';
      case 'ELITE': return 'bg-purple-500';
      case 'LEGENDARY': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const handleProfileClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Profile button clicked');
    onShowProfile();
    setIsDropdownOpen(false);
  };

  const handleLogoutClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Logout button clicked');
    onLogout();
    setIsDropdownOpen(false);
  };

  const handleShopClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Shop button clicked');
    const event = new CustomEvent('openEnhancedShop');
    window.dispatchEvent(event);
    setIsDropdownOpen(false);
  };

  const handleSkillsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Skills button clicked');
    const event = new CustomEvent('showSkillTree');
    window.dispatchEvent(event);
    setIsDropdownOpen(false);
  };

  const handleFactionClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Faction button clicked');
    const event = new CustomEvent('showFactionInterface');
    window.dispatchEvent(event);
    setIsDropdownOpen(false);
  };

  const handleSettingsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Settings button clicked');
    const event = new CustomEvent('openSettings');
    window.dispatchEvent(event);
    setIsDropdownOpen(false);
  };

  // Get actual mission count from gameState
  const completedMissions = gameState?.completedMissions || 0;
  const skillPoints = gameState?.skillTree?.skillPoints || 0;

  return (
    <div className="absolute top-4 right-4 md:right-32" style={{ zIndex: 9999 }}>
      <div className="relative">
        <Button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDropdownOpen(!isDropdownOpen);
          }}
          className="p-3 h-auto backdrop-blur-sm hover:opacity-90 transition-opacity"
          variant="outline"
          style={{
            backgroundColor: `${terminalSettings.backgroundColor}cc`,
            borderColor: `${terminalSettings.primaryColor}80`,
            color: terminalSettings.textColor
          }}
        >
          <div className="flex items-center gap-3">
            <Avatar 
              className="w-8 h-8 border"
              style={{ borderColor: terminalSettings.primaryColor }}
            >
              <AvatarImage src={user.avatar} />
              <AvatarFallback 
                className="font-mono text-xs"
                style={{
                  backgroundColor: terminalSettings.primaryColor,
                  color: terminalSettings.backgroundColor
                }}
              >
                {user.username.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="text-left">
              <div 
                className="font-mono text-sm font-bold"
                style={{ color: terminalSettings.primaryColor }}
              >
                {user.username}
              </div>
              <div className="flex items-center gap-2">
                <Badge 
                  className={`${getReputationColor(user.reputation)} text-white font-mono text-xs px-1 py-0`}
                >
                  LVL {user.level}
                </Badge>
                <span className="text-yellow-400 font-mono text-xs">
                  {user.credits?.toLocaleString() || '0'}₡
                </span>
              </div>
            </div>
            <ChevronDown 
              className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
              style={{ color: terminalSettings.primaryColor }}
            />
          </div>
        </Button>

        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <Card 
            className="absolute top-full right-0 mt-2 w-72 backdrop-blur-lg shadow-2xl border-2"
            style={{
              backgroundColor: `${terminalSettings.backgroundColor}f8`,
              borderColor: `${terminalSettings.primaryColor}80`,
              zIndex: 10000
            }}
          >
            <CardContent className="p-4">
              <div className="space-y-4">
                {/* User Info */}
                <div 
                  className="text-center border-b pb-3"
                  style={{ borderColor: `${terminalSettings.primaryColor}50` }}
                >
                  <div 
                    className="font-mono font-bold text-lg"
                    style={{ color: terminalSettings.primaryColor }}
                  >
                    {user.username}
                  </div>
                  <div 
                    className="font-mono text-sm"
                    style={{ color: `${terminalSettings.textColor}b3` }}
                  >
                    {user.specialization || 'Network Infiltration Specialist'}
                  </div>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <Badge className={`${getReputationColor(user.reputation)} text-white font-mono`}>
                      {user.reputation}
                    </Badge>
                    <span className="text-yellow-400 font-mono text-sm">
                      <Coins className="w-4 h-4 inline mr-1" />
                      {user.credits?.toLocaleString() || '0'}₡
                    </span>
                  </div>
                </div>

                {/* Real Stats */}
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="text-center">
                    <div 
                      className="font-mono font-bold text-lg"
                      style={{ color: terminalSettings.primaryColor }}
                    >
                      {user.level}
                    </div>
                    <div 
                      className="font-mono"
                      style={{ color: `${terminalSettings.textColor}b3` }}
                    >
                      Level
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-cyan-400 font-mono font-bold text-lg">
                      <Trophy className="w-4 h-4 inline mr-1" />
                      {completedMissions}
                    </div>
                    <div 
                      className="font-mono"
                      style={{ color: `${terminalSettings.textColor}b3` }}
                    >
                      Missions
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-purple-400 font-mono font-bold text-lg">
                      {skillPoints}
                    </div>
                    <div 
                      className="font-mono"
                      style={{ color: `${terminalSettings.textColor}b3` }}
                    >
                      Skill Pts
                    </div>
                  </div>
                </div>

                {/* Faction Status */}
                {gameState?.activeFaction && (
                  <div 
                    className="text-center border-y py-2"
                    style={{ borderColor: `${terminalSettings.primaryColor}30` }}
                  >
                    <div className="text-orange-400 font-mono text-sm">
                      <Shield className="w-4 h-4 inline mr-1" />
                      Active Faction: {gameState.activeFaction.replace('_', ' ').toUpperCase()}
                    </div>
                  </div>
                )}

                {/* Quick Actions */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <Button
                    onClick={handleShopClick}
                    className="h-10 bg-transparent font-mono text-xs hover:opacity-80 transition-opacity"
                    variant="outline"
                    style={{
                      borderColor: `${terminalSettings.primaryColor}60`,
                      color: terminalSettings.primaryColor
                    }}
                  >
                    🛒 Shop
                  </Button>
                  
                  <Button
                    onClick={handleSkillsClick}
                    className="h-10 bg-transparent font-mono text-xs hover:opacity-80 transition-opacity"
                    variant="outline"
                    style={{
                      borderColor: `${terminalSettings.primaryColor}60`,
                      color: terminalSettings.primaryColor
                    }}
                  >
                    🧠 Skills
                  </Button>

                  <Button
                    onClick={handleFactionClick}
                    className="h-10 bg-transparent font-mono text-xs hover:opacity-80 transition-opacity"
                    variant="outline"
                    style={{
                      borderColor: `${terminalSettings.primaryColor}60`,
                      color: terminalSettings.primaryColor
                    }}
                  >
                    🏴‍☠️ Factions
                  </Button>

                  <Button
                    onClick={handleSettingsClick}
                    className="h-10 bg-transparent font-mono text-xs hover:opacity-80 transition-opacity"
                    variant="outline"
                    style={{
                      borderColor: `${terminalSettings.primaryColor}60`,
                      color: terminalSettings.primaryColor
                    }}
                  >
                    ⚙️ Settings
                  </Button>
                </div>

                {/* Main Action Buttons */}
                <div className="space-y-2">
                  <Button
                    onClick={handleProfileClick}
                    className="w-full justify-start bg-transparent font-mono hover:opacity-80 transition-opacity"
                    variant="outline"
                    style={{
                      borderColor: `${terminalSettings.primaryColor}60`,
                      color: terminalSettings.primaryColor
                    }}
                  >
                    <User className="w-4 h-4 mr-2" />
                    View Profile
                  </Button>
                  
                  <Button
                    onClick={handleLogoutClick}
                    className="w-full justify-start bg-transparent font-mono hover:opacity-80 transition-opacity"
                    variant="outline"
                    style={{
                      borderColor: '#ff404060',
                      color: '#ff4040'
                    }}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Click outside to close dropdown */}
      {isDropdownOpen && (
        <div 
          className="fixed inset-0"
          style={{ zIndex: 9998 }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDropdownOpen(false);
          }}
        />
      )}
    </div>
  );
}