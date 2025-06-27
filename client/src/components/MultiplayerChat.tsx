// Fallback to fixed version until WebSocket issues are resolved
export { MultiplayerChat } from './MultiplayerChat_Fixed';
import { Send, MessageSquare, Users, X, Minimize2, Maximize2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { getCurrentUser } from '../lib/userStorage';

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
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [onlinePlayers, setOnlinePlayers] = useState<OnlinePlayer[]>([]);
  const [activeChannel, setActiveChannel] = useState<'global' | 'team' | 'whisper'>('global');
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'offline'>('connecting');
  const [hasShownWelcome, setHasShownWelcome] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const currentUser = user as { id?: string; username?: string; hackerName?: string } | null;

  // Get current user info for chat
  const [chatUser, setChatUser] = useState<any>(null);
  useEffect(() => {
    const loadChatUser = async () => {
      try {
        const userData = await getCurrentUser();
        setChatUser(userData);
      } catch (error) {
        console.warn('Could not load user data for chat');
      }
    };
    
    loadChatUser();
    
    // Listen for profile updates to reload user data
    const handleProfileUpdate = () => {
      loadChatUser();
    };
    
    window.addEventListener('profileUpdated', handleProfileUpdate);
    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate);
    };
  }, []);

  const getUserDisplayName = () => {
    return chatUser?.hackerName || 
           currentUser?.hackerName || 
           currentUser?.username || 
           gameState.playerId || 
           'CyberOp_' + (gameState.playerLevel || 1);
  };

  const getUserId = () => {
    return chatUser?.id || 
           currentUser?.id || 
           gameState.playerId || 
           'player_' + Date.now();
  };

  useEffect(() => {
    // Initialize WebSocket connection for real-time chat
    const initWebSocket = () => {
      try {
        const isLocalTunnel = window.location.hostname.includes('.loca.lt');
        const protocol = window.location.protocol === 'https:' || isLocalTunnel ? 'wss:' : 'ws:';

        let wsUrl;
        if (isLocalTunnel) {
          wsUrl = `${protocol}//${window.location.host}`;
        } else {
          wsUrl = 'ws://localhost:5000';
        }

        console.log(`🔌 Attempting WebSocket connection to: ${wsUrl}`);
        const socket = new WebSocket(wsUrl);

        socket.on('connect', () => {
          setConnectionStatus('connected');
          const timestamp = new Date().toISOString();
          const username = getUserDisplayName();
          
          // Log player connection
          console.log(`🔄 [${timestamp}] PLAYER_CONNECT: ${username}`);
          console.log('✅ Chat WebSocket connected to multiplayer network');
          
          // Send join message
          socket.emit('join_global_chat', {
            userId: getUserId(),
            username: username,
            level: gameState.playerLevel || 1,
            timestamp
          });

          // Show welcome message only once when first connecting
          if (!hasShownWelcome) {
            setMessages(prev => [...prev, {
              id: Date.now().toString(),
              userId: 'system',
              username: 'SYSTEM',
              message: `🌐 Connected to The Shadow Network. Welcome, ${username}! Secure communications established.`,
              timestamp: timestamp,
              type: 'system'
            }]);
            setHasShownWelcome(true);
          }
        });

        socket.on('chat_message', handleWebSocketMessage);
        socket.on('player_list_update', handleWebSocketMessage);
        socket.on('system_message', handleWebSocketMessage);
        socket.on('user_joined', handleWebSocketMessage);
        socket.on('user_left', handleWebSocketMessage);

        socket.onclose = () => {
          setConnectionStatus('offline');
          const timestamp = new Date().toISOString();
          const username = getUserDisplayName();

          console.log(`🔄 [${timestamp}] PLAYER_DISCONNECT: ${username}`);
          console.log('⚠️ Chat WebSocket connection closed');

          setTimeout(initWebSocket, 5000);
        };

        socket.onerror = (error) => {
          setConnectionStatus('offline');
          const timestamp = new Date().toISOString();
          const username = getUserDisplayName();

          console.log(`🔄 [${timestamp}] PLAYER_CONNECTION_ERROR: ${username}`);
          console.error('❌ Chat WebSocket error:', error);
        };

        setWs(socket);
      } catch (error) {
        console.log('WebSocket connection failed, using offline mode');
        setConnectionStatus('offline');
        
        // Still show welcome message in offline mode
        if (!hasShownWelcome) {
          setMessages(prev => [...prev, {
            id: Date.now().toString(),
            userId: 'system',
            username: 'SYSTEM',
            message: 'Chat initialized in offline mode. Messages will be local only.',
            timestamp: new Date().toISOString(),
            type: 'system'
          }]);
          setHasShownWelcome(true);
        }
      }
    };

    // Add a small delay before trying to connect
    setTimeout(initWebSocket, 1000);

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [chatUser, gameState.playerLevel]);

  // Listen for the multiplayer command to auto-open chat
  useEffect(() => {
    const handleOpenMultiplayerChat = () => {
      setIsOpen(true);
      setIsMinimized(false);
    };

    const handleSendChatMessage = (event: CustomEvent) => {
      const { channel, message, username, timestamp } = event.detail;
      
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        userId: getUserId(),
        username: username || getUserDisplayName(),
        message: message,
        timestamp: new Date(timestamp).toISOString(),
        type: channel === 'team' ? 'team' : 'chat'
      };

      // Add message locally
      setMessages(prev => [...prev, newMessage]);

      // Try to send via WebSocket if connected
      if (ws && connectionStatus === 'connected') {
        ws.send(JSON.stringify({
          type: 'send_message',
          message,
          channel,
          userId: getUserId(),
          username: username || getUserDisplayName()
        }));
      }

      // Auto-open chat if closed
      if (!isOpen) {
        setIsOpen(true);
        setIsMinimized(false);
      }
    };

    window.addEventListener('openMultiplayerChat', handleOpenMultiplayerChat);
    window.addEventListener('sendChatMessage', handleSendChatMessage as EventListener);
    
    return () => {
      window.removeEventListener('openMultiplayerChat', handleOpenMultiplayerChat);
      window.removeEventListener('sendChatMessage', handleSendChatMessage as EventListener);
    };
  }, [isOpen, ws, connectionStatus, chatUser]);

  const handleWebSocketMessage = (data: any) => {
    switch (data.type) {
      case 'chat_message':
        setMessages(prev => [...prev, {
          id: data.payload.id || Date.now().toString(),
          userId: data.payload.userId,
          username: data.payload.username,
          message: data.payload.message,
          timestamp: data.payload.timestamp,
          type: data.payload.messageType || 'chat'
        }]);
        break;
      
      case 'player_list_update':
        setOnlinePlayers(data.payload.players || []);
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
        
      case 'user_joined':
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          userId: 'system',
          username: 'SYSTEM',
          message: `${data.payload.username} joined the network`,
          timestamp: new Date().toISOString(),
          type: 'system'
        }]);
        break;
        
      case 'user_left':
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          userId: 'system',
          username: 'SYSTEM',
          message: `${data.payload.username} left the network`,
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
      userId: getUserId(),
      username: getUserDisplayName(),
      message: currentInput.trim(),
      timestamp: new Date().toISOString(),
      type: activeChannel === 'team' ? 'team' : 'chat'
    };

    // Add message locally first
    setMessages(prev => [...prev, newMessage]);

    // Try to send via WebSocket if connected
    if (ws && connectionStatus === 'connected') {
      ws.send(JSON.stringify({
        type: 'send_message',
        message: currentInput.trim(),
        channel: activeChannel,
        userId: getUserId(),
        username: getUserDisplayName()
      }));
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
            {messages.length === 0 ? (
              <div 
                className="text-center opacity-60 mt-8"
                style={{ color: terminalSettings.textColor }}
              >
                No messages yet. Start a conversation!
              </div>
            ) : (
              messages
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
                ))
            )}
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
              {onlinePlayers.length === 0 ? (
                <div 
                  className="text-xs opacity-60"
                  style={{ color: terminalSettings.textColor }}
                >
                  No other players online
                </div>
              ) : (
                onlinePlayers.map((player) => (
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
                ))
              )}
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
                placeholder={`Type your message to ${activeChannel}...`}
                className="flex-1 bg-transparent border rounded px-2 py-1 outline-none text-xs font-mono placeholder:opacity-50"
                style={{ 
                  color: terminalSettings.textColor,
                  borderColor: `${terminalSettings.primaryColor}40`,
                  backgroundColor: `${terminalSettings.backgroundColor}40`
                }}
                maxLength={200}
                autoComplete="off"
              />
              <button
                onClick={sendMessage}
                disabled={!currentInput.trim()}
                className="p-1 hover:opacity-80 transition-opacity disabled:opacity-30"
                title="Send message (Enter)"
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