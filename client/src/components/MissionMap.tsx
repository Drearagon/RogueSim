import React, { useState, useEffect } from 'react';
import { MapPin, Lock, Users, Clock, Zap, Shield, Brain, Star, ArrowRight, User } from 'lucide-react';

interface MissionNode {
  id: string;
  name: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'extreme';
  estimatedTime: string;
  minPlayers: number;
  maxPlayers: number;
  requiredLevel: number;
  requiredSkills: string[];
  rewards: {
    credits: number;
    experience: number;
    reputation?: string;
    specialItems?: string[];
  };
  prerequisites: string[];
  position: { x: number; y: number };
  isLocked: boolean;
  isCompleted: boolean;
  type: 'solo' | 'team' | 'raid';
  roleRequirements?: {
    role: string;
    description: string;
  }[];
}

interface MissionMapProps {
  gameState: any;
  currentTeam?: any;
  terminalSettings: {
    primaryColor: string;
    backgroundColor: string;
    textColor: string;
  };
  onSelectMission: (mission: MissionNode) => void;
  onStartMission: (missionId: string) => void;
}

export function MissionMap({ gameState, currentTeam, terminalSettings, onSelectMission, onStartMission }: MissionMapProps) {
  const [selectedMission, setSelectedMission] = useState<MissionNode | null>(null);
  const [missionNodes, setMissionNodes] = useState<MissionNode[]>([]);
  const [viewMode, setViewMode] = useState<'all' | 'available' | 'team'>('all');
  const [zoomLevel, setZoomLevel] = useState(1);

  useEffect(() => {
    // Initialize mission nodes with safer defaults
    const completedMissions = gameState.completedMissions || [];
    console.log('Mission Map Debug - Completed missions:', completedMissions);
    console.log('Mission Map Debug - Player level:', gameState.playerLevel);
    
    const missions: MissionNode[] = [
      {
        id: 'corp_infiltration',
        name: 'Corporate Infiltration',
        description: 'Infiltrate MegaCorp servers to extract confidential financial records.',
        difficulty: 'medium',
        estimatedTime: '45-60 min',
        minPlayers: 1,
        maxPlayers: 3,
        requiredLevel: 5,
        requiredSkills: ['network_scan', 'sql_injection'],
        rewards: {
          credits: 2500,
          experience: 1000,
          reputation: 'Advanced',
          specialItems: ['Corporate Access Card']
        },
        prerequisites: [],
        position: { x: 200, y: 100 },
        isLocked: false,
        isCompleted: false,
        type: 'team',
        roleRequirements: [
          { role: 'hacker', description: 'Bypass security systems and extract data' },
          { role: 'social_engineer', description: 'Gather intel and credentials through social manipulation' },
          { role: 'analyst', description: 'Monitor security responses and plan escape routes' }
        ]
      },
      {
        id: 'bank_heist_digital',
        name: 'Digital Bank Heist',
        description: 'Coordinate a sophisticated attack on the Central Banking Network.',
        difficulty: 'hard',
        estimatedTime: '90-120 min',
        minPlayers: 3,
        maxPlayers: 4,
        requiredLevel: 12,
        requiredSkills: ['advanced_encryption', 'network_tunneling', 'social_engineering'],
        rewards: {
          credits: 10000,
          experience: 5000,
          reputation: 'Elite',
          specialItems: ['Banking Trojan', 'Crypto Wallet Keys']
        },
        prerequisites: ['corp_infiltration'],
        position: { x: 500, y: 150 },
        isLocked: !completedMissions.includes('corp_infiltration'),
        isCompleted: false,
        type: 'raid',
        roleRequirements: [
          { role: 'leader', description: 'Coordinate the entire operation and manage timing' },
          { role: 'hacker', description: 'Penetrate banking security and manipulate transactions' },
          { role: 'social_engineer', description: 'Acquire employee credentials and distract security' },
          { role: 'analyst', description: 'Real-time threat assessment and evidence cleanup' }
        ]
      },
      {
        id: 'government_leak',
        name: 'Government Data Leak',
        description: 'Expose corruption by leaking classified government documents.',
        difficulty: 'extreme',
        estimatedTime: '2-3 hours',
        minPlayers: 4,
        maxPlayers: 4,
        requiredLevel: 20,
        requiredSkills: ['quantum_encryption', 'advanced_social_eng', 'deep_web_navigation'],
        rewards: {
          credits: 25000,
          experience: 12000,
          reputation: 'Legendary',
          specialItems: ['Government Backdoor', 'Whistleblower Protection']
        },
        prerequisites: ['bank_heist_digital', 'corp_infiltration'],
        position: { x: 400, y: 400 },
        isLocked: true,
        isCompleted: false,
        type: 'raid'
      },
      {
        id: 'solo_training',
        name: 'Network Reconnaissance',
        description: 'Practice your scanning skills on test networks.',
        difficulty: 'easy',
        estimatedTime: '15-30 min',
        minPlayers: 1,
        maxPlayers: 1,
        requiredLevel: 1,
        requiredSkills: [],
        rewards: {
          credits: 500,
          experience: 200
        },
        prerequisites: [],
        position: { x: 100, y: 50 },
        isLocked: false,
        isCompleted: false, // Set to false so it shows up
        type: 'solo'
      },
      {
        id: 'data_center_raid',
        name: 'Data Center Physical Breach',
        description: 'Coordinate physical and digital infiltration of a secure data center.',
        difficulty: 'hard',
        estimatedTime: '60-90 min',
        minPlayers: 2,
        maxPlayers: 4,
        requiredLevel: 15,
        requiredSkills: ['physical_security', 'network_mapping', 'surveillance_evasion'],
        rewards: {
          credits: 7500,
          experience: 3500,
          reputation: 'Expert',
          specialItems: ['Security Badge Cloner', 'Network Tap Device']
        },
        prerequisites: ['corp_infiltration'],
        position: { x: 350, y: 280 },
        isLocked: false,
        isCompleted: false,
        type: 'team',
        roleRequirements: [
          { role: 'leader', description: 'Coordinate physical and digital teams' },
          { role: 'hacker', description: 'Disable security systems and extract data' },
          { role: 'support', description: 'Provide lookout and emergency extraction' }
        ]
      }
    ];

    console.log('Mission Map Debug - All missions:', missions);
    setMissionNodes(missions);
  }, [gameState.completedMissions]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '#4ade80';
      case 'medium': return '#f59e0b';
      case 'hard': return '#f97316';
      case 'extreme': return '#ef4444';
      default: return terminalSettings.primaryColor;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'solo': return <User className="w-4 h-4" />;
      case 'team': return <Users className="w-4 h-4" />;
      case 'raid': return <Shield className="w-4 h-4" />;
      default: return <MapPin className="w-4 h-4" />;
    }
  };

  const canStartMission = (mission: MissionNode) => {
    if (mission.isLocked) return false;
    if (gameState.playerLevel < mission.requiredLevel) return false;
    if (mission.type === 'team' || mission.type === 'raid') {
      if (!currentTeam) return false;
      if (currentTeam.members.length < mission.minPlayers) return false;
      if (currentTeam.members.length > mission.maxPlayers) return false;
    }
    return true;
  };

  const getFilteredMissions = () => {
    const filtered = (() => {
      switch (viewMode) {
        case 'available':
          return missionNodes.filter(m => !m.isLocked && !m.isCompleted);
        case 'team':
          return missionNodes.filter(m => m.type === 'team' || m.type === 'raid');
        default:
          return missionNodes;
      }
    })();
    
    console.log('Mission Map Debug - View mode:', viewMode);
    console.log('Mission Map Debug - Filtered missions:', filtered);
    return filtered;
  };

  return (
    <div 
      className="bg-black/90 backdrop-blur-sm border rounded-lg h-full flex flex-col min-h-[500px]"
      style={{
        borderColor: terminalSettings.primaryColor,
        boxShadow: `0 0 20px ${terminalSettings.primaryColor}20`
      }}
    >
      {/* Header */}
      <div 
        className="flex items-center justify-between p-4 border-b"
        style={{ borderColor: `${terminalSettings.primaryColor}40` }}
      >
        <div className="flex items-center gap-3">
          <MapPin className="w-5 h-5" style={{ color: terminalSettings.primaryColor }} />
          <h3 className="font-mono text-lg" style={{ color: terminalSettings.textColor }}>
            Mission Network
          </h3>
          <span className="text-xs opacity-60" style={{ color: terminalSettings.textColor }}>
            ({getFilteredMissions().length}/{missionNodes.length} missions • {viewMode})
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex border rounded overflow-hidden" style={{ borderColor: `${terminalSettings.primaryColor}60` }}>
            {(['all', 'available', 'team'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1 text-xs transition-colors ${
                  viewMode === mode ? '' : 'hover:opacity-80'
                }`}
                style={{
                  backgroundColor: viewMode === mode ? terminalSettings.primaryColor : 'transparent',
                  color: viewMode === mode ? terminalSettings.backgroundColor : terminalSettings.textColor
                }}
              >
                {mode.toUpperCase()}
              </button>
            ))}
          </div>
          
          {/* Zoom Controls */}
          <div className="flex border rounded overflow-hidden" style={{ borderColor: `${terminalSettings.primaryColor}60` }}>
            <button
              onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.25))}
              className="px-2 py-1 text-xs hover:opacity-80"
              style={{ color: terminalSettings.textColor }}
            >
              -
            </button>
            <span 
              className="px-2 py-1 text-xs border-x"
              style={{ 
                color: terminalSettings.textColor,
                borderColor: `${terminalSettings.primaryColor}60`
              }}
            >
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => setZoomLevel(Math.min(2, zoomLevel + 0.25))}
              className="px-2 py-1 text-xs hover:opacity-80"
              style={{ color: terminalSettings.textColor }}
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Map Area */}
      <div className="flex-1 relative overflow-hidden min-h-[400px] bg-gray-900/50">
        {getFilteredMissions().length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <MapPin className="w-12 h-12 mx-auto mb-4 opacity-50" style={{ color: terminalSettings.primaryColor }} />
              <p className="text-lg font-mono mb-2" style={{ color: terminalSettings.textColor }}>
                No missions available
              </p>
              <p className="text-sm opacity-60" style={{ color: terminalSettings.textColor }}>
                Switch view mode or complete prerequisites to unlock more missions
              </p>
            </div>
          </div>
        ) : (
          <div 
            className="absolute inset-0 transition-transform duration-300"
            style={{ transform: `scale(${zoomLevel})` }}
          >
            {/* Connection Lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              {getFilteredMissions().map(mission => 
                mission.prerequisites.map(prereqId => {
                  const prereq = missionNodes.find(m => m.id === prereqId);
                  if (!prereq) return null;
                  
                  return (
                    <line
                      key={`${prereqId}-${mission.id}`}
                      x1={prereq.position.x}
                      y1={prereq.position.y}
                      x2={mission.position.x}
                      y2={mission.position.y}
                      stroke={`${terminalSettings.primaryColor}40`}
                      strokeWidth="2"
                      strokeDasharray={mission.isLocked ? "5,5" : "none"}
                    />
                  );
                })
              )}
            </svg>

            {/* Mission Nodes */}
            {getFilteredMissions().map((mission) => (
              <div
                key={mission.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                style={{
                  left: mission.position.x,
                  top: mission.position.y
                }}
                onClick={() => {
                  setSelectedMission(mission);
                  onSelectMission(mission);
                }}
              >
                <div 
                  className={`relative p-3 border rounded-lg transition-all duration-300 hover:scale-110 ${
                    selectedMission?.id === mission.id ? 'ring-2' : ''
                  } ${mission.isCompleted ? 'opacity-60' : ''}`}
                  style={{
                    backgroundColor: mission.isLocked ? '#1f2937' : `${terminalSettings.backgroundColor}e6`,
                    borderColor: mission.isLocked ? '#4b5563' : getDifficultyColor(mission.difficulty),
                    minWidth: '120px',
                    ...(selectedMission?.id === mission.id && {
                      boxShadow: `0 0 0 2px ${terminalSettings.primaryColor}`
                    })
                  }}
                >
                  {/* Mission Icon */}
                  <div className="flex items-center justify-center mb-2">
                    {mission.isLocked ? (
                      <Lock className="w-6 h-6" style={{ color: '#6b7280' }} />
                    ) : mission.isCompleted ? (
                      <Star className="w-6 h-6" style={{ color: '#fbbf24' }} />
                    ) : (
                      <div style={{ color: getDifficultyColor(mission.difficulty) }}>
                        {getTypeIcon(mission.type)}
                      </div>
                    )}
                  </div>

                  {/* Mission Info */}
                  <div className="text-center">
                    <div 
                      className="font-mono text-xs font-bold mb-1"
                      style={{ color: mission.isLocked ? '#6b7280' : terminalSettings.textColor }}
                    >
                      {mission.name}
                    </div>
                    <div 
                      className="text-xs opacity-80"
                      style={{ color: mission.isLocked ? '#6b7280' : terminalSettings.textColor }}
                    >
                      Lv.{mission.requiredLevel} • {mission.estimatedTime}
                    </div>
                    <div 
                      className="text-xs mt-1"
                      style={{ color: getDifficultyColor(mission.difficulty) }}
                    >
                      {mission.difficulty.toUpperCase()}
                    </div>
                  </div>

                  {/* Player Count Indicator */}
                  <div className="absolute -top-2 -right-2 flex items-center gap-1 px-2 py-1 rounded-full text-xs"
                    style={{ backgroundColor: terminalSettings.primaryColor, color: terminalSettings.backgroundColor }}
                  >
                    <Users className="w-3 h-3" />
                    {mission.minPlayers === mission.maxPlayers ? mission.minPlayers : `${mission.minPlayers}-${mission.maxPlayers}`}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Mission Details Panel */}
      {selectedMission && (
        <div 
          className="border-t p-4 max-h-64 overflow-y-auto"
          style={{ borderColor: `${terminalSettings.primaryColor}40` }}
        >
          <div className="space-y-3">
            {/* Mission Header */}
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-mono font-bold" style={{ color: terminalSettings.textColor }}>
                  {selectedMission.name}
                </h4>
                <div className="flex items-center gap-2 text-xs mt-1">
                  <span style={{ color: getDifficultyColor(selectedMission.difficulty) }}>
                    {selectedMission.difficulty.toUpperCase()}
                  </span>
                  <span style={{ color: terminalSettings.textColor }}>•</span>
                  <span style={{ color: terminalSettings.textColor }}>
                    <Clock className="w-3 h-3 inline mr-1" />
                    {selectedMission.estimatedTime}
                  </span>
                  <span style={{ color: terminalSettings.textColor }}>•</span>
                  <span style={{ color: terminalSettings.textColor }}>
                    <Users className="w-3 h-3 inline mr-1" />
                    {selectedMission.minPlayers === selectedMission.maxPlayers 
                      ? selectedMission.minPlayers 
                      : `${selectedMission.minPlayers}-${selectedMission.maxPlayers}`} players
                  </span>
                </div>
              </div>
              
              <button
                onClick={() => onStartMission(selectedMission.id)}
                disabled={!canStartMission(selectedMission)}
                className="px-4 py-2 text-sm font-mono hover:opacity-80 transition-opacity disabled:opacity-30"
                style={{
                  backgroundColor: canStartMission(selectedMission) ? terminalSettings.primaryColor : '#374151',
                  color: canStartMission(selectedMission) ? terminalSettings.backgroundColor : '#9ca3af'
                }}
              >
                {selectedMission.type === 'solo' ? 'Start Mission' : 'Deploy Team'}
              </button>
            </div>

            {/* Description */}
            <p className="text-sm" style={{ color: terminalSettings.textColor }}>
              {selectedMission.description}
            </p>

            {/* Role Requirements */}
            {selectedMission.roleRequirements && (
              <div>
                <h5 className="text-sm font-mono mb-2" style={{ color: terminalSettings.primaryColor }}>
                  Role Requirements:
                </h5>
                <div className="space-y-1">
                  {selectedMission.roleRequirements.map((req, index) => (
                    <div key={index} className="flex items-start gap-2 text-xs">
                      <span 
                        className="font-mono font-bold min-w-0"
                        style={{ color: terminalSettings.primaryColor }}
                      >
                        {req.role.toUpperCase()}:
                      </span>
                      <span style={{ color: terminalSettings.textColor }}>
                        {req.description}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Rewards */}
            <div>
              <h5 className="text-sm font-mono mb-2" style={{ color: terminalSettings.primaryColor }}>
                Rewards:
              </h5>
              <div className="flex flex-wrap gap-2 text-xs">
                <span 
                  className="px-2 py-1 rounded border"
                  style={{ 
                    borderColor: `${terminalSettings.primaryColor}40`,
                    color: terminalSettings.textColor 
                  }}
                >
                  💰 {selectedMission.rewards.credits.toLocaleString()} credits
                </span>
                <span 
                  className="px-2 py-1 rounded border"
                  style={{ 
                    borderColor: `${terminalSettings.primaryColor}40`,
                    color: terminalSettings.textColor 
                  }}
                >
                  ⭐ {selectedMission.rewards.experience} XP
                </span>
                {selectedMission.rewards.reputation && (
                  <span 
                    className="px-2 py-1 rounded border"
                    style={{ 
                      borderColor: `${terminalSettings.primaryColor}40`,
                      color: terminalSettings.textColor 
                    }}
                  >
                    🏆 {selectedMission.rewards.reputation}
                  </span>
                )}
              </div>
            </div>

            {/* Prerequisites */}
            {selectedMission.prerequisites.length > 0 && (
              <div>
                <h5 className="text-sm font-mono mb-2" style={{ color: terminalSettings.primaryColor }}>
                  Prerequisites:
                </h5>
                <div className="flex flex-wrap gap-1 text-xs">
                  {selectedMission.prerequisites.map((prereqId) => {
                    const prereq = missionNodes.find(m => m.id === prereqId);
                    const isCompleted = gameState.completedMissions?.includes(prereqId);
                    return (
                      <span 
                        key={prereqId}
                        className="px-2 py-1 rounded border"
                        style={{ 
                          borderColor: isCompleted ? '#10b981' : '#ef4444',
                          color: isCompleted ? '#10b981' : '#ef4444'
                        }}
                      >
                        {isCompleted ? '✓' : '✗'} {prereq?.name || prereqId}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 