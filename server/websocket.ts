import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { storage } from './storage';

interface GameWebSocket extends WebSocket {
  userId?: string;
  roomId?: number;
  hackerName?: string;
}

export class MultiplayerWebSocketServer {
  private wss: WebSocketServer;
  private rooms: Map<number, Set<GameWebSocket>> = new Map();
  private userSockets: Map<string, GameWebSocket> = new Map();

  constructor(server: Server) {
    this.wss = new WebSocketServer({ server });
    this.setupWebSocketHandlers();
  }

  private setupWebSocketHandlers() {
    this.wss.on('connection', (ws: GameWebSocket, req) => {
      console.log('New WebSocket connection established');

      ws.on('message', async (data) => {
        try {
          const message = JSON.parse(data.toString());
          await this.handleMessage(ws, message);
        } catch (error) {
          console.error('Error handling WebSocket message:', error);
          ws.send(JSON.stringify({ type: 'error', message: 'Invalid message format' }));
        }
      });

      ws.on('close', () => {
        this.handleDisconnection(ws);
      });
    });
  }

  private async handleMessage(ws: GameWebSocket, message: any) {
    const { type, payload } = message;

    switch (type) {
      case 'authenticate':
        await this.handleAuthentication(ws, payload);
        break;
      
      case 'join_room':
        await this.handleJoinRoom(ws, payload);
        break;
      
      case 'leave_room':
        await this.handleLeaveRoom(ws);
        break;
      
      case 'room_chat':
        await this.handleRoomChat(ws, payload);
        break;
      
      case 'game_action':
        await this.handleGameAction(ws, payload);
        break;
      
      case 'mission_update':
        await this.handleMissionUpdate(ws, payload);
        break;
      
      default:
        ws.send(JSON.stringify({ type: 'error', message: 'Unknown message type' }));
    }
  }

  private async handleAuthentication(ws: GameWebSocket, payload: { userId: string, hackerName: string }) {
    ws.userId = payload.userId;
    ws.hackerName = payload.hackerName;
    this.userSockets.set(payload.userId, ws);
    
    ws.send(JSON.stringify({ 
      type: 'authenticated', 
      payload: { success: true, userId: payload.userId } 
    }));
  }

  private async handleJoinRoom(ws: GameWebSocket, payload: { roomId: number }) {
    if (!ws.userId) {
      ws.send(JSON.stringify({ type: 'error', message: 'Not authenticated' }));
      return;
    }

    ws.roomId = payload.roomId;
    
    if (!this.rooms.has(payload.roomId)) {
      this.rooms.set(payload.roomId, new Set());
    }
    
    this.rooms.get(payload.roomId)!.add(ws);
    
    // Notify other room members
    this.broadcastToRoom(payload.roomId, {
      type: 'player_joined',
      payload: {
        userId: ws.userId,
        hackerName: ws.hackerName,
        timestamp: new Date().toISOString()
      }
    }, ws);

    // Send current room state to the new player
    const members = await storage.getRoomMembers(payload.roomId);
    ws.send(JSON.stringify({
      type: 'room_state',
      payload: { members, roomId: payload.roomId }
    }));
  }

  private async handleLeaveRoom(ws: GameWebSocket) {
    if (ws.roomId) {
      const roomSockets = this.rooms.get(ws.roomId);
      if (roomSockets) {
        roomSockets.delete(ws);
        
        // Notify other room members
        this.broadcastToRoom(ws.roomId, {
          type: 'player_left',
          payload: {
            userId: ws.userId,
            hackerName: ws.hackerName,
            timestamp: new Date().toISOString()
          }
        });
      }
      ws.roomId = undefined;
    }
  }

  private async handleRoomChat(ws: GameWebSocket, payload: { message: string }) {
    if (!ws.roomId || !ws.userId) return;

    this.broadcastToRoom(ws.roomId, {
      type: 'chat_message',
      payload: {
        userId: ws.userId,
        hackerName: ws.hackerName,
        message: payload.message,
        timestamp: new Date().toISOString()
      }
    });
  }

  private async handleGameAction(ws: GameWebSocket, payload: any) {
    if (!ws.roomId || !ws.userId) return;

    // Broadcast game actions to all room members
    this.broadcastToRoom(ws.roomId, {
      type: 'game_action',
      payload: {
        userId: ws.userId,
        hackerName: ws.hackerName,
        action: payload,
        timestamp: new Date().toISOString()
      }
    });
  }

  private async handleMissionUpdate(ws: GameWebSocket, payload: any) {
    if (!ws.roomId || !ws.userId) return;

    // Share mission progress with team
    this.broadcastToRoom(ws.roomId, {
      type: 'mission_update',
      payload: {
        userId: ws.userId,
        hackerName: ws.hackerName,
        missionData: payload,
        timestamp: new Date().toISOString()
      }
    });
  }

  private broadcastToRoom(roomId: number, message: any, exclude?: GameWebSocket) {
    const roomSockets = this.rooms.get(roomId);
    if (!roomSockets) return;

    const messageStr = JSON.stringify(message);
    roomSockets.forEach(socket => {
      if (socket !== exclude && socket.readyState === WebSocket.OPEN) {
        socket.send(messageStr);
      }
    });
  }

  private handleDisconnection(ws: GameWebSocket) {
    if (ws.userId) {
      this.userSockets.delete(ws.userId);
    }
    
    if (ws.roomId) {
      this.handleLeaveRoom(ws);
    }
  }

  // Public method to send messages to specific users
  public sendToUser(userId: string, message: any) {
    const socket = this.userSockets.get(userId);
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(message));
    }
  }

  // Public method to broadcast to all users in a room
  public broadcastToRoomPublic(roomId: number, message: any) {
    this.broadcastToRoom(roomId, message);
  }
}