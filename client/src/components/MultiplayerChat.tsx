import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare, Users, X, Minimize2, Maximize2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  message: string;
  timestamp: string;
  type: 'chat' | 'system' | 'team';
}

interface OnlinePlayer {
  id: string;
  username: string;
  level: number;
  status: 'online' | 'in-mission' | 'away';
  currentMission?: string;
}

interface MultiplayerChatProps {
  gameState: any;
  terminalSettings: {
    primaryColor: string;
    backgroundColor: string;
    textColor: string;
  };
}

export function MultiplayerChat({ gameState, terminalSettings }: MultiplayerChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [currentInput, setCurrentInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      userId: 'system',
      username: 'NETWORK',
      message: 'Welcome to The Shadow Network. Secure communications established.',
      timestamp: new Date().toISOString(),
      type: 'system'
    },
    {
      id: '2',
      userId: 'ghost_hacker',
      username: 'Ghost_Hacker',
      message: 'Anyone up for a corp infiltration mission?',
      timestamp: new Date(Date.now() - 300000).toISOString(),
      type: 'chat'
    },
    {
      id: '3',
      userId: 'socialeng_x',
      username: 'SocialEng_X',
      message: 'I can provide social engineering support',
      timestamp: new Date(Date.now() - 180000).toISOString(),
      type: 'team'
    }
  ]);
  const [onlinePlayers, setOnlinePlayers] = useState<OnlinePlayer[]>([
    {
      id: 'ghost_hacker',
      username: 'Ghost_Hacker',
      level: 15,
      status: 'online',
      currentMission: undefined
    },
    {
      id: 'socialeng_x',
      username: 'SocialEng_X',
      level: 8,
      status: 'online',
      currentMission: undefined
    },
    {
      id: 'data_miner',
      username: 'Data_Miner',
      level: 20,
      status: 'in-mission',
      currentMission: 'Corp Database Raid'
    },
    {
      id: 'zeroday_kid',
      username: 'ZeroDay_Kid',
      level: 5,
      status: 'away',
      currentMission: undefined
    }
  ]);
  const [activeChannel, setActiveChannel] = useState<'global' | 'team' | 'whisper'>('global');
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'offline'>('connecting');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  useEffect(() => {
    // Initialize WebSocket connection for real-time chat
    const initWebSocket = () => {
      try {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/ws`;
        const websocket = new WebSocket(wsUrl);

        websocket.onopen = () => {
          setConnectionStatus('connected');
          websocket.send(JSON.stringify({
            type: 'join_global_chat',
            payload: {
              userId: user?.id || 'guest_' + Date.now(),
              username: user?.username || 'Guest',
              level: gameState.playerLevel || 1
            }
          }));
        };

        websocket.onmessage = (event) => {
          const data = JSON.parse(event.data);
          handleWebSocketMessage(data);
        };

        websocket.onclose = () => {
          setConnectionStatus('offline');
          // Try to reconnect after 5 seconds
          setTimeout(initWebSocket, 5000);
        };

        websocket.onerror = () => {
          setConnectionStatus('offline');
        };

        setWs(websocket);
      } catch (error) {
        console.log('WebSocket connection failed, using offline mode');
        setConnectionStatus('offline');
      }
    };

    // Add a small delay before trying to connect
    setTimeout(initWebSocket, 1000);

    return () => {
      if (ws) ws.close();
    };
  }, [user, gameState.playerLevel]);

  // Listen for the multiplayer command to auto-open chat
  useEffect(() => {
    const handleOpenMultiplayerChat = () => {
      setIsOpen(true);
      setIsMinimized(false);
    };

    window.addEventListener('openMultiplayerChat', handleOpenMultiplayerChat);
    return () => {
      window.removeEventListener('openMultiplayerChat', handleOpenMultiplayerChat);
    };
  }, []);

  const handleWebSocketMessage = (data: any) => {
    switch (data.type) {
      case 'chat_message':
        setMessages(prev => [...prev, {
          id: data.payload.id,
          userId: data.payload.userId,
          username: data.payload.username,
          message: data.payload.message,
          timestamp: data.payload.timestamp,
          type: data.payload.messageType || 'chat'
        }]);
        break;
      
      case 'player_list_update':
        setOnlinePlayers(data.payload.players);
        break;
      
      case 'system_message':
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          userId: 'system',
          username: 'SYSTEM',
          message: data.payload.message,
          timestamp: new Date().toISOString(),
          type: 'system'
        }]);
        break;
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!currentInput.trim()) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      userId: user?.id || 'player_1',
      username: user?.username || 'CyberOp_' + (gameState.playerLevel || 1),
      message: currentInput.trim(),
      timestamp: new Date().toISOString(),
      type: activeChannel === 'team' ? 'team' : 'chat'
    };

    // Add message locally first
    setMessages(prev => [...prev, newMessage]);

    // Try to send via WebSocket if connected
    if (ws && connectionStatus === 'connected') {
      const message = {
        type: 'send_message',
        payload: {
          message: currentInput.trim(),
          channel: activeChannel,
          userId: user?.id || 'player_1',
          username: user?.username || 'CyberOp_' + (gameState.playerLevel || 1)
        }
      };
      ws.send(JSON.stringify(message));
    }

    setCurrentInput('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getMessageTypeColor = (type: string) => {
    switch (type) {
      case 'system': return '#ff6b6b';
      case 'team': return '#4ecdc4';
      default: return terminalSettings.textColor;
    }
  };

  const getPlayerStatusColor = (status: string) => {
    switch (status) {
      case 'online': return '#4ade80';
      case 'in-mission': return '#f59e0b';
      case 'away': return '#6b7280';
      default: return terminalSettings.primaryColor;
    }
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 left-4 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className="bg-black/80 backdrop-blur-sm border rounded-full p-3 hover:opacity-80 transition-opacity"
          style={{
            borderColor: terminalSettings.primaryColor,
            color: terminalSettings.primaryColor
          }}
        >
          <MessageSquare className="w-6 h-6" />
          {messages.length > 0 && (
            <div 
              className="absolute -top-2 -right-2 w-5 h-5 rounded-full text-xs flex items-center justify-center"
              style={{ backgroundColor: terminalSettings.primaryColor, color: terminalSettings.backgroundColor }}
            >
              {messages.slice(-9).length}
            </div>
          )}
        </button>
      </div>
    );
  }

  return (
    <div 
      className={`fixed bottom-4 left-4 z-50 bg-black/90 backdrop-blur-sm border rounded-lg shadow-2xl transition-all duration-300 ${
        isMinimized ? 'h-12' : 'h-96 w-80'
      }`}
      style={{
        borderColor: terminalSettings.primaryColor,
        boxShadow: `0 0 20px ${terminalSettings.primaryColor}20`
      }}
    >
      {/* Header */}
      <div 
        className="flex items-center justify-between p-3 border-b cursor-pointer"
        style={{ borderColor: `${terminalSettings.primaryColor}40` }}
        onClick={() => setIsMinimized(!isMinimized)}
      >
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4" style={{ color: terminalSettings.primaryColor }} />
          <span className="text-sm font-mono" style={{ color: terminalSettings.textColor }}>
            Multiplayer Chat
          </span>
          <div className="flex items-center gap-1">
            <div 
              className="w-2 h-2 rounded-full"
              style={{ 
                backgroundColor: connectionStatus === 'connected' ? '#4ade80' : 
                               connectionStatus === 'connecting' ? '#f59e0b' : '#ef4444'
              }}
            />
            <Users className="w-3 h-3" style={{ color: terminalSettings.primaryColor }} />
            <span className="text-xs" style={{ color: terminalSettings.textColor }}>
              {onlinePlayers.length}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsMinimized(!isMinimized);
            }}
            className="p-1 hover:opacity-80 transition-opacity"
          >
            {isMinimized ? (
              <Maximize2 className="w-4 h-4" style={{ color: terminalSettings.primaryColor }} />
            ) : (
              <Minimize2 className="w-4 h-4" style={{ color: terminalSettings.primaryColor }} />
            )}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
            }}
            className="p-1 hover:opacity-80 transition-opacity"
          >
            <X className="w-4 h-4" style={{ color: terminalSettings.primaryColor }} />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Channel Tabs */}
          <div className="flex border-b" style={{ borderColor: `${terminalSettings.primaryColor}40` }}>
            {(['global', 'team'] as const).map((channel) => (
              <button
                key={channel}
                onClick={() => setActiveChannel(channel)}
                className={`px-3 py-2 text-xs font-mono transition-colors ${
                  activeChannel === channel ? 'border-b-2' : 'hover:opacity-80'
                }`}
                style={{
                  color: activeChannel === channel ? terminalSettings.primaryColor : terminalSettings.textColor,
                  borderColor: activeChannel === channel ? terminalSettings.primaryColor : 'transparent'
                }}
              >
                {channel.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Messages Area */}
          <div className="flex-1 h-48 overflow-y-auto p-2 text-xs font-mono space-y-1">
            {messages
              .filter(msg => activeChannel === 'global' || msg.type === activeChannel)
              .map((msg) => (
                <div key={msg.id} className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span 
                      className="text-xs opacity-60"
                      style={{ color: terminalSettings.textColor }}
                    >
                      {new Date(msg.timestamp).toLocaleTimeString('en-US', { hour12: false })}
                    </span>
                    <span 
                      className="font-bold"
                      style={{ color: getMessageTypeColor(msg.type) }}
                    >
                      {msg.username}:
                    </span>
                  </div>
                  <div 
                    className="ml-4 break-words"
                    style={{ color: terminalSettings.textColor }}
                  >
                    {msg.message}
                  </div>
                </div>
              ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Online Players Panel */}
          <div 
            className="border-t p-2"
            style={{ borderColor: `${terminalSettings.primaryColor}40` }}
          >
            <div className="text-xs mb-2" style={{ color: terminalSettings.primaryColor }}>
              Online Players ({onlinePlayers.length})
            </div>
            <div className="max-h-16 overflow-y-auto space-y-1">
              {onlinePlayers.map((player) => (
                <div key={player.id} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: getPlayerStatusColor(player.status) }}
                    />
                    <span style={{ color: terminalSettings.textColor }}>
                      {player.username}
                    </span>
                    <span 
                      className="opacity-60"
                      style={{ color: terminalSettings.textColor }}
                    >
                      Lv.{player.level}
                    </span>
                  </div>
                  {player.currentMission && (
                    <span 
                      className="text-xs opacity-80"
                      style={{ color: terminalSettings.primaryColor }}
                    >
                      {player.currentMission}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Input Area */}
          <div 
            className="border-t p-2"
            style={{ borderColor: `${terminalSettings.primaryColor}40` }}
          >
            <div className="flex gap-2">
              <input
                type="text"
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder={`Message ${activeChannel}...`}
                className="flex-1 bg-transparent border-none outline-none text-xs font-mono"
                style={{ color: terminalSettings.textColor }}
                maxLength={200}
              />
              <button
                onClick={sendMessage}
                disabled={!currentInput.trim()}
                className="p-1 hover:opacity-80 transition-opacity disabled:opacity-30"
              >
                <Send className="w-4 h-4" style={{ color: terminalSettings.primaryColor }} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
} 