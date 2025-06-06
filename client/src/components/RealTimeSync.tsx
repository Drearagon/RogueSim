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
    roomMembers: 0,
    activeOperations: []
  });

  useEffect(() => {
    if (!websocket) return;

    const handleMessage = (event: MessageEvent) => {
      const data = JSON.parse(event.data);
      
      switch (data.type) {
        case 'sync_status':
          setSyncStatus(prev => ({
            ...prev,
            connected: true,
            lastPing: Date.now(),
            roomMembers: data.payload.memberCount || 0
          }));
          break;
        
        case 'operation_started':
          setSyncStatus(prev => ({
            ...prev,
            activeOperations: [...prev.activeOperations, data.payload.operation]
          }));
          break;
        
        case 'operation_completed':
          setSyncStatus(prev => ({
            ...prev,
            activeOperations: prev.activeOperations.filter(op => op !== data.payload.operation)
          }));
          break;
        
        case 'pong':
          setSyncStatus(prev => ({
            ...prev,
            lastPing: Date.now()
          }));
          break;
      }
    };

    const handleOpen = () => {
      setSyncStatus(prev => ({ ...prev, connected: true }));
      
      // Send authentication and room join
      websocket.send(JSON.stringify({
        type: 'authenticate',
        payload: {
          userId: currentUser?.id,
          hackerName: (currentUser as any)?.hackerName || currentUser?.username
        }
      }));
      
      if (roomId) {
        websocket.send(JSON.stringify({
          type: 'join_room',
          payload: { roomId }
        }));
      }
    };

    const handleClose = () => {
      setSyncStatus(prev => ({ ...prev, connected: false }));
    };

    const handleError = () => {
      setSyncStatus(prev => ({ ...prev, connected: false }));
    };

    // Set up ping interval
    const pingInterval = setInterval(() => {
      if (websocket.readyState === WebSocket.OPEN) {
        websocket.send(JSON.stringify({ type: 'ping' }));
      }
    }, 30000);

    websocket.addEventListener('message', handleMessage);
    websocket.addEventListener('open', handleOpen);
    websocket.addEventListener('close', handleClose);
    websocket.addEventListener('error', handleError);

    // Check initial connection state
    if (websocket.readyState === WebSocket.OPEN) {
      handleOpen();
    }

    return () => {
      clearInterval(pingInterval);
      websocket.removeEventListener('message', handleMessage);
      websocket.removeEventListener('open', handleOpen);
      websocket.removeEventListener('close', handleClose);
      websocket.removeEventListener('error', handleError);
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