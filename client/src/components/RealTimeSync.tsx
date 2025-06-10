import React, { useEffect, useState } from 'react';
import type { Socket } from 'socket.io-client';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff, Users, Activity } from 'lucide-react';

interface RealTimeSyncProps {
  websocket?: Socket;
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
    roomMembers: 0,
    activeOperations: []
  });

  useEffect(() => {
    if (!websocket) return;

    const handleSyncStatus = (data: any) => {
      setSyncStatus(prev => ({
        ...prev,
        connected: true,
        lastPing: Date.now(),
        roomMembers: data.memberCount || 0
      }));
    };

    const handleOperationStarted = (data: any) => {
      setSyncStatus(prev => ({
        ...prev,
        activeOperations: [...prev.activeOperations, data.operation]
      }));
    };

    const handleOperationCompleted = (data: any) => {
      setSyncStatus(prev => ({
        ...prev,
        activeOperations: prev.activeOperations.filter(op => op !== data.operation)
      }));
    };

    const handlePong = () => {
      setSyncStatus(prev => ({
        ...prev,
        lastPing: Date.now()
      }));
    };

    const handleConnect = () => {
      setSyncStatus(prev => ({ ...prev, connected: true }));
      websocket.emit('authenticate', {
        userId: currentUser?.id,
        hackerName: (currentUser as any)?.hackerName || currentUser?.username
      });
      if (roomId) {
        websocket.emit('join_room', { roomId });
      }
    };

    const handleDisconnect = () => {
      setSyncStatus(prev => ({ ...prev, connected: false }));
    };

    const pingInterval = setInterval(() => {
      websocket.emit('ping');
    }, 30000);

    websocket.on('sync_status', handleSyncStatus);
    websocket.on('operation_started', handleOperationStarted);
    websocket.on('operation_completed', handleOperationCompleted);
    websocket.on('pong', handlePong);
    websocket.on('connect', handleConnect);
    websocket.on('disconnect', handleDisconnect);

    if (websocket.connected) {
      handleConnect();
    }

    return () => {
      clearInterval(pingInterval);
      websocket.off('sync_status', handleSyncStatus);
      websocket.off('operation_started', handleOperationStarted);
      websocket.off('operation_completed', handleOperationCompleted);
      websocket.off('pong', handlePong);
      websocket.off('connect', handleConnect);
      websocket.off('disconnect', handleDisconnect);
    };
  }, [websocket, roomId, currentUser]);

  if (!roomId) return null;

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="bg-black border border-green-400 rounded-lg p-3 min-w-64">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-mono text-green-400">SYNC STATUS</span>
          <div className="flex items-center gap-2">
            {syncStatus.connected ? (
              <Wifi className="h-4 w-4 text-green-400" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-400" />
            )}
            <Badge 
              className={`text-xs ${
                syncStatus.connected 
                  ? 'bg-green-400/20 text-green-400 border-green-400' 
                  : 'bg-red-400/20 text-red-400 border-red-400'
              }`}
            >
              {syncStatus.connected ? 'ONLINE' : 'OFFLINE'}
            </Badge>
          </div>
        </div>
        
        <div className="space-y-1 text-xs text-green-400/70">
          <div className="flex items-center justify-between">
            <span>Room:</span>
            <span className="text-green-400">#{roomId}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span>Members:</span>
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              <span className="text-green-400">{syncStatus.roomMembers}</span>
            </div>
          </div>
          
          {syncStatus.activeOperations.length > 0 && (
            <div className="flex items-center justify-between">
              <span>Active Ops:</span>
              <div className="flex items-center gap-1">
                <Activity className="h-3 w-3 text-yellow-400" />
                <span className="text-yellow-400">{syncStatus.activeOperations.length}</span>
              </div>
            </div>
          )}
          
          {syncStatus.connected && (
            <div className="flex items-center justify-between">
              <span>Last Ping:</span>
              <span className="text-green-400">
                {Math.floor((Date.now() - syncStatus.lastPing) / 1000)}s ago
              </span>
            </div>
          )}
        </div>
        
        {syncStatus.activeOperations.length > 0 && (
          <div className="mt-2 pt-2 border-t border-green-400/30">
            <div className="text-xs text-green-400/70 mb-1">Active Operations:</div>
            {syncStatus.activeOperations.slice(0, 3).map((op, index) => (
              <div key={index} className="text-xs text-yellow-400 truncate">
                • {op}
              </div>
            ))}
            {syncStatus.activeOperations.length > 3 && (
              <div className="text-xs text-green-400/70">
                +{syncStatus.activeOperations.length - 3} more...
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}