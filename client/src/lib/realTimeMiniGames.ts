import { GameState, MiniGame, MiniGameState } from '../types/game';

export interface RealTimeMiniGame {
  id: string;
  name: string;
  description: string;
  type: 'pattern_crack' | 'signal_trace' | 'binary_tree' | 'memory_sequence' | 'typing_challenge' | 'code_injection';
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT';
  timeLimit: number;
  isActive: boolean;
  startTime: number;
  gameData: any;
  onUpdate: (gameData: any, input: string) => { success: boolean; gameData: any; message: string; completed?: boolean };
  onComplete: (success: boolean, timeElapsed: number) => { credits: number; experience: number; message: string };
}

export interface PatternCrackData {
  patterns: string[];
  currentPattern: number;
  userInput: string;
  correctSequences: number;
  totalPatterns: number;
  mistakes: number;
  maxMistakes: number;
}

export interface SignalTraceData {
  grid: string[][];
  playerPos: { x: number; y: number };
  targetPos: { x: number; y: number };
  signalPath: { x: number; y: number }[];
  movesUsed: number;
  maxMoves: number;
  signalStrength: number;
}

export interface BinaryTreeData {
  nodes: { [key: string]: { value: string; left?: string; right?: string; parent?: string } };
  currentNode: string;
  targetNode: string;
  path: string[];
  correctPath: string[];
  maxDepth: number;
}

export interface MemorySequenceData {
  sequence: string[];
  userSequence: string[];
  currentIndex: number;
  displayPhase: boolean;
  displayIndex: number;
  sequenceLength: number;
}

export interface TypingChallengeData {
  text: string;
  userInput: string;
  currentIndex: number;
  mistakes: number;
  wpm: number;
  accuracy: number;
  startTime: number;
}

export interface CodeInjectionData {
  targetCode: string;
  userCode: string;
  vulnerabilities: string[];
  exploitsFound: string[];
  codeLines: string[];
  currentLine: number;
}

export class RealTimeMiniGameSystem {
  private activeGame: RealTimeMiniGame | null = null;
  private gameHistory: { gameId: string; success: boolean; timeElapsed: number; score: number }[] = [];

  public startGame(gameType: string, difficulty: string = 'MEDIUM'): RealTimeMiniGame | null {
    if (this.activeGame) {
      return null; // Game already active
    }

    let game: RealTimeMiniGame;

    switch (gameType) {
      case 'pattern_crack':
        game = this.createPatternCrackGame(difficulty as any);
        break;
      case 'signal_trace':
        game = this.createSignalTraceGame(difficulty as any);
        break;
      case 'binary_tree':
        game = this.createBinaryTreeGame(difficulty as any);
        break;
      case 'memory_sequence':
        game = this.createMemorySequenceGame(difficulty as any);
        break;
      case 'typing_challenge':
        game = this.createTypingChallengeGame(difficulty as any);
        break;
      case 'code_injection':
        game = this.createCodeInjectionGame(difficulty as any);
        break;
      default:
        return null;
    }

    this.activeGame = game;
    return game;
  }

  public processInput(input: string): { success: boolean; message: string; gameData?: any; completed?: boolean } {
    if (!this.activeGame) {
      return { success: false, message: 'No active mini-game.' };
    }

    const result = this.activeGame.onUpdate(this.activeGame.gameData, input);
    this.activeGame.gameData = result.gameData;

    if (result.completed) {
      const timeElapsed = Date.now() - this.activeGame.startTime;
      const completionResult = this.activeGame.onComplete(result.success, timeElapsed);
      
      this.gameHistory.push({
        gameId: this.activeGame.id,
        success: result.success,
        timeElapsed,
        score: completionResult.credits
      });

      this.activeGame = null;
      
      return {
        success: result.success,
        message: `${result.message}\n${completionResult.message}`,
        completed: true
      };
    }

    return {
      success: result.success,
      message: result.message,
      gameData: this.activeGame.gameData
    };
  }

