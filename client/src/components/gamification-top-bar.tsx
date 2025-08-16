import { useQuery } from "@tanstack/react-query";
import { Star, Coins, Gem, Trophy, Crown, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface GamificationData {
  amalScore: number;
  barakahCoins: number;
  noorTokens: number;
  userLevel: number;
  currentLevel: {
    level: number;
    title: string;
    titleAr: string;
    requiredPoints: number;
  };
  nextLevel?: {
    level: number;
    title: string;
    requiredPoints: number;
    progressPercentage: number;
    pointsNeeded: number;
  } | null;
  badges: any[];
  totalBadges: number;
  hasSpecialStatus: boolean;
}

export function GamificationTopBar() {
  const { data: gamification, isLoading } = useQuery<GamificationData>({
    queryKey: ["/api/user/gamification"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (isLoading || !gamification) {
    return (
      <div className="bg-gradient-to-r from-islamic-primary via-blue-600 to-purple-600 px-4 py-3">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/20 rounded-full animate-pulse"></div>
              <div className="space-y-1">
                <div className="w-16 h-3 bg-white/20 rounded animate-pulse"></div>
                <div className="w-20 h-2 bg-white/20 rounded animate-pulse"></div>
              </div>
            </div>
            <div className="flex space-x-2">
              <div className="w-12 h-6 bg-white/20 rounded animate-pulse"></div>
              <div className="w-12 h-6 bg-white/20 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { currentLevel, nextLevel, hasSpecialStatus } = gamification;

  return (
    <div className="bg-gradient-to-r from-islamic-primary via-blue-600 to-purple-600 px-4 py-3 shadow-lg">
      <div className="max-w-md mx-auto">
        {/* Top Row - Level & Status */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            {/* Level Badge */}
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg border-2 border-yellow-300">
                <span className="text-white font-bold text-sm">{currentLevel.level}</span>
              </div>
              {hasSpecialStatus && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                  <Crown className="w-2 h-2 text-white" />
                </div>
              )}
            </div>
            
            {/* Level Title */}
            <div className="text-white">
              <div className="text-sm font-semibold">{currentLevel.title}</div>
              <div className="text-xs opacity-80 font-amiri">{currentLevel.titleAr}</div>
            </div>
          </div>

          {/* Special Status Badges */}
          <div className="flex space-x-1">
            {gamification.totalBadges >= 5 && (
              <div className="px-2 py-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-xs text-white font-medium">
                🏆 Elite
              </div>
            )}
            {gamification.totalBadges >= 10 && (
              <div className="px-2 py-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full text-xs text-white font-medium">
                ⭐ Master
              </div>
            )}
          </div>
        </div>

        {/* XP Progress Bar (Ludo Star Style) */}
        {nextLevel && (
          <div className="mb-3">
            <div className="flex justify-between items-center mb-1">
              <span className="text-white text-xs opacity-90">
                {gamification.amalScore}/{nextLevel.requiredPoints} Amal Score
              </span>
              <span className="text-yellow-300 text-xs font-semibold">
                Level {nextLevel.level}
              </span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full transition-all duration-1000 ease-out shadow-inner"
                style={{ width: `${nextLevel.progressPercentage}%` }}
              />
            </div>
          </div>
        )}

        {/* Currency Row (Islamic Themed) */}
        <div className="flex justify-between items-center">
          {/* Amal Score (XP equivalent) */}
          <div className="flex items-center space-x-1 bg-white/10 rounded-lg px-2 py-1 backdrop-blur-sm">
            <Star className="w-4 h-4 text-yellow-400" />
            <span className="text-white text-sm font-semibold">
              {gamification.amalScore.toLocaleString()}
            </span>
          </div>

          {/* Barakah Coins */}
          <div className="flex items-center space-x-1 bg-white/10 rounded-lg px-2 py-1 backdrop-blur-sm">
            <div className="w-4 h-4 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
              <Coins className="w-2.5 h-2.5 text-white" />
            </div>
            <span className="text-white text-sm font-semibold">
              {gamification.barakahCoins >= 1000000 ? 
                `${(gamification.barakahCoins / 1000000).toFixed(1)}M` :
                gamification.barakahCoins >= 1000 ? 
                `${(gamification.barakahCoins / 1000).toFixed(1)}K` :
                gamification.barakahCoins.toLocaleString()
              }
            </span>
          </div>

          {/* Noor Tokens (Premium Currency) */}
          <div className="flex items-center space-x-1 bg-white/10 rounded-lg px-2 py-1 backdrop-blur-sm">
            <Gem className="w-4 h-4 text-cyan-400" />
            <span className="text-white text-sm font-semibold">
              {gamification.noorTokens.toLocaleString()}
            </span>
          </div>

          {/* Badges Count */}
          <div className="flex items-center space-x-1 bg-white/10 rounded-lg px-2 py-1 backdrop-blur-sm">
            <Trophy className="w-4 h-4 text-purple-400" />
            <span className="text-white text-sm font-semibold">
              {gamification.totalBadges}
            </span>
          </div>
        </div>

        {/* Special Achievements Row */}
        {gamification.badges.length > 0 && (
          <div className="mt-2 flex space-x-1 overflow-x-auto">
            {gamification.badges.slice(0, 3).map((badge, index) => (
              <div 
                key={badge.id}
                className="flex-shrink-0 px-2 py-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full text-xs text-white font-medium border border-white/20"
              >
                🏅 {badge.name}
              </div>
            ))}
            {gamification.badges.length > 3 && (
              <div className="flex-shrink-0 px-2 py-1 bg-white/10 rounded-full text-xs text-white/80">
                +{gamification.badges.length - 3} more
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}