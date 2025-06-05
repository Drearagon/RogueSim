// Offline chat system for independent deployment
interface ChatMessage {
  id: string;
  username: string;
  message: string;
  timestamp: number;
  channel: 'global' | 'team';
}

interface ChatUser {
  id: string;
  username: string;
  status: 'online' | 'away' | 'busy';
  lastSeen: number;
}

class OfflineChatSystem {
  private messages: ChatMessage[] = [];
  private users: ChatUser[] = [];
  private listeners: ((messages: ChatMessage[]) => void)[] = [];

  constructor() {
    this.loadFromStorage();
    this.initializeMockUsers();
  }

  private loadFromStorage() {
    const stored = localStorage.getItem('chatMessages');
    if (stored) {
      this.messages = JSON.parse(stored);
    }
  }

  private saveToStorage() {
    localStorage.setItem('chatMessages', JSON.stringify(this.messages));
  }

  private initializeMockUsers() {
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    this.users = [
      {
        id: 'current',
        username: currentUser.hackerName || 'CyberOp_100',
        status: 'online',
        lastSeen: Date.now()
      },
      {
        id: 'ai_ghost',
        username: 'Ghost_Protocol',
        status: 'online',
        lastSeen: Date.now() - 60000
      },
      {
        id: 'ai_cipher',
        username: 'CipherMaster',
        status: 'away',
        lastSeen: Date.now() - 300000
      },
      {
        id: 'ai_nexus',
        username: 'NexusHawk',
        status: 'busy',
        lastSeen: Date.now() - 120000
      }
    ];
  }

  sendMessage(message: string, channel: 'global' | 'team' = 'global'): ChatMessage {
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const chatMessage: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      username: currentUser.hackerName || 'CyberOp_100',
      message,
      timestamp: Date.now(),
      channel
    };

    this.messages.push(chatMessage);
    this.saveToStorage();
    this.notifyListeners();

    // Simulate AI responses for realistic chat experience
    if (Math.random() < 0.3) {
      setTimeout(() => this.generateAIResponse(channel), 1000 + Math.random() * 3000);
    }

    return chatMessage;
  }

  private generateAIResponse(channel: 'global' | 'team') {
    const responses = [
      "Anyone know about the new security protocols on sector 7?",
      "Just cracked the quantum encryption on that corp server 💀",
      "Need backup on this distributed attack, anyone available?",
      "The neural net patterns are getting more sophisticated...",
      "Found some interesting vulnerabilities in the mesh network",
      "Ghost in the shell vibes tonight, stay sharp",
      "New firmware update broke my favorite exploit 😤",
      "Anyone else notice increased ICE activity lately?",
      "Running deep scans on the corporate infrastructure",
      "The AI countermeasures are adapting faster than expected"
    ];

    const aiUsers = this.users.filter(u => u.id !== 'current');
    const randomUser = aiUsers[Math.floor(Math.random() * aiUsers.length)];
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];

    const aiMessage: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      username: randomUser.username,
      message: randomResponse,
      timestamp: Date.now(),
      channel
    };

    this.messages.push(aiMessage);
    this.saveToStorage();
    this.notifyListeners();
  }

  getMessages(channel?: 'global' | 'team', limit: number = 50): ChatMessage[] {
    let filtered = this.messages;
    if (channel) {
      filtered = this.messages.filter(m => m.channel === channel);
    }
    return filtered.slice(-limit).sort((a, b) => a.timestamp - b.timestamp);
  }

  getUsers(): ChatUser[] {
    return this.users;
  }

  onMessagesUpdate(callback: (messages: ChatMessage[]) => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.messages));
  }

  clearMessages() {
    this.messages = [];
    this.saveToStorage();
    this.notifyListeners();
  }
}

export const offlineChat = new OfflineChatSystem();