  public getActiveGame(): RealTimeMiniGame | null {
    return this.activeGame;
  }

  public cancelGame(): void {
    if (this.activeGame) {
      const timeElapsed = Date.now() - this.activeGame.startTime;
      this.gameHistory.push({
        gameId: this.activeGame.id,
        success: false,
        timeElapsed,
        score: 0
      });
    }
    this.activeGame = null;
  }

  public checkTimeout(): boolean {
    if (!this.activeGame) return false;

    const timeElapsed = Date.now() - this.activeGame.startTime;
    if (timeElapsed > this.activeGame.timeLimit * 1000) {
      this.cancelGame();
      return true;
    }
    return false;
  }

  public getGameStatus(): string {
    if (!this.activeGame) return 'No active game';

    const timeElapsed = Math.floor((Date.now() - this.activeGame.startTime) / 1000);
    const timeRemaining = Math.max(0, this.activeGame.timeLimit - timeElapsed);

    return `${this.activeGame.name} | Time: ${timeRemaining}s | Difficulty: ${this.activeGame.difficulty}`;
  }

  private createPatternCrackGame(difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT'): RealTimeMiniGame {
    const difficultySettings = {
      EASY: { patterns: 3, length: 4, mistakes: 3, time: 60 },
      MEDIUM: { patterns: 5, length: 6, mistakes: 2, time: 45 },
      HARD: { patterns: 7, length: 8, mistakes: 1, time: 30 },
      EXPERT: { patterns: 10, length: 10, mistakes: 0, time: 20 }
    };

    const settings = difficultySettings[difficulty];
    const patterns = this.generatePatterns(settings.patterns, settings.length);

    const gameData: PatternCrackData = {
      patterns,
      currentPattern: 0,
      userInput: '',
      correctSequences: 0,
      totalPatterns: patterns.length,
      mistakes: 0,
      maxMistakes: settings.mistakes
    };

    return {
      id: `pattern_crack_${Date.now()}`,
      name: 'Pattern Cracking',
      description: 'Crack the encryption patterns to gain access',
      type: 'pattern_crack',
      difficulty,
      timeLimit: settings.time,
      isActive: true,
      startTime: Date.now(),
      gameData,
      onUpdate: this.updatePatternCrack.bind(this),
      onComplete: this.completePatternCrack.bind(this)
    };
  }

  private createSignalTraceGame(difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT'): RealTimeMiniGame {
    const difficultySettings = {
      EASY: { size: 8, obstacles: 5, moves: 20, time: 90 },
      MEDIUM: { size: 10, obstacles: 8, moves: 25, time: 75 },
      HARD: { size: 12, obstacles: 12, moves: 30, time: 60 },
      EXPERT: { size: 15, obstacles: 18, moves: 35, time: 45 }
    };

    const settings = difficultySettings[difficulty];
    const grid = this.generateSignalGrid(settings.size, settings.obstacles);
    
    const gameData: SignalTraceData = {
      grid,
      playerPos: { x: 0, y: 0 },
      targetPos: { x: settings.size - 1, y: settings.size - 1 },
      signalPath: [],
      movesUsed: 0,
      maxMoves: settings.moves,
      signalStrength: 100
    };

    return {
      id: `signal_trace_${Date.now()}`,
      name: 'Signal Tracing',
      description: 'Navigate through the network to trace the signal source',
      type: 'signal_trace',
      difficulty,
      timeLimit: settings.time,
      isActive: true,
      startTime: Date.now(),
      gameData,
      onUpdate: this.updateSignalTrace.bind(this),
      onComplete: this.completeSignalTrace.bind(this)
    };
  }

