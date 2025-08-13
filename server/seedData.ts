import { storage } from "./storage";

export async function seedDatabase() {
  console.log("Seeding database with initial data...");

  // 1. Seed Zikirs
  const zikirs = [
    {
      name: "Tasbih",
      arabicText: "سُبْحَانَ اللَّهِ",
      transliteration: "Subhan Allah",
      translation: "Glory be to Allah",
      fazilat: "Removes sins like leaves fall from tree",
      references: "Sahih Muslim"
    },
    {
      name: "Tahmid", 
      arabicText: "الْحَمْدُ لِلَّهِ",
      transliteration: "Alhamdulillah",
      translation: "All praise is for Allah",
      fazilat: "Fills the scales of good deeds",
      references: "Sahih Muslim"
    },
    {
      name: "Takbir",
      arabicText: "اللَّهُ أَكْبَرُ", 
      transliteration: "Allahu Akbar",
      translation: "Allah is the Greatest",
      fazilat: "Beloved to Allah",
      references: "Sahih Bukhari"
    },
    {
      name: "Tahlil",
      arabicText: "لَا إِلَهَ إِلَّا اللَّهُ",
      transliteration: "La ilaha illa Allah", 
      translation: "There is no god but Allah",
      fazilat: "Best of dhikr",
      references: "Tirmidhi"
    },
    {
      name: "Istighfar",
      arabicText: "أَسْتَغْفِرُ اللَّهَ",
      transliteration: "Astaghfirullah",
      translation: "I seek forgiveness from Allah",
      fazilat: "Opens doors of mercy", 
      references: "Abu Dawud"
    },
    {
      name: "Salawat",
      arabicText: "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ",
      transliteration: "Allahumma salli ala Muhammad",
      translation: "O Allah, send blessings upon Muhammad",
      fazilat: "Ten blessings from Allah",
      references: "Sahih Muslim"
    },
    {
      name: "Hawqala", 
      arabicText: "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ",
      transliteration: "La hawla wa la quwwata illa billah",
      translation: "There is no power except with Allah", 
      fazilat: "Treasure from Paradise",
      references: "Sahih Bukhari"
    },
    {
      name: "Hasbi Allah",
      arabicText: "حَسْبِيَ اللَّهُ وَنِعْمَ الْوَكِيلُ",
      transliteration: "Hasbi Allahu wa ni'mal wakeel",
      translation: "Allah is sufficient for me",
      fazilat: "Protection from enemies",
      references: "Sahih Bukhari"
    }
  ];

  // Seed zikirs
  for (const zikir of zikirs) {
    try {
      await storage.createZikir(zikir);
    } catch (error) {
      console.log(`Zikir ${zikir.name} already exists or error:`, error);
    }
  }

  // 2. Seed 50 users
  const countries = ["Bangladesh", "Pakistan", "India", "Indonesia", "Malaysia", "Turkey", "Egypt", "Saudi Arabia"];
  const firstNames = ["Ahmed", "Muhammad", "Ali", "Hassan", "Omar", "Fatima", "Aisha", "Khadija", "Zainab", "Maryam"];
  const lastNames = ["Khan", "Ahmed", "Ali", "Hassan", "Rahman", "Islam", "Uddin", "Begum", "Khatun", "Akter"];

  for (let i = 1; i <= 50; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const country = countries[Math.floor(Math.random() * countries.length)];
    
    try {
      await storage.upsertUser({
        id: `user-${i}`,
        email: `user${i}@example.com`,
        firstName,
        lastName,
        country,
        profileImageUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=user${i}`,
        avatarType: Math.random() > 0.5 ? 'male-1' : 'female-1',
        bgColor: ['green', 'blue', 'purple', 'orange'][Math.floor(Math.random() * 4)]
      });
    } catch (error) {
      console.log(`User ${i} already exists or error:`, error);
    }
  }

  // 3. Create sample rooms with members  
  const allZikirs = await storage.getAllZikirs();
  if (allZikirs.length > 0) {
    for (let i = 1; i <= 10; i++) {
      const zikir = allZikirs[Math.floor(Math.random() * allZikirs.length)];
      const ownerId = `user-${Math.floor(Math.random() * 50) + 1}`;
      
      try {
        const room = await storage.createRoom({
          zikirId: zikir.id,
          ownerId,
          name: `${zikir.name} Challenge ${i}`,
          description: `Join us for ${zikir.name} dhikr challenge`,
          targetCount: [100, 500, 1000, 3300][Math.floor(Math.random() * 4)],
          unlimited: Math.random() > 0.7,
          duration: [1, 3, 7, 30, 40][Math.floor(Math.random() * 5)],
          isPublic: Math.random() > 0.3,
          country: countries[Math.floor(Math.random() * countries.length)]
        });

        // Add 3-8 random members to each room
        const memberCount = Math.floor(Math.random() * 6) + 3;
        const usedUserIds = new Set([ownerId]);
        
        for (let j = 0; j < memberCount; j++) {
          let memberId;
          do {
            memberId = `user-${Math.floor(Math.random() * 50) + 1}`;
          } while (usedUserIds.has(memberId));
          
          usedUserIds.add(memberId);
          
          try {
            await storage.joinRoom({
              roomId: room.id,
              userId: memberId,
              nickname: `Member ${j + 1}`
            });

            // Add some random counts for active rooms
            if (Math.random() > 0.5) {
              const randomCount = Math.floor(Math.random() * 200) + 1;
              for (let k = 0; k < randomCount; k++) {
                await storage.incrementCount(room.id, memberId);
              }
            }
          } catch (error) {
            console.log(`Error adding member to room ${room.id}:`, error);
          }
        }
      } catch (error) {
        console.log(`Room ${i} creation error:`, error);
      }
    }
  }

  console.log("Database seeding completed!");
}