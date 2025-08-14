import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import session from "express-session";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertRoomSchema, insertRoomMemberSchema, updateUserProfileSchema } from "@shared/schema";
import { seedDatabase } from "./seedData";

// Extend Express session to include user
declare module 'express-session' {
  interface SessionData {
    user?: { id: string };
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Session middleware for authentication
  app.use(session({
    secret: 'your-session-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 24 hours
  }));

  // Auth middleware - temporarily disabled to fix authentication error
  // await setupAuth(app);

  // Seed database with initial data - temporarily disabled for faster startup
  // Uncomment the following lines to enable database seeding:
  /*
  try {
    await seedDatabase();
  } catch (error) {
    console.log("Database seeding error (may already be seeded):", error.message);
  }
  */

  // Create test user for authentication testing
  try {
    const existingUser = await storage.getUserByUsername("test001");
    if (!existingUser) {
      await storage.createUser({
        id: "test001-user-id",
        username: "test001",
        password: "Pw001",
        email: "test001@example.com",
        firstName: "Test",
        lastName: "User",
        signupMethod: "username",
        isVerified: true,
        country: "Bangladesh"
      });
      console.log("Created test user: test001/Pw001");
    }
  } catch (error) {
    console.log("Test user creation skipped:", error.message);
  }

  // Login endpoint
  app.post('/api/auth/login', async (req: any, res) => {
    try {
      const { username, password, rememberMe } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password required" });
      }
      
      const user = await storage.authenticateUser(username, password);
      
      if (!user) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      
      // Set session with extended duration if rememberMe is checked
      req.session.user = { id: user.id };
      
      if (rememberMe) {
        // Extend session to 30 days
        req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
      } else {
        // Default browser session (until browser closes)
        req.session.cookie.maxAge = undefined;
      }
      
      res.json({ message: "Login successful", user });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Signup endpoint  
  app.post('/api/auth/signup', async (req: any, res) => {
    try {
      const { username, email, password, firstName, lastName, phone, signupMethod } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password required" });
      }
      
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      if (email) {
        const existingEmail = await storage.getUserByEmail(email);
        if (existingEmail) {
          return res.status(400).json({ message: "Email already exists" });
        }
      }
      
      // Create new user
      const newUser = await storage.createUser({
        username,
        email,
        password,
        firstName,
        lastName,
        phone,
        signupMethod: signupMethod || 'username',
        isVerified: true,
        country: 'Bangladesh'
      });
      
      // Set session
      req.session.user = { id: newUser.id };
      
      res.json({ message: "Signup successful", user: newUser });
    } catch (error) {
      console.error("Signup error:", error);
      res.status(500).json({ message: "Signup failed" });
    }
  });

  // Logout endpoint
  app.post('/api/auth/logout', async (req: any, res) => {
    try {
      req.session.destroy((err: any) => {
        if (err) {
          return res.status(500).json({ message: "Logout failed" });
        }
        res.json({ message: "Logout successful" });
      });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({ message: "Logout failed" });
    }
  });

  // Handle GET logout (for direct browser navigation)
  app.get('/api/logout', (req: any, res) => {
    req.session.destroy((err: any) => {
      if (err) {
        console.error("Logout error:", err);
      }
      // Redirect to landing page after logout
      res.redirect('/');
    });
  });

  // Handle GET logout (for direct browser navigation)
  app.get('/api/logout', (req: any, res) => {
    req.session.destroy((err: any) => {
      if (err) {
        console.error("Logout error:", err);
      }
      // Redirect to landing page after logout
      res.redirect('/');
    });
  });

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
      
      // Calculate real total count from all user's count entries
      const totalCount = await storage.getUserTotalCount(userId);
      
      // Calculate streak data
      const streakData = await storage.calculateUserStreak(userId);
      
      // Get user analytics for other data
      const analytics = await storage.getUserAnalytics(userId);
      
      res.json({
        currentStreak: streakData.currentStreak,
        longestStreak: streakData.longestStreak,
        totalCount: totalCount,
        totalZikir: totalCount, // For backward compatibility
        completedRooms: analytics?.completedRooms || 0
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
      
      // Automatically add the creator as a member of their own room
      await storage.joinRoom({
        roomId: room.id,
        userId: userId,
        role: 'owner',
        nickname: null,
        isActive: true,
      });
      
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
      const { username, password, rememberMe } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
      }

      const user = await storage.authenticateUser(username, password);
      if (!user) {
        return res.status(401).json({ error: 'Invalid username or password' });
      }

      // Set session with extended duration if "Remember Me" is checked
      const sessionData = { id: user.id };
      (req.session as any).user = sessionData;
      
      // Set session maxAge based on rememberMe flag
      if (rememberMe) {
        // Extend session to 30 days (30 * 24 * 60 * 60 * 1000 milliseconds)
        req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000;
        console.log('Extended session set for 30 days for user:', user.username);
      } else {
        // Default session duration (browser session only)
        req.session.cookie.maxAge = undefined;
        console.log('Regular session set for user:', user.username);
      }
      
      res.json({ 
        message: 'Login successful',
        user: {
          id: user.id, 
          username: user.username, 
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          profileImageUrl: user.profileImageUrl,
          country: user.country,
          avatarType: user.avatarType,
          bgColor: user.bgColor
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Register store routes for tasbih system
  const { registerStoreRoutes } = await import("./storeRoutes");
  registerStoreRoutes(app);

  // Seed tasbih data on startup
  try {
    const { seedTasbihSkins } = await import("./seedTasbihData");
    await seedTasbihSkins();
  } catch (error) {
    console.log("Tasbih seeding error (may already be seeded):", (error as Error).message);
  }

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

  // Room deletion endpoint (only owner if sole member)
  app.delete('/api/rooms/:roomId', async (req, res) => {
    try {
      const roomId = parseInt(req.params.roomId);
      const userId = "test-user-123"; // Mock user ID for testing

      // Get room and check ownership
      const room = await storage.getRoom(roomId);
      if (!room) {
        return res.status(404).json({ error: 'Room not found' });
      }

      if (room.ownerId !== userId) {
        return res.status(403).json({ error: 'Only room owner can delete room' });
      }

      // Check if owner is sole member
      const memberCount = await storage.getRoomMemberCount(roomId);
      if (memberCount > 1) {
        return res.status(400).json({ error: 'Room cannot be deleted after members join' });
      }

      // Delete room and all related data
      await storage.deleteRoom(roomId);
      res.json({ message: 'Room deleted successfully' });
    } catch (error) {
      console.error('Room deletion error:', error);
      res.status(500).json({ error: 'Failed to delete room' });
    }
  });

  // Get room member count
  app.get('/api/rooms/:roomId/member-count', async (req, res) => {
    try {
      const roomId = parseInt(req.params.roomId);
      const count = await storage.getRoomMemberCount(roomId);
      res.json(count);
    } catch (error) {
      console.error('Error getting member count:', error);
      res.status(500).json({ error: 'Failed to get member count' });
    }
  });

  // Room reporting endpoint
  app.post('/api/rooms/:roomId/report', async (req, res) => {
    try {
      const roomId = req.params.roomId;
      const userId = "test-user-123"; // Mock user ID for testing
      const { reason, details } = req.body;

      if (!reason) {
        return res.status(400).json({ error: 'Reason is required' });
      }

      // Create report
      const report = await storage.createReport({
        kind: 'room',
        targetId: roomId,
        byUserId: userId,
        reason,
        details: details || null,
        status: 'open',
        adminNotes: null,
        resolvedAt: null
      });

      res.json({ 
        message: 'Report submitted successfully. Admin will review shortly.',
        reportId: report.id 
      });
    } catch (error) {
      console.error('Room reporting error:', error);
      res.status(500).json({ error: 'Failed to submit report' });
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