  private createBinaryTreeGame(difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT'): RealTimeMiniGame {
    const difficultySettings = {
      EASY: { depth: 4, time: 60 },
      MEDIUM: { depth: 5, time: 45 },
      HARD: { depth: 6, time: 30 },
      EXPERT: { depth: 7, time: 20 }
    };

    const settings = difficultySettings[difficulty];
    const { nodes, targetNode, correctPath } = this.generateBinaryTree(settings.depth);

    const gameData: BinaryTreeData = {
      nodes,
      currentNode: 'root',
      targetNode,
      path: ['root'],
      correctPath,
      maxDepth: settings.depth
    };

    return {
      id: `binary_tree_${Date.now()}`,
      name: 'Binary Tree Navigation',
      description: 'Navigate the binary tree to find the target node',
      type: 'binary_tree',
      difficulty,
      timeLimit: settings.time,
      isActive: true,
      startTime: Date.now(),
      gameData,
      onUpdate: this.updateBinaryTree.bind(this),
      onComplete: this.completeBinaryTree.bind(this)
    };
  }

  private createMemorySequenceGame(difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT'): RealTimeMiniGame {
    const difficultySettings = {
      EASY: { length: 4, time: 45 },
      MEDIUM: { length: 6, time: 60 },
      HARD: { length: 8, time: 75 },
      EXPERT: { length: 12, time: 90 }
    };

    const settings = difficultySettings[difficulty];
    const sequence = this.generateMemorySequence(settings.length);

    const gameData: MemorySequenceData = {
      sequence,
      userSequence: [],
      currentIndex: 0,
      displayPhase: true,
      displayIndex: 0,
      sequenceLength: settings.length
    };

    return {
      id: `memory_sequence_${Date.now()}`,
      name: 'Memory Sequence',
      description: 'Memorize and repeat the sequence',
      type: 'memory_sequence',
      difficulty,
      timeLimit: settings.time,
      isActive: true,
      startTime: Date.now(),
      gameData,
      onUpdate: this.updateMemorySequence.bind(this),
      onComplete: this.completeMemorySequence.bind(this)
    };
  }

  private createTypingChallengeGame(difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT'): RealTimeMiniGame {
    const difficultySettings = {
      EASY: { text: this.getTypingText('easy'), time: 120 },
      MEDIUM: { text: this.getTypingText('medium'), time: 90 },
      HARD: { text: this.getTypingText('hard'), time: 60 },
      EXPERT: { text: this.getTypingText('expert'), time: 45 }
    };

    const settings = difficultySettings[difficulty];

    const gameData: TypingChallengeData = {
      text: settings.text,
      userInput: '',
      currentIndex: 0,
      mistakes: 0,
      wpm: 0,
      accuracy: 100,
      startTime: Date.now()
    };

    return {
      id: `typing_challenge_${Date.now()}`,
      name: 'Typing Speed Challenge',
      description: 'Type the code as fast and accurately as possible',
      type: 'typing_challenge',
      difficulty,
      timeLimit: settings.time,
      isActive: true,
      startTime: Date.now(),
      gameData,
      onUpdate: this.updateTypingChallenge.bind(this),
      onComplete: this.completeTypingChallenge.bind(this)
    };
  }

  private createCodeInjectionGame(difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT'): RealTimeMiniGame {
    const difficultySettings = {
      EASY: { vulnerabilities: 2, time: 120 },
      MEDIUM: { vulnerabilities: 3, time: 90 },
      HARD: { vulnerabilities: 4, time: 60 },
      EXPERT: { vulnerabilities: 5, time: 45 }
    };

    const settings = difficultySettings[difficulty];
    const { code, vulnerabilities } = this.generateVulnerableCode(settings.vulnerabilities);

    const gameData: CodeInjectionData = {
      targetCode: code,
      userCode: '',
      vulnerabilities,
      exploitsFound: [],
      codeLines: code.split('\n'),
      currentLine: 0
    };

    return {
      id: `code_injection_${Date.now()}`,
      name: 'Code Injection',
      description: 'Find and exploit vulnerabilities in the code',
      type: 'code_injection',
      difficulty,
      timeLimit: settings.time,
      isActive: true,
      startTime: Date.now(),
      gameData,
      onUpdate: this.updateCodeInjection.bind(this),
      onComplete: this.completeCodeInjection.bind(this)
    };
  }

