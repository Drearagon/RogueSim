import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { 
  User, 
  Trophy, 
  Star, 
  Target, 
  Zap, 
  Shield, 
  Edit3, 
  Save, 
  X,
  Clock,
  TrendingUp,
  Award,
  Settings,
  ChevronDown,
  Coins,
  LogOut
} from 'lucide-react';

interface ResponsiveUserProfileProps {
  user: {
    username: string;
    avatar: string;
    reputation: string;
    level: number;
    credits: number;
    specialization?: string;
    id?: string;
    hackerName?: string;
    email?: string;
    bio?: string;
  };
  gameState?: {
    completedMissions?: number;
    currentMission?: number;
    activeFaction?: string;
    skillTree?: {
      skillPoints?: number;
    };
  };
  onUpdateProfile: (updates: any) => void;
  onLogout: () => void;
  terminalSettings?: {
    primaryColor: string;
    backgroundColor: string;
    textColor: string;
  };
}

const mockAchievements = [
  { id: '1', name: 'First Blood', description: 'Complete your first mission', icon: '🎯', unlocked: true, rarity: 'common' as const },
  { id: '2', name: 'Speed Demon', description: 'Complete a mission in under 30 seconds', icon: '⚡', unlocked: true, rarity: 'rare' as const },
  { id: '3', name: 'Ghost Protocol', description: 'Complete 5 missions without detection', icon: '👻', unlocked: false, rarity: 'epic' as const },
  { id: '4', name: 'Elite Hacker', description: 'Reach level 50', icon: '🔥', unlocked: false, rarity: 'legendary' as const },
];

const profileThemes = [
  { id: 'matrix', name: 'Matrix', primary: '#00ff00' },
  { id: 'cyberpunk', name: 'Cyberpunk', primary: '#ff0080' },
  { id: 'terminal', name: 'Terminal', primary: '#00ffff' },
  { id: 'hacker', name: 'Hacker', primary: '#ff4040' },
];

