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
