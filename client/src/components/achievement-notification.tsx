import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Star, Gift, Crown, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface AchievementNotificationProps {
  achievement: {
    type: 'level_up' | 'badge' | 'milestone' | 'special';
    title: string;
    titleAr?: string;
    description: string;
    icon?: string;
    reward?: {
      amalScore?: number;
      barakahCoins?: number;
      noorTokens?: number;
    };
  } | null;
  onComplete: () => void;
}

export function AchievementNotification({ achievement, onComplete }: AchievementNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (achievement) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onComplete, 500); // Wait for exit animation
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [achievement, onComplete]);

  if (!achievement) return null;

  const getIcon = () => {
    switch (achievement.type) {
      case 'level_up':
        return <Crown className="w-8 h-8 text-yellow-400" />;
      case 'badge':
        return <Trophy className="w-8 h-8 text-purple-400" />;
      case 'milestone':
        return <Star className="w-8 h-8 text-blue-400" />;
      case 'special':
        return <Zap className="w-8 h-8 text-pink-400" />;
      default:
        return <Gift className="w-8 h-8 text-green-400" />;
    }
  };

  const getGradient = () => {
    switch (achievement.type) {
      case 'level_up':
        return 'from-yellow-500 via-orange-500 to-red-500';
      case 'badge':
        return 'from-purple-500 via-indigo-500 to-blue-500';
      case 'milestone':
        return 'from-blue-500 via-cyan-500 to-teal-500';
      case 'special':
        return 'from-pink-500 via-rose-500 to-red-500';
      default:
        return 'from-green-500 via-emerald-500 to-cyan-500';
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: -50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: -50 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 max-w-sm w-full mx-4"
        >
          <div className={cn(
            "bg-gradient-to-r p-1 rounded-xl shadow-2xl border-2 border-white/30",
            getGradient()
          )}>
            <div className="bg-white/95 backdrop-blur-sm rounded-lg p-4 relative overflow-hidden">
              {/* Celebration particles */}
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full"
                    initial={{ 
                      opacity: 0,
                      x: Math.random() * 300,
                      y: Math.random() * 200
                    }}
                    animate={{ 
                      opacity: [0, 1, 0],
                      y: [0, -50, -100],
                      rotate: 360
                    }}
                    transition={{ 
                      duration: 2,
                      delay: i * 0.1,
                      repeat: Infinity,
                      repeatDelay: 1
                    }}
                  />
                ))}
              </div>

              {/* Main content */}
              <div className="relative z-10">
                <div className="flex items-center space-x-3 mb-3">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
                    className="flex-shrink-0"
                  >
                    {getIcon()}
                  </motion.div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800 text-lg">
                      {achievement.title}
                    </h3>
                    {achievement.titleAr && (
                      <p className="text-gray-600 text-sm font-amiri">
                        {achievement.titleAr}
                      </p>
                    )}
                  </div>
                </div>

                <p className="text-gray-700 text-sm mb-3">
                  {achievement.description}
                </p>

                {/* Rewards */}
                {achievement.reward && (
                  <div className="flex justify-center space-x-4 py-2 bg-gray-50 rounded-lg">
                    {achievement.reward.amalScore && (
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm font-semibold text-gray-700">
                          +{achievement.reward.amalScore}
                        </span>
                      </div>
                    )}
                    {achievement.reward.barakahCoins && (
                      <div className="flex items-center space-x-1">
                        <div className="w-4 h-4 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500" />
                        <span className="text-sm font-semibold text-gray-700">
                          +{achievement.reward.barakahCoins}
                        </span>
                      </div>
                    )}
                    {achievement.reward.noorTokens && (
                      <div className="flex items-center space-x-1">
                        <div className="w-4 h-4 rounded bg-gradient-to-br from-cyan-400 to-blue-500" />
                        <span className="text-sm font-semibold text-gray-700">
                          +{achievement.reward.noorTokens}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Islamic decoration */}
                <div className="absolute top-2 right-2 text-2xl opacity-20 font-amiri">
                  ✨
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}