import { db } from "./db";
import { 
  levelConfiguration, 
  currencyConfiguration, 
  badgeConfiguration,
  userBadges,
  questConfiguration,
  userQuestProgress,
  islamicPracticeConfiguration,
  userIslamicPractices,
  users 
} from "@shared/schema";
import { sql, eq, and, desc, asc } from "drizzle-orm";

// ===== LEVEL MANAGEMENT =====

export async function initializeDefaultLevels() {
  try {
    // Check if levels already exist
    const existingLevels = await db.select().from(levelConfiguration).limit(1);
    if (existingLevels.length > 0) {
      return; // Levels already initialized
    }

    // Initialize default 50-level system
    const defaultLevels = [];
    for (let level = 1; level <= 50; level++) {
      let titleEn = "";
      let titleAr = "";
      let roomLimit = 1;
      
      if (level <= 10) {
        titleEn = `Seeker ${level}`;
        titleAr = `مطلب ${level}`;
        roomLimit = 1;
      } else if (level <= 20) {
        titleEn = `Devoted ${level}`;
        titleAr = `متدين ${level}`;
        roomLimit = 2;
      } else if (level <= 30) {
        titleEn = `Committed ${level}`;
        titleAr = `ملتزم ${level}`;
        roomLimit = 3;
      } else if (level <= 40) {
        titleEn = `Guide ${level}`;
        titleAr = `مرشد ${level}`;
        roomLimit = 4;
      } else {
        titleEn = `Master ${level}`;
        titleAr = `أستاذ ${level}`;
        roomLimit = 5;
      }

      defaultLevels.push({
        level,
        titleEn,
        titleAr,
        pointsRequired: Math.pow(level - 1, 2) * 100, // Exponential growth
        roomCreationLimit: roomLimit,
        coinMultiplier: Math.min(100 + ((level - 1) * 5), 300), // 1.0x to 3.0x
        specialFeatures: [],
        unlockMessage: `Congratulations! You've reached ${titleEn}!`,
      });
    }

    await db.insert(levelConfiguration).values(defaultLevels);
    console.log('✅ Initialized 50-level system');
  } catch (error) {
    console.error('Error initializing levels:', error);
  }
}

export async function initializeDefaultCurrency() {
  try {
    // Check if currency config already exists
    const existing = await db.select().from(currencyConfiguration).limit(1);
    if (existing.length > 0) {
      return;
    }

    const defaultCurrency = [
      {
        activityType: 'zikir_count',
        basePoints: 1,
        multiplier: 100,
        levelRequirement: 1,
        seasonalBonus: 100,
        isActive: true,
      },
      {
        activityType: 'daily_login',
        basePoints: 25,
        multiplier: 100,
        levelRequirement: 1,
        seasonalBonus: 100,
        isActive: true,
      },
      {
        activityType: 'competition_join',
        basePoints: 50,
        multiplier: 100,
        levelRequirement: 1,
        seasonalBonus: 150,
        isActive: true,
      },
      {
        activityType: 'islamic_practice',
        basePoints: 100,
        multiplier: 100,
        levelRequirement: 1,
        seasonalBonus: 200,
        isActive: true,
      },
    ];

    await db.insert(currencyConfiguration).values(defaultCurrency);
    console.log('✅ Initialized currency configuration');
  } catch (error) {
    console.error('Error initializing currency:', error);
  }
}

export async function initializeDefaultBadges() {
  try {
    const existing = await db.select().from(badgeConfiguration).limit(1);
    if (existing.length > 0) {
      return;
    }

    const defaultBadges = [
      {
        badgeId: 'first_steps',
        nameEn: 'First Steps',
        nameAr: 'الخطوات الأولى',
        description: 'Complete your first 50 zikir',
        category: 'zikir',
        criteriaType: 'zikir_count',
        targetValue: 50,
        pointsReward: 25,
        coinsReward: 25,
        isActive: true,
      },
      {
        badgeId: 'daily_devotion',
        nameEn: 'Daily Devotion',
        nameAr: 'الإخلاص اليومي',
        description: 'Login for 3 consecutive days',
        category: 'consistency',
        criteriaType: 'login_streak',
        targetValue: 3,
        pointsReward: 50,
        coinsReward: 50,
        isActive: true,
      },
      {
        badgeId: 'century_achiever',
        nameEn: 'Century Achiever',
        nameAr: 'المئوي',
        description: 'Complete 100 zikir in one session',
        category: 'zikir',
        criteriaType: 'session_zikir',
        targetValue: 100,
        pointsReward: 75,
        coinsReward: 75,
        isActive: true,
      },
      {
        badgeId: 'community_member',
        nameEn: 'Community Member',
        nameAr: 'عضو المجتمع',
        description: 'Join your first competition',
        category: 'community',
        criteriaType: 'competition_join',
        targetValue: 1,
        pointsReward: 100,
        coinsReward: 100,
        isActive: true,
      },
      {
        badgeId: 'streak_keeper',
        nameEn: 'Streak Keeper',
        nameAr: 'حافظ السلسلة',
        description: 'Maintain 7-day activity streak',
        category: 'consistency',
        criteriaType: 'activity_streak',
        targetValue: 7,
        pointsReward: 150,
        coinsReward: 150,
        isActive: true,
      },
    ];

    await db.insert(badgeConfiguration).values(defaultBadges);
    console.log('✅ Initialized default badges');
  } catch (error) {
    console.error('Error initializing badges:', error);
  }
}

