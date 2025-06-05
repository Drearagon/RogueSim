import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Users, MessageSquare, Trophy, Settings, Copy, User, Crown } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface Room {
  id: number;
  name: string;
  roomCode: string;
  hostUserId: string;
  gameMode: string;
  maxPlayers: number;
  currentPlayers: number;
  isActive: boolean;
}

interface RoomMember {
  id: number;
  roomId: number;
  userId: string;
  role: 'host' | 'member';
  isActive: boolean;
  joinedAt: string;
}

interface MultiplayerRoomProps {
  onStartGame: (gameMode: 'multiplayer') => void;
  onBack: () => void;
  currentUser?: {
    username: string;
    avatar: string;
    id: string;
  };
}

export function MultiplayerRoom({ onStartGame, onBack, currentUser }: MultiplayerRoomProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('lobby');
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [roomMembers, setRoomMembers] = useState<RoomMember[]>([]);
  const [roomCode, setRoomCode] = useState('');
  const [roomName, setRoomName] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{ user: string; message: string; time: string }>>([]);
  const [chatInput, setChatInput] = useState('');
  const [ws, setWs] = useState<WebSocket | null>(null);

  useEffect(() => {
    if (currentRoom && currentUser) {
      // Simulate WebSocket for offline operation
      const simulateWebSocket = () => {
        // Load existing chat messages from localStorage for this room
        const existingMessages = JSON.parse(localStorage.getItem(`room_${currentRoom.id}_messages`) || '[]');
        setChatMessages(existingMessages);

        // Simulate room members for offline mode
        const roomKey = `room_${currentRoom.id}_members`;
        const existingMembers = JSON.parse(localStorage.getItem(roomKey) || '[]');
        if (existingMembers.length === 0) {
          const initialMembers = [{
            id: 1,
            roomId: currentRoom.id,
            userId: currentUser.id,
            role: 'host' as const,
            isActive: true,
            joinedAt: new Date().toISOString()
          }];
          localStorage.setItem(roomKey, JSON.stringify(initialMembers));
          setRoomMembers(initialMembers);
        } else {
          setRoomMembers(existingMembers);
        }
      };

      simulateWebSocket();
    }
  }, [currentRoom, currentUser]);

  const handleWebSocketMessage = (message: any) => {
    switch (message.type) {
      case 'player_joined':
        toast({
          title: "Player Joined",
          description: `${message.payload.hackerName} joined the room`,
        });
        fetchRoomMembers();
        break;

      case 'player_left':
        toast({
          title: "Player Left",
          description: `${message.payload.hackerName} left the room`,
        });
        fetchRoomMembers();
        break;

      case 'chat_message':
        setChatMessages(prev => [...prev, {
          user: message.payload.hackerName,
          message: message.payload.message,
          time: new Date(message.payload.timestamp).toLocaleTimeString()
        }]);
        break;

      case 'room_state':
        setRoomMembers(message.payload.members);
        break;
    }
  };

  const createRoom = async () => {
    if (!roomName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a room name",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await apiRequest(
        'POST',
        '/api/rooms/create',
        {
          name: roomName,
          gameMode: 'cooperative',
          maxPlayers: 4,
          userId: currentUser?.id || 'mobile_user_' + Date.now()
        }
      );

      const room = await response.json();
      setCurrentRoom(room);
      setActiveTab('room');
      toast({
        title: "Room Created",
        description: `Room "${room.name}" created with code: ${room.roomCode}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create room",
        variant: "destructive"
      });
    }
  };

  const joinRoom = async () => {
    if (!roomCode.trim()) {
      toast({
        title: "Error",
        description: "Please enter a room code",
        variant: "destructive"
      });
      return;
    }

    // Simulate room joining for offline operation
    const roomData = {
      id: Math.floor(Math.random() * 1000),
      name: `Room ${roomCode.toUpperCase()}`,
      roomCode: roomCode.toUpperCase(),
      hostUserId: currentUser?.id || 'offline_user',
      gameMode: 'cooperative',
      maxPlayers: 4,
      currentPlayers: 1,
      isActive: true
    };

    setCurrentRoom(roomData);
    setActiveTab('room');
    toast({
      title: "Joined Room",
      description: `Successfully joined "${roomData.name}"`,
    });
  };

  const fetchRoomMembers = async () => {
    if (!currentRoom) return;

    // Use localStorage for offline room member management
    const roomKey = `room_${currentRoom.id}_members`;
    const members = JSON.parse(localStorage.getItem(roomKey) || '[]');
    setRoomMembers(members);
  };

  const leaveRoom = async () => {
    if (!currentRoom) return;

    try {
      if (ws) {
        ws.send(JSON.stringify({ type: 'leave_room' }));
        ws.close();
      }

      // Use localStorage for offline room management
      const roomKey = `room_${currentRoom.id}_members`;
      const members = JSON.parse(localStorage.getItem(roomKey) || '[]');
      const updatedMembers = members.filter((m: any) => m.userId !== currentUser?.id);
      localStorage.setItem(roomKey, JSON.stringify(updatedMembers));

      setCurrentRoom(null);
      setRoomMembers([]);
      setActiveTab('lobby');
      setChatMessages([]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to leave room",
        variant: "destructive"
      });
    }
  };

  const sendChatMessage = () => {
    if (!chatInput.trim() || !currentRoom) return;

    const newMessage = {
      user: currentUser?.username || 'Anonymous',
      message: chatInput.trim(),
      time: new Date().toLocaleTimeString()
    };

    // Update local chat state
    const updatedMessages = [...chatMessages, newMessage];
    setChatMessages(updatedMessages);

    // Persist to localStorage for room persistence
    localStorage.setItem(`room_${currentRoom.id}_messages`, JSON.stringify(updatedMessages));

    setChatInput('');
  };

  const copyRoomCode = () => {
    if (currentRoom) {
      navigator.clipboard.writeText(currentRoom.roomCode);
      toast({
        title: "Copied!",
        description: "Room code copied to clipboard",
      });
    }
  };

  const startMultiplayerGame = () => {
    if (currentRoom && roomMembers.length >= 2) {
      onStartGame('multiplayer');
    } else {
      toast({
        title: "Not Ready",
        description: "Need at least 2 players to start",
        variant: "destructive"
      });
    }
  };

  if (activeTab === 'room' && currentRoom) {
    return (
      <div className="min-h-screen bg-black text-green-400 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-mono font-bold">MULTIPLAYER ROOM</h1>
              <Badge variant="outline" className="text-green-400 border-green-400">
                {currentRoom.roomCode}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={copyRoomCode}
                  className="ml-2 h-auto p-1"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </Badge>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={startMultiplayerGame}
                disabled={roomMembers.length < 2}
                className="border-green-400 text-green-400 hover:bg-green-400 hover:text-black"
              >
                START MISSION
              </Button>
              <Button 
                variant="outline" 
                onClick={leaveRoom}
                className="border-red-400 text-red-400 hover:bg-red-400 hover:text-black"
              >
                LEAVE ROOM
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Room Members */}
            <Card className="lg:col-span-1 bg-black border-green-400">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-400">
                  <Users className="h-5 w-5" />
                  TEAM MEMBERS ({roomMembers.length}/{currentRoom.maxPlayers})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-60">
                  {roomMembers.map((member) => (
                    <div 
                      key={member.id} 
                      className="flex items-center gap-3 p-2 border border-green-400/30 rounded mb-2"
                    >
                      <User className="h-4 w-4" />
                      <span className="flex-1 font-mono">
                        {currentUser?.id === member.userId ? 'You' : `Player_${member.userId.slice(-4)}`}
                      </span>
                      {member.role === 'host' && (
                        <Crown className="h-4 w-4 text-yellow-400" />
                      )}
                      <Badge 
                        variant="outline" 
                        className={member.role === 'host' ? 'border-yellow-400 text-yellow-400' : 'border-green-400 text-green-400'}
                      >
                        {member.role}
                      </Badge>
                    </div>
                  ))}
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Chat */}
            <Card className="lg:col-span-2 bg-black border-green-400">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-400">
                  <MessageSquare className="h-5 w-5" />
                  TEAM CHAT
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-48 mb-4">
                  {chatMessages.map((msg, index) => (
                    <div key={index} className="mb-2 font-mono text-sm">
                      <span className="text-blue-400">[{msg.time}]</span>
                      <span className="text-yellow-400 ml-2">{msg.user}:</span>
                      <span className="text-green-400 ml-2">{msg.message}</span>
                    </div>
                  ))}
                </ScrollArea>
                <div className="flex gap-2">
                  <Input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                    placeholder="Type your message..."
                    className="flex-1 bg-black border-green-400 text-green-400 font-mono"
                  />
                  <Button 
                    onClick={sendChatMessage}
                    className="bg-green-400 text-black hover:bg-green-500"
                  >
                    SEND
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-green-400 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-mono font-bold">MULTIPLAYER LOBBY</h1>
          <Button 
            variant="outline" 
            onClick={onBack}
            className="border-green-400 text-green-400 hover:bg-green-400 hover:text-black"
          >
            BACK
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-black border border-green-400">
            <TabsTrigger value="lobby" className="data-[state=active]:bg-green-400 data-[state=active]:text-black">
              CREATE ROOM
            </TabsTrigger>
            <TabsTrigger value="join" className="data-[state=active]:bg-green-400 data-[state=active]:text-black">
              JOIN ROOM
            </TabsTrigger>
          </TabsList>

          <TabsContent value="lobby" className="space-y-6">
            <Card className="bg-black border-green-400">
              <CardHeader>
                <CardTitle className="text-green-400">CREATE NEW ROOM</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Enter room name..."
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  className="bg-black border-green-400 text-green-400 font-mono"
                />
                <Button 
                  onClick={createRoom}
                  className="w-full bg-green-400 text-black hover:bg-green-500 font-mono"
                >
                  CREATE ROOM
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="join" className="space-y-6">
            <Card className="bg-black border-green-400">
              <CardHeader>
                <CardTitle className="text-green-400">JOIN EXISTING ROOM</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Enter room code..."
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  className="bg-black border-green-400 text-green-400 font-mono"
                />
                <Button 
                  onClick={joinRoom}
                  className="w-full bg-green-400 text-black hover:bg-green-500 font-mono"
                >
                  JOIN ROOM
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}