import React, { useState, useEffect, useCallback } from 'react';
import type { MiniGameState, PatternCrackGame, SignalTraceGame, BinaryTreeGame } from '../types/game';
import { Clock, Target, Zap, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';

interface MiniGameInterfaceProps {
  miniGameState: MiniGameState;
  onGameComplete: (success: boolean, score: number) => void;
  onGameExit: () => void;
}

export function MiniGameInterface({ miniGameState, onGameComplete, onGameExit }: MiniGameInterfaceProps) {
  const [timeLeft, setTimeLeft] = useState(miniGameState.currentGame?.timeLimit || 0);
  const [gameData, setGameData] = useState(miniGameState.gameData);

  // Timer countdown
  useEffect(() => {
    if (!miniGameState.isActive || miniGameState.completed) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          onGameComplete(false, 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [miniGameState.isActive, miniGameState.completed, onGameComplete]);

  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    if (!miniGameState.isActive || miniGameState.completed) return;

    const game = miniGameState.currentGame;
    if (!game) return;

    if (game.type === 'pattern_crack') {
      handlePatternInput(event.key);
    } else if (game.type === 'signal_trace') {
      handleSignalMovement(event.key);
    } else if (game.type === 'binary_tree') {
      handleTreeNavigation(event.key);
    }
  }, [miniGameState, gameData]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  const handlePatternInput = (key: string) => {
    const patternGame = gameData as PatternCrackGame;
    const currentPattern = patternGame.patterns[patternGame.currentPattern];
    
    if (key === 'Backspace') {
      setGameData({
        ...patternGame,
        userInput: patternGame.userInput.slice(0, -1)
      });
    } else if (key === 'Enter') {
      if (patternGame.userInput === currentPattern) {
        const newData = {
          ...patternGame,
          correctSequences: patternGame.correctSequences + 1,
          currentPattern: patternGame.currentPattern + 1,
          userInput: ''
        };
        
        if (newData.currentPattern >= newData.patterns.length) {
          onGameComplete(true, newData.correctSequences * 100);
        } else {
          setGameData(newData);
        }
      } else {
        setGameData({
          ...patternGame,
          userInput: ''
        });
      }
    } else if (/^[0-9A-F]$/.test(key) && patternGame.userInput.length < currentPattern.length) {
      setGameData({
        ...patternGame,
        userInput: patternGame.userInput + key
      });
    }
  };

  const handleSignalMovement = (key: string) => {
    const signalGame = gameData as SignalTraceGame;
    let direction: 'up' | 'down' | 'left' | 'right' | null = null;

    switch (key) {
      case 'ArrowUp':
      case 'w':
      case 'W':
        direction = 'up';
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        direction = 'down';
        break;
      case 'ArrowLeft':
      case 'a':
      case 'A':
        direction = 'left';
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        direction = 'right';
        break;
    }

    if (!direction) return;

    const { playerPosition, grid, targetPosition } = signalGame;
    let newX = playerPosition.x;
    let newY = playerPosition.y;

    switch (direction) {
      case 'up': newY--; break;
      case 'down': newY++; break;
      case 'left': newX--; break;
      case 'right': newX++; break;
    }

    // Check bounds and obstacles
    if (newX < 0 || newX >= grid[0].length || newY < 0 || newY >= grid.length) return;
    if (grid[newY][newX] === 'obstacle') return;

    // Update position
    const newGrid = grid.map(row => [...row]);
    newGrid[playerPosition.y][playerPosition.x] = 'empty';
    newGrid[newY][newX] = 'player';

    const newGameData = {
      ...signalGame,
      grid: newGrid,
      playerPosition: { x: newX, y: newY },
      movesUsed: signalGame.movesUsed + 1
    };

    // Check if reached target
    if (newX === targetPosition.x && newY === targetPosition.y) {
      const score = Math.max(0, 1000 - (newGameData.movesUsed * 10));
      onGameComplete(true, score);
    } else {
      setGameData(newGameData);
    }
  };

  const handleTreeNavigation = (key: string) => {
    const treeGame = gameData as BinaryTreeGame;
    let direction: 'left' | 'right' | null = null;

    switch (key) {
      case 'ArrowLeft':
      case 'a':
      case 'A':
        direction = 'left';
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        direction = 'right';
        break;
    }

    if (!direction) return;

    const currentNode = treeGame.nodes.find(n => n.id === treeGame.currentNode);
    if (!currentNode) return;

    const nextNodeId = direction === 'left' ? currentNode.left : currentNode.right;
    if (!nextNodeId) return;

    const newPath = [...treeGame.path, nextNodeId];
    const newGameData = {
      ...treeGame,
      currentNode: nextNodeId,
      path: newPath
    };

    if (nextNodeId === treeGame.targetNode) {
      const isOptimal = newPath.length <= treeGame.correctPath.length;
      const score = isOptimal ? 1000 : 500;
      onGameComplete(true, score);
    } else {
      setGameData(newGameData);
    }
  };

  if (!miniGameState.currentGame) return null;

  const game = miniGameState.currentGame;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-lg z-50 flex items-center justify-center">
      <div className="bg-gray-900 border border-green-500 rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-green-400">{game.title}</h2>
            <p className="text-green-300 text-sm">{game.description}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-yellow-400">
              <Clock className="w-4 h-4" />
              <span className="font-mono">{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
            </div>
            <button
              onClick={onGameExit}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
            >
              Exit
            </button>
          </div>
        </div>

        {/* Game Content */}
        <div className="space-y-4">
          {game.type === 'pattern_crack' && (
            <PatternCrackingGame gameData={gameData as PatternCrackGame} />
          )}
          {game.type === 'signal_trace' && (
            <SignalTracingGame gameData={gameData as SignalTraceGame} />
          )}
          {game.type === 'binary_tree' && (
            <BinaryTreeGame gameData={gameData as BinaryTreeGame} />
          )}
        </div>

        {/* Game Info */}
        <div className="mt-6 p-4 bg-gray-800 rounded border border-gray-700">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Difficulty:</span>
              <span className="ml-2 text-green-400 font-semibold">{game.difficulty}</span>
            </div>
            <div>
              <span className="text-gray-400">Reward:</span>
              <span className="ml-2 text-yellow-400 font-semibold">{game.reward.credits}₵</span>
            </div>
            <div>
              <span className="text-gray-400">Score:</span>
              <span className="ml-2 text-blue-400 font-semibold">{miniGameState.score}</span>
            </div>
            <div>
              <span className="text-gray-400">Mistakes:</span>
              <span className="ml-2 text-red-400 font-semibold">{miniGameState.mistakes}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Pattern Cracking Game Component
function PatternCrackingGame({ gameData }: { gameData: PatternCrackGame }) {
  const currentPattern = gameData.patterns[gameData.currentPattern];
  const progress = (gameData.currentPattern / gameData.patterns.length) * 100;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="text-lg text-green-300 mb-2">
          Pattern {gameData.currentPattern + 1} of {gameData.patterns.length}
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
          <div 
            className="bg-green-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="text-center space-y-4">
        <div className="text-2xl font-mono text-yellow-400 bg-gray-800 p-4 rounded border">
          {currentPattern}
        </div>
        
        <div className="text-lg text-gray-300">Enter the pattern above:</div>
        
        <div className="text-2xl font-mono text-green-400 bg-gray-800 p-4 rounded border min-h-[60px] flex items-center justify-center">
          {gameData.userInput || <span className="text-gray-500">Type here...</span>}
          <span className="animate-pulse">|</span>
        </div>
        
        <div className="text-sm text-gray-400">
          Use 0-9 and A-F keys. Press Enter to submit, Backspace to delete.
        </div>
      </div>
    </div>
  );
}

// Signal Tracing Game Component
function SignalTracingGame({ gameData }: { gameData: SignalTraceGame }) {
  const { grid, playerPosition, targetPosition, movesUsed, maxMoves } = gameData;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="text-green-300">
          Moves: {movesUsed} / {maxMoves}
        </div>
        <div className="text-yellow-400">
          Find the signal source!
        </div>
      </div>

      <div className="grid gap-1 p-4 bg-gray-800 rounded" style={{ 
        gridTemplateColumns: `repeat(${grid[0].length}, 1fr)`,
        maxWidth: 'fit-content',
        margin: '0 auto'
      }}>
        {grid.map((row, y) =>
          row.map((cell, x) => (
            <div
              key={`${x}-${y}`}
              className={`w-8 h-8 border border-gray-600 flex items-center justify-center text-xs font-bold ${
                cell === 'player' ? 'bg-blue-500 text-white' :
                cell === 'target' ? 'bg-red-500 text-white animate-pulse' :
                cell === 'obstacle' ? 'bg-gray-700' :
                cell === 'signal' ? 'bg-green-500/50' :
                'bg-gray-900'
              }`}
            >
              {cell === 'player' && '👤'}
              {cell === 'target' && '🎯'}
              {cell === 'obstacle' && '█'}
              {cell === 'signal' && '•'}
            </div>
          ))
        )}
      </div>

      <div className="text-center space-y-2">
        <div className="flex justify-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            <span>Player</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span>Target</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500/50 rounded"></div>
            <span>Signal</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-700 rounded"></div>
            <span>Obstacle</span>
          </div>
        </div>
        <div className="text-gray-400 text-sm">
          Use arrow keys or WASD to move
        </div>
      </div>
    </div>
  );
}

// Binary Tree Game Component
function BinaryTreeGame({ gameData }: { gameData: BinaryTreeGame }) {
  const { nodes, currentNode, targetNode, path } = gameData;
  const currentNodeData = nodes.find(n => n.id === currentNode);
  const targetNodeData = nodes.find(n => n.id === targetNode);

  // Group nodes by depth for display
  const nodesByDepth: Record<number, typeof nodes> = {};
  nodes.forEach(node => {
    if (!nodesByDepth[node.depth]) {
      nodesByDepth[node.depth] = [];
    }
    nodesByDepth[node.depth].push(node);
  });

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="text-lg text-green-300">
          Find: <span className="text-yellow-400 font-bold">{targetNodeData?.value}</span>
        </div>
        <div className="text-sm text-gray-400">
          Current: <span className="text-blue-400">{currentNodeData?.value}</span> | 
          Path Length: <span className="text-purple-400">{path.length}</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-max space-y-4">
          {Object.entries(nodesByDepth).map(([depth, depthNodes]) => (
            <div key={depth} className="flex justify-center items-center space-x-8">
              {depthNodes.map(node => (
                <div
                  key={node.id}
                  className={`
                    px-4 py-2 rounded border-2 text-center min-w-[80px] font-mono
                    ${node.id === currentNode ? 'bg-blue-500 border-blue-300 text-white' :
                      node.id === targetNode ? 'bg-red-500 border-red-300 text-white animate-pulse' :
                      path.includes(node.id) ? 'bg-green-500/30 border-green-400 text-green-300' :
                      'bg-gray-800 border-gray-600 text-gray-300'}
                  `}
                >
                  <div className="text-sm font-bold">{node.value}</div>
                  <div className="text-xs opacity-75">{node.id}</div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="text-center space-y-2">
        <div className="flex justify-center gap-4">
          <div className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            <span>Left Child (A key)</span>
          </div>
          <div className="flex items-center gap-2">
            <ArrowRight className="w-4 h-4" />
            <span>Right Child (D key)</span>
          </div>
        </div>
        <div className="text-gray-400 text-sm">
          Navigate to find the target node
        </div>
      </div>
    </div>
  );
} 