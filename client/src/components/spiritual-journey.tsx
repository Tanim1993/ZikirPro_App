import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BookOpen, 
  Clock, 
  Target, 
  Users, 
  Trophy, 
  Heart,
  Sun,
  Moon,
  CheckCircle,
  Lock,
  Star
} from 'lucide-react';
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";

interface SpiritualTask {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly' | 'seasonal';
  targetCount: number;
  currentCount: number;
  timeRequirement: number; // minutes
  isCompleted: boolean;
  reward: {
    barakahCoins: number;
    noorGems: number;
    experience: number;
  };
}

interface SpiritualLevel {
  id: number;
  name: string;
  arabicName: string;
  description: string;
  minExperience: number;
  tasks: SpiritualTask[];
  isUnlocked: boolean;
  color: string;
}

export function SpiritualJourney() {
  const { user } = useAuth();
  const [selectedLevel, setSelectedLevel] = useState<number>(1);

  const { data: gamificationData } = useQuery({
    queryKey: ["/api/user/gamification"],
    enabled: !!user,
  });

  const { data: journeyProgress } = useQuery({
    queryKey: ["/api/user/spiritual-journey"],
    enabled: !!user,
  });

  // Spiritual Journey Levels - Islamic Maqamat
  const spiritualLevels: SpiritualLevel[] = [
    {
      id: 1,
      name: "Seeker",
      arabicName: "طَالِب",
      description: "Beginning the path of remembrance",
      minExperience: 0,
      color: "from-green-400 to-green-600",
      isUnlocked: true,
      tasks: [
        {
          id: "morning-dhikr",
          title: "Morning Dhikr",
          description: "Complete morning remembrance after Fajr prayer",
          type: "daily",
          targetCount: 100,
          currentCount: journeyProgress?.morningDhikr || 0,
          timeRequirement: 10,
          isCompleted: (journeyProgress?.morningDhikr || 0) >= 100,
          reward: { barakahCoins: 25, noorGems: 5, experience: 50 }
        },
        {
          id: "evening-dhikr",
          title: "Evening Dhikr",
          description: "Complete evening remembrance after Maghrib prayer",
          type: "daily",
          targetCount: 100,
          currentCount: journeyProgress?.eveningDhikr || 0,
          timeRequirement: 10,
          isCompleted: (journeyProgress?.eveningDhikr || 0) >= 100,
          reward: { barakahCoins: 25, noorGems: 5, experience: 50 }
        },
        {
          id: "consistency-week",
          title: "Weekly Consistency",
          description: "Maintain daily dhikr for 7 consecutive days",
          type: "weekly",
          targetCount: 7,
          currentCount: journeyProgress?.weeklyStreak || 0,
          timeRequirement: 0,
          isCompleted: (journeyProgress?.weeklyStreak || 0) >= 7,
          reward: { barakahCoins: 100, noorGems: 20, experience: 200 }
        }
      ]
    },
    {
      id: 2,
      name: "Devoted",
      arabicName: "عَابِد",
      description: "Dedicated to regular worship",
      minExperience: 500,
      color: "from-blue-400 to-blue-600",
      isUnlocked: (gamificationData?.experience || 0) >= 500,
      tasks: [
        {
          id: "night-prayer",
          title: "Night Prayer (Tahajjud)",
          description: "Perform voluntary night prayer",
          type: "daily",
          targetCount: 1,
          currentCount: journeyProgress?.nightPrayer || 0,
          timeRequirement: 20,
          isCompleted: (journeyProgress?.nightPrayer || 0) >= 1,
          reward: { barakahCoins: 50, noorGems: 15, experience: 100 }
        },
        {
          id: "quran-daily",
          title: "Daily Quran",
          description: "Read at least 1 page of Quran with reflection",
          type: "daily",
          targetCount: 1,
          currentCount: journeyProgress?.dailyQuran || 0,
          timeRequirement: 15,
          isCompleted: (journeyProgress?.dailyQuran || 0) >= 1,
          reward: { barakahCoins: 40, noorGems: 10, experience: 80 }
        },
        {
          id: "dhikr-meaning",
          title: "Learn Dhikr Meanings",
          description: "Study the meaning of 10 different dhikr phrases",
          type: "weekly",
          targetCount: 10,
          currentCount: journeyProgress?.dhikriMeanings || 0,
          timeRequirement: 30,
          isCompleted: (journeyProgress?.dhikriMeanings || 0) >= 10,
          reward: { barakahCoins: 150, noorGems: 30, experience: 300 }
        }
      ]
    },
    {
      id: 3,
      name: "Spiritual Guide",
      arabicName: "مُرْشِد",
      description: "Guiding others on the path",
      minExperience: 1500,
      color: "from-purple-400 to-purple-600",
      isUnlocked: (gamificationData?.experience || 0) >= 1500,
      tasks: [
        {
          id: "teach-others",
          title: "Teach Others",
          description: "Help 5 new users complete their first dhikr session",
          type: "monthly",
          targetCount: 5,
          currentCount: journeyProgress?.helpedUsers || 0,
          timeRequirement: 0,
          isCompleted: (journeyProgress?.helpedUsers || 0) >= 5,
          reward: { barakahCoins: 300, noorGems: 50, experience: 500 }
        },
        {
          id: "community-leader",
          title: "Community Leadership",
          description: "Create and moderate a study circle room",
          type: "monthly",
          targetCount: 1,
          currentCount: journeyProgress?.leadershipRoles || 0,
          timeRequirement: 60,
          isCompleted: (journeyProgress?.leadershipRoles || 0) >= 1,
          reward: { barakahCoins: 500, noorGems: 100, experience: 800 }
        }
      ]
    }
  ];

  const currentLevel = spiritualLevels.find(level => 
    (gamificationData?.experience || 0) >= level.minExperience && 
    (gamificationData?.experience || 0) < (spiritualLevels.find(l => l.id === level.id + 1)?.minExperience || Infinity)
  ) || spiritualLevels[0];

  const nextLevel = spiritualLevels.find(level => level.id === currentLevel.id + 1);
  const progressToNext = nextLevel 
    ? ((gamificationData?.experience || 0) - currentLevel.minExperience) / (nextLevel.minExperience - currentLevel.minExperience) * 100
    : 100;

  return (
    <div className="space-y-6">
      {/* Current Level Status */}
      <Card className={`bg-gradient-to-r ${currentLevel.color} text-white`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-2xl font-bold">{currentLevel.name}</h3>
              <p className="text-xl opacity-90 font-amiri">{currentLevel.arabicName}</p>
              <p className="opacity-80">{currentLevel.description}</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{gamificationData?.experience || 0}</div>
              <div className="text-sm opacity-80">Experience Points</div>
            </div>
          </div>
          
          {nextLevel && (
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Progress to {nextLevel.name}</span>
                <span>{Math.round(progressToNext)}%</span>
              </div>
              <Progress value={progressToNext} className="bg-white/20" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Level Selection */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {spiritualLevels.map((level) => (
          <Button
            key={level.id}
            variant={selectedLevel === level.id ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedLevel(level.id)}
            disabled={!level.isUnlocked}
            className="whitespace-nowrap"
          >
            {level.isUnlocked ? (
              <span className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                {level.name}
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                {level.name}
              </span>
            )}
          </Button>
        ))}
      </div>

      {/* Tasks for Selected Level */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">
          Spiritual Tasks - {spiritualLevels.find(l => l.id === selectedLevel)?.name}
        </h3>
        
        {spiritualLevels.find(l => l.id === selectedLevel)?.tasks.map((task) => (
          <Card key={task.id} className={`${task.isCompleted ? 'bg-green-50 border-green-200' : ''}`}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold">{task.title}</h4>
                    {task.isCompleted && <CheckCircle className="w-5 h-5 text-green-600" />}
                    <Badge variant={
                      task.type === 'daily' ? 'default' : 
                      task.type === 'weekly' ? 'secondary' : 
                      task.type === 'monthly' ? 'destructive' : 'outline'
                    }>
                      {task.type}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                  
                  {task.timeRequirement > 0 && (
                    <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
                      <Clock className="w-3 h-3" />
                      Minimum {task.timeRequirement} minutes reflection time
                    </div>
                  )}
                </div>
              </div>

              {/* Progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{task.currentCount}/{task.targetCount}</span>
                </div>
                <Progress value={(task.currentCount / task.targetCount) * 100} />
              </div>

              {/* Rewards */}
              <div className="flex items-center justify-between mt-3 pt-3 border-t">
                <div className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                    {task.reward.barakahCoins} Barakah
                  </span>
                  <span className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                    {task.reward.noorGems} Noor
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-purple-500" />
                    {task.reward.experience} XP
                  </span>
                </div>
                
                {!task.isCompleted && (
                  <Button size="sm" variant="outline">
                    Start Task
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Spiritual Guidelines */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <h4 className="font-semibold text-blue-800 mb-2">Spiritual Journey Guidelines</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Focus on quality and sincerity, not speed</li>
            <li>• Take time for reflection and contemplation</li>
            <li>• Maintain consistency over intensity</li>
            <li>• Seek knowledge and understanding</li>
            <li>• Help and guide fellow Muslims</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}