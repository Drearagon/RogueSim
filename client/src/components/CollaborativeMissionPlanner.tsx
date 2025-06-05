import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Users, 
  Target, 
  Clock, 
  AlertTriangle, 
  CheckCircle,
  Plus,
  Trash2,
  MessageSquare,
  Share2
} from 'lucide-react';

interface MissionObjective {
  id: string;
  title: string;
  description: string;
  assignedTo?: string;
  status: 'pending' | 'in-progress' | 'completed' | 'blocked';
  priority: 'low' | 'medium' | 'high' | 'critical';
  estimatedTime: number; // minutes
  dependencies: string[];
  createdBy: string;
  createdAt: number;
}

interface TeamMember {
  id: string;
  username: string;
  role: 'leader' | 'infiltrator' | 'analyst' | 'support';
  status: 'online' | 'busy' | 'away';
  currentObjective?: string;
}

interface CollaborativeMissionPlannerProps {
  roomId: number;
  currentUser: {
    id: string;
    username: string;
  };
  websocket?: WebSocket;
  onClose: () => void;
}

export function CollaborativeMissionPlanner({ 
  roomId, 
  currentUser, 
  websocket,
  onClose 
}: CollaborativeMissionPlannerProps) {
  const [objectives, setObjectives] = useState<MissionObjective[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [newObjective, setNewObjective] = useState({
    title: '',
    description: '',
    priority: 'medium' as const,
    estimatedTime: 30
  });
  const [selectedObjective, setSelectedObjective] = useState<string | null>(null);
  const [missionTitle, setMissionTitle] = useState('');
  const [missionBriefing, setMissionBriefing] = useState('');

  useEffect(() => {
    // Load mission data from localStorage or WebSocket
    const savedMission = localStorage.getItem(`mission_plan_${roomId}`);
    if (savedMission) {
      const data = JSON.parse(savedMission);
      setObjectives(data.objectives || []);
      setMissionTitle(data.title || '');
      setMissionBriefing(data.briefing || '');
    }

    // Initialize team members
    setTeamMembers([
      {
        id: currentUser.id,
        username: currentUser.username,
        role: 'leader',
        status: 'online'
      }
    ]);

    // Listen for WebSocket updates
    if (websocket) {
      const handleMessage = (event: MessageEvent) => {
        const data = JSON.parse(event.data);
        
        switch (data.type) {
          case 'mission_objective_added':
            setObjectives(prev => [...prev, data.payload]);
            break;
          case 'mission_objective_updated':
            setObjectives(prev => 
              prev.map(obj => obj.id === data.payload.id ? data.payload : obj)
            );
            break;
          case 'mission_objective_deleted':
            setObjectives(prev => prev.filter(obj => obj.id !== data.payload.id));
            break;
          case 'team_member_joined':
            setTeamMembers(prev => [...prev, data.payload]);
            break;
        }
      };

      websocket.addEventListener('message', handleMessage);
      return () => websocket.removeEventListener('message', handleMessage);
    }
  }, [roomId, currentUser, websocket]);

  const addObjective = () => {
    if (!newObjective.title.trim()) return;

    const objective: MissionObjective = {
      id: `obj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: newObjective.title,
      description: newObjective.description,
      status: 'pending',
      priority: newObjective.priority,
      estimatedTime: newObjective.estimatedTime,
      dependencies: [],
      createdBy: currentUser.username,
      createdAt: Date.now()
    };

    setObjectives(prev => [...prev, objective]);
    saveMissionData([...objectives, objective]);

    // Send via WebSocket
    if (websocket && websocket.readyState === WebSocket.OPEN) {
      websocket.send(JSON.stringify({
        type: 'mission_objective_add',
        payload: objective
      }));
    }

    setNewObjective({
      title: '',
      description: '',
      priority: 'medium',
      estimatedTime: 30
    });
  };

  const updateObjectiveStatus = (id: string, status: MissionObjective['status']) => {
    const updatedObjectives = objectives.map(obj => 
      obj.id === id ? { ...obj, status } : obj
    );
    setObjectives(updatedObjectives);
    saveMissionData(updatedObjectives);

    // Send via WebSocket
    if (websocket && websocket.readyState === WebSocket.OPEN) {
      const updatedObjective = updatedObjectives.find(obj => obj.id === id);
      websocket.send(JSON.stringify({
        type: 'mission_objective_update',
        payload: updatedObjective
      }));
    }
  };

  const assignObjective = (objectiveId: string, memberId: string) => {
    const updatedObjectives = objectives.map(obj => 
      obj.id === objectiveId ? { ...obj, assignedTo: memberId } : obj
    );
    setObjectives(updatedObjectives);
    saveMissionData(updatedObjectives);

    // Send via WebSocket
    if (websocket && websocket.readyState === WebSocket.OPEN) {
      const updatedObjective = updatedObjectives.find(obj => obj.id === objectiveId);
      websocket.send(JSON.stringify({
        type: 'mission_objective_update',
        payload: updatedObjective
      }));
    }
  };

  const deleteObjective = (id: string) => {
    const updatedObjectives = objectives.filter(obj => obj.id !== id);
    setObjectives(updatedObjectives);
    saveMissionData(updatedObjectives);

    // Send via WebSocket
    if (websocket && websocket.readyState === WebSocket.OPEN) {
      websocket.send(JSON.stringify({
        type: 'mission_objective_delete',
        payload: { id }
      }));
    }
  };

  const saveMissionData = (objectivesList: MissionObjective[]) => {
    const missionData = {
      title: missionTitle,
      briefing: missionBriefing,
      objectives: objectivesList,
      lastUpdated: Date.now()
    };
    localStorage.setItem(`mission_plan_${roomId}`, JSON.stringify(missionData));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400';
      case 'in-progress': return 'text-blue-400';
      case 'blocked': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const totalEstimatedTime = objectives.reduce((sum, obj) => sum + obj.estimatedTime, 0);
  const completedObjectives = objectives.filter(obj => obj.status === 'completed').length;
  const progressPercentage = objectives.length > 0 ? (completedObjectives / objectives.length) * 100 : 0;

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50">
      <div className="bg-black border border-green-400 rounded-lg w-full max-w-6xl h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-green-400">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-mono font-bold text-green-400">COLLABORATIVE MISSION PLANNER</h2>
            <Badge className="bg-green-400/20 text-green-400 border-green-400">
              Room {roomId}
            </Badge>
          </div>
          <Button
            variant="outline"
            onClick={onClose}
            className="border-red-400 text-red-400 hover:bg-red-400 hover:text-black"
          >
            CLOSE
          </Button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - Mission Overview */}
          <div className="w-1/3 border-r border-green-400 p-4 flex flex-col">
            <div className="mb-4">
              <label className="block text-sm font-mono text-green-400 mb-2">MISSION TITLE</label>
              <Input
                value={missionTitle}
                onChange={(e) => setMissionTitle(e.target.value)}
                placeholder="Enter mission title..."
                className="bg-black border-green-400 text-green-400"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-mono text-green-400 mb-2">BRIEFING</label>
              <textarea
                value={missionBriefing}
                onChange={(e) => setMissionBriefing(e.target.value)}
                placeholder="Enter mission briefing..."
                className="w-full h-24 bg-black border border-green-400 rounded px-3 py-2 text-green-400 resize-none"
              />
            </div>

            <div className="mb-4">
              <h3 className="text-sm font-mono text-green-400 mb-2">MISSION PROGRESS</h3>
              <div className="bg-gray-800 rounded-full h-4 mb-2">
                <div 
                  className="bg-green-400 h-4 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <div className="text-xs font-mono text-green-400">
                {completedObjectives}/{objectives.length} objectives completed
              </div>
            </div>

            <div className="mb-4">
              <h3 className="text-sm font-mono text-green-400 mb-2">TEAM MEMBERS</h3>
              <ScrollArea className="h-32">
                {teamMembers.map(member => (
                  <div key={member.id} className="flex items-center justify-between p-2 border border-green-400/30 rounded mb-2">
                    <div>
                      <div className="text-sm font-mono text-green-400">{member.username}</div>
                      <div className="text-xs text-green-400/70">{member.role}</div>
                    </div>
                    <Badge className={`${member.status === 'online' ? 'bg-green-400/20 text-green-400' : 'bg-gray-400/20 text-gray-400'} text-xs`}>
                      {member.status}
                    </Badge>
                  </div>
                ))}
              </ScrollArea>
            </div>

            <div className="mt-auto">
              <div className="text-xs font-mono text-green-400/70">
                <div>Estimated Time: {Math.floor(totalEstimatedTime / 60)}h {totalEstimatedTime % 60}m</div>
                <div>Last Updated: {new Date().toLocaleTimeString()}</div>
              </div>
            </div>
          </div>

          {/* Center Panel - Objectives */}
          <div className="flex-1 p-4 flex flex-col">
            <div className="mb-4">
              <h3 className="text-lg font-mono text-green-400 mb-2">MISSION OBJECTIVES</h3>
              
              {/* Add New Objective */}
              <Card className="bg-black border-green-400 mb-4">
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      value={newObjective.title}
                      onChange={(e) => setNewObjective(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Objective title..."
                      className="bg-black border-green-400 text-green-400"
                    />
                    <select
                      value={newObjective.priority}
                      onChange={(e) => setNewObjective(prev => ({ ...prev, priority: e.target.value as any }))}
                      className="bg-black border border-green-400 rounded px-3 py-2 text-green-400"
                    >
                      <option value="low">Low Priority</option>
                      <option value="medium">Medium Priority</option>
                      <option value="high">High Priority</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                  <Input
                    value={newObjective.description}
                    onChange={(e) => setNewObjective(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Objective description..."
                    className="bg-black border-green-400 text-green-400 mt-2"
                  />
                  <div className="flex items-center gap-4 mt-2">
                    <Input
                      type="number"
                      value={newObjective.estimatedTime}
                      onChange={(e) => setNewObjective(prev => ({ ...prev, estimatedTime: parseInt(e.target.value) || 30 }))}
                      placeholder="Est. time (minutes)"
                      className="bg-black border-green-400 text-green-400 w-40"
                    />
                    <Button
                      onClick={addObjective}
                      className="bg-green-400 text-black hover:bg-green-500"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      ADD OBJECTIVE
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Objectives List */}
            <ScrollArea className="flex-1">
              {objectives.map(objective => (
                <Card key={objective.id} className="bg-black border-green-400 mb-3">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-mono text-green-400 font-semibold">{objective.title}</h4>
                          <Badge className={`${getPriorityColor(objective.priority)} text-black text-xs`}>
                            {objective.priority}
                          </Badge>
                          <Badge className={`${getStatusColor(objective.status)} border-current text-xs`}>
                            {objective.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-green-400/70 mb-2">{objective.description}</p>
                        <div className="flex items-center gap-4 text-xs text-green-400/70">
                          <span><Clock className="h-3 w-3 inline mr-1" />{objective.estimatedTime}m</span>
                          <span>Created by {objective.createdBy}</span>
                          {objective.assignedTo && (
                            <span>Assigned to {teamMembers.find(m => m.id === objective.assignedTo)?.username}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <select
                          value={objective.status}
                          onChange={(e) => updateObjectiveStatus(objective.id, e.target.value as any)}
                          className="bg-black border border-green-400 rounded px-2 py-1 text-xs text-green-400"
                        >
                          <option value="pending">Pending</option>
                          <option value="in-progress">In Progress</option>
                          <option value="completed">Completed</option>
                          <option value="blocked">Blocked</option>
                        </select>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteObjective(objective.id)}
                          className="border-red-400 text-red-400 hover:bg-red-400 hover:text-black"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </ScrollArea>
          </div>

          {/* Right Panel - Communication */}
          <div className="w-1/3 border-l border-green-400 p-4">
            <h3 className="text-lg font-mono text-green-400 mb-4">TEAM COMMUNICATION</h3>
            
            <Card className="bg-black border-green-400 h-64 mb-4">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-mono text-green-400">TACTICAL CHAT</CardTitle>
              </CardHeader>
              <CardContent className="p-2 h-48 overflow-y-auto">
                <div className="text-xs text-green-400/70 mb-2">
                  System: Mission planner initialized
                </div>
                <div className="text-xs text-green-400/70 mb-2">
                  {currentUser.username}: Ready for mission planning
                </div>
              </CardContent>
            </Card>

            <div className="mb-4">
              <h4 className="text-sm font-mono text-green-400 mb-2">MISSION ASSETS</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 border border-green-400/30 rounded">
                  <span className="text-xs text-green-400">Infiltration Tools</span>
                  <Badge className="bg-green-400/20 text-green-400 text-xs">Available</Badge>
                </div>
                <div className="flex items-center justify-between p-2 border border-green-400/30 rounded">
                  <span className="text-xs text-green-400">Network Scanners</span>
                  <Badge className="bg-green-400/20 text-green-400 text-xs">Ready</Badge>
                </div>
                <div className="flex items-center justify-between p-2 border border-green-400/30 rounded">
                  <span className="text-xs text-green-400">Exploit Database</span>
                  <Badge className="bg-yellow-400/20 text-yellow-400 text-xs">Updating</Badge>
                </div>
              </div>
            </div>

            <Button
              className="w-full bg-green-400 text-black hover:bg-green-500"
              onClick={() => {
                // Share mission plan
                const missionData = {
                  title: missionTitle,
                  briefing: missionBriefing,
                  objectives,
                  totalEstimatedTime,
                  progressPercentage
                };
                navigator.clipboard.writeText(JSON.stringify(missionData, null, 2));
              }}
            >
              <Share2 className="h-4 w-4 mr-2" />
              EXPORT MISSION PLAN
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}