import React, { useState, useEffect } from 'react';
import { Users, Crown, Shield, Zap, UserPlus, UserMinus, Settings, Send } from 'lucide-react';

interface TeamMember {
  id: string;
  username: string;
  level: number;
  role: 'leader' | 'hacker' | 'social_engineer' | 'analyst' | 'support';
  status: 'online' | 'in-mission' | 'away';
  specialization: string;
  reputation: string;
}

interface Team {
  id: string;
  name: string;
  leaderId: string;
  members: TeamMember[];
  currentMission?: string;
  missionStatus: 'idle' | 'planning' | 'active' | 'completed';
  maxMembers: number;
}

interface TeamSystemProps {
  gameState: any;
  currentUserId: string;
  terminalSettings: {
    primaryColor: string;
    backgroundColor: string;
    textColor: string;
  };
  onStartTeamMission: (missionId: string, team: Team) => void;
}

export function TeamSystem({ gameState, currentUserId, terminalSettings, onStartTeamMission }: TeamSystemProps) {
  const [currentTeam, setCurrentTeam] = useState<Team | null>(null);
  const [showTeamCreation, setShowTeamCreation] = useState(false);
  const [showInvitePanel, setShowInvitePanel] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [availablePlayers, setAvailablePlayers] = useState<TeamMember[]>([]);
  const [teamInvites, setTeamInvites] = useState<string[]>([]);

  useEffect(() => {
    // Load current team if user is in one
    loadCurrentTeam();
    loadAvailablePlayers();
  }, [currentUserId]);

  const loadCurrentTeam = async () => {
    try {
      // Mock team data - replace with actual API call
      const mockTeam: Team = {
        id: '1',
        name: 'Shadow Collective',
        leaderId: currentUserId,
        members: [
          {
            id: currentUserId,
            username: 'CyberOp_1',
            level: gameState.playerLevel || 5,
            role: 'leader',
            status: 'online',
            specialization: 'Network Infiltration',
            reputation: 'Elite'
          }
        ],
        missionStatus: 'idle',
        maxMembers: 4
      };
      // setCurrentTeam(mockTeam);
    } catch (error) {
      console.error('Failed to load team:', error);
    }
  };

  const loadAvailablePlayers = async () => {
    // Mock available players - replace with actual API call
    const mockPlayers: TeamMember[] = [
      {
        id: '2',
        username: 'Ghost_Hacker',
        level: 12,
        role: 'hacker',
        status: 'online',
        specialization: 'System Exploitation',
        reputation: 'Expert'
      },
      {
        id: '3',
        username: 'SocialEng_X',
        level: 8,
        role: 'social_engineer',
        status: 'online',
        specialization: 'Human Psychology',
        reputation: 'Advanced'
      },
      {
        id: '4',
        username: 'Data_Miner',
        level: 15,
        role: 'analyst',
        status: 'away',
        specialization: 'Intelligence Analysis',
        reputation: 'Elite'
      }
    ];
    setAvailablePlayers(mockPlayers);
  };

  const createTeam = async () => {
    if (!teamName.trim()) return;

    const newTeam: Team = {
      id: Date.now().toString(),
      name: teamName,
      leaderId: currentUserId,
      members: [{
        id: currentUserId,
        username: 'CyberOp_' + (gameState.playerLevel || 1),
        level: gameState.playerLevel || 1,
        role: 'leader',
        status: 'online',
        specialization: 'Network Infiltration',
        reputation: gameState.reputation || 'Rookie'
      }],
      missionStatus: 'idle',
      maxMembers: 4
    };

    setCurrentTeam(newTeam);
    setShowTeamCreation(false);
    setTeamName('');
  };

  const invitePlayer = (playerId: string) => {
    if (teamInvites.includes(playerId)) return;
    setTeamInvites(prev => [...prev, playerId]);
    // Send actual invite via WebSocket
  };

  const removeFromTeam = (memberId: string) => {
    if (!currentTeam || memberId === currentTeam.leaderId) return;
    
    setCurrentTeam(prev => prev ? {
      ...prev,
      members: prev.members.filter(m => m.id !== memberId)
    } : null);
  };

  const changeRole = (memberId: string, newRole: TeamMember['role']) => {
    if (!currentTeam) return;
    
    setCurrentTeam(prev => prev ? {
      ...prev,
      members: prev.members.map(m => 
        m.id === memberId ? { ...m, role: newRole } : m
      )
    } : null);
  };

  const getRoleIcon = (role: TeamMember['role']) => {
    switch (role) {
      case 'leader': return <Crown className="w-4 h-4" />;
      case 'hacker': return <Zap className="w-4 h-4" />;
      case 'social_engineer': return <Users className="w-4 h-4" />;
      case 'analyst': return <Shield className="w-4 h-4" />;
      default: return <Users className="w-4 h-4" />;
    }
  };

  const getRoleColor = (role: TeamMember['role']) => {
    switch (role) {
      case 'leader': return '#fbbf24';
      case 'hacker': return '#8b5cf6';
      case 'social_engineer': return '#06b6d4';
      case 'analyst': return '#10b981';
      default: return terminalSettings.primaryColor;
    }
  };

  const getStatusColor = (status: TeamMember['status']) => {
    switch (status) {
      case 'online': return '#4ade80';
      case 'in-mission': return '#f59e0b';
      case 'away': return '#6b7280';
      default: return '#6b7280';
    }
  };

  if (!currentTeam) {
    return (
      <div 
        className="bg-black/90 backdrop-blur-sm border rounded-lg p-4"
        style={{
          borderColor: terminalSettings.primaryColor,
          boxShadow: `0 0 20px ${terminalSettings.primaryColor}20`
        }}
      >
        <div className="text-center space-y-4">
          <Users className="w-12 h-12 mx-auto" style={{ color: terminalSettings.primaryColor }} />
          <div>
            <h3 className="text-lg font-mono mb-2" style={{ color: terminalSettings.textColor }}>
              No Team
            </h3>
            <p className="text-sm opacity-80" style={{ color: terminalSettings.textColor }}>
              Create or join a team to participate in multiplayer missions
            </p>
          </div>
          
          <div className="space-y-2">
            <button
              onClick={() => setShowTeamCreation(true)}
              className="w-full bg-transparent border px-4 py-2 text-sm font-mono hover:opacity-80 transition-opacity"
              style={{
                borderColor: terminalSettings.primaryColor,
                color: terminalSettings.primaryColor
              }}
            >
              Create Team
            </button>
            <button
              className="w-full bg-transparent border px-4 py-2 text-sm font-mono hover:opacity-80 transition-opacity"
              style={{
                borderColor: `${terminalSettings.primaryColor}60`,
                color: terminalSettings.textColor
              }}
            >
              Browse Teams
            </button>
          </div>

          {showTeamCreation && (
            <div 
              className="border-t pt-4 mt-4"
              style={{ borderColor: `${terminalSettings.primaryColor}40` }}
            >
              <input
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="Enter team name..."
                className="w-full bg-transparent border px-3 py-2 text-sm font-mono mb-3"
                style={{
                  borderColor: `${terminalSettings.primaryColor}60`,
                  color: terminalSettings.textColor
                }}
                maxLength={30}
              />
              <div className="flex gap-2">
                <button
                  onClick={createTeam}
                  disabled={!teamName.trim()}
                  className="flex-1 px-4 py-2 text-sm font-mono hover:opacity-80 transition-opacity disabled:opacity-30"
                  style={{
                    backgroundColor: terminalSettings.primaryColor,
                    color: terminalSettings.backgroundColor
                  }}
                >
                  Create
                </button>
                <button
                  onClick={() => {
                    setShowTeamCreation(false);
                    setTeamName('');
                  }}
                  className="flex-1 bg-transparent border px-4 py-2 text-sm font-mono hover:opacity-80 transition-opacity"
                  style={{
                    borderColor: `${terminalSettings.primaryColor}60`,
                    color: terminalSettings.textColor
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div 
      className="bg-black/90 backdrop-blur-sm border rounded-lg"
      style={{
        borderColor: terminalSettings.primaryColor,
        boxShadow: `0 0 20px ${terminalSettings.primaryColor}20`
      }}
    >
      {/* Team Header */}
      <div 
        className="flex items-center justify-between p-4 border-b"
        style={{ borderColor: `${terminalSettings.primaryColor}40` }}
      >
        <div className="flex items-center gap-3">
          <Users className="w-5 h-5" style={{ color: terminalSettings.primaryColor }} />
          <div>
            <h3 className="font-mono text-lg" style={{ color: terminalSettings.textColor }}>
              {currentTeam.name}
            </h3>
            <p className="text-xs opacity-80" style={{ color: terminalSettings.textColor }}>
              {currentTeam.members.length}/{currentTeam.maxMembers} members • {currentTeam.missionStatus}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowInvitePanel(!showInvitePanel)}
            className="p-2 border rounded hover:opacity-80 transition-opacity"
            style={{
              borderColor: terminalSettings.primaryColor,
              color: terminalSettings.primaryColor
            }}
          >
            <UserPlus className="w-4 h-4" />
          </button>
          <button
            className="p-2 border rounded hover:opacity-80 transition-opacity"
            style={{
              borderColor: `${terminalSettings.primaryColor}60`,
              color: terminalSettings.textColor
            }}
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Team Members */}
      <div className="p-4 space-y-3">
        {currentTeam.members.map((member) => (
          <div
            key={member.id}
            className="flex items-center justify-between p-3 border rounded"
            style={{ borderColor: `${terminalSettings.primaryColor}40` }}
          >
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: getStatusColor(member.status) }}
                />
                <div style={{ color: getRoleColor(member.role) }}>
                  {getRoleIcon(member.role)}
                </div>
              </div>
              <div>
                <div className="font-mono text-sm" style={{ color: terminalSettings.textColor }}>
                  {member.username}
                </div>
                <div className="text-xs opacity-80" style={{ color: terminalSettings.textColor }}>
                  Lv.{member.level} • {member.specialization} • {member.reputation}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <select
                value={member.role}
                onChange={(e) => changeRole(member.id, e.target.value as TeamMember['role'])}
                disabled={member.id !== currentUserId && currentTeam.leaderId !== currentUserId}
                className="bg-transparent border text-xs px-2 py-1 rounded"
                style={{
                  borderColor: `${terminalSettings.primaryColor}60`,
                  color: terminalSettings.textColor
                }}
              >
                <option value="leader">Leader</option>
                <option value="hacker">Hacker</option>
                <option value="social_engineer">Social Engineer</option>
                <option value="analyst">Analyst</option>
                <option value="support">Support</option>
              </select>
              
              {currentTeam.leaderId === currentUserId && member.id !== currentUserId && (
                <button
                  onClick={() => removeFromTeam(member.id)}
                  className="p-1 hover:opacity-80 transition-opacity"
                  style={{ color: '#ef4444' }}
                >
                  <UserMinus className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Invite Panel */}
      {showInvitePanel && (
        <div 
          className="border-t p-4"
          style={{ borderColor: `${terminalSettings.primaryColor}40` }}
        >
          <div className="space-y-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search players to invite..."
              className="w-full bg-transparent border px-3 py-2 text-sm font-mono"
              style={{
                borderColor: `${terminalSettings.primaryColor}60`,
                color: terminalSettings.textColor
              }}
            />
            
            <div className="max-h-32 overflow-y-auto space-y-2">
              {availablePlayers
                .filter(player => 
                  !currentTeam.members.some(m => m.id === player.id) &&
                  player.username.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((player) => (
                  <div
                    key={player.id}
                    className="flex items-center justify-between p-2 border rounded"
                    style={{ borderColor: `${terminalSettings.primaryColor}30` }}
                  >
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: getStatusColor(player.status) }}
                      />
                      <div>
                        <div className="text-sm font-mono" style={{ color: terminalSettings.textColor }}>
                          {player.username}
                        </div>
                        <div className="text-xs opacity-80" style={{ color: terminalSettings.textColor }}>
                          Lv.{player.level} • {player.specialization}
                        </div>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => invitePlayer(player.id)}
                      disabled={teamInvites.includes(player.id)}
                      className="px-3 py-1 text-xs border rounded hover:opacity-80 transition-opacity disabled:opacity-30"
                      style={{
                        borderColor: terminalSettings.primaryColor,
                        color: terminalSettings.primaryColor
                      }}
                    >
                      {teamInvites.includes(player.id) ? 'Invited' : 'Invite'}
                    </button>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Mission Controls */}
      {currentTeam.missionStatus === 'idle' && (
        <div 
          className="border-t p-4"
          style={{ borderColor: `${terminalSettings.primaryColor}40` }}
        >
          <button
            onClick={() => onStartTeamMission('team_mission_1', currentTeam)}
            className="w-full px-4 py-3 text-sm font-mono hover:opacity-80 transition-opacity"
            style={{
              backgroundColor: terminalSettings.primaryColor,
              color: terminalSettings.backgroundColor
            }}
          >
            Start Team Mission
          </button>
        </div>
      )}
    </div>
  );
} 