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

  const httpServer = createServer(app);
  return httpServer;
}
