import { useState } from 'react';
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
  User
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
  onShowProfile: () => void;
  onLogout: () => void;
}

export function UserHeader({ user, onShowProfile, onLogout }: UserHeaderProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const getReputationColor = (rep: string) => {
    const colors = {
      'UNKNOWN': 'bg-gray-500',
      'SUSPICIOUS': 'bg-yellow-500',
      'TRUSTED': 'bg-blue-500',
      'ELITE': 'bg-purple-500',
      'LEGENDARY': 'bg-yellow-400'
    };
    return colors[rep as keyof typeof colors] || 'bg-gray-500';
  };

  return (
    <div className="absolute top-4 right-4 z-50">
      <div className="relative">
        <Button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="bg-black/80 border border-green-400/50 hover:border-green-400 p-3 h-auto backdrop-blur-sm"
          variant="outline"
        >
          <div className="flex items-center gap-3">
            <Avatar className="w-8 h-8 border border-green-400">
              <AvatarImage src={user.avatar} />
              <AvatarFallback className="bg-green-400 text-black font-mono text-xs">
                {user.username.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="text-left">
              <div className="text-green-400 font-mono text-sm font-bold">
                {user.username}
              </div>
              <div className="flex items-center gap-2">
                <Badge 
                  className={`${getReputationColor(user.reputation)} text-white font-mono text-xs px-1 py-0`}
                >
                  LVL {user.level}
                </Badge>
                <span className="text-yellow-400 font-mono text-xs">
                  {user.credits.toLocaleString()}₡
                </span>
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-green-400" />
          </div>
        </Button>

        {isDropdownOpen && (
          <Card className="absolute top-full right-0 mt-2 w-64 bg-black/90 border-green-400 backdrop-blur-sm">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-3 pb-3 border-b border-green-400/30">
                <Avatar className="w-12 h-12 border border-green-400">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback className="bg-green-400 text-black font-mono">
                    {user.username.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="text-green-400 font-mono font-bold">
                    {user.username}
                  </div>
                  <Badge className={`${getReputationColor(user.reputation)} text-white font-mono text-xs`}>
                    {user.reputation}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2 pb-3 border-b border-green-400/30">
                <div className="flex justify-between items-center">
                  <span className="text-green-400/70 font-mono text-sm">Level:</span>
                  <span className="text-green-400 font-mono font-bold">{user.level}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-green-400/70 font-mono text-sm">Credits:</span>
                  <span className="text-yellow-400 font-mono font-bold">
                    {user.credits.toLocaleString()}₡
                  </span>
                </div>
                {user.specialization && (
                  <div className="flex justify-between items-center">
                    <span className="text-green-400/70 font-mono text-sm">Spec:</span>
                    <span className="text-green-400 font-mono text-xs capitalize">
                      {user.specialization.replace('_', ' ')}
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Button
                  onClick={() => {
                    onShowProfile();
                    setIsDropdownOpen(false);
                  }}
                  className="w-full justify-start bg-transparent border-green-400/30 text-green-400 hover:bg-green-400/10 font-mono"
                  variant="outline"
                >
                  <User className="w-4 h-4 mr-2" />
                  View Profile
                </Button>
                
                <Button
                  onClick={() => {
                    onLogout();
                    setIsDropdownOpen(false);
                  }}
                  className="w-full justify-start bg-transparent border-red-400/30 text-red-400 hover:bg-red-400/10 font-mono"
                  variant="outline"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Click outside to close dropdown */}
      {isDropdownOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </div>
  );
}