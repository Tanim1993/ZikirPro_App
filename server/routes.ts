import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertRoomSchema, insertRoomMemberSchema, updateUserProfileSchema } from "@shared/schema";
import { seedDatabase } from "./seedData";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware - temporarily disabled to fix authentication error
  // await setupAuth(app);

  // Seed database on startup
  try {
    await seedDatabase();
  } catch (error) {
    console.log("Database seeding error (may already be seeded):", error);
  }

  // Auth routes - check session for authenticated user
  app.get('/api/auth/user', async (req: any, res) => {
    try {
      // Check if user is logged in via session
      if (!req.session?.user?.id) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const userId = req.session.user.id;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // User profile routes with session auth
  app.put('/api/user/profile', async (req: any, res) => {
    try {
      if (!req.session?.user?.id) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const userId = req.session.user.id;
      const updates = updateUserProfileSchema.parse(req.body);
      const user = await storage.updateUserProfile(userId, updates);
      res.json(user);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  app.get('/api/user/analytics', async (req: any, res) => {
    try {
      if (!req.session?.user?.id) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const userId = req.session.user.id;
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
  app.post('/api/rooms', async (req: any, res) => {
    try {
      const userId = "test-user-123"; // Mock user ID
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

  app.get('/api/rooms/my', async (req: any, res) => {
    try {
      const userId = "test-user-123"; // Mock user ID
      const rooms = await storage.getUserRooms(userId);
      res.json(rooms);
    } catch (error) {
      console.error("Error fetching user rooms:", error);
      res.status(500).json({ message: "Failed to fetch user rooms" });
    }
  });

  app.get('/api/rooms/:id', async (req: any, res) => {
    try {
      const roomId = parseInt(req.params.id);
      const userId = "test-user-123"; // Mock user ID
      
      const room = await storage.getRoomWithDetails(roomId);
      if (!room) {
        return res.status(404).json({ message: "Room not found" });
      }

      // Auto-join user to public room if not already a member
      const isMember = await storage.isUserInRoom(roomId, userId);
      if (!isMember && room.isPublic) {
        await storage.joinRoom({
          roomId,
          userId,
          role: 'member',
          nickname: null,
          isActive: true,
        });
      } else if (!isMember) {
        return res.status(403).json({ message: "Access denied" });
      }

      res.json(room);
    } catch (error) {
      console.error("Error fetching room:", error);
      res.status(500).json({ message: "Failed to fetch room" });
    }
  });

  app.post('/api/rooms/:id/join', async (req: any, res) => {
    try {
      const roomId = parseInt(req.params.id);
      const userId = "test-user-123"; // Mock user ID
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

  app.post('/api/rooms/:id/leave', async (req: any, res) => {
    try {
      const roomId = parseInt(req.params.id);
      const userId = "test-user-123"; // Mock user ID

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

  app.get('/api/rooms/:id/leaderboard', async (req: any, res) => {
    try {
      const roomId = parseInt(req.params.id);
      const userId = "test-user-123"; // Mock user ID
      
      // Auto-join user to public room if not already a member
      const room = await storage.getRoomById(roomId);
      if (!room) {
        return res.status(404).json({ message: "Room not found" });
      }

      const isMember = await storage.isUserInRoom(roomId, userId);
      if (!isMember && room.isPublic) {
        await storage.joinRoom({
          roomId,
          userId,
          role: 'member',
          nickname: null,
          isActive: true,
        });
      } else if (!isMember) {
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
  app.post('/api/rooms/:id/count', async (req: any, res) => {
    try {
      const roomId = parseInt(req.params.id);
      const userId = "test-user-123"; // Mock user ID

      // Auto-join user to room if not already a member for public rooms
      const room = await storage.getRoomById(roomId);
      if (!room) {
        return res.status(404).json({ message: "Room not found" });
      }

      const isMember = await storage.isUserInRoom(roomId, userId);
      if (!isMember && room.isPublic) {
        // Auto-join user to public room
        await storage.joinRoom({
          roomId,
          userId,
          role: 'member',
          nickname: null,
          isActive: true,
        });
      } else if (!isMember) {
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

  app.post('/api/rooms/:id/reset', async (req: any, res) => {
    try {
      const roomId = parseInt(req.params.id);
      const userId = "test-user-123"; // Mock user ID

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
  app.post('/api/reports', async (req: any, res) => {
    try {
      const userId = "test-user-123"; // Mock user ID
      const { type, targetId, reason } = req.body;

      const report = await storage.createReport({
        type,
        targetId,
        reportedById: userId,
        reason,
        status: 'pending',
        resolvedAt: null,
      });

      res.json(report);
    } catch (error) {
      console.error("Error creating report:", error);
      res.status(500).json({ message: "Failed to create report" });
    }
  });

  // Global stats route
  app.get('/api/stats/global', async (req, res) => {
    try {
      const stats = await storage.getGlobalStats();
      res.json(stats);
    } catch (error) {
      console.error('Error getting global stats:', error);
      res.status(500).json({ message: 'Failed to get global stats' });
    }
  });

  // Global leaderboard route
  app.get('/api/leaderboard/global', async (req, res) => {
    try {
      const leaderboard = await storage.getGlobalLeaderboard(10);
      res.json(leaderboard);
    } catch (error) {
      console.error('Error getting global leaderboard:', error);
      res.status(500).json({ message: 'Failed to get global leaderboard' });
    }
  });

  // Admin routes (basic)
  app.get('/api/admin/reports', async (req: any, res) => {
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
  // Authentication routes
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
      }

      const user = await storage.authenticateUser(username, password);
      if (!user) {
        return res.status(401).json({ error: 'Invalid username or password' });
      }

      // Set session
      (req.session as any).user = { id: user.id };
      
      res.json({ 
        id: user.id, 
        username: user.username, 
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImageUrl: user.profileImageUrl,
        country: user.country,
        avatarType: user.avatarType,
        bgColor: user.bgColor
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/auth/signup', async (req, res) => {
    try {
      const { username, email, password, signupMethod } = req.body;
      
      if (signupMethod === 'username') {
        if (!username || !email || !password) {
          return res.status(400).json({ error: 'Username, email, and password are required' });
        }

        // Check if user already exists
        const existingUser = await storage.getUserByUsername(username);
        if (existingUser) {
          return res.status(409).json({ error: 'Username already exists' });
        }

        const existingEmail = await storage.getUserByEmail(email);
        if (existingEmail) {
          return res.status(409).json({ error: 'Email already exists' });
        }

        // Create user
        const user = await storage.createUser({
          username,
          email,
          password, // In real app, hash this with bcrypt
          signupMethod: 'username',
          isVerified: true, // Auto-verify for demo
          country: 'Bangladesh'
        });

        // Set session
        (req.session as any).user = { id: user.id };
        
        res.json({ 
          id: user.id, 
          username: user.username, 
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          profileImageUrl: user.profileImageUrl,
          country: user.country,
          avatarType: user.avatarType,
          bgColor: user.bgColor
        });
      } else {
        res.status(400).json({ error: 'Invalid signup method' });
      }
    } catch (error) {
      console.error('Signup error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/auth/send-otp', async (req, res) => {
    try {
      const { phone } = req.body;
      
      if (!phone) {
        return res.status(400).json({ error: 'Phone number is required' });
      }

      // In a real app, you'd use Twilio or similar service
      // For demo, we'll just simulate sending OTP
      console.log(`Sending OTP to ${phone}: 123456`);
      
      res.json({ message: 'OTP sent successfully' });
    } catch (error) {
      console.error('Send OTP error:', error);
      res.status(500).json({ error: 'Failed to send OTP' });
    }
  });

  app.post('/api/auth/verify-otp', async (req, res) => {
    try {
      const { phone, otp } = req.body;
      
      if (!phone || !otp) {
        return res.status(400).json({ error: 'Phone number and OTP are required' });
      }

      // For demo, accept 123456 as valid OTP
      if (otp !== '123456') {
        return res.status(400).json({ error: 'Invalid OTP' });
      }

      // Check if user already exists
      let user = await storage.getUserByPhone(phone);
      if (!user) {
        // Create new user
        user = await storage.createUser({
          phone,
          signupMethod: 'phone',
          isVerified: true,
          country: 'Bangladesh',
          username: `user_${phone.replace(/[^0-9]/g, '').slice(-6)}`
        });
      }

      // Set session
      (req.session as any).user = { id: user.id };
      
      res.json({ 
        id: user.id, 
        username: user.username, 
        email: user.email,
        phone: user.phone,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImageUrl: user.profileImageUrl,
        country: user.country,
        avatarType: user.avatarType,
        bgColor: user.bgColor
      });
    } catch (error) {
      console.error('Verify OTP error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/api/auth/google', (req, res) => {
    // In a real app, this would redirect to Google OAuth
    // For demo, we'll simulate Google login
    res.redirect('/api/auth/google/callback?code=demo_code');
  });

  app.get('/api/auth/google/callback', async (req, res) => {
    try {
      // In a real app, you'd exchange the code for user info from Google
      // For demo, we'll create a demo Google user
      const email = 'google.user@gmail.com';
      let user = await storage.getUserByEmail(email);
      
      if (!user) {
        user = await storage.createUser({
          email,
          firstName: 'Google',
          lastName: 'User',
          signupMethod: 'google',
          isVerified: true,
          country: 'Bangladesh',
          username: 'google_user'
        });
      }

      // Set session
      (req.session as any).user = { id: user.id };
      
      res.redirect('/dashboard');
    } catch (error) {
      console.error('Google callback error:', error);
      res.redirect('/login?error=google_auth_failed');
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to logout' });
      }
      res.json({ message: 'Logged out successfully' });
    });
  });

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
