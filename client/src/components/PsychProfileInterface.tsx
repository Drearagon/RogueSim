import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Brain, 
  Heart, 
  Target, 
  Shield, 
  Zap, 
  Eye,
  Scale,
  Award,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Users,
  Lock,
  Unlock
} from 'lucide-react';

export interface PsychProfile {
  // Core Personality Traits (0-100)
  cunning: number;        // Strategic thinking and manipulation
  empathy: number;        // Care for others and moral consideration  
  aggression: number;     // Willingness to use force/destructive methods
  patience: number;       // Long-term planning vs impulsiveness
  paranoia: number;       // Suspicion and security consciousness
  curiosity: number;      // Drive to explore and learn

  // Moral Alignment (-100 to +100)
  ethicalAlignment: number; // -100 (chaotic evil) to +100 (lawful good)
  
  // Reputation Scores
  corporateReputation: number;    // Standing with corporations
  hackivistReputation: number;    // Standing with activist groups
  criminalReputation: number;     // Standing with criminal organizations
  governmentReputation: number;   // Standing with government agencies
  
  // Psychological State
  mentalStability: number;        // Current psychological health
  moralConflict: number;         // Internal conflict from contradictory actions
  
  // Unlocked Paths and Consequences
  unlockedStoryPaths: string[];
  permanentConsequences: string[];
  
  // Profile History
  majorDecisions: Array<{
    id: string;
    description: string;
    ethicalWeight: number;
    traitImpacts: Record<string, number>;
    timestamp: number;
    consequences: string[];
  }>;
}

interface PsychProfileInterfaceProps {
  psychProfile: PsychProfile;
  onProfileUpdate: (profile: PsychProfile) => void;
  onMakeDecision: (decisionId: string, choice: string) => void;
  onClose: () => void;
}

