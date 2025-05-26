import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Zap, Shield, Eye, Target } from 'lucide-react';
import { commands } from '../lib/commands';

interface CommandAutocompleteProps {
  currentInput: string;
  isVisible: boolean;
  onCommandSelect: (command: string) => void;
  gameState: any;
}

interface CommandSuggestion {
  name: string;
  description: string;
  usage: string;
  category: 'basic' | 'network' | 'exploit' | 'utility' | 'advanced';
  isLocked: boolean;
  icon: React.ComponentType<any>;
}

const COMMAND_CATEGORIES = {
  basic: { color: 'text-green-400', bgColor: 'bg-green-900/30', icon: Terminal },
  network: { color: 'text-blue-400', bgColor: 'bg-blue-900/30', icon: Target },
  exploit: { color: 'text-red-400', bgColor: 'bg-red-900/30', icon: Zap },
  utility: { color: 'text-yellow-400', bgColor: 'bg-yellow-900/30', icon: Eye },
  advanced: { color: 'text-purple-400', bgColor: 'bg-purple-900/30', icon: Shield }
};

export function CommandAutocomplete({ currentInput, isVisible, onCommandSelect, gameState }: CommandAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<CommandSuggestion[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const categorizeCommand = (commandName: string): 'basic' | 'network' | 'exploit' | 'utility' | 'advanced' => {
    const basicCommands = ['help', 'clear', 'status', 'shop'];
    const networkCommands = ['scan', 'connect', 'disconnect', 'extended_scan', 'wifi_monitor'];
    const exploitCommands = ['inject', 'exploit', 'backdoor', 'crack', 'iot_hack'];
    const utilityCommands = ['decrypt', 'extract_data', 'file_recovery', 'easter'];
    
    if (basicCommands.includes(commandName)) return 'basic';
    if (networkCommands.includes(commandName)) return 'network';
    if (exploitCommands.includes(commandName)) return 'exploit';
    if (utilityCommands.includes(commandName)) return 'utility';
    return 'advanced';
  };

  const isCommandLocked = (commandName: string): boolean => {
    const alwaysAvailable = ['help', 'multiplayer', 'leaderboard', 'devmode', 'easter', 'reset_shop', 'shop', 'clear', 'status'];
    return !gameState.unlockedCommands?.includes(commandName) && !alwaysAvailable.includes(commandName);
  };

  useEffect(() => {
    if (!currentInput.trim() || !isVisible) {
      setSuggestions([]);
      return;
    }

    const input = currentInput.toLowerCase().trim();
    const filteredCommands = Object.entries(commands)
      .filter(([name]) => name.toLowerCase().includes(input))
      .slice(0, 8)
      .map(([name, command]): CommandSuggestion => {
        const category = categorizeCommand(name);
        const categoryInfo = COMMAND_CATEGORIES[category];
        
        return {
          name,
          description: command.description,
          usage: command.usage,
          category,
          isLocked: isCommandLocked(name),
          icon: categoryInfo.icon
        };
      });

    setSuggestions(filteredCommands);
    setSelectedIndex(0);
  }, [currentInput, isVisible, gameState.unlockedCommands]);

  const handleKeyNavigation = (key: string) => {
    if (!suggestions.length) return;

    switch (key) {
      case 'ArrowDown':
        setSelectedIndex(prev => (prev + 1) % suggestions.length);
        break;
      case 'ArrowUp':
        setSelectedIndex(prev => (prev - 1 + suggestions.length) % suggestions.length);
        break;
      case 'Tab':
      case 'Enter':
        const selected = suggestions[selectedIndex];
        if (selected && !selected.isLocked) {
          onCommandSelect(selected.name);
        }
        break;
    }
  };

  // Expose key handler to parent
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isVisible && suggestions.length > 0) {
        if (['ArrowDown', 'ArrowUp'].includes(e.key)) {
          e.preventDefault();
          handleKeyNavigation(e.key);
        } else if (e.key === 'Tab') {
          e.preventDefault();
          handleKeyNavigation(e.key);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, suggestions, selectedIndex]);

  if (!isVisible || !suggestions.length) return null;

  return (
    <div ref={containerRef} className="relative">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute bottom-full left-0 right-0 mb-2 bg-black/95 border border-green-500/30 rounded-lg backdrop-blur-sm shadow-2xl max-h-80 overflow-y-auto"
        >
          {/* Header */}
          <div className="px-4 py-2 border-b border-green-500/20">
            <div className="flex items-center gap-2">
              <Terminal className="h-4 w-4 text-green-400" />
              <span className="text-green-400 text-sm font-semibold">Command Suggestions</span>
              <span className="text-gray-500 text-xs ml-auto">
                Use ↑↓ to navigate, Tab to complete
              </span>
            </div>
          </div>

          {/* Suggestions */}
          <div className="py-2">
            {suggestions.map((suggestion, index) => {
              const categoryInfo = COMMAND_CATEGORIES[suggestion.category];
              const isSelected = index === selectedIndex;
              
              return (
                <motion.div
                  key={suggestion.name}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`px-4 py-3 cursor-pointer transition-all border-l-2 ${
                    isSelected
                      ? `${categoryInfo.bgColor} border-l-green-500 bg-green-900/20`
                      : 'border-l-transparent hover:bg-gray-800/50'
                  } ${suggestion.isLocked ? 'opacity-50' : ''}`}
                  onClick={() => !suggestion.isLocked && onCommandSelect(suggestion.name)}
                >
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className={`p-1.5 rounded ${categoryInfo.bgColor}`}>
                      <suggestion.icon className={`h-4 w-4 ${categoryInfo.color}`} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`font-mono font-bold ${
                          suggestion.isLocked ? 'text-gray-500' : categoryInfo.color
                        }`}>
                          {suggestion.name}
                        </span>
                        
                        {suggestion.isLocked && (
                          <span className="text-xs text-red-400 bg-red-900/30 px-2 py-0.5 rounded">
                            LOCKED
                          </span>
                        )}
                        
                        <span className={`text-xs px-2 py-0.5 rounded ${categoryInfo.bgColor} ${categoryInfo.color}`}>
                          {suggestion.category.toUpperCase()}
                        </span>
                      </div>
                      
                      <p className="text-gray-300 text-sm mb-1 line-clamp-2">
                        {suggestion.description}
                      </p>
                      
                      <div className="font-mono text-xs text-gray-400 bg-gray-900/50 px-2 py-1 rounded">
                        {suggestion.usage}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="px-4 py-2 border-t border-green-500/20 text-xs text-gray-500">
            <div className="flex justify-between items-center">
              <span>
                {suggestions.filter(s => !s.isLocked).length} available commands
              </span>
              <span>
                {suggestions.filter(s => s.isLocked).length} locked commands
              </span>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// Syntax highlighting component for the input
export function SyntaxHighlighter({ input, className = '' }: { input: string; className?: string }) {
  const parts = input.split(' ');
  const commandName = parts[0]?.toLowerCase();
  const args = parts.slice(1);

  const getCommandColor = (cmd: string): string => {
    if (!cmd) return 'text-white';
    
    const commandExists = commands[cmd];
    if (!commandExists) return 'text-red-400'; // Invalid command
    
    const basicCommands = ['help', 'clear', 'status', 'shop'];
    const networkCommands = ['scan', 'connect', 'disconnect'];
    const exploitCommands = ['inject', 'exploit', 'backdoor'];
    
    if (basicCommands.includes(cmd)) return 'text-green-400';
    if (networkCommands.includes(cmd)) return 'text-blue-400';
    if (exploitCommands.includes(cmd)) return 'text-red-400';
    return 'text-purple-400';
  };

  const getArgColor = (arg: string, index: number): string => {
    // Special argument highlighting
    if (arg.startsWith('--')) return 'text-yellow-400'; // Flags
    if (arg.includes('.') && (arg.includes('com') || arg.includes('net'))) return 'text-cyan-400'; // URLs/IPs
    if (arg.includes('_')) return 'text-orange-400'; // Identifiers
    return 'text-gray-300'; // Regular args
  };

  return (
    <span className={`font-mono ${className}`}>
      <span className={getCommandColor(commandName)}>
        {parts[0] || ''}
      </span>
      {args.map((arg, index) => (
        <span key={index}>
          <span className="text-white"> </span>
          <span className={getArgColor(arg, index)}>
            {arg}
          </span>
        </span>
      ))}
    </span>
  );
}