  // Update methods for each game type
  private updatePatternCrack(gameData: PatternCrackData, input: string): { success: boolean; gameData: PatternCrackData; message: string; completed?: boolean } {
    if (input === 'reset') {
      gameData.userInput = '';
      return { success: true, gameData, message: 'Input reset.' };
    }

    gameData.userInput = input;
    const currentPattern = gameData.patterns[gameData.currentPattern];

    if (input === currentPattern) {
      gameData.correctSequences++;
      gameData.currentPattern++;
      gameData.userInput = '';

      if (gameData.currentPattern >= gameData.totalPatterns) {
        return { success: true, gameData, message: 'All patterns cracked!', completed: true };
      }

      return { success: true, gameData, message: `Pattern ${gameData.currentPattern} cracked! Next pattern: ${gameData.patterns[gameData.currentPattern]}` };
    } else if (input.length >= currentPattern.length) {
      gameData.mistakes++;
      gameData.userInput = '';

      if (gameData.mistakes > gameData.maxMistakes) {
        return { success: false, gameData, message: 'Too many mistakes! Access denied.', completed: true };
      }

      return { success: false, gameData, message: `Incorrect! Mistakes: ${gameData.mistakes}/${gameData.maxMistakes}. Try again: ${currentPattern}` };
    }

    return { success: true, gameData, message: `Pattern ${gameData.currentPattern + 1}/${gameData.totalPatterns}: ${currentPattern}\nInput: ${input}` };
  }

  private updateSignalTrace(gameData: SignalTraceData, input: string): { success: boolean; gameData: SignalTraceData; message: string; completed?: boolean } {
    const direction = input.toLowerCase();
    let newX = gameData.playerPos.x;
    let newY = gameData.playerPos.y;

    switch (direction) {
      case 'up': case 'w': newY--; break;
      case 'down': case 's': newY++; break;
      case 'left': case 'a': newX--; break;
      case 'right': case 'd': newX++; break;
      default:
        return { success: false, gameData, message: 'Invalid direction. Use: up/down/left/right or w/a/s/d' };
    }

    if (newX < 0 || newX >= gameData.grid.length || newY < 0 || newY >= gameData.grid[0].length) {
      return { success: false, gameData, message: 'Cannot move outside the grid!' };
    }

    if (gameData.grid[newY][newX] === '#') {
      return { success: false, gameData, message: 'Obstacle detected! Cannot move there.' };
    }

    gameData.playerPos = { x: newX, y: newY };
    gameData.movesUsed++;
    gameData.signalPath.push({ x: newX, y: newY });

    if (newX === gameData.targetPos.x && newY === gameData.targetPos.y) {
      return { success: true, gameData, message: 'Signal source found!', completed: true };
    }

    if (gameData.movesUsed >= gameData.maxMoves) {
      return { success: false, gameData, message: 'Out of moves! Signal lost.', completed: true };
    }

    const distance = Math.abs(newX - gameData.targetPos.x) + Math.abs(newY - gameData.targetPos.y);
    gameData.signalStrength = Math.max(10, 100 - (distance * 10));

    return { 
      success: true, 
      gameData, 
      message: `Position: (${newX}, ${newY}) | Signal: ${gameData.signalStrength}% | Moves: ${gameData.movesUsed}/${gameData.maxMoves}` 
    };
  }

