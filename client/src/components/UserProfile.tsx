import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
  Settings
} from 'lucide-react';

interface UserProfileProps {
  user: any;
  onClose: () => void;
  onUpdateProfile: (updates: any) => void;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlocked: boolean;
  unlockedDate?: string;
  progress?: number;
  maxProgress?: number;
}

const mockAchievements: Achievement[] = [
  {
    id: 'first_hack',
    name: 'First Blood',
    description: 'Complete your first successful hack',
    icon: '🎯',
    rarity: 'common',
    unlocked: true,
    unlockedDate: '2024-01-15'
  },
  {
    id: 'speed_demon',
    name: 'Speed Demon',
    description: 'Complete a mission in under 60 seconds',
    icon: '⚡',
    rarity: 'rare',
    unlocked: true,
    unlockedDate: '2024-01-20'
  },
  {
    id: 'stealth_master',
    name: 'Ghost Protocol',
    description: 'Complete 10 missions without being detected',
    icon: '👻',
    rarity: 'epic',
    unlocked: false,
    progress: 7,
    maxProgress: 10
  },
  {
    id: 'legend',
    name: 'Hacker Legend',
    description: 'Reach maximum reputation level',
    icon: '🏆',
    rarity: 'legendary',
    unlocked: false,
    progress: 85,
    maxProgress: 100
  }
];

const profileThemes = [
  { id: 'matrix', name: 'Matrix Green', primary: '#00ff00', secondary: '#003300' },
  { id: 'cyber', name: 'Cyber Blue', primary: '#00ffff', secondary: '#001a1a' },
  { id: 'neon', name: 'Neon Pink', primary: '#ff00ff', secondary: '#330033' },
  { id: 'hacker', name: 'Hacker Orange', primary: '#ff8800', secondary: '#331a00' },
  { id: 'stealth', name: 'Stealth Purple', primary: '#8800ff', secondary: '#1a0033' }
];

