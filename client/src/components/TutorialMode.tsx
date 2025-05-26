import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, ArrowRight, Target, Zap, Shield } from 'lucide-react';

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  command: string;
  expectedOutput?: string;
  hint: string;
  icon: React.ComponentType<any>;
  completed: boolean;
}

interface TutorialModeProps {
  isActive: boolean;
  onComplete: () => void;
  onExecuteCommand: (command: string) => void;
  gameState: any;
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to RogueSim',
    description: 'Learn the basics of cybersecurity simulation with our interactive tutorial.',
    command: 'help',
    hint: 'Type "help" to see all available commands',
    icon: Play,
    completed: false
  },
  {
    id: 'scan',
    title: 'Network Discovery',
    description: 'Discover nearby networks and devices to begin your reconnaissance.',
    command: 'scan',
    hint: 'Use the "scan" command to find wireless networks',
    icon: Target,
    completed: false
  },
  {
    id: 'connect',
    title: 'Network Connection',
    description: 'Connect to a target network to begin your penetration testing.',
    command: 'connect TARGET_NET',
    hint: 'Connect to TARGET_NET using "connect TARGET_NET"',
    icon: Zap,
    completed: false
  },
  {
    id: 'shop',
    title: 'Equipment Procurement',
    description: 'Access the black market to purchase hacking tools and payloads.',
    command: 'shop',
    hint: 'Type "shop" to access the marketplace',
    icon: Shield,
    completed: false
  }
];

export function TutorialMode({ isActive, onComplete, onExecuteCommand, gameState }: TutorialModeProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState(TUTORIAL_STEPS);
  const [showHint, setShowHint] = useState(false);

  const currentTutorialStep = steps[currentStep];

  useEffect(() => {
    if (!isActive) return;

    // Check if current step is completed based on game state
    const updatedSteps = [...steps];
    
    if (currentStep === 0 && gameState.lastCommand === 'help') {
      updatedSteps[0].completed = true;
    } else if (currentStep === 1 && gameState.lastCommand === 'scan') {
      updatedSteps[1].completed = true;
    } else if (currentStep === 2 && gameState.networkStatus === 'CONNECTED') {
      updatedSteps[2].completed = true;
    } else if (currentStep === 3 && gameState.lastCommand === 'shop') {
      updatedSteps[3].completed = true;
    }

    setSteps(updatedSteps);

    // Auto-advance to next step when current is completed
    if (updatedSteps[currentStep]?.completed && currentStep < steps.length - 1) {
      setTimeout(() => {
        setCurrentStep(prev => prev + 1);
        setShowHint(false);
      }, 2000);
    } else if (updatedSteps[currentStep]?.completed && currentStep === steps.length - 1) {
      setTimeout(() => {
        onComplete();
      }, 3000);
    }
  }, [gameState, currentStep, isActive]);

  const handleExecuteCommand = () => {
    onExecuteCommand(currentTutorialStep.command);
  };

  const handleShowHint = () => {
    setShowHint(true);
    setTimeout(() => setShowHint(false), 5000);
  };

  if (!isActive) return null;

  return (
    <div className="fixed top-4 right-4 z-50 w-80">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 100 }}
          className="bg-black/90 border border-green-500/30 rounded-lg p-4 backdrop-blur-sm"
        >
          {/* Header */}
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-green-900/30 rounded">
              <currentTutorialStep.icon className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <h3 className="text-green-400 font-bold text-sm">
                Tutorial Step {currentStep + 1}/{steps.length}
              </h3>
              <p className="text-green-300 text-xs">
                {currentTutorialStep.title}
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-800 rounded-full h-2 mb-4">
            <motion.div
              className="bg-green-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>

          {/* Content */}
          <div className="space-y-3">
            <p className="text-green-200 text-sm">
              {currentTutorialStep.description}
            </p>

            {/* Command to Execute */}
            <div className="bg-gray-900/50 border border-green-500/20 rounded p-3">
              <p className="text-green-400 text-xs mb-2">EXECUTE COMMAND:</p>
              <div className="flex items-center gap-2">
                <code className="text-green-300 font-mono text-sm flex-1">
                  {currentTutorialStep.command}
                </code>
                <button
                  onClick={handleExecuteCommand}
                  className="p-1 bg-green-600 hover:bg-green-500 rounded text-white"
                  title="Execute command"
                >
                  <Play className="h-3 w-3" />
                </button>
              </div>
            </div>

            {/* Hint */}
            <div className="flex gap-2">
              <button
                onClick={handleShowHint}
                className="text-yellow-400 hover:text-yellow-300 text-xs underline"
              >
                Need a hint?
              </button>
            </div>

            {showHint && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-yellow-900/20 border border-yellow-500/30 rounded p-3"
              >
                <p className="text-yellow-300 text-sm">
                  💡 {currentTutorialStep.hint}
                </p>
              </motion.div>
            )}

            {/* Completion Status */}
            {currentTutorialStep.completed && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-green-900/30 border border-green-500/50 rounded p-3"
              >
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                  <p className="text-green-400 text-sm font-bold">
                    Step Completed! ✓
                  </p>
                </div>
                {currentStep < steps.length - 1 && (
                  <p className="text-green-300 text-xs mt-1">
                    Moving to next step...
                  </p>
                )}
              </motion.div>
            )}
          </div>

          {/* Skip Tutorial */}
          <button
            onClick={onComplete}
            className="mt-4 text-gray-400 hover:text-gray-300 text-xs underline w-full text-center"
          >
            Skip Tutorial
          </button>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}