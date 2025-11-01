import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { Send, MessageSquare, Users, X, Minimize2, Maximize2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { getCurrentUser } from '../lib/userStorage';
import { OnlinePlayer } from '../types/game';
import { FriendListPanel } from './FriendListPanel';

interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  message: string;
  timestamp: string;
  type: 'chat' | 'system' | 'team';
  channel?: 'global' | 'team';
}

interface MultiplayerChatProps {
  gameState: any;
  terminalSettings: {
    primaryColor: string;
    backgroundColor: string;
    textColor: string;
  };
}

const CHAT_PATH = '/ws';
const MAX_MESSAGE_LENGTH = 500;

export function MultiplayerChat({ gameState, terminalSettings }: MultiplayerChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [currentInput, setCurrentInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [onlinePlayers, setOnlinePlayers] = useState<OnlinePlayer[]>([]);
  const [activeChannel, setActiveChannel] = useState<'global' | 'team' | 'whisper' | 'friends'>('global');
  const [friendPresence, setFriendPresence] = useState<Record<string, { username: string; online: boolean }>>({});
  const [friendRefreshCounter, setFriendRefreshCounter] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'offline'>('offline');
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isOpenRef = useRef(isOpen);
  const fallbackUserIdRef = useRef(`offline_${Math.random().toString(36).slice(2)}`);
  const fallbackUsernameRef = useRef(
    gameState?.username ||
    gameState?.playerId ||
    `CyberOp_${Math.floor(Math.random() * 900 + 100)}`
  );
  const connectionErrorNotifiedRef = useRef(false);
  const userIdRef = useRef(fallbackUserIdRef.current);
  const usernameRef = useRef(fallbackUsernameRef.current);

  const { user } = useAuth();
  const authUser = user as { id?: string; username?: string; hackerName?: string } | null;

  // Load current user info for chat context
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

    const handleProfileUpdate = () => {
      loadChatUser();
    };

    window.addEventListener('profileUpdated', handleProfileUpdate);
    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate);
    };
  }, []);

  const stableUserId = useMemo(
    () => chatUser?.id || authUser?.id || fallbackUserIdRef.current,
    [chatUser?.id, authUser?.id]
  );
  const stableUsername = useMemo(
    () => chatUser?.hackerName || authUser?.hackerName || authUser?.username || fallbackUsernameRef.current,
    [chatUser?.hackerName, authUser?.hackerName, authUser?.username]
  );
  const lastAuthPayloadRef = useRef({ userId: stableUserId, username: stableUsername });

  userIdRef.current = stableUserId;
  usernameRef.current = stableUsername;

  useEffect(() => {
    const socket = socketRef.current;
    const lastPayload = lastAuthPayloadRef.current;

    if (lastPayload.userId === stableUserId && lastPayload.username === stableUsername) {
      return;
    }

    lastAuthPayloadRef.current = { userId: stableUserId, username: stableUsername };

    if (socket?.connected) {
      socket.emit('authenticate', {
        userId: stableUserId,
        hackerName: stableUsername,
      });
    }
  }, [stableUserId, stableUsername]);

  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  const addMessage = useCallback((message: ChatMessage) => {
    setMessages(prev => [...prev.slice(-199), message]);
  }, []);

  useEffect(() => {
    const handleFriendRefresh = () => {
      setFriendRefreshCounter(prev => prev + 1);
    };

    window.addEventListener('friendDataShouldRefresh', handleFriendRefresh);
    return () => window.removeEventListener('friendDataShouldRefresh', handleFriendRefresh);
  }, []);

  // Establish socket connection
  useEffect(() => {
    const socket = io('/', {
      path: CHAT_PATH,
      withCredentials: true,
      transports: ['websocket'],
      autoConnect: true,
    });

    socketRef.current = socket;
    setConnectionStatus('connecting');

    const handleConnect = () => {
      connectionErrorNotifiedRef.current = false;
      setConnectionStatus('connected');
      socket.emit('join_channel', { channel: 'global' });
      socket.emit('authenticate', {
        userId: userIdRef.current,
        hackerName: usernameRef.current,
      });
    };

    const handleDisconnect = () => {
      setConnectionStatus('offline');
    };

    const handleConnectError = () => {
      setConnectionStatus('offline');
      if (!connectionErrorNotifiedRef.current) {
        addMessage({
          id: Date.now().toString(),
          userId: 'system',
          username: 'SYSTEM',
          message: 'Unable to connect to the Shadow Network chat server. Messages will stay local until reconnected.',
          timestamp: new Date().toISOString(),
          type: 'system',
        });
        connectionErrorNotifiedRef.current = true;
      }
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect_error', handleConnectError);
    socket.io.on('reconnect_attempt', () => setConnectionStatus('connecting'));
    socket.io.on('reconnect', () => {
      connectionErrorNotifiedRef.current = false;
      setConnectionStatus('connected');
      socket.emit('authenticate', {
        userId: userIdRef.current,
        hackerName: usernameRef.current,
      });
    });

    socket.on('system_message', (payload: any) => {
      addMessage({
        id: payload.id || Date.now().toString(),
        userId: 'system',
        username: 'SYSTEM',
        message: payload.message,
        timestamp: payload.timestamp || new Date().toISOString(),
        type: 'system',
      });
    });

    socket.on('authenticated', (payload: any) => {
      addMessage({
        id: payload.id || Date.now().toString(),
        userId: 'system',
        username: 'SYSTEM',
        message: `Secure channel established as ${payload.username || usernameRef.current}.`,
        timestamp: payload.timestamp || new Date().toISOString(),
        type: 'system',
      });
    });

    socket.on('chat_message', (payload: any) => {
      addMessage({
        id: payload.id,
        userId: payload.userId,
        username: payload.username,
        message: payload.message,
        timestamp: payload.timestamp,
        type: payload.messageType === 'team' ? 'team' : 'chat',
        channel: payload.channel || 'global',
      });

      if (!isOpenRef.current && payload.userId !== userIdRef.current) {
        setIsOpen(true);
        setIsMinimized(false);
      }
    });

    socket.on('user_joined', (payload: any) => {
      addMessage({
        id: payload.id || Date.now().toString(),
        userId: 'system',
        username: 'SYSTEM',
        message: `${payload.username || 'Agent'} linked to the grid.`,
        timestamp: payload.timestamp || new Date().toISOString(),
        type: 'system',
      });
    });

    socket.on('user_left', (payload: any) => {
      addMessage({
        id: payload.id || Date.now().toString(),
        userId: 'system',
        username: 'SYSTEM',
        message: `${payload.username || 'Agent'} disengaged from the network.`,
        timestamp: payload.timestamp || new Date().toISOString(),
        type: 'system',
      });
    });

    socket.on('online_users', (users: any[]) => {
      const normalizedPlayers: OnlinePlayer[] = users.map((player) => ({
        id: player.id,
        username: player.username,
        status: (player.status as OnlinePlayer['status']) || 'online',
        level: typeof player.level === 'number' ? player.level : undefined,
      }));

      setOnlinePlayers(normalizedPlayers);

      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent<OnlinePlayer[]>('onlinePlayersUpdated', {
            detail: normalizedPlayers,
          })
        );
      }
    });

    socket.on('friends_online', (friends: any[]) => {
      setFriendPresence(prev => {
        const updated: Record<string, { username: string; online: boolean }> = {};

        friends.forEach((friend) => {
          if (friend?.userId) {
            updated[friend.userId] = {
              username: friend.username || prev[friend.userId]?.username || 'Agent',
              online: true,
            };
          }
        });

        Object.keys(prev).forEach((userId) => {
          if (!updated[userId]) {
            updated[userId] = {
              username: prev[userId]?.username || 'Agent',
              online: false,
            };
          }
        });

        return updated;
      });

      setFriendRefreshCounter(prev => prev + 1);
    });

    socket.on('friend_online', (payload: any) => {
      if (!payload?.userId) return;
      setFriendPresence(prev => ({
        ...prev,
        [payload.userId]: {
          username: payload.username || prev[payload.userId]?.username || 'Agent',
          online: true,
        },
      }));
    });

    socket.on('friend_offline', (payload: any) => {
      if (!payload?.userId) return;
      setFriendPresence(prev => ({
        ...prev,
        [payload.userId]: {
          username: payload.username || prev[payload.userId]?.username || 'Agent',
          online: false,
        },
      }));
    });

    return () => {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent<OnlinePlayer[]>('onlinePlayersUpdated', {
            detail: [],
          })
        );
      }

      socket.removeAllListeners();
      socket.disconnect();
      socketRef.current = null;
    };
  }, [addMessage]);

  const emitChatMessage = useCallback((message: string, channel?: 'global' | 'team') => {
    const trimmed = (message || '').trim();
    if (!trimmed) return;

    const socket = socketRef.current;
    if (socket && connectionStatus === 'connected') {
      socket.emit('send_message', {
        message: trimmed.slice(0, MAX_MESSAGE_LENGTH),
        channel: channel || (activeChannel === 'whisper' ? 'global' : activeChannel),
      });
    } else {
      addMessage({
        id: Date.now().toString(),
        userId: 'system',
        username: 'SYSTEM',
        message: 'Unable to send message — chat is offline. We will retry once the connection returns.',
        timestamp: new Date().toISOString(),
        type: 'system',
      });
    }
  }, [activeChannel, connectionStatus, addMessage]);

  useEffect(() => {
    const handleOpenMultiplayerChat = () => {
      setIsOpen(true);
      setIsMinimized(false);
    };

    const handleSendChatMessage = (event: Event) => {
      const detail = (event as CustomEvent<{ message: string; channel?: 'global' | 'team'; username?: string }>).detail;
      if (!detail?.message) return;

      emitChatMessage(detail.message, detail.channel);

      if (!isOpenRef.current) {
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
  }, [emitChatMessage]);

  const sendMessage = () => {
    if (activeChannel === 'friends') return;
    if (!currentInput.trim()) return;
    emitChatMessage(currentInput);
    setCurrentInput('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (activeChannel === 'friends') {
      return;
    }

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 rounded-lg p-3 backdrop-blur-sm transition-all duration-200 group z-40"
        style={{
          backgroundColor: `${terminalSettings.primaryColor}20`,
          borderColor: `${terminalSettings.primaryColor}50`,
        }}
      >
        <MessageSquare className="w-6 h-6 text-cyan-400" style={{ color: terminalSettings.primaryColor }} />
        <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {messages.filter(m => m.type !== 'system').length}
        </div>
      </button>
    );
  }

  const statusIndicatorClass = connectionStatus === 'connected'
    ? 'bg-green-400'
    : connectionStatus === 'connecting'
      ? 'bg-yellow-400 animate-pulse'
      : 'bg-red-500';

  return (
    <div
      className={`fixed bottom-4 right-4 bg-black/90 border rounded-lg backdrop-blur-md transition-all duration-300 z-40 ${
        isMinimized ? 'h-12' : 'h-96'
      } w-80`}
      style={{
        backgroundColor: `${terminalSettings.backgroundColor}cc`,
        borderColor: `${terminalSettings.primaryColor}50`,
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between p-3 border-b cursor-pointer"
        style={{ borderColor: `${terminalSettings.primaryColor}30` }}
        onClick={() => setIsMinimized(!isMinimized)}
      >
        <div className="flex items-center space-x-2">
          <MessageSquare className="w-4 h-4" style={{ color: terminalSettings.primaryColor }} />
          <span className="text-sm font-medium" style={{ color: terminalSettings.textColor }}>
            Shadow Network
          </span>
          <div className={`w-2 h-2 rounded-full ${statusIndicatorClass}`} />
        </div>
        <div className="flex items-center space-x-2 text-xs text-gray-400">
          <div className="flex items-center space-x-1">
            <Users className="w-3 h-3" />
            <span>{onlinePlayers.length}</span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsMinimized(!isMinimized);
            }}
            className="p-1 hover:bg-gray-700 rounded"
          >
            {isMinimized ? <Maximize2 className="w-3 h-3" /> : <Minimize2 className="w-3 h-3" />}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
            }}
            className="p-1 hover:bg-gray-700 rounded"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Channel tabs */}
          <div className="flex border-b" style={{ borderColor: `${terminalSettings.primaryColor}30` }}>
            {(['global', 'team', 'friends'] as const).map((channel) => (
              <button
                key={channel}
                onClick={() => setActiveChannel(channel)}
                className={`px-3 py-2 text-xs font-medium transition-colors ${
                  activeChannel === channel
                    ? 'border-b-2'
                    : 'hover:bg-gray-700/50'
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

          {activeChannel === 'friends' ? (
            <FriendListPanel
              isVisible={activeChannel === 'friends'}
              terminalSettings={terminalSettings}
              presenceMap={friendPresence}
              refreshSignal={friendRefreshCounter}
            />
          ) : (
            <>
              <div className="flex-1 overflow-y-auto p-2 space-y-2 h-64">
                {messages.map((msg) => (
                  <div key={msg.id} className="text-xs">
                    <div className="flex items-start space-x-2">
                      <span
                        className="font-medium shrink-0"
                        style={{
                          color: msg.type === 'system' ? '#fbbf24' : terminalSettings.primaryColor
                        }}
                      >
                        [{new Date(msg.timestamp).toLocaleTimeString()}] {msg.username}:
                      </span>
                      <span style={{ color: terminalSettings.textColor }} className="break-words">
                        {msg.message}
                      </span>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-2 border-t" style={{ borderColor: `${terminalSettings.primaryColor}30` }}>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={currentInput}
                    onChange={(e) => setCurrentInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={`Message ${activeChannel}...`}
                    className="flex-1 bg-transparent border rounded px-2 py-1 text-xs focus:outline-none focus:ring-1"
                    style={{
                      color: terminalSettings.textColor,
                      borderColor: `${terminalSettings.primaryColor}50`,
                      backgroundColor: `${terminalSettings.backgroundColor}80`
                    }}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!currentInput.trim()}
                    className="p-1 rounded hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-4 h-4" style={{ color: terminalSettings.primaryColor }} />
                  </button>
                </div>
                {connectionStatus !== 'connected' && (
                  <p className="mt-2 text-[10px] text-gray-400">
                    Chat is offline. Messages will send automatically once the secure channel is restored.
                  </p>
                )}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
