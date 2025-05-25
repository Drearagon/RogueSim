import { useEffect, useRef, useState } from 'react';
import { useSound } from '../hooks/useSound';
import { commands } from '../lib/commands';
import { GameState } from '../types/game';
import { logCommand } from '../lib/gameStorage';
import { checkEasterEgg, discoverEasterEgg, checkKonamiCode, loadDiscoveredEasterEggs, getEasterEggStats, EasterEgg } from '../lib/easterEggs';
import { MemoryTrace } from './MemoryTrace';

interface TerminalProps {
  gameState: GameState;
  onGameStateUpdate: (updates: Partial<GameState>) => void;
}

export function Terminal({ gameState, onGameStateUpdate }: TerminalProps) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const [output, setOutput] = useState<string[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [cursorVisible, setCursorVisible] = useState(true);
  const [showMemoryTrace, setShowMemoryTrace] = useState(false);
  const { playKeypress, playError, playSuccess } = useSound();

  // Cursor blink effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCursorVisible(prev => !prev);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // Initial welcome message
  useEffect(() => {
    const welcomeMessage = [
      '╔═══════════════════════════════════════╗',
      '║           ROGUE-SIM v1.0              ║',
      '║       ESP32 HACKER TERMINAL           ║',
      '╠═══════════════════════════════════════╣',
      '║ Welcome to the Shadow Network.        ║',
      '║ Type "help" for available commands.   ║',
      '║ Type "shop" to access marketplace.    ║',
      '║                                       ║',
      '║ Remember: We never existed.           ║',
      '╚═══════════════════════════════════════╝',
      ''
    ];
    setOutput(welcomeMessage);
    
    // Ensure shop command is always available
    if (!gameState.unlockedCommands.includes('shop')) {
      onGameStateUpdate({
        unlockedCommands: [...gameState.unlockedCommands, 'shop']
      });
    }
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [output]);

  const executeCommand = (input: string) => {
    if (!input.trim()) return;

    // Add command to history
    setCommandHistory(prev => [...prev, input]);
    setHistoryIndex(-1);

    // Add command to output
    setOutput(prev => [...prev, `shadow@roguesim:~$ ${input}`]);

    // Check for easter eggs first!
    const easterEgg = checkEasterEgg(input, gameState);
    if (easterEgg) {
      handleEasterEggDiscovery(easterEgg);
      return;
    }

    // Parse command
    const parts = input.trim().split(' ');
    const commandName = parts[0].toLowerCase();
    const args = parts.slice(1);

    // Check if command exists and is unlocked
    if (!commands[commandName]) {
      setOutput(prev => [...prev, `Command not found: ${commandName}`, 'Type "help" for available commands.', '']);
      playError();
      return;
    }

    // Allow certain commands to bypass unlock system
    const alwaysAvailable = ['help', 'multiplayer', 'leaderboard', 'devmode', 'easter'];
    if (!gameState.unlockedCommands.includes(commandName) && !alwaysAvailable.includes(commandName)) {
      setOutput(prev => [...prev, 'ERROR: Command locked. Complete missions to unlock.', '']);
      playError();
      return;
    }

    // Execute command
    const result = commands[commandName].execute(args, gameState);
    
    // Log command execution to database
    logCommand(commandName, args, result.success, result.output).catch(error => {
      console.warn('Failed to log command:', error);
    });
    
    // Handle special commands
    if (result.output.includes('CLEAR_SCREEN')) {
      setOutput([]);
      return;
    }

    // Add output
    setOutput(prev => [...prev, ...result.output]);

    // Update game state if needed
    if (result.updateGameState) {
      onGameStateUpdate(result.updateGameState);
    }

    // Play sound effect
    if (result.soundEffect) {
      switch (result.soundEffect) {
        case 'success':
          playSuccess();
          break;
        case 'error':
          playError();
          break;
        case 'keypress':
        default:
          playKeypress();
          break;
      }
    } else if (result.success) {
      playKeypress();
    } else {
      playError();
    }
  }

  const handleEasterEggDiscovery = (easterEgg: EasterEgg) => {
    discoverEasterEgg(easterEgg.id);
    
    const rarityColors = {
      'common': '🟢',
      'rare': '🔵', 
      'epic': '🟣',
      'legendary': '🟡'
    };

    const eggOutput = [
      `${rarityColors[easterEgg.rarity]} EASTER EGG DISCOVERED! ${rarityColors[easterEgg.rarity]}`,
      "",
      `🎉 ${easterEgg.name}`,
      `📝 ${easterEgg.description}`,
      ""
    ];

    const updates: Partial<GameState> = {};

    if (easterEgg.reward.credits) {
      eggOutput.push(`💰 Earned ${easterEgg.reward.credits} credits!`);
      updates.credits = (gameState.credits || 0) + easterEgg.reward.credits;
    }

    if (easterEgg.reward.reputation) {
      eggOutput.push(`⭐ Reputation upgraded to ${easterEgg.reward.reputation}!`);
      updates.reputation = easterEgg.reward.reputation;
    }

    if (easterEgg.reward.unlockedCommands) {
      eggOutput.push(`🔓 Unlocked commands: ${easterEgg.reward.unlockedCommands.join(', ')}`);
      updates.unlockedCommands = [...(gameState.unlockedCommands || []), ...easterEgg.reward.unlockedCommands];
    }

    if (easterEgg.reward.specialItems) {
      eggOutput.push(`🎁 Special items: ${easterEgg.reward.specialItems.join(', ')}`);
    }

    if (easterEgg.reward.achievement) {
      eggOutput.push(`🏆 Achievement unlocked: ${easterEgg.reward.achievement}`);
    }

    if (easterEgg.reward.secretMessage) {
      eggOutput.push("", `💬 Secret Message:`);
      eggOutput.push(`"${easterEgg.reward.secretMessage}"`);
    }

    const stats = getEasterEggStats();
    eggOutput.push("", `🔍 Easter Eggs: ${stats.discovered}/${stats.total} discovered`);

    setOutput(prev => [...prev, ...eggOutput, '']);
    
    if (Object.keys(updates).length > 0) {
      onGameStateUpdate(updates);
    }
    
    playSuccess();
  };

  // Load discovered easter eggs on mount
  useEffect(() => {
    loadDiscoveredEasterEggs();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Check for Konami code
    const konamiEgg = checkKonamiCode(e.code);
    if (konamiEgg) {
      handleEasterEggDiscovery(konamiEgg);
      return;
    }

    switch (e.key) {
      case 'Enter':
        executeCommand(currentInput);
        setCurrentInput('');
        break;
      
      case 'Backspace':
        setCurrentInput(prev => prev.slice(0, -1));
        break;
      
      case 'ArrowUp':
        e.preventDefault();
        if (historyIndex < commandHistory.length - 1) {
          const newIndex = historyIndex + 1;
          setHistoryIndex(newIndex);
          setCurrentInput(commandHistory[commandHistory.length - 1 - newIndex]);
        }
        break;
      
      case 'ArrowDown':
        e.preventDefault();
        if (historyIndex > 0) {
          const newIndex = historyIndex - 1;
          setHistoryIndex(newIndex);
          setCurrentInput(commandHistory[commandHistory.length - 1 - newIndex]);
        } else if (historyIndex === 0) {
          setHistoryIndex(-1);
          setCurrentInput('');
        }
        break;
      
      default:
        if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
          setCurrentInput(prev => prev + e.key);
          playKeypress();
        }
        break;
    }
  };

  return (
    <div className="flex flex-col h-screen w-full max-w-full bg-gradient-to-br from-black via-green-900/5 to-black relative overflow-x-hidden">
      {/* Scanline effect */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute w-full h-0.5 bg-gradient-to-r from-transparent via-green-500/30 to-transparent animate-pulse" 
             style={{ top: '50%', animation: 'scanline 2s linear infinite' }}>
        </div>
      </div>
      
      {/* Status bar */}
      <div className="bg-green-900/20 border-b border-green-500/50 px-2 md:px-4 py-2 flex items-center justify-between text-xs md:text-sm backdrop-blur-sm flex-shrink-0">
        <div className="flex items-center space-x-2 md:space-x-4">
          <span className="text-cyan-400 hidden md:inline">RogueSim v1.0</span>
          <span className="text-cyan-400 md:hidden">RS</span>
          <span className="animate-pulse text-green-500">●</span>
          <span className="text-green-400 truncate">{gameState.networkStatus}</span>
        </div>
        <div className="flex items-center space-x-2 md:space-x-4">
          <span className="text-yellow-400 hidden md:inline">{new Date().toLocaleTimeString('en-US', { hour12: false })}</span>
          <span className="text-green-400 hidden md:inline">UNDISCLOSED</span>
          <button 
            className="border border-green-500 bg-transparent text-green-500 px-2 py-1 text-xs hover:bg-green-500 hover:text-black transition-colors"
            onClick={() => {
              const newEnabled = !gameState.soundEnabled;
              onGameStateUpdate({ soundEnabled: newEnabled });
            }}
          >
            {gameState.soundEnabled ? '🔊' : '🔇'}
          </button>
        </div>
      </div>
      
      {/* Terminal content */}
      <div 
        ref={terminalRef}
        className="flex-1 min-h-0 p-2 md:p-4 overflow-y-auto font-mono text-green-500 focus:outline-none text-xs md:text-sm"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onClick={() => terminalRef.current?.focus()}
      >
        <div className="min-h-full w-full max-w-full">
          {output.map((line, index) => (
            <div key={index} className="whitespace-pre-wrap break-all w-full max-w-full overflow-hidden">
              {line}
            </div>
          ))}
          
          {/* Current input line */}
          <div className="flex items-center w-full max-w-full overflow-hidden">
            <span className="text-green-400 flex-shrink-0">shadow@roguesim:~$ </span>
            <span className="break-all flex-1 min-w-0">{currentInput}</span>
            <span className={`ml-0 flex-shrink-0 ${cursorVisible ? 'opacity-100' : 'opacity-0'} bg-green-500`}>█</span>
          </div>
        </div>
      </div>
      
      {/* Mobile input area */}
      <div className="md:hidden bg-black/90 border-t border-green-500/50 p-3 flex-shrink-0">
        <div className="flex items-center space-x-2">
          <span className="text-green-400 text-sm">$</span>
          <input
            type="text"
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                executeCommand(currentInput);
                setCurrentInput('');
                e.preventDefault();
              }
            }}
            className="flex-1 bg-transparent border border-green-500/50 text-green-500 p-2 text-sm font-mono focus:outline-none focus:border-green-400 min-w-0"
            placeholder="Type command here..."
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck="false"
          />
          <button
            onClick={() => {
              executeCommand(currentInput);
              setCurrentInput('');
            }}
            className="bg-green-500 text-black px-3 py-2 text-sm font-bold hover:bg-green-400 transition-colors flex-shrink-0"
          >
            EXEC
          </button>
        </div>
        
        {/* Quick command buttons for mobile */}
        <div className="flex flex-wrap gap-1 mt-2">
          {['help', 'scan wifi', 'status', 'clear'].map((cmd) => (
            <button
              key={cmd}
              onClick={() => setCurrentInput(cmd)}
              className="border border-green-500/50 bg-transparent text-green-500 px-2 py-1 text-xs hover:bg-green-500 hover:text-black transition-colors"
            >
              {cmd}
            </button>
          ))}
        </div>
      </div>
      
      {/* Command hints - Hidden on mobile to save space */}
      <div className="absolute bottom-4 left-4 bg-black/80 border border-green-500/50 p-2 rounded backdrop-blur-sm opacity-75 hover:opacity-100 transition-opacity hidden md:block">
        <div className="text-xs space-y-1">
          <div className="text-cyan-400">Quick Commands:</div>
          <div className="grid grid-cols-3 gap-2 text-green-400">
            <span className="cursor-pointer hover:text-green-300" onClick={() => setCurrentInput('help')}>help</span>
            <span className="cursor-pointer hover:text-green-300" onClick={() => setCurrentInput('scan wifi')}>scan wifi</span>
            <span className="cursor-pointer hover:text-green-300" onClick={() => setCurrentInput('status')}>status</span>
          </div>
        </div>
      </div>
    </div>
  );
}
