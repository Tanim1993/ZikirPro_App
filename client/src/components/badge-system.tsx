import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Star, Medal, Award, Crown, Gem } from 'lucide-react';

interface AchievementBadge {
  id: number;
  name: string;
  description: string;
  category: string;
  badgeType: string;
  iconName: string;
  iconColor: string;
  backgroundColor: string;
  rarity: string;
  points: number;
  seasonalOnly: boolean;
  availableSeason?: string;
  earnedAt?: string;
}

interface BadgeSystemProps {
  userId?: string;
  showEarnedOnly?: boolean;
  compact?: boolean;
  className?: string;
}

export function BadgeSystem({ userId, showEarnedOnly = false, compact = false, className = "" }: BadgeSystemProps) {
  // Fetch all available badges
  const { data: allBadges, isLoading: loadingAllBadges } = useQuery({
    queryKey: ['/api/achievement-badges'],
    queryFn: () => fetch('/api/achievement-badges').then(res => res.json()),
    enabled: !showEarnedOnly
  });

  // Fetch user's earned badges
  const { data: earnedBadges, isLoading: loadingEarnedBadges } = useQuery({
    queryKey: [`/api/users/${userId || 'me'}/badges`],
    queryFn: () => fetch(`/api/users/${userId || 'me'}/badges`).then(res => res.json()),
    enabled: showEarnedOnly || !!userId
  });

  const badges = showEarnedOnly ? earnedBadges : allBadges;
  const isLoading = showEarnedOnly ? loadingEarnedBadges : loadingAllBadges;

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const getBadgeIcon = (iconName: string, badgeType: string) => {
    const iconProps = { className: "w-5 h-5" };
    
    switch (iconName.toLowerCase()) {
      case 'trophy': return <Trophy {...iconProps} />;
      case 'medal': return <Medal {...iconProps} />;
      case 'award': return <Award {...iconProps} />;
      case 'crown': return <Crown {...iconProps} />;
      case 'gem': return <Gem {...iconProps} />;
      case 'star': return <Star {...iconProps} />;
      default: {
        // Fallback based on badge type
        switch (badgeType) {
          case 'platinum': return <Crown {...iconProps} />;
          case 'gold': return <Trophy {...iconProps} />;
          case 'silver': return <Medal {...iconProps} />;
          case 'bronze': return <Award {...iconProps} />;
          default: return <Star {...iconProps} />;
        }
      }
    }
  };

  const getBadgeTypeColor = (badgeType: string, rarity: string) => {
    if (rarity === 'legendary') return 'bg-gradient-to-br from-purple-500 to-pink-600';
    if (rarity === 'epic') return 'bg-gradient-to-br from-orange-500 to-red-600';
    if (rarity === 'rare') return 'bg-gradient-to-br from-blue-500 to-indigo-600';
    if (rarity === 'uncommon') return 'bg-gradient-to-br from-green-500 to-teal-600';
    
    switch (badgeType) {
      case 'platinum': return 'bg-gradient-to-br from-gray-400 to-gray-600';
      case 'gold': return 'bg-gradient-to-br from-yellow-400 to-yellow-600';
      case 'silver': return 'bg-gradient-to-br from-gray-300 to-gray-500';
      case 'bronze': return 'bg-gradient-to-br from-orange-400 to-orange-600';
      default: return 'bg-gradient-to-br from-blue-500 to-blue-600';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'zikir': return 'bg-green-100 text-green-800 border-green-200';
      case 'seasonal': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'social': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'streak': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'milestone': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRarityGlow = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'shadow-lg shadow-purple-200';
      case 'epic': return 'shadow-lg shadow-orange-200';
      case 'rare': return 'shadow-md shadow-blue-200';
      case 'uncommon': return 'shadow-md shadow-green-200';
      default: return '';
    }
  };

  if (!badges || badges.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
          <Trophy className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {showEarnedOnly ? 'No Badges Earned Yet' : 'No Badges Available'}
        </h3>
        <p className="text-gray-600">
          {showEarnedOnly 
            ? 'Complete zikir sessions and participate in competitions to earn badges!' 
            : 'Check back later for available achievement badges.'
          }
        </p>
      </div>
    );
  }

  if (compact) {
    return (
      <div className={`flex flex-wrap gap-2 ${className}`}>
        {badges.slice(0, 6).map((badge: AchievementBadge) => (
          <div
            key={badge.id}
            className={`relative flex items-center justify-center w-10 h-10 rounded-full ${getBadgeTypeColor(badge.badgeType, badge.rarity)} ${getRarityGlow(badge.rarity)}`}
            title={`${badge.name} - ${badge.description}`}
            data-testid={`badge-compact-${badge.id}`}
          >
            <div className="text-white">
              {getBadgeIcon(badge.iconName, badge.badgeType)}
            </div>
            {badge.seasonalOnly && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-purple-500 rounded-full border border-white"></div>
            )}
          </div>
        ))}
        {badges.length > 6 && (
          <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-full">
            <span className="text-xs font-medium text-gray-600">+{badges.length - 6}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {badges.map((badge: AchievementBadge) => (
          <Card key={badge.id} className={`group hover:shadow-md transition-shadow ${getRarityGlow(badge.rarity)}`}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div
                  className={`flex items-center justify-center w-12 h-12 rounded-full ${getBadgeTypeColor(badge.badgeType, badge.rarity)}`}
                  data-testid={`badge-icon-${badge.id}`}
                >
                  <div className="text-white">
                    {getBadgeIcon(badge.iconName, badge.badgeType)}
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-1">
                  <Badge className={getCategoryColor(badge.category)} data-testid={`badge-category-${badge.id}`}>
                    {badge.category}
                  </Badge>
                  {badge.seasonalOnly && (
                    <Badge className="bg-purple-100 text-purple-800 border-purple-200 text-xs">
                      Seasonal
                    </Badge>
                  )}
                </div>
              </div>
              <CardTitle className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                {badge.name}
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-3">
              <p className="text-gray-600 text-sm">{badge.description}</p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-xs capitalize">
                    {badge.rarity}
                  </Badge>
                  <Badge variant="outline" className="text-xs capitalize">
                    {badge.badgeType}
                  </Badge>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Star className="w-4 h-4 mr-1" />
                  {badge.points} pts
                </div>
              </div>

              {badge.earnedAt && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-2">
                  <div className="text-xs text-green-700 font-medium">
                    Earned on {new Date(badge.earnedAt).toLocaleDateString()}
                  </div>
                </div>
              )}

              {badge.availableSeason && (
                <div className="text-xs text-gray-500">
                  Available during {badge.availableSeason} season
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default BadgeSystem;