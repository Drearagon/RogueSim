import React, { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff, Users, Activity } from 'lucide-react';

interface RealTimeSyncProps {
  websocket?: WebSocket;
  roomId?: number;
  currentUser?: {
    id: string;
    username: string;
  };
}

interface SyncStatus {
  connected: boolean;
  lastPing: number;
  roomMembers: number;
  activeOperations: string[];
}

export function RealTimeSync({ websocket, roomId, currentUser }: RealTimeSyncProps) {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    connected: false,
    lastPing: 0,
    roomMembers: 1,
    activeOperations: []
  });

  useEffect(() => {
    if (!websocket) {
      setSyncStatus(prev => ({ ...prev, connected: false }));
      return;
    }

    const handleMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'sync_status') {
          setSyncStatus(prev => ({
            ...prev,
            connected: true,
            lastPing: Date.now(),
            roomMembers: data.memberCount || 1
          }));
        } else if (data.type === 'operation_started') {
          setSyncStatus(prev => ({
            ...prev,
            activeOperations: [...prev.activeOperations, data.operation]
          }));
        } else if (data.type === 'operation_completed') {
          setSyncStatus(prev => ({
            ...prev,
            activeOperations: prev.activeOperations.filter(op => op !== data.operation)
          }));
        }
      } catch (error) {
        console.warn('Failed to parse WebSocket message:', error);
      }
    };

    const handleOpen = () => {
      setSyncStatus(prev => ({ ...prev, connected: true, lastPing: Date.now() }));
    };

    const handleClose = () => {
      setSyncStatus(prev => ({ ...prev, connected: false }));
    };

    const handleError = () => {
      setSyncStatus(prev => ({ ...prev, connected: false }));
    };

    websocket.addEventListener('message', handleMessage);
    websocket.addEventListener('open', handleOpen);
    websocket.addEventListener('close', handleClose);
    websocket.addEventListener('error', handleError);

    // Set initial status based on current WebSocket state
    if (websocket.readyState === WebSocket.OPEN) {
      setSyncStatus(prev => ({ ...prev, connected: true, lastPing: Date.now() }));
    }

    return () => {
      websocket.removeEventListener('message', handleMessage);
      websocket.removeEventListener('open', handleOpen);
      websocket.removeEventListener('close', handleClose);
      websocket.removeEventListener('error', handleError);
    };
  }, [websocket]);

  // Periodic ping to check connection
  useEffect(() => {
    if (!websocket || !syncStatus.connected) return;

    const pingInterval = setInterval(() => {
      if (websocket.readyState === WebSocket.OPEN) {
        websocket.send(JSON.stringify({
          type: 'ping',
          roomId,
          userId: currentUser?.id,
          timestamp: Date.now()
        }));
      }
    }, 30000); // Ping every 30 seconds

    return () => clearInterval(pingInterval);
  }, [websocket, syncStatus.connected, roomId, currentUser?.id]);

  const timeSinceLastPing = syncStatus.lastPing ? Date.now() - syncStatus.lastPing : 0;
  const connectionQuality = timeSinceLastPing < 10000 ? 'good' : timeSinceLastPing < 30000 ? 'fair' : 'poor';

  return (
    <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-sm rounded-lg p-3 border border-cyan-500/30">
      <div className="flex items-center space-x-3 text-sm">
        {/* Connection Status */}
        <div className="flex items-center space-x-2">
          {syncStatus.connected ? (
            <Wifi className={`w-4 h-4 ${
              connectionQuality === 'good' ? 'text-green-400' : 
              connectionQuality === 'fair' ? 'text-yellow-400' : 'text-red-400'
            }`} />
          ) : (
            <WifiOff className="w-4 h-4 text-red-400" />
          )}
          <span className={`text-xs ${syncStatus.connected ? 'text-green-400' : 'text-red-400'}`}>
            {syncStatus.connected ? 'CONNECTED' : 'OFFLINE'}
          </span>
        </div>

        {/* Room Members */}
        <div className="flex items-center space-x-1">
          <Users className="w-4 h-4 text-cyan-400" />
          <span className="text-cyan-400">{syncStatus.roomMembers}</span>
        </div>

        {/* Active Operations */}
        {syncStatus.activeOperations.length > 0 && (
          <div className="flex items-center space-x-1">
            <Activity className="w-4 h-4 text-blue-400 animate-pulse" />
            <Badge variant="outline" className="text-xs bg-blue-900/50 text-blue-400 border-blue-500/50">
              {syncStatus.activeOperations.length} active
            </Badge>
          </div>
        )}

        {/* Connection Quality Indicator */}
        {syncStatus.connected && (
          <div className="flex space-x-1">
            <div className={`w-1 h-3 rounded-full ${
              connectionQuality === 'good' ? 'bg-green-400' : 'bg-gray-600'
            }`} />
            <div className={`w-1 h-3 rounded-full ${
              connectionQuality !== 'poor' ? 'bg-green-400' : 'bg-gray-600'
            }`} />
            <div className={`w-1 h-3 rounded-full ${
              connectionQuality === 'good' ? 'bg-green-400' : 'bg-gray-600'
            }`} />
          </div>
        )}
      </div>

      {/* Last Ping Info */}
      {syncStatus.connected && syncStatus.lastPing > 0 && (
        <div className="text-xs text-gray-400 mt-1">
          Last sync: {Math.floor(timeSinceLastPing / 1000)}s ago
        </div>
      )}

      {/* Room ID */}
      {roomId && (
        <div className="text-xs text-gray-500 mt-1">
          Room #{roomId}
        </div>
      )}
    </div>
  );
}