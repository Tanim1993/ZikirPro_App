import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import session from "express-session";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertRoomSchema, insertRoomMemberSchema, updateUserProfileSchema, insertSeasonalCompetitionSchema, insertAchievementBadgeSchema } from "@shared/schema";
import { db } from "./db";
import { sql } from "drizzle-orm";
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

  // Auth middleware - temporarily disabled due to configuration issues
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

  // Create test users for authentication testing
  try {
    // Regular user
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
        country: "Bangladesh",
        userType: "regular"
      });
      console.log("Created regular test user: test001/Pw001");
    }
    
    // Organization user
    const existingOrg = await storage.getUserByUsername("testorg001");
    if (!existingOrg) {
      await storage.createUser({
        id: "testorg001-user-id",
        username: "testorg001",
        password: "Pw001",
        email: "testorg001@example.com",
        firstName: "Test",
        lastName: "Organization",
        signupMethod: "username",
        isVerified: true,
        country: "Bangladesh",
        userType: "organization",
        organizationName: "Test Islamic Center",
        organizationDescription: "A test organization for Islamic competitions"
      });
      console.log("Created organization test user: testorg001/Pw001");
    }
  } catch (error) {
    console.log("Test user creation skipped:", (error as Error).message);
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
      // Clear logout flag if it exists
      req.session.loggedOut = false;
      
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
      // Clear logout flag if it exists
      req.session.loggedOut = false;
      
      res.json({ message: "Signup successful", user: newUser });
    } catch (error) {
      console.error("Signup error:", error);
      res.status(500).json({ message: "Signup failed" });
    }
  });

  // Logout endpoint
  app.post('/api/auth/logout', async (req: any, res) => {
    try {
      // Set logout flag in session instead of destroying
      req.session.loggedOut = true;
      res.json({ message: "Logout successful" });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({ message: "Logout failed" });
    }
  });

  // Handle GET logout (for direct browser navigation)
  app.get('/api/logout', (req: any, res) => {
    // Set logout flag in session and redirect
    req.session.loggedOut = true;
    res.redirect('/');
  });

  // Auth routes - check if user is logged out via session flag
  app.get('/api/auth/user', async (req: any, res) => {
    try {
      // Check if user was manually logged out
      if (req.session?.loggedOut) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      if (req.session?.user) {
        // Get actual user data from storage
        const user = await storage.getUser(req.session.user.id);
        if (user) {
          return res.json(user);
        }
      }
      
      // If no session, return 401
      return res.status(401).json({ message: "Not authenticated" });
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

  // Update user mazhab preference
  app.put("/api/user/mazhab", async (req, res) => {
    try {
      const userId = "test-user-123"; // Mock user ID
      const { mazhab } = req.body;
      
      if (!['Hanafi', 'Shafi', 'Maliki', 'Hanbali'].includes(mazhab)) {
        return res.status(400).json({ message: "Invalid mazhab" });
      }
      
      // Note: This would typically update a user preferences table
      // For now, we'll store it in memory or extend the user model
      res.json({ message: "Mazhab updated successfully", mazhab });
    } catch (error) {
      console.error("Error updating mazhab:", error);
      res.status(500).json({ message: "Failed to update mazhab" });
    }
  });

  app.get('/api/user/analytics', async (req: any, res) => {
    try {
      const userId = "test-user-123"; // Mock user ID for testing
      
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

  app.get('/api/rooms/organizations', async (req: any, res) => {
    try {
      const userId = "test-user-123"; // Mock user ID
      const orgRooms = await storage.getOrganizationRooms(userId);
      res.json(orgRooms);
    } catch (error) {
      console.error("Error fetching organization rooms:", error);
      res.status(500).json({ message: "Failed to fetch organization rooms" });
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

  // Get user's count in room - for count persistence
  app.get('/api/rooms/:id/user-count', async (req: any, res) => {
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

      // Get user's current count in this room
      const userCounter = await storage.getUserCountInRoom(roomId, userId);
      res.json(userCounter?.currentCount || 0);
    } catch (error) {
      console.error("Error fetching user count:", error);
      res.status(500).json({ message: "Failed to fetch user count" });
    }
  });

  // Counting routes
  app.post('/api/rooms/:id/count', async (req: any, res) => {
    try {
      const roomId = parseInt(req.params.id);
      const userId = req.session?.user?.id || "test-user-123";

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
      const newTotalCount = (analytics?.totalZikir || 0) + 1;
      await storage.updateUserAnalytics(userId, {
        totalZikir: newTotalCount,
        lastActiveDate: new Date(),
      });

      // Update seasonal competition progress
      try {
        await updateSeasonalCompetitionProgress(userId, 1, newTotalCount);
      } catch (seasonalError) {
        console.error("Error updating seasonal competition progress:", seasonalError);
        // Don't fail the count submission if seasonal update fails
      }

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

  // Helper function to update seasonal competition progress
  async function updateSeasonalCompetitionProgress(userId: string, incrementCount: number, totalCount: number) {
    try {
      // Get user's active seasonal competition participations
      const participations = await db.execute(sql`
        SELECT scp.*, sc.target_count, sc.unlimited 
        FROM seasonal_competition_participants scp
        JOIN seasonal_competitions sc ON scp.competition_id = sc.id
        WHERE scp.user_id = ${userId} AND sc.is_active = true
        AND sc.start_date <= NOW() AND sc.end_date >= NOW()
      `);

      for (const participation of participations.rows || []) {
        // Update the participant's count
        await db.execute(sql`
          UPDATE seasonal_competition_participants 
          SET total_count = total_count + ${incrementCount},
              last_activity = NOW()
          WHERE id = ${participation.id}
        `);

        // Check if user completed the competition (if not unlimited)
        if (!participation.unlimited && participation.target_count) {
          const newTotal = (participation.total_count || 0) + incrementCount;
          if (newTotal >= participation.target_count) {
            console.log(`User ${userId} completed seasonal competition ${participation.competition_id}!`);
            // Here you could trigger completion notifications or badges
          }
        }
      }
    } catch (error) {
      console.error("Error updating seasonal competition progress:", error);
      throw error;
    }
  }

  // Bulk count endpoint for offline sync
  app.post('/api/rooms/:id/count/bulk', async (req: any, res) => {
    try {
      const roomId = parseInt(req.params.id);
      const { userId, count, timestamps, offlineIds } = req.body;

      if (!userId || !count || count <= 0) {
        return res.status(400).json({ message: "Invalid bulk count data" });
      }

      // Verify user is member of room
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

      // Add the bulk count
      let finalCount = 0;
      for (let i = 0; i < count; i++) {
        const counter = await storage.incrementCount(roomId, userId);
        finalCount = counter.currentCount || counter.totalCount || 0;
      }

      // Update user analytics
      const analytics = await storage.getUserAnalytics(userId);
      const newTotalCount = (analytics?.totalZikir || 0) + count;
      await storage.updateUserAnalytics(userId, {
        totalZikir: newTotalCount,
        lastActiveDate: new Date(),
      });

      // Update seasonal competition progress for bulk counts
      try {
        await updateSeasonalCompetitionProgress(userId, count, newTotalCount);
      } catch (seasonalError) {
        console.error("Error updating seasonal competition progress (bulk):", seasonalError);
        // Don't fail the bulk count submission if seasonal update fails
      }

      // Broadcast final count update to room
      const leaderboard = await storage.getRoomLeaderboard(roomId);
      broadcastToRoom(roomId, {
        type: 'bulkCountUpdate',
        data: { 
          roomId, 
          userId, 
          count: finalCount, 
          addedCount: count,
          leaderboard,
          offlineIds 
        }
      });

      res.json({ 
        success: true, 
        finalCount, 
        addedCount: count,
        offlineIds 
      });

    } catch (error) {
      console.error("Error processing bulk count:", error);
      res.status(500).json({ message: "Failed to process bulk count" });
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
        kind: type,
        targetId,
        byUserId: userId,
        reason,
        status: 'pending',
        details: null,
        adminNotes: null,
        resolvedAt: null,
      });

      res.json(report);
    } catch (error) {
      console.error("Error creating report:", error);
      res.status(500).json({ message: "Failed to create report" });
    }
  });

  // User analytics route (no auth required for testing)
  app.get('/api/user/analytics', async (req: any, res) => {
    try {
      const userId = "test-user-123"; // Mock user ID
      
      // Get user total count across all rooms
      const totalCount = await storage.getUserTotalCount(userId);
      
      // Get user streak
      const { currentStreak, longestStreak } = await storage.calculateUserStreak(userId);
      
      // Get user's active room count
      const userRooms = await storage.getUserRooms(userId);
      const roomCount = userRooms.length;

      const analytics = {
        totalCount,
        currentStreak,
        longestStreak,
        roomCount,
        lastActiveDate: new Date(),
      };

      res.json(analytics);
    } catch (error) {
      console.error('Error getting user analytics:', error);
      res.status(500).json({ message: 'Failed to get user analytics' });
    }
  });

  // Global leaderboard route
  app.get('/api/leaderboard/global', async (req, res) => {
    try {
      const globalLeaderboard = await storage.getGlobalLeaderboard();
      res.json(globalLeaderboard);
    } catch (error) {
      console.error('Error getting global leaderboard:', error);
      res.status(500).json({ message: 'Failed to get global leaderboard' });
    }
  });

  // Organization signup route
  app.post('/api/auth/signup-organization', async (req, res) => {
    try {
      const { username, email, password, organizationName, organizationDescription, country } = req.body;
      
      // Validate required fields
      if (!username || !email || !password || !organizationName || !organizationDescription) {
        return res.status(400).json({ message: 'All required fields must be provided' });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: 'Username already exists' });
      }

      // Create organization user
      const newUser = await storage.createUser({
        username,
        email,
        password, // In production, this should be hashed
        userType: 'organization',
        organizationName,
        organizationDescription,
        country: country || 'Bangladesh',
        isVerified: false, // Will be verified by admin
        signupMethod: 'username',
      });

      res.status(201).json({
        message: 'Organization account created successfully',
        user: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          userType: newUser.userType,
          organizationName: newUser.organizationName,
          isVerified: newUser.isVerified,
        },
      });
    } catch (error) {
      console.error('Error creating organization account:', error);
      res.status(500).json({ message: 'Failed to create organization account' });
    }
  });

  // Create competition room route (for organizations)
  app.post('/api/rooms/competition', async (req, res) => {
    try {
      const userId = "test-user-123"; // Mock user ID for testing
      
      const {
        name,
        description,
        zikirId,
        prizeDescription,
        competitionStartDate,
        competitionEndDate,
        targetCount,
        unlimited,
        duration,
        isPublic,
        country,
        maxParticipants,
        levelRequired,
      } = req.body;

      // Validate required fields
      if (!name || !description || !zikirId || !prizeDescription || !competitionStartDate || !competitionEndDate) {
        return res.status(400).json({ message: 'All required fields must be provided' });
      }

      // Create competition room
      const room = await storage.createRoom({
        zikirId: parseInt(zikirId),
        ownerId: userId,
        name,
        description,
        targetCount: unlimited ? null : parseInt(targetCount),
        unlimited: unlimited || false,
        duration: parseInt(duration) || 30,
        isPublic: isPublic !== false,
        country: country || 'Bangladesh',
        prizeDescription,
        competitionType: 'competition',
        competitionStartDate: new Date(competitionStartDate),
        competitionEndDate: new Date(competitionEndDate),
        maxParticipants: maxParticipants ? parseInt(maxParticipants) : null,
        levelRequired: levelRequired ? parseInt(levelRequired) : 1,
      });

      // Add owner as a member
      await storage.joinRoom({
        roomId: room.id,
        userId: userId,
        role: 'owner'
      });

      res.status(201).json(room);
    } catch (error) {
      console.error('Error creating competition room:', error);
      res.status(500).json({ message: 'Failed to create competition room' });
    }
  });

  // Search rooms route (with organization filters)
  app.get('/api/rooms/search', async (req, res) => {
    try {
      const { query, type } = req.query;
      
      let rooms = [];
      
      if (type === 'organization') {
        // Search for organization rooms
        rooms = await storage.searchOrganizationRooms(query as string);
      } else {
        // General room search
        rooms = await storage.searchRooms(query as string);
      }

      res.json(rooms);
    } catch (error) {
      console.error('Error searching rooms:', error);
      res.status(500).json({ message: 'Failed to search rooms' });
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

  // Organization Levels API routes
  
  // Get organizations list
  app.get('/api/organizations', async (req, res) => {
    try {
      const organizations = await storage.getOrganizations();
      res.json(organizations);
    } catch (error) {
      console.error('Error fetching organizations:', error);
      res.status(500).json({ message: 'Failed to fetch organizations' });
    }
  });

  // Get organization level schema
  app.get('/api/organizations/:orgId/levels', async (req, res) => {
    try {
      const { orgId } = req.params;
      const schema = await storage.getOrgLevelSchema(orgId);
      
      if (!schema) {
        // Return default schema if none exists
        const defaultLevels = [
          { level: 1, name: 'Darajah 1', description: 'Beginner level', color: '#10B981' },
          { level: 2, name: 'Darajah 2', description: 'Intermediate level', color: '#3B82F6' },
          { level: 3, name: 'Darajah 3', description: 'Advanced level', color: '#8B5CF6' },
          { level: 4, name: 'Darajah 4', description: 'Expert level', color: '#F59E0B' },
          { level: 5, name: 'Darajah 5', description: 'Master level', color: '#EF4444' },
        ];
        const defaultRules = [
          { fromLevel: 1, toLevel: 2, anyOf: [{ top3: 3 }, { top10: 5 }] },
          { fromLevel: 2, toLevel: 3, anyOf: [{ top3: 5 }, { top5: 8 }] },
          { fromLevel: 3, toLevel: 4, anyOf: [{ top3: 8 }, { top5: 12 }] },
          { fromLevel: 4, toLevel: 5, anyOf: [{ top3: 12 }, { top5: 20 }] },
        ];
        
        return res.json({ levels: defaultLevels, promotionRules: defaultRules });
      }
      
      res.json({
        levels: JSON.parse(schema.levels as string),
        promotionRules: JSON.parse(schema.promotionRules as string)
      });
    } catch (error) {
      console.error('Error fetching organization levels:', error);
      res.status(500).json({ message: 'Failed to fetch organization levels' });
    }
  });

  // Check user eligibility for competition
  app.get('/api/competitions/:compId/eligibility', async (req, res) => {
    try {
      const compId = parseInt(req.params.compId);
      const userId = "test001-user-id"; // Mock user ID
      
      // Get competition details
      const competition = await storage.getRoomById(compId);
      if (!competition) {
        return res.status(404).json({ message: 'Competition not found' });
      }
      
      // Check eligibility
      const eligibility = await storage.checkEligibility(userId, competition.createdBy, competition.levelRequired || 1);
      res.json(eligibility);
    } catch (error) {
      console.error('Error checking eligibility:', error);
      res.status(500).json({ message: 'Failed to check eligibility' });
    }
  });

  // Get user's promotion progress in an organization
  app.get('/api/organizations/:orgId/promotion-progress', async (req, res) => {
    try {
      const { orgId } = req.params;
      const userId = "test001-user-id"; // Mock user ID
      
      const progress = await storage.getPromotionProgress(userId, orgId);
      res.json(progress);
    } catch (error) {
      console.error('Error fetching promotion progress:', error);
      res.status(500).json({ message: 'Failed to fetch promotion progress' });
    }
  });

  // Join competition with level gating
  app.post('/api/competitions/:compId/join', async (req, res) => {
    try {
      const compId = parseInt(req.params.compId);
      const userId = "test001-user-id"; // Mock user ID
      
      // Get competition details
      const competition = await storage.getRoomById(compId);
      if (!competition) {
        return res.status(404).json({ message: 'Competition not found' });
      }
      
      // Check eligibility
      const eligibility = await storage.checkEligibility(userId, competition.createdBy, competition.levelRequired || 1);
      if (!eligibility.eligible) {
        return res.status(403).json({ 
          message: eligibility.reason || 'Not eligible to join this competition',
          userLevel: eligibility.userLevel
        });
      }
      
      // Join the competition
      const participation = await storage.joinCompetition(compId, userId, eligibility.userLevel);
      res.json(participation);
    } catch (error) {
      console.error('Error joining competition:', error);
      res.status(500).json({ message: 'Failed to join competition' });
    }
  });

  // Seasonal competitions routes
  app.get('/api/seasonal-competitions', async (req, res) => {
    try {
      const competitions = await storage.getActiveSeasonalCompetitions();
      res.json(competitions);
    } catch (error) {
      console.error('Error fetching seasonal competitions:', error);
      res.status(500).json({ error: 'Failed to fetch seasonal competitions' });
    }
  });

  app.post('/api/seasonal-competitions', async (req, res) => {
    try {
      const competitionData = insertSeasonalCompetitionSchema.parse(req.body);
      const competition = await storage.createSeasonalCompetition(competitionData);
      res.json(competition);
    } catch (error) {
      console.error('Error creating seasonal competition:', error);
      res.status(500).json({ error: 'Failed to create seasonal competition' });
    }
  });

  app.post('/api/seasonal-competitions/:id/join', async (req, res) => {
    try {
      const competitionId = parseInt(req.params.id);
      const userId = req.session?.user?.id || "test001-user-id";
      
      const participant = await storage.joinSeasonalCompetition(competitionId, userId);
      res.json(participant);
    } catch (error) {
      console.error('Error joining seasonal competition:', error);
      res.status(500).json({ error: 'Failed to join seasonal competition' });
    }
  });

  // Get seasonal competition leaderboard
  app.get('/api/seasonal-competitions/:id/leaderboard', async (req, res) => {
    try {
      const competitionId = parseInt(req.params.id);
      
      const leaderboard = await db.execute(sql`
        SELECT 
          scp.user_id,
          scp.total_count,
          scp.current_rank,
          scp.last_activity,
          u.username,
          u.display_name
        FROM seasonal_competition_participants scp
        LEFT JOIN users u ON scp.user_id = u.id
        WHERE scp.competition_id = ${competitionId}
        ORDER BY scp.total_count DESC, scp.last_activity ASC
        LIMIT 50
      `);
      
      res.json(leaderboard.rows || []);
    } catch (error) {
      console.error('Error fetching seasonal competition leaderboard:', error);
      res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
  });

  // Get user's seasonal competition progress
  app.get('/api/seasonal-competitions/my-progress', async (req, res) => {
    try {
      const userId = req.session?.user?.id || "test001-user-id";
      
      const progress = await db.execute(sql`
        SELECT 
          sc.id,
          sc.name,
          sc.target_count,
          sc.unlimited,
          scp.total_count,
          scp.current_rank,
          scp.joined_at,
          scp.last_activity
        FROM seasonal_competition_participants scp
        JOIN seasonal_competitions sc ON scp.competition_id = sc.id
        WHERE scp.user_id = ${userId} AND sc.is_active = true
        ORDER BY scp.joined_at DESC
      `);
      
      res.json(progress.rows || []);
    } catch (error) {
      console.error('Error fetching user seasonal competition progress:', error);
      res.status(500).json({ error: 'Failed to fetch progress' });
    }
  });

  // Achievement badges routes
  app.get('/api/achievement-badges', async (req, res) => {
    try {
      const badges = await storage.getActiveAchievementBadges();
      res.json(badges);
    } catch (error) {
      console.error('Error fetching achievement badges:', error);
      res.status(500).json({ error: 'Failed to fetch achievement badges' });
    }
  });

  app.get('/api/users/me/badges', async (req, res) => {
    try {
      const userId = req.session?.user?.id || "test001-user-id";
      const badges = await storage.getUserAchievementBadges(userId);
      res.json(badges);
    } catch (error) {
      console.error('Error fetching user badges:', error);
      res.status(500).json({ error: 'Failed to fetch user badges' });
    }
  });

  // Accept competition rules
  app.post('/api/participations/:participationId/accept', async (req, res) => {
    try {
      const { participationId } = req.params;
      
      const participation = await storage.acceptRules(participationId);
      res.json(participation);
    } catch (error) {
      console.error('Error accepting rules:', error);
      res.status(500).json({ message: 'Failed to accept rules' });
    }
  });

  // Admin login route
  app.post('/api/auth/admin-login', async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
      }

      // Check admin credentials
      if (username === 'admin' && password === 'Admin123!') {
        // Clear any regular user session
        delete (req.session as any).user;
        
        // Set admin session
        (req.session as any).adminUser = { 
          id: 'founder-admin-id', 
          username: 'admin',
          role: 'founder' 
        };
        
        res.json({ message: 'Admin login successful', user: { username: 'admin', role: 'founder' } });
      } else {
        res.status(401).json({ error: 'Invalid admin credentials' });
      }
    } catch (error) {
      console.error('Admin login error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  });

  // Admin authentication check
  app.get('/api/auth/admin-check', (req, res) => {
    const adminUser = req.session?.adminUser;
    if (adminUser?.role === 'founder') {
      res.json({ authenticated: true, user: adminUser });
    } else {
      res.status(401).json({ error: 'Not authenticated as admin' });
    }
  });

  // Admin logout
  app.post('/api/auth/admin-logout', (req, res) => {
    delete (req.session as any).adminUser;
    res.json({ message: 'Admin logout successful' });
  });

  // Admin routes - Only accessible by app founder
  const isAppFounder = async (req: any, res: any, next: any) => {
    const adminUser = (req.session as any)?.adminUser;
    let regularUser = req.user;
    
    // If no user attached to request, try to get from session
    if (!regularUser && req.session?.user?.id) {
      try {
        regularUser = await storage.getUser(req.session.user.id);
      } catch (error) {
        console.error('Error getting user in isAppFounder:', error);
      }
    }
    
    // Check if user is admin through either authentication method
    const isAdmin = adminUser?.role === 'founder' || 
        (regularUser && (regularUser.username === 'admin' || regularUser.id === 'founder-admin-id' || regularUser.userType === 'admin'));
    
    if (isAdmin) {
      next();
    } else {
      res.status(403).json({ error: 'Access denied. App founder only.' });
    }
  };

  // Admin - Get all seasonal competitions
  app.get('/api/admin/seasonal-competitions', isAppFounder, async (req, res) => {
    try {
      const competitions = await db.execute(sql`
        SELECT sc.*, COUNT(scp.id) as participant_count
        FROM seasonal_competitions sc
        LEFT JOIN seasonal_competition_participants scp ON sc.id = scp.competition_id
        GROUP BY sc.id
        ORDER BY sc.created_at DESC
      `);
      
      res.json(competitions.rows || []);
    } catch (error) {
      console.error('Error fetching admin competitions:', error);
      res.status(500).json({ error: 'Failed to fetch competitions' });
    }
  });

  // Admin - Create seasonal competition
  app.post('/api/admin/seasonal-competitions', isAppFounder, async (req, res) => {
    try {
      const competitionData = req.body;
      
      const result = await db.execute(sql`
        INSERT INTO seasonal_competitions (
          name, description, start_date, end_date, target_count, 
          unlimited, is_active, max_participants, prize_description, 
          category, created_at
        ) VALUES (
          ${competitionData.name},
          ${competitionData.description},
          ${competitionData.startDate || new Date()},
          ${competitionData.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)},
          ${competitionData.targetCount || null},
          ${competitionData.unlimited || false},
          ${competitionData.isActive || true},
          ${competitionData.maxParticipants || null},
          ${competitionData.prizeDescription || null},
          ${competitionData.category || 'general'},
          NOW()
        )
        RETURNING *
      `);
      
      res.json(result.rows?.[0] || {});
    } catch (error) {
      console.error('Error creating competition:', error);
      res.status(500).json({ error: 'Failed to create competition' });
    }
  });

  // Admin - Update seasonal competition
  app.put('/api/admin/seasonal-competitions/:id', isAppFounder, async (req, res) => {
    try {
      const competitionId = parseInt(req.params.id);
      const data = req.body;
      
      const result = await db.execute(sql`
        UPDATE seasonal_competitions 
        SET name = ${data.name},
            description = ${data.description},
            start_date = ${data.startDate},
            end_date = ${data.endDate},
            target_count = ${data.targetCount},
            unlimited = ${data.unlimited},
            is_active = ${data.isActive},
            max_participants = ${data.maxParticipants},
            prize_description = ${data.prizeDescription},
            category = ${data.category}
        WHERE id = ${competitionId}
        RETURNING *
      `);
      
      res.json(result.rows?.[0] || {});
    } catch (error) {
      console.error('Error updating competition:', error);
      res.status(500).json({ error: 'Failed to update competition' });
    }
  });

  // Admin - Delete seasonal competition
  app.delete('/api/admin/seasonal-competitions/:id', isAppFounder, async (req, res) => {
    try {
      const competitionId = parseInt(req.params.id);
      
      // Delete participants first
      await db.execute(sql`
        DELETE FROM seasonal_competition_participants 
        WHERE competition_id = ${competitionId}
      `);
      
      // Delete competition
      await db.execute(sql`
        DELETE FROM seasonal_competitions 
        WHERE id = ${competitionId}
      `);
      
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting competition:', error);
      res.status(500).json({ error: 'Failed to delete competition' });
    }
  });

  // Admin - Toggle competition status
  app.put('/api/admin/seasonal-competitions/:id/toggle', isAppFounder, async (req, res) => {
    try {
      const competitionId = parseInt(req.params.id);
      const { isActive } = req.body;
      
      const result = await db.execute(sql`
        UPDATE seasonal_competitions 
        SET is_active = ${isActive}
        WHERE id = ${competitionId}
        RETURNING *
      `);
      
      res.json(result.rows?.[0] || {});
    } catch (error) {
      console.error('Error toggling competition status:', error);
      res.status(500).json({ error: 'Failed to toggle status' });
    }
  });

  // Admin - Get all users
  app.get('/api/admin/users', isAppFounder, async (req, res) => {
    try {
      const users = await db.execute(sql`
        SELECT 
          u.id, u.username, u.email, u.user_type,
          u.created_at, u.spiritual_points, u.zikir_coins, u.user_level,
          COALESCE(ua.total_zikir, 0) as total_zikir
        FROM users u
        LEFT JOIN user_analytics ua ON u.id = ua.user_id
        ORDER BY u.created_at DESC
        LIMIT 100
      `);
      
      res.json(users.rows || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  });

  // Admin - Toggle user status
  app.put('/api/admin/users/:userId/toggle', isAppFounder, async (req, res) => {
    try {
      const { userId } = req.params;
      const { isActive } = req.body;
      
      const result = await db.execute(sql`
        UPDATE users 
        SET is_active = ${isActive}
        WHERE id = ${userId}
        RETURNING *
      `);
      
      res.json(result.rows?.[0] || {});
    } catch (error) {
      console.error('Error toggling user status:', error);
      res.status(500).json({ error: 'Failed to toggle user status' });
    }
  });

  // Admin - Get system stats
  app.get('/api/admin/stats', isAppFounder, async (req, res) => {
    try {
      const [competitions, users, participants, totalZikir] = await Promise.all([
        db.execute(sql`SELECT COUNT(*) as count FROM seasonal_competitions`),
        db.execute(sql`SELECT COUNT(*) as count FROM users`),
        db.execute(sql`SELECT COUNT(*) as count FROM seasonal_competition_participants`),
        db.execute(sql`SELECT COALESCE(SUM(total_zikir), 0) as total FROM user_analytics`)
      ]);
      
      res.json({
        totalCompetitions: competitions.rows?.[0]?.count || 0,
        activeUsers: users.rows?.[0]?.count || 0,
        totalParticipants: participants.rows?.[0]?.count || 0,
        totalZikir: totalZikir.rows?.[0]?.total || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      res.status(500).json({ error: 'Failed to fetch stats' });
    }
  });

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

  // Seed tasbih data on startup (temporarily disabled)
  // try {
  //   const { seedTasbihSkins } = await import("./seedTasbihData");
  //   await seedTasbihSkins();
  // } catch (error) {
  //   console.log("Tasbih seeding error (may already be seeded):", (error as Error).message);
  // }

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
  
  // Seed seasonal competitions and badges (only after tables exist)
  try {
    const { seedSeasonalData } = await import("./seedSeasonalData");
    await seedSeasonalData();
  } catch (error) {
    console.log("Note: Seasonal data seeding skipped - tables may not exist yet. Run 'npm run db:push' first.");
  }

  // ===== GAMIFICATION BO ENDPOINTS =====

  // Get all level configurations
  app.get('/api/admin/levels', isAppFounder, async (req, res) => {
    try {
      const levels = await db.execute(sql`
        SELECT * FROM level_configuration ORDER BY level ASC
      `);
      res.json(levels.rows || []);
    } catch (error) {
      console.error('Error fetching levels:', error);
      res.status(500).json({ error: 'Failed to fetch levels' });
    }
  });

  // Update level configuration
  app.put('/api/admin/levels/:level', isAppFounder, async (req, res) => {
    try {
      const level = parseInt(req.params.level);
      const { titleEn, titleAr, pointsRequired, roomCreationLimit, coinMultiplier, unlockMessage } = req.body;
      
      const result = await db.execute(sql`
        UPDATE level_configuration 
        SET 
          title_en = ${titleEn},
          title_ar = ${titleAr},
          points_required = ${pointsRequired},
          room_creation_limit = ${roomCreationLimit},
          coin_multiplier = ${coinMultiplier},
          unlock_message = ${unlockMessage},
          updated_at = CURRENT_TIMESTAMP
        WHERE level = ${level}
        RETURNING *
      `);
      
      res.json(result.rows?.[0] || {});
    } catch (error) {
      console.error('Error updating level:', error);
      res.status(500).json({ error: 'Failed to update level' });
    }
  });

  // Get currency configurations
  app.get('/api/admin/currency', isAppFounder, async (req, res) => {
    try {
      const configs = await db.execute(sql`
        SELECT * FROM currency_configuration ORDER BY activity_type ASC
      `);
      res.json(configs.rows || []);
    } catch (error) {
      console.error('Error fetching currency configs:', error);
      res.status(500).json({ error: 'Failed to fetch currency configurations' });
    }
  });

  // Update currency configuration
  app.put('/api/admin/currency/:id', isAppFounder, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { basePoints, multiplier, seasonalBonus, isActive } = req.body;
      
      const result = await db.execute(sql`
        UPDATE currency_configuration 
        SET 
          base_points = ${basePoints},
          multiplier = ${multiplier},
          seasonal_bonus = ${seasonalBonus},
          is_active = ${isActive},
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id}
        RETURNING *
      `);
      
      res.json(result.rows?.[0] || {});
    } catch (error) {
      console.error('Error updating currency config:', error);
      res.status(500).json({ error: 'Failed to update currency configuration' });
    }
  });

  // Get badge configurations
  app.get('/api/admin/badges', isAppFounder, async (req, res) => {
    try {
      const badges = await db.execute(sql`
        SELECT * FROM badge_configuration ORDER BY category ASC, name_en ASC
      `);
      res.json(badges.rows || []);
    } catch (error) {
      console.error('Error fetching badges:', error);
      res.status(500).json({ error: 'Failed to fetch badges' });
    }
  });

  // Create new badge
  app.post('/api/admin/badges', isAppFounder, async (req, res) => {
    try {
      const { badgeId, nameEn, nameAr, description, category, criteriaType, targetValue, pointsReward, coinsReward } = req.body;
      
      const result = await db.execute(sql`
        INSERT INTO badge_configuration 
        (badge_id, name_en, name_ar, description, category, criteria_type, target_value, points_reward, coins_reward)
        VALUES (${badgeId}, ${nameEn}, ${nameAr}, ${description}, ${category}, ${criteriaType}, ${targetValue}, ${pointsReward}, ${coinsReward})
        RETURNING *
      `);
      
      res.json(result.rows?.[0] || {});
    } catch (error) {
      console.error('Error creating badge:', error);
      res.status(500).json({ error: 'Failed to create badge' });
    }
  });

  // Update badge configuration
  app.put('/api/admin/badges/:id', isAppFounder, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { nameEn, nameAr, description, targetValue, pointsReward, coinsReward, isActive } = req.body;
      
      const result = await db.execute(sql`
        UPDATE badge_configuration 
        SET 
          name_en = ${nameEn},
          name_ar = ${nameAr},
          description = ${description},
          target_value = ${targetValue},
          points_reward = ${pointsReward},
          coins_reward = ${coinsReward},
          is_active = ${isActive},
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id}
        RETURNING *
      `);
      
      res.json(result.rows?.[0] || {});
    } catch (error) {
      console.error('Error updating badge:', error);
      res.status(500).json({ error: 'Failed to update badge' });
    }
  });

  // Get quest configurations
  app.get('/api/admin/quests', isAppFounder, async (req, res) => {
    try {
      const quests = await db.execute(sql`
        SELECT * FROM quest_configuration ORDER BY quest_type ASC, name_en ASC
      `);
      res.json(quests.rows || []);
    } catch (error) {
      console.error('Error fetching quests:', error);
      res.status(500).json({ error: 'Failed to fetch quests' });
    }
  });

  // Create new quest
  app.post('/api/admin/quests', isAppFounder, async (req, res) => {
    try {
      const { questId, nameEn, nameAr, description, questType, targetValue, timeLimit, pointsReward, minLevel, maxLevel } = req.body;
      
      const result = await db.execute(sql`
        INSERT INTO quest_configuration 
        (quest_id, name_en, name_ar, description, quest_type, target_value, time_limit, points_reward, min_level, max_level)
        VALUES (${questId}, ${nameEn}, ${nameAr}, ${description}, ${questType}, ${targetValue}, ${timeLimit}, ${pointsReward}, ${minLevel}, ${maxLevel})
        RETURNING *
      `);
      
      res.json(result.rows?.[0] || {});
    } catch (error) {
      console.error('Error creating quest:', error);
      res.status(500).json({ error: 'Failed to create quest' });
    }
  });

  // Update quest configuration
  app.put('/api/admin/quests/:id', isAppFounder, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { nameEn, nameAr, description, targetValue, pointsReward, minLevel, maxLevel, isActive } = req.body;
      
      const result = await db.execute(sql`
        UPDATE quest_configuration 
        SET 
          name_en = ${nameEn},
          name_ar = ${nameAr},
          description = ${description},
          target_value = ${targetValue},
          points_reward = ${pointsReward},
          min_level = ${minLevel},
          max_level = ${maxLevel},
          is_active = ${isActive},
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id}
        RETURNING *
      `);
      
      res.json(result.rows?.[0] || {});
    } catch (error) {
      console.error('Error updating quest:', error);
      res.status(500).json({ error: 'Failed to update quest' });
    }
  });

  // Get Islamic practice configurations
  app.get('/api/admin/practices', isAppFounder, async (req, res) => {
    try {
      const practices = await db.execute(sql`
        SELECT * FROM islamic_practice_configuration ORDER BY name_en ASC
      `);
      res.json(practices.rows || []);
    } catch (error) {
      console.error('Error fetching practices:', error);
      res.status(500).json({ error: 'Failed to fetch practices' });
    }
  });

  // Create Islamic practice
  app.post('/api/admin/practices', isAppFounder, async (req, res) => {
    try {
      const { practiceId, nameEn, nameAr, description, recommendedTime, pointsReward, streakBonus, verificationType } = req.body;
      
      const result = await db.execute(sql`
        INSERT INTO islamic_practice_configuration 
        (practice_id, name_en, name_ar, description, recommended_time, points_reward, streak_bonus, verification_type)
        VALUES (${practiceId}, ${nameEn}, ${nameAr}, ${description}, ${recommendedTime}, ${pointsReward}, ${streakBonus}, ${verificationType})
        RETURNING *
      `);
      
      res.json(result.rows?.[0] || {});
    } catch (error) {
      console.error('Error creating practice:', error);
      res.status(500).json({ error: 'Failed to create practice' });
    }
  });

  // Update Islamic practice
  app.put('/api/admin/practices/:id', isAppFounder, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { pointsReward, streakBonus, isActive } = req.body;
      
      const result = await db.execute(sql`
        UPDATE islamic_practice_configuration 
        SET 
          points_reward = ${pointsReward},
          streak_bonus = ${streakBonus},
          is_active = ${isActive},
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id}
        RETURNING *
      `);
      
      res.json(result.rows?.[0] || {});
    } catch (error) {
      console.error('Error updating practice:', error);
      res.status(500).json({ error: 'Failed to update practice' });
    }
  });

  // Gamification analytics
  app.get('/api/admin/gamification-stats', isAppFounder, async (req, res) => {
    try {
      const [levelDistribution, badgeStats, practiceStats] = await Promise.all([
        db.execute(sql`
          SELECT user_level, COUNT(*) as user_count 
          FROM users 
          WHERE user_level IS NOT NULL 
          GROUP BY user_level 
          ORDER BY user_level
        `),
        db.execute(sql`
          SELECT COUNT(*) as total_badges_earned 
          FROM user_badges
        `),
        db.execute(sql`
          SELECT practice_id, COUNT(*) as completion_count
          FROM user_islamic_practices 
          GROUP BY practice_id 
          ORDER BY completion_count DESC
        `)
      ]);

      res.json({
        levelDistribution: levelDistribution.rows || [],
        totalBadgesEarned: badgeStats.rows?.[0]?.total_badges_earned || 0,
        practiceStats: practiceStats.rows || []
      });
    } catch (error) {
      console.error('Error fetching gamification stats:', error);
      res.status(500).json({ error: 'Failed to fetch gamification statistics' });
    }
  });

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