  private updateBinaryTree(gameData: BinaryTreeData, input: string): { success: boolean; gameData: BinaryTreeData; message: string; completed?: boolean } {
    const direction = input.toLowerCase();
    const currentNode = gameData.nodes[gameData.currentNode];

    if (direction === 'left' || direction === 'l') {
      if (currentNode.left) {
        gameData.currentNode = currentNode.left;
        gameData.path.push(currentNode.left);
      } else {
        return { success: false, gameData, message: 'No left child node!' };
      }
    } else if (direction === 'right' || direction === 'r') {
      if (currentNode.right) {
        gameData.currentNode = currentNode.right;
        gameData.path.push(currentNode.right);
      } else {
        return { success: false, gameData, message: 'No right child node!' };
      }
    } else if (direction === 'up' || direction === 'u') {
      if (currentNode.parent) {
        gameData.currentNode = currentNode.parent;
        gameData.path.push(currentNode.parent);
      } else {
        return { success: false, gameData, message: 'Already at root node!' };
      }
    } else {
      return { success: false, gameData, message: 'Invalid direction. Use: left/right/up or l/r/u' };
    }

    if (gameData.currentNode === gameData.targetNode) {
      return { success: true, gameData, message: 'Target node found!', completed: true };
    }

    const node = gameData.nodes[gameData.currentNode];
    return { 
      success: true, 
      gameData, 
      message: `Current: ${node.value} | Left: ${node.left ? gameData.nodes[node.left].value : 'none'} | Right: ${node.right ? gameData.nodes[node.right].value : 'none'}` 
    };
  }

  private updateMemorySequence(gameData: MemorySequenceData, input: string): { success: boolean; gameData: MemorySequenceData; message: string; completed?: boolean } {
    if (gameData.displayPhase) {
      return { success: true, gameData, message: `Memorize: ${gameData.sequence.slice(0, gameData.displayIndex + 1).join(' ')}` };
    }

    gameData.userSequence.push(input);

    if (input !== gameData.sequence[gameData.currentIndex]) {
      return { success: false, gameData, message: 'Incorrect sequence! Memory test failed.', completed: true };
    }

    gameData.currentIndex++;

    if (gameData.currentIndex >= gameData.sequenceLength) {
      return { success: true, gameData, message: 'Perfect memory! Sequence completed.', completed: true };
    }

    return { 
      success: true, 
      gameData, 
      message: `Correct! Continue: ${gameData.currentIndex}/${gameData.sequenceLength}` 
    };
  }

  private updateTypingChallenge(gameData: TypingChallengeData, input: string): { success: boolean; gameData: TypingChallengeData; message: string; completed?: boolean } {
    gameData.userInput = input;
    
    const timeElapsed = (Date.now() - gameData.startTime) / 1000 / 60; // minutes
    const wordsTyped = input.split(' ').length;
    gameData.wpm = Math.round(wordsTyped / timeElapsed);

    let correctChars = 0;
    for (let i = 0; i < Math.min(input.length, gameData.text.length); i++) {
      if (input[i] === gameData.text[i]) {
        correctChars++;
      }
    }

    gameData.accuracy = input.length > 0 ? Math.round((correctChars / input.length) * 100) : 100;
    gameData.mistakes = input.length - correctChars;

    if (input === gameData.text) {
      return { success: true, gameData, message: 'Code typed perfectly!', completed: true };
    }

    if (input.length >= gameData.text.length) {
      return { success: false, gameData, message: 'Too many characters! Code injection failed.', completed: true };
    }

    return { 
      success: true, 
      gameData, 
      message: `WPM: ${gameData.wpm} | Accuracy: ${gameData.accuracy}% | Progress: ${input.length}/${gameData.text.length}` 
    };
  }

  private updateCodeInjection(gameData: CodeInjectionData, input: string): { success: boolean; gameData: CodeInjectionData; message: string; completed?: boolean } {
    const command = input.toLowerCase();

    if (command.startsWith('exploit ')) {
      const exploit = command.substring(8);
      if (gameData.vulnerabilities.includes(exploit)) {
        if (!gameData.exploitsFound.includes(exploit)) {
          gameData.exploitsFound.push(exploit);
          
          if (gameData.exploitsFound.length >= gameData.vulnerabilities.length) {
            return { success: true, gameData, message: 'All vulnerabilities exploited! System compromised.', completed: true };
          }
          
          return { success: true, gameData, message: `Exploit successful: ${exploit}. Found: ${gameData.exploitsFound.length}/${gameData.vulnerabilities.length}` };
        } else {
          return { success: false, gameData, message: 'Exploit already used!' };
        }
      } else {
        return { success: false, gameData, message: 'Invalid exploit attempt!' };
      }
    } else if (command === 'scan') {
      const hints = gameData.vulnerabilities.filter(v => !gameData.exploitsFound.includes(v)).slice(0, 2);
      return { success: true, gameData, message: `Vulnerabilities detected: ${hints.join(', ')}` };
    } else {
      return { success: false, gameData, message: 'Commands: exploit <vulnerability>, scan' };
    }
  }

