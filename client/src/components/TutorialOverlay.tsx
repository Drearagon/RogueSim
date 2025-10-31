import React, { useMemo, useState } from 'react';
import {
  Terminal as TerminalIcon,
  BookOpen,
  Map as MapIcon,
  Users,
  PlayCircle,
  ShieldCheck,
  Brain
} from 'lucide-react';

interface TutorialAction {
  label: string;
  description: string;
  onClick: () => void;
}

interface TutorialHighlight {
  title: string;
  detail: string;
}

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  highlights: TutorialHighlight[];
  actions?: TutorialAction[];
  tip?: string;
}

interface TutorialOverlayProps {
  onComplete: () => void;
  onSkip: () => void;
  onStartDemoMission: () => void;
  onOpenMissionMap: () => void;
  onOpenShop: () => void;
  onOpenSkillTree: () => void;
  onOpenNetworkMap: () => void;
  onOpenTeamInterface: () => void;
  primaryColor: string;
  textColor: string;
  backgroundColor: string;
}

export function TutorialOverlay({
  onComplete,
  onSkip,
  onStartDemoMission,
  onOpenMissionMap,
  onOpenShop,
  onOpenSkillTree,
  onOpenNetworkMap,
  onOpenTeamInterface,
  primaryColor,
  textColor,
  backgroundColor
}: TutorialOverlayProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = useMemo<TutorialStep[]>(
    () => [
      {
        id: 'terminal-basics',
        title: 'Terminal Basics',
        description: 'Everything begins at the command line. Master these fundamentals to control the network.',
        icon: TerminalIcon,
        highlights: [
          { title: 'Command Input', detail: 'Type commands after the prompt and press Enter to execute them.' },
          { title: 'History Navigation', detail: 'Use ↑ and ↓ to cycle through previous commands and repeat actions instantly.' },
          { title: 'Real-Time Feedback', detail: 'Responses stream into the terminal output so you can audit every action.' }
        ],
        actions: [
          {
            label: 'Review Available Commands',
            description: 'Type `help` in the terminal to see every unlocked capability.',
            onClick: () => {}
          }
        ],
        tip: 'Pro Tip: Combine `scan` and `connect` to locate and breach targets quickly.'
      },
      {
        id: 'systems-overview',
        title: 'Systems & Upgrades',
        description: 'Enhance your operative with specialized gear, skills, and intelligence tools.',
        icon: BookOpen,
        highlights: [
          { title: 'Black Market Shop', detail: 'Acquire payloads, utilities, and hardware to expand your toolkit.' },
          { title: 'Skill Tree', detail: 'Spend earned skill points to unlock hacking specializations and passive boosts.' },
          { title: 'Psych Profile', detail: 'Monitor long-term choices and how factions perceive your methods.' }
        ],
        actions: [
          {
            label: 'Open Shop Interface',
            description: 'Browse available payloads and upgrades.',
            onClick: onOpenShop
          },
          {
            label: 'Inspect Skill Tree',
            description: 'Review unlockable skills and plan your progression.',
            onClick: onOpenSkillTree
          }
        ],
        tip: 'Spend credits wisely—advanced missions require both skill upgrades and specialized gear.'
      },
      {
        id: 'mission-map',
        title: 'Mission Network Map',
        description: 'Visualize operations, prerequisites, and team requirements across the Shadow Network.',
        icon: MapIcon,
        highlights: [
          { title: 'Strategic Overview', detail: 'Every mission node shows rewards, difficulty, and recommended crew size.' },
          { title: 'Progression Paths', detail: 'Unlock harder jobs by completing prerequisites and raising your reputation.' },
          { title: 'Quick Deployment', detail: 'Select a mission node to brief your team and launch directly from the overlay.' }
        ],
        actions: [
          {
            label: 'Open Mission Map Overlay',
            description: 'Launch the holographic network map without leaving the terminal.',
            onClick: onOpenMissionMap
          }
        ],
        tip: 'Look for glowing nodes—those mark missions you qualify for based on level and team size.'
      },
      {
        id: 'multiplayer',
        title: 'Multiplayer & Operations',
        description: 'Coordinate with other operatives to tackle high-stakes infiltrations.',
        icon: Users,
        highlights: [
          { title: 'Team System', detail: 'Form squads, invite operatives, and assign tactical roles before launching.' },
          { title: 'Network Map', detail: 'Analyze target infrastructure layers to plan precise attack vectors.' },
          { title: 'Comms & Alerts', detail: 'Use the message center to track staff briefings and social notifications.' }
        ],
        actions: [
          {
            label: 'Open Team Panel',
            description: 'Review your crew and manage invitations.',
            onClick: onOpenTeamInterface
          },
          {
            label: 'View Network Map',
            description: 'Study topography and security tiers of corporate grids.',
            onClick: onOpenNetworkMap
          }
        ],
        tip: 'Team compositions with complementary skills unlock additional mission routes.'
      },
      {
        id: 'demo-mission',
        title: 'Launch Demo Mission',
        description: 'Experience a guided operation that walks through scanning, infiltration, and extraction.',
        icon: PlayCircle,
        highlights: [
          { title: 'Guided Objectives', detail: 'Step-by-step instructions help you complete each action with confidence.' },
          { title: 'Safe Environment', detail: 'No penalties for experimentation—this mission is a training simulation.' },
          { title: 'Real Rewards', detail: 'Earn credits and XP to kick-start your progression even during training.' }
        ],
        actions: [
          {
            label: 'Launch Training Operation',
            description: 'Load the interactive tutorial mission and update the mission panel.',
            onClick: onStartDemoMission
          }
        ],
        tip: 'Complete the demo once to unlock advanced tips and permanently mark the tutorial as complete.'
      },
      {
        id: 'next-steps',
        title: 'Ready for the Shadows',
        description: 'You now understand the core systems. Continue honing your skills and reputation.',
        icon: ShieldCheck,
        highlights: [
          { title: 'Daily Briefings', detail: 'Check the message center for staff updates and limited-time events.' },
          { title: 'Adaptive Difficulty', detail: 'Missions scale with your reputation—expect corporations to respond.' },
          { title: 'Keep Evolving', detail: 'Balance focus, resources, and risk to stay ahead of security countermeasures.' }
        ],
        actions: [
          {
            label: 'Finish Tutorial',
            description: 'Close the tutorial and return to full operative control.',
            onClick: onComplete
          }
        ],
        tip: 'Execute `tutorial` anytime to revisit these lessons or re-run the demo mission.'
      }
    ],
    [
      onComplete,
      onOpenMissionMap,
      onOpenNetworkMap,
      onOpenShop,
      onOpenSkillTree,
      onOpenTeamInterface,
      onStartDemoMission
    ]
  );

  const step = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
      return;
    }
    onComplete();
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center px-4 md:px-8">
      <div
        className="absolute inset-0"
        style={{
          background: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(6px)'
        }}
      />

      <div
        className="relative w-full max-w-5xl border rounded-lg shadow-2xl overflow-hidden"
        style={{
          borderColor: `${primaryColor}80`,
          background: `${backgroundColor}f2`,
          color: textColor
        }}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: `${primaryColor}40` }}>
          <div className="flex items-center gap-3">
            <div
              className="p-2 rounded-md"
              style={{
                backgroundColor: `${primaryColor}15`,
                border: `1px solid ${primaryColor}40`
              }}
            >
              <step.icon className="h-6 w-6" style={{ color: primaryColor }} />
            </div>
            <div>
              <h2 className="text-xl font-mono font-semibold">{step.title}</h2>
              <p className="text-sm opacity-80 font-mono">{step.description}</p>
            </div>
          </div>
          <button
            onClick={onSkip}
            className="text-xs font-mono uppercase tracking-widest px-3 py-1 border rounded hover:opacity-80 transition"
            style={{
              borderColor: `${primaryColor}60`,
              color: primaryColor
            }}
          >
            Skip Tutorial
          </button>
        </div>

        <div className="px-6 pt-6">
          <div className="h-2 w-full rounded bg-black/40 border" style={{ borderColor: `${primaryColor}30` }}>
            <div
              className="h-full rounded"
              style={{
                width: `${progress}%`,
                background: primaryColor,
                boxShadow: `0 0 12px ${primaryColor}70`
              }}
            />
          </div>
          <div className="flex items-center justify-between mt-2 text-xs font-mono opacity-80">
            <span>Step {currentStep + 1} / {steps.length}</span>
            <span>Use Next to continue or jump with the actions below.</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-6 py-6">
          <div className="space-y-3">
            {step.highlights.map((highlight) => (
              <div
                key={highlight.title}
                className="border rounded-lg p-3"
                style={{ borderColor: `${primaryColor}30`, backgroundColor: `${primaryColor}0d` }}
              >
                <h3 className="font-mono font-semibold" style={{ color: primaryColor }}>{highlight.title}</h3>
                <p className="text-sm font-mono opacity-80">{highlight.detail}</p>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            {step.actions?.map((action) => (
              <div
                key={action.label}
                className="border rounded-lg p-4 flex flex-col gap-3"
                style={{ borderColor: `${primaryColor}40`, backgroundColor: `${backgroundColor}e6` }}
              >
                <div>
                  <h4 className="font-mono text-sm" style={{ color: primaryColor }}>{action.label}</h4>
                  <p className="text-xs font-mono opacity-80">{action.description}</p>
                </div>
                <button
                  onClick={action.onClick}
                  className="px-4 py-2 text-sm font-mono border rounded hover:opacity-90 transition"
                  style={{
                    borderColor: `${primaryColor}80`,
                    color: textColor,
                    backgroundColor: `${primaryColor}26`
                  }}
                >
                  Execute
                </button>
              </div>
            ))}

            {step.tip && (
              <div
                className="border rounded-lg p-4 flex items-start gap-3"
                style={{ borderColor: `${primaryColor}30`, backgroundColor: `${primaryColor}15` }}
              >
                <Brain className="h-5 w-5" style={{ color: primaryColor }} />
                <p className="text-xs font-mono opacity-90">{step.tip}</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t" style={{ borderColor: `${primaryColor}30` }}>
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="px-4 py-2 text-xs font-mono border rounded transition disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              borderColor: `${primaryColor}50`,
              color: primaryColor,
              backgroundColor: 'transparent'
            }}
          >
            Previous
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={onSkip}
              className="px-4 py-2 text-xs font-mono border rounded hover:opacity-80 transition"
              style={{
                borderColor: `${primaryColor}30`,
                color: textColor,
                backgroundColor: `${backgroundColor}cc`
              }}
            >
              Skip Tutorial
            </button>
            <button
              onClick={handleNext}
              className="px-4 py-2 text-xs font-mono border rounded hover:opacity-90 transition"
              style={{
                borderColor: `${primaryColor}90`,
                backgroundColor: primaryColor,
                color: '#000'
              }}
            >
              {currentStep === steps.length - 1 ? 'Finish' : 'Next Step'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
