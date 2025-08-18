import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  TasbihBeadAnimation, 
  GeometricPattern, 
  IslamicButton, 
  CountCelebration,
  ProgressRing,
  FloatingCard
} from "./animations/IslamicAnimations";
import { motion, AnimatePresence } from 'framer-motion';

interface TasbihCounterProps {
  count: number;
  target?: number;
  onTap: () => void;
  onReset: () => void;
  isLoading?: boolean;
}

export default function TasbihCounter({ count, target, onTap, onReset, isLoading = false }: TasbihCounterProps) {
  const [animateBeads, setAnimateBeads] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [lastCelebrationCount, setLastCelebrationCount] = useState(0);
  
  const progressPercent = target ? Math.min(100, (count / target) * 100) : 0;
  const strokeDasharray = 314; // 2 * π * 50
  const strokeDashoffset = strokeDasharray - (strokeDasharray * progressPercent) / 100;

  // Animate beads on count change and show celebrations
  useEffect(() => {
    if (count > 0) {
      setAnimateBeads(true);
      const timer = setTimeout(() => setAnimateBeads(false), 500);
      
      // Show celebration at milestone counts
      const milestones = [33, 99, 100, 500, 1000];
      if (milestones.includes(count) && count !== lastCelebrationCount) {
        setShowCelebration(true);
        setLastCelebrationCount(count);
        setTimeout(() => setShowCelebration(false), 2000);
      }
      
      return () => clearTimeout(timer);
    }
  }, [count, lastCelebrationCount]);

  const handleTap = () => {
    if (!isLoading) {
      onTap();
    }
  };

  const handleReset = () => {
    if (!isLoading) {
      onReset();
    }
  };

  return (
    <FloatingCard delay={0}>
      <div className="text-center">
        {/* Current Count Display with Islamic Pattern */}
        <div className="mb-8">
          <motion.div 
            className="text-6xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent mb-2" 
            data-testid="text-count-display"
            animate={{ 
              scale: animateBeads ? [1, 1.1, 1] : 1 
            }}
            transition={{ duration: 0.3 }}
          >
            {count.toLocaleString()}
          </motion.div>
          
          {/* Decorative Islamic pattern */}
          <div className="flex justify-center items-center space-x-4 mb-4">
            <GeometricPattern isActive={animateBeads} size={20} color="rgb(59, 130, 246)" />
            <motion.span 
              className="text-blue-600 font-arabic text-lg"
              animate={{ opacity: animateBeads ? [0.5, 1, 0.5] : 0.7 }}
            >
              سُبْحَانَ اللّٰهِ
            </motion.span>
            <GeometricPattern isActive={animateBeads} size={20} color="rgb(59, 130, 246)" />
          </div>
          {target && (
            <motion.div 
              className="text-gray-500" 
              data-testid="text-target"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Target: {target.toLocaleString()}
            </motion.div>
          )}
          
          {/* Enhanced Progress Ring with Islamic Design */}
          {target && (
            <motion.div 
              className="mt-6"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <ProgressRing 
                progress={progressPercent} 
                size={140} 
                strokeWidth={10}
                className="mx-auto"
              />
            </motion.div>
          )}
        </div>

        {/* Enhanced Digital Tasbih Button */}
        <div className="mb-8">
          <motion.div
            className="relative"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <motion.button
              onClick={handleTap}
              disabled={isLoading}
              className={`
                w-40 h-40 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full 
                shadow-2xl flex items-center justify-center relative overflow-hidden
                ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
              data-testid="button-tasbih"
              animate={{
                boxShadow: animateBeads 
                  ? ["0 20px 60px rgba(59, 130, 246, 0.3)", "0 25px 80px rgba(59, 130, 246, 0.5)", "0 20px 60px rgba(59, 130, 246, 0.3)"]
                  : "0 20px 60px rgba(59, 130, 246, 0.3)"
              }}
              transition={{ duration: 0.6 }}
            >
              {/* Islamic pattern overlay */}
              <motion.div
                className="absolute inset-0 opacity-20"
                style={{
                  background: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.3'%3E%3Cpath d='M20 20c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10zm10 0c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10z'/%3E%3C/g%3E%3C/svg%3E")`
                }}
                animate={{ rotate: isLoading ? 360 : 0 }}
                transition={{ duration: 2, repeat: isLoading ? Infinity : 0, ease: "linear" }}
              />
              
              <div className="text-center text-white relative z-10">
                <motion.div
                  animate={{ 
                    rotate: animateBeads ? [0, 10, -10, 0] : 0,
                    scale: isLoading ? [1, 1.1, 1] : 1
                  }}
                  transition={{ 
                    rotate: { duration: 0.6 },
                    scale: { duration: 1, repeat: isLoading ? Infinity : 0 }
                  }}
                >
                  <GeometricPattern 
                    isActive={animateBeads || isLoading} 
                    size={48} 
                    color="white" 
                  />
                </motion.div>
                <motion.div 
                  className="text-sm font-medium mt-2"
                  animate={{ opacity: isLoading ? [1, 0.5, 1] : 1 }}
                  transition={{ duration: 1, repeat: isLoading ? Infinity : 0 }}
                >
                  {isLoading ? 'Counting...' : 'Tap to Count'}
                </motion.div>
              </div>
            </motion.button>
          </motion.div>
        </div>

        {/* Enhanced Tasbih Beads with Animation */}
        <motion.div 
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <TasbihBeadAnimation count={count} isAnimating={animateBeads} />
        </motion.div>
        
        {/* Traditional Bead Row Display */}
        <motion.div 
          className="flex justify-center space-x-2 mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          {Array.from({ length: 10 }).map((_, i) => {
            const beadIndex = i;
            const activeIndex = count % 10;
            const isActive = beadIndex < activeIndex;
            const isCurrent = beadIndex === activeIndex;
            
            return (
              <motion.div
                key={i}
                className={`w-3 h-3 rounded-full transition-all duration-300`}
                animate={{
                  backgroundColor: isCurrent && animateBeads
                    ? "rgb(251, 191, 36)"
                    : isActive
                    ? "rgb(59, 130, 246)"
                    : "rgb(209, 213, 219)",
                  scale: isCurrent && animateBeads ? 1.4 : 1,
                  boxShadow: isCurrent && animateBeads 
                    ? "0 0 20px rgba(251, 191, 36, 0.6)"
                    : "none"
                }}
                transition={{ duration: 0.3 }}
              />
            );
          })}
        </motion.div>

        {/* Action Buttons with Islamic Styling */}
        <motion.div 
          className="flex justify-center space-x-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          <IslamicButton
            onClick={handleReset}
            disabled={isLoading}
            variant="outline"
            className="px-6 py-3"
            data-testid="button-reset"
          >
            <motion.i 
              className="fas fa-undo-alt mr-2"
              animate={{ rotate: isLoading ? 360 : 0 }}
              transition={{ duration: 1, repeat: isLoading ? Infinity : 0 }}
            />
            Reset
          </IslamicButton>
        </motion.div>
        
        {/* Celebration Animation */}
        <CountCelebration show={showCelebration} count={count} />
      </div>
    </FloatingCard>
  );
}
