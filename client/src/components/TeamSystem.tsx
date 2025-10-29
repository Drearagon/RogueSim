import React, { useState, useEffect, useMemo } from 'react';
import { Users, Crown, Shield, Zap, UserPlus, UserMinus, Settings, Eye } from 'lucide-react';
import { SocialNotificationInput } from '../types/social';

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
  password?: string;
}

interface OutgoingTeamInvite {
  id: string;
  player: TeamMember;
  status: 'pending' | 'accepted' | 'declined';
  sentAt: number;
}

interface IncomingTeamInvite {
  id: string;
  fromTeam: Team;
  status: 'pending' | 'accepted' | 'declined';
  receivedAt: number;
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
  onNotify?: (notification: SocialNotificationInput) => void;
  onTeamChange?: (team: Team | null) => void;
}

export function TeamSystem({
  gameState,
  currentUserId,
  terminalSettings,
  onStartTeamMission,
  onNotify,
  onTeamChange
}: TeamSystemProps) {
  const [currentTeam, setCurrentTeam] = useState<Team | null>(null);
  const [showTeamCreation, setShowTeamCreation] = useState(false);
  const [showInvitePanel, setShowInvitePanel] = useState(false);
  const [showBrowseTeams, setShowBrowseTeams] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [teamPassword, setTeamPassword] = useState('');
  const [protectWithPassword, setProtectWithPassword] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [teamSearchQuery, setTeamSearchQuery] = useState('');
  const [availablePlayers, setAvailablePlayers] = useState<TeamMember[]>([]);
  const [teamInvites, setTeamInvites] = useState<OutgoingTeamInvite[]>([]);
  const [incomingInvites, setIncomingInvites] = useState<IncomingTeamInvite[]>([]);
  const [availableTeams, setAvailableTeams] = useState<Team[]>([]);
  const [selectedJoinTeam, setSelectedJoinTeam] = useState<string | null>(null);
  const [joinPassword, setJoinPassword] = useState('');
  const [joinError, setJoinError] = useState('');

  useEffect(() => {
    loadCurrentTeam();
    loadAvailablePlayers();
    loadAvailableTeams();
  }, [currentUserId]);

  useEffect(() => {
    if (availableTeams.length === 0) return;

    setIncomingInvites((prev) => {
      if (prev.length > 0) {
        return prev.map((invite) => {
          const updatedTeam = availableTeams.find((team) => team.id === invite.fromTeam.id);
          return updatedTeam ? { ...invite, fromTeam: updatedTeam } : invite;
        });
      }

      const sampleTeam = availableTeams[0];
      return sampleTeam
        ? [
            {
              id: `${sampleTeam.id}-invite-${currentUserId}`,
              fromTeam: sampleTeam,
              status: 'pending',
              receivedAt: Date.now() - 1000 * 60 * 3
            }
          ]
        : [];
    });
  }, [availableTeams, currentUserId]);

  const currentUserProfile = useMemo<TeamMember>(() => ({
    id: currentUserId,
    username: gameState?.hackerName || `CyberOp_${gameState?.playerLevel || 1}`,
    level: gameState?.playerLevel || 1,
    role: 'leader',
    status: 'online',
    specialization: gameState?.specialization || 'Network Infiltration',
    reputation: gameState?.reputation || 'Rookie'
  }), [currentUserId, gameState?.hackerName, gameState?.playerLevel, gameState?.specialization, gameState?.reputation]);

  const loadCurrentTeam = async () => {
    try {
      // Placeholder for future backend integration
    } catch (error) {
      console.error('Failed to load team:', error);
    }
  };

  const loadAvailablePlayers = async () => {
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

  const loadAvailableTeams = async () => {
    const mockTeams: Team[] = [
      {
        id: 'team-alpha',
        name: 'Quantum Syndicate',
        leaderId: 'team_alpha_leader',
        members: [
          {
            id: 'team_alpha_leader',
            username: 'CipherQueen',
            level: 14,
            role: 'leader',
            status: 'online',
            specialization: 'Signal Manipulation',
            reputation: 'Legendary'
          },
          {
            id: 'team_alpha_member',
            username: 'GhostPulse',
            level: 10,
            role: 'hacker',
            status: 'in-mission',
            specialization: 'Silent Intrusion',
            reputation: 'Elite'
          }
        ],
        missionStatus: 'planning',
        maxMembers: 5
      },
      {
        id: 'team-beta',
        name: 'Nebula Operatives',
        leaderId: 'team_beta_leader',
        members: [
          {
            id: 'team_beta_leader',
            username: 'AuroraTrace',
            level: 9,
            role: 'leader',
            status: 'online',
            specialization: 'Social Engineering',
            reputation: 'Renowned'
          }
        ],
        missionStatus: 'idle',
        maxMembers: 4,
        password: 'nebula'
      }
    ];

    setAvailableTeams(mockTeams);
  };

  const updateTeamInList = (team: Team | null) => {
    if (!team) return;

    const clonedTeam: Team = {
      ...team,
      members: team.members.map((member) => ({ ...member }))
    };

    setAvailableTeams((prev) => {
      const exists = prev.some((existing) => existing.id === clonedTeam.id);
      if (exists) {
        return prev.map((existing) => (existing.id === clonedTeam.id ? clonedTeam : existing));
      }
      return [...prev, clonedTeam];
    });
  };

  const createTeam = () => {
    if (!teamName.trim()) return;

    const newTeam: Team = {
      id: Date.now().toString(),
      name: teamName,
      leaderId: currentUserId,
      members: [
        {
          ...currentUserProfile,
          role: 'leader'
        }
      ],
      missionStatus: 'idle',
      maxMembers: 4,
      password: protectWithPassword && teamPassword ? teamPassword : undefined
    };

    setCurrentTeam(newTeam);
    onTeamChange?.(newTeam);
    setShowTeamCreation(false);
    setTeamName('');
    setTeamPassword('');
    setProtectWithPassword(false);
    updateTeamInList(newTeam);
    onNotify?.({
      type: 'team-update',
      message: `Team "${newTeam.name}" created${newTeam.password ? ' with password protection' : ''}.`
    });
  };

  const invitePlayer = (playerId: string) => {
    if (!currentTeam) return;

    const player = availablePlayers.find((p) => p.id === playerId);
    if (!player || teamInvites.some((invite) => invite.player.id === playerId)) return;

    const invite: OutgoingTeamInvite = {
      id: `${currentTeam.id}-invite-${playerId}`,
      player,
      status: 'pending',
      sentAt: Date.now()
    };

    setTeamInvites((prev) => [...prev, invite]);
    onNotify?.({
      type: 'team-invite',
      message: `Invitation sent to ${player.username}.`
    });
  };

  const cancelInvite = (inviteId: string) => {
    setTeamInvites((prev) => prev.filter((invite) => invite.id !== inviteId));
    onNotify?.({
      type: 'team-update',
      message: 'Team invite cancelled.'
    });
  };

  const removeFromTeam = (memberId: string) => {
    if (!currentTeam || memberId === currentTeam.leaderId) return;

    setCurrentTeam((prev) => {
      if (!prev) return prev;
      const updatedTeam: Team = {
        ...prev,
        members: prev.members.filter((m) => m.id !== memberId)
      };
      onTeamChange?.(updatedTeam);
      updateTeamInList(updatedTeam);
      onNotify?.({
        type: 'team-update',
        message: 'Member removed from team.'
      });
      return updatedTeam;
    });
  };

  const changeRole = (memberId: string, newRole: TeamMember['role']) => {
    if (!currentTeam) return;

    setCurrentTeam((prev) => {
      if (!prev) return prev;
      const updatedTeam: Team = {
        ...prev,
        members: prev.members.map((m) => (m.id === memberId ? { ...m, role: newRole } : m))
      };
      onTeamChange?.(updatedTeam);
      updateTeamInList(updatedTeam);
      onNotify?.({
        type: 'team-update',
        message: `Updated ${memberId === currentUserId ? 'your' : 'team member'} role to ${newRole}.`
      });
      return updatedTeam;
    });
  };

  const acceptIncomingInvite = (inviteId: string) => {
    const invite = incomingInvites.find((item) => item.id === inviteId);
    if (!invite) return;

    const alreadyMember = invite.fromTeam.members.some((member) => member.id === currentUserId);
    const updatedTeam: Team = {
      ...invite.fromTeam,
      members: alreadyMember
        ? invite.fromTeam.members.map((member) => ({ ...member }))
        : [
            ...invite.fromTeam.members.map((member) => ({ ...member })),
            {
              ...currentUserProfile,
              role: 'support'
            }
          ]
    };

    setCurrentTeam(updatedTeam);
    onTeamChange?.(updatedTeam);
    setIncomingInvites((prev) => prev.map((item) => (item.id === inviteId ? { ...item, status: 'accepted' } : item)));
    updateTeamInList(updatedTeam);
    onNotify?.({
      type: 'team-join',
      message: `Joined ${updatedTeam.name} from invite.`
    });
  };

  const declineIncomingInvite = (inviteId: string) => {
    setIncomingInvites((prev) => prev.map((item) => (item.id === inviteId ? { ...item, status: 'declined' } : item)));
    onNotify?.({
      type: 'team-update',
      message: 'Invite declined.'
    });
  };

  const handleJoinTeam = (team: Team) => {
    setJoinError('');
    if (team.password) {
      setSelectedJoinTeam(team.id);
      return;
    }
    finalizeJoin(team);
  };

  const finalizeJoin = (team: Team, suppliedPassword?: string) => {
    if (team.password && team.password !== (suppliedPassword ?? joinPassword)) {
      setJoinError('Incorrect password.');
      return;
    }

    if (team.members.length >= team.maxMembers) {
      setJoinError('Team is full.');
      return;
    }

    const alreadyMember = team.members.some((member) => member.id === currentUserId);
    const updatedTeam: Team = {
      ...team,
      members: alreadyMember
        ? team.members.map((member) => ({ ...member }))
        : [
            ...team.members.map((member) => ({ ...member })),
            {
              ...currentUserProfile,
              role: 'support'
            }
          ]
    };

    setCurrentTeam(updatedTeam);
    onTeamChange?.(updatedTeam);
    updateTeamInList(updatedTeam);
    setShowBrowseTeams(false);
    setSelectedJoinTeam(null);
    setJoinPassword('');
    setJoinError('');
    onNotify?.({
      type: 'team-join',
      message: `Joined ${team.name}.`
    });
  };

  const filteredTeams = useMemo(() => {
    return availableTeams.filter((team) => {
      const matchesSearch = team.name.toLowerCase().includes(teamSearchQuery.toLowerCase());
      const isAlreadyMember = team.members.some((member) => member.id === currentUserId);
      return matchesSearch && !isAlreadyMember;
    });
  }, [availableTeams, teamSearchQuery, currentUserId]);

  const getRoleIcon = (role: TeamMember['role']) => {
    switch (role) {
      case 'leader':
        return <Crown className="w-4 h-4" />;
      case 'hacker':
        return <Zap className="w-4 h-4" />;
      case 'social_engineer':
        return <Users className="w-4 h-4" />;
      case 'analyst':
        return <Shield className="w-4 h-4" />;
      default:
        return <Users className="w-4 h-4" />;
    }
  };

  const getRoleColor = (role: TeamMember['role']) => {
    switch (role) {
      case 'leader':
        return '#fbbf24';
      case 'hacker':
        return '#8b5cf6';
      case 'social_engineer':
        return '#06b6d4';
      case 'analyst':
        return '#10b981';
      default:
        return terminalSettings.primaryColor;
    }
  };

  const getStatusColor = (status: TeamMember['status']) => {
    switch (status) {
      case 'online':
        return '#4ade80';
      case 'in-mission':
        return '#f59e0b';
      case 'away':
        return '#6b7280';
      default:
        return '#6b7280';
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
              onClick={() => setShowBrowseTeams((prev) => !prev)}
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
              <label
                className="flex items-center gap-2 text-xs font-mono mb-2"
                style={{ color: terminalSettings.textColor }}
              >
                <input
                  type="checkbox"
                  checked={protectWithPassword}
                  onChange={(e) => setProtectWithPassword(e.target.checked)}
                  className="accent-current"
                />
                Require password to join
              </label>
              {protectWithPassword && (
                <input
                  type="password"
                  value={teamPassword}
                  onChange={(e) => setTeamPassword(e.target.value)}
                  placeholder="Set team password"
                  className="w-full bg-transparent border px-3 py-2 text-sm font-mono mb-3"
                  style={{
                    borderColor: `${terminalSettings.primaryColor}60`,
                    color: terminalSettings.textColor
                  }}
                  maxLength={24}
                />
              )}
              <div className="flex gap-2">
                <button
                  onClick={createTeam}
                  disabled={!teamName.trim() || (protectWithPassword && !teamPassword.trim())}
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
                    setTeamPassword('');
                    setProtectWithPassword(false);
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

          {showBrowseTeams && (
            <div
              className="border-t pt-4 mt-4 space-y-3"
              style={{ borderColor: `${terminalSettings.primaryColor}40` }}
            >
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4" style={{ color: terminalSettings.primaryColor }} />
                <h4 className="text-sm font-mono" style={{ color: terminalSettings.textColor }}>
                  Active Teams
                </h4>
              </div>
              <input
                type="text"
                value={teamSearchQuery}
                onChange={(e) => setTeamSearchQuery(e.target.value)}
                placeholder="Search teams..."
                className="w-full bg-transparent border px-3 py-2 text-sm font-mono"
                style={{
                  borderColor: `${terminalSettings.primaryColor}60`,
                  color: terminalSettings.textColor
                }}
              />
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {filteredTeams.length === 0 && (
                  <p className="text-xs opacity-70 font-mono" style={{ color: terminalSettings.textColor }}>
                    No teams available to join right now.
                  </p>
                )}
                {filteredTeams.map((team) => (
                  <div
                    key={team.id}
                    className="border rounded p-3 space-y-2"
                    style={{ borderColor: `${terminalSettings.primaryColor}30` }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-mono text-sm" style={{ color: terminalSettings.textColor }}>
                          {team.name}
                        </p>
                        <p className="text-xs opacity-70" style={{ color: terminalSettings.textColor }}>
                          {team.members.length}/{team.maxMembers} members • {team.missionStatus}
                        </p>
                      </div>
                      <button
                        onClick={() => handleJoinTeam(team)}
                        className="px-3 py-1 text-xs border rounded hover:opacity-80 transition-opacity"
                        style={{
                          borderColor: terminalSettings.primaryColor,
                          color: terminalSettings.primaryColor
                        }}
                      >
                        Join
                      </button>
                    </div>
                    {selectedJoinTeam === team.id && team.password && (
                      <div className="space-y-2">
                        <input
                          type="password"
                          value={joinPassword}
                          onChange={(e) => setJoinPassword(e.target.value)}
                          placeholder="Enter team password"
                          className="w-full bg-transparent border px-3 py-2 text-xs font-mono"
                          style={{
                            borderColor: `${terminalSettings.primaryColor}60`,
                            color: terminalSettings.textColor
                          }}
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => finalizeJoin(team, joinPassword)}
                            className="flex-1 px-3 py-1 text-xs font-mono border rounded hover:opacity-80 transition-opacity"
                            style={{
                              borderColor: terminalSettings.primaryColor,
                              color: terminalSettings.primaryColor
                            }}
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => {
                              setSelectedJoinTeam(null);
                              setJoinPassword('');
                              setJoinError('');
                            }}
                            className="flex-1 px-3 py-1 text-xs font-mono border rounded hover:opacity-80 transition-opacity"
                            style={{
                              borderColor: `${terminalSettings.primaryColor}40`,
                              color: terminalSettings.textColor
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {joinError && (
                <p className="text-xs font-mono" style={{ color: '#f87171' }}>
                  {joinError}
                </p>
              )}
            </div>
          )}

          {incomingInvites.some((invite) => invite.status === 'pending') && (
            <div
              className="border-t pt-4 mt-4 space-y-2"
              style={{ borderColor: `${terminalSettings.primaryColor}40` }}
            >
              <h4 className="text-sm font-mono" style={{ color: terminalSettings.textColor }}>
                Pending Invites
              </h4>
              <div className="space-y-2">
                {incomingInvites
                  .filter((invite) => invite.status === 'pending')
                  .map((invite) => (
                    <div
                      key={invite.id}
                      className="border rounded p-3"
                      style={{ borderColor: `${terminalSettings.primaryColor}30` }}
                    >
                      <p className="text-sm font-mono" style={{ color: terminalSettings.textColor }}>
                        {invite.fromTeam.name}
                      </p>
                      <p className="text-xs opacity-70 mb-2" style={{ color: terminalSettings.textColor }}>
                        Invited {Math.max(1, Math.round((Date.now() - invite.receivedAt) / 60000))} minutes ago
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => acceptIncomingInvite(invite.id)}
                          className="flex-1 px-3 py-1 text-xs font-mono border rounded hover:opacity-80 transition-opacity"
                          style={{
                            borderColor: terminalSettings.primaryColor,
                            color: terminalSettings.primaryColor
                          }}
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => declineIncomingInvite(invite.id)}
                          className="flex-1 px-3 py-1 text-xs font-mono border rounded hover:opacity-80 transition-opacity"
                          style={{
                            borderColor: `${terminalSettings.primaryColor}40`,
                            color: terminalSettings.textColor
                          }}
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  ))}
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
                .filter(
                  (player) =>
                    !currentTeam.members.some((m) => m.id === player.id) &&
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
                      disabled={teamInvites.some((invite) => invite.player.id === player.id)}
                      className="px-3 py-1 text-xs border rounded hover:opacity-80 transition-opacity disabled:opacity-30"
                      style={{
                        borderColor: terminalSettings.primaryColor,
                        color: terminalSettings.primaryColor
                      }}
                    >
                      {teamInvites.some((invite) => invite.player.id === player.id) ? 'Invited' : 'Invite'}
                    </button>
                  </div>
                ))}
            </div>

            {teamInvites.length > 0 && (
              <div
                className="border-t pt-3 mt-3 space-y-2"
                style={{ borderColor: `${terminalSettings.primaryColor}20` }}
              >
                <h4
                  className="text-xs font-mono uppercase tracking-wide"
                  style={{ color: terminalSettings.textColor }}
                >
                  Sent Invites
                </h4>
                {teamInvites.map((invite) => (
                  <div
                    key={invite.id}
                    className="flex items-center justify-between text-xs font-mono"
                    style={{ color: terminalSettings.textColor }}
                  >
                    <span>{invite.player.username}</span>
                    <div className="flex items-center gap-2">
                      <span className="opacity-70">{invite.status}</span>
                      {invite.status === 'pending' && (
                        <button
                          onClick={() => cancelInvite(invite.id)}
                          className="px-2 py-1 border rounded hover:opacity-80 transition-opacity"
                          style={{
                            borderColor: `${terminalSettings.primaryColor}40`,
                            color: terminalSettings.textColor
                          }}
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

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
