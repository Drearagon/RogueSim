import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Users, Pen, Eraser, Square, Circle, ArrowRight, 
  Type, Save, Share, Download, Trash2, Undo, Redo,
  Target, Clock, Shield, Zap, MessageSquare
} from 'lucide-react';

interface CollaborativeWhiteboardProps {
  missionId: string;
  roomId: number;
  currentUser: {
    id: string;
    hackerName: string;
    avatar: string;
  };
  onClose: () => void;
}

interface DrawElement {
  id: string;
  type: 'pen' | 'line' | 'rectangle' | 'circle' | 'text' | 'arrow';
  points: number[];
  color: string;
  strokeWidth: number;
  text?: string;
  userId: string;
  userName: string;
  timestamp: number;
}

interface Participant {
  id: string;
  name: string;
  avatar: string;
  isActive: boolean;
  cursor?: { x: number; y: number };
  tool: string;
}

interface MissionNode {
  id: string;
  x: number;
  y: number;
  type: 'objective' | 'checkpoint' | 'risk' | 'resource';
  title: string;
  description: string;
  assigned?: string;
  status: 'pending' | 'in-progress' | 'completed';
  connections: string[];
}

export function CollaborativeWhiteboard({ 
  missionId, 
  roomId, 
  currentUser, 
  onClose 
}: CollaborativeWhiteboardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tool, setTool] = useState<string>('pen');
  const [color, setColor] = useState('#00ff00');
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [isDrawing, setIsDrawing] = useState(false);
  const [elements, setElements] = useState<DrawElement[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([
    {
      id: currentUser.id,
      name: currentUser.hackerName,
      avatar: currentUser.avatar,
      isActive: true,
      tool: 'pen'
    }
  ]);
  const [missionNodes, setMissionNodes] = useState<MissionNode[]>([]);
  const [selectedNode, setSelectedNode] = useState<MissionNode | null>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [showChat, setShowChat] = useState(false);

  // Initialize mission planning nodes
  useEffect(() => {
    const initialNodes: MissionNode[] = [
      {
        id: 'recon',
        x: 100,
        y: 100,
        type: 'objective',
        title: 'Reconnaissance',
        description: 'Gather intelligence on target systems',
        status: 'pending',
        connections: ['infiltration']
      },
      {
        id: 'infiltration',
        x: 300,
        y: 150,
        type: 'objective',
        title: 'System Infiltration',
        description: 'Gain initial access to target network',
        status: 'pending',
        connections: ['escalation']
      },
      {
        id: 'escalation',
        x: 500,
        y: 200,
        type: 'objective',
        title: 'Privilege Escalation',
        description: 'Obtain administrative access',
        status: 'pending',
        connections: ['extraction']
      },
      {
        id: 'extraction',
        x: 700,
        y: 150,
        type: 'objective',
        title: 'Data Extraction',
        description: 'Retrieve target information',
        status: 'pending',
        connections: []
      },
      {
        id: 'stealth',
        x: 400,
        y: 50,
        type: 'risk',
        title: 'Stealth Risk',
        description: 'Maintain operational security',
        status: 'pending',
        connections: []
      }
    ];
    setMissionNodes(initialNodes);
  }, []);

  // Drawing functions
  const startDrawing = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (tool === 'select') return;
    
    setIsDrawing(true);
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newElement: DrawElement = {
      id: `${Date.now()}-${Math.random()}`,
      type: tool as any,
      points: [x, y],
      color,
      strokeWidth,
      userId: currentUser.id,
      userName: currentUser.hackerName,
      timestamp: Date.now()
    };

    setElements(prev => [...prev, newElement]);
  }, [tool, color, strokeWidth, currentUser]);

  const draw = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || tool === 'select') return;
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setElements(prev => {
      const newElements = [...prev];
      const currentElement = newElements[newElements.length - 1];
      if (currentElement) {
        currentElement.points.push(x, y);
      }
      return newElements;
    });
  }, [isDrawing, tool]);

  const stopDrawing = useCallback(() => {
    setIsDrawing(false);
  }, []);

  // Render canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = '#003300';
    ctx.lineWidth = 1;
    for (let i = 0; i < canvas.width; i += 20) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, canvas.height);
      ctx.stroke();
    }
    for (let i = 0; i < canvas.height; i += 20) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(canvas.width, i);
      ctx.stroke();
    }

    // Draw mission nodes
    missionNodes.forEach(node => {
      const nodeColor = {
        'objective': '#00ff00',
        'checkpoint': '#0099ff',
        'risk': '#ff6600',
        'resource': '#9900ff'
      }[node.type];

      ctx.fillStyle = nodeColor;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      
      // Draw node circle
      ctx.beginPath();
      ctx.arc(node.x, node.y, 25, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Draw node label
      ctx.fillStyle = '#ffffff';
      ctx.font = '12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(node.title, node.x, node.y - 35);

      // Draw connections
      node.connections.forEach(connectionId => {
        const targetNode = missionNodes.find(n => n.id === connectionId);
        if (targetNode) {
          ctx.strokeStyle = '#666666';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(node.x, node.y);
          ctx.lineTo(targetNode.x, targetNode.y);
          ctx.stroke();
        }
      });
    });

    // Draw elements
    elements.forEach(element => {
      ctx.strokeStyle = element.color;
      ctx.lineWidth = element.strokeWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (element.type === 'pen') {
        ctx.beginPath();
        for (let i = 0; i < element.points.length - 2; i += 2) {
          ctx.moveTo(element.points[i], element.points[i + 1]);
          ctx.lineTo(element.points[i + 2], element.points[i + 3]);
        }
        ctx.stroke();
      }
    });

    // Draw participant cursors
    participants.forEach(participant => {
      if (participant.cursor && participant.id !== currentUser.id) {
        ctx.fillStyle = '#ff00ff';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(participant.cursor.x, participant.cursor.y, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // Cursor label
        ctx.fillStyle = '#ffffff';
        ctx.font = '10px monospace';
        ctx.fillText(participant.name, participant.cursor.x + 10, participant.cursor.y - 10);
      }
    });
  }, [elements, missionNodes, participants, currentUser.id]);

  const getNodeTypeIcon = (type: string) => {
    switch (type) {
      case 'objective': return Target;
      case 'checkpoint': return Clock;
      case 'risk': return Shield;
      case 'resource': return Zap;
      default: return Target;
    }
  };

  const sendChatMessage = () => {
    if (newMessage.trim()) {
      const message = {
        id: Date.now(),
        userId: currentUser.id,
        userName: currentUser.hackerName,
        text: newMessage,
        timestamp: Date.now()
      };
      setChatMessages(prev => [...prev, message]);
      setNewMessage('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex flex-col">
      {/* Header */}
      <div className="border-b border-green-400 p-4 bg-black/90">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-mono text-green-400 flex items-center gap-2">
              <Users className="h-6 w-6" />
              MISSION PLANNING BOARD
            </h2>
            <Badge className="bg-green-400 text-black">
              {participants.length} Active
            </Badge>
          </div>
          
          {/* Participants */}
          <div className="flex items-center gap-2">
            {participants.map(participant => (
              <div
                key={participant.id}
                className={`flex items-center gap-2 px-2 py-1 rounded border ${
                  participant.isActive ? 'border-green-400 bg-green-400/20' : 'border-gray-600'
                }`}
              >
                <div className="w-6 h-6 rounded-full bg-green-400/20 flex items-center justify-center">
                  {participant.name[0]}
                </div>
                <span className="text-sm font-mono">{participant.name}</span>
              </div>
            ))}
            <Button variant="outline" onClick={onClose} className="border-green-400">
              CLOSE
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-1">
        {/* Toolbar */}
        <div className="w-16 border-r border-green-400 bg-black/90 p-2 flex flex-col gap-2">
          {[
            { id: 'pen', icon: Pen, label: 'Draw' },
            { id: 'line', icon: ArrowRight, label: 'Line' },
            { id: 'rectangle', icon: Square, label: 'Rectangle' },
            { id: 'circle', icon: Circle, label: 'Circle' },
            { id: 'text', icon: Type, label: 'Text' },
            { id: 'eraser', icon: Eraser, label: 'Eraser' }
          ].map(toolItem => (
            <Button
              key={toolItem.id}
              variant={tool === toolItem.id ? "default" : "outline"}
              size="sm"
              onClick={() => setTool(toolItem.id)}
              className={`w-12 h-12 p-0 ${
                tool === toolItem.id 
                  ? 'bg-green-400 text-black' 
                  : 'border-green-400 text-green-400'
              }`}
              title={toolItem.label}
            >
              <toolItem.icon className="h-4 w-4" />
            </Button>
          ))}

          {/* Color palette */}
          <div className="mt-4 space-y-1">
            {['#00ff00', '#ff0000', '#0099ff', '#ffff00', '#ff00ff', '#ffffff'].map(c => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`w-8 h-8 rounded border-2 ${
                  color === c ? 'border-white' : 'border-gray-600'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        {/* Main Canvas Area */}
        <div className="flex-1 relative">
          <canvas
            ref={canvasRef}
            width={1200}
            height={700}
            className="cursor-crosshair bg-black"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
          />
        </div>

        {/* Side Panel */}
        <div className="w-80 border-l border-green-400 bg-black/90 flex flex-col">
          {/* Mission Nodes */}
          <div className="p-4 border-b border-green-400">
            <h3 className="font-mono font-bold mb-3 flex items-center gap-2">
              <Target className="h-4 w-4" />
              MISSION NODES
            </h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {missionNodes.map(node => {
                const Icon = getNodeTypeIcon(node.type);
                return (
                  <Card
                    key={node.id}
                    className={`cursor-pointer transition-colors ${
                      selectedNode?.id === node.id 
                        ? 'border-green-400 bg-green-400/10' 
                        : 'border-gray-600 hover:border-green-400/50'
                    }`}
                    onClick={() => setSelectedNode(node)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className="h-4 w-4" />
                        <span className="text-sm font-mono font-bold">{node.title}</span>
                        <Badge 
                          variant="outline" 
                          className={`ml-auto text-xs ${
                            node.status === 'completed' ? 'border-green-400' :
                            node.status === 'in-progress' ? 'border-yellow-400' :
                            'border-gray-400'
                          }`}
                        >
                          {node.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-green-400/70">{node.description}</p>
                      {node.assigned && (
                        <div className="mt-1 text-xs text-blue-400">
                          Assigned: {node.assigned}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Chat */}
          <div className="flex-1 flex flex-col">
            <div className="p-4 border-b border-green-400">
              <Button
                variant="outline"
                onClick={() => setShowChat(!showChat)}
                className="w-full border-green-400 flex items-center gap-2"
              >
                <MessageSquare className="h-4 w-4" />
                {showChat ? 'HIDE CHAT' : 'SHOW CHAT'}
              </Button>
            </div>

            {showChat && (
              <>
                <div className="flex-1 p-4 overflow-y-auto">
                  <div className="space-y-2">
                    {chatMessages.map(message => (
                      <div key={message.id} className="text-sm">
                        <span className="text-green-400 font-mono">{message.userName}:</span>
                        <span className="ml-2 text-green-400/80">{message.text}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 border-t border-green-400">
                  <div className="flex gap-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && sendChatMessage()}
                      placeholder="Type message..."
                      className="bg-black border-green-400 text-green-400"
                    />
                    <Button
                      onClick={sendChatMessage}
                      size="sm"
                      className="bg-green-400 text-black"
                    >
                      Send
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="border-t border-green-400 p-4 bg-black/90 flex justify-between items-center">
        <div className="flex gap-2">
          <Button variant="outline" className="border-green-400 text-green-400">
            <Save className="h-4 w-4 mr-2" />
            SAVE PLAN
          </Button>
          <Button variant="outline" className="border-green-400 text-green-400">
            <Share className="h-4 w-4 mr-2" />
            SHARE
          </Button>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" className="border-green-400 text-green-400">
            <Undo className="h-4 w-4" />
          </Button>
          <Button variant="outline" className="border-green-400 text-green-400">
            <Redo className="h-4 w-4" />
          </Button>
          <Button variant="outline" className="border-red-400 text-red-400">
            <Trash2 className="h-4 w-4 mr-2" />
            CLEAR
          </Button>
        </div>
      </div>
    </div>
  );
}