// @ts-nocheck
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Terminal, User, Shield, Zap, Target, Clock, Cpu } from 'lucide-react';
import { GameState } from '../types/GameState';

interface MissionBriefingProps {
  mission: Mission;
  gameState: GameState;
  onAccept: () => void;
  onDecline: () => void;
  onClose: () => void;
}

interface Mission {
  id: string;
  title: string;
  description: string;
  difficulty: number;
  target: string;
  objectives: string[];
  rewards: {
    credits: number;
    reputation: number;
    unlocks: string[];
  };
  briefing: DialogueSequence[];
  timeLimit?: number;
  requiredLevel: number;
}

interface DialogueSequence {
  speaker: string;
  avatar: string;
  text: string;
  delay: number;
  mood: 'neutral' | 'urgent' | 'confident' | 'warning' | 'mysterious';
}

export function MissionBriefing({ mission, gameState, onAccept, onDecline, onClose }: MissionBriefingProps) {
  const [currentDialogue, setCurrentDialogue] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showActions, setShowActions] = useState(false);

  // Typewriter effect for dialogue
  useEffect(() => {
    if (currentDialogue >= mission.briefing.length) {
      setShowActions(true);
      return;
    }

    const dialogue = mission.briefing[currentDialogue];
    setIsTyping(true);
    setDisplayedText('');

    let charIndex = 0;
    const typeInterval = setInterval(() => {
      if (charIndex < dialogue.text.length) {
        setDisplayedText(dialogue.text.slice(0, charIndex + 1));
        charIndex++;
      } else {
        setIsTyping(false);
        clearInterval(typeInterval);
        
        // Auto-advance after delay
        setTimeout(() => {
          setCurrentDialogue(prev => prev + 1);
        }, dialogue.delay);
      }
    }, 50);

    return () => clearInterval(typeInterval);
  }, [currentDialogue, mission.briefing]);

  const getMoodColor = (mood: string) => {
    switch (mood) {
      case 'urgent': return 'text-red-400 border-red-400';
      case 'confident': return 'text-blue-400 border-blue-400';
      case 'warning': return 'text-yellow-400 border-yellow-400';
      case 'mysterious': return 'text-purple-400 border-purple-400';
      default: return 'text-green-400 border-green-400';
    }
  };

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty <= 2) return 'bg-green-500';
    if (difficulty <= 4) return 'bg-yellow-500';
    if (difficulty <= 6) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const canAcceptMission = gameState.playerLevel >= mission.requiredLevel;

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl bg-black/90 border-green-400 text-green-400 max-h-[90vh] overflow-hidden">
        <CardContent className="p-0">
          {/* Header */}
          <div className="border-b border-green-400 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Terminal className="h-6 w-6" />
                <h2 className="text-xl font-mono">MISSION BRIEFING</h2>
              </div>
              <button 
                onClick={onClose}
                className="text-green-400 hover:text-green-300 text-xl"
              >
                ×
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 h-[600px]">
            {/* Dialogue Panel */}
            <div className="border-r border-green-400 p-6 flex flex-col">
              <h3 className="text-lg font-mono mb-4 flex items-center gap-2">
                <User className="h-5 w-5" />
                SECURE COMMUNICATION
              </h3>
              
              {currentDialogue < mission.briefing.length ? (
                <div className="flex-1 flex flex-col justify-center">
                  <div className={`border-2 rounded-lg p-4 ${getMoodColor(mission.briefing[currentDialogue]?.mood || 'neutral')}`}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-green-400/20 flex items-center justify-center">
                        <User className="h-6 w-6" />
                      </div>
                      <span className="font-mono font-bold">
                        {mission.briefing[currentDialogue]?.speaker}
                      </span>
                    </div>
                    <p className="font-mono text-sm leading-relaxed">
                      {displayedText}
                      {isTyping && <span className="animate-pulse">|</span>}
                    </p>
                  </div>
                  
                  <div className="mt-4 flex justify-center">
                    <Progress 
                      value={(currentDialogue / mission.briefing.length) * 100} 
                      className="w-48"
                    />
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <Terminal className="h-16 w-16 mx-auto mb-4 text-green-400" />
                    <p className="font-mono text-lg">BRIEFING COMPLETE</p>
                    <p className="font-mono text-sm text-green-400/70 mt-2">
                      Awaiting operative response...
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Mission Details Panel */}
            <div className="p-6 overflow-y-auto">
              <div className="space-y-6">
                {/* Mission Info */}
                <div>
                  <h3 className="text-lg font-mono mb-3 flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    {mission.title}
                  </h3>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      <span className="text-sm">Difficulty:</span>
                      <Badge className={`${getDifficultyColor(mission.difficulty)} text-black`}>
                        Level {mission.difficulty}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Cpu className="h-4 w-4" />
                      <span className="text-sm">Required Level:</span>
                      <Badge variant="outline" className="border-green-400">
                        {mission.requiredLevel}
                      </Badge>
                    </div>
                  </div>
                  {mission.timeLimit && (
                    <div className="flex items-center gap-2 mb-4">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm">Time Limit: {mission.timeLimit} minutes</span>
                    </div>
                  )}
                  <p className="text-sm text-green-400/80">{mission.description}</p>
                </div>

                {/* Objectives */}
                <div>
                  <h4 className="font-mono font-bold mb-2">OBJECTIVES:</h4>
                  <ul className="space-y-1">
                    {mission.objectives.map((objective, index) => (
                      <li key={index} className="text-sm flex items-start gap-2">
                        <span className="text-green-400 mt-1">▶</span>
                        {objective}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Target */}
                <div>
                  <h4 className="font-mono font-bold mb-2">TARGET:</h4>
                  <p className="text-sm bg-red-500/20 border border-red-500 rounded p-2">
                    {mission.target}
                  </p>
                </div>

                {/* Rewards */}
                <div>
                  <h4 className="font-mono font-bold mb-2">REWARDS:</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-yellow-400" />
                      <span>{mission.rewards.credits} Credits</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-blue-400" />
                      <span>+{mission.rewards.reputation} Rep</span>
                    </div>
                  </div>
                  {mission.rewards.unlocks.length > 0 && (
                    <div className="mt-2">
                      <span className="text-xs text-green-400/70">UNLOCKS:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {mission.rewards.unlocks.map((unlock, index) => (
                          <Badge key={index} variant="outline" className="text-xs border-green-400">
                            {unlock}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {showActions && (
            <div className="border-t border-green-400 p-6 flex justify-between">
              <Button
                variant="outline"
                onClick={onDecline}
                className="border-red-400 text-red-400 hover:bg-red-400/20"
              >
                DECLINE MISSION
              </Button>
              <Button
                onClick={onAccept}
                disabled={!canAcceptMission}
                className="bg-green-400 text-black hover:bg-green-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {canAcceptMission ? 'ACCEPT MISSION' : `LEVEL ${mission.requiredLevel} REQUIRED`}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}