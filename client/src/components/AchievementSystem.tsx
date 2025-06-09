// @ts-nocheck
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Award, Trophy, Star, Zap, Shield, Target, Clock, Brain,
  Ghost, Eye, Cpu, Network, Lock, Unlock, Crown, Gem,
  Flame, Lightning, Skull, Heart, Diamond, Sword
} from 'lucide-react';

interface Achievement {
  id: string;
  title: string;
  description: string;
  category: 'skill' | 'mission' | 'exploration' | 'social' | 'mastery' | 'legendary';
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';
  icon: React.ComponentType<any>;
  requirements: {
    type: string;
    value: number;
    current?: number;
  }[];
  rewards: {
    credits: number;
    reputation: number;
    unlocks?: string[];
  };
  isUnlocked: boolean;
  unlockedAt?: Date;
  progress: number;
  flavor: string;
  cyberpunkQuote: string;
}

interface AchievementSystemProps {
  gameState: any;
  onClose: () => void;
}

export function AchievementSystem({ gameState, onClose }: AchievementSystemProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [showUnlockedOnly, setShowUnlockedOnly] = useState(false);

  const achievements: Achievement[] = [
    // Skill Achievements
    {
      id: 'first_hack',
      title: 'Digital Genesis',
      description: 'Complete your first successful hack',
      category: 'skill',
      rarity: 'common',
      icon: Zap,
      requirements: [{ type: 'missions_completed', value: 1, current: gameState.missionsCompleted || 0 }],
      rewards: { credits: 100, reputation: 1 },
      isUnlocked: (gameState.missionsCompleted || 0) >= 1,
      progress: Math.min(((gameState.missionsCompleted || 0) / 1) * 100, 100),
      flavor: 'Every master was once a beginner.',
      cyberpunkQuote: '"In the matrix of data, you took your first step into a larger world."'
    },
    {
      id: 'stealth_master',
      title: 'Ghost Protocol',
      description: 'Complete 10 missions without triggering any alarms',
      category: 'skill',
      rarity: 'epic',
      icon: Ghost,
      requirements: [{ type: 'stealth_missions', value: 10, current: 0 }],
      rewards: { credits: 2500, reputation: 5, unlocks: ['Phantom Mode'] },
      isUnlocked: false,
      progress: 0,
      flavor: 'Invisible in the digital realm.',
      cyberpunkQuote: '"They never knew you were there. Perfect execution."'
    },
    {
      id: 'speed_demon',
      title: 'Lightning Strike',
      description: 'Complete a mission in under 2 minutes',
      category: 'skill',
      rarity: 'rare',
      icon: Lightning,
      requirements: [{ type: 'fastest_mission', value: 120, current: 999 }],
      rewards: { credits: 1000, reputation: 3 },
      isUnlocked: false,
      progress: 0,
      flavor: 'Speed is the ultimate weapon.',
      cyberpunkQuote: '"Faster than thought, quicker than reflex."'
    },

    // Mission Achievements
    {
      id: 'corporate_nemesis',
      title: 'Corporate Crusher',
      description: 'Successfully infiltrate 5 corporate networks',
      category: 'mission',
      rarity: 'rare',
      icon: Target,
      requirements: [{ type: 'corporate_missions', value: 5, current: 0 }],
      rewards: { credits: 1500, reputation: 4 },
      isUnlocked: false,
      progress: 0,
      flavor: 'The corporations fear your name.',
      cyberpunkQuote: '"Another corporate giant falls to the digital underground."'
    },
    {
      id: 'government_infiltrator',
      title: 'Shadow Operative',
      description: 'Breach 3 government facilities without detection',
      category: 'mission',
      rarity: 'epic',
      icon: Shield,
      requirements: [{ type: 'government_missions', value: 3, current: 0 }],
      rewards: { credits: 3000, reputation: 6, unlocks: ['Government Contacts'] },
      isUnlocked: false,
      progress: 0,
      flavor: 'Even the most secure systems bow to your skills.',
      cyberpunkQuote: '"In the shadows of power, you move unseen."'
    },

    // Exploration Achievements
    {
      id: 'data_archaeologist',
      title: 'Digital Archaeologist',
      description: 'Discover 50 hidden files across all missions',
      category: 'exploration',
      rarity: 'rare',
      icon: Eye,
      requirements: [{ type: 'hidden_files', value: 50, current: 0 }],
      rewards: { credits: 2000, reputation: 4 },
      isUnlocked: false,
      progress: 0,
      flavor: 'Secrets reveal themselves to the persistent.',
      cyberpunkQuote: '"Every byte of data tells a story. You read them all."'
    },
    {
      id: 'network_explorer',
      title: 'Net Navigator',
      description: 'Map 25 different network architectures',
      category: 'exploration',
      rarity: 'epic',
      icon: Network,
      requirements: [{ type: 'networks_mapped', value: 25, current: 0 }],
      rewards: { credits: 2500, reputation: 5, unlocks: ['Advanced Mapping Tools'] },
      isUnlocked: false,
      progress: 0,
      flavor: 'The digital landscape holds no mysteries for you.',
      cyberpunkQuote: '"You see patterns where others see chaos."'
    },

    // Social Achievements  
    {
      id: 'team_player',
      title: 'Collective Consciousness',
      description: 'Complete 10 multiplayer missions',
      category: 'social',
      rarity: 'rare',
      icon: Heart,
      requirements: [{ type: 'multiplayer_missions', value: 10, current: 0 }],
      rewards: { credits: 1500, reputation: 4 },
      isUnlocked: false,
      progress: 0,
      flavor: 'Together, you are unstoppable.',
      cyberpunkQuote: '"In unity, the collective transcends the individual."'
    },

    // Mastery Achievements
    {
      id: 'encryption_breaker',
      title: 'Cipher Sovereign',
      description: 'Crack 100 different encryption algorithms',
      category: 'mastery',
      rarity: 'legendary',
      icon: Lock,
      requirements: [{ type: 'encryptions_cracked', value: 100, current: 0 }],
      rewards: { credits: 5000, reputation: 10, unlocks: ['Quantum Decoder'] },
      isUnlocked: false,
      progress: 0,
      flavor: 'No code can withstand your intellect.',
      cyberpunkQuote: '"Mathematics bends to your will, encryption yields to your mind."'
    },
    {
      id: 'ai_whisperer',
      title: 'Machine Oracle',
      description: 'Successfully manipulate 50 AI security systems',
      category: 'mastery',
      rarity: 'legendary',
      icon: Brain,
      requirements: [{ type: 'ai_manipulated', value: 50, current: 0 }],
      rewards: { credits: 7500, reputation: 12, unlocks: ['AI Neural Interface'] },
      isUnlocked: false,
      progress: 0,
      flavor: 'Artificial minds recognize a superior intelligence.',
      cyberpunkQuote: '"The machines speak to you in languages of logic and light."'
    },

    // Legendary Achievements
    {
      id: 'digital_legend',
      title: 'Digital Deity',
      description: 'Reach maximum reputation and complete 100 missions',
      category: 'legendary',
      rarity: 'mythic',
      icon: Crown,
      requirements: [
        { type: 'missions_completed', value: 100, current: gameState.missionsCompleted || 0 },
        { type: 'reputation_level', value: 10, current: 0 }
      ],
      rewards: { credits: 50000, reputation: 25, unlocks: ['Legendary Status', 'Infinite Access'] },
      isUnlocked: false,
      progress: 0,
      flavor: 'You have transcended mortal limitations.',
      cyberpunkQuote: '"In the digital realm, you are no longer human - you are legend."'
    },
    {
      id: 'system_architect',
      title: 'Reality Hacker',
      description: 'Discover and exploit a zero-day vulnerability',
      category: 'legendary',
      rarity: 'mythic',
      icon: Gem,
      requirements: [{ type: 'zero_days_found', value: 1, current: 0 }],
      rewards: { credits: 25000, reputation: 15, unlocks: ['Reality Manipulation'] },
      isUnlocked: false,
      progress: 0,
      flavor: 'You reshape the digital world with your will.',
      cyberpunkQuote: '"You found a crack in the matrix itself."'
    }
  ];

  const getRarityConfig = (rarity: string) => {
    const configs = {
      common: { color: 'text-gray-400 border-gray-400', glow: 'shadow-gray-400/20' },
      rare: { color: 'text-blue-400 border-blue-400', glow: 'shadow-blue-400/30' },
      epic: { color: 'text-purple-400 border-purple-400', glow: 'shadow-purple-400/40' },
      legendary: { color: 'text-yellow-400 border-yellow-400', glow: 'shadow-yellow-400/50' },
      mythic: { color: 'text-red-400 border-red-400', glow: 'shadow-red-400/60' }
    };
    return configs[rarity] || configs.common;
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      skill: Zap,
      mission: Target,
      exploration: Eye,
      social: Heart,
      mastery: Crown,
      legendary: Gem
    };
    return icons[category] || Award;
  };

  const filteredAchievements = achievements.filter(achievement => {
    const categoryMatch = selectedCategory === 'all' || achievement.category === selectedCategory;
    const unlockedMatch = !showUnlockedOnly || achievement.isUnlocked;
    return categoryMatch && unlockedMatch;
  });

  const unlockedCount = achievements.filter(a => a.isUnlocked).length;
  const totalPoints = achievements.filter(a => a.isUnlocked).reduce((sum, a) => sum + a.rewards.reputation, 0);

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-6xl bg-black/90 border-green-400 text-green-400 max-h-[90vh] overflow-hidden">
        <CardHeader className="border-b border-green-400">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3">
              <Trophy className="h-6 w-6" />
              ACHIEVEMENT MATRIX
            </CardTitle>
            <div className="flex items-center gap-4">
              <div className="text-sm font-mono">
                <span className="text-green-400">{unlockedCount}</span>
                <span className="text-green-400/60">/{achievements.length}</span>
              </div>
              <div className="text-sm font-mono">
                <span className="text-yellow-400">{totalPoints}</span>
                <span className="text-green-400/60"> points</span>
              </div>
              <button 
                onClick={onClose}
                className="text-green-400 hover:text-green-300 text-xl"
              >
                ×
              </button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="grid grid-cols-1 lg:grid-cols-3 h-[600px]">
            {/* Filter Panel */}
            <div className="border-r border-green-400 p-4">
              <h3 className="text-lg font-mono mb-4">CATEGORIES</h3>
              
              <div className="space-y-2 mb-6">
                {[
                  { id: 'all', label: 'ALL ACHIEVEMENTS', icon: Award },
                  { id: 'skill', label: 'SKILL MASTERY', icon: Zap },
                  { id: 'mission', label: 'MISSION COMPLETE', icon: Target },
                  { id: 'exploration', label: 'DIGITAL EXPLORER', icon: Eye },
                  { id: 'social', label: 'COLLECTIVE', icon: Heart },
                  { id: 'mastery', label: 'GRAND MASTERY', icon: Crown },
                  { id: 'legendary', label: 'LEGENDARY', icon: Gem }
                ].map(category => {
                  const Icon = category.icon;
                  const count = category.id === 'all' 
                    ? achievements.length 
                    : achievements.filter(a => a.category === category.id).length;
                  
                  return (
                    <Button
                      key={category.id}
                      variant={selectedCategory === category.id ? "default" : "outline"}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full justify-start ${
                        selectedCategory === category.id 
                          ? 'bg-green-400 text-black' 
                          : 'border-green-400 text-green-400'
                      }`}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {category.label}
                      <Badge variant="outline" className="ml-auto text-xs">
                        {count}
                      </Badge>
                    </Button>
                  );
                })}
              </div>

              <div className="border-t border-green-400 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowUnlockedOnly(!showUnlockedOnly)}
                  className={`w-full ${
                    showUnlockedOnly 
                      ? 'border-green-400 bg-green-400/20' 
                      : 'border-green-400'
                  }`}
                >
                  {showUnlockedOnly ? <Unlock className="h-4 w-4 mr-2" /> : <Lock className="h-4 w-4 mr-2" />}
                  {showUnlockedOnly ? 'SHOW ALL' : 'UNLOCKED ONLY'}
                </Button>
              </div>
            </div>

            {/* Achievement Grid */}
            <div className="p-4 overflow-y-auto">
              <h3 className="text-lg font-mono mb-4">
                {selectedCategory.toUpperCase()} 
                <span className="text-green-400/60 ml-2">
                  ({filteredAchievements.length})
                </span>
              </h3>
              
              <div className="grid grid-cols-1 gap-3">
                {filteredAchievements.map(achievement => {
                  const Icon = achievement.icon;
                  const rarityConfig = getRarityConfig(achievement.rarity);
                  
                  return (
                    <Card
                      key={achievement.id}
                      className={`cursor-pointer transition-all ${
                        selectedAchievement?.id === achievement.id
                          ? 'border-green-400 bg-green-400/10 ' + rarityConfig.glow
                          : achievement.isUnlocked
                            ? `${rarityConfig.color} ${rarityConfig.glow} hover:bg-green-400/5`
                            : 'border-gray-600 opacity-60 hover:border-green-400/50'
                      }`}
                      onClick={() => setSelectedAchievement(achievement)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded ${
                            achievement.isUnlocked 
                              ? `border-2 ${rarityConfig.color} ${rarityConfig.glow}` 
                              : 'border border-gray-600'
                          }`}>
                            <Icon className={`h-6 w-6 ${
                              achievement.isUnlocked ? rarityConfig.color.split(' ')[0] : 'text-gray-600'
                            }`} />
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className={`font-mono font-bold text-sm ${
                                achievement.isUnlocked ? 'text-green-400' : 'text-gray-400'
                              }`}>
                                {achievement.title}
                              </h4>
                              <Badge className={`text-xs ${rarityConfig.color}`}>
                                {achievement.rarity}
                              </Badge>
                            </div>
                            
                            <p className="text-xs text-green-400/70 mb-2">
                              {achievement.description}
                            </p>
                            
                            {!achievement.isUnlocked && (
                              <div className="space-y-1">
                                <div className="flex justify-between text-xs">
                                  <span>Progress</span>
                                  <span>{achievement.progress.toFixed(0)}%</span>
                                </div>
                                <Progress value={achievement.progress} className="h-1" />
                              </div>
                            )}
                            
                            {achievement.isUnlocked && achievement.unlockedAt && (
                              <div className="text-xs text-blue-400 mt-1">
                                Unlocked: {achievement.unlockedAt.toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Achievement Details */}
            <div className="border-l border-green-400 p-4">
              {selectedAchievement ? (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className={`inline-block p-4 rounded-lg border-2 ${
                      getRarityConfig(selectedAchievement.rarity).color
                    } ${getRarityConfig(selectedAchievement.rarity).glow}`}>
                      <selectedAchievement.icon className="h-12 w-12" />
                    </div>
                    <h3 className="text-xl font-mono font-bold mt-3 mb-1">
                      {selectedAchievement.title}
                    </h3>
                    <Badge className={`${getRarityConfig(selectedAchievement.rarity).color} text-sm`}>
                      {selectedAchievement.rarity.toUpperCase()}
                    </Badge>
                  </div>

                  <div className="border border-green-400 rounded p-4">
                    <h4 className="font-mono font-bold mb-2">DESCRIPTION</h4>
                    <p className="text-sm text-green-400/80 mb-3">
                      {selectedAchievement.description}
                    </p>
                    <p className="text-xs text-green-400/60 italic">
                      "{selectedAchievement.flavor}"
                    </p>
                  </div>

                  <div className="border border-green-400 rounded p-4">
                    <h4 className="font-mono font-bold mb-2">REQUIREMENTS</h4>
                    <div className="space-y-2">
                      {selectedAchievement.requirements.map((req, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span>{req.type.replace('_', ' ').toUpperCase()}</span>
                          <span>
                            {req.current || 0} / {req.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border border-green-400 rounded p-4">
                    <h4 className="font-mono font-bold mb-2">REWARDS</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Credits:</span>
                        <span className="text-yellow-400">{selectedAchievement.rewards.credits}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Reputation:</span>
                        <span className="text-blue-400">+{selectedAchievement.rewards.reputation}</span>
                      </div>
                      {selectedAchievement.rewards.unlocks && (
                        <div className="mt-2">
                          <span className="text-xs text-green-400/70">UNLOCKS:</span>
                          {selectedAchievement.rewards.unlocks.map((unlock, index) => (
                            <Badge key={index} variant="outline" className="ml-1 text-xs border-green-400">
                              {unlock}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="border border-cyan-400 rounded p-4 bg-cyan-400/5">
                    <h4 className="font-mono font-bold mb-2 text-cyan-400">NEURAL ECHO</h4>
                    <p className="text-xs text-cyan-400/80 italic leading-relaxed">
                      {selectedAchievement.cyberpunkQuote}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Award className="h-16 w-16 mx-auto mb-4 text-green-400/50" />
                  <p className="font-mono text-green-400/70">
                    SELECT AN ACHIEVEMENT
                  </p>
                  <p className="text-sm text-green-400/50 mt-2">
                    Click on any achievement to view details
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}