  // Completion methods
  private completePatternCrack(success: boolean, timeElapsed: number): { credits: number; experience: number; message: string } {
    const baseReward = success ? 500 : 100;
    const timeBonus = Math.max(0, 1000 - timeElapsed);
    const credits = baseReward + timeBonus;
    
    return {
      credits,
      experience: credits / 10,
      message: `Pattern Cracking ${success ? 'SUCCESS' : 'FAILED'}! Earned ${credits} credits.`
    };
  }

  private completeSignalTrace(success: boolean, timeElapsed: number): { credits: number; experience: number; message: string } {
    const baseReward = success ? 750 : 150;
    const timeBonus = Math.max(0, 1500 - timeElapsed);
    const credits = baseReward + timeBonus;
    
    return {
      credits,
      experience: credits / 10,
      message: `Signal Tracing ${success ? 'SUCCESS' : 'FAILED'}! Earned ${credits} credits.`
    };
  }

  private completeBinaryTree(success: boolean, timeElapsed: number): { credits: number; experience: number; message: string } {
    const baseReward = success ? 600 : 120;
    const timeBonus = Math.max(0, 1200 - timeElapsed);
    const credits = baseReward + timeBonus;
    
    return {
      credits,
      experience: credits / 10,
      message: `Binary Tree Navigation ${success ? 'SUCCESS' : 'FAILED'}! Earned ${credits} credits.`
    };
  }

  private completeMemorySequence(success: boolean, timeElapsed: number): { credits: number; experience: number; message: string } {
    const baseReward = success ? 400 : 80;
    const timeBonus = Math.max(0, 800 - timeElapsed);
    const credits = baseReward + timeBonus;
    
    return {
      credits,
      experience: credits / 10,
      message: `Memory Sequence ${success ? 'SUCCESS' : 'FAILED'}! Earned ${credits} credits.`
    };
  }

  private completeTypingChallenge(success: boolean, timeElapsed: number): { credits: number; experience: number; message: string } {
    const baseReward = success ? 300 : 60;
    const speedBonus = success ? Math.max(0, 600 - timeElapsed) : 0;
    const credits = baseReward + speedBonus;
    
    return {
      credits,
      experience: credits / 10,
      message: `Typing Challenge ${success ? 'SUCCESS' : 'FAILED'}! Earned ${credits} credits.`
    };
  }

  private completeCodeInjection(success: boolean, timeElapsed: number): { credits: number; experience: number; message: string } {
    const baseReward = success ? 1000 : 200;
    const timeBonus = Math.max(0, 2000 - timeElapsed);
    const credits = baseReward + timeBonus;
    
    return {
      credits,
      experience: credits / 10,
      message: `Code Injection ${success ? 'SUCCESS' : 'FAILED'}! Earned ${credits} credits.`
    };
  }

