CREATE TABLE "achievement_badges" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"category" varchar(50) NOT NULL,
	"badge_type" varchar(50) NOT NULL,
	"icon_name" varchar(100) NOT NULL,
	"icon_color" varchar DEFAULT '#4a90e2',
	"background_color" varchar DEFAULT '#f0f7ff',
	"conditions" jsonb NOT NULL,
	"is_active" boolean DEFAULT true,
	"rarity" varchar(20) DEFAULT 'common',
	"points" integer DEFAULT 10,
	"seasonal_only" boolean DEFAULT false,
	"available_season" varchar,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "badge_configuration" (
	"id" serial PRIMARY KEY NOT NULL,
	"badge_id" varchar(100) NOT NULL,
	"name_en" varchar(200) NOT NULL,
	"name_ar" varchar(200),
	"description" text,
	"category" varchar(100) NOT NULL,
	"criteria_type" varchar(100) NOT NULL,
	"target_value" integer NOT NULL,
	"points_reward" integer DEFAULT 0,
	"coins_reward" integer DEFAULT 0,
	"badge_image_url" varchar,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "badge_configuration_badge_id_unique" UNIQUE("badge_id")
);
--> statement-breakpoint
CREATE TABLE "competition_results" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"comp_id" integer NOT NULL,
	"user_id" varchar NOT NULL,
	"rank" integer NOT NULL,
	"level_at_entry" integer NOT NULL,
	"final_count" integer DEFAULT 0,
	"placed_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "competition_stats" (
	"comp_id" integer PRIMARY KEY NOT NULL,
	"total_participants" integer DEFAULT 0,
	"joined_today" integer DEFAULT 0,
	"active_participants" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "count_entries" (
	"id" serial PRIMARY KEY NOT NULL,
	"room_id" integer NOT NULL,
	"user_id" varchar NOT NULL,
	"day" integer NOT NULL,
	"count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "currency_configuration" (
	"id" serial PRIMARY KEY NOT NULL,
	"activity_type" varchar(100) NOT NULL,
	"base_points" integer DEFAULT 0,
	"multiplier" integer DEFAULT 100,
	"level_requirement" integer DEFAULT 1,
	"seasonal_bonus" integer DEFAULT 100,
	"is_active" boolean DEFAULT true,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "islamic_practice_configuration" (
	"id" serial PRIMARY KEY NOT NULL,
	"practice_id" varchar(100) NOT NULL,
	"name_en" varchar(200) NOT NULL,
	"name_ar" varchar(200),
	"description" text,
	"recommended_time" varchar(100),
	"points_reward" integer DEFAULT 0,
	"streak_bonus" integer DEFAULT 0,
	"verification_type" varchar(100) DEFAULT 'self_confirmation',
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "islamic_practice_configuration_practice_id_unique" UNIQUE("practice_id")
);
--> statement-breakpoint
CREATE TABLE "level_configuration" (
	"level" integer PRIMARY KEY NOT NULL,
	"title_en" varchar(100),
	"title_ar" varchar(100),
	"points_required" integer NOT NULL,
	"room_creation_limit" integer DEFAULT 1,
	"coin_multiplier" integer DEFAULT 100,
	"special_features" text[],
	"unlock_message" text,
	"level_image_url" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "live_counters" (
	"room_id" integer NOT NULL,
	"user_id" varchar NOT NULL,
	"current_count" integer DEFAULT 0,
	"today_count" integer DEFAULT 0,
	"total_count" integer DEFAULT 0,
	"last_count_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "live_counters_room_id_user_id_pk" PRIMARY KEY("room_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "org_level_schemas" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" varchar NOT NULL,
	"levels" jsonb NOT NULL,
	"promotion_rules" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "participations" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"comp_id" integer NOT NULL,
	"user_id" varchar NOT NULL,
	"status" varchar DEFAULT 'view_only',
	"joined_at" timestamp DEFAULT now(),
	"accepted_rules_at" timestamp,
	"level_at_entry" integer DEFAULT 1
);
--> statement-breakpoint
CREATE TABLE "quest_configuration" (
	"id" serial PRIMARY KEY NOT NULL,
	"quest_id" varchar(100) NOT NULL,
	"name_en" varchar(200) NOT NULL,
	"name_ar" varchar(200),
	"description" text,
	"quest_type" varchar(100) NOT NULL,
	"target_value" integer NOT NULL,
	"time_limit" varchar(50),
	"points_reward" integer DEFAULT 0,
	"bonus_multiplier" integer DEFAULT 100,
	"min_level" integer DEFAULT 1,
	"max_level" integer DEFAULT 50,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "quest_configuration_quest_id_unique" UNIQUE("quest_id")
);
--> statement-breakpoint
CREATE TABLE "reports" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"kind" varchar NOT NULL,
	"target_id" varchar NOT NULL,
	"by_user_id" varchar NOT NULL,
	"reason" varchar NOT NULL,
	"details" text,
	"status" varchar DEFAULT 'open' NOT NULL,
	"admin_notes" text,
	"resolved_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "room_economy_config" (
	"id" serial PRIMARY KEY NOT NULL,
	"level_min" integer NOT NULL,
	"level_max" integer NOT NULL,
	"free_rooms" integer DEFAULT 1,
	"additional_slot_price" integer DEFAULT 299,
	"max_purchasable" integer DEFAULT 5,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "room_members" (
	"room_id" integer NOT NULL,
	"user_id" varchar NOT NULL,
	"nickname" varchar(100),
	"role" varchar DEFAULT 'member',
	"joined_at" timestamp DEFAULT now(),
	"is_active" boolean DEFAULT true,
	CONSTRAINT "room_members_room_id_user_id_pk" PRIMARY KEY("room_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "rooms" (
	"id" serial PRIMARY KEY NOT NULL,
	"zikir_id" integer NOT NULL,
	"owner_id" varchar NOT NULL,
	"name" varchar(255),
	"description" text,
	"target_count" integer,
	"unlimited" boolean DEFAULT false,
	"duration" integer NOT NULL,
	"is_public" boolean DEFAULT true,
	"country" varchar,
	"picture_url" varchar,
	"start_date" timestamp DEFAULT now(),
	"end_date" timestamp,
	"is_active" boolean DEFAULT true,
	"prize_description" text,
	"competition_type" varchar DEFAULT 'regular',
	"competition_start_date" timestamp,
	"competition_end_date" timestamp,
	"max_participants" integer,
	"level_required" integer DEFAULT 1,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "seasonal_competition_participants" (
	"id" serial PRIMARY KEY NOT NULL,
	"competition_id" integer NOT NULL,
	"user_id" varchar NOT NULL,
	"registered_at" timestamp DEFAULT now(),
	"total_count" integer DEFAULT 0,
	"last_count_at" timestamp,
	"is_active" boolean DEFAULT true,
	"rank" integer,
	"badges_earned" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "seasonal_competitions" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"season" varchar(50) NOT NULL,
	"season_year" integer NOT NULL,
	"zikir_id" integer NOT NULL,
	"target_count" integer,
	"unlimited" boolean DEFAULT false,
	"prize_description" text,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"registration_start_date" timestamp NOT NULL,
	"registration_end_date" timestamp NOT NULL,
	"max_participants" integer,
	"is_active" boolean DEFAULT true,
	"is_global" boolean DEFAULT true,
	"country" varchar,
	"special_rewards" jsonb,
	"background_image" varchar,
	"theme_color" varchar DEFAULT '#4a90e2',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"sid" varchar PRIMARY KEY NOT NULL,
	"sess" jsonb NOT NULL,
	"expire" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tasbih_skins" (
	"id" varchar PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"rarity" varchar NOT NULL,
	"price_coins" integer NOT NULL,
	"preview_url" varchar,
	"thumb_url" varchar,
	"status" varchar DEFAULT 'active' NOT NULL,
	"animation_type" varchar,
	"description" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_achievement_badges" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"badge_id" integer NOT NULL,
	"earned_at" timestamp DEFAULT now(),
	"season_earned" varchar,
	"season_year" integer,
	"related_competition_id" integer,
	"metadata" jsonb
);
--> statement-breakpoint
CREATE TABLE "user_analytics" (
	"user_id" varchar PRIMARY KEY NOT NULL,
	"current_streak" integer DEFAULT 0,
	"longest_streak" integer DEFAULT 0,
	"total_zikir" integer DEFAULT 0,
	"completed_rooms" integer DEFAULT 0,
	"last_active_date" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_badges" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"badge_id" varchar NOT NULL,
	"earned_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_inventory" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"tasbih_skin_id" varchar NOT NULL,
	"purchased_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_islamic_practices" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"practice_id" varchar NOT NULL,
	"completed_at" timestamp DEFAULT now(),
	"practice_date" timestamp DEFAULT now(),
	"current_streak" integer DEFAULT 1,
	"longest_streak" integer DEFAULT 1,
	"total_completions" integer DEFAULT 1
);
--> statement-breakpoint
CREATE TABLE "user_org_profiles" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"org_id" varchar NOT NULL,
	"level" integer DEFAULT 1,
	"stats" jsonb DEFAULT '{"wins":0,"podiums":0,"top10":0,"comps":0}',
	"history" jsonb DEFAULT '[]',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_promotion_counters" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"level" integer NOT NULL,
	"top3" integer DEFAULT 0,
	"top5" integer DEFAULT 0,
	"top10" integer DEFAULT 0,
	"total_comps" integer DEFAULT 0,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_purchases" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"type" varchar NOT NULL,
	"sku" varchar,
	"coins_delta" integer,
	"amount_currency" varchar,
	"amount_cents" integer,
	"provider" varchar,
	"item_id" varchar,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_quest_progress" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"quest_id" varchar NOT NULL,
	"current_progress" integer DEFAULT 0,
	"target_value" integer NOT NULL,
	"is_completed" boolean DEFAULT false,
	"completed_at" timestamp,
	"quest_date" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_room_configs" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"room_id" integer NOT NULL,
	"equipped_tasbih_skin_id" varchar,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_room_purchases" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"item_type" varchar(100) NOT NULL,
	"item_id" varchar(100) NOT NULL,
	"cost_usd" integer NOT NULL,
	"purchased_at" timestamp DEFAULT now(),
	"is_active" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE "user_wallets" (
	"user_id" varchar PRIMARY KEY NOT NULL,
	"coins" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" varchar,
	"email" varchar,
	"phone" varchar,
	"password" varchar,
	"first_name" varchar,
	"last_name" varchar,
	"profile_image_url" varchar,
	"country" varchar DEFAULT 'Bangladesh',
	"avatar_type" varchar DEFAULT 'male-1',
	"bg_color" varchar DEFAULT 'green',
	"signup_method" varchar DEFAULT 'username',
	"is_verified" boolean DEFAULT false,
	"user_type" varchar DEFAULT 'regular',
	"organization_name" varchar,
	"organization_logo" varchar,
	"organization_description" text,
	"allow_join_lower_levels" boolean DEFAULT true,
	"verified" boolean DEFAULT false,
	"spiritual_points" integer DEFAULT 0,
	"zikir_coins" integer DEFAULT 0,
	"daily_blessing_points" integer DEFAULT 0,
	"user_level" integer DEFAULT 1,
	"room_creation_limit" integer DEFAULT 1,
	"last_daily_reward" timestamp,
	"total_rooms_created" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_phone_unique" UNIQUE("phone")
);
--> statement-breakpoint
CREATE TABLE "zikirs" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"arabic_text" text,
	"transliteration" text,
	"translation" text,
	"fazilat" text,
	"references" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE INDEX "IDX_session_expire" ON "sessions" USING btree ("expire");