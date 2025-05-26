import type { Express, RequestHandler } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { pool } from "./db";
import { insertGameSaveSchema, insertMissionHistorySchema, insertCommandLogSchema } from "@shared/schema";
import { MultiplayerWebSocketServer } from "./websocket";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { EmailService } from "./emailService";

// Session configuration
const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
const pgStore = connectPg(session);
const sessionStore = new pgStore({
  conString: process.env.DATABASE_URL,
  createTableIfMissing: false,
  ttl: sessionTtl,
  tableName: "sessions",
});

// Authentication middleware
const isAuthenticated: RequestHandler = (req: any, res, next) => {
  console.log('Auth check - Session exists:', !!req.session);
  console.log('Auth check - User ID in session:', req.session?.userId);
  
  if (req.session && req.session.userId) {
    next();
  } else {
    console.log('Authentication failed - no valid session');
    res.status(401).json({ error: "Authentication required" });
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Session middleware
  app.use(session({
    store: sessionStore,
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    name: 'sessionId', // Explicit session name
    cookie: {
      httpOnly: true,
      secure: false, // Set to true in production with HTTPS
      maxAge: sessionTtl,
      sameSite: 'lax', // Better compatibility
      path: '/', // Ensure cookie works for all paths
    },
  }));

  // Custom authentication routes
  app.post('/api/auth/register', async (req, res) => {
    try {
      const { hackerName, email, password } = req.body;
      console.log('Registration request:', { hackerName, email, password: password ? '***' : 'missing' });

      if (!hackerName || !email || !password) {
        return res.status(400).json({ error: "All fields are required" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      console.log('Password hashed successfully');
      
      // Create user directly (temporarily bypassing email verification)
      const userId = uuidv4();
      console.log('About to create user with:', { userId, hackerName, email, hashedPassword: hashedPassword.substring(0, 10) + '...' });
      
      const user = await storage.createUser({
        id: userId,
        hackerName,
        email,
        password: hashedPassword
      });

      // Create session
      (req.session as any).userId = userId;
      (req.session as any).hackerName = hackerName;

      res.json({ 
        user: {
          id: user.id,
          hackerName: user.hackerName,
          email: user.email,
          profileImageUrl: user.profileImageUrl
        }
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ error: "Registration failed" });
    }
  });

  app.post('/api/auth/verify', async (req, res) => {
    try {
      const { email, code } = req.body;

      // Verify the code
      const verification = await storage.getVerificationCode(email, code);
      if (!verification || verification.used || new Date() > verification.expiresAt) {
        return res.status(400).json({ error: "Invalid or expired verification code" });
      }

      // Mark code as used
      await storage.markVerificationCodeUsed(verification.id);

      // Get unverified user data
      const unverifiedUser = await storage.getUnverifiedUser(email);
      if (!unverifiedUser) {
        return res.status(400).json({ error: "User data not found" });
      }

      // Create verified user
      const user = await storage.createUser(unverifiedUser);

      // Clean up unverified data
      await storage.deleteUnverifiedUser(email);

      // Send welcome email
      await EmailService.sendWelcomeEmail(email, unverifiedUser.hackerName);

      // Create session
      (req.session as any).userId = user.id;
      (req.session as any).hackerName = user.hackerName;

      res.json({ 
        user: {
          id: user.id,
          hackerName: user.hackerName,
          email: user.email,
          profileImageUrl: user.profileImageUrl
        }
      });
    } catch (error) {
      console.error("Verification error:", error);
      res.status(500).json({ error: "Verification failed" });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body; // email field now contains either email or hacker name
      
      if (!email || !password) {
        return res.status(400).json({ error: "Username/email and password are required" });
      }
      
      // Try to find user by email first, then by hacker name if email doesn't work
      let userQuery = `SELECT id, email, hacker_name, password FROM users WHERE email = $1 OR hacker_name = $1`;
      const userResult = await pool.query(userQuery, [email]);
      const user = userResult.rows[0];
      
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Check if password field exists and has content
      if (!user.password || user.password.length === 0) {
        console.log('No password found for user:', user.email);
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Use async bcrypt comparison for better reliability
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        console.log('Password validation failed for user:', user.email);
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Create session and add to response
      (req.session as any).userId = user.id;
      (req.session as any).hackerName = user.hacker_name;

      console.log('Session created successfully for user:', user.id);
      
      // Send user data with authentication token
      res.json({ 
        user: {
          id: user.id,
          hackerName: user.hacker_name,
          email: user.email,
          authenticated: true
        },
        sessionId: req.sessionID
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Logout failed" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get('/api/auth/user', (req: any, res) => {
    try {
      // Debug session information
      console.log('Auth check - Session exists:', !!req.session);
      console.log('Auth check - User ID in session:', req.session?.userId);
      console.log('Auth check - Session data:', req.session);
      
      // Check if user is authenticated via session
      if (!req.session || !req.session.userId) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const userId = req.session.userId;
      storage.getUser(userId).then(user => {
        if (user) {
          res.json({
            id: user.id,
            hackerName: user.hacker_name,
            email: user.email
          });
        } else {
          res.status(404).json({ error: "User not found" });
        }
      }).catch(error => {
        console.error("Error fetching user:", error);
        res.status(500).json({ error: "Failed to fetch user" });
      });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  // Game state routes
  app.post("/api/game/save", async (req, res) => {
    try {
      const gameState = insertGameSaveSchema.parse(req.body);
      const savedState = await storage.saveGameState(gameState);
      res.json(savedState);
    } catch (error) {
      console.error("Error saving game state:", error);
      res.status(500).json({ error: "Failed to save game state" });
    }
  });

  app.get("/api/game/load/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const gameState = await storage.loadGameState(sessionId);
      if (gameState) {
        res.json(gameState);
      } else {
        res.status(404).json({ error: "Game state not found" });
      }
    } catch (error) {
      console.error("Error loading game state:", error);
      res.status(500).json({ error: "Failed to load game state" });
    }
  });

  // Mission history routes
  app.post("/api/missions/save", async (req, res) => {
    try {
      const mission = insertMissionHistorySchema.parse(req.body);
      const savedMission = await storage.saveMissionHistory(mission);
      res.json(savedMission);
    } catch (error) {
      console.error("Error saving mission:", error);
      res.status(500).json({ error: "Failed to save mission" });
    }
  });

  app.get("/api/missions/history/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const missions = await storage.getMissionHistory(sessionId);
      res.json(missions);
    } catch (error) {
      console.error("Error getting mission history:", error);
      res.status(500).json({ error: "Failed to get mission history" });
    }
  });

  // Command logging routes
  app.post("/api/commands/log", async (req, res) => {
    try {
      const commandLog = insertCommandLogSchema.parse(req.body);
      const savedLog = await storage.logCommand(commandLog);
      res.json(savedLog);
    } catch (error) {
      console.error("Error logging command:", error);
      res.status(500).json({ error: "Failed to log command" });
    }
  });

  app.get("/api/commands/history/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const commands = await storage.getCommandHistory(sessionId);
      res.json(commands);
    } catch (error) {
      console.error("Error getting command history:", error);
      res.status(500).json({ error: "Failed to get command history" });
    }
  });

  // Multiplayer room routes (temporary without auth for development)
  app.post("/api/rooms/create", async (req: any, res) => {
    try {
      const userId = req.body.userId || 'dev_user_' + Date.now();
      const { name, gameMode, maxPlayers } = req.body;
      
      // Generate unique room code
      const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      
      const room = await storage.createRoom({
        name,
        roomCode,
        hostUserId: userId,
        gameMode: gameMode || 'cooperative',
        maxPlayers: maxPlayers || 4,
        currentPlayers: 0,
        isActive: true
      });
      
      // Auto-join creator to room
      await storage.joinRoom({
        roomId: room.id,
        userId,
        role: 'host',
        isActive: true
      });
      
      res.json(room);
    } catch (error) {
      console.error("Error creating room:", error);
      res.status(500).json({ error: "Failed to create room" });
    }
  });

  app.post("/api/rooms/join/:roomCode", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { roomCode } = req.params;
      
      const room = await storage.getRoomByCode(roomCode);
      if (!room) {
        return res.status(404).json({ error: "Room not found" });
      }
      
      if (!room.isActive) {
        return res.status(400).json({ error: "Room is no longer active" });
      }
      
      if (room.currentPlayers >= room.maxPlayers) {
        return res.status(400).json({ error: "Room is full" });
      }
      
      const member = await storage.joinRoom({
        roomId: room.id,
        userId,
        role: 'member',
        isActive: true
      });
      
      res.json({ room, member });
    } catch (error) {
      console.error("Error joining room:", error);
      res.status(500).json({ error: "Failed to join room" });
    }
  });

  app.get("/api/rooms/:roomId/members", isAuthenticated, async (req, res) => {
    try {
      const { roomId } = req.params;
      const members = await storage.getRoomMembers(parseInt(roomId));
      res.json(members);
    } catch (error) {
      console.error("Error getting room members:", error);
      res.status(500).json({ error: "Failed to get room members" });
    }
  });

  app.post("/api/rooms/:roomId/leave", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { roomId } = req.params;
      
      await storage.leaveRoom(parseInt(roomId), userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error leaving room:", error);
      res.status(500).json({ error: "Failed to leave room" });
    }
  });

  // Player stats routes
  app.get("/api/player/stats", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      let stats = await storage.getPlayerStats(userId);
      
      if (!stats) {
        // Create initial stats for new player
        stats = await storage.updatePlayerStats(userId, {
          userId,
          totalMissions: 0,
          successfulMissions: 0,
          totalCredits: 1000,
          reputation: 'UNKNOWN',
          currentStreak: 0,
          longestStreak: 0,
          totalPlayTime: 0
        });
      }
      
      res.json(stats);
    } catch (error) {
      console.error("Error getting player stats:", error);
      res.status(500).json({ error: "Failed to get player stats" });
    }
  });

  // Leaderboard endpoint
  app.get("/api/leaderboards", async (req, res) => {
    try {
      // Get real leaderboard data from existing game saves and mission history
      const response = await fetch('/api/game/saves');
      if (response.ok) {
        const gameSaves = await response.json();
        
        const leaderboards = {
          missions: gameSaves
            .map((save: any, index: number) => ({
              rank: index + 1,
              userId: save.userId || save.sessionId,
              hackerName: `Player_${(save.userId || save.sessionId).slice(-4)}`,
              score: save.gameState?.completedMissions?.length || 0,
              category: 'missions',
              details: `${save.gameState?.completedMissions?.length || 0} missions`,
              timestamp: save.updatedAt || new Date().toISOString()
            }))
            .sort((a: any, b: any) => b.score - a.score)
            .slice(0, 10),
          
          credits: gameSaves
            .map((save: any, index: number) => ({
              rank: index + 1,
              userId: save.userId || save.sessionId,
              hackerName: `Player_${(save.userId || save.sessionId).slice(-4)}`,
              score: save.gameState?.credits || 0,
              category: 'credits',
              details: `${save.gameState?.credits || 0}₡`,
              timestamp: save.updatedAt || new Date().toISOString()
            }))
            .sort((a: any, b: any) => b.score - a.score)
            .slice(0, 10),
          
          speed: [],
          multiplayer: []
        };
        
        res.json(leaderboards);
      } else {
        // If no data available, return empty leaderboards
        res.json({
          missions: [],
          speed: [],
          multiplayer: [],
          credits: []
        });
      }
    } catch (error) {
      console.error("Error getting leaderboards:", error);
      res.json({
        missions: [],
        speed: [],
        multiplayer: [],
        credits: []
      });
    }
  });

  // AI Mission Generation endpoints
  app.post("/api/missions/generate", isAuthenticated, async (req: any, res) => {
    try {
      const { aiMissionGenerator } = await import('./aiMissionGenerator');
      const userId = req.user.claims.sub;
      const { playerLevel, completedMissions, reputation } = req.body;
      
      const mission = await aiMissionGenerator.generateMission(
        playerLevel || 1,
        completedMissions || [],
        reputation || 'Novice'
      );
      
      res.json(mission);
    } catch (error) {
      console.error("Error generating AI mission:", error);
      res.status(500).json({ error: "Failed to generate mission" });
    }
  });

  app.post("/api/missions/generate-batch", isAuthenticated, async (req: any, res) => {
    try {
      const { aiMissionGenerator } = await import('./aiMissionGenerator');
      const userId = req.user.claims.sub;
      const { playerLevel, completedMissions, reputation, count } = req.body;
      
      const missions = await aiMissionGenerator.generateMissionBatch(
        playerLevel || 1,
        completedMissions || [],
        reputation || 'Novice',
        count || 3
      );
      
      res.json(missions);
    } catch (error) {
      console.error("Error generating AI mission batch:", error);
      res.status(500).json({ error: "Failed to generate missions" });
    }
  });

  // User Profile Management endpoints
  app.post("/api/user/profile", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profileData = {
        ...req.body,
        userId,
        id: userId
      };
      
      const profile = await storage.createUserProfile(profileData);
      res.json(profile);
    } catch (error) {
      console.error("Error creating user profile:", error);
      res.status(500).json({ error: "Failed to create user profile" });
    }
  });

  app.get("/api/user/profile", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profile = await storage.getUserProfile(userId);
      res.json(profile);
    } catch (error) {
      console.error("Error loading user profile:", error);
      res.status(500).json({ error: "Failed to load user profile" });
    }
  });

  app.patch("/api/user/profile", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const updates = req.body;
      const profile = await storage.updateUserProfile(userId, updates);
      res.json(profile);
    } catch (error) {
      console.error("Error updating user profile:", error);
      res.status(500).json({ error: "Failed to update user profile" });
    }
  });

  const httpServer = createServer(app);
  
  // WebSocket server will be initialized later to avoid conflicts
  // const wsServer = new MultiplayerWebSocketServer(httpServer);
  
  return httpServer;
}
