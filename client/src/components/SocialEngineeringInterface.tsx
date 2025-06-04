import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  socialEngineeringSystem, 
  SocialTarget, 
  PhishingCampaign, 
  ConversationState,
  phishingTemplates 
} from '@/lib/socialEngineering';
import { 
  Users, 
  MessageCircle, 
  Mail, 
  Target, 
  Brain, 
  Shield, 
  AlertTriangle,
  Send,
  Plus,
  Eye,
  Trash2
} from 'lucide-react';

export function SocialEngineeringInterface() {
  const [targets, setTargets] = useState<SocialTarget[]>([]);
  const [campaigns, setCampaigns] = useState<PhishingCampaign[]>([]);
  const [activeConversation, setActiveConversation] = useState<ConversationState | null>(null);
  const [conversationMessage, setConversationMessage] = useState('');
  const [selectedTarget, setSelectedTarget] = useState<SocialTarget | null>(null);
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    type: 'email' as keyof typeof phishingTemplates,
    template: 'urgent_security',
    targets: [] as string[]
  });

  useEffect(() => {
    // Generate initial targets
    const initialTargets = socialEngineeringSystem.generateTargets(8);
    setTargets(initialTargets);
  }, []);

  const handleStartConversation = (target: SocialTarget) => {
    const conversation = socialEngineeringSystem.startConversation(
      target.id,
      'Extract credentials',
      'Friendly approach'
    );
    setActiveConversation(conversation);
    setSelectedTarget(target);
  };

  const handleSendMessage = () => {
    if (!activeConversation || !conversationMessage.trim()) return;

    try {
      const messages = socialEngineeringSystem.processMessage(
        activeConversation.targetId,
        conversationMessage
      );
      
      // Update conversation state
      const updatedConversation = socialEngineeringSystem.getState().activeConversations[activeConversation.targetId];
      setActiveConversation(updatedConversation);
      
      // Update target state
      const updatedTargets = Object.values(socialEngineeringSystem.getState().targets);
      setTargets(updatedTargets);
      
      setConversationMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleCreateCampaign = () => {
    if (!newCampaign.name || newCampaign.targets.length === 0) return;

    try {
      const campaign = socialEngineeringSystem.createPhishingCampaign(
        newCampaign.name,
        newCampaign.type,
        newCampaign.template,
        newCampaign.targets
      );
      
      setCampaigns([...campaigns, campaign]);
      setNewCampaign({
        name: '',
        type: 'email',
        template: 'urgent_security',
        targets: []
      });
    } catch (error) {
      console.error('Failed to create campaign:', error);
    }
  };

  const handleDeployCampaign = (campaignId: string) => {
    try {
      const results = socialEngineeringSystem.deployPhishingCampaign(campaignId);
      
      // Update campaigns and targets
      const updatedState = socialEngineeringSystem.getState();
      setCampaigns(updatedState.phishingCampaigns);
      setTargets(Object.values(updatedState.targets));
      
      console.log('Campaign deployed:', results);
    } catch (error) {
      console.error('Failed to deploy campaign:', error);
    }
  };

  const getPersonalityColor = (personality: SocialTarget['personality']) => {
    const colors = {
      trusting: 'bg-green-500',
      suspicious: 'bg-yellow-500',
      paranoid: 'bg-red-500',
      naive: 'bg-blue-500',
      professional: 'bg-purple-500'
    };
    return colors[personality];
  };

  const getMoodIcon = (mood: SocialTarget['currentMood']) => {
    const icons = {
      happy: '😊',
      stressed: '😰',
      angry: '😠',
      neutral: '😐',
      excited: '🤩'
    };
    return icons[mood];
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Brain className="w-6 h-6 text-purple-500" />
        <h1 className="text-2xl font-bold">Social Engineering Hub</h1>
      </div>

      <Tabs defaultValue="targets" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="targets" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Targets
          </TabsTrigger>
          <TabsTrigger value="conversations" className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4" />
            Conversations
          </TabsTrigger>
          <TabsTrigger value="phishing" className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Phishing
          </TabsTrigger>
          <TabsTrigger value="intel" className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Intel
          </TabsTrigger>
        </TabsList>

        <TabsContent value="targets" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {targets.map((target) => (
              <Card key={target.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{target.name}</CardTitle>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getMoodIcon(target.currentMood)}</span>
                      <Badge className={`${getPersonalityColor(target.personality)} text-white`}>
                        {target.personality}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {target.role} at {target.company}
                  </p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Trust Level</span>
                      <span>{target.trustLevel}%</span>
                    </div>
                    <Progress value={target.trustLevel} className="h-2" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Suspicion Level</span>
                      <span className={target.suspicionLevel > 50 ? 'text-red-500' : 'text-green-500'}>
                        {target.suspicionLevel}%
                      </span>
                    </div>
                    <Progress 
                      value={target.suspicionLevel} 
                      className="h-2"
                      // @ts-ignore
                      style={{ '--progress-background': target.suspicionLevel > 50 ? '#ef4444' : '#10b981' }}
                    />
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs font-medium">Access Level:</p>
                    <Badge variant={target.accessLevel === 'admin' ? 'destructive' : 'secondary'}>
                      {target.accessLevel}
                    </Badge>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs font-medium">Weaknesses:</p>
                    <div className="flex flex-wrap gap-1">
                      {target.weaknesses.slice(0, 2).map((weakness) => (
                        <Badge key={weakness} variant="outline" className="text-xs">
                          {weakness.replace('_', ' ')}
                        </Badge>
                      ))}
                      {target.weaknesses.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{target.weaknesses.length - 2} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button 
                      size="sm" 
                      onClick={() => handleStartConversation(target)}
                      className="flex-1"
                    >
                      <MessageCircle className="w-3 h-3 mr-1" />
                      Chat
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        setNewCampaign(prev => ({
                          ...prev,
                          targets: [...prev.targets, target.id]
                        }));
                      }}
                    >
                      <Target className="w-3 h-3" />
                    </Button>
                  </div>

                  {target.compromised && (
                    <div className="flex items-center gap-1 text-xs text-red-500">
                      <AlertTriangle className="w-3 h-3" />
                      Compromised
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="conversations" className="space-y-4">
          {activeConversation && selectedTarget ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageCircle className="w-5 h-5" />
                      Conversation with {selectedTarget.name}
                    </CardTitle>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Progress: {Math.round(activeConversation.progress * 100)}%</span>
                      <span>Objective: {activeConversation.objective}</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-96 mb-4 p-4 border rounded">
                      <div className="space-y-3">
                        {activeConversation.messages.map((message, index) => (
                          <div
                            key={index}
                            className={`flex ${message.sender === 'player' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-xs p-3 rounded-lg ${
                                message.sender === 'player'
                                  ? 'bg-blue-500 text-white'
                                  : 'bg-gray-200 text-gray-800'
                              }`}
                            >
                              <p className="text-sm">{message.content}</p>
                              <div className="flex justify-between items-center mt-1 text-xs opacity-70">
                                <span>{new Date(message.timestamp).toLocaleTimeString()}</span>
                                {message.sender === 'player' && (
                                  <span>Effectiveness: {message.effectiveness}%</span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                    
                    <div className="flex gap-2">
                      <Input
                        placeholder="Type your message..."
                        value={conversationMessage}
                        onChange={(e) => setConversationMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        className="flex-1"
                      />
                      <Button onClick={handleSendMessage}>
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Target Analysis</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm font-medium mb-2">Psychological Profile</p>
                      <Badge className={`${getPersonalityColor(selectedTarget.personality)} text-white mb-2`}>
                        {selectedTarget.personality}
                      </Badge>
                      <p className="text-xs text-muted-foreground">
                        Current mood: {selectedTarget.currentMood} {getMoodIcon(selectedTarget.currentMood)}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm font-medium mb-2">Known Weaknesses</p>
                      <div className="space-y-1">
                        {selectedTarget.weaknesses.map((weakness) => (
                          <Badge key={weakness} variant="outline" className="text-xs mr-1">
                            {weakness.replace('_', ' ')}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium mb-2">Interests</p>
                      <div className="space-y-1">
                        {selectedTarget.interests.map((interest) => (
                          <Badge key={interest} variant="secondary" className="text-xs mr-1">
                            {interest}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium mb-2">Intel Gathered</p>
                      <div className="space-y-2">
                        {selectedTarget.intel.length > 0 ? (
                          selectedTarget.intel.map((intel) => (
                            <div key={intel.id} className="p-2 bg-gray-50 rounded text-xs">
                              <p className="font-medium">{intel.type}</p>
                              <p className="text-muted-foreground">{intel.value}</p>
                              <p className="text-xs text-green-600">
                                Reliability: {intel.reliability}%
                              </p>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-muted-foreground">No intel gathered yet</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center">
                  <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Select a target to start a conversation</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="phishing" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Create Phishing Campaign
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Campaign name"
                  value={newCampaign.name}
                  onChange={(e) => setNewCampaign(prev => ({ ...prev, name: e.target.value }))}
                />
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Campaign Type</label>
                  <select
                    className="w-full p-2 border rounded"
                    value={newCampaign.type}
                    onChange={(e) => setNewCampaign(prev => ({ 
                      ...prev, 
                      type: e.target.value as keyof typeof phishingTemplates 
                    }))}
                  >
                    <option value="email">Email</option>
                    <option value="social_media">Social Media</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Template</label>
                  <select
                    className="w-full p-2 border rounded"
                    value={newCampaign.template}
                    onChange={(e) => setNewCampaign(prev => ({ ...prev, template: e.target.value }))}
                  >
                    {Object.keys(phishingTemplates[newCampaign.type]).map((template) => (
                      <option key={template} value={template}>
                        {template.replace('_', ' ').toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Selected Targets ({newCampaign.targets.length})
                  </label>
                  <div className="flex flex-wrap gap-1">
                    {newCampaign.targets.map((targetId) => {
                      const target = targets.find(t => t.id === targetId);
                      return target ? (
                        <Badge key={targetId} variant="secondary" className="text-xs">
                          {target.name}
                          <button
                            onClick={() => setNewCampaign(prev => ({
                              ...prev,
                              targets: prev.targets.filter(id => id !== targetId)
                            }))}
                            className="ml-1 text-red-500"
                          >
                            ×
                          </button>
                        </Badge>
                      ) : null;
                    })}
                  </div>
                </div>

                <Button 
                  onClick={handleCreateCampaign}
                  disabled={!newCampaign.name || newCampaign.targets.length === 0}
                  className="w-full"
                >
                  Create Campaign
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Active Campaigns</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-3">
                    {campaigns.map((campaign) => (
                      <div key={campaign.id} className="p-3 border rounded">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{campaign.name}</h4>
                          <Badge variant={campaign.deployed ? 'default' : 'secondary'}>
                            {campaign.deployed ? 'Deployed' : 'Draft'}
                          </Badge>
                        </div>
                        
                        <p className="text-xs text-muted-foreground mb-2">
                          Type: {campaign.type} | Targets: {campaign.targets.length}
                        </p>
                        
                        {campaign.deployed && (
                          <div className="text-xs">
                            <p>Success Rate: {campaign.successRate.toFixed(1)}%</p>
                            <p>Results: {campaign.results.length} responses</p>
                          </div>
                        )}
                        
                        <div className="flex gap-2 mt-2">
                          {!campaign.deployed && (
                            <Button 
                              size="sm" 
                              onClick={() => handleDeployCampaign(campaign.id)}
                            >
                              Deploy
                            </Button>
                          )}
                          <Button size="sm" variant="outline">
                            <Eye className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="destructive">
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="intel" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Gathered Intelligence
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {socialEngineeringSystem.getState().intel.map((intel) => (
                  <div key={intel.id} className="p-4 border rounded">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline">{intel.type}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {intel.reliability}% reliable
                      </span>
                    </div>
                    <p className="text-sm font-medium mb-1">{intel.value}</p>
                    <p className="text-xs text-muted-foreground">
                      Source: {intel.source}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(intel.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 