export async function initializeDefaultQuests() {
  try {
    const existing = await db.select().from(questConfiguration).limit(1);
    if (existing.length > 0) {
      return;
    }

    const defaultQuests = [
      {
        questId: 'morning_zikir',
        nameEn: 'Morning Devotion',
        nameAr: 'دعاء الصباح',
        description: 'Complete 50 zikir before 10 AM',
        questType: 'zikir',
        targetValue: 50,
        timeLimit: 'before_10am',
        pointsReward: 20,
        bonusMultiplier: 100,
        minLevel: 1,
        maxLevel: 50,
        isActive: true,
      },
      {
        questId: 'consistency_practice',
        nameEn: 'Consistent Practice',
        nameAr: 'الممارسة المستمرة',
        description: 'Complete 3 separate zikir sessions',
        questType: 'zikir',
        targetValue: 3,
        timeLimit: 'all_day',
        pointsReward: 25,
        bonusMultiplier: 100,
        minLevel: 1,
        maxLevel: 50,
        isActive: true,
      },
      {
        questId: 'community_visit',
        nameEn: 'Community Engagement',
        nameAr: 'المشاركة المجتمعية',
        description: 'Visit leaderboard or rooms page',
        questType: 'community',
        targetValue: 1,
        timeLimit: 'all_day',
        pointsReward: 10,
        bonusMultiplier: 100,
        minLevel: 1,
        maxLevel: 50,
        isActive: true,
      },
      {
        questId: 'daily_devotion',
        nameEn: 'Daily Devotion',
        nameAr: 'الإخلاص اليومي',
        description: 'Complete 200 total zikir today',
        questType: 'zikir',
        targetValue: 200,
        timeLimit: 'all_day',
        pointsReward: 40,
        bonusMultiplier: 100,
        minLevel: 5,
        maxLevel: 50,
        isActive: true,
      },
    ];

    await db.insert(questConfiguration).values(defaultQuests);
    console.log('✅ Initialized default quests');
  } catch (error) {
    console.error('Error initializing quests:', error);
  }
}

export async function initializeDefaultIslamicPractices() {
  try {
    const existing = await db.select().from(islamicPracticeConfiguration).limit(1);
    if (existing.length > 0) {
      return;
    }

    const defaultPractices = [
      {
        practiceId: 'surah_kahf',
        nameEn: 'Surah Al-Kahf (Friday)',
        nameAr: 'سورة الكهف (الجمعة)',
        description: 'Recite Surah Al-Kahf on Friday for spiritual protection and guidance',
        recommendedTime: 'friday_only',
        pointsReward: 100,
        streakBonus: 10,
        verificationType: 'self_confirmation',
        isActive: true,
      },
      {
        practiceId: 'surah_mulk',
        nameEn: 'Surah Al-Mulk (Night)',
        nameAr: 'سورة الملك (الليل)',
        description: 'Recite Surah Al-Mulk at night for protection from the grave',
        recommendedTime: 'night_time',
        pointsReward: 75,
        streakBonus: 8,
        verificationType: 'self_confirmation',
        isActive: true,
      },
      {
        practiceId: 'sayyidul_istighfar',
        nameEn: 'Sayyidul Istighfar',
        nameAr: 'سيد الاستغفار',
        description: 'Recite the master supplication for seeking forgiveness',
        recommendedTime: 'any_time',
        pointsReward: 50,
        streakBonus: 5,
        verificationType: 'self_confirmation',
        isActive: true,
      },
      {
        practiceId: 'daily_prayers',
        nameEn: 'Five Daily Prayers',
        nameAr: 'الصلوات الخمس',
        description: 'Complete all five daily prayers',
        recommendedTime: 'all_day',
        pointsReward: 200,
        streakBonus: 20,
        verificationType: 'self_confirmation',
        isActive: true,
      },
    ];

    await db.insert(islamicPracticeConfiguration).values(defaultPractices);
    console.log('✅ Initialized Islamic practices');
  } catch (error) {
    console.error('Error initializing Islamic practices:', error);
  }
}

