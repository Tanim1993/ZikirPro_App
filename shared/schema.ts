import { sql, relations } from "drizzle-orm";
import {
  pgTable,
  varchar,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
  index,
  serial,
  primaryKey
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)]
);

// Users table (required for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: varchar("username").unique(),
  email: varchar("email").unique(),
  phone: varchar("phone").unique(),
  password: varchar("password"), // hashed password
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  country: varchar("country").default("Bangladesh"),
  avatarType: varchar("avatar_type").default("male-1"),
  bgColor: varchar("bg_color").default("green"),
  signupMethod: varchar("signup_method").default("username"), // username, google, phone
  isVerified: boolean("is_verified").default(false),
  userType: varchar("user_type").default("regular"), // "regular", "organization"
  organizationName: varchar("organization_name"),
  organizationLogo: varchar("organization_logo"),
  organizationDescription: text("organization_description"),
  // Organization level settings
  allowJoinLowerLevels: boolean("allow_join_lower_levels").default(true),
  verified: boolean("verified").default(false), // verified organization status
  // Gamification fields
  spiritualPoints: integer("spiritual_points").default(0),
  zikirCoins: integer("zikir_coins").default(0),
  dailyBlessingPoints: integer("daily_blessing_points").default(0),
  userLevel: integer("user_level").default(1),
  roomCreationLimit: integer("room_creation_limit").default(1),
  lastDailyReward: timestamp("last_daily_reward"),
  totalRoomsCreated: integer("total_rooms_created").default(0),
  // Floating Tasbih Settings
  floatingTasbihEnabled: boolean("floating_tasbih_enabled").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Zikir master list
