import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Coins, 
  Star, 
  Trophy, 
  Flame, 
  BookOpen, 
  Clock, 
  Target, 
  CheckCircle,
  Lock,
  Crown,
  Gem
} from 'lucide-react';
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { LevelLearningInterface } from "@/components/level-learning-interface";

// Comprehensive Dhikr Database for Dynamic Level Generation
const dhikriDatabase = [
  // Foundation Levels (1-10)
  { id: 1, category: "Basic", arabic: "سُبْحَانَ اللَّهِ", transliteration: "Subhan Allah", meaning: "Glory to Allah", count: 33, coins: 10, experience: 25 },
  { id: 2, category: "Basic", arabic: "الْحَمْدُ لِلَّهِ", transliteration: "Alhamdulillah", meaning: "Praise to Allah", count: 33, coins: 10, experience: 25 },
  { id: 3, category: "Basic", arabic: "اللَّهُ أَكْبَرُ", transliteration: "Allahu Akbar", meaning: "Allah is Greatest", count: 34, coins: 10, experience: 25 },
  { id: 4, category: "Basic", arabic: "لَا إِلَهَ إِلَّا اللَّهُ", transliteration: "La ilaha illa Allah", meaning: "No god but Allah", count: 100, coins: 15, experience: 35 },
  { id: 5, category: "Basic", arabic: "أَسْتَغْفِرُ اللَّهَ", transliteration: "Astaghfirullah", meaning: "I seek forgiveness from Allah", count: 100, coins: 15, experience: 35 },
  
  // Morning Dhikr (6-15)
  { id: 6, category: "Morning", arabic: "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ", transliteration: "Asbahna wa asbahal mulku lillah", meaning: "We enter morning and the dominion belongs to Allah", count: 1, coins: 20, experience: 50 },
  { id: 7, category: "Morning", arabic: "اللَّهُمَّ أَنْتَ رَبِّي", transliteration: "Allahumma anta rabbi", meaning: "O Allah, You are my Lord", count: 1, coins: 20, experience: 50 },
  { id: 8, category: "Morning", arabic: "حَسْبِيَ اللَّهُ لَا إِلَهَ إِلَّا هُوَ", transliteration: "Hasbiyallahu la ilaha illa huwa", meaning: "Allah is sufficient for me, none has the right to be worshipped except Him", count: 7, coins: 25, experience: 60 },
  
  // Evening Dhikr (9-18)
  { id: 9, category: "Evening", arabic: "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ", transliteration: "Amsayna wa amsal mulku lillah", meaning: "We enter evening and the dominion belongs to Allah", count: 1, coins: 20, experience: 50 },
  { id: 10, category: "Evening", arabic: "اللَّهُمَّ بِكَ أَمْسَيْنَا", transliteration: "Allahumma bika amsayna", meaning: "O Allah, by You we enter the evening", count: 1, coins: 20, experience: 50 },
  
  // Post-Prayer Dhikr (11-25)
  { id: 11, category: "Post-Prayer", arabic: "سُبْحَانَ رَبِّيَ الْعَظِيمِ", transliteration: "Subhana rabbiyal azeem", meaning: "Glory to my Lord, the Great", count: 33, coins: 15, experience: 40 },
  { id: 12, category: "Post-Prayer", arabic: "سُبْحَانَ رَبِّيَ الْأَعْلَى", transliteration: "Subhana rabbiyal a'la", meaning: "Glory to my Lord, the Most High", count: 33, coins: 15, experience: 40 },
  
  // Difficult Situations (26-35)
  { id: 13, category: "Hardship", arabic: "حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ", transliteration: "Hasbunallahu wa ni'mal wakeel", meaning: "Allah is sufficient for us and He is the best disposer of affairs", count: 7, coins: 30, experience: 75 },
  { id: 14, category: "Hardship", arabic: "إِنَّا لِلَّهِ وَإِنَّا إِلَيْهِ رَاجِعُونَ", transliteration: "Inna lillahi wa inna ilayhi raji'un", meaning: "Indeed we belong to Allah, and indeed to Him we will return", count: 1, coins: 25, experience: 60 },
  
  // Gratitude & Joy (36-45)
  { id: 15, category: "Gratitude", arabic: "اللَّهُمَّ لَكَ الْحَمْدُ", transliteration: "Allahumma lakal hamd", meaning: "O Allah, all praise is for You", count: 10, coins: 20, experience: 50 },
  
  // Advanced Spiritual (46-50)
  { id: 16, category: "Advanced", arabic: "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ", transliteration: "La hawla wa la quwwata illa billah", meaning: "There is no power except with Allah", count: 100, coins: 40, experience: 100 }
];