const PsychProfileInterface: React.FC<PsychProfileInterfaceProps> = ({
  psychProfile,
  onProfileUpdate,
  onMakeDecision,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [currentDilemma, setCurrentDilemma] = useState<any>(null);

  // Handle escape key to close
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Sample moral dilemmas that can appear during gameplay
  const moralDilemmas = [
    {
      id: 'data_breach_whistle',
      title: 'Corporate Data Breach Discovery',
      description: 'You\'ve discovered evidence of a major corporation covering up a data breach affecting millions. The data contains personal information of innocent users.',
      choices: [
        {
          id: 'expose_public',
          text: 'Leak everything to the public immediately',
          ethicalWeight: 25,
          traitImpacts: { empathy: 10, aggression: 5, patience: -10 },
          consequences: ['Public hero status', 'Corporate enemies', 'Government attention']
        },
        {
          id: 'responsible_disclosure',
          text: 'Contact the corporation for responsible disclosure',
          ethicalWeight: 15,
          traitImpacts: { empathy: 5, patience: 10, cunning: -5 },
          consequences: ['Corporate gratitude', 'Potential cover-up', 'Ethical recognition']
        },
        {
          id: 'sell_highest_bidder',
          text: 'Sell the information to the highest bidder',
          ethicalWeight: -30,
          traitImpacts: { cunning: 15, empathy: -15, aggression: 5 },
          consequences: ['Significant profit', 'Criminal connections', 'Moral degradation']
        },
        {
          id: 'blackmail_corporation',
          text: 'Use the information to blackmail the corporation',
          ethicalWeight: -20,
          traitImpacts: { cunning: 10, aggression: 10, empathy: -10 },
          consequences: ['Ongoing income', 'Corporate fear', 'Criminal reputation']
        }
      ]
    },
    {
      id: 'innocent_system_access',
      title: 'Innocent Bystander System',
      description: 'While pursuing a target, you gain access to an innocent person\'s system containing private family photos and personal documents.',
      choices: [
        {
          id: 'ignore_continue',
          text: 'Ignore the personal data and continue mission',
          ethicalWeight: 10,
          traitImpacts: { empathy: 5, patience: 5, paranoia: -5 },
          consequences: ['Mission success', 'Clear conscience', 'Professional reputation']
        },
        {
          id: 'warn_victim',
          text: 'Anonymously warn the person about their security',
          ethicalWeight: 20,
          traitImpacts: { empathy: 15, cunning: 5, aggression: -5 },
          consequences: ['Good deed', 'Potential exposure risk', 'Karmic balance']
        },
        {
          id: 'exploit_personal',
          text: 'Use their personal information for additional leverage',
          ethicalWeight: -25,
          traitImpacts: { cunning: 10, empathy: -20, aggression: 10 },
          consequences: ['Additional intel', 'Innocent victim', 'Moral corruption']
        }
      ]
    }
  ];

  const getAlignmentLabel = (alignment: number): { label: string; color: string } => {
    if (alignment >= 75) return { label: 'Lawful Good', color: 'text-blue-400' };
    if (alignment >= 50) return { label: 'Neutral Good', color: 'text-green-400' };
    if (alignment >= 25) return { label: 'Chaotic Good', color: 'text-yellow-400' };
    if (alignment >= -25) return { label: 'True Neutral', color: 'text-gray-400' };
    if (alignment >= -50) return { label: 'Chaotic Neutral', color: 'text-orange-400' };
    if (alignment >= -75) return { label: 'Neutral Evil', color: 'text-red-400' };
    return { label: 'Chaotic Evil', color: 'text-purple-400' };
  };

  const getReputationStatus = (reputation: number): { status: string; color: string } => {
    if (reputation >= 75) return { status: 'Revered', color: 'text-green-400' };
    if (reputation >= 50) return { status: 'Respected', color: 'text-blue-400' };
    if (reputation >= 25) return { status: 'Recognized', color: 'text-yellow-400' };
    if (reputation >= -25) return { status: 'Unknown', color: 'text-gray-400' };
    if (reputation >= -50) return { status: 'Disliked', color: 'text-orange-400' };
    if (reputation >= -75) return { status: 'Hated', color: 'text-red-400' };
    return { status: 'Hunted', color: 'text-purple-400' };
  };

  const triggerRandomDilemma = () => {
    const randomDilemma = moralDilemmas[Math.floor(Math.random() * moralDilemmas.length)];
    setCurrentDilemma(randomDilemma);
  };

  const handleDecisionChoice = (choice: any) => {
    if (!currentDilemma) return;

    // Create decision record
    const decision = {
      id: currentDilemma.id + '_' + choice.id,
      description: `${currentDilemma.title}: ${choice.text}`,
      ethicalWeight: choice.ethicalWeight,
      traitImpacts: choice.traitImpacts,
      timestamp: Date.now(),
      consequences: choice.consequences
    };

    // Update psych profile
    const updatedProfile = { ...psychProfile };
    
    // Apply trait impacts with proper typing
    Object.entries(choice.traitImpacts).forEach(([trait, impact]) => {
      const numericImpact = impact as number;
      if (trait in updatedProfile && typeof updatedProfile[trait as keyof PsychProfile] === 'number') {
        const currentValue = updatedProfile[trait as keyof PsychProfile] as number;
        (updatedProfile as any)[trait] = Math.max(0, Math.min(100, currentValue + numericImpact));
      }
    });

    // Update ethical alignment
    updatedProfile.ethicalAlignment = Math.max(-100, Math.min(100, 
      updatedProfile.ethicalAlignment + choice.ethicalWeight));

    // Update reputation based on choice
    if (choice.ethicalWeight > 15) {
      updatedProfile.hackivistReputation += 10;
      updatedProfile.governmentReputation += 5;
    } else if (choice.ethicalWeight < -15) {
      updatedProfile.criminalReputation += 15;
      updatedProfile.corporateReputation -= 10;
    }

    // Add decision to history
    updatedProfile.majorDecisions.push(decision);

    // Add consequences to permanent consequences if significant
    if (Math.abs(choice.ethicalWeight) > 20) {
      updatedProfile.permanentConsequences.push(...choice.consequences);
    }

    // Check for unlocked story paths
    if (updatedProfile.ethicalAlignment > 60 && !updatedProfile.unlockedStoryPaths.includes('hero_path')) {
      updatedProfile.unlockedStoryPaths.push('hero_path');
    }
    if (updatedProfile.ethicalAlignment < -60 && !updatedProfile.unlockedStoryPaths.includes('villain_path')) {
      updatedProfile.unlockedStoryPaths.push('villain_path');
    }
    if (updatedProfile.criminalReputation > 70 && !updatedProfile.unlockedStoryPaths.includes('crime_lord_path')) {
      updatedProfile.unlockedStoryPaths.push('crime_lord_path');
    }

    onProfileUpdate(updatedProfile);
    onMakeDecision(currentDilemma.id, choice.id);
    setCurrentDilemma(null);
  };

  const TraitBar = ({ label, value, icon: Icon, description }: any) => (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Icon size={16} className="text-cyan-400" />
        <span className="text-sm font-medium text-gray-300">{label}</span>
        <span className="text-xs text-gray-500 ml-auto">{value}/100</span>
      </div>
      <Progress value={value} className="h-2" />
      <p className="text-xs text-gray-400">{description}</p>
    </div>
  );

  const alignment = getAlignmentLabel(psychProfile.ethicalAlignment);

  return (
    <div className="fixed inset-0 bg-black/90 z-50 overflow-auto">
      <div className="min-h-screen bg-black text-green-400 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                <Brain className="text-cyan-400" size={32} />
                Psychological Profile
              </h1>
              <p className="text-gray-400">
                Your actions shape your personality and reputation in the digital underworld
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={onClose}
              className="text-red-400 border-red-400 hover:bg-red-400/10"
            >
              Close [ESC]
            </Button>
          </div>

          {/* Current Moral Dilemma */}
          {currentDilemma && (
            <Card className="mb-6 bg-red-900/20 border-red-500">
              <CardHeader>
                <CardTitle className="text-red-400 flex items-center gap-2">
                  <AlertTriangle size={20} />
                  Moral Dilemma: {currentDilemma.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 mb-4">{currentDilemma.description}</p>
                <div className="grid gap-3">
                  {currentDilemma.choices.map((choice: any) => (
                    <Button
                      key={choice.id}
                      variant="outline"
                      className="p-4 h-auto text-left justify-start"
                      onClick={() => handleDecisionChoice(choice)}
                    >
                      <div>
                        <div className="font-medium text-gray-200">{choice.text}</div>
                        <div className="text-sm text-gray-400 mt-1">
                          Ethical Impact: {choice.ethicalWeight > 0 ? '+' : ''}{choice.ethicalWeight}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Consequences: {choice.consequences.join(', ')}
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5 bg-gray-900">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="traits">Personality</TabsTrigger>
              <TabsTrigger value="reputation">Reputation</TabsTrigger>
              <TabsTrigger value="consequences">Consequences</TabsTrigger>
              <TabsTrigger value="history">Decisions</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Current Alignment */}
                <Card className="bg-gray-900 border-gray-700">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Scale className="text-cyan-400" size={20} />
                      Moral Alignment
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center space-y-4">
                      <div className={`text-2xl font-bold ${alignment.color}`}>
                        {alignment.label}
                      </div>
                      <Progress 
                        value={((psychProfile.ethicalAlignment + 100) / 200) * 100} 
                        className="h-4"
                      />
                      <div className="flex justify-between text-xs text-gray-400">
                        <span>Chaotic Evil</span>
                        <span>Lawful Good</span>
                      </div>
                      <p className="text-sm text-gray-400">
                        Alignment: {psychProfile.ethicalAlignment}/100
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Mental State */}
                <Card className="bg-gray-900 border-gray-700">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Heart className="text-red-400" size={20} />
                      Mental State
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Mental Stability</span>
                        <span>{psychProfile.mentalStability}/100</span>
                      </div>
                      <Progress value={psychProfile.mentalStability} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Moral Conflict</span>
                        <span>{psychProfile.moralConflict}/100</span>
                      </div>
                      <Progress value={psychProfile.moralConflict} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle>Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-3">
                    <Button onClick={triggerRandomDilemma} variant="outline">
                      <AlertTriangle size={16} className="mr-2" />
                      Face Moral Dilemma
                    </Button>
                    <Button variant="outline" disabled>
                      <Eye size={16} className="mr-2" />
                      Analyze Target Psychology
                    </Button>
                    <Button variant="outline" disabled>
                      <Shield size={16} className="mr-2" />
                      Mental Defense Training
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="traits" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-gray-900 border-gray-700">
                  <CardHeader>
                    <CardTitle>Core Personality Traits</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <TraitBar
                      label="Cunning"
                      value={psychProfile.cunning}
                      icon={Brain}
                      description="Strategic thinking and manipulation ability"
                    />
                    <TraitBar
                      label="Empathy"
                      value={psychProfile.empathy}
                      icon={Heart}
                      description="Care for others and moral consideration"
                    />
                    <TraitBar
                      label="Aggression"
                      value={psychProfile.aggression}
                      icon={Zap}
                      description="Willingness to use force and destructive methods"
                    />
                  </CardContent>
                </Card>

                <Card className="bg-gray-900 border-gray-700">
                  <CardHeader>
                    <CardTitle>Behavioral Traits</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <TraitBar
                      label="Patience"
                      value={psychProfile.patience}
                      icon={Target}
                      description="Long-term planning vs impulsiveness"
                    />
                    <TraitBar
                      label="Paranoia"
                      value={psychProfile.paranoia}
                      icon={Shield}
                      description="Suspicion and security consciousness"
                    />
                    <TraitBar
                      label="Curiosity"
                      value={psychProfile.curiosity}
                      icon={Eye}
                      description="Drive to explore and learn new things"
                    />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="reputation" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries({
                  'Corporate': psychProfile.corporateReputation,
                  'Hacktivist': psychProfile.hackivistReputation,
                  'Criminal': psychProfile.criminalReputation,
                  'Government': psychProfile.governmentReputation
                }).map(([faction, reputation]) => {
                  const status = getReputationStatus(reputation);
                  return (
                    <Card key={faction} className="bg-gray-900 border-gray-700">
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <span>{faction} Reputation</span>
                          <Badge className={status.color}>{status.status}</Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Progress value={((reputation + 100) / 200) * 100} className="h-3 mb-2" />
                        <p className="text-sm text-gray-400">Score: {reputation}/100</p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="consequences" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Unlocked Story Paths */}
                <Card className="bg-gray-900 border-gray-700">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Unlock className="text-green-400" size={20} />
                      Unlocked Story Paths
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {psychProfile.unlockedStoryPaths.length > 0 ? (
                      <div className="space-y-2">
                        {psychProfile.unlockedStoryPaths.map((path) => (
                          <Badge key={path} variant="outline" className="mr-2">
                            {path.replace('_', ' ').toUpperCase()}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-400 text-sm">No special paths unlocked yet</p>
                    )}
                  </CardContent>
                </Card>

                {/* Permanent Consequences */}
                <Card className="bg-gray-900 border-gray-700">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lock className="text-red-400" size={20} />
                      Permanent Consequences
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {psychProfile.permanentConsequences.length > 0 ? (
                      <div className="space-y-2">
                        {psychProfile.permanentConsequences.map((consequence, index) => (
                          <div key={index} className="text-sm text-gray-300 p-2 bg-gray-800 rounded">
                            {consequence}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-400 text-sm">No permanent consequences yet</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle>Decision History</CardTitle>
                </CardHeader>
                <CardContent>
                  {psychProfile.majorDecisions.length > 0 ? (
                    <div className="space-y-4">
                      {psychProfile.majorDecisions.slice().reverse().map((decision) => (
                        <div key={decision.id} className="p-4 bg-gray-800 rounded border-l-4 border-cyan-400">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium text-gray-200">{decision.description}</h4>
                            <Badge variant={decision.ethicalWeight >= 0 ? "default" : "destructive"}>
                              {decision.ethicalWeight >= 0 ? '+' : ''}{decision.ethicalWeight}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-400 mb-2">
                            {new Date(decision.timestamp).toLocaleDateString()}
                          </p>
                          <div className="text-xs text-gray-500">
                            Consequences: {decision.consequences.join(', ')}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400 text-sm">No major decisions recorded yet</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default PsychProfileInterface; 