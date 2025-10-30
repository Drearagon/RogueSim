import React, { useState, useEffect, useMemo } from 'react';
import { GameState, Mission, SpecialMission, MissionProgress } from '../types/game';
import { getAvailableMissions, getMissionsByCategory, getMissionsByDifficulty, getSpecialMissions, generateEmergencyMission } from '../lib/missionDatabase';
import { 
  Target, 
  Clock, 
  Coins, 
  Star, 
  Shield, 
  Sword, 
  Eye, 
  Zap, 
  AlertTriangle, 
  Trophy,
  Filter,
  Search,
  Play,
  Info,
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface MissionInterfaceProps {
  gameState: GameState;
  onMissionStart: (mission: Mission) => void;
  onClose: () => void;
}

export function MissionInterface({ gameState, onMissionStart, onClose }: MissionInterfaceProps) {
  const [activeTab, setActiveTab] = useState<'available' | 'active' | 'completed' | 'special' | 'events'>('available');
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'difficulty' | 'reward' | 'level' | 'time'>('difficulty');
  const [showFilters, setShowFilters] = useState(false);
  const [emergencyMissions, setEmergencyMissions] = useState<Mission[]>([]);

  // Get available missions
  const eventSyncedState = useMemo(() => applyEventSchedule(gameState), [gameState]);
  const availableMissions = getAvailableMissions(eventSyncedState);
  const specialMissions = getSpecialMissions(eventSyncedState);
  const { activeEvents, upcomingEvents, pastEvents } = eventSyncedState.eventSchedule;
  const activeEventMissions = eventSyncedState.eventMissions;

  const standardMissionCount = useMemo(
    () => availableMissions.filter(mission => mission.type !== 'EVENT').length,
    [availableMissions]
  );

  const eventLookup = useMemo(() => {
    const map = new Map<string, ScheduledEventState>();
    [...activeEvents, ...upcomingEvents, ...pastEvents].forEach(event => {
      map.set(event.id, event);
    });
    return map;
  }, [activeEvents, upcomingEvents, pastEvents]);

  const eventMissionMap = useMemo(() => {
    const map = new Map<string, Mission[]>();
    activeEventMissions.forEach(mission => {
      if (!mission.eventId) return;
      const list = map.get(mission.eventId) ?? [];
      list.push(mission);
      map.set(mission.eventId, list);
    });
    return map;
  }, [activeEventMissions]);

  const [currentTime, setCurrentTime] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Generate emergency missions periodically
  useEffect(() => {
    const generateEmergency = () => {
      if (Math.random() < 0.3) { // 30% chance every check
        const emergency = generateEmergencyMission();
        setEmergencyMissions(prev => [...prev.slice(-2), emergency]); // Keep max 3 emergency missions
      }
    };

    const interval = setInterval(generateEmergency, 5 * 60 * 1000); // Check every 5 minutes
    return () => clearInterval(interval);
  }, []);

  // Filter and sort missions
  const getFilteredMissions = () => {
    let missions = [...availableMissions, ...emergencyMissions];

    // Exclude special missions from the general available list
    missions = missions.filter(mission => mission.type !== 'SPECIAL');

    // Apply category filter
    if (filterCategory !== 'ALL') {
      missions = missions.filter(mission => mission.category === filterCategory);
    }

    // Apply difficulty filter
    if (filterDifficulty !== 'ALL') {
      missions = missions.filter(mission => mission.difficulty === filterDifficulty);
    }

    // Apply search filter
    if (searchTerm) {
      missions = missions.filter(mission => 
        mission.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mission.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort missions
    missions.sort((a, b) => {
      switch (sortBy) {
        case 'difficulty':
          const difficultyOrder = { 'TRIVIAL': 0, 'EASY': 1, 'MEDIUM': 2, 'HARD': 3, 'BRUTAL': 4, 'LEGENDARY': 5 };
          return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
        case 'reward':
          return b.creditReward - a.creditReward;
        case 'level':
          return a.requiredLevel - b.requiredLevel;
        case 'time':
          return (a.timeLimit || 9999) - (b.timeLimit || 9999);
        default:
          return 0;
      }
    });

    return missions;
  };

  const filteredAvailableMissions = useMemo(() => getFilteredMissions(), [
    availableMissions,
    emergencyMissions,
    filterCategory,
    filterDifficulty,
    searchTerm,
    sortBy
  ]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'TRIVIAL': return 'text-gray-400 bg-gray-800';
      case 'EASY': return 'text-green-400 bg-green-900';
      case 'MEDIUM': return 'text-yellow-400 bg-yellow-900';
      case 'HARD': return 'text-orange-400 bg-orange-900';
      case 'BRUTAL': return 'text-red-400 bg-red-900';
      case 'LEGENDARY': return 'text-purple-400 bg-purple-900';
      default: return 'text-gray-400 bg-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'INFILTRATION': return <Shield className="w-4 h-4" />;
      case 'SABOTAGE': return <Sword className="w-4 h-4" />;
      case 'EXTRACTION': return <Target className="w-4 h-4" />;
      case 'RECONNAISSANCE': return <Eye className="w-4 h-4" />;
      case 'SOCIAL_ENGINEERING': return <Eye className="w-4 h-4" />;
      case 'CYBER_WARFARE': return <Zap className="w-4 h-4" />;
      case 'SPECIAL_OPS': return <Trophy className="w-4 h-4" />;
      default: return <Target className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'STANDARD': return 'text-blue-400';
      case 'FACTION': return 'text-purple-400';
      case 'SPECIAL': return 'text-yellow-400';
      case 'EMERGENCY': return 'text-red-400';
      case 'EVENT': return 'text-amber-400';
      default: return 'text-gray-400';
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatCountdown = (milliseconds: number) => {
    if (milliseconds <= 0) return 'Expired';
    const totalMinutes = Math.floor(milliseconds / (60 * 1000));
    const days = Math.floor(totalMinutes / (60 * 24));
    const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
    const minutes = totalMinutes % 60;

    if (days > 0) {
      return `${days}d ${hours}h`;
    }
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const formatEventWindow = (start: number, end: number) => {
    const formatter = new Intl.DateTimeFormat(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    return `${formatter.format(start)} → ${formatter.format(end)}`;
  };

  const canStartMission = (mission: Mission) => {
    // Check if player meets requirements
    if (mission.requiredLevel > gameState.playerLevel) return false;
    if (mission.requiredFaction && gameState.activeFaction !== mission.requiredFaction) return false;

    if (mission.availableFrom && Date.now() < mission.availableFrom) return false;
    if (mission.availableUntil && Date.now() > mission.availableUntil) return false;

    // Check cooldown
    if (mission.cooldownHours && gameState.missionCooldowns?.[mission.id]) {
      const cooldownEnd = gameState.missionCooldowns[mission.id] + (mission.cooldownHours * 60 * 60 * 1000);
      if (Date.now() < cooldownEnd) return false;
    }

    return true;
  };

  const getRemainingCooldown = (mission: Mission) => {
    if (!mission.cooldownHours || !gameState.missionCooldowns?.[mission.id]) return null;
    
    const cooldownEnd = gameState.missionCooldowns[mission.id] + (mission.cooldownHours * 60 * 60 * 1000);
    const remaining = cooldownEnd - Date.now();
    
    if (remaining <= 0) return null;
    
    const hours = Math.floor(remaining / (60 * 60 * 1000));
    const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
    
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-lg z-50 flex items-center justify-center">
      <div className="bg-gray-900 border border-green-500 rounded-lg p-6 max-w-7xl w-full mx-4 max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-3xl font-bold text-green-400">Mission Control</h2>
            <p className="text-green-300 text-sm">
              Level {gameState.playerLevel} • {filteredAvailableMissions.length} missions available
            </p>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-4 mb-6 border-b border-gray-700">
          {[
            { id: 'available', label: 'Available', icon: <Target className="w-4 h-4" />, count: filteredAvailableMissions.length },
            { id: 'active', label: 'Active', icon: <Play className="w-4 h-4" />, count: gameState.activeMission ? 1 : 0 },
            { id: 'completed', label: 'Completed', icon: <Trophy className="w-4 h-4" />, count: gameState.completedMissionIds?.length || 0 },
            { id: 'special', label: 'Special', icon: <Star className="w-4 h-4" />, count: specialMissions.length }
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
              <span className="bg-gray-700 text-xs px-2 py-1 rounded-full">{tab.count}</span>
            </button>
          ))}
        </div>

        {/* Filters and Search */}
        {activeTab === 'available' && (
          <div className="mb-4">
            <div className="flex items-center gap-4 mb-3">
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search missions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-gray-800 border border-gray-600 rounded px-3 py-1 text-white text-sm"
                />
              </div>
              
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm transition-colors"
              >
                <Filter className="w-4 h-4" />
                Filters
                {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>

            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-800 rounded-lg">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Category</label>
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                  >
                    <option value="ALL">All Categories</option>
                    <option value="INFILTRATION">Infiltration</option>
                    <option value="SABOTAGE">Sabotage</option>
                    <option value="EXTRACTION">Extraction</option>
                    <option value="RECONNAISSANCE">Reconnaissance</option>
                    <option value="SOCIAL_ENGINEERING">Social Engineering</option>
                    <option value="CYBER_WARFARE">Cyber Warfare</option>
                    <option value="SPECIAL_OPS">Special Ops</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">Difficulty</label>
                  <select
                    value={filterDifficulty}
                    onChange={(e) => setFilterDifficulty(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                  >
                    <option value="ALL">All Difficulties</option>
                    <option value="TRIVIAL">Trivial</option>
                    <option value="EASY">Easy</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HARD">Hard</option>
                    <option value="BRUTAL">Brutal</option>
                    <option value="LEGENDARY">Legendary</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">Sort By</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                  >
                    <option value="difficulty">Difficulty</option>
                    <option value="reward">Reward</option>
                    <option value="level">Required Level</option>
                    <option value="time">Time Limit</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setFilterCategory('ALL');
                      setFilterDifficulty('ALL');
                      setSearchTerm('');
                      setSortBy('difficulty');
                    }}
                    className="px-3 py-1 bg-gray-600 hover:bg-gray-500 rounded text-sm transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-hidden flex gap-6">
          {/* Mission List */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === 'available' && (
              <div className="space-y-3">
                {emergencyMissions.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-red-400 mb-3 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5" />
                      Emergency Missions
                    </h3>
                    {emergencyMissions.map(mission => (
                      <div key={mission.id} className="bg-red-900/30 border border-red-500 rounded-lg p-4 cursor-pointer hover:bg-red-900/50 transition-colors"
                           onClick={() => setSelectedMission(mission)}>
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-bold text-red-300">{mission.title}</h4>
                            <p className="text-red-200 text-sm">{mission.description}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-red-400 font-bold">{mission.creditReward}₵</div>
                            {mission.timeLimit && (
                              <div className="text-red-300 text-xs">{formatTime(mission.timeLimit)} limit</div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-red-300">
                          <span>Level {mission.requiredLevel}+</span>
                          <span className={`px-2 py-1 rounded ${getDifficultyColor(mission.difficulty)}`}>
                            {mission.difficulty}
                          </span>
                          <span>Expires in 2h</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {filteredAvailableMissions.map(mission => (
                  <div
                    key={mission.id}
                    className={`bg-gray-800 border rounded-lg p-4 cursor-pointer transition-colors ${
                      selectedMission?.id === mission.id 
                        ? 'border-green-500 bg-gray-700' 
                        : 'border-gray-700 hover:border-gray-600 hover:bg-gray-750'
                    }`}
                    onClick={() => setSelectedMission(mission)}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {getCategoryIcon(mission.category)}
                          <h4 className="font-bold text-white">{mission.title}</h4>
                          <span className={`text-xs px-2 py-1 rounded ${getTypeColor(mission.type)}`}>
                            {mission.type}
                          </span>
                        </div>
                        <p className="text-gray-300 text-sm mb-2">{mission.description}</p>
                        
                        <div className="flex items-center gap-4 text-xs">
                          <span className="text-gray-400">Level {mission.requiredLevel}+</span>
                          <span className={`px-2 py-1 rounded ${getDifficultyColor(mission.difficulty)}`}>
                            {mission.difficulty}
                          </span>
                          {mission.timeLimit && (
                            <span className="text-blue-400">{formatTime(mission.timeLimit)} limit</span>
                          )}
                          {mission.requiredFaction && (
                            <span className="text-purple-400">Faction: {mission.requiredFaction}</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-right ml-4">
                        <div className="text-green-400 font-bold text-lg">{mission.creditReward}₵</div>
                        {mission.experienceReward && (
                          <div className="text-blue-400 text-sm">+{mission.experienceReward} XP</div>
                        )}
                        {mission.reputationReward && (
                          <div className="text-yellow-400 text-sm">+{mission.reputationReward} Rep</div>
                        )}
                        
                        {!canStartMission(mission) && (
                          <div className="text-red-400 text-xs mt-1">
                            {getRemainingCooldown(mission) || 'Requirements not met'}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {filteredAvailableMissions.length === 0 && (
                  <div className="text-center py-12">
                    <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-400 mb-2">No Missions Found</h3>
                    <p className="text-gray-500">Try adjusting your filters or check back later for new missions.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'active' && (
              <div>
                {gameState.activeMission ? (
                  <div className="bg-green-900/30 border border-green-500 rounded-lg p-6">
                    <h3 className="text-xl font-bold text-green-400 mb-4">Active Mission</h3>
                    <h4 className="text-lg font-bold text-white mb-2">{gameState.activeMission.title}</h4>
                    <p className="text-gray-300 mb-4">{gameState.activeMission.description}</p>
                    
                    <div className="space-y-2">
                      <h5 className="font-semibold text-green-400">Objectives:</h5>
                      {gameState.activeMission.objectives.map((objective, index) => (
                        <div key={objective.id} className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded-full border-2 ${
                            objective.completed 
                              ? 'bg-green-500 border-green-500' 
                              : 'border-gray-400'
                          }`}>
                            {objective.completed && <div className="w-2 h-2 bg-white rounded-full m-0.5" />}
                          </div>
                          <span className={objective.completed ? 'text-green-400 line-through' : 'text-white'}>
                            {objective.description}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Play className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-400 mb-2">No Active Mission</h3>
                    <p className="text-gray-500">Start a mission from the Available tab to begin.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'events' && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-bold text-amber-400 mb-3 flex items-center gap-2">
                    <Hourglass className="w-5 h-5" />
                    Active Events
                  </h3>
                  {activeEvents.length === 0 ? (
                    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 text-center">
                      <CalendarClock className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                      <h4 className="text-xl font-semibold text-gray-400 mb-1">No Active Events</h4>
                      <p className="text-gray-500 text-sm">Check the upcoming schedule below for the next limited-time operations.</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {activeEvents.map(event => {
                        const missions = eventMissionMap.get(event.id) ?? event.missions ?? [];
                        const timeRemaining = formatCountdown((event.endTime ?? 0) - currentTime);

                        return (
                          <div
                            key={`${event.id}_${event.iteration}`}
                            className="bg-amber-900/20 border border-amber-500/60 rounded-lg p-5 shadow-lg"
                          >
                            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs uppercase tracking-widest text-amber-300/80">Limited-Time Event</span>
                                  {event.isCompleted && (
                                    <span className="text-xs px-2 py-0.5 bg-emerald-600 text-white rounded-full">Completed</span>
                                  )}
                                </div>
                                <h4 className="text-2xl font-bold text-amber-200 mt-1">{event.title}</h4>
                                <p className="text-amber-100/80 text-sm mt-2 max-w-2xl">{event.description}</p>
                              </div>
                              <div className="text-right">
                                <div className="flex items-center gap-2 justify-end text-amber-200 font-semibold">
                                  <Hourglass className="w-4 h-4" />
                                  <span>{timeRemaining}</span>
                                </div>
                                <div className="text-amber-100/70 text-xs mt-1">{formatEventWindow(event.startTime, event.endTime)}</div>
                              </div>
                            </div>

                            <div className="mt-5 space-y-4">
                              {missions.length === 0 ? (
                                <div className="bg-gray-900/60 border border-gray-700 rounded p-4 text-sm text-amber-100/80">
                                  Event objectives already cleared.
                                </div>
                              ) : (
                                missions.map(mission => {
                                  const expiresIn = mission.availableUntil ? mission.availableUntil - currentTime : event.endTime - currentTime;
                                  const canLaunch = canStartMission(mission);
                                  const cooldownRemaining = getRemainingCooldown(mission);

                                  return (
                                    <div
                                      key={mission.id}
                                      className={`bg-gray-900/70 border rounded-lg p-4 transition-colors ${
                                        selectedMission?.id === mission.id
                                          ? 'border-amber-400'
                                          : 'border-amber-500/40 hover:border-amber-400'
                                      }`}
                                    >
                                      <div className="flex flex-col md:flex-row md:justify-between gap-3">
                                        <div className="md:max-w-2xl">
                                          <h5 className="text-amber-200 font-semibold text-lg">{mission.title}</h5>
                                          <p className="text-gray-300 text-sm mt-1">{mission.description}</p>
                                        </div>
                                        <div className="text-right">
                                          <div className="text-green-300 font-bold text-lg">{mission.creditReward}₵</div>
                                          <div className="text-blue-300 text-sm">+{mission.experienceReward} XP</div>
                                        </div>
                                      </div>

                                      <div className="mt-3 flex flex-wrap gap-3 text-xs text-amber-100/80">
                                        <span>Level {mission.requiredLevel}+</span>
                                        <span className={`px-2 py-1 rounded ${getDifficultyColor(mission.difficulty)}`}>
                                          {mission.difficulty}
                                        </span>
                                        <span>Expires in {formatCountdown(expiresIn)}</span>
                                        {mission.timeLimit && (
                                          <span>Mission Timer {formatTime(mission.timeLimit)}</span>
                                        )}
                                      </div>

                                      <div className="mt-4 flex flex-wrap gap-2">
                                        <button
                                          onClick={() => setSelectedMission(mission)}
                                          className="px-3 py-1.5 border border-amber-500/60 text-amber-200 rounded hover:bg-amber-500/10 transition"
                                        >
                                          View Briefing
                                        </button>
                                        <button
                                          onClick={() => onMissionStart(mission)}
                                          disabled={!canLaunch}
                                          className={`px-3 py-1.5 rounded font-semibold transition ${
                                            canLaunch
                                              ? 'bg-amber-500 text-black hover:bg-amber-400'
                                              : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                                          }`}
                                        >
                                          {canLaunch ? 'Start Mission' : 'Unavailable'}
                                        </button>
                                        {!canLaunch && cooldownRemaining && (
                                          <span className="text-xs text-red-300 self-center">Cooldown: {cooldownRemaining}</span>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-bold text-sky-300 mb-3 flex items-center gap-2">
                    <CalendarClock className="w-5 h-5" />
                    Upcoming Events
                  </h3>
                  {upcomingEvents.length === 0 ? (
                    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 text-center text-gray-400">
                      No upcoming events scheduled.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {upcomingEvents.map(event => (
                        <div
                          key={`${event.id}_${event.iteration}`}
                          className="bg-slate-900/60 border border-sky-500/40 rounded-lg p-4"
                        >
                          <div className="flex flex-col md:flex-row md:justify-between gap-3">
                            <div>
                              <h4 className="text-sky-200 font-semibold text-lg">{event.title}</h4>
                              <p className="text-gray-300 text-sm mt-1">{event.description}</p>
                            </div>
                            <div className="text-right text-sky-100/80 text-sm">
                              <div>Starts in {formatCountdown(event.startTime - currentTime)}</div>
                              <div className="text-xs mt-1">{formatEventWindow(event.startTime, event.endTime)}</div>
                            </div>
                          </div>
                          {event.missions && event.missions.length > 0 && (
                            <div className="mt-3 grid gap-2 sm:grid-cols-2 text-xs text-sky-100/80">
                              {event.missions.map(mission => (
                                <div key={mission.id} className="bg-slate-800/60 border border-sky-500/30 rounded p-3">
                                  <div className="font-semibold text-sky-200">{mission.title}</div>
                                  <div className="mt-1 flex items-center gap-2 text-xs">
                                    <span className={`px-2 py-0.5 rounded ${getDifficultyColor(mission.difficulty)}`}>
                                      {mission.difficulty}
                                    </span>
                                    <span>{mission.creditReward}₵ reward</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {pastEvents.length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold text-gray-300 mb-3">Recent Event</h3>
                    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-sm text-gray-300">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-white">{pastEvents[0].title}</div>
                          <div className="text-xs text-gray-400">{formatEventWindow(pastEvents[0].startTime, pastEvents[0].endTime)}</div>
                        </div>
                        <div className="text-xs text-gray-400">Cycle #{pastEvents[0].iteration}</div>
                      </div>
                      <p className="mt-2 text-gray-400">{pastEvents[0].description}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'completed' && (
              <div className="space-y-3">
                {gameState.missionHistory?.map((progress, index) => (
                  <div key={index} className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-bold text-white">{progress.missionId}</h4>
                        <p className="text-gray-400 text-sm">
                          Completed in {Math.floor(progress.timeElapsed / 60)}m {progress.timeElapsed % 60}s
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-green-400 font-bold">Score: {progress.score}</div>
                        <div className="text-yellow-400 text-sm">
                          {progress.status === 'COMPLETED' ? '✓ Success' : '✗ Failed'}
                        </div>
                      </div>
                    </div>
                  </div>
                )) || (
                  <div className="text-center py-12">
                    <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-400 mb-2">No Completed Missions</h3>
                    <p className="text-gray-500">Complete missions to see your history here.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'special' && (
              <div className="space-y-4">
                {specialMissions.map(mission => (
                  <div
                    key={mission.id}
                    className="bg-gradient-to-r from-purple-900/30 to-yellow-900/30 border border-yellow-500 rounded-lg p-6 cursor-pointer hover:from-purple-900/50 hover:to-yellow-900/50 transition-all"
                    onClick={() => setSelectedMission(mission)}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <Star className="w-6 h-6 text-yellow-400" />
                      <h4 className="text-xl font-bold text-yellow-400">{mission.title}</h4>
                      <span className="text-xs px-2 py-1 bg-yellow-600 text-black rounded font-bold">
                        SPECIAL
                      </span>
                    </div>
                    
                    <p className="text-gray-300 mb-4">{mission.description}</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Reward:</span>
                        <div className="text-green-400 font-bold">{mission.creditReward}₵</div>
                      </div>
                      <div>
                        <span className="text-gray-400">Difficulty:</span>
                        <div className={getDifficultyColor(mission.difficulty).split(' ')[0]}>
                          {mission.difficulty}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-400">Type:</span>
                        <div className="text-yellow-400">{mission.specialType}</div>
                      </div>
                      <div>
                        <span className="text-gray-400">Level:</span>
                        <div className="text-white">{mission.requiredLevel}+</div>
                      </div>
                    </div>
                  </div>
                ))}

                {specialMissions.length === 0 && (
                  <div className="text-center py-12">
                    <Star className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-400 mb-2">No Special Missions</h3>
                    <p className="text-gray-500">Special missions unlock as you progress and gain reputation.</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mission Details Panel */}
          {selectedMission && (
            <div className="w-96 bg-gray-800 border border-gray-700 rounded-lg p-6 overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">Mission Details</h3>
                <button
                  onClick={() => setSelectedMission(null)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-bold text-green-400 text-xl mb-2">{selectedMission.title}</h4>
                  <p className="text-gray-300 text-sm mb-3">{selectedMission.description}</p>
                  
                  {selectedMission.briefing && (
                    <div className="bg-gray-900 border border-gray-600 rounded p-3 mb-3">
                      <h5 className="font-semibold text-blue-400 mb-2">Mission Briefing</h5>
                      <p className="text-gray-300 text-sm italic">{selectedMission.briefing}</p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Difficulty:</span>
                    <div className={`inline-block px-2 py-1 rounded ml-2 ${getDifficultyColor(selectedMission.difficulty)}`}>
                      {selectedMission.difficulty}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-400">Category:</span>
                    <div className="text-white ml-2">{selectedMission.category}</div>
                  </div>
                  <div>
                    <span className="text-gray-400">Required Level:</span>
                    <div className="text-white ml-2">{selectedMission.requiredLevel}</div>
                  </div>
                  <div>
                    <span className="text-gray-400">Type:</span>
                    <div className={`ml-2 ${getTypeColor(selectedMission.type)}`}>
                      {selectedMission.type}
                    </div>
                  </div>
                  {selectedMission.eventId && (
                    <div className="col-span-2">
                      <span className="text-gray-400">Event:</span>
                      <div className="text-amber-300 ml-2">
                        {eventLookup.get(selectedMission.eventId)?.title || selectedMission.eventId}
                      </div>
                    </div>
                  )}
                  {selectedMission.availableFrom && selectedMission.availableUntil && (
                    <div className="col-span-2">
                      <span className="text-gray-400">Availability:</span>
                      <div className="text-white ml-2">
                        {formatEventWindow(selectedMission.availableFrom, selectedMission.availableUntil)}
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <h5 className="font-semibold text-green-400 mb-2">Rewards</h5>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Credits:</span>
                      <span className="text-green-400 font-bold">{selectedMission.creditReward}₵</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Experience:</span>
                      <span className="text-blue-400">{selectedMission.experienceReward} XP</span>
                    </div>
                    {selectedMission.reputationReward && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Reputation:</span>
                        <span className="text-yellow-400">+{selectedMission.reputationReward}</span>
                      </div>
                    )}
                    {selectedMission.skillPointReward && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Skill Points:</span>
                        <span className="text-purple-400">+{selectedMission.skillPointReward}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h5 className="font-semibold text-blue-400 mb-2">Objectives</h5>
                  <div className="space-y-2">
                    {selectedMission.objectives.map((objective, index) => (
                      <div key={objective.id} className="flex items-start gap-2 text-sm">
                        <div className="w-5 h-5 rounded border border-gray-500 flex items-center justify-center mt-0.5">
                          <span className="text-xs text-gray-400">{index + 1}</span>
                        </div>
                        <div>
                          <div className="text-white">{objective.description}</div>
                          {objective.command && (
                            <div className="text-gray-400 text-xs font-mono">
                              Command: {objective.command}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedMission.timeLimit && (
                  <div className="bg-yellow-900/30 border border-yellow-600 rounded p-3">
                    <div className="flex items-center gap-2 text-yellow-400">
                      <Clock className="w-4 h-4" />
                      <span className="font-semibold">Time Limit: {formatTime(selectedMission.timeLimit)}</span>
                    </div>
                  </div>
                )}

                {selectedMission.consequences && selectedMission.consequences.length > 0 && (
                  <div>
                    <h5 className="font-semibold text-orange-400 mb-2">Consequences</h5>
                    <div className="space-y-1 text-sm">
                      {selectedMission.consequences.map((consequence, index) => (
                        <div key={index} className="text-orange-300">• {consequence}</div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-gray-700">
                  <button
                    onClick={() => onMissionStart(selectedMission)}
                    disabled={!canStartMission(selectedMission)}
                    className={`w-full py-3 rounded font-bold transition-colors ${
                      canStartMission(selectedMission)
                        ? 'bg-green-600 hover:bg-green-700 text-white'
                        : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {canStartMission(selectedMission) ? 'Start Mission' : 'Cannot Start'}
                  </button>
                  
                  {!canStartMission(selectedMission) && (
                    <div className="mt-2 text-xs text-red-400 text-center">
                      {selectedMission.requiredLevel > gameState.playerLevel && 
                        `Requires level ${selectedMission.requiredLevel}`}
                      {selectedMission.requiredFaction && gameState.activeFaction !== selectedMission.requiredFaction && 
                        `Requires faction: ${selectedMission.requiredFaction}`}
                      {getRemainingCooldown(selectedMission) && 
                        `Cooldown: ${getRemainingCooldown(selectedMission)}`}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 