// Badge System
const badgeCategories = [
  {
    name: "Beginner Seeker",
    icon: "🌱",
    description: "Complete first 5 dhikr levels",
    requirement: "levels_completed >= 5",
    coins: 100,
    color: "bg-green-500"
  },
  {
    name: "Morning Devotee", 
    icon: "🌅",
    description: "Complete 7 consecutive morning dhikr",
    requirement: "morning_streak >= 7",
    coins: 150,
    color: "bg-orange-500"
  },
  {
    name: "Evening Worshipper",
    icon: "🌙", 
    description: "Complete 7 consecutive evening dhikr",
    requirement: "evening_streak >= 7",
    coins: 150,
    color: "bg-purple-500"
  },
  {
    name: "Consistency Master",
    icon: "🔥",
    description: "Maintain 30-day streak",
    requirement: "daily_streak >= 30",
    coins: 500,
    color: "bg-red-500"
  },
  {
    name: "Community Helper",
    icon: "🤝",
    description: "Help 10 users learn dhikr",
    requirement: "helped_users >= 10",
    coins: 300,
    color: "bg-blue-500"
  }
];

interface ProgressionSystemProps {
  onStartLevel: (levelId: number) => void;
}

export function SpiritualProgressionSystem({ onStartLevel }: ProgressionSystemProps) {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [activeLevelId, setActiveLevelId] = useState<number | null>(null);

  const { data: gamificationData } = useQuery({
    queryKey: ["/api/user/gamification"],
    enabled: !!user,
  });

  const { data: progressData = {} } = useQuery({
    queryKey: ["/api/user/spiritual-progress"],
    enabled: !!user,
  });

  // Dynamic Level Generation
  const generateLevels = () => {
    return dhikriDatabase.map((dhikr, index) => ({
      id: dhikr.id,
      title: `Level ${dhikr.id}: ${dhikr.transliteration}`,
      category: dhikr.category,
      dhikr: dhikr,
      isUnlocked: index === 0 || ((progressData as any)?.completedLevels || []).includes(dhikr.id - 1),
      isCompleted: ((progressData as any)?.completedLevels || []).includes(dhikr.id),
      progress: (progressData as any)?.[`level_${dhikr.id}_progress`] || 0,
      tasks: [
        {
          type: "learn",
          title: "Learn Meaning",
          description: `Understand the meaning: "${dhikr.meaning}"`,
          completed: (progressData as any)?.[`level_${dhikr.id}_meaning_learned`] || false,
          coins: Math.floor(dhikr.coins * 0.3)
        },
        {
          type: "practice", 
          title: "Practice with Reflection",
          description: `Recite ${dhikr.count} times with contemplation (minimum 5 minutes)`,
          completed: (progressData as any)?.[`level_${dhikr.id}_practiced`] || false,
          coins: Math.floor(dhikr.coins * 0.5)
        },
        {
          type: "quiz",
          title: "Knowledge Check",
          description: "Complete matching game and pronunciation test",
          completed: (progressData as any)?.[`level_${dhikr.id}_quiz_passed`] || false,
          coins: Math.floor(dhikr.coins * 0.2)
        }
      ]
    }));
  };

  const levels = generateLevels();
  const currentLevel = levels.find(level => !level.isCompleted) || levels[0];
  const completedLevels = levels.filter(level => level.isCompleted).length;

  // Currency Display
  const barakahCoins = (gamificationData as any)?.barakahCoins || 0;
  const noorGems = (gamificationData as any)?.noorGems || 0;
  const currentStreak = (progressData as any)?.currentStreak || 0;
  const totalExperience = (gamificationData as any)?.experience || 0;

  // Filter levels by category
  const filteredLevels = selectedCategory === "all" 
    ? levels 
    : levels.filter(level => level.category.toLowerCase() === selectedCategory.toLowerCase());

  return (
    <div className="space-y-6">
      {/* Currency & Progress Overview */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Coins className="w-5 h-5" />
                  <span className="font-semibold">Barakah Coins</span>
                </div>
                <div className="text-2xl font-bold">{barakahCoins.toLocaleString()}</div>
              </div>
              <div className="text-right text-sm opacity-90">
                <div>Earned through dhikr</div>
                <div>practice & learning</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-blue-400 to-blue-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Gem className="w-5 h-5" />
                  <span className="font-semibold">Noor Gems</span>
                </div>
                <div className="text-2xl font-bold">{noorGems}</div>
              </div>
              <div className="text-right text-sm opacity-90">
                <div>Special achievements</div>
                <div>& community help</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Streak & Level Progress */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="flex items-center justify-center gap-1 mb-1">
                <Flame className="w-4 h-4 text-orange-500" />
                <span className="font-semibold text-sm">Current Streak</span>
              </div>
              <div className="text-xl font-bold">{currentStreak} days</div>
            </div>
            <div>
              <div className="flex items-center justify-center gap-1 mb-1">
                <Trophy className="w-4 h-4 text-purple-500" />
                <span className="font-semibold text-sm">Levels Complete</span>
              </div>
              <div className="text-xl font-bold">{completedLevels}/{levels.length}</div>
            </div>
            <div>
              <div className="flex items-center justify-center gap-1 mb-1">
                <Star className="w-4 h-4 text-blue-500" />
                <span className="font-semibold text-sm">Experience</span>
              </div>
              <div className="text-xl font-bold">{totalExperience}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* How Coins Are Earned */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-800 flex items-center gap-2">
            <Coins className="w-5 h-5" />
            How to Earn Barakah Coins
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="grid grid-cols-1 gap-3 text-sm">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">1</div>
              <span><strong>Learning:</strong> Study dhikr meanings and pronunciation (+5-15 coins)</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">2</div>
              <span><strong>Practice:</strong> Complete dhikr with proper reflection time (+10-25 coins)</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">3</div>
              <span><strong>Consistency:</strong> Daily streak bonuses (+50-100 coins)</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold">4</div>
              <span><strong>Community:</strong> Help others learn dhikr (+25-50 coins)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {["all", "basic", "morning", "evening", "post-prayer", "hardship", "gratitude", "advanced"].map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(category)}
            className="whitespace-nowrap capitalize"
          >
            {category.replace("-", " ")}
          </Button>
        ))}
      </div>

      {/* Levels Grid */}
      <div className="space-y-4">
        {filteredLevels.map((level) => (
          <Card key={level.id} className={`${level.isCompleted ? 'bg-green-50 border-green-200' : level.isUnlocked ? '' : 'opacity-50'}`}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold">{level.title}</h4>
                    {level.isCompleted && <CheckCircle className="w-5 h-5 text-green-600" />}
                    {!level.isUnlocked && <Lock className="w-5 h-5 text-gray-400" />}
                    <Badge variant="outline" className="text-xs">
                      {level.category}
                    </Badge>
                  </div>
                  
                  <div className="bg-gray-50 p-3 rounded-lg mb-3">
                    <div className="text-lg font-amiri text-center mb-1">{level.dhikr.arabic}</div>
                    <div className="text-sm text-gray-600 text-center">{level.dhikr.transliteration}</div>
                    <div className="text-xs text-gray-500 text-center italic">"{level.dhikr.meaning}"</div>
                  </div>
                </div>
              </div>

              {/* Tasks Progress */}
              <div className="space-y-2 mb-4">
                {level.tasks.map((task, index) => (
                  <div key={index} className={`flex items-center justify-between p-2 rounded ${task.completed ? 'bg-green-100' : 'bg-gray-100'}`}>
                    <div className="flex items-center gap-2">
                      {task.completed ? <CheckCircle className="w-4 h-4 text-green-600" /> : <Clock className="w-4 h-4 text-gray-400" />}
                      <div>
                        <div className="text-sm font-medium">{task.title}</div>
                        <div className="text-xs text-gray-600">{task.description}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs">
                      <Coins className="w-3 h-3 text-yellow-500" />
                      {task.coins}
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Button */}
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Total Reward: <span className="font-semibold">{level.dhikr.coins} coins + {level.dhikr.experience} XP</span>
                </div>
                
                {level.isUnlocked && !level.isCompleted && (
                  <Button 
                    onClick={() => setActiveLevelId(level.id)}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Start Level
                  </Button>
                )}
                
                {level.isCompleted && (
                  <Badge variant="default" className="bg-green-600">
                    Completed
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Available Badges */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Achievement Badges
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3">
            {badgeCategories.map((badge, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 ${badge.color} rounded-full flex items-center justify-center text-white text-lg`}>
                    {badge.icon}
                  </div>
                  <div>
                    <div className="font-semibold">{badge.name}</div>
                    <div className="text-sm text-gray-600">{badge.description}</div>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <Coins className="w-4 h-4 text-yellow-500" />
                  {badge.coins}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Level Learning Interface */}
      {activeLevelId && (
        <LevelLearningInterface
          levelData={dhikriDatabase.find(d => d.id === activeLevelId)!}
          isOpen={!!activeLevelId}
          onClose={() => setActiveLevelId(null)}
          onComplete={() => {
            // Refresh data after completion
            window.location.reload();
          }}
        />
      )}
    </div>
  );
}