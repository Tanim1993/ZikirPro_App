import { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

interface PointsReward {
  amalScore: number;
  barakahCoins: number;
  noorTokens: number;
}

interface AchievementData {
  pointsAwarded: PointsReward;
  leveledUp: boolean;
  newLevel?: {
    level: number;
    title: string;
  };
  newBadges: Array<{
    name: string;
    description: string;
  }>;
}

interface Achievement {
  type: 'level_up' | 'badge' | 'milestone' | 'special';
  title: string;
  titleAr?: string;
  description: string;
  reward?: PointsReward;
}

export function useGamification() {
  const [currentAchievement, setCurrentAchievement] = useState<Achievement | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const awardPointsMutation = useMutation({
    mutationFn: async ({ zikirCount, roomId }: { zikirCount: number; roomId?: number }) => {
      const response = await fetch('/api/user/award-points', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ zikirCount, roomId })
      });
      
      if (!response.ok) {
        throw new Error('Failed to award points');
      }
      
      return response.json() as Promise<AchievementData>;
    },
    onSuccess: (data) => {
      // Invalidate gamification data to refresh UI
      queryClient.invalidateQueries({ queryKey: ['/api/user/gamification'] });
      
      // Show level up achievement
      if (data.leveledUp && data.newLevel) {
        setCurrentAchievement({
          type: 'level_up',
          title: `Level ${data.newLevel.level} Achieved!`,
          titleAr: `مستوى ${data.newLevel.level} تم تحقيقه!`,
          description: `You've reached ${data.newLevel.title}! Keep up your spiritual journey.`,
          reward: data.pointsAwarded
        });
      }
      // Show badge achievements
      else if (data.newBadges.length > 0) {
        const badge = data.newBadges[0]; // Show first badge if multiple
        setCurrentAchievement({
          type: 'badge',
          title: `${badge.name} Earned!`,
          titleAr: `تم كسب ${badge.name}!`,
          description: badge.description,
          reward: data.pointsAwarded
        });
      }
      // Show points reward toast
      else if (data.pointsAwarded.amalScore > 0 || data.pointsAwarded.barakahCoins > 0) {
        toast({
          title: "Rewards Earned!",
          description: `+${data.pointsAwarded.amalScore} Amal Score, +${data.pointsAwarded.barakahCoins} Barakah Coins`,
        });
      }
    },
    onError: (error) => {
      console.error('Failed to award points:', error);
      toast({
        title: "Error",
        description: "Failed to award points",
        variant: "destructive"
      });
    }
  });

  const awardPoints = useCallback((zikirCount: number, roomId?: number) => {
    awardPointsMutation.mutate({ zikirCount, roomId });
  }, [awardPointsMutation]);

  const dismissAchievement = useCallback(() => {
    setCurrentAchievement(null);
  }, []);

  // Check for milestone achievements
  const checkMilestones = useCallback((totalCount: number) => {
    const milestones = [
      { count: 100, title: "First Century", titleAr: "القرن الأول", description: "Completed your first 100 zikir!" },
      { count: 500, title: "Dedicated Devotee", titleAr: "المتفاني المخلص", description: "Reached 500 total zikir!" },
      { count: 1000, title: "Spiritual Warrior", titleAr: "المحارب الروحي", description: "Achieved 1,000 zikir milestone!" },
      { count: 5000, title: "Master of Remembrance", titleAr: "سيد الذكر", description: "Incredible! 5,000 zikir completed!" },
      { count: 10000, title: "Divine Champion", titleAr: "بطل إلهي", description: "Legendary achievement: 10,000 zikir!" }
    ];

    const milestone = milestones.find(m => totalCount === m.count);
    if (milestone) {
      setCurrentAchievement({
        type: 'milestone',
        title: milestone.title,
        titleAr: milestone.titleAr,
        description: milestone.description
      });
    }
  }, []);

  return {
    awardPoints,
    currentAchievement,
    dismissAchievement,
    checkMilestones,
    isAwarding: awardPointsMutation.isPending
  };
}