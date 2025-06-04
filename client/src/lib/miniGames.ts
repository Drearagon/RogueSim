import { MiniGame, MiniGameState, PatternCrackGame, SignalTraceGame, BinaryTreeGame, TreeNode } from '../types/game';

// Available mini-games
export const miniGames: Record<string, MiniGame> = {
  pattern_crack_easy: {
    id: 'pattern_crack_easy',
    type: 'pattern_crack',
    title: 'Pattern Cracking - Basic',
    description: 'Match encryption sequences to break basic ciphers',
    difficulty: 'EASY',
    timeLimit: 60,
    reward: {
      credits: 200,
      experience: 50
    },
    config: {
      patternLength: 4,
      sequenceCount: 3,
      allowedMistakes: 2
    }
  },
  pattern_crack_hard: {
    id: 'pattern_crack_hard',
    type: 'pattern_crack',
    title: 'Pattern Cracking - Advanced',
    description: 'Crack complex encryption patterns under time pressure',
    difficulty: 'HARD',
    timeLimit: 45,
    reward: {
      credits: 500,
      experience: 100
    },
    config: {
      patternLength: 6,
      sequenceCount: 5,
      allowedMistakes: 1
    }
  },
  signal_trace_easy: {
    id: 'signal_trace_easy',
    type: 'signal_trace',
    title: 'Signal Tracing - Basic',
    description: 'Navigate network topology to trace signal origins',
    difficulty: 'EASY',
    timeLimit: 90,
    reward: {
      credits: 300,
      experience: 75
    },
    config: {
      gridSize: { width: 8, height: 8 },
      obstacles: 10,
      signalStrength: 100
    }
  },
  signal_trace_expert: {
    id: 'signal_trace_expert',
    type: 'signal_trace',
    title: 'Signal Tracing - Expert',
    description: 'Navigate complex network with multiple obstacles',
    difficulty: 'EXPERT',
    timeLimit: 60,
    reward: {
      credits: 800,
      experience: 150
    },
    config: {
      gridSize: { width: 12, height: 12 },
      obstacles: 25,
      signalStrength: 75
    }
  },
  binary_tree_medium: {
    id: 'binary_tree_medium',
    type: 'binary_tree',
    title: 'Binary Tree Navigation',
    description: 'Navigate data structures to find target nodes',
    difficulty: 'MEDIUM',
    timeLimit: 75,
    reward: {
      credits: 400,
      experience: 100
    },
    config: {
      treeDepth: 4,
      nodeCount: 15
    }
  },
  binary_tree_expert: {
    id: 'binary_tree_expert',
    type: 'binary_tree',
    title: 'Binary Tree - Expert',
    description: 'Navigate complex tree structures efficiently',
    difficulty: 'EXPERT',
    timeLimit: 60,
    reward: {
      credits: 700,
      experience: 150
    },
    config: {
      treeDepth: 6,
      nodeCount: 31
    }
  }
};

// Initialize a mini-game
export function initializeMiniGame(gameId: string): MiniGameState | null {
  const game = miniGames[gameId];
  if (!game) return null;

  const baseState: MiniGameState = {
    isActive: true,
    currentGame: game,
    gameData: null,
    startTime: Date.now(),
    score: 0,
    mistakes: 0,
    completed: false,
    success: false
  };

  switch (game.type) {
    case 'pattern_crack':
      baseState.gameData = initializePatternCrack(game);
      break;
    case 'signal_trace':
      baseState.gameData = initializeSignalTrace(game);
      break;
    case 'binary_tree':
      baseState.gameData = initializeBinaryTree(game);
      break;
    default:
      return null;
  }

  return baseState;
}

// Pattern Cracking Game
function initializePatternCrack(game: MiniGame): PatternCrackGame {
  const patterns = generatePatterns(
    game.config.patternLength || 4,
    game.config.sequenceCount || 3
  );

  return {
    patterns,
    currentPattern: 0,
    userInput: '',
    correctSequences: 0,
    timeRemaining: game.timeLimit
  };
}

function generatePatterns(length: number, count: number): string[] {
  const chars = '0123456789ABCDEF';
  const patterns: string[] = [];
  
  for (let i = 0; i < count; i++) {
    let pattern = '';
    for (let j = 0; j < length; j++) {
      pattern += chars[Math.floor(Math.random() * chars.length)];
    }
    patterns.push(pattern);
  }
  
  return patterns;
}

// Signal Tracing Game
function initializeSignalTrace(game: MiniGame): SignalTraceGame {
  const { width, height } = game.config.gridSize || { width: 8, height: 8 };
  const obstacles = game.config.obstacles || 10;
  
  // Initialize empty grid
  const grid: ('empty' | 'obstacle' | 'signal' | 'target' | 'player')[][] = [];
  for (let y = 0; y < height; y++) {
    grid[y] = [];
    for (let x = 0; x < width; x++) {
      grid[y][x] = 'empty';
    }
  }
  
  // Place obstacles randomly
  for (let i = 0; i < obstacles; i++) {
    let x, y;
    do {
      x = Math.floor(Math.random() * width);
      y = Math.floor(Math.random() * height);
    } while (grid[y][x] !== 'empty');
    grid[y][x] = 'obstacle';
  }
  
  // Place player at top-left
  const playerPosition = { x: 0, y: 0 };
  grid[0][0] = 'player';
  
  // Place target at bottom-right
  const targetPosition = { x: width - 1, y: height - 1 };
  grid[height - 1][width - 1] = 'target';
  
  return {
    grid,
    playerPosition,
    targetPosition,
    signalPath: [],
    signalStrength: game.config.signalStrength || 100,
    movesUsed: 0,
    maxMoves: Math.floor((width + height) * 1.5)
  };
}

