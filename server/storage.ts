import {
  users,
  zikirs,
  rooms,
  roomMembers,
  countEntries,
  liveCounters,
  userAnalytics,
  reports,
  userRoomConfigs,
  type UpsertUser,
  type User,
  type Zikir,
  type Room,
  type RoomMember,
  type CountEntry,
  type LiveCounter,
  type UserAnalytics,
  type Report,
  type InsertRoom,
  type InsertRoomMember,
  type InsertCountEntry,
  type InsertLiveCounter,
  type InsertReport,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql, asc, gte, lte, gt, not } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByPhone(phone: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  createUser(userData: Partial<User>): Promise<User>;
  authenticateUser(username: string, password: string): Promise<User | null>;
  updateUserProfile(id: string, updates: Partial<User>): Promise<User>;
  
  // Zikir operations
  getAllZikirs(): Promise<Zikir[]>;
  getZikirById(id: number): Promise<Zikir | undefined>;
  
  // Room operations
  createRoom(room: InsertRoom): Promise<Room>;
  getRoomById(id: number): Promise<Room | undefined>;
  getRoomWithDetails(id: number): Promise<any>;
  getPublicRooms(country?: string): Promise<any[]>;
  getUserRooms(userId: string): Promise<any[]>;
  getOrganizationRooms(userId: string): Promise<any[]>;
  updateRoom(id: number, updates: Partial<Room>): Promise<Room>;
  deleteRoom(id: number): Promise<void>;
  
  // Room member operations
  joinRoom(membership: InsertRoomMember): Promise<RoomMember>;
  leaveRoom(roomId: number, userId: string): Promise<void>;
  getRoomMembers(roomId: number): Promise<any[]>;
  isUserInRoom(roomId: number, userId: string): Promise<boolean>;
  removeRoomMember(roomId: number, userId: string, removedBy: string): Promise<void>;
  
  // Counting operations
  incrementCount(roomId: number, userId: string): Promise<LiveCounter>;
  resetUserCount(roomId: number, userId: string): Promise<void>;
  getUserCountInRoom(roomId: number, userId: string): Promise<LiveCounter | undefined>;
  getRoomLeaderboard(roomId: number): Promise<any[]>;
  
  // Analytics operations
  getUserAnalytics(userId: string): Promise<UserAnalytics | undefined>;
  updateUserAnalytics(userId: string, updates: Partial<UserAnalytics>): Promise<UserAnalytics>;
  getGlobalStats(): Promise<any>;
  getGlobalLeaderboard(limit: number): Promise<any[]>;
  
  // Report operations
  createReport(report: Omit<Report, 'id' | 'createdAt'>): Promise<Report>;
  getReports(): Promise<Report[]>;
  updateReportStatus(id: string, status: string): Promise<void>;
  
  // Additional room operations
  getRoom(id: number): Promise<Room | undefined>;
  getRoomMemberCount(roomId: number): Promise<number>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getUserByPhone(phone: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.phone, phone));
    return user;
  }

  async createUser(userData: Partial<User>): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }

  async authenticateUser(username: string, password: string): Promise<User | null> {
    const user = await this.getUserByUsername(username);
    if (!user || !user.password) {
      return null;
    }
    
    // In a real app, you'd use bcrypt.compare() here
    // For this demo, we'll do simple comparison
    if (user.password === password) {
      return user;
    }
    
    return null;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserProfile(id: string, updates: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Zikir operations
  async getAllZikirs(): Promise<Zikir[]> {
    return await db.select().from(zikirs).orderBy(asc(zikirs.name));
  }

  async createZikir(zikirData: any): Promise<Zikir> {
    const [zikir] = await db.insert(zikirs).values(zikirData).returning();
    return zikir;
  }

  async getZikirById(id: number): Promise<Zikir | undefined> {
    const [zikir] = await db.select().from(zikirs).where(eq(zikirs.id, id));
    return zikir;
  }

  // Room operations
  async createRoom(roomData: InsertRoom): Promise<Room> {
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + roomData.duration);
    
    const [room] = await db
      .insert(rooms)
      .values({
        ...roomData,
        endDate,
      })
      .returning();
    
    // Add owner as member
    await this.joinRoom({
      roomId: room.id,
      userId: room.ownerId,
      role: "owner",
    });

    return room;
  }

  async getRoomById(id: number): Promise<Room | undefined> {
    const [room] = await db.select().from(rooms).where(eq(rooms.id, id));
    return room;
  }

  async getRoomWithDetails(id: number): Promise<any> {
    const roomDetails = await db
      .select({
        id: rooms.id,
        name: rooms.name,
        description: rooms.description,
        targetCount: rooms.targetCount,
        unlimited: rooms.unlimited,
        duration: rooms.duration,
        isPublic: rooms.isPublic,
        pictureUrl: rooms.pictureUrl,
        startDate: rooms.startDate,
        endDate: rooms.endDate,
        ownerId: rooms.ownerId,
        zikirName: zikirs.name,
        zikirArabic: zikirs.arabicText,
        fazilat: zikirs.fazilat,
        references: zikirs.references,
        ownerName: users.firstName,
      })
      .from(rooms)
      .leftJoin(zikirs, eq(rooms.zikirId, zikirs.id))
      .leftJoin(users, eq(rooms.ownerId, users.id))
      .where(eq(rooms.id, id));

    return roomDetails[0];
  }

  async getPublicRooms(country?: string): Promise<any[]> {
    let query = db
      .select({
        id: rooms.id,
        name: rooms.name,
        description: rooms.description,
        targetCount: rooms.targetCount,
        duration: rooms.duration,
        pictureUrl: rooms.pictureUrl,
        startDate: rooms.startDate,
        endDate: rooms.endDate,
        zikirName: zikirs.name,
        memberCount: sql<number>`(SELECT COUNT(*) FROM ${roomMembers} WHERE ${roomMembers.roomId} = ${rooms.id} AND ${roomMembers.isActive} = true)`,
      })
      .from(rooms)
      .leftJoin(zikirs, eq(rooms.zikirId, zikirs.id))
      .where(and(eq(rooms.isPublic, true), eq(rooms.isActive, true)));

    if (country) {
      query = db
        .select({
          id: rooms.id,
          name: rooms.name,
          description: rooms.description,
          targetCount: rooms.targetCount,
          duration: rooms.duration,
          pictureUrl: rooms.pictureUrl,
          startDate: rooms.startDate,
          endDate: rooms.endDate,
          zikirName: zikirs.name,
          memberCount: sql<number>`(SELECT COUNT(*) FROM ${roomMembers} WHERE ${roomMembers.roomId} = ${rooms.id} AND ${roomMembers.isActive} = true)`,
        })
        .from(rooms)
        .leftJoin(zikirs, eq(rooms.zikirId, zikirs.id))
        .where(and(eq(rooms.isPublic, true), eq(rooms.isActive, true), eq(rooms.country, country)));
    }

    return await query.orderBy(desc(rooms.createdAt));
  }

  async getUserRooms(userId: string): Promise<any[]> {
    // Check if user is organization type
    const [user] = await db.select({ userType: users.userType }).from(users).where(eq(users.id, userId));
    
    if (user?.userType === 'organization') {
      // For organizations, return competitions they created (owned by them)
      return await db
        .select({
          id: rooms.id,
          name: rooms.name,
          description: rooms.description,
          targetCount: rooms.targetCount,
          duration: rooms.duration,
          pictureUrl: rooms.pictureUrl,
          startDate: rooms.startDate,
          endDate: rooms.endDate,
          zikirName: zikirs.name,
          role: sql<string>`'owner'`, // Organizations are owners of their competitions
          totalCount: sql<number>`0`, // Organizations don't participate in counting
          todayCount: sql<number>`0`,
          memberCount: sql<number>`(
            SELECT COUNT(*) 
            FROM ${roomMembers} rm 
            WHERE rm.room_id = ${rooms.id} 
            AND rm.is_active = true
          )`,
        })
        .from(rooms)
        .leftJoin(zikirs, eq(rooms.zikirId, zikirs.id))
        .where(eq(rooms.ownerId, userId))
        .orderBy(desc(rooms.createdAt));
    }
    
    // For regular users, return rooms they joined
    return await db
      .select({
        id: rooms.id,
        name: rooms.name,
        description: rooms.description,
        targetCount: rooms.targetCount,
        duration: rooms.duration,
        pictureUrl: rooms.pictureUrl,
        startDate: rooms.startDate,
        endDate: rooms.endDate,
        zikirName: zikirs.name,
        role: roomMembers.role,
        totalCount: sql<number>`COALESCE(${liveCounters.totalCount}, 0)`,
        todayCount: sql<number>`COALESCE(${liveCounters.todayCount}, 0)`,
        memberCount: sql<number>`(
          SELECT COUNT(*) 
          FROM ${roomMembers} rm 
          WHERE rm.room_id = ${rooms.id} 
          AND rm.is_active = true
        )`,
      })
      .from(roomMembers)
      .leftJoin(rooms, eq(roomMembers.roomId, rooms.id))
      .leftJoin(zikirs, eq(rooms.zikirId, zikirs.id))
      .leftJoin(liveCounters, and(
        eq(liveCounters.roomId, rooms.id),
        eq(liveCounters.userId, userId)
      ))
      .where(and(
        eq(roomMembers.userId, userId),
        eq(roomMembers.isActive, true)
      ))
      .orderBy(desc(rooms.createdAt));
  }

  async getOrganizationRooms(userId: string): Promise<any[]> {
    // Only show other organization competitions (not the user's own)
    return await db
      .select({
        id: rooms.id,
        name: rooms.name,
        description: rooms.description,
        targetCount: rooms.targetCount,
        duration: rooms.duration,
        pictureUrl: rooms.pictureUrl,
        startDate: rooms.startDate,
        endDate: rooms.endDate,
        zikirName: zikirs.name,
        ownerId: rooms.ownerId,
        isPublic: rooms.isPublic,
        organizationName: users.organizationName,
        memberCount: sql<number>`(
          SELECT COUNT(*) 
          FROM ${roomMembers} rm 
          WHERE rm.room_id = ${rooms.id} 
          AND rm.is_active = true
        )`,
      })
      .from(rooms)
      .leftJoin(users, eq(rooms.ownerId, users.id))
      .leftJoin(zikirs, eq(rooms.zikirId, zikirs.id))
      .where(and(
        eq(users.userType, 'organization'),
        eq(rooms.isPublic, true),
        not(eq(rooms.ownerId, userId)) // Exclude user's own competitions
      ))
      .orderBy(desc(rooms.createdAt));
  }

  async updateRoom(id: number, updates: Partial<Room>): Promise<Room> {
    const [room] = await db
      .update(rooms)
      .set(updates)
      .where(eq(rooms.id, id))
      .returning();
    return room;
  }



  // Room member operations
  async joinRoom(membership: InsertRoomMember): Promise<RoomMember> {
    const [member] = await db
      .insert(roomMembers)
      .values(membership)
      .onConflictDoUpdate({
        target: [roomMembers.roomId, roomMembers.userId],
        set: { isActive: true, joinedAt: new Date() },
      })
      .returning();

    // Initialize live counter for the user
    await db
      .insert(liveCounters)
      .values({
        roomId: membership.roomId,
        userId: membership.userId,
        currentCount: 0,
        todayCount: 0,
        totalCount: 0,
      })
      .onConflictDoNothing();

    return member;
  }

  async leaveRoom(roomId: number, userId: string): Promise<void> {
    await db
      .update(roomMembers)
      .set({ isActive: false })
      .where(and(eq(roomMembers.roomId, roomId), eq(roomMembers.userId, userId)));
  }

  async getRoomMembers(roomId: number): Promise<any[]> {
    return await db
      .select({
        userId: roomMembers.userId,
        nickname: roomMembers.nickname,
        role: roomMembers.role,
        joinedAt: roomMembers.joinedAt,
        firstName: users.firstName,
        lastName: users.lastName,
        avatarType: users.avatarType,
        currentCount: liveCounters.currentCount,
        todayCount: liveCounters.todayCount,
        totalCount: liveCounters.totalCount,
      })
      .from(roomMembers)
      .leftJoin(users, eq(roomMembers.userId, users.id))
      .leftJoin(liveCounters, and(
        eq(liveCounters.roomId, roomId),
        eq(liveCounters.userId, roomMembers.userId)
      ))
      .where(and(eq(roomMembers.roomId, roomId), eq(roomMembers.isActive, true)))
      .orderBy(desc(liveCounters.todayCount));
  }

  async isUserInRoom(roomId: number, userId: string): Promise<boolean> {
    const [member] = await db
      .select()
      .from(roomMembers)
      .where(and(
        eq(roomMembers.roomId, roomId),
        eq(roomMembers.userId, userId),
        eq(roomMembers.isActive, true)
      ));
    return !!member;
  }

  async removeRoomMember(roomId: number, userId: string, removedBy: string): Promise<void> {
    // Check if removedBy is the owner
    const [room] = await db.select().from(rooms).where(eq(rooms.id, roomId));
    if (room?.ownerId !== removedBy) {
      throw new Error("Only room owner can remove members");
    }

    await this.leaveRoom(roomId, userId);
  }

  // Counting operations
  async incrementCount(roomId: number, userId: string): Promise<LiveCounter> {
    const today = new Date().toDateString();
    
    const [counter] = await db
      .update(liveCounters)
      .set({
        currentCount: sql`${liveCounters.currentCount} + 1`,
        todayCount: sql`CASE 
          WHEN DATE(${liveCounters.lastCountAt}) = DATE(NOW()) 
          THEN ${liveCounters.todayCount} + 1 
          ELSE 1 
        END`,
        totalCount: sql`${liveCounters.totalCount} + 1`,
        lastCountAt: new Date(),
        updatedAt: new Date(),
      })
      .where(and(
        eq(liveCounters.roomId, roomId),
        eq(liveCounters.userId, userId)
      ))
      .returning();

    return counter;
  }

  async resetUserCount(roomId: number, userId: string): Promise<void> {
    await db
      .update(liveCounters)
      .set({
        currentCount: 0,
        updatedAt: new Date(),
      })
      .where(and(
        eq(liveCounters.roomId, roomId),
        eq(liveCounters.userId, userId)
      ));
  }

  async getUserCountInRoom(roomId: number, userId: string): Promise<LiveCounter | undefined> {
    const [counter] = await db
      .select()
      .from(liveCounters)
      .where(and(
        eq(liveCounters.roomId, roomId),
        eq(liveCounters.userId, userId)
      ));
    return counter;
  }

  async getRoomLeaderboard(roomId: number): Promise<any[]> {
    return await db
      .select({
        userId: liveCounters.userId,
        firstName: users.firstName,
        lastName: users.lastName,
        avatarType: users.avatarType,
        nickname: roomMembers.nickname,
        currentCount: liveCounters.currentCount,
        todayCount: liveCounters.todayCount,
        totalCount: liveCounters.totalCount,
        lastCountAt: liveCounters.lastCountAt,
        rank: sql<number>`ROW_NUMBER() OVER (ORDER BY ${liveCounters.todayCount} DESC)`,
      })
      .from(liveCounters)
      .leftJoin(users, eq(liveCounters.userId, users.id))
      .leftJoin(roomMembers, and(
        eq(roomMembers.roomId, roomId),
        eq(roomMembers.userId, liveCounters.userId)
      ))
      .where(eq(liveCounters.roomId, roomId))
      .orderBy(desc(liveCounters.todayCount));
  }

  // Analytics operations
  async getUserAnalytics(userId: string): Promise<UserAnalytics | undefined> {
    const [analytics] = await db
      .select()
      .from(userAnalytics)
      .where(eq(userAnalytics.userId, userId));
    return analytics;
  }

  async updateUserAnalytics(userId: string, updates: Partial<UserAnalytics>): Promise<UserAnalytics> {
    const [analytics] = await db
      .insert(userAnalytics)
      .values({ userId, ...updates })
      .onConflictDoUpdate({
        target: userAnalytics.userId,
        set: { ...updates, updatedAt: new Date() },
      })
      .returning();
    return analytics;
  }

  async getUserTotalCount(userId: string): Promise<number> {
    const [result] = await db
      .select({ 
        totalCount: sql<number>`coalesce(sum(${liveCounters.totalCount}), 0)` 
      })
      .from(liveCounters)
      .where(eq(liveCounters.userId, userId));
    return result?.totalCount || 0;
  }

  async calculateUserStreak(userId: string): Promise<{ currentStreak: number, longestStreak: number }> {
    // Get all distinct dates when user made counts
    const countDates = await db
      .select({
        date: sql<string>`date(${liveCounters.lastCountAt})`
      })
      .from(liveCounters)
      .where(and(
        eq(liveCounters.userId, userId),
        gt(liveCounters.totalCount, 0)
      ))
      .groupBy(sql`date(${liveCounters.lastCountAt})`)
      .orderBy(sql`date(${liveCounters.lastCountAt}) DESC`);

    if (countDates.length === 0) {
      return { currentStreak: 0, longestStreak: 0 };
    }

    // Calculate current streak (consecutive days from today)
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < countDates.length; i++) {
      const countDate = new Date(countDates[i].date);
      countDate.setHours(0, 0, 0, 0);
      
      if (i === 0) {
        // Check if today or yesterday
        const daysDiff = Math.floor((today.getTime() - countDate.getTime()) / (1000 * 60 * 60 * 24));
        if (daysDiff <= 1) {
          currentStreak = 1;
          tempStreak = 1;
        }
      } else {
        const prevDate = new Date(countDates[i-1].date);
        prevDate.setHours(0, 0, 0, 0);
        const daysDiff = Math.floor((prevDate.getTime() - countDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysDiff === 1) {
          if (i < currentStreak || currentStreak === 0) {
            currentStreak++;
          }
          tempStreak++;
        } else {
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 1;
        }
      }
    }
    
    longestStreak = Math.max(longestStreak, tempStreak, currentStreak);
    
    return { currentStreak, longestStreak };
  }

  async getGlobalStats(): Promise<any> {
    // Get total users count
    const [usersCount] = await db.select({ count: sql<number>`count(*)` }).from(users);
    
    // Get total zikir count across all rooms
    const [totalZikir] = await db.select({ 
      count: sql<number>`coalesce(sum(${liveCounters.totalCount}), 0)` 
    }).from(liveCounters);
    
    // Get active rooms (rooms created in last 30 days or with recent activity)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const [activeRooms] = await db.select({ 
      count: sql<number>`count(distinct ${rooms.id})` 
    }).from(rooms)
    .leftJoin(liveCounters, eq(rooms.id, liveCounters.roomId))
    .where(
      sql`${rooms.createdAt} >= ${thirtyDaysAgo} OR ${liveCounters.lastCountAt} >= ${thirtyDaysAgo}`
    );
    
    // Get today's count
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [todayCount] = await db.select({ 
      count: sql<number>`coalesce(sum(${liveCounters.todayCount}), 0)` 
    }).from(liveCounters)
    .where(gte(liveCounters.lastCountAt, today));

    return {
      totalUsers: usersCount.count || 0,
      totalZikir: totalZikir.count || 0,
      activeRooms: activeRooms.count || 0,
      todayCount: todayCount.count || 0
    };
  }



  // Report operations
  async createReport(reportData: Omit<Report, 'id' | 'createdAt'>): Promise<Report> {
    console.log('Creating report with data:', reportData);
    
    // Direct SQL insert to bypass Drizzle field mapping issues
    const result = await db.execute(sql`
      INSERT INTO reports (kind, target_id, by_user_id, reason, details, status, admin_notes, resolved_at, type, reported_by_id)
      VALUES (${reportData.kind}, ${reportData.targetId}, ${reportData.byUserId}, ${reportData.reason}, 
              ${reportData.details || null}, ${reportData.status}, ${reportData.adminNotes || null}, 
              ${reportData.resolvedAt || null}, ${reportData.kind}, ${reportData.byUserId})
      RETURNING *
    `);
    
    return result.rows[0] as any;
  }

  async getReports(): Promise<Report[]> {
    return await db.select().from(reports).orderBy(desc(reports.createdAt));
  }

  async updateReportStatus(id: string, status: string): Promise<void> {
    await db
      .update(reports)
      .set({ status, resolvedAt: new Date() })
      .where(eq(reports.id, id));
  }

  // Additional room operations
  async getRoom(id: number): Promise<Room | undefined> {
    return this.getRoomById(id);
  }

  async getRoomMemberCount(roomId: number): Promise<number> {
    const [result] = await db
      .select({ count: sql<number>`count(*)` })
      .from(roomMembers)
      .where(and(eq(roomMembers.roomId, roomId), eq(roomMembers.isActive, true)));
    return result?.count || 0;
  }

  async deleteRoom(id: number): Promise<void> {
    // Delete all related data first (foreign key constraints)
    await db.delete(liveCounters).where(eq(liveCounters.roomId, id));
    await db.delete(countEntries).where(eq(countEntries.roomId, id));
    await db.delete(roomMembers).where(eq(roomMembers.roomId, id));
    await db.delete(rooms).where(eq(rooms.id, id));
  }



  // Organization-specific methods
  async searchOrganizationRooms(query: string): Promise<any[]> {
    // For now, return all public rooms until we can add the organization fields
    return await this.getPublicRooms();
  }

  async searchRooms(query: string): Promise<any[]> {
    // Basic room search by name
    const searchResults = await db
      .select()
      .from(rooms)
      .leftJoin(users, eq(rooms.ownerId, users.id))
      .where(
        and(
          eq(rooms.isActive, true),
          eq(rooms.isPublic, true),
          sql`${rooms.name} ILIKE ${`%${query}%`}`
        )
      );

    return searchResults.map(result => ({
      ...result.rooms,
      owner: result.users,
    }));
  }

  async getGlobalLeaderboard(limit: number = 50): Promise<Array<{
    userId: string;
    firstName?: string;
    lastName?: string;
    totalCount: number;
    rank: number;
    profileImageUrl?: string;
    streakCount: number;
    roomsCount: number;
  }>> {
    // Get user totals from count entries
    const userTotals = await db
      .select({
        userId: countEntries.userId,
        totalCount: sql<number>`SUM(${countEntries.count})`.as('totalCount'),
      })
      .from(countEntries)
      .groupBy(countEntries.userId)
      .orderBy(sql`SUM(${countEntries.count}) DESC`)
      .limit(limit);

    // Get user details and calculate additional stats
    const leaderboard = [];
    for (let i = 0; i < userTotals.length; i++) {
      const userTotal = userTotals[i];
      
      // Get user details
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, userTotal.userId));

      // Calculate streak
      const { currentStreak } = await this.calculateUserStreak(userTotal.userId);

      // Get user room count
      const userRooms = await this.getUserRooms(userTotal.userId);

      leaderboard.push({
        userId: userTotal.userId,
        firstName: user?.firstName || undefined,
        lastName: user?.lastName || undefined,
        profileImageUrl: user?.profileImageUrl || undefined,
        totalCount: userTotal.totalCount,
        streakCount: currentStreak,
        roomsCount: userRooms.length,
        rank: i + 1,
      });
    }

    return leaderboard;
  }
}

export const storage = new DatabaseStorage();
