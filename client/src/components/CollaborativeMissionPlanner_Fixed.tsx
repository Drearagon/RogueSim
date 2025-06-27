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
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    {
      id: currentUser.id,
      username: currentUser.username,
      role: 'leader',
      status: 'online'
    }
  ]);
  const [newObjective, setNewObjective] = useState({
    title: '',
    description: '',
    priority: 'medium' as const,
    estimatedTime: 30
  });
  const [selectedObjective, setSelectedObjective] = useState<string | null>(null);

  // Initialize with sample objectives for demonstration
  useEffect(() => {
    setObjectives([
      {
        id: '1',
        title: 'Infiltrate Security Network',
        description: 'Gain access to the target\'s security infrastructure',
        status: 'pending',
        priority: 'high',
        estimatedTime: 45,
        dependencies: [],
        createdBy: currentUser.id,
        createdAt: Date.now()
      },
      {
        id: '2', 
        title: 'Extract Sensitive Data',
        description: 'Locate and download classified documents',
        status: 'pending',
        priority: 'critical',
        estimatedTime: 60,
        dependencies: ['1'],
        createdBy: currentUser.id,
        createdAt: Date.now()
      }
    ]);
  }, [currentUser.id]);

  const addObjective = () => {
    if (!newObjective.title.trim()) return;

    const objective: MissionObjective = {
      id: Date.now().toString(),
      title: newObjective.title,
      description: newObjective.description,
      status: 'pending',
      priority: newObjective.priority,
      estimatedTime: newObjective.estimatedTime,
      dependencies: [],
      createdBy: currentUser.id,
      createdAt: Date.now()
    };

    setObjectives(prev => [...prev, objective]);
    setNewObjective({
      title: '',
      description: '',
      priority: 'medium',
      estimatedTime: 30
    });

    // Send update via WebSocket if connected
    if (websocket && websocket.readyState === WebSocket.OPEN) {
      websocket.send(JSON.stringify({
        type: 'mission_objective_added',
        roomId,
        objective,
        userId: currentUser.id
      }));
    }
  };

  const updateObjectiveStatus = (objectiveId: string, status: MissionObjective['status']) => {
    setObjectives(prev => 
      prev.map(obj => 
        obj.id === objectiveId ? { ...obj, status } : obj
      )
    );

    // Send update via WebSocket if connected
    if (websocket && websocket.readyState === WebSocket.OPEN) {
      websocket.send(JSON.stringify({
        type: 'mission_objective_updated',
        roomId,
        objectiveId,
        status,
        userId: currentUser.id
      }));
    }
  };

  const assignObjective = (objectiveId: string, memberId: string) => {
    setObjectives(prev =>
      prev.map(obj =>
        obj.id === objectiveId ? { ...obj, assignedTo: memberId } : obj
      )
    );

    // Send update via WebSocket if connected
    if (websocket && websocket.readyState === WebSocket.OPEN) {
      websocket.send(JSON.stringify({
        type: 'mission_objective_assigned',
        roomId,
        objectiveId,
        assignedTo: memberId,
        userId: currentUser.id
      }));
    }
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

  const completedObjectives = objectives.filter(obj => obj.status === 'completed').length;
  const totalObjectives = objectives.length;
  const progressPercentage = totalObjectives > 0 ? (completedObjectives / totalObjectives) * 100 : 0;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] bg-gray-900 border-cyan-500/50">
        <CardHeader className="border-b border-cyan-500/20">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-cyan-400">Mission Planner - Room {roomId}</CardTitle>
              <div className="text-sm text-gray-400 mt-1">
                Progress: {completedObjectives}/{totalObjectives} objectives completed
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-cyan-400 border-cyan-500/50">
                <Users className="w-3 h-3 mr-1" />
                {teamMembers.length} members
              </Badge>
              <Button variant="ghost" size="sm" onClick={onClose}>
                ✕
              </Button>
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
            <div 
              className="bg-cyan-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="grid grid-cols-1 lg:grid-cols-3 h-[calc(90vh-140px)]">
            {/* Objectives List */}
            <div className="col-span-2 border-r border-cyan-500/20">
              <div className="p-4 border-b border-cyan-500/20">
                <h3 className="text-lg font-semibold text-cyan-400 mb-3">Mission Objectives</h3>
                
                {/* Add new objective */}
                <div className="space-y-2 mb-4">
                  <Input
                    placeholder="Objective title..."
                    value={newObjective.title}
                    onChange={(e) => setNewObjective(prev => ({ ...prev, title: e.target.value }))}
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                  <Input
                    placeholder="Description..."
                    value={newObjective.description}
                    onChange={(e) => setNewObjective(prev => ({ ...prev, description: e.target.value }))}
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                  <div className="flex space-x-2">
                    <select 
                      value={newObjective.priority}
                      onChange={(e) => setNewObjective(prev => ({ ...prev, priority: e.target.value as any }))}
                      className="bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                    <Input
                      type="number"
                      placeholder="Time (min)"
                      value={newObjective.estimatedTime}
                      onChange={(e) => setNewObjective(prev => ({ ...prev, estimatedTime: parseInt(e.target.value) || 30 }))}
                      className="bg-gray-800 border-gray-600 text-white w-24"
                    />
                    <Button onClick={addObjective} size="sm" className="bg-cyan-600 hover:bg-cyan-700">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <ScrollArea className="h-full p-4">
                <div className="space-y-3">
                  {objectives.map((objective) => (
                    <div
                      key={objective.id}
                      className={`bg-gray-800 rounded-lg p-3 border cursor-pointer transition-all ${
                        selectedObjective === objective.id 
                          ? 'border-cyan-500 bg-cyan-900/20' 
                          : 'border-gray-600 hover:border-gray-500'
                      }`}
                      onClick={() => setSelectedObjective(objective.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-medium text-white">{objective.title}</h4>
                            <div className={`w-2 h-2 rounded-full ${getPriorityColor(objective.priority)}`} />
                          </div>
                          <p className="text-sm text-gray-400 mb-2">{objective.description}</p>
                          <div className="flex items-center space-x-3 text-xs text-gray-500">
                            <span className={getStatusColor(objective.status)}>
                              {objective.status.replace('-', ' ').toUpperCase()}
                            </span>
                            <span className="flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              {objective.estimatedTime}m
                            </span>
                            {objective.assignedTo && (
                              <span className="flex items-center">
                                <Users className="w-3 h-3 mr-1" />
                                {teamMembers.find(m => m.id === objective.assignedTo)?.username || 'Unknown'}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex space-x-1">
                          {objective.status !== 'completed' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                updateObjectiveStatus(objective.id, 
                                  objective.status === 'pending' ? 'in-progress' : 'completed'
                                );
                              }}
                              className="text-green-400 hover:bg-green-900/20"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Team Members */}
            <div className="p-4">
              <h3 className="text-lg font-semibold text-cyan-400 mb-3">Team Members</h3>
              <ScrollArea className="h-full">
                <div className="space-y-2">
                  {teamMembers.map((member) => (
                    <div
                      key={member.id}
                      className="bg-gray-800 rounded-lg p-3 border border-gray-600"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-white">{member.username}</span>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${
                            member.status === 'online' ? 'text-green-400 border-green-500' : 'text-gray-400 border-gray-500'
                          }`}
                        >
                          {member.status}
                        </Badge>
                      </div>
                      <div className="text-xs text-gray-400 mb-2">Role: {member.role}</div>
                      {member.currentObjective && (
                        <div className="text-xs text-cyan-400">
                          Working on: {objectives.find(obj => obj.id === member.currentObjective)?.title || 'Unknown'}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}