export const zikirs = pgTable("zikirs", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  arabicText: text("arabic_text"),
  transliteration: text("transliteration"),
  translation: text("translation"),
  fazilat: text("fazilat"), // Benefits/virtues
  references: text("references"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Zikir rooms
export const rooms = pgTable("rooms", {
  id: serial("id").primaryKey(),
  zikirId: integer("zikir_id").notNull(),
  ownerId: varchar("owner_id").notNull(),
  name: varchar("name", { length: 255 }),
  description: text("description"),
  targetCount: integer("target_count"),
  unlimited: boolean("unlimited").default(false),
  duration: integer("duration").notNull(), // in days
  isPublic: boolean("is_public").default(true),
  country: varchar("country"),
  pictureUrl: varchar("picture_url"),
  startDate: timestamp("start_date").defaultNow(),
  endDate: timestamp("end_date"),
  isActive: boolean("is_active").default(true),
  // Organization competition features
  prizeDescription: text("prize_description"), // Prize details for organization competitions
  competitionType: varchar("competition_type").default("regular"), // "regular", "competition"
  competitionStartDate: timestamp("competition_start_date"),
  competitionEndDate: timestamp("competition_end_date"),
  maxParticipants: integer("max_participants"),
  // Level-based access control
  levelRequired: integer("level_required").default(1),
  createdAt: timestamp("created_at").defaultNow(),
});

// Room members
export const roomMembers = pgTable("room_members", {
  roomId: integer("room_id").notNull(),
  userId: varchar("user_id").notNull(),
  nickname: varchar("nickname", { length: 100 }),
  role: varchar("role").default("member"), // member, owner
  joinedAt: timestamp("joined_at").defaultNow(),
  isActive: boolean("is_active").default(true),
}, (table) => ({
  pk: primaryKey({ columns: [table.roomId, table.userId] })
}));

// Count entries (for tracking daily counts)
export const countEntries = pgTable("count_entries", {
  id: serial("id").primaryKey(),
  roomId: integer("room_id").notNull(),
  userId: varchar("user_id").notNull(),
  day: integer("day").notNull(), // day number in the challenge
  count: integer("count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Real-time count tracking
export const liveCounters = pgTable("live_counters", {
  roomId: integer("room_id").notNull(),
  userId: varchar("user_id").notNull(),
  currentCount: integer("current_count").default(0),
  todayCount: integer("today_count").default(0),
  totalCount: integer("total_count").default(0),
  lastCountAt: timestamp("last_count_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  pk: primaryKey({ columns: [table.roomId, table.userId] })
}));

// User analytics/progress
export const userAnalytics = pgTable("user_analytics", {
  userId: varchar("user_id").primaryKey(),
  currentStreak: integer("current_streak").default(0),
  longestStreak: integer("longest_streak").default(0),
  totalZikir: integer("total_zikir").default(0),
  completedRooms: integer("completed_rooms").default(0),
  lastActiveDate: timestamp("last_active_date").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Reports
export const reports = pgTable("reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  kind: varchar("kind").notNull(), // "room", "user", etc.
  targetId: varchar("target_id").notNull(), // ID of the reported entity
  byUserId: varchar("by_user_id").notNull(), // Reporter's user ID
  reason: varchar("reason").notNull(), // "Illegal content", "Wrong Islamic information", etc.
  details: text("details"), // Optional additional details (max 500 chars)
  status: varchar("status").notNull().default("open"), // "open", "reviewed", "closed"
  adminNotes: text("admin_notes"), // Admin-only notes
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Organization Level Schemas (Darajah system)
export const orgLevelSchemas = pgTable("org_level_schemas", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orgId: varchar("org_id").notNull(),
  levels: jsonb("levels").notNull(), // [{ level: 1, label: "Darajah 1", description: "..." }]
  promotionRules: jsonb("promotion_rules").notNull(), // PromotionRule[]
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User Organization Profiles (tracks user level per org)
export const userOrgProfiles = pgTable("user_org_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  orgId: varchar("org_id").notNull(),
  level: integer("level").default(1),
  stats: jsonb("stats").default('{"wins":0,"podiums":0,"top10":0,"comps":0}'),
  history: jsonb("history").default('[]'), // [{ compId, rank, levelAtEntry, placedAt }]
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Competition Participations (enhanced with level tracking)
export const participations = pgTable("participations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  compId: integer("comp_id").notNull(),
  userId: varchar("user_id").notNull(),
  status: varchar("status").default("view_only"), // "view_only", "active", "finished", "disqualified"
  joinedAt: timestamp("joined_at").defaultNow(),
  acceptedRulesAt: timestamp("accepted_rules_at"),
  levelAtEntry: integer("level_at_entry").default(1),
});

// Competition Statistics
export const competitionStats = pgTable("competition_stats", {
  compId: integer("comp_id").primaryKey(),
  totalParticipants: integer("total_participants").default(0),
  joinedToday: integer("joined_today").default(0),
  activeParticipants: integer("active_participants").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Competition Results (for promotion tracking)
export const competitionResults = pgTable("competition_results", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  compId: integer("comp_id").notNull(),
  userId: varchar("user_id").notNull(),
  rank: integer("rank").notNull(),
  levelAtEntry: integer("level_at_entry").notNull(),
  finalCount: integer("final_count").default(0),
  placedAt: timestamp("placed_at").defaultNow(),
});

// User Promotion Counters (materialized view for fast promotion checks)
export const userPromotionCounters = pgTable("user_promotion_counters", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orgId: varchar("org_id").notNull(),
  userId: varchar("user_id").notNull(),
  level: integer("level").notNull(),
  top3: integer("top3").default(0),
  top5: integer("top5").default(0),
  top10: integer("top10").default(0),
  totalComps: integer("total_comps").default(0),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Seasonal competitions table
export const seasonalCompetitions = pgTable("seasonal_competitions", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description").notNull(),
  season: varchar("season", { length: 50 }).notNull(), // ramadan, hajj, muharram, etc.
  seasonYear: integer("season_year").notNull(), // 2025, 2026, etc.
  zikirId: integer("zikir_id").notNull(),
  targetCount: integer("target_count"),
  unlimited: boolean("unlimited").default(false),
  prizeDescription: text("prize_description"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  registrationStartDate: timestamp("registration_start_date").notNull(),
  registrationEndDate: timestamp("registration_end_date").notNull(),
  maxParticipants: integer("max_participants"),
  isActive: boolean("is_active").default(true),
  isGlobal: boolean("is_global").default(true), // Global vs country-specific
  country: varchar("country"),
  specialRewards: jsonb("special_rewards"), // JSON array of special rewards
  backgroundImage: varchar("background_image"), // Seasonal themed background
  themeColor: varchar("theme_color").default("#4a90e2"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Achievement badges table
export const achievementBadges = pgTable("achievement_badges", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description").notNull(),
  category: varchar("category", { length: 50 }).notNull(), // zikir, seasonal, social, streak, milestone
  badgeType: varchar("badge_type", { length: 50 }).notNull(), // bronze, silver, gold, platinum, special
  iconName: varchar("icon_name", { length: 100 }).notNull(), // Icon identifier
  iconColor: varchar("icon_color").default("#4a90e2"),
  backgroundColor: varchar("background_color").default("#f0f7ff"),
  conditions: jsonb("conditions").notNull(), // JSON object defining earning conditions
  isActive: boolean("is_active").default(true),
  rarity: varchar("rarity", { length: 20 }).default("common"), // common, uncommon, rare, epic, legendary
  points: integer("points").default(10), // Points awarded for earning badge
  seasonalOnly: boolean("seasonal_only").default(false), // Can only be earned during specific seasons
  availableSeason: varchar("available_season"), // Which season this badge is available
  createdAt: timestamp("created_at").defaultNow(),
});

// User achievement badges (earned badges)
export const userAchievementBadges = pgTable("user_achievement_badges", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  badgeId: integer("badge_id").notNull(),
  earnedAt: timestamp("earned_at").defaultNow(),
  seasonEarned: varchar("season_earned"), // Which season they earned it in
  seasonYear: integer("season_year"), // Which year they earned it in
  relatedCompetitionId: integer("related_competition_id"), // If earned through specific competition
  metadata: jsonb("metadata"), // Additional context about how badge was earned
});

// Seasonal competition participants
export const seasonalCompetitionParticipants = pgTable("seasonal_competition_participants", {
  id: serial("id").primaryKey(),
  competitionId: integer("competition_id").notNull(),
  userId: varchar("user_id").notNull(),
  registeredAt: timestamp("registered_at").defaultNow(),
  totalCount: integer("total_count").default(0),
  lastCountAt: timestamp("last_count_at"),
  isActive: boolean("is_active").default(true),
  rank: integer("rank"), // Current rank in competition
  badgesEarned: integer("badges_earned").default(0), // Badges earned during this competition
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  ownedRooms: many(rooms),
  roomMemberships: many(roomMembers),
  countEntries: many(countEntries),
  liveCounters: many(liveCounters),
  reportsMade: many(reports),
}));

export const zikirsRelations = relations(zikirs, ({ many }) => ({
  rooms: many(rooms),
}));

export const roomsRelations = relations(rooms, ({ one, many }) => ({
  zikir: one(zikirs, {
    fields: [rooms.zikirId],
    references: [zikirs.id],
  }),
  owner: one(users, {
    fields: [rooms.ownerId],
    references: [users.id],
  }),
  members: many(roomMembers),
  countEntries: many(countEntries),
  liveCounters: many(liveCounters),
}));

export const roomMembersRelations = relations(roomMembers, ({ one }) => ({
  room: one(rooms, {
    fields: [roomMembers.roomId],
    references: [rooms.id],
  }),
  user: one(users, {
    fields: [roomMembers.userId],
    references: [users.id],
  }),
}));

export const countEntriesRelations = relations(countEntries, ({ one }) => ({
  room: one(rooms, {
    fields: [countEntries.roomId],
    references: [rooms.id],
  }),
  user: one(users, {
    fields: [countEntries.userId],
    references: [users.id],
  }),
}));

export const liveCountersRelations = relations(liveCounters, ({ one }) => ({
  room: one(rooms, {
    fields: [liveCounters.roomId],
    references: [rooms.id],
  }),
  user: one(users, {
    fields: [liveCounters.userId],
    references: [users.id],
  }),
}));

export const reportsRelations = relations(reports, ({ one }) => ({
  reportedBy: one(users, {
    fields: [reports.byUserId],
    references: [users.id],
  }),
}));

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// Tasbih Skins table
export const tasbihSkins = pgTable("tasbih_skins", {
  id: varchar("id").primaryKey(), // e.g., "classic_wood", "emerald_glow"
  name: varchar("name").notNull(),
  rarity: varchar("rarity").notNull(), // "common|uncommon|rare|epic|legendary"
  priceCoins: integer("price_coins").notNull(),
  previewUrl: varchar("preview_url"),
  thumbUrl: varchar("thumb_url"),
  status: varchar("status").notNull().default("active"), // "active|retired"
  animationType: varchar("animation_type"), // describes the animation style
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

// User Wallet
export const userWallets = pgTable("user_wallets", {
  userId: varchar("user_id").primaryKey(),
  coins: integer("coins").notNull().default(0),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User Inventory (owned tasbih skins)
export const userInventory = pgTable("user_inventory", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  tasbihSkinId: varchar("tasbih_skin_id").notNull(),
  purchasedAt: timestamp("purchased_at").defaultNow(),
});

// User Purchase History
export const userPurchases = pgTable("user_purchases", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  type: varchar("type").notNull(), // "coins|skin"
  sku: varchar("sku"), // "coins_300", "coins_800", etc.
  coinsDelta: integer("coins_delta"), // coins added or deducted
  amountCurrency: varchar("amount_currency"), // "USD"
  amountCents: integer("amount_cents"), // price in cents
  provider: varchar("provider"), // "Play|AppStore|Stripe"
  itemId: varchar("item_id"), // for skin purchases, the skin ID
  createdAt: timestamp("created_at").defaultNow(),
});

// User Room Config (equipped tasbih per room)
export const userRoomConfigs = pgTable("user_room_configs", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  roomId: integer("room_id").notNull(),
  equippedTasbihSkinId: varchar("equipped_tasbih_skin_id"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type TasbihSkin = typeof tasbihSkins.$inferSelect;
export type InsertTasbihSkin = typeof tasbihSkins.$inferInsert;
export type UserWallet = typeof userWallets.$inferSelect;
export type InsertUserWallet = typeof userWallets.$inferInsert;
export type UserInventoryItem = typeof userInventory.$inferSelect;
export type InsertUserInventoryItem = typeof userInventory.$inferInsert;
export type UserPurchase = typeof userPurchases.$inferSelect;
export type InsertUserPurchase = typeof userPurchases.$inferInsert;
export type UserRoomConfig = typeof userRoomConfigs.$inferSelect;
export type InsertUserRoomConfig = typeof userRoomConfigs.$inferInsert;

export type InsertZikir = typeof zikirs.$inferInsert;
export type Zikir = typeof zikirs.$inferSelect;

export type InsertRoom = typeof rooms.$inferInsert;
export type Room = typeof rooms.$inferSelect;

export type InsertRoomMember = typeof roomMembers.$inferInsert;
export type RoomMember = typeof roomMembers.$inferSelect;

export type InsertCountEntry = typeof countEntries.$inferInsert;
export type CountEntry = typeof countEntries.$inferSelect;

export type InsertReport = typeof reports.$inferInsert;
export type Report = typeof reports.$inferSelect;

export type InsertLiveCounter = typeof liveCounters.$inferInsert;
export type LiveCounter = typeof liveCounters.$inferSelect;

export type InsertUserAnalytics = typeof userAnalytics.$inferInsert;
export type UserAnalytics = typeof userAnalytics.$inferSelect;

// Organization Levels types
export type OrgLevelSchema = typeof orgLevelSchemas.$inferSelect;
export type InsertOrgLevelSchema = typeof orgLevelSchemas.$inferInsert;

export type UserOrgProfile = typeof userOrgProfiles.$inferSelect;
export type InsertUserOrgProfile = typeof userOrgProfiles.$inferInsert;

export type Participation = typeof participations.$inferSelect;
export type InsertParticipation = typeof participations.$inferInsert;

export type CompetitionResult = typeof competitionResults.$inferSelect;
export type InsertCompetitionResult = typeof competitionResults.$inferInsert;

export type CompetitionStat = typeof competitionStats.$inferSelect;
export type InsertCompetitionStat = typeof competitionStats.$inferInsert;

export type UserPromotionCounter = typeof userPromotionCounters.$inferSelect;
export type InsertUserPromotionCounter = typeof userPromotionCounters.$inferInsert;

// Seasonal competitions and badges types
export type SeasonalCompetition = typeof seasonalCompetitions.$inferSelect;
export type InsertSeasonalCompetition = typeof seasonalCompetitions.$inferInsert;

export type AchievementBadge = typeof achievementBadges.$inferSelect;
export type InsertAchievementBadge = typeof achievementBadges.$inferInsert;

export type UserAchievementBadge = typeof userAchievementBadges.$inferSelect;
export type InsertUserAchievementBadge = typeof userAchievementBadges.$inferInsert;

export type SeasonalCompetitionParticipant = typeof seasonalCompetitionParticipants.$inferSelect;
export type InsertSeasonalCompetitionParticipant = typeof seasonalCompetitionParticipants.$inferInsert;

// Zod schemas
export const insertRoomSchema = createInsertSchema(rooms).omit({
  id: true,
  createdAt: true,
  endDate: true,
});

export const insertRoomMemberSchema = createInsertSchema(roomMembers).omit({
  joinedAt: true,
});

export const insertCountEntrySchema = createInsertSchema(countEntries).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateUserProfileSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  country: z.string().optional(),
  avatarType: z.string().optional(),
  bgColor: z.string().optional(),
});

// Organization Levels schemas
export const insertOrgLevelSchemaSchema = createInsertSchema(orgLevelSchemas).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserOrgProfileSchema = createInsertSchema(userOrgProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertParticipationSchema = createInsertSchema(participations).omit({
  id: true,
  joinedAt: true,
});

export const insertCompetitionResultSchema = createInsertSchema(competitionResults).omit({
  id: true,
  placedAt: true,
});

export const insertPromotionCounterSchema = createInsertSchema(userPromotionCounters).omit({
  id: true,
  updatedAt: true,
});

// Seasonal competitions and badges schemas
export const insertSeasonalCompetitionSchema = createInsertSchema(seasonalCompetitions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAchievementBadgeSchema = createInsertSchema(achievementBadges).omit({
  id: true,
  createdAt: true,
});

export const insertUserAchievementBadgeSchema = createInsertSchema(userAchievementBadges).omit({
  id: true,
  earnedAt: true,
});

export const insertSeasonalCompetitionParticipantSchema = createInsertSchema(seasonalCompetitionParticipants).omit({
  id: true,
  registeredAt: true,
});

// Level and promotion rule types
export interface LevelDefinition {
  level: number;
  label: string;
  description: string;
}

export interface PromotionCondition {
  rankAtMost: number;
  occurrences: number;
}

export interface PromotionRule {
  fromLevel: number;
  toLevel: number;
  anyOf: PromotionCondition[];
}

// ===== GAMIFICATION SYSTEM TABLES =====

// Level Configuration (1-50 levels)
export const levelConfiguration = pgTable("level_configuration", {
  level: integer("level").primaryKey(),
  titleEn: varchar("title_en", { length: 100 }),
  titleAr: varchar("title_ar", { length: 100 }),
  pointsRequired: integer("points_required").notNull(),
  roomCreationLimit: integer("room_creation_limit").default(1),
  coinMultiplier: integer("coin_multiplier").default(100), // stored as integer (100 = 1.0x)
  specialFeatures: text("special_features").array(),
  unlockMessage: text("unlock_message"),
  levelImageUrl: varchar("level_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Currency Configuration
export const currencyConfiguration = pgTable("currency_configuration", {
  id: serial("id").primaryKey(),
  activityType: varchar("activity_type", { length: 100 }).notNull(),
  basePoints: integer("base_points").default(0),
  multiplier: integer("multiplier").default(100), // stored as integer (100 = 1.0x)
  levelRequirement: integer("level_requirement").default(1),
  seasonalBonus: integer("seasonal_bonus").default(100), // stored as integer (100 = 1.0x)
  isActive: boolean("is_active").default(true),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Badge Configuration
export const badgeConfiguration = pgTable("badge_configuration", {
  id: serial("id").primaryKey(),
  badgeId: varchar("badge_id", { length: 100 }).unique().notNull(),
  nameEn: varchar("name_en", { length: 200 }).notNull(),
  nameAr: varchar("name_ar", { length: 200 }),
  description: text("description"),
  category: varchar("category", { length: 100 }).notNull(), // zikir, practice, community, seasonal
  criteriaType: varchar("criteria_type", { length: 100 }).notNull(),
  targetValue: integer("target_value").notNull(),
  pointsReward: integer("points_reward").default(0),
  coinsReward: integer("coins_reward").default(0),
  badgeImageUrl: varchar("badge_image_url"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User Badges (earned badges)
export const userBadges = pgTable("user_badges", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  badgeId: varchar("badge_id").notNull(),
  earnedAt: timestamp("earned_at").defaultNow(),
});

// Daily Quest Configuration
export const questConfiguration = pgTable("quest_configuration", {
  id: serial("id").primaryKey(),
  questId: varchar("quest_id", { length: 100 }).unique().notNull(),
  nameEn: varchar("name_en", { length: 200 }).notNull(),
  nameAr: varchar("name_ar", { length: 200 }),
  description: text("description"),
  questType: varchar("quest_type", { length: 100 }).notNull(), // zikir, practice, community, time
  targetValue: integer("target_value").notNull(),
  timeLimit: varchar("time_limit", { length: 50 }), // all_day, before_10am, after_maghrib, custom
  pointsReward: integer("points_reward").default(0),
  bonusMultiplier: integer("bonus_multiplier").default(100),
  minLevel: integer("min_level").default(1),
  maxLevel: integer("max_level").default(50),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User Daily Quest Progress
export const userQuestProgress = pgTable("user_quest_progress", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  questId: varchar("quest_id").notNull(),
  currentProgress: integer("current_progress").default(0),
  targetValue: integer("target_value").notNull(),
  isCompleted: boolean("is_completed").default(false),
  completedAt: timestamp("completed_at"),
  questDate: timestamp("quest_date").defaultNow(),
});

// Islamic Practice Configuration
export const islamicPracticeConfiguration = pgTable("islamic_practice_configuration", {
  id: serial("id").primaryKey(),
  practiceId: varchar("practice_id", { length: 100 }).unique().notNull(),
  nameEn: varchar("name_en", { length: 200 }).notNull(),
  nameAr: varchar("name_ar", { length: 200 }),
  description: text("description"),
  recommendedTime: varchar("recommended_time", { length: 100 }), // any_time, after_fajr, friday_only, night_time
  pointsReward: integer("points_reward").default(0),
  streakBonus: integer("streak_bonus").default(0), // bonus points per consecutive day
  verificationType: varchar("verification_type", { length: 100 }).default("self_confirmation"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User Islamic Practice Tracking
export const userIslamicPractices = pgTable("user_islamic_practices", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  practiceId: varchar("practice_id").notNull(),
  completedAt: timestamp("completed_at").defaultNow(),
  practiceDate: timestamp("practice_date").defaultNow(),
  currentStreak: integer("current_streak").default(1),
  longestStreak: integer("longest_streak").default(1),
  totalCompletions: integer("total_completions").default(1),
});

// User Room Purchases (room expansions, etc.)
export const userRoomPurchases = pgTable("user_room_purchases", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  itemType: varchar("item_type", { length: 100 }).notNull(), // room_slot, room_package
  itemId: varchar("item_id", { length: 100 }).notNull(),
  costUsd: integer("cost_usd").notNull(), // stored in cents
  purchasedAt: timestamp("purchased_at").defaultNow(),
  isActive: boolean("is_active").default(true),
});

// Room Economy Configuration
export const roomEconomyConfig = pgTable("room_economy_config", {
  id: serial("id").primaryKey(),
  levelMin: integer("level_min").notNull(),
  levelMax: integer("level_max").notNull(),
  freeRooms: integer("free_rooms").default(1),
  additionalSlotPrice: integer("additional_slot_price").default(299), // in cents
  maxPurchasable: integer("max_purchasable").default(5),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Gamification Types
export type LevelConfiguration = typeof levelConfiguration.$inferSelect;
export type InsertLevelConfiguration = typeof levelConfiguration.$inferInsert;

export type CurrencyConfiguration = typeof currencyConfiguration.$inferSelect;
export type InsertCurrencyConfiguration = typeof currencyConfiguration.$inferInsert;

export type BadgeConfiguration = typeof badgeConfiguration.$inferSelect;
export type InsertBadgeConfiguration = typeof badgeConfiguration.$inferInsert;

export type UserBadge = typeof userBadges.$inferSelect;
export type InsertUserBadge = typeof userBadges.$inferInsert;

export type QuestConfiguration = typeof questConfiguration.$inferSelect;
export type InsertQuestConfiguration = typeof questConfiguration.$inferInsert;

export type UserQuestProgress = typeof userQuestProgress.$inferSelect;
export type InsertUserQuestProgress = typeof userQuestProgress.$inferInsert;

export type IslamicPracticeConfiguration = typeof islamicPracticeConfiguration.$inferSelect;
export type InsertIslamicPracticeConfiguration = typeof islamicPracticeConfiguration.$inferInsert;

export type UserIslamicPractice = typeof userIslamicPractices.$inferSelect;
export type InsertUserIslamicPractice = typeof userIslamicPractices.$inferInsert;
