import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertRoomSchema, insertRoomMemberSchema, updateUserProfileSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // User profile routes
  app.put('/api/user/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const updates = updateUserProfileSchema.parse(req.body);
      const user = await storage.updateUserProfile(userId, updates);
      res.json(user);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  app.get('/api/user/analytics', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const analytics = await storage.getUserAnalytics(userId);
      res.json(analytics || {
        currentStreak: 0,
        longestStreak: 0,
        totalZikir: 0,
        completedRooms: 0
      });
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  // Zikir routes
  app.get('/api/zikirs', async (req, res) => {
    try {
      const zikirs = await storage.getAllZikirs();
      res.json(zikirs);
    } catch (error) {
      console.error("Error fetching zikirs:", error);
      res.status(500).json({ message: "Failed to fetch zikirs" });
    }
  });

  // Room routes
  app.post('/api/rooms', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const roomData = insertRoomSchema.parse({
        ...req.body,
        ownerId: userId
      });
      const room = await storage.createRoom(roomData);
      res.json(room);
    } catch (error) {
      console.error("Error creating room:", error);
      res.status(500).json({ message: "Failed to create room" });
    }
  });

  app.get('/api/rooms/public', async (req, res) => {
    try {
      const country = req.query.country as string;
      const rooms = await storage.getPublicRooms(country);
      res.json(rooms);
    } catch (error) {
      console.error("Error fetching public rooms:", error);
      res.status(500).json({ message: "Failed to fetch rooms" });
    }
  });

  app.get('/api/rooms/my', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const rooms = await storage.getUserRooms(userId);
      res.json(rooms);
    } catch (error) {
      console.error("Error fetching user rooms:", error);
      res.status(500).json({ message: "Failed to fetch user rooms" });
    }
  });

  app.get('/api/rooms/:id', isAuthenticated, async (req: any, res) => {
    try {
      const roomId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      // Check if user is in room
      const isMember = await storage.isUserInRoom(roomId, userId);
      if (!isMember) {
        return res.status(403).json({ message: "Access denied" });
      }

      const room = await storage.getRoomWithDetails(roomId);
      res.json(room);
    } catch (error) {
      console.error("Error fetching room:", error);
      res.status(500).json({ message: "Failed to fetch room" });
    }
  });

  app.post('/api/rooms/:id/join', isAuthenticated, async (req: any, res) => {
    try {
      const roomId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      const { nickname } = req.body;

      const membership = await storage.joinRoom({
        roomId,
        userId,
        nickname: nickname || null,
      });
      
      // Broadcast to room that new member joined
      broadcastToRoom(roomId, {
        type: 'memberJoined',
        data: { roomId, userId, nickname }
      });

      res.json(membership);
    } catch (error) {
      console.error("Error joining room:", error);
      res.status(500).json({ message: "Failed to join room" });
    }
  });

  app.post('/api/rooms/:id/leave', isAuthenticated, async (req: any, res) => {
    try {
      const roomId = parseInt(req.params.id);
      const userId = req.user.claims.sub;

      await storage.leaveRoom(roomId, userId);
      
      // Broadcast to room that member left
      broadcastToRoom(roomId, {
        type: 'memberLeft',
        data: { roomId, userId }
      });

      res.json({ success: true });
    } catch (error) {
      console.error("Error leaving room:", error);
      res.status(500).json({ message: "Failed to leave room" });
    }
  });

  app.get('/api/rooms/:id/leaderboard', isAuthenticated, async (req: any, res) => {
    try {
      const roomId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      const isMember = await storage.isUserInRoom(roomId, userId);
      if (!isMember) {
        return res.status(403).json({ message: "Access denied" });
      }

      const leaderboard = await storage.getRoomLeaderboard(roomId);
      res.json(leaderboard);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      res.status(500).json({ message: "Failed to fetch leaderboard" });
    }
  });

  // Counting routes
  app.post('/api/rooms/:id/count', isAuthenticated, async (req: any, res) => {
    try {
      const roomId = parseInt(req.params.id);
      const userId = req.user.claims.sub;

      const isMember = await storage.isUserInRoom(roomId, userId);
      if (!isMember) {
        return res.status(403).json({ message: "Access denied" });
      }

      const counter = await storage.incrementCount(roomId, userId);
      
      // Update user analytics
      const analytics = await storage.getUserAnalytics(userId);
      await storage.updateUserAnalytics(userId, {
        totalZikir: (analytics?.totalZikir || 0) + 1,
        lastActiveDate: new Date(),
      });

      // Broadcast count update to room
      const leaderboard = await storage.getRoomLeaderboard(roomId);
      broadcastToRoom(roomId, {
        type: 'countUpdate',
        data: { roomId, userId, counter, leaderboard }
      });

      res.json(counter);
    } catch (error) {
      console.error("Error incrementing count:", error);
      res.status(500).json({ message: "Failed to increment count" });
    }
  });

  app.post('/api/rooms/:id/reset', isAuthenticated, async (req: any, res) => {
    try {
      const roomId = parseInt(req.params.id);
      const userId = req.user.claims.sub;

      const isMember = await storage.isUserInRoom(roomId, userId);
      if (!isMember) {
        return res.status(403).json({ message: "Access denied" });
      }

      await storage.resetUserCount(roomId, userId);
      
      // Broadcast reset to room
      const leaderboard = await storage.getRoomLeaderboard(roomId);
      broadcastToRoom(roomId, {
        type: 'countReset',
        data: { roomId, userId, leaderboard }
      });

      res.json({ success: true });
    } catch (error) {
      console.error("Error resetting count:", error);
      res.status(500).json({ message: "Failed to reset count" });
    }
  });

  // Report routes
  app.post('/api/reports', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { type, targetId, reason } = req.body;

      const report = await storage.createReport({
        type,
        targetId,
        reportedById: userId,
        reason,
        status: 'pending',
      });

      res.json(report);
    } catch (error) {
      console.error("Error creating report:", error);
      res.status(500).json({ message: "Failed to create report" });
    }
  });

  // Admin routes (basic)
  app.get('/api/admin/reports', isAuthenticated, async (req: any, res) => {
    try {
      // TODO: Add admin role check
      const reports = await storage.getReports();
      res.json(reports);
    } catch (error) {
      console.error("Error fetching reports:", error);
      res.status(500).json({ message: "Failed to fetch reports" });
    }
  });

  const httpServer = createServer(app);

  // WebSocket for real-time features
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  // Store active connections by room
  const roomConnections = new Map<number, Set<WebSocket>>();

  wss.on('connection', (ws: WebSocket, req) => {
    let currentRoomId: number | null = null;

    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        if (data.type === 'joinRoom') {
          const roomId = data.roomId;
          currentRoomId = roomId;
          
          if (!roomConnections.has(roomId)) {
            roomConnections.set(roomId, new Set());
          }
          roomConnections.get(roomId)!.add(ws);
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      if (currentRoomId && roomConnections.has(currentRoomId)) {
        roomConnections.get(currentRoomId)!.delete(ws);
      }
    });
  });

  // Broadcast function for real-time updates
  function broadcastToRoom(roomId: number, message: any) {
    const connections = roomConnections.get(roomId);
    if (connections) {
      const messageStr = JSON.stringify(message);
      connections.forEach(ws => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(messageStr);
        }
      });
    }
  }

  // Seed initial data
  seedInitialData();

  return httpServer;
}