// Binary Tree Game
function initializeBinaryTree(game: MiniGame): BinaryTreeGame {
  const depth = game.config.treeDepth || 4;
  const nodeCount = game.config.nodeCount || 15;
  
  const nodes = generateBinaryTreeNodes(depth, nodeCount);
  const rootNode = nodes[0].id;
  const targetNode = nodes[nodes.length - 1].id;
  
  return {
    nodes,
    currentNode: rootNode,
    targetNode,
    path: [rootNode],
    correctPath: findOptimalPath(nodes, rootNode, targetNode),
    maxDepth: depth
  };
}

function generateBinaryTreeNodes(depth: number, nodeCount: number): TreeNode[] {
  const nodes: TreeNode[] = [];
  const values = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  
  for (let i = 0; i < nodeCount; i++) {
    const nodeDepth = Math.floor(Math.log2(i + 1));
    const node: TreeNode = {
      id: `node_${i}`,
      value: values[i % values.length],
      depth: nodeDepth,
      isTarget: i === nodeCount - 1
    };
    
    // Set parent/child relationships
    if (i > 0) {
      const parentIndex = Math.floor((i - 1) / 2);
      node.parent = `node_${parentIndex}`;
      
      if (i % 2 === 1) {
        // Left child
        nodes[parentIndex].left = node.id;
      } else {
        // Right child
        nodes[parentIndex].right = node.id;
      }
    }
    
    nodes.push(node);
  }
  
  return nodes;
}

function findOptimalPath(nodes: TreeNode[], startId: string, targetId: string): string[] {
  // Simple BFS to find shortest path
  const queue = [{ nodeId: startId, path: [startId] }];
  const visited = new Set<string>();
  
  while (queue.length > 0) {
    const { nodeId, path } = queue.shift()!;
    
    if (nodeId === targetId) {
      return path;
    }
    
    if (visited.has(nodeId)) continue;
    visited.add(nodeId);
    
    const node = nodes.find(n => n.id === nodeId);
    if (!node) continue;
    
    // Add children to queue
    if (node.left) {
      queue.push({ nodeId: node.left, path: [...path, node.left] });
    }
    if (node.right) {
      queue.push({ nodeId: node.right, path: [...path, node.right] });
    }
  }
  
  return [startId]; // Fallback
}

// Game state updates
export function updatePatternCrack(gameData: PatternCrackGame, input: string): { success: boolean; completed: boolean; score: number } {
  const currentPattern = gameData.patterns[gameData.currentPattern];
  
  if (input === currentPattern) {
    gameData.correctSequences++;
    gameData.currentPattern++;
    
    const completed = gameData.currentPattern >= gameData.patterns.length;
    const score = gameData.correctSequences * 100;
    
    return { success: true, completed, score };
  }
  
  return { success: false, completed: false, score: 0 };
}

export function movePlayerInSignalTrace(gameData: SignalTraceGame, direction: 'up' | 'down' | 'left' | 'right'): { success: boolean; completed: boolean; score: number } {
  const { playerPosition, grid, targetPosition } = gameData;
  let newX = playerPosition.x;
  let newY = playerPosition.y;
  
  switch (direction) {
    case 'up': newY--; break;
    case 'down': newY++; break;
    case 'left': newX--; break;
    case 'right': newX++; break;
  }
  
  // Check bounds and obstacles
  if (newX < 0 || newX >= grid[0].length || newY < 0 || newY >= grid.length) {
    return { success: false, completed: false, score: 0 };
  }
  
  if (grid[newY][newX] === 'obstacle') {
    return { success: false, completed: false, score: 0 };
  }
  
  // Update position
  grid[playerPosition.y][playerPosition.x] = 'signal';
  playerPosition.x = newX;
  playerPosition.y = newY;
  grid[newY][newX] = 'player';
  gameData.movesUsed++;
  
  // Check if reached target
  const completed = newX === targetPosition.x && newY === targetPosition.y;
  const score = completed ? Math.max(0, 1000 - (gameData.movesUsed * 10)) : 0;
  
  return { success: true, completed, score };
}

export function navigateBinaryTree(gameData: BinaryTreeGame, direction: 'left' | 'right'): { success: boolean; completed: boolean; score: number } {
  const currentNode = gameData.nodes.find(n => n.id === gameData.currentNode);
  if (!currentNode) return { success: false, completed: false, score: 0 };
  
  const nextNodeId = direction === 'left' ? currentNode.left : currentNode.right;
  if (!nextNodeId) return { success: false, completed: false, score: 0 };
  
  gameData.currentNode = nextNodeId;
  gameData.path.push(nextNodeId);
  
  const completed = nextNodeId === gameData.targetNode;
  const score = completed ? Math.max(0, 1000 - (gameData.path.length * 50)) : 0;
  
  return { success: true, completed, score };
} 