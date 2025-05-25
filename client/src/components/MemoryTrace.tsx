import { useState, useEffect } from 'react';
import { X, Clock, Terminal, Trophy, Zap, Shield, Cpu, Database } from 'lucide-react';
import { GameState } from '../types/game';

interface MemoryTraceProps {
  gameState: GameState;
  onClose: () => void;
}

interface TraceEvent {
  id: string;
  timestamp: Date;
  type: 'command' | 'mission' | 'purchase' | 'achievement' | 'discovery';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high' | 'critical';
  icon: React.ComponentType<any>;
  metadata?: any;
}

export function MemoryTrace({ gameState, onClose }: MemoryTraceProps) {
  const [selectedEvent, setSelectedEvent] = useState<TraceEvent | null>(null);
  const [timelineEvents, setTimelineEvents] = useState<TraceEvent[]>([]);
  const [filterType, setFilterType] = useState<string>('all');

  useEffect(() => {
    // Generate timeline events based on game state
    const events: TraceEvent[] = [];
    
    // Add session start event
    events.push({
      id: 'session_start',
      timestamp: new Date(Date.now() - (gameState.completedMissions * 300000)), // Simulate timing
      type: 'discovery',
      title: 'Session Initiated',
      description: 'Connected to RogueSim network. Identity: ANONYMOUS',
      impact: 'medium',
      icon: Terminal,
      metadata: { sessionId: 'CLASSIFIED' }
    });

    // Add mission completion events
    for (let i = 0; i < gameState.completedMissions; i++) {
      events.push({
        id: `mission_${i}`,
        timestamp: new Date(Date.now() - ((gameState.completedMissions - i) * 240000)),
        type: 'mission',
        title: `Mission ${i + 1} Completed`,
        description: `Successfully infiltrated target system. Reputation increased.`,
        impact: 'high',
        icon: Trophy,
        metadata: { missionId: i + 1, creditsEarned: 200 + (i * 50) }
      });
    }

    // Add command execution events (simulate recent activity)
    const recentCommands = ['scan', 'connect', 'inject', 'decrypt', 'extract'];
    recentCommands.forEach((cmd, index) => {
      events.push({
        id: `cmd_${cmd}_${index}`,
        timestamp: new Date(Date.now() - (index * 60000)),
        type: 'command',
        title: `Command Executed: ${cmd.toUpperCase()}`,
        description: `Terminal command "${cmd}" executed successfully`,
        impact: 'low',
        icon: Terminal,
        metadata: { command: cmd, success: true }
      });
    });

    // Add purchase events based on inventory
    if (gameState.inventory.hardware.length > 0) {
      events.push({
        id: 'purchase_hardware',
        timestamp: new Date(Date.now() - 180000),
        type: 'purchase',
        title: 'Hardware Acquired',
        description: 'Purchased new hacking hardware from underground market',
        impact: 'medium',
        icon: Cpu,
        metadata: { itemCount: gameState.inventory.hardware.length }
      });
    }

    if (gameState.inventory.software.length > 0) {
      events.push({
        id: 'purchase_software',
        timestamp: new Date(Date.now() - 120000),
        type: 'purchase',
        title: 'Software Installed',
        description: 'Downloaded and installed new exploitation tools',
        impact: 'medium',
        icon: Database,
        metadata: { itemCount: gameState.inventory.software.length }
      });
    }

    // Add Hydra Protocol discovery
    if (gameState.hydraProtocol.discovered) {
      events.push({
        id: 'hydra_discovery',
        timestamp: new Date(Date.now() - 90000),
        type: 'discovery',
        title: 'HYDRA PROTOCOL DETECTED',
        description: 'Intercepted encrypted transmission. Shadow organization activity confirmed.',
        impact: 'critical',
        icon: Shield,
        metadata: { 
          frequency: '433.92MHz',
          encryptionLevel: 'MILITARY_GRADE',
          threatLevel: 'EXTREME'
        }
      });
    }

    // Add achievement events
    if (gameState.credits > 1000) {
      events.push({
        id: 'achievement_credits',
        timestamp: new Date(Date.now() - 60000),
        type: 'achievement',
        title: 'Credit Accumulator',
        description: 'Accumulated significant digital currency reserves',
        impact: 'high',
        icon: Zap,
        metadata: { credits: gameState.credits }
      });
    }

    // Sort events by timestamp (newest first)
    events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    setTimelineEvents(events);
  }, [gameState]);

  const filteredEvents = filterType === 'all' 
    ? timelineEvents 
    : timelineEvents.filter(event => event.type === filterType);

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'low': return 'text-green-400 border-green-400';
      case 'medium': return 'text-cyan-400 border-cyan-400';
      case 'high': return 'text-yellow-400 border-yellow-400';
      case 'critical': return 'text-red-400 border-red-400';
      default: return 'text-green-400 border-green-400';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'command': return Terminal;
      case 'mission': return Trophy;
      case 'purchase': return Cpu;
      case 'achievement': return Zap;
      case 'discovery': return Shield;
      default: return Terminal;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-black border border-green-500 rounded-lg w-full max-w-4xl h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="border-b border-green-500/50 p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Clock className="w-6 h-6 text-green-400" />
            <div>
              <h2 className="text-xl font-bold text-green-400">MEMORY TRACE</h2>
              <p className="text-sm text-green-400/70">Gameplay History Timeline</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-green-400 hover:text-green-300 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex h-full">
          {/* Timeline */}
          <div className="flex-1 p-4 overflow-y-auto terminal-scroll">
            {/* Filter Controls */}
            <div className="mb-6 flex flex-wrap gap-2">
              {['all', 'command', 'mission', 'purchase', 'achievement', 'discovery'].map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-3 py-1 border rounded text-xs uppercase transition-colors ${
                    filterType === type
                      ? 'bg-green-400 text-black border-green-400'
                      : 'text-green-400 border-green-400/50 hover:border-green-400'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            {/* Timeline Events */}
            <div className="space-y-4">
              {filteredEvents.map((event, index) => {
                const Icon = event.icon;
                return (
                  <div
                    key={event.id}
                    className="flex items-start space-x-4 cursor-pointer group"
                    onClick={() => setSelectedEvent(event)}
                  >
                    {/* Timeline Line */}
                    <div className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full border-2 ${getImpactColor(event.impact)} bg-black flex items-center justify-center group-hover:glow-green transition-all`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      {index < filteredEvents.length - 1 && (
                        <div className="w-px h-8 bg-green-400/30 mt-2" />
                      )}
                    </div>

                    {/* Event Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className={`font-semibold ${getImpactColor(event.impact).split(' ')[0]}`}>
                          {event.title}
                        </h3>
                        <span className="text-xs text-green-400/70">
                          {event.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm text-green-400/80 mb-2">{event.description}</p>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded text-xs border ${getImpactColor(event.impact)}`}>
                          {event.type.toUpperCase()}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs border ${getImpactColor(event.impact)}`}>
                          {event.impact.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredEvents.length === 0 && (
              <div className="text-center py-12">
                <Terminal className="w-12 h-12 text-green-400/50 mx-auto mb-4" />
                <p className="text-green-400/70">No events found for selected filter</p>
              </div>
            )}
          </div>

          {/* Event Details Panel */}
          {selectedEvent && (
            <div className="w-1/3 border-l border-green-500/50 p-4 bg-green-900/10">
              <div className="mb-4">
                <div className="flex items-center space-x-2 mb-2">
                  <selectedEvent.icon className={`w-6 h-6 ${getImpactColor(selectedEvent.impact).split(' ')[0]}`} />
                  <h3 className="font-bold text-green-400">{selectedEvent.title}</h3>
                </div>
                <p className="text-sm text-green-400/80 mb-4">{selectedEvent.description}</p>
                
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-green-400/70">Timestamp:</span>
                    <span className="text-green-400">{selectedEvent.timestamp.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-400/70">Type:</span>
                    <span className="text-green-400">{selectedEvent.type.toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-400/70">Impact:</span>
                    <span className={getImpactColor(selectedEvent.impact).split(' ')[0]}>
                      {selectedEvent.impact.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Metadata */}
                {selectedEvent.metadata && (
                  <div className="mt-4 pt-4 border-t border-green-500/30">
                    <h4 className="text-sm font-semibold text-green-400 mb-2">METADATA</h4>
                    <div className="space-y-1 text-xs font-mono">
                      {Object.entries(selectedEvent.metadata).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="text-green-400/70">{key}:</span>
                          <span className="text-green-400">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={() => setSelectedEvent(null)}
                className="w-full px-4 py-2 border border-green-400 text-green-400 hover:bg-green-400 hover:text-black transition-colors text-sm"
              >
                CLOSE DETAILS
              </button>
            </div>
          )}
        </div>

        {/* Stats Footer */}
        <div className="border-t border-green-500/50 p-4 bg-green-900/10">
          <div className="flex justify-between text-xs text-green-400/70">
            <span>Total Events: {timelineEvents.length}</span>
            <span>Session Duration: {Math.floor((Date.now() - (timelineEvents[timelineEvents.length - 1]?.timestamp.getTime() || Date.now())) / 60000)}m</span>
            <span>Last Activity: {timelineEvents[0]?.timestamp.toLocaleTimeString() || 'None'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}