import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { FloatingCard, GeometricPattern } from '../animations/IslamicAnimations';
import { RippleEffect, GlowEffect } from '../animations/MicroInteractions';

interface IslamicCardProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'premium' | 'competition' | 'achievement';
  isActive?: boolean;
  onClick?: () => void;
  delay?: number;
  showPattern?: boolean;
}

export function IslamicCard({ 
  children, 
  className = "",
  variant = 'default',
  isActive = false,
  onClick,
  delay = 0,
  showPattern = true
}: IslamicCardProps) {
  
  const variants = {
    default: "bg-white border border-gray-200 shadow-sm",
    premium: "bg-gradient-to-br from-blue-50 to-white border border-blue-200 shadow-lg",
    competition: "bg-gradient-to-br from-yellow-50 to-white border border-yellow-200 shadow-lg",
    achievement: "bg-gradient-to-br from-green-50 to-white border border-green-200 shadow-lg"
  };

  const patternColors = {
    default: "rgb(156, 163, 175)",
    premium: "rgb(59, 130, 246)",
    competition: "rgb(251, 191, 36)",
    achievement: "rgb(34, 197, 94)"
  };

  const CardContent = (
    <motion.div
      className={`
        relative p-6 rounded-xl transition-all duration-300 cursor-pointer
        ${variants[variant]}
        ${isActive ? 'ring-2 ring-blue-400 ring-opacity-50' : ''}
        ${onClick ? 'hover:shadow-lg hover:-translate-y-1' : ''}
        ${className}
      `}
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={onClick ? { scale: 1.02 } : {}}
      whileTap={onClick ? { scale: 0.98 } : {}}
    >
      {/* Islamic Pattern Overlay */}
      {showPattern && (
        <div className="absolute top-4 right-4 opacity-10">
          <GeometricPattern 
            isActive={isActive} 
            size={32} 
            color={patternColors[variant]} 
          />
        </div>
      )}
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
      
      {/* Subtle gradient overlay for premium variants */}
      {variant !== 'default' && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-xl" />
      )}
    </motion.div>
  );

  return (
    <FloatingCard delay={delay}>
      <GlowEffect 
        isActive={isActive} 
        color={`${patternColors[variant]}40`}
        size={15}
      >
        {onClick ? (
          <RippleEffect rippleColor={`${patternColors[variant]}60`}>
            {CardContent}
          </RippleEffect>
        ) : (
          CardContent
        )}
      </GlowEffect>
    </FloatingCard>
  );
}