  // Helper methods for game generation
  private generatePatterns(count: number, length: number): string[] {
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

  private generateSignalGrid(size: number, obstacles: number): string[][] {
    const grid: string[][] = Array(size).fill(null).map(() => Array(size).fill('.'));
    
    // Add obstacles
    for (let i = 0; i < obstacles; i++) {
      let x, y;
      do {
        x = Math.floor(Math.random() * size);
        y = Math.floor(Math.random() * size);
      } while ((x === 0 && y === 0) || (x === size - 1 && y === size - 1) || grid[y][x] === '#');
      
      grid[y][x] = '#';
    }
    
    return grid;
  }

  private generateBinaryTree(depth: number): { nodes: any; targetNode: string; correctPath: string[] } {
    const nodes: any = {};
    const nodeIds: string[] = [];
    
    // Generate nodes
    for (let level = 0; level < depth; level++) {
      const nodesInLevel = Math.pow(2, level);
      for (let i = 0; i < nodesInLevel; i++) {
        const nodeId = level === 0 ? 'root' : `node_${level}_${i}`;
        nodeIds.push(nodeId);
        nodes[nodeId] = {
          value: `${level}-${i}`,
          left: level < depth - 1 ? `node_${level + 1}_${i * 2}` : undefined,
          right: level < depth - 1 ? `node_${level + 1}_${i * 2 + 1}` : undefined,
          parent: level > 0 ? (i % 2 === 0 ? `node_${level - 1}_${Math.floor(i / 2)}` : `node_${level - 1}_${Math.floor(i / 2)}`) : undefined
        };
      }
    }
    
    // Select random target from leaf nodes
    const leafNodes = nodeIds.filter(id => !nodes[id].left && !nodes[id].right);
    const targetNode = leafNodes[Math.floor(Math.random() * leafNodes.length)];
    
    // Calculate correct path
    const correctPath: string[] = [];
    let current = targetNode;
    while (current) {
      correctPath.unshift(current);
      current = nodes[current].parent;
    }
    
    return { nodes, targetNode, correctPath };
  }

  private generateMemorySequence(length: number): string[] {
    const symbols = ['A', 'B', 'C', 'D', 'E', 'F', '1', '2', '3', '4'];
    const sequence: string[] = [];
    
    for (let i = 0; i < length; i++) {
      sequence.push(symbols[Math.floor(Math.random() * symbols.length)]);
    }
    
    return sequence;
  }

  private getTypingText(difficulty: string): string {
    const texts = {
      easy: 'function hack() { return "access granted"; }',
      medium: 'const exploit = async (target) => { const payload = await inject(target); return payload.execute(); };',
      hard: 'class CyberAttack { constructor(target) { this.target = target; this.payload = new Payload(); } async execute() { return await this.payload.deploy(this.target); } }',
      expert: 'import { AdvancedExploit } from "./exploits"; const attack = new AdvancedExploit({ target: "192.168.1.1", port: 443, protocol: "https", payload: Buffer.from("malicious_code", "hex") }); attack.deploy().then(result => console.log("System compromised:", result));'
    };
    
    return texts[difficulty as keyof typeof texts] || texts.medium;
  }

  private generateVulnerableCode(vulnerabilityCount: number): { code: string; vulnerabilities: string[] } {
    const vulnerabilities = ['sql_injection', 'xss', 'buffer_overflow', 'path_traversal', 'command_injection'];
    const selectedVulns = vulnerabilities.slice(0, vulnerabilityCount);
    
    const code = `
function authenticate(username, password) {
  // SQL Injection vulnerability
  const query = "SELECT * FROM users WHERE username='" + username + "' AND password='" + password + "'";
  
  // XSS vulnerability
  document.innerHTML = "<h1>Welcome " + username + "</h1>";
  
  // Buffer overflow potential
  char buffer[256];
  strcpy(buffer, userInput);
  
  // Path traversal vulnerability
  const file = fs.readFileSync("./uploads/" + filename);
  
  // Command injection vulnerability
  exec("ping " + userInput);
}`;
    
    return { code, vulnerabilities: selectedVulns };
  }

  public getGameHistory(): { gameId: string; success: boolean; timeElapsed: number; score: number }[] {
    return this.gameHistory;
  }

  public getAvailableGames(): string[] {
    return ['pattern_crack', 'signal_trace', 'binary_tree', 'memory_sequence', 'typing_challenge', 'code_injection'];
  }
}

export const realTimeMiniGameSystem = new RealTimeMiniGameSystem(); 