export function UserProfile({ user, onClose, onUpdateProfile }: UserProfileProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    hackerName: user?.hackerName || 'Anonymous',
    bio: user?.bio || '',
    specialization: user?.specialization || 'network',
    theme: user?.theme || 'matrix'
  });

  const handleSaveProfile = () => {
    onUpdateProfile(editForm);
    setIsEditing(false);
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

  const getReputationColor = (rep: string) => {
    const colors = {
      'UNKNOWN': 'text-gray-400',
      'SUSPICIOUS': 'text-yellow-400',
      'TRUSTED': 'text-blue-400',
      'ELITE': 'text-purple-400',
      'LEGENDARY': 'text-yellow-400'
    };
    return colors[rep as keyof typeof colors] || 'text-gray-400';
  };

  return (
    <div className="min-h-screen bg-black text-green-400 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-mono font-bold">USER PROFILE</h1>
          <Button 
            variant="outline" 
            onClick={onClose}
            className="border-green-400 text-green-400 hover:bg-green-400 hover:text-black"
          >
            <X className="h-4 w-4 mr-2" />
            CLOSE
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <Card className="lg:col-span-1 bg-black border-green-400">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-green-400">PROFILE</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                  className="text-green-400 hover:bg-green-400 hover:text-black"
                >
                  {isEditing ? <X className="h-4 w-4" /> : <Edit3 className="h-4 w-4" />}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center">
                <Avatar className="w-24 h-24 border-2 border-green-400 mb-4">
                  <AvatarImage src={user?.profileImageUrl} />
                  <AvatarFallback className="bg-green-400 text-black font-mono text-lg">
                    {editForm.hackerName.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                {isEditing ? (
                  <div className="space-y-3 w-full">
                    <Input
                      value={editForm.hackerName}
                      onChange={(e) => setEditForm(prev => ({ ...prev, hackerName: e.target.value }))}
                      className="bg-black border-green-400 text-green-400 font-mono"
                      placeholder="Hacker Name"
                    />
                    <textarea
                      value={editForm.bio}
                      onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                      className="w-full p-2 bg-black border border-green-400 text-green-400 font-mono rounded resize-none"
                      placeholder="Bio..."
                      rows={3}
                    />
                    <Button
                      onClick={handleSaveProfile}
                      className="w-full bg-green-400 text-black hover:bg-green-500"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      SAVE
                    </Button>
                  </div>
                ) : (
                  <div className="text-center w-full">
                    <h2 className="text-xl font-mono font-bold text-green-400 mb-2">
                      {editForm.hackerName}
                    </h2>
                    <Badge className={`${getReputationColor(user?.reputation || 'UNKNOWN')} border-current mb-3`}>
                      {user?.reputation || 'UNKNOWN'}
                    </Badge>
                    {editForm.bio && (
                      <p className="text-green-400/70 font-mono text-sm italic">{editForm.bio}</p>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-mono text-sm">Level:</span>
                  <span className="font-mono font-bold">{user?.playerLevel || 1}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-mono text-sm">Credits:</span>
                  <span className="font-mono font-bold text-yellow-400">
                    {(user?.credits || 0).toLocaleString()}₡
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-mono text-sm">Missions:</span>
                  <span className="font-mono font-bold">{user?.completedMissions || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-mono text-sm">Joined:</span>
                  <span className="font-mono text-xs">
                    {new Date().toLocaleDateString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4 bg-black border border-green-400">
                <TabsTrigger value="overview" className="data-[state=active]:bg-green-400 data-[state=active]:text-black">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  STATS
                </TabsTrigger>
                <TabsTrigger value="achievements" className="data-[state=active]:bg-green-400 data-[state=active]:text-black">
                  <Trophy className="h-4 w-4 mr-2" />
                  ACHIEVEMENTS
                </TabsTrigger>
                <TabsTrigger value="history" className="data-[state=active]:bg-green-400 data-[state=active]:text-black">
                  <Clock className="h-4 w-4 mr-2" />
                  HISTORY
                </TabsTrigger>
                <TabsTrigger value="settings" className="data-[state=active]:bg-green-400 data-[state=active]:text-black">
                  <Settings className="h-4 w-4 mr-2" />
                  SETTINGS
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="bg-black border-green-400">
                    <CardHeader>
                      <CardTitle className="text-green-400 text-lg">Mission Stats</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span className="font-mono text-sm">Success Rate:</span>
                        <span className="font-mono font-bold">87%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-mono text-sm">Best Time:</span>
                        <span className="font-mono font-bold">45s</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-mono text-sm">Stealth Ops:</span>
                        <span className="font-mono font-bold">23</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-mono text-sm">Detection Rate:</span>
                        <span className="font-mono font-bold">13%</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-black border-green-400">
                    <CardHeader>
                      <CardTitle className="text-green-400 text-lg">Multiplayer</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span className="font-mono text-sm">Rooms Created:</span>
                        <span className="font-mono font-bold">12</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-mono text-sm">Team Wins:</span>
                        <span className="font-mono font-bold">34</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-mono text-sm">Players Helped:</span>
                        <span className="font-mono font-bold">89</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-mono text-sm">Win Rate:</span>
                        <span className="font-mono font-bold">76%</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="bg-black border-green-400">
                  <CardHeader>
                    <CardTitle className="text-green-400 text-lg">Skill Progression</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="font-mono text-sm">Network Infiltration</span>
                        <span className="font-mono text-sm">85%</span>
                      </div>
                      <Progress value={85} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="font-mono text-sm">Cryptography</span>
                        <span className="font-mono text-sm">72%</span>
                      </div>
                      <Progress value={72} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="font-mono text-sm">Social Engineering</span>
                        <span className="font-mono text-sm">56%</span>
                      </div>
                      <Progress value={56} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="achievements" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {mockAchievements.map((achievement) => (
                    <Card 
                      key={achievement.id} 
                      className={`bg-black border transition-all ${
                        achievement.unlocked 
                          ? getRarityColor(achievement.rarity) 
                          : 'border-gray-600 opacity-60'
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="text-2xl">{achievement.icon}</div>
                          <div className="flex-1">
                            <h3 className={`font-mono font-bold ${
                              achievement.unlocked ? 'text-green-400' : 'text-gray-400'
                            }`}>
                              {achievement.name}
                            </h3>
                            <p className={`font-mono text-xs ${
                              achievement.unlocked ? 'text-green-400/70' : 'text-gray-500'
                            }`}>
                              {achievement.description}
                            </p>
                            {achievement.unlocked ? (
                              <p className="font-mono text-xs text-blue-400 mt-1">
                                Unlocked: {achievement.unlockedDate}
                              </p>
                            ) : achievement.progress && achievement.maxProgress && (
                              <div className="mt-2">
                                <div className="flex justify-between text-xs">
                                  <span>Progress</span>
                                  <span>{achievement.progress}/{achievement.maxProgress}</span>
                                </div>
                                <Progress 
                                  value={(achievement.progress / achievement.maxProgress) * 100} 
                                  className="h-1 mt-1" 
                                />
                              </div>
                            )}
                          </div>
                          <Badge variant="outline" className={getRarityColor(achievement.rarity)}>
                            {achievement.rarity.toUpperCase()}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="history" className="space-y-4">
                <Card className="bg-black border-green-400">
                  <CardHeader>
                    <CardTitle className="text-green-400">Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        { action: 'Completed Mission: Data Breach', time: '2 hours ago', success: true },
                        { action: 'Joined Multiplayer Room: CYBER_OPS', time: '5 hours ago', success: true },
                        { action: 'Failed Mission: Corporate Infiltration', time: '1 day ago', success: false },
                        { action: 'Purchased: Encryption Cracker v3', time: '2 days ago', success: true },
                        { action: 'Achievement Unlocked: Speed Demon', time: '3 days ago', success: true }
                      ].map((activity, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border border-green-400/30 rounded">
                          <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${
                              activity.success ? 'bg-green-400' : 'bg-red-400'
                            }`} />
                            <span className="font-mono text-sm">{activity.action}</span>
                          </div>
                          <span className="font-mono text-xs text-green-400/70">{activity.time}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="settings" className="space-y-4">
                <Card className="bg-black border-green-400">
                  <CardHeader>
                    <CardTitle className="text-green-400">Profile Customization</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <label className="font-mono text-sm text-green-400">Theme Color</label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {profileThemes.map((theme) => (
                          <button
                            key={theme.id}
                            onClick={() => setEditForm(prev => ({ ...prev, theme: theme.id }))}
                            className={`p-3 border rounded transition-all ${
                              editForm.theme === theme.id
                                ? 'border-green-400 bg-green-400/10'
                                : 'border-green-400/30 hover:border-green-400/60'
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <div 
                                className="w-4 h-4 rounded-full" 
                                style={{ backgroundColor: theme.primary }}
                              />
                              <span className="font-mono text-sm text-green-400">{theme.name}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <Button
                      onClick={handleSaveProfile}
                      className="w-full bg-green-400 text-black hover:bg-green-500"
                    >
                      SAVE SETTINGS
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}