// ===== LEVEL CALCULATION =====

export function calculateUserLevel(spiritualPoints: number): number {
  // Find the highest level the user qualifies for
  let level = 1;
  while (level < 50) {
    const nextLevelPoints = Math.pow(level, 2) * 100;
    if (spiritualPoints >= nextLevelPoints) {
      level++;
    } else {
      break;
    }
  }
  return level;
}

export function getPointsForNextLevel(currentLevel: number): number {
  if (currentLevel >= 50) return 0;
  return Math.pow(currentLevel, 2) * 100;
}

// ===== COIN & POINTS EARNING =====

export async function awardPoints(
  userId: string, 
  activityType: string, 
  baseAmount: number = 1,
  multiplier: number = 1
): Promise<void> {
  try {
    // Get currency configuration
    const config = await db
      .select()
      .from(currencyConfiguration)
      .where(eq(currencyConfiguration.activityType, activityType))
      .limit(1);

    let points = baseAmount;
    if (config.length > 0) {
      points = config[0].basePoints || baseAmount;
      multiplier = (config[0].multiplier / 100) * multiplier;
    }

    const finalPoints = Math.floor(points * multiplier);

    // Award points and coins
    await db.execute(sql`
      UPDATE users 
      SET 
        spiritual_points = COALESCE(spiritual_points, 0) + ${finalPoints},
        zikir_coins = COALESCE(zikir_coins, 0) + ${Math.floor(finalPoints * 0.5)}
      WHERE id = ${userId}
    `);

    // Update user level if needed
    const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (user.length > 0) {
      const newLevel = calculateUserLevel(user[0].spiritualPoints || 0);
      if (newLevel > (user[0].userLevel || 1)) {
        await db.execute(sql`
          UPDATE users SET user_level = ${newLevel} WHERE id = ${userId}
        `);
        
        // Award level up bonus
        await awardPoints(userId, 'level_up', newLevel * 10);
      }
    }
  } catch (error) {
    console.error('Error awarding points:', error);
  }
}

// ===== BADGE CHECKING =====

export async function checkAndAwardBadges(userId: string): Promise<string[]> {
  try {
    const newBadges: string[] = [];
    
    // Get all active badges user doesn't have
    const availableBadges = await db.execute(sql`
      SELECT bc.*
      FROM badge_configuration bc
      LEFT JOIN user_badges ub ON bc.badge_id = ub.badge_id AND ub.user_id = ${userId}
      WHERE bc.is_active = true AND ub.badge_id IS NULL
    `);

    // Get user stats
    const userStats = await db.execute(sql`
      SELECT 
        u.spiritual_points, u.zikir_coins, u.user_level,
        ua.total_zikir, ua.current_streak, ua.longest_streak,
        ua.total_sessions
      FROM users u
      LEFT JOIN user_analytics ua ON u.id = ua.user_id
      WHERE u.id = ${userId}
    `);

    if (userStats.rows && userStats.rows.length > 0) {
      const stats = userStats.rows[0] as any;

      for (const badge of availableBadges.rows || []) {
        const badgeData = badge as any;
        let qualifies = false;

        switch (badgeData.criteria_type) {
          case 'zikir_count':
            qualifies = (stats.total_zikir || 0) >= badgeData.target_value;
            break;
          case 'login_streak':
            qualifies = (stats.current_streak || 0) >= badgeData.target_value;
            break;
          case 'session_zikir':
            // This would need session tracking
            qualifies = false;
            break;
          case 'competition_join':
            // This would need competition tracking
            qualifies = false;
            break;
          case 'activity_streak':
            qualifies = (stats.longest_streak || 0) >= badgeData.target_value;
            break;
        }

        if (qualifies) {
          await db.insert(userBadges).values({
            userId,
            badgeId: badgeData.badge_id,
          });
          
          // Award badge rewards
          if (badgeData.points_reward > 0 || badgeData.coins_reward > 0) {
            await db.execute(sql`
              UPDATE users 
              SET 
                spiritual_points = COALESCE(spiritual_points, 0) + ${badgeData.points_reward || 0},
                zikir_coins = COALESCE(zikir_coins, 0) + ${badgeData.coins_reward || 0}
              WHERE id = ${userId}
            `);
          }

          newBadges.push(badgeData.badge_id);
        }
      }
    }

    return newBadges;
  } catch (error) {
    console.error('Error checking badges:', error);
    return [];
  }
}

// Initialize all default data
export async function initializeGamificationSystem() {
  await initializeDefaultLevels();
  await initializeDefaultCurrency();
  await initializeDefaultBadges();
  await initializeDefaultQuests();
  await initializeDefaultIslamicPractices();
  console.log('✅ Gamification system initialized');
}