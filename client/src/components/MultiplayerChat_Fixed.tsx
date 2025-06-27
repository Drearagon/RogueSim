import React, { useState, useEffect, useRef } from 'react';
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
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'offline'>('offline');
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
           'offline_' + Math.random().toString(36).substr(2, 9);
  };

  // Initialize WebSocket connection (simplified fallback version)
  useEffect(() => {
    // Show welcome message in offline mode
    if (!hasShownWelcome) {
      setMessages([{
        id: Date.now().toString(),
        userId: 'system',
        username: 'SYSTEM',
        message: 'Chat initialized in offline mode. Messages will be local only.',
        timestamp: new Date().toISOString(),
        type: 'system'
      }]);
      setHasShownWelcome(true);
    }

    // Listen for chat events
    const handleOpenMultiplayerChat = () => {
      setIsOpen(true);
      setIsMinimized(false);
    };

    const handleSendChatMessage = (event: CustomEvent) => {
      const { message, username, channel } = event.detail;
      
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        userId: getUserId(),
        username: username || getUserDisplayName(),
        message: message,
        timestamp: new Date().toISOString(),
        type: 'chat'
      };

      // Add message locally
      setMessages(prev => [...prev, newMessage]);

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
  }, [isOpen, chatUser]);

  const sendMessage = () => {
    if (!currentInput.trim()) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      userId: getUserId(),
      username: getUserDisplayName(),
      message: currentInput.trim(),
      timestamp: new Date().toISOString(),
      type: activeChannel as 'chat' | 'team'
    };

    // Add message locally
    setMessages(prev => [...prev, newMessage]);
    setCurrentInput('');

    // Auto-scroll to bottom
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Auto-scroll to bottom when new messages arrive
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
          <div className={`w-2 h-2 rounded-full ${connectionStatus === 'connected' ? 'bg-green-400' : 'bg-red-400'}`} />
        </div>
        <div className="flex items-center space-x-1">
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
            {(['global', 'team'] as const).map((channel) => (
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

          {/* Messages */}
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

          {/* Input */}
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
          </div>
        </>
      )}
    </div>
  );
}