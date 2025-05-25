import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertGameSaveSchema, insertMissionHistorySchema, insertCommandLogSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
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

  // Multiplayer room routes
  app.post("/api/rooms/create", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { name, roomType, maxPlayers } = req.body;
      
      // Generate unique room code
      const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      
      const room = await storage.createRoom({
        name,
        roomCode,
        hostUserId: userId,
        roomType: roomType || 'cooperative',
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

  const httpServer = createServer(app);
  return httpServer;
}
