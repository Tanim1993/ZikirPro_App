import { storage } from "./storage";

export async function seedSeasonalData() {
  try {
    console.log("🌙 Seeding seasonal competitions and achievement badges...");
    
    // Check if data already exists
    const existingCompetitions = await storage.getAllSeasonalCompetitions();
    const existingBadges = await storage.getAllAchievementBadges();
    
    if (existingCompetitions.length > 0 && existingBadges.length > 0) {
      console.log("✅ Seasonal data already exists, skipping seeding");
      return;
    }

    // Sample seasonal competitions
    const competitions = [
      {
        name: "Ramadan Blessing 2025",
        description: "Join millions of Muslims worldwide in this special Ramadan zikir competition. Earn rewards and blessings while strengthening your spiritual connection during this holy month.",
        season: "ramadan",
        seasonYear: 2025,
        zikirId: 1,
        targetCount: 1000,
        unlimited: false,
        prizeDescription: "Special Ramadan certificate, exclusive digital rewards, and spiritual recognition",
        startDate: new Date('2025-03-10T00:00:00Z'),
        endDate: new Date('2025-04-09T23:59:59Z'),
        registrationStartDate: new Date('2025-03-01T00:00:00Z'),
        registrationEndDate: new Date('2025-03-15T23:59:59Z'),
        maxParticipants: 10000,
        isActive: true,
        themeColor: "#8B5CF6",
        backgroundImage: "/seasonal/ramadan-bg.jpg"
      },
      {
        name: "Hajj Devotion Challenge",
        description: "Commemorate the sacred pilgrimage with intensive zikir sessions. Perfect for those preparing for or reflecting on the Hajj experience.",
        season: "hajj",
        seasonYear: 2025,
        zikirId: 2,
        targetCount: 2000,
        unlimited: false,
        prizeDescription: "Hajj preparation guide, spiritual mentorship session, and commemorative digital badge",
        startDate: new Date('2025-06-15T00:00:00Z'),
        endDate: new Date('2025-06-25T23:59:59Z'),
        registrationStartDate: new Date('2025-06-01T00:00:00Z'),
        registrationEndDate: new Date('2025-06-20T23:59:59Z'),
        maxParticipants: 5000,
        isActive: true,
        themeColor: "#10B981",
        backgroundImage: "/seasonal/hajj-bg.jpg"
      },
      {
        name: "Muharram Reflection",
        description: "Begin the Islamic New Year with contemplative zikir sessions. A time for spiritual renewal and increased devotion.",
        season: "muharram",
        seasonYear: 2025,
        zikirId: 3,
        unlimited: true,
        prizeDescription: "New Year spiritual planning guide and exclusive Muharram badge collection",
        startDate: new Date('2025-07-07T00:00:00Z'),
        endDate: new Date('2025-07-17T23:59:59Z'),
        registrationStartDate: new Date('2025-06-25T00:00:00Z'),
        registrationEndDate: new Date('2025-07-10T23:59:59Z'),
        maxParticipants: 3000,
        isActive: true,
        themeColor: "#3B82F6",
        backgroundImage: "/seasonal/muharram-bg.jpg"
      }
    ];

    for (const comp of competitions) {
      await storage.createSeasonalCompetition(comp);
    }

    // Sample achievement badges
    const badges = [
      // Milestone badges
      {
        name: "First Steps",
        description: "Complete your very first zikir session",
        category: "milestone",
        badgeType: "bronze",
        iconName: "star",
        iconColor: "#CD7F32",
        backgroundColor: "#FEF3E2",
        conditions: { totalCount: 1 },
        points: 10,
        rarity: "common"
      },
      {
        name: "Century Achiever",
        description: "Complete 100 zikir in a single session",
        category: "milestone",
        badgeType: "silver",
        iconName: "medal",
        iconColor: "#C0C0C0",
        backgroundColor: "#F8FAFC",
        conditions: { singleSessionCount: 100 },
        points: 25,
        rarity: "uncommon"
      },
      {
        name: "Thousand Blessing",
        description: "Reach 1000 total zikir across all sessions",
        category: "milestone",
        badgeType: "gold",
        iconName: "trophy",
        iconColor: "#FFD700",
        backgroundColor: "#FFFBEB",
        conditions: { totalCount: 1000 },
        points: 50,
        rarity: "rare"
      },
      {
        name: "Master of Devotion",
        description: "Complete 10,000 total zikir - a true dedication milestone",
        category: "milestone",
        badgeType: "platinum",
        iconName: "crown",
        iconColor: "#E5E7EB",
        backgroundColor: "#F9FAFB",
        conditions: { totalCount: 10000 },
        points: 200,
        rarity: "epic"
      },

      // Zikir performance badges
      {
        name: "Speed Reciter",
        description: "Complete 500 zikir in under 10 minutes",
        category: "zikir",
        badgeType: "silver",
        iconName: "award",
        iconColor: "#C0C0C0",
        backgroundColor: "#F1F5F9",
        conditions: { singleSessionCount: 500, timeLimit: 600 },
        points: 30,
        rarity: "uncommon"
      },
      {
        name: "Endurance Champion",
        description: "Maintain a session for over 30 minutes continuously",
        category: "zikir",
        badgeType: "gold",
        iconName: "gem",
        iconColor: "#FFD700",
        backgroundColor: "#FEF9C3",
        conditions: { sessionDuration: 1800 },
        points: 75,
        rarity: "rare"
      },

      // Streak badges
      {
        name: "Weekly Warrior",
        description: "Complete zikir sessions for 7 consecutive days",
        category: "streak",
        badgeType: "bronze",
        iconName: "star",
        iconColor: "#CD7F32",
        backgroundColor: "#FED7AA",
        conditions: { streakDays: 7 },
        points: 40,
        rarity: "common"
      },
      {
        name: "Monthly Master",
        description: "Maintain a 30-day consecutive streak",
        category: "streak",
        badgeType: "gold",
        iconName: "trophy",
        iconColor: "#FFD700",
        backgroundColor: "#FEF3C4",
        conditions: { streakDays: 30 },
        points: 150,
        rarity: "rare"
      },

      // Seasonal badges
      {
        name: "Ramadan Champion",
        description: "Finish in the top 10 of a Ramadan competition",
        category: "seasonal",
        badgeType: "platinum",
        iconName: "crown",
        iconColor: "#8B5CF6",
        backgroundColor: "#F3E8FF",
        seasonalOnly: true,
        availableSeason: "ramadan",
        conditions: { rank: 10 },
        points: 300,
        rarity: "legendary"
      },
      {
        name: "Hajj Pilgrim",
        description: "Participate and complete a Hajj seasonal competition",
        category: "seasonal",
        badgeType: "gold",
        iconName: "medal",
        iconColor: "#10B981",
        backgroundColor: "#ECFDF5",
        seasonalOnly: true,
        availableSeason: "hajj",
        conditions: { participation: true, completion: true },
        points: 200,
        rarity: "epic"
      },
      {
        name: "New Year Devotee",
        description: "Join and actively participate in Muharram competitions",
        category: "seasonal",
        badgeType: "silver",
        iconName: "award",
        iconColor: "#3B82F6",
        backgroundColor: "#EFF6FF",
        seasonalOnly: true,
        availableSeason: "muharram",
        conditions: { participation: true },
        points: 100,
        rarity: "rare"
      },

      // Social badges
      {
        name: "Community Member",
        description: "Join your first competition room",
        category: "social",
        badgeType: "bronze",
        iconName: "star",
        iconColor: "#CD7F32",
        backgroundColor: "#FEF2F2",
        conditions: { roomsJoined: 1 },
        points: 15,
        rarity: "common"
      },
      {
        name: "Room Leader",
        description: "Create and successfully run a competition room",
        category: "social",
        badgeType: "gold",
        iconName: "crown",
        iconColor: "#FFD700",
        backgroundColor: "#FFFBEB",
        conditions: { roomsCreated: 1, roomParticipants: 5 },
        points: 100,
        rarity: "rare"
      }
    ];

    for (const badge of badges) {
      await storage.createAchievementBadge(badge);
    }

    console.log(`✅ Successfully created ${competitions.length} seasonal competitions`);
    console.log(`✅ Successfully created ${badges.length} achievement badges`);
    console.log("🎉 Seasonal data seeding completed!");

  } catch (error) {
    console.error("❌ Error seeding seasonal data:", error);
    throw error;
  }
}