export function ResponsiveUserProfile({
  user,
  gameState,
  onUpdateProfile,
  onLogout,
  terminalSettings = {
    primaryColor: '#00ff00',
    backgroundColor: '#000000',
    textColor: '#00ff00'
  }
}: ResponsiveUserProfileProps) {
  const [isDesktopDropdownOpen, setIsDesktopDropdownOpen] = useState(false);
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    hackerName: user?.hackerName || user?.username || 'Anonymous',
    bio: user?.bio || '',
    specialization: user?.specialization || 'network',
    theme: 'matrix'
  });

  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDesktopDropdownOpen(false);
      }
    }

    if (isDesktopDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isDesktopDropdownOpen]);

  const handleSaveProfile = async () => {
    try {
      // For hackername changes, require password confirmation
      if (editForm.hackerName !== (user?.hackerName || user?.username)) {
        const password = prompt('🔐 Password required to change hackername:');
        if (!password) {
          alert('Password required to change hackername');
          return;
        }
        
        const { updateUserProfile } = await import('@/lib/userStorage');
        await updateUserProfile({
          ...editForm,
          currentPassword: password
        });
        
        alert('✅ Profile updated successfully! Hackername changes require security verification.');
      } else {
        // Regular profile update without hackername change
        onUpdateProfile(editForm);
      }
      
      setIsEditing(false);
    } catch (error) {
      console.error('Profile update failed:', error);
      alert('❌ Profile update failed: ' + (error as Error).message);
    }
  };

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

  const getRarityColor = (rarity: string) => {
    const colors = {
      common: 'text-gray-400 border-gray-400',
      rare: 'text-blue-400 border-blue-400',
      epic: 'text-purple-400 border-purple-400',
      legendary: 'text-yellow-400 border-yellow-400'
    };
    return colors[rarity as keyof typeof colors] || colors.common;
  };

  // User Header Button (trigger for both desktop dropdown and mobile sheet)
  const UserHeaderButton = () => (
    <Button
      onClick={() => {
        if (isMobile) {
          setIsMobileSheetOpen(true);
        } else {
          setIsDesktopDropdownOpen(!isDesktopDropdownOpen);
        }
      }}
      className="p-1 h-auto backdrop-blur-sm hover:opacity-90 transition-opacity border bg-transparent text-xs"
      variant="outline"
      style={{
        backgroundColor: `${terminalSettings.backgroundColor}cc`,
        borderColor: `${terminalSettings.primaryColor}80`,
        color: terminalSettings.textColor,
        minWidth: '80px'
      }}
    >
      <div className="flex items-center gap-2">
        <Avatar 
          className="w-6 h-6 border"
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
        <div className="text-left hidden md:block">
          <div 
            className="font-mono text-xs font-bold"
            style={{ color: terminalSettings.primaryColor }}
          >
            {user.username}
          </div>
          <div className="flex items-center gap-1">
            <Badge className={`${getReputationColor(user.reputation)} text-white font-mono text-xs px-1 py-0`}>
              L{user.level}
            </Badge>
          </div>
        </div>
        <ChevronDown 
          className={`w-3 h-3 transition-transform ${isDesktopDropdownOpen ? 'rotate-180' : ''}`}
          style={{ color: terminalSettings.primaryColor }}
        />
      </div>
    </Button>
  );

  // Desktop Dropdown Content
  const DesktopDropdownContent = () => (
    <Card 
      className="absolute top-full right-0 mt-2 w-80 backdrop-blur-lg shadow-2xl border-2 profile-dropdown"
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

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="text-center">
              <div 
                className="font-mono font-bold"
                style={{ color: terminalSettings.primaryColor }}
              >
                {gameState?.completedMissions || 0}
              </div>
              <div style={{ color: `${terminalSettings.textColor}80` }}>Missions</div>
            </div>
            <div className="text-center">
              <div 
                className="font-mono font-bold"
                style={{ color: terminalSettings.primaryColor }}
              >
                {gameState?.skillTree?.skillPoints || 0}
              </div>
              <div style={{ color: `${terminalSettings.textColor}80` }}>Skill Points</div>
            </div>
            <div className="text-center">
              <div 
                className="font-mono font-bold"
                style={{ color: terminalSettings.primaryColor }}
              >
                {user.level}
              </div>
              <div style={{ color: `${terminalSettings.textColor}80` }}>Level</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            <Button
              onClick={() => {
                setIsDesktopDropdownOpen(false);
                setIsMobileSheetOpen(true);
              }}
              className="w-full justify-start bg-transparent font-mono hover:opacity-80 transition-opacity profile-action-button"
              variant="outline"
              style={{
                borderColor: `${terminalSettings.primaryColor}60`,
                color: terminalSettings.primaryColor
              }}
            >
              <User className="w-4 h-4 mr-2" />
              View Full Profile
            </Button>
            
            <Button
              onClick={() => {
                setIsDesktopDropdownOpen(false);
                onLogout();
              }}
              className="w-full justify-start bg-transparent font-mono hover:opacity-80 transition-opacity profile-action-button"
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
  );

  // Full Profile Content (for mobile sheet and desktop popup)
  const FullProfileContent = () => (
    <div className="space-y-6 profile-sheet-content">
      {/* Profile Header */}
      <div className="flex flex-col items-center space-y-4 mobile-profile-header">
        <Avatar className="w-20 h-20 border-2" style={{ borderColor: terminalSettings.primaryColor }}>
          <AvatarImage src={user.avatar} />
          <AvatarFallback 
            className="font-mono text-lg"
            style={{
              backgroundColor: terminalSettings.primaryColor,
              color: terminalSettings.backgroundColor
            }}
          >
            {editForm.hackerName.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        
        {isEditing ? (
          <div className="space-y-3 w-full max-w-xs">
            <Input
              value={editForm.hackerName}
              onChange={(e) => setEditForm(prev => ({ ...prev, hackerName: e.target.value }))}
              className="text-center font-mono profile-input"
              style={{
                backgroundColor: terminalSettings.backgroundColor,
                borderColor: terminalSettings.primaryColor,
                color: terminalSettings.textColor
              }}
              placeholder="Hacker Name"
            />
            <textarea
              value={editForm.bio}
              onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
              className="w-full p-2 rounded resize-none text-center font-mono text-sm profile-input"
              style={{
                backgroundColor: terminalSettings.backgroundColor,
                borderColor: terminalSettings.primaryColor,
                color: terminalSettings.textColor,
                border: `1px solid ${terminalSettings.primaryColor}`
              }}
              placeholder="Bio..."
              rows={2}
            />
            <div className="flex gap-2">
              <Button
                onClick={handleSaveProfile}
                className="flex-1 font-mono profile-action-button"
                style={{
                  backgroundColor: terminalSettings.primaryColor,
                  color: terminalSettings.backgroundColor
                }}
              >
                <Save className="h-4 w-4 mr-2" />
                SAVE
              </Button>
              <Button
                onClick={() => setIsEditing(false)}
                variant="outline"
                className="flex-1 font-mono profile-action-button"
                style={{
                  borderColor: terminalSettings.primaryColor,
                  color: terminalSettings.primaryColor
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <h2 
              className="text-xl font-mono font-bold mb-2"
              style={{ color: terminalSettings.primaryColor }}
            >
              {editForm.hackerName}
            </h2>
            <Badge className={`${getReputationColor(user.reputation)} text-white font-mono mb-2`}>
              {user.reputation}
            </Badge>
            {editForm.bio && (
              <p 
                className="text-sm font-mono italic px-4"
                style={{ color: `${terminalSettings.textColor}b3` }}
              >
                {editForm.bio}
              </p>
            )}
            <Button
              onClick={() => setIsEditing(true)}
              variant="ghost"
              size="sm"
              className="mt-2 font-mono profile-action-button"
              style={{ color: terminalSettings.primaryColor }}
            >
              <Edit3 className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <Card 
          className="p-4 text-center"
          style={{
            backgroundColor: `${terminalSettings.backgroundColor}80`,
            borderColor: `${terminalSettings.primaryColor}60`
          }}
        >
          <div 
            className="text-2xl font-mono font-bold"
            style={{ color: terminalSettings.primaryColor }}
          >
            {user.level}
          </div>
          <div 
            className="text-xs font-mono"
            style={{ color: `${terminalSettings.textColor}80` }}
          >
            Level
          </div>
        </Card>
        
        <Card 
          className="p-4 text-center"
          style={{
            backgroundColor: `${terminalSettings.backgroundColor}80`,
            borderColor: `${terminalSettings.primaryColor}60`
          }}
        >
          <div className="text-2xl font-mono font-bold text-yellow-400">
            {user.credits?.toLocaleString() || '0'}
          </div>
          <div 
            className="text-xs font-mono"
            style={{ color: `${terminalSettings.textColor}80` }}
          >
            Credits
          </div>
        </Card>
        
        <Card 
          className="p-4 text-center"
          style={{
            backgroundColor: `${terminalSettings.backgroundColor}80`,
            borderColor: `${terminalSettings.primaryColor}60`
          }}
        >
          <div 
            className="text-2xl font-mono font-bold"
            style={{ color: terminalSettings.primaryColor }}
          >
            {gameState?.completedMissions || 0}
          </div>
          <div 
            className="text-xs font-mono"
            style={{ color: `${terminalSettings.textColor}80` }}
          >
            Missions
          </div>
        </Card>
        
        <Card 
          className="p-4 text-center"
          style={{
            backgroundColor: `${terminalSettings.backgroundColor}80`,
            borderColor: `${terminalSettings.primaryColor}60`
          }}
        >
          <div 
            className="text-2xl font-mono font-bold"
            style={{ color: terminalSettings.primaryColor }}
          >
            {gameState?.skillTree?.skillPoints || 0}
          </div>
          <div 
            className="text-xs font-mono"
            style={{ color: `${terminalSettings.textColor}80` }}
          >
            Skill Points
          </div>
        </Card>
      </div>

      {/* Recent Achievements */}
      <div>
        <h3 
          className="text-lg font-mono font-bold mb-3"
          style={{ color: terminalSettings.primaryColor }}
        >
          Recent Achievements
        </h3>
        <div className="space-y-2">
          {mockAchievements.filter(a => a.unlocked).slice(0, 3).map((achievement) => (
            <div 
              key={achievement.id}
              className="flex items-center gap-3 p-3 rounded border"
              style={{
                backgroundColor: `${terminalSettings.backgroundColor}40`,
                borderColor: `${terminalSettings.primaryColor}40`
              }}
            >
              <div className="text-lg">{achievement.icon}</div>
              <div className="flex-1">
                <div 
                  className="font-mono font-bold text-sm"
                  style={{ color: terminalSettings.primaryColor }}
                >
                  {achievement.name}
                </div>
                <div 
                  className="text-xs font-mono"
                  style={{ color: `${terminalSettings.textColor}70` }}
                >
                  {achievement.description}
                </div>
              </div>
              <Badge variant="outline" className={getRarityColor(achievement.rarity)}>
                {achievement.rarity}
              </Badge>
            </div>
          ))}
        </div>
      </div>

      {/* Logout Button */}
      <Button
        onClick={onLogout}
        variant="outline"
        className="w-full font-mono profile-action-button"
        style={{
          borderColor: '#ff4040',
          color: '#ff4040'
        }}
      >
        <LogOut className="w-4 h-4 mr-2" />
        Logout
      </Button>
    </div>
  );

  return (
    <>
      {/* Mobile Sheet */}
      <Sheet open={isMobileSheetOpen} onOpenChange={setIsMobileSheetOpen}>
        <SheetTrigger asChild>
          <div style={{ display: 'none' }} />
        </SheetTrigger>
        <SheetContent 
          side="right" 
          className="w-full sm:w-96"
          style={{
            backgroundColor: terminalSettings.backgroundColor,
            borderColor: terminalSettings.primaryColor,
            color: terminalSettings.textColor
          }}
        >
          <SheetHeader>
            <SheetTitle 
              className="font-mono"
              style={{ color: terminalSettings.primaryColor }}
            >
              User Profile
            </SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            <FullProfileContent />
          </div>
        </SheetContent>
      </Sheet>

      {/* User Header Button - now just the button without absolute positioning */}
      <div className="relative" ref={dropdownRef}>
        <UserHeaderButton />

        {/* Desktop Dropdown */}
        {!isMobile && isDesktopDropdownOpen && <DesktopDropdownContent />}
      </div>

      {/* Click outside overlay for desktop */}
      {!isMobile && isDesktopDropdownOpen && (
        <div 
          className="fixed inset-0"
          style={{ zIndex: 9998 }}
          onClick={() => setIsDesktopDropdownOpen(false)}
        />
      )}
    </>
  );
} 