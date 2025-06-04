import React, { useState, useEffect } from 'react';
import { GameState, Faction, PlayerFactionStanding } from '../types/game';
import { factions, factionRanks, getPlayerFactionRank, canJoinFaction, getAvailableFactionMissions, initializeFactionStandings } from '../lib/factionSystem';
import { Shield, Sword, Eye, Crown, Star, Users, Target, Award, Clock, Coins } from 'lucide-react';

interface FactionInterfaceProps {
  gameState: GameState;
  onFactionAction: (action: string, data?: any) => void;
  onClose: () => void;
}

export function FactionInterface({ gameState, onFactionAction, onClose }: FactionInterfaceProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'standings' | 'missions' | 'join'>('overview');
  const [selectedFaction, setSelectedFaction] = useState<string | null>(null);
  const [localGameState, setLocalGameState] = useState<GameState>(gameState);

  // Initialize faction standings if they don't exist
  useEffect(() => {
    if (!gameState.factionStandings || Object.keys(gameState.factionStandings).length === 0) {
      const initializedStandings = initializeFactionStandings();
      setLocalGameState({
        ...gameState,
        factionStandings: initializedStandings
      });
    } else {
      setLocalGameState(gameState);
    }
  }, [gameState]);

  const getFactionIcon = (factionId: string) => {
    switch (factionId) {
      case 'serpent_syndicate': return <Shield className="w-6 h-6 text-green-400" />;
      case 'crimson_circuit': return <Sword className="w-6 h-6 text-red-400" />;
      case 'mirage_loop': return <Eye className="w-6 h-6 text-purple-400" />;
      default: return <Users className="w-6 h-6 text-gray-400" />;
    }
  };

  const getRankIcon = (level: number) => {
    if (level >= 5) return <Crown className="w-4 h-4 text-yellow-400" />;
    if (level >= 3) return <Star className="w-4 h-4 text-blue-400" />;
    return <Award className="w-4 h-4 text-gray-400" />;
  };

  const activeFaction = localGameState.activeFaction ? factions[localGameState.activeFaction] : null;
  const activeStanding = localGameState.activeFaction ? localGameState.factionStandings?.[localGameState.activeFaction] : null;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-lg z-50 flex items-center justify-center">
      <div className="bg-gray-900 border border-green-500 rounded-lg p-6 max-w-6xl w-full mx-4 max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-green-400">Faction Management</h2>
            <p className="text-green-300 text-sm">
              {activeFaction ? `Active: ${activeFaction.name}` : 'No active faction membership'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
          >
            Close
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-4 mb-6 border-b border-gray-700">
          {[
            { id: 'overview', label: 'Overview', icon: <Users className="w-4 h-4" /> },
            { id: 'standings', label: 'Standings', icon: <Award className="w-4 h-4" /> },
            { id: 'missions', label: 'Missions', icon: <Target className="w-4 h-4" /> },
            { id: 'join', label: 'Join Faction', icon: <Crown className="w-4 h-4" /> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-t transition-colors ${
                activeTab === tab.id
                  ? 'bg-green-600 text-white border-b-2 border-green-400'
                  : 'text-gray-400 hover:text-green-400'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {activeFaction && activeStanding ? (
                <div className="space-y-4">
                  {/* Active Faction Status */}
                  <div className="bg-gray-800 rounded-lg p-6 border border-green-500">
                    <div className="flex items-center gap-4 mb-4">
                      {getFactionIcon(localGameState.activeFaction!)}
                      <div>
                        <h3 className="text-xl font-bold text-green-400">{activeFaction.name}</h3>
                        <p className="text-gray-300">{activeFaction.description}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="bg-gray-700 rounded p-4">
                        <div className="flex items-center gap-2 mb-2">
                          {getRankIcon(activeStanding.rank.level)}
                          <span className="text-sm text-gray-400">Current Rank</span>
                        </div>
                        <div className="text-lg font-bold text-white">{activeStanding.rank.title}</div>
                      </div>
                      
                      <div className="bg-gray-700 rounded p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Star className="w-4 h-4 text-yellow-400" />
                          <span className="text-sm text-gray-400">Reputation</span>
                        </div>
                        <div className="text-lg font-bold text-yellow-400">{activeStanding.reputation}</div>
                      </div>
                      
                      <div className="bg-gray-700 rounded p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Target className="w-4 h-4 text-blue-400" />
                          <span className="text-sm text-gray-400">Missions</span>
                        </div>
                        <div className="text-lg font-bold text-blue-400">{activeStanding.missionsCompleted}</div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <h4 className="text-lg font-semibold text-green-400 mb-2">Philosophy</h4>
                      <p className="text-gray-300 italic">"{activeFaction.philosophy}"</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-lg font-semibold text-green-400 mb-2">Specialization Bonuses</h4>
                        <div className="space-y-2">
                          {activeFaction.specialization.bonuses.map((bonus, index) => (
                            <div key={index} className="bg-green-900/30 rounded p-2">
                              <div className="text-sm font-medium text-green-300">
                                +{bonus.value}% {bonus.type.replace('_', ' ')}
                              </div>
                              <div className="text-xs text-gray-400">{bonus.description}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-lg font-semibold text-red-400 mb-2">Penalties</h4>
                        <div className="space-y-2">
                          {activeFaction.specialization.penalties.map((penalty, index) => (
                            <div key={index} className="bg-red-900/30 rounded p-2">
                              <div className="text-sm font-medium text-red-300">
                                -{penalty.value}% {penalty.type.replace('_', ' ')}
                              </div>
                              <div className="text-xs text-gray-400">{penalty.description}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={() => onFactionAction('leave')}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                      >
                        Leave Faction
                      </button>
                      <button
                        onClick={() => setActiveTab('missions')}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                      >
                        View Missions
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-400 mb-2">No Active Faction</h3>
                  <p className="text-gray-500 mb-4">Join a faction to access exclusive missions, commands, and benefits.</p>
                  <button
                    onClick={() => setActiveTab('join')}
                    className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                  >
                    Browse Factions
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'standings' && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-green-400">Faction Standings</h3>
              <div className="grid gap-4">
                {Object.entries(localGameState.factionStandings || {}).map(([factionId, standing]) => {
                  const faction = factions[factionId];
                  if (!faction) return null; // Skip if faction doesn't exist
                  
                  const rank = getPlayerFactionRank(factionId, standing.reputation);
                  const nextRank = factionRanks[factionId]?.find(r => r.requiredReputation > standing.reputation);
                  
                  return (
                    <div key={factionId} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          {getFactionIcon(factionId)}
                          <div>
                            <h4 className="font-bold text-white">{faction.name}</h4>
                            <p className="text-sm text-gray-400">{faction.description}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-yellow-400">{standing.reputation}</div>
                          <div className="text-sm text-gray-400">reputation</div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-400">Rank:</span>
                          <div className="flex items-center gap-1">
                            {getRankIcon(rank.level)}
                            <span className="text-white">{rank.title}</span>
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-400">Missions:</span>
                          <div className="text-white">{standing.missionsCompleted}</div>
                        </div>
                        <div>
                          <span className="text-gray-400">Credits:</span>
                          <div className="text-white">{standing.creditsEarned}₵</div>
                        </div>
                        <div>
                          <span className="text-gray-400">Status:</span>
                          <div className={standing.isActive ? 'text-green-400' : 'text-gray-400'}>
                            {standing.isActive ? 'ACTIVE' : 'INACTIVE'}
                          </div>
                        </div>
                      </div>
                      
                      {nextRank && (
                        <div className="mt-3 pt-3 border-t border-gray-700">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Next: {nextRank.title}</span>
                            <span className="text-gray-400">
                              {nextRank.requiredReputation - standing.reputation} reputation needed
                            </span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-2 mt-1">
                            <div 
                              className="bg-green-500 h-2 rounded-full transition-all duration-300"
                              style={{ 
                                width: `${Math.min(100, (standing.reputation / nextRank.requiredReputation) * 100)}%` 
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'missions' && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-green-400">Faction Missions</h3>
              {localGameState.activeFaction ? (
                <div className="space-y-4">
                  {getAvailableFactionMissions(localGameState.activeFaction, localGameState).map(mission => (
                    <div key={mission.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-bold text-white mb-1">{mission.title}</h4>
                          <p className="text-gray-300 text-sm">{mission.description}</p>
                        </div>
                        <div className="text-right">
                          <div className={`px-2 py-1 rounded text-xs font-bold ${
                            mission.difficulty === 'EASY' ? 'bg-green-600' :
                            mission.difficulty === 'MEDIUM' ? 'bg-yellow-600' :
                            mission.difficulty === 'HARD' ? 'bg-orange-600' :
                            mission.difficulty === 'BRUTAL' ? 'bg-red-600' :
                            'bg-purple-600'
                          }`}>
                            {mission.difficulty}
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3 text-sm">
                        <div className="flex items-center gap-2">
                          <Star className="w-4 h-4 text-yellow-400" />
                          <span>+{mission.reputationReward} rep</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Coins className="w-4 h-4 text-green-400" />
                          <span>+{mission.creditReward}₵</span>
                        </div>
                        {mission.cooldownHours && (
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-blue-400" />
                            <span>{mission.cooldownHours}h cooldown</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Target className="w-4 h-4 text-purple-400" />
                          <span>{mission.isRepeatable ? 'Repeatable' : 'One-time'}</span>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => onFactionAction('start_mission', mission.id)}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
                      >
                        Start Mission
                      </button>
                    </div>
                  ))}
                  
                  {getAvailableFactionMissions(localGameState.activeFaction, localGameState).length === 0 && (
                    <div className="text-center py-8">
                      <Target className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-400">No missions available at your current rank.</p>
                      <p className="text-gray-500 text-sm">Increase your reputation to unlock more missions.</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-400">Join a faction to access exclusive missions.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'join' && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-green-400">Available Factions</h3>
              <div className="grid gap-6">
                {Object.values(factions).map(faction => {
                  const joinCheck = canJoinFaction(faction.id, localGameState);
                  const standing = localGameState.factionStandings?.[faction.id];
                  
                  return (
                    <div key={faction.id} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                      <div className="flex items-start gap-4 mb-4">
                        {getFactionIcon(faction.id)}
                        <div className="flex-1">
                          <h4 className="text-xl font-bold text-white mb-2">{faction.name}</h4>
                          <p className="text-gray-300 mb-3">{faction.description}</p>
                          <p className="text-gray-400 italic text-sm">"{faction.philosophy}"</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <h5 className="font-semibold text-green-400 mb-2">Specialization: {faction.specialization.type}</h5>
                          <div className="space-y-1">
                            {faction.specialization.bonuses.slice(0, 2).map((bonus, index) => (
                              <div key={index} className="text-sm text-green-300">
                                • {bonus.description}
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <h5 className="font-semibold text-blue-400 mb-2">Benefits</h5>
                          <div className="space-y-1">
                            {faction.benefits.slice(0, 2).map((benefit, index) => (
                              <div key={index} className="text-sm text-blue-300">
                                • {benefit.description}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <h5 className="font-semibold text-yellow-400 mb-2">Requirements</h5>
                        <div className="space-y-1">
                          {faction.requirements.map((req, index) => (
                            <div key={index} className="text-sm text-gray-300">
                              • {req.description}
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {standing && (
                        <div className="mb-4 p-3 bg-gray-700 rounded">
                          <div className="text-sm">
                            <span className="text-gray-400">Current Standing: </span>
                            <span className="text-yellow-400">{standing.reputation} reputation</span>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex gap-2">
                        {joinCheck.canJoin ? (
                          <button
                            onClick={() => onFactionAction('join', faction.id)}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
                            disabled={localGameState.activeFaction === faction.id}
                          >
                            {localGameState.activeFaction === faction.id ? 'Current Faction' : 'Join Faction'}
                          </button>
                        ) : (
                          <div className="px-4 py-2 bg-gray-600 text-gray-300 rounded">
                            Requirements not met
                          </div>
                        )}
                        
                        <button
                          onClick={() => setSelectedFaction(selectedFaction === faction.id ? null : faction.id)}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                        >
                          {selectedFaction === faction.id ? 'Hide Details' : 'View Details'}
                        </button>
                      </div>
                      
                      {selectedFaction === faction.id && (
                        <div className="mt-4 pt-4 border-t border-gray-700">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h6 className="font-semibold text-green-400 mb-2">Exclusive Commands</h6>
                              <div className="space-y-1">
                                {faction.exclusiveCommands.map(cmd => (
                                  <div key={cmd} className="text-sm text-green-300 font-mono">
                                    {cmd}
                                  </div>
                                ))}
                              </div>
                            </div>
                            
                            <div>
                              <h6 className="font-semibold text-purple-400 mb-2">Rival Factions</h6>
                              <div className="space-y-1">
                                {faction.rivalFactions.length > 0 ? (
                                  faction.rivalFactions.map(rivalId => (
                                    <div key={rivalId} className="text-sm text-red-300">
                                      {factions[rivalId]?.name}
                                    </div>
                                  ))
                                ) : (
                                  <div className="text-sm text-gray-400">None</div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 