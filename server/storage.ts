import {
  users,
  zikirs,
  rooms,
  roomMembers,
  countEntries,
  liveCounters,
  userAnalytics,
  reports,
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
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql, asc, gte, lte } from "drizzle-orm";

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
  updateReportStatus(id: number, status: string): Promise<void>;
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
        userCount: liveCounters.totalCount,
        todayCount: liveCounters.todayCount,
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

  async updateRoom(id: number, updates: Partial<Room>): Promise<Room> {
    const [room] = await db
      .update(rooms)
      .set(updates)
      .where(eq(rooms.id, id))
      .returning();
    return room;
  }

  async deleteRoom(id: number): Promise<void> {
    await db.update(rooms).set({ isActive: false }).where(eq(rooms.id, id));
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

  async getGlobalLeaderboard(limit: number): Promise<any[]> {
    return await db
      .select({
        userId: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        profileImageUrl: users.profileImageUrl,
        country: users.country,
        totalCount: sql<number>`coalesce(sum(${liveCounters.totalCount}), 0)`,
        rank: sql<number>`ROW_NUMBER() OVER (ORDER BY sum(${liveCounters.totalCount}) DESC)`
      })
      .from(users)
      .leftJoin(liveCounters, eq(users.id, liveCounters.userId))
      .groupBy(users.id)
      .orderBy(sql`sum(${liveCounters.totalCount}) DESC`)
      .limit(limit);
  }

  // Report operations
  async createReport(reportData: Omit<Report, 'id' | 'createdAt'>): Promise<Report> {
    const [report] = await db.insert(reports).values(reportData).returning();
    return report;
  }

  async getReports(): Promise<Report[]> {
    return await db.select().from(reports).orderBy(desc(reports.createdAt));
  }

  async updateReportStatus(id: number, status: string): Promise<void> {
    await db
      .update(reports)
      .set({ status, resolvedAt: new Date() })
      .where(eq(reports.id, id));
  }
}

export const storage = new DatabaseStorage();
