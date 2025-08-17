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
  orgLevelSchemas,
  userOrgProfiles,
  participations,
  competitionStats,
  competitionResults,
  userPromotionCounters,
  seasonalCompetitions,
  achievementBadges,
  userAchievementBadges,
  seasonalCompetitionParticipants,
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
  type OrgLevelSchema,
  type UserOrgProfile,
  type Participation,
  type CompetitionStat,
  type CompetitionResult,
  type UserPromotionCounter,
  type SeasonalCompetition,
  type InsertSeasonalCompetition,
  type AchievementBadge,
  type InsertAchievementBadge,
  type UserAchievementBadge,
  type InsertUserAchievementBadge,
  type SeasonalCompetitionParticipant,
  type InsertSeasonalCompetitionParticipant,
  type LevelDefinition,
  type PromotionRule,
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
  updateUserFloatingTasbihSetting(userId: string, enabled: boolean): Promise<User>;
  
  // Spiritual progress operations
  getUserSpiritualProgress(userId: string): Promise<any>;
  completeUserTask(userId: string, levelId: number, taskType: string, rewards: any): Promise<void>;
  
  // Admin level management
  getAllDhikriLevels(): Promise<any[]>;
  createDhikriLevel(levelData: any): Promise<any>;
  updateDhikriLevel(id: number, levelData: any): Promise<any>;
  deleteDhikriLevel(id: number): Promise<void>;
  reorderDhikriLevels(updates: { id: number; sortOrder: number; level: number }[]): Promise<void>;
  
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
  
  // Organization Levels operations
  getOrganizations(): Promise<User[]>;
  getOrgLevelSchema(orgId: string): Promise<OrgLevelSchema | undefined>;
  createOrgLevelSchema(orgId: string, levels: LevelDefinition[], rules: PromotionRule[]): Promise<OrgLevelSchema>;
  updateOrgLevelSchema(orgId: string, levels: LevelDefinition[], rules: PromotionRule[]): Promise<OrgLevelSchema>;
  getUserOrgProfile(userId: string, orgId: string): Promise<UserOrgProfile | undefined>;
  createUserOrgProfile(userId: string, orgId: string, level?: number): Promise<UserOrgProfile>;
  updateUserOrgProfile(id: string, updates: Partial<UserOrgProfile>): Promise<UserOrgProfile>;
  joinCompetition(compId: number, userId: string, level: number): Promise<Participation>;
  acceptRules(participationId: string): Promise<Participation>;
  getCompetitionStats(compId: number): Promise<CompetitionStat | undefined>;
  updateCompetitionStats(compId: number, updates: Partial<CompetitionStat>): Promise<CompetitionStat>;
  checkEligibility(userId: string, orgId: string, levelRequired: number): Promise<{ eligible: boolean; userLevel: number; reason?: string }>;
  getPromotionProgress(userId: string, orgId: string): Promise<any>;
  processPromotions(compId: number): Promise<void>;

  // Seasonal competitions operations
  createSeasonalCompetition(competition: InsertSeasonalCompetition): Promise<SeasonalCompetition>;
  getAllSeasonalCompetitions(): Promise<SeasonalCompetition[]>;
  getActiveSeasonalCompetitions(): Promise<SeasonalCompetition[]>;
  getSeasonalCompetitionBySeason(season: string, year: number): Promise<SeasonalCompetition | undefined>;
  updateSeasonalCompetition(id: number, updates: Partial<SeasonalCompetition>): Promise<SeasonalCompetition>;
  deleteSeasonalCompetition(id: number): Promise<void>;
  joinSeasonalCompetition(competitionId: number, userId: string): Promise<SeasonalCompetitionParticipant>;
  leaveSeasonalCompetition(competitionId: number, userId: string): Promise<void>;
  getSeasonalCompetitionParticipants(competitionId: number): Promise<SeasonalCompetitionParticipant[]>;
  getSeasonalCompetitionLeaderboard(competitionId: number, limit?: number): Promise<any[]>;
  updateSeasonalCompetitionCount(competitionId: number, userId: string, count: number): Promise<SeasonalCompetitionParticipant>;
  
  // Achievement badges operations
  createAchievementBadge(badge: InsertAchievementBadge): Promise<AchievementBadge>;
  getAllAchievementBadges(): Promise<AchievementBadge[]>;
  getAchievementBadgesByCategory(category: string): Promise<AchievementBadge[]>;
  getActiveAchievementBadges(): Promise<AchievementBadge[]>;
  updateAchievementBadge(id: number, updates: Partial<AchievementBadge>): Promise<AchievementBadge>;
  deleteAchievementBadge(id: number): Promise<void>;
  
  // User achievement operations
  awardBadgeToUser(userId: string, badgeId: number, metadata?: any): Promise<UserAchievementBadge>;
  getUserAchievementBadges(userId: string): Promise<UserAchievementBadge[]>;
  getUserBadgesByCategory(userId: string, category: string): Promise<UserAchievementBadge[]>;
  checkUserBadgeEligibility(userId: string, badgeId: number): Promise<boolean>;
  processAchievementChecks(userId: string, eventType: string, eventData: any): Promise<UserAchievementBadge[]>;
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

  async updateUserFloatingTasbihSetting(userId: string, enabled: boolean): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ floatingTasbihEnabled: enabled, updatedAt: new Date() })
      .where(eq(users.id, userId))
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

  // Organization Levels operations
  async getOrganizations(): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .where(eq(users.userType, 'organization'))
      .orderBy(asc(users.organizationName));
  }

  async getOrgLevelSchema(orgId: string): Promise<OrgLevelSchema | undefined> {
    const [schema] = await db
      .select()
      .from(orgLevelSchemas)
      .where(eq(orgLevelSchemas.orgId, orgId));
    return schema;
  }

  async createOrgLevelSchema(orgId: string, levels: LevelDefinition[], rules: PromotionRule[]): Promise<OrgLevelSchema> {
    const [schema] = await db
      .insert(orgLevelSchemas)
      .values({
        orgId,
        levels: JSON.stringify(levels),
        promotionRules: JSON.stringify(rules),
      })
      .returning();
    return schema;
  }

  async updateOrgLevelSchema(orgId: string, levels: LevelDefinition[], rules: PromotionRule[]): Promise<OrgLevelSchema> {
    const [schema] = await db
      .update(orgLevelSchemas)
      .set({
        levels: JSON.stringify(levels),
        promotionRules: JSON.stringify(rules),
        updatedAt: new Date(),
      })
      .where(eq(orgLevelSchemas.orgId, orgId))
      .returning();
    return schema;
  }

  async getUserOrgProfile(userId: string, orgId: string): Promise<UserOrgProfile | undefined> {
    const [profile] = await db
      .select()
      .from(userOrgProfiles)
      .where(and(
        eq(userOrgProfiles.userId, userId),
        eq(userOrgProfiles.orgId, orgId)
      ));
    return profile;
  }

  async createUserOrgProfile(userId: string, orgId: string, level: number = 1): Promise<UserOrgProfile> {
    const [profile] = await db
      .insert(userOrgProfiles)
      .values({
        userId,
        orgId,
        level,
      })
      .returning();
    return profile;
  }

  async updateUserOrgProfile(id: string, updates: Partial<UserOrgProfile>): Promise<UserOrgProfile> {
    const [profile] = await db
      .update(userOrgProfiles)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(userOrgProfiles.id, id))
      .returning();
    return profile;
  }

  async joinCompetition(compId: number, userId: string, level: number): Promise<Participation> {
    const [participation] = await db
      .insert(participations)
      .values({
        compId,
        userId,
        levelAtEntry: level,
        status: 'view_only',
      })
      .returning();
    return participation;
  }

  async acceptRules(participationId: string): Promise<Participation> {
    const [participation] = await db
      .update(participations)
      .set({
        status: 'active',
        acceptedRulesAt: new Date(),
      })
      .where(eq(participations.id, participationId))
      .returning();
    return participation;
  }

  async getCompetitionStats(compId: number): Promise<CompetitionStat | undefined> {
    const [stats] = await db
      .select()
      .from(competitionStats)
      .where(eq(competitionStats.compId, compId));
    return stats;
  }

  async updateCompetitionStats(compId: number, updates: Partial<CompetitionStat>): Promise<CompetitionStat> {
    const [stats] = await db
      .insert(competitionStats)
      .values({
        compId,
        ...updates,
      })
      .onConflictDoUpdate({
        target: competitionStats.compId,
        set: {
          ...updates,
          updatedAt: new Date(),
        },
      })
      .returning();
    return stats;
  }

  async checkEligibility(userId: string, orgId: string, levelRequired: number): Promise<{ eligible: boolean; userLevel: number; reason?: string }> {
    // Get user's level in this organization
    let userProfile = await this.getUserOrgProfile(userId, orgId);
    
    // If no profile exists, create one at level 1
    if (!userProfile) {
      userProfile = await this.createUserOrgProfile(userId, orgId, 1);
    }

    const userLevel = userProfile.level || 1;
    
    // Get organization settings
    const [org] = await db.select().from(users).where(eq(users.id, orgId));
    const allowJoinLowerLevels = org?.allowJoinLowerLevels ?? true;

    // Check eligibility
    if (userLevel < levelRequired) {
      return {
        eligible: false,
        userLevel,
        reason: `This competition requires Darajah ${levelRequired}. You are Darajah ${userLevel}.`
      };
    }

    if (!allowJoinLowerLevels && userLevel > levelRequired) {
      return {
        eligible: false,
        userLevel,
        reason: `This competition is limited to Darajah ${levelRequired} participants only.`
      };
    }

    return { eligible: true, userLevel };
  }

  async getPromotionProgress(userId: string, orgId: string): Promise<any> {
    const profile = await this.getUserOrgProfile(userId, orgId);
    if (!profile) return null;

    const schema = await this.getOrgLevelSchema(orgId);
    if (!schema) return null;

    const promotionRules = JSON.parse(schema.promotionRules as string) as PromotionRule[];
    const currentLevel = profile.level || 1;
    const nextLevelRule = promotionRules.find(rule => rule.fromLevel === currentLevel);
    
    if (!nextLevelRule) return null;

    // Get current promotion counters
    const [counters] = await db
      .select()
      .from(userPromotionCounters)
      .where(and(
        eq(userPromotionCounters.userId, userId),
        eq(userPromotionCounters.orgId, orgId),
        eq(userPromotionCounters.level, currentLevel || 1)
      ));

    return {
      currentLevel,
      nextLevel: nextLevelRule.toLevel,
      requirements: nextLevelRule.anyOf,
      progress: {
        top3: counters?.top3 ?? 0,
        top5: counters?.top5 ?? 0,
        top10: counters?.top10 ?? 0,
        totalComps: counters?.totalComps ?? 0,
      }
    };
  }

  async processPromotions(compId: number): Promise<void> {
    // This would be implemented to process promotions after competition ends
    // For now, we'll implement basic promotion logic
    console.log(`Processing promotions for competition ${compId}`);
  }

  // Seasonal competitions operations
  async createSeasonalCompetition(competition: any): Promise<any> {
    const result = await db.execute(sql`
      INSERT INTO seasonal_competitions (
        name, description, season, season_year, zikir_id, target_count, unlimited,
        prize_description, start_date, end_date, registration_start_date, registration_end_date,
        max_participants, is_active, theme_color, background_image
      ) VALUES (${competition.name}, ${competition.description}, ${competition.season}, ${competition.seasonYear},
        ${competition.zikirId}, ${competition.targetCount}, ${competition.unlimited},
        ${competition.prizeDescription}, ${competition.startDate}, ${competition.endDate},
        ${competition.registrationStartDate}, ${competition.registrationEndDate},
        ${competition.maxParticipants}, ${competition.isActive}, ${competition.themeColor}, ${competition.backgroundImage})
      RETURNING *
    `);
    return result.rows?.[0];
  }

  async getAllSeasonalCompetitions(): Promise<any[]> {
    const result = await db.execute(sql`SELECT * FROM seasonal_competitions ORDER BY created_at DESC`);
    return result.rows || [];
  }

  async getActiveSeasonalCompetitions(): Promise<any[]> {
    const result = await db.execute(sql`
      SELECT * FROM seasonal_competitions 
      WHERE is_active = true 
      AND start_date <= NOW() 
      AND end_date >= NOW()
      ORDER BY end_date ASC
    `);
    return result.rows || [];
  }

  async getSeasonalCompetitionBySeason(season: string, year: number): Promise<any> {
    const result = await db.execute(sql`
      SELECT * FROM seasonal_competitions 
      WHERE season = ${season} AND season_year = ${year}
      LIMIT 1
    `);
    return result.rows?.[0];
  }

  async updateSeasonalCompetition(id: number, updates: Partial<SeasonalCompetition>): Promise<SeasonalCompetition> {
    const [competition] = await db.update(seasonalCompetitions)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(seasonalCompetitions.id, id))
      .returning();
    return competition;
  }

  async deleteSeasonalCompetition(id: number): Promise<void> {
    await db.delete(seasonalCompetitions).where(eq(seasonalCompetitions.id, id));
  }

  async joinSeasonalCompetition(competitionId: number, userId: string): Promise<any> {
    const result = await db.execute(sql`
      INSERT INTO seasonal_competition_participants (competition_id, user_id, joined_at, total_count, current_rank)
      VALUES (${competitionId}, ${userId}, NOW(), 0, NULL)
      ON CONFLICT (competition_id, user_id) DO NOTHING
      RETURNING *
    `);
    return result.rows?.[0];
  }

  async leaveSeasonalCompetition(competitionId: number, userId: string): Promise<void> {
    await db.execute(sql`
      DELETE FROM seasonal_competition_participants 
      WHERE competition_id = ${competitionId} AND user_id = ${userId}
    `);
  }

  async getSeasonalCompetitionParticipants(competitionId: number): Promise<SeasonalCompetitionParticipant[]> {
    return await db.select().from(seasonalCompetitionParticipants)
      .where(and(
        eq(seasonalCompetitionParticipants.competitionId, competitionId),
        eq(seasonalCompetitionParticipants.isActive, true)
      ));
  }

  async getSeasonalCompetitionLeaderboard(competitionId: number, limit: number = 100): Promise<any[]> {
    return await db.select({
      userId: seasonalCompetitionParticipants.userId,
      totalCount: seasonalCompetitionParticipants.totalCount,
      rank: seasonalCompetitionParticipants.rank,
      lastCountAt: seasonalCompetitionParticipants.lastCountAt,
      user: {
        username: users.username,
        firstName: users.firstName,
        avatarType: users.avatarType,
        bgColor: users.bgColor,
      }
    })
    .from(seasonalCompetitionParticipants)
    .leftJoin(users, eq(seasonalCompetitionParticipants.userId, users.id))
    .where(and(
      eq(seasonalCompetitionParticipants.competitionId, competitionId),
      eq(seasonalCompetitionParticipants.isActive, true)
    ))
    .orderBy(desc(seasonalCompetitionParticipants.totalCount))
    .limit(limit);
  }

  async updateSeasonalCompetitionCount(competitionId: number, userId: string, count: number): Promise<SeasonalCompetitionParticipant> {
    const [participant] = await db.update(seasonalCompetitionParticipants)
      .set({ 
        totalCount: sql`${seasonalCompetitionParticipants.totalCount} + ${count}`,
        lastCountAt: new Date() 
      })
      .where(and(
        eq(seasonalCompetitionParticipants.competitionId, competitionId),
        eq(seasonalCompetitionParticipants.userId, userId)
      ))
      .returning();
    return participant;
  }

  // Achievement badges operations
  async createAchievementBadge(badge: any): Promise<any> {
    const result = await db.execute(sql`
      INSERT INTO achievement_badges (
        name, description, category, badge_type, icon_name, icon_color, background_color,
        conditions, points, rarity, seasonal_only, available_season, is_active
      ) VALUES (${badge.name}, ${badge.description}, ${badge.category}, ${badge.badgeType}, ${badge.iconName},
        ${badge.iconColor}, ${badge.backgroundColor}, ${JSON.stringify(badge.conditions)}, ${badge.points},
        ${badge.rarity}, ${badge.seasonalOnly || false}, ${badge.availableSeason || null}, ${badge.isActive})
      RETURNING *
    `);
    return result.rows?.[0];
  }

  async getAllAchievementBadges(): Promise<any[]> {
    const result = await db.execute(sql`SELECT * FROM achievement_badges ORDER BY category ASC`);
    return result.rows || [];
  }

  async getAchievementBadgesByCategory(category: string): Promise<AchievementBadge[]> {
    return await db.select().from(achievementBadges)
      .where(and(
        eq(achievementBadges.category, category),
        eq(achievementBadges.isActive, true)
      ));
  }

  async getActiveAchievementBadges(): Promise<AchievementBadge[]> {
    return await db.select().from(achievementBadges)
      .where(eq(achievementBadges.isActive, true))
      .orderBy(asc(achievementBadges.category));
  }

  async updateAchievementBadge(id: number, updates: Partial<AchievementBadge>): Promise<AchievementBadge> {
    const [badge] = await db.update(achievementBadges)
      .set(updates)
      .where(eq(achievementBadges.id, id))
      .returning();
    return badge;
  }

  async deleteAchievementBadge(id: number): Promise<void> {
    await db.delete(achievementBadges).where(eq(achievementBadges.id, id));
  }

  // User achievement operations
  async awardBadgeToUser(userId: string, badgeId: number, metadata?: any): Promise<UserAchievementBadge> {
    // Check if user already has this badge
    const existing = await db.select().from(userAchievementBadges)
      .where(and(
        eq(userAchievementBadges.userId, userId),
        eq(userAchievementBadges.badgeId, badgeId)
      ));

    if (existing.length > 0) {
      return existing[0];
    }

    const [userBadge] = await db.insert(userAchievementBadges)
      .values({
        userId,
        badgeId,
        metadata,
        seasonEarned: this.getCurrentSeason(),
        seasonYear: new Date().getFullYear()
      })
      .returning();
    return userBadge;
  }

  async getUserAchievementBadges(userId: string): Promise<UserAchievementBadge[]> {
    return await db.select().from(userAchievementBadges)
      .where(eq(userAchievementBadges.userId, userId))
      .orderBy(desc(userAchievementBadges.earnedAt));
  }

  async getUserBadgesByCategory(userId: string, category: string): Promise<UserAchievementBadge[]> {
    const result = await db.select().from(userAchievementBadges)
      .leftJoin(achievementBadges, eq(userAchievementBadges.badgeId, achievementBadges.id))
      .where(and(
        eq(userAchievementBadges.userId, userId),
        eq(achievementBadges.category, category)
      ));
    
    // Transform joined result to match expected type
    return result.map((row: any) => row.user_achievement_badges);
  }

  async checkUserBadgeEligibility(userId: string, badgeId: number): Promise<boolean> {
    const badge = await db.select().from(achievementBadges)
      .where(eq(achievementBadges.id, badgeId));

    if (!badge.length || !badge[0].isActive) {
      return false;
    }

    // Check if user already has this badge
    const existing = await db.select().from(userAchievementBadges)
      .where(and(
        eq(userAchievementBadges.userId, userId),
        eq(userAchievementBadges.badgeId, badgeId)
      ));

    return existing.length === 0;
  }

  async processAchievementChecks(userId: string, eventType: string, eventData: any): Promise<UserAchievementBadge[]> {
    // Get all active badges that could be earned
    const badges = await this.getActiveAchievementBadges();
    const earnedBadges: UserAchievementBadge[] = [];

    for (const badge of badges) {
      const isEligible = await this.checkUserBadgeEligibility(userId, badge.id);
      if (isEligible && this.checkBadgeConditions(badge, eventType, eventData, userId)) {
        const earnedBadge = await this.awardBadgeToUser(userId, badge.id, eventData);
        earnedBadges.push(earnedBadge);
      }
    }

    return earnedBadges;
  }

  private getCurrentSeason(): string {
    const now = new Date();
    const month = now.getMonth() + 1; // JavaScript months are 0-indexed
    
    // Approximate Islamic calendar seasons
    if (month >= 3 && month <= 5) return 'ramadan';
    if (month >= 7 && month <= 9) return 'hajj';
    if (month >= 9 && month <= 11) return 'muharram';
    return 'regular';
  }

  private checkBadgeConditions(badge: AchievementBadge, eventType: string, eventData: any, userId: string): boolean {
    const conditions = badge.conditions as any;
    
    // Example condition checking logic
    if (badge.category === 'zikir' && eventType === 'count_completed') {
      if (conditions.totalCount && eventData.userTotalCount >= conditions.totalCount) {
        return true;
      }
      if (conditions.singleSessionCount && eventData.sessionCount >= conditions.singleSessionCount) {
        return true;
      }
    }

    if (badge.category === 'streak' && eventType === 'daily_streak') {
      if (conditions.streakDays && eventData.streakCount >= conditions.streakDays) {
        return true;
      }
    }

    if (badge.category === 'seasonal' && eventType === 'seasonal_competition') {
      const currentSeason = this.getCurrentSeason();
      if (badge.availableSeason === currentSeason) {
        if (conditions.rank && eventData.finalRank <= conditions.rank) {
          return true;
        }
      }
    }

    return false;
  }

  // Spiritual progress operations
  async getUserSpiritualProgress(userId: string): Promise<any> {
    // For now, return mock data until we set up proper database tables
    return {
      completedLevels: [],
      currentStreak: 0,
      morningDhikr: 0,
      eveningDhikr: 0,
      weeklyStreak: 0,
      nightPrayer: 0,
      dailyQuran: 0,
      dhikriMeanings: 0,
      helpedUsers: 0,
      leadershipRoles: 0
    };
  }

  async completeUserTask(userId: string, levelId: number, taskType: string, rewards: any): Promise<void> {
    // Update user's barakah coins and experience
    const analytics = await this.getUserAnalytics(userId);
    if (analytics) {
      await this.updateUserAnalytics(userId, {
        barakahCoins: (analytics.barakahCoins || 0) + rewards.coins,
        noorGems: (analytics.noorGems || 0) + (rewards.experience / 10), // Convert some XP to gems
        experience: (analytics.experience || 0) + rewards.experience
      });
    } else {
      await db.insert(userAnalytics).values({
        userId,
        barakahCoins: rewards.coins,
        noorGems: Math.floor(rewards.experience / 10),
        experience: rewards.experience,
        totalCount: 0,
        currentStreak: 0,
        longestStreak: 0,
        roomsJoined: 0,
        roomsCompleted: 0
      });
    }

    // For now, we'll store task completion in a simple way
    // In production, you'd want proper spiritual progress tables
    console.log(`User ${userId} completed level ${levelId} task ${taskType} and earned ${rewards.coins} coins + ${rewards.experience} XP`);
  }

  // Admin level management methods
  async getAllDhikriLevels(): Promise<any[]> {
    // Return the current dhikr database with admin metadata
    const dhikriDatabase = [
      { 
        id: 1, 
        level: 1,
        arabic: "سُبْحَانَ اللهِ", 
        transliteration: "Subhanallahi", 
        meaning: "Glory be to Allah", 
        count: 33, 
        coins: 10, 
        experience: 25, 
        category: "Basic Tasbih", 
        isActive: true, 
        difficulty: "beginner", 
        timeEstimateMinutes: 5,
        sortOrder: 1,
        pronunciation: "Sub-han-al-lah-hee",
        culturalContext: "One of the most fundamental dhikr practices, mentioned throughout the Quran as a way to glorify Allah.",
        learningObjectives: ["Learn the meaning of glorification", "Practice rhythmic recitation"],
        spiritualBenefits: ["Purifies the heart", "Brings peace and tranquility"],
        bestTimes: ["After prayers", "Morning", "Evening"]
      },
      { 
        id: 2, 
        level: 2,
        arabic: "الْحَمْدُ للهِ", 
        transliteration: "Alhamdulillahi", 
        meaning: "Praise be to Allah", 
        count: 33, 
        coins: 10, 
        experience: 25, 
        category: "Basic Tasbih", 
        isActive: true, 
        difficulty: "beginner", 
        timeEstimateMinutes: 5,
        sortOrder: 2,
        pronunciation: "Al-ham-du-lil-lah-hee",
        culturalContext: "The opening phrase of Surah Al-Fatihah, expressing gratitude and praise to Allah.",
        learningObjectives: ["Understand the concept of praise", "Connect with gratitude"],
        spiritualBenefits: ["Increases thankfulness", "Opens the heart to blessings"],
        bestTimes: ["Upon waking", "Before meals", "After achievements"]
      },
      { 
        id: 3, 
        level: 3,
        arabic: "اللهُ أَكْبَر", 
        transliteration: "Allahu Akbar", 
        meaning: "Allah is Greatest", 
        count: 34, 
        coins: 10, 
        experience: 25, 
        category: "Basic Tasbih", 
        isActive: true, 
        difficulty: "beginner", 
        timeEstimateMinutes: 5,
        sortOrder: 3,
        pronunciation: "Al-lah-hu-ak-bar",
        culturalContext: "The Takbir, proclaimed during prayers and significant moments, affirming Allah's supreme greatness.",
        learningObjectives: ["Recognize Allah's supremacy", "Practice with reverence"],
        spiritualBenefits: ["Strengthens faith", "Provides perspective on worldly matters"],
        bestTimes: ["Before challenges", "During prayer", "In moments of awe"]
      },
    ];
    return dhikriDatabase;
  }

  async createDhikriLevel(levelData: any): Promise<any> {
    // In a real app, this would insert into a dhikri_levels table
    console.log("Creating new dhikr level:", levelData);
    return { id: Date.now(), ...levelData };
  }

  async updateDhikriLevel(id: number, levelData: any): Promise<any> {
    // In a real app, this would update the dhikri_levels table
    console.log(`Updating dhikr level ${id}:`, levelData);
    return { id, ...levelData };
  }

  async deleteDhikriLevel(id: number): Promise<void> {
    // In a real app, this would delete from dhikri_levels table
    console.log(`Deleting dhikr level ${id}`);
  }

  async reorderDhikriLevels(updates: { id: number; sortOrder: number; level: number }[]): Promise<void> {
    // In a real app, this would update the sort order in dhikri_levels table
    console.log("Reordering dhikr levels:", updates);
    for (const update of updates) {
      console.log(`Level ${update.id} -> sortOrder: ${update.sortOrder}, level: ${update.level}`);
    }
  }
}

export const storage = new DatabaseStorage();