// Seed function for initial zikirs
async function seedInitialData() {
  try {
    const existingZikirs = await storage.getAllZikirs();
    if (existingZikirs.length === 0) {
      // Create initial zikir data
      const initialZikirs = [
        {
          name: "Subhan Allah",
          arabicText: "سُبْحَانَ اللهِ",
          transliteration: "Subhan Allah",
          translation: "Glory be to Allah",
          fazilat: "Each tasbih is rewarded with 10 good deeds and 10 sins are forgiven",
          references: "Sahih Muslim"
        },
        {
          name: "Alhamdulillah",
          arabicText: "الْحَمْدُ لِلَّهِ",
          transliteration: "Alhamdulillah",
          translation: "All praise is due to Allah",
          fazilat: "This fills the scale of good deeds",
          references: "Sahih Muslim"
        },
        {
          name: "Allahu Akbar",
          arabicText: "اللهُ أَكْبَرُ",
          transliteration: "Allahu Akbar",
          translation: "Allah is the Greatest",
          fazilat: "This fills what is between the heaven and the earth",
          references: "Sahih Muslim"
        },
        {
          name: "La ilaha illa Allah",
          arabicText: "لَا إِلٰهَ إِلَّا اللهُ",
          transliteration: "La ilaha illa Allah",
          translation: "There is no deity except Allah",
          fazilat: "The best of dhikr and the key to Paradise",
          references: "Tirmidhi"
        },
        {
          name: "Astaghfirullah",
          arabicText: "أَسْتَغْفِرُ اللهَ",
          transliteration: "Astaghfirullah",
          translation: "I seek forgiveness from Allah",
          fazilat: "Opens the doors of mercy and provision",
          references: "Abu Dawud"
        }
      ];

      // This would normally be done with proper seeding, but for demo we'll skip
      console.log("Initial zikirs would be seeded here");
    }
  } catch (error) {
    console.error("Error seeding data:", error);
  }
}
