// @ts-nocheck
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Terminal, Zap, Users, Target, Trophy, ArrowRight, CheckCircle } from 'lucide-react';

interface OnboardingTutorialProps {
  onComplete: () => void;
  onSkip: () => void;
}

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  command?: string;
  icon: React.ComponentType<any>;
  content: string[];
  tips: string[];
}

const tutorialSteps: TutorialStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to RogueSim',
    description: 'Your journey into the cyberpunk hacking world begins now',
    icon: Terminal,
    content: [
      'RogueSim is an authentic hacking terminal simulator',
      'Master realistic commands to complete missions',
      'Build your reputation as an elite hacker',
      'Compete with players worldwide'
    ],
    tips: [
      'Use "help" anytime to see available commands',
      'Your progress is automatically saved',
      'Start with basic missions and work your way up'
    ]
  },
  {
    id: 'basic_commands',
    title: 'Essential Hacking Commands',
    description: 'Learn the fundamental commands every hacker needs',
    command: 'help',
    icon: Zap,
    content: [
      'scan - Discover nearby networks and vulnerabilities',
      'connect - Establish connection to target systems',
      'inject - Deploy payloads to compromise security',
      'decrypt - Break encryption and access data',
      'missions - View available hacking contracts'
    ],
    tips: [
      'Always scan before attempting to connect',
      'Different payloads work on different targets',
      'Stealth is key - avoid detection systems'
    ]
  },
  {
    id: 'missions',
    title: 'Mission System',
    description: 'Complete missions to earn credits and reputation',
    command: 'missions',
    icon: Target,
    content: [
      'Missions range from corporate espionage to government infiltration',
      'Higher difficulty missions offer greater rewards',
      'AI generates unique challenges based on your skill level',
      'Complete objectives to unlock advanced tools'
    ],
    tips: [
      'Read mission briefings carefully',
      'Use the "generate" command for AI-powered missions',
      'Failed missions affect your reputation'
    ]
  },
  {
    id: 'progression',
    title: 'Character Progression',
    description: 'Advance your skills and unlock new capabilities',
    icon: Trophy,
    content: [
      'Earn experience points (XP) by completing missions',
      'Increase your reputation from Novice to Elite',
      'Unlock new payloads, tools, and commands',
      'Purchase upgrades in the black market shop'
    ],
    tips: [
      'Higher reputation unlocks exclusive missions',
      'Credits can buy better equipment',
      'Specialize in different hacking disciplines'
    ]
  },
  {
    id: 'multiplayer',
    title: 'Multiplayer & Community',
    description: 'Connect with other hackers worldwide',
    command: 'multiplayer',
    icon: Users,
    content: [
      'Create or join multiplayer rooms for team missions',
      'Chat with other players in real-time',
      'Compete on global leaderboards',
      'Share strategies and form hacker collectives'
    ],
    tips: [
      'Team missions offer unique rewards',
      'Learn from experienced players',
      'Check leaderboards to see top hackers'
    ]
  }
];

export function OnboardingTutorial({ onComplete, onSkip }: OnboardingTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

  const progress = ((currentStep + 1) / tutorialSteps.length) * 100;
  const step = tutorialSteps[currentStep];

  const handleNext = () => {
    setCompletedSteps(prev => new Set([...prev, step.id]));
    
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const jumpToStep = (stepIndex: number) => {
    setCurrentStep(stepIndex);
  };

  return (
    <div className="min-h-screen bg-black text-green-400 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-mono font-bold text-green-400">HACKER TRAINING PROTOCOL</h1>
            <p className="text-green-400/70 font-mono">Level 1 Security Clearance - Training Module</p>
          </div>
          <Button 
            onClick={onSkip}
            variant="outline"
            className="border-green-400/50 text-green-400 hover:bg-green-400/10 font-mono"
          >
            SKIP TRAINING
          </Button>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-green-400 font-mono text-sm">TRAINING PROGRESS</span>
            <span className="text-green-400 font-mono text-sm">{currentStep + 1}/{tutorialSteps.length}</span>
          </div>
          <Progress value={progress} className="h-2 bg-black border border-green-400/30" />
        </div>

        {/* Step Navigation */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {tutorialSteps.map((tutorialStep, index) => (
            <Button
              key={tutorialStep.id}
              onClick={() => jumpToStep(index)}
              variant={index === currentStep ? "default" : "outline"}
              size="sm"
              className={`
                flex-shrink-0 font-mono text-xs
                ${index === currentStep 
                  ? 'bg-green-400 text-black' 
                  : 'border-green-400/30 text-green-400 hover:bg-green-400/10'
                }
              `}
            >
              {completedSteps.has(tutorialStep.id) && (
                <CheckCircle className="h-3 w-3 mr-1" />
              )}
              {index + 1}. {tutorialStep.title}
            </Button>
          ))}
        </div>

        {/* Main Content */}
        <Card className="bg-black border-green-400 mb-8">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-400/10 rounded-lg border border-green-400/30">
                <step.icon className="h-8 w-8 text-green-400" />
              </div>
              <div>
                <CardTitle className="text-green-400 font-mono text-2xl">{step.title}</CardTitle>
                <p className="text-green-400/70 font-mono">{step.description}</p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Command Demo */}
            {step.command && (
              <div className="bg-black border border-green-400/30 rounded-lg p-4">
                <div className="text-green-400/60 text-sm mb-2 font-mono">Try this command:</div>
                <div className="font-mono text-green-400">
                  <span className="text-green-400/60">hacker@terminal:~$ </span>
                  <span className="text-green-300 font-bold">{step.command}</span>
                </div>
              </div>
            )}

            {/* Content */}
            <div className="space-y-3">
              <h3 className="text-green-400 font-mono font-bold text-lg">Key Concepts:</h3>
              <ul className="space-y-2">
                {step.content.map((item, index) => (
                  <li key={index} className="flex items-start gap-3 text-green-400/80 font-mono">
                    <span className="text-green-400 mt-1">▶</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Tips */}
            <div className="space-y-3">
              <h3 className="text-green-400 font-mono font-bold text-lg">Pro Tips:</h3>
              <div className="space-y-2">
                {step.tips.map((tip, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <Badge variant="outline" className="border-green-400/50 text-green-400 font-mono text-xs">
                      TIP
                    </Badge>
                    <span className="text-green-400/70 font-mono text-sm">{tip}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            variant="outline"
            className="border-green-400/50 text-green-400 hover:bg-green-400/10 font-mono"
          >
            PREVIOUS
          </Button>

          <div className="text-center">
            <div className="text-green-400/60 font-mono text-sm">
              Step {currentStep + 1} of {tutorialSteps.length}
            </div>
          </div>

          <Button
            onClick={handleNext}
            className="bg-green-400 text-black hover:bg-green-500 font-mono"
          >
            {currentStep === tutorialSteps.length - 1 ? 'START HACKING' : 'NEXT'}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}