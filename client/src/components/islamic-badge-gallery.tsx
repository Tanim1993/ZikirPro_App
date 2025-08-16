import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Badge, Star, Trophy, Crown, Gem, Heart, Zap, Award } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface BadgeData {
  id: string;
  badgeId: string;
  name: string;
  nameAr: string;
  description: string;
  iconUrl?: string;
  earnedAt: string;
}

interface GamificationData {
  badges: BadgeData[];
  totalBadges: number;
}

const ISLAMIC_BADGE_ICONS = {
  // Spiritual Progress Badges
  'first_steps': '🌱',
  'daily_devotion': '🌙',
  'century_achiever': '💯',
  'community_member': '🤝',
  'streak_keeper': '🔥',
  'dedicated_counter': '📿',
  'spiritual_warrior': '⚔️',
  'master_of_remembrance': '👑',
  'divine_champion': '✨',
  
  // Islamic Practice Badges
  'fajr_guardian': '🌅',
  'night_prayer': '🌌',
  'quran_reader': '📖',
  'charity_giver': '🤲',
  'pilgrimage_dreamer': '🕋',
  'knowledge_seeker': '🎓',
  'patient_soul': '💙',
  'grateful_heart': '💚',
  
  // Community Badges
  'helper': '🤗',
  'mentor': '🧭',
  'leader': '👥',
  'peacemaker': '☮️',
  
  // Special Achievements
  'ramadan_champion': '🌙',
  'hajj_blessed': '🕋',
  'laylat_al_qadr': '⭐',
  'eid_celebrant': '🎊'
};

const BADGE_RARITY_COLORS = {
  common: 'from-gray-400 to-gray-600',
  uncommon: 'from-green-400 to-green-600',
  rare: 'from-blue-400 to-blue-600',
  epic: 'from-purple-400 to-purple-600',
  legendary: 'from-yellow-400 to-orange-500',
  divine: 'from-pink-400 to-rose-500'
};

function getBadgeRarity(badgeId: string): keyof typeof BADGE_RARITY_COLORS {
  if (['divine_champion', 'master_of_remembrance', 'laylat_al_qadr'].includes(badgeId)) return 'divine';
  if (['spiritual_warrior', 'ramadan_champion', 'hajj_blessed'].includes(badgeId)) return 'legendary';
  if (['dedicated_counter', 'knowledge_seeker', 'mentor'].includes(badgeId)) return 'epic';
  if (['streak_keeper', 'community_member', 'quran_reader'].includes(badgeId)) return 'rare';
  if (['daily_devotion', 'century_achiever', 'helper'].includes(badgeId)) return 'uncommon';
  return 'common';
}

export function IslamicBadgeGallery() {
  const { data: gamification, isLoading } = useQuery<GamificationData>({
    queryKey: ["/api/user/gamification"],
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Trophy className="w-5 h-5 text-islamic-primary" />
            <span>Achievement Badges</span>
            <span className="text-sm text-gray-500">الإنجازات</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="w-16 h-16 bg-gray-200 rounded-lg animate-pulse"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const badges = gamification?.badges || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Trophy className="w-5 h-5 text-islamic-primary" />
            <span>Achievement Badges</span>
            <span className="text-sm text-gray-500 font-amiri">الإنجازات</span>
          </div>
          <div className="flex items-center space-x-1 px-2 py-1 bg-islamic-gradient rounded-full text-white text-sm">
            <Award className="w-4 h-4" />
            <span>{badges.length}</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {badges.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-6xl mb-3">🏆</div>
            <h3 className="font-semibold text-gray-700 mb-2">Start Your Journey</h3>
            <p className="text-sm text-gray-500 mb-4">
              Complete zikir to earn your first badge
            </p>
            <p className="text-xs text-gray-400 font-amiri">ابدأ رحلتك الروحية</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Featured Latest Badge */}
            {badges.length > 0 && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="relative"
              >
                <div className={cn(
                  "p-4 rounded-xl bg-gradient-to-br text-white relative overflow-hidden",
                  BADGE_RARITY_COLORS[getBadgeRarity(badges[0].badgeId)]
                )}>
                  <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
                  <div className="relative z-10 flex items-center space-x-3">
                    <div className="text-3xl">
                      {ISLAMIC_BADGE_ICONS[badges[0].badgeId as keyof typeof ISLAMIC_BADGE_ICONS] || '🏅'}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg">{badges[0].name}</h3>
                      <p className="text-sm opacity-90 font-amiri">{badges[0].nameAr}</p>
                      <p className="text-xs opacity-80 mt-1">{badges[0].description}</p>
                    </div>
                    <div className="text-xs opacity-75">
                      Latest
                    </div>
                  </div>
                  <div className="absolute top-2 right-2 text-yellow-300">✨</div>
                </div>
              </motion.div>
            )}

            {/* Badge Grid */}
            <div className="grid grid-cols-4 gap-3">
              {badges.slice(1).map((badge, index) => {
                const rarity = getBadgeRarity(badge.badgeId);
                return (
                  <motion.div
                    key={badge.id}
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="group relative"
                  >
                    <div className={cn(
                      "w-16 h-16 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg border-2 border-white/30 group-hover:scale-110 transition-transform cursor-pointer",
                      BADGE_RARITY_COLORS[rarity]
                    )}>
                      <div className="text-2xl">
                        {ISLAMIC_BADGE_ICONS[badge.badgeId as keyof typeof ISLAMIC_BADGE_ICONS] || '🏅'}
                      </div>
                    </div>
                    
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 w-32 text-center">
                      <p className="font-semibold">{badge.name}</p>
                      <p className="text-gray-300 font-amiri">{badge.nameAr}</p>
                    </div>
                    
                    {/* Rarity indicator */}
                    {rarity !== 'common' && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                        {rarity === 'divine' && <Crown className="w-2 h-2 text-white" />}
                        {rarity === 'legendary' && <Star className="w-2 h-2 text-white" />}
                        {rarity === 'epic' && <Gem className="w-2 h-2 text-white" />}
                        {rarity === 'rare' && <Zap className="w-2 h-2 text-white" />}
                        {rarity === 'uncommon' && <Heart className="w-2 h-2 text-white" />}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>

            {/* Progress Hint */}
            <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-2 text-sm text-blue-700">
                <Star className="w-4 h-4" />
                <span>Complete more zikir to unlock new badges!</span>
              </div>
              <p className="text-xs text-blue-600 mt-1 font-amiri">أكمل المزيد من الذكر لفتح شارات جديدة</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}