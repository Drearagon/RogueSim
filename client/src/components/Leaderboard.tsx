import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, Medal, Star, TrendingUp, Users, Zap, Clock, Target } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/useAuth';

interface LeaderboardEntry {
  rank: number;
  userId: string;
  hackerName: string;
  score: number;
  category: string;
  details: string;
  timestamp: string;
}

interface PlayerStats {
  totalMissions: number;
  successfulMissions: number;
  totalCredits: number;
  reputation: string;
  currentStreak: number;
  longestStreak: number;
  totalPlayTime: number;
  multiplayerWins: number;
  multiplayerLosses: number;
  bestCompletionTime: number;
}

interface LeaderboardProps {
  onClose: () => void;
}

export function Leaderboard({ onClose }: LeaderboardProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('missions');
  const [leaderboards, setLeaderboards] = useState<Record<string, LeaderboardEntry[]>>({});
  const [playerStats, setPlayerStats] = useState<PlayerStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboards();
    loadPlayerStats();
  }, []);

  const loadLeaderboards = async () => {
    try {
      // Simulate leaderboard data for different categories
      const categories = ['missions', 'speed', 'multiplayer', 'credits'];
      const mockData: Record<string, LeaderboardEntry[]> = {};

      categories.forEach(category => {
        mockData[category] = Array.from({ length: 10 }, (_, i) => ({
          rank: i + 1,
          userId: `player_${i + 1}`,
          hackerName: `Anonymous_${String(i + 1).padStart(3, '0')}`,
          score: Math.floor(Math.random() * 10000) + (10 - i) * 1000,
          category,
          details: category === 'speed' ? `${Math.floor(Math.random() * 300) + 60}s` :
                  category === 'credits' ? `${Math.floor(Math.random() * 50000) + 10000}₡` :
                  category === 'multiplayer' ? `${Math.floor(Math.random() * 50) + 10} wins` :
                  `${Math.floor(Math.random() * 100) + 20} missions`,
          timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
        }));
      });

      setLeaderboards(mockData);
    } catch (error) {
      console.error('Failed to load leaderboards:', error);
    }
  };

  const loadPlayerStats = async () => {
    try {
      // Simulate player stats
      setPlayerStats({
        totalMissions: 47,
        successfulMissions: 42,
        totalCredits: 15750,
        reputation: 'SKILLED',
        currentStreak: 8,
        longestStreak: 12,
        totalPlayTime: 18420, // seconds
        multiplayerWins: 15,
        multiplayerLosses: 8,
        bestCompletionTime: 127
      });
    } catch (error) {
      console.error('Failed to load player stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-400" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-300" />;
    if (rank === 3) return <Medal className="h-5 w-5 text-amber-600" />;
    return <Star className="h-4 w-4 text-blue-400" />;
  };

  const getReputationColor = (reputation: string) => {
    const colors = {
      'UNKNOWN': 'text-gray-400',
      'NOVICE': 'text-green-400',
      'SKILLED': 'text-blue-400',
      'EXPERT': 'text-purple-400',
      'LEGENDARY': 'text-yellow-400'
    };
    return colors[reputation as keyof typeof colors] || 'text-gray-400';
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-green-400 p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="font-mono">Loading leaderboards...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-green-400 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-mono font-bold">GLOBAL LEADERBOARDS</h1>
          <Button 
            variant="outline" 
            onClick={onClose}
            className="border-green-400 text-green-400 hover:bg-green-400 hover:text-black"
          >
            CLOSE
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Player Stats */}
          <Card className="lg:col-span-1 bg-black border-green-400">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-400">
                <Users className="h-5 w-5" />
                YOUR STATS
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {playerStats && (
                <>
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-sm">Reputation:</span>
                    <Badge className={`${getReputationColor(playerStats.reputation)} border-current`}>
                      {playerStats.reputation}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-sm">Missions:</span>
                    <span className="font-mono">{playerStats.successfulMissions}/{playerStats.totalMissions}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-sm">Success Rate:</span>
                    <span className="font-mono">
                      {Math.round((playerStats.successfulMissions / playerStats.totalMissions) * 100)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-sm">Credits:</span>
                    <span className="font-mono text-yellow-400">{playerStats.totalCredits.toLocaleString()}₡</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-sm">Current Streak:</span>
                    <span className="font-mono text-orange-400">{playerStats.currentStreak}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-sm">Best Time:</span>
                    <span className="font-mono">{playerStats.bestCompletionTime}s</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-sm">MP Record:</span>
                    <span className="font-mono">
                      {playerStats.multiplayerWins}W/{playerStats.multiplayerLosses}L
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-sm">Play Time:</span>
                    <span className="font-mono">{formatTime(playerStats.totalPlayTime)}</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Recent Achievements */}
          <Card className="lg:col-span-2 bg-black border-green-400">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-400">
                <Star className="h-5 w-5" />
                RECENT ACHIEVEMENTS
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 border border-green-400/30 rounded">
                  <Trophy className="h-5 w-5 text-yellow-400" />
                  <div className="flex-1">
                    <p className="font-mono text-sm text-green-400">Mission Streak Master</p>
                    <p className="font-mono text-xs text-gray-400">Completed 10 missions in a row</p>
                  </div>
                  <Badge variant="outline" className="text-yellow-400 border-yellow-400">NEW</Badge>
                </div>
                <div className="flex items-center gap-3 p-3 border border-green-400/30 rounded">
                  <Zap className="h-5 w-5 text-blue-400" />
                  <div className="flex-1">
                    <p className="font-mono text-sm text-green-400">Speed Demon</p>
                    <p className="font-mono text-xs text-gray-400">Completed mission in under 2 minutes</p>
                  </div>
                  <Badge variant="outline" className="text-green-400 border-green-400">UNLOCKED</Badge>
                </div>
                <div className="flex items-center gap-3 p-3 border border-green-400/30 rounded">
                  <Users className="h-5 w-5 text-purple-400" />
                  <div className="flex-1">
                    <p className="font-mono text-sm text-green-400">Team Player</p>
                    <p className="font-mono text-xs text-gray-400">Won 10 multiplayer missions</p>
                  </div>
                  <Badge variant="outline" className="text-green-400 border-green-400">UNLOCKED</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Leaderboard Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-black border border-green-400">
            <TabsTrigger value="missions" className="data-[state=active]:bg-green-400 data-[state=active]:text-black">
              <Target className="h-4 w-4 mr-2" />
              MISSIONS
            </TabsTrigger>
            <TabsTrigger value="speed" className="data-[state=active]:bg-green-400 data-[state=active]:text-black">
              <Clock className="h-4 w-4 mr-2" />
              SPEED
            </TabsTrigger>
            <TabsTrigger value="multiplayer" className="data-[state=active]:bg-green-400 data-[state=active]:text-black">
              <Users className="h-4 w-4 mr-2" />
              MULTIPLAYER
            </TabsTrigger>
            <TabsTrigger value="credits" className="data-[state=active]:bg-green-400 data-[state=active]:text-black">
              <TrendingUp className="h-4 w-4 mr-2" />
              CREDITS
            </TabsTrigger>
          </TabsList>

          {Object.entries(leaderboards).map(([category, entries]) => (
            <TabsContent key={category} value={category} className="space-y-4">
              <Card className="bg-black border-green-400">
                <CardHeader>
                  <CardTitle className="text-green-400">
                    {category.toUpperCase()} LEADERBOARD
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {entries.map((entry) => (
                      <div 
                        key={`${entry.rank}-${entry.userId}`}
                        className={`flex items-center gap-4 p-3 rounded border ${
                          entry.userId === user?.id ? 'border-yellow-400 bg-yellow-400/10' : 'border-green-400/30'
                        }`}
                      >
                        <div className="flex items-center gap-2 w-16">
                          {getRankIcon(entry.rank)}
                          <span className="font-mono font-bold">#{entry.rank}</span>
                        </div>
                        
                        <div className="flex-1">
                          <p className="font-mono text-green-400">{entry.hackerName}</p>
                          <p className="font-mono text-xs text-gray-400">{entry.details}</p>
                        </div>
                        
                        <div className="text-right">
                          <p className="font-mono text-yellow-400 font-bold">
                            {entry.score.toLocaleString()}
                          </p>
                          <p className="font-mono text-xs text-gray-400">
                            {new Date(entry.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}