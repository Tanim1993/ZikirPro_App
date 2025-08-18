import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode, useState, useEffect } from 'react';

// Ripple effect for button interactions
export const RippleEffect = ({ 
  children, 
  className = "",
  rippleColor = "rgba(255, 255, 255, 0.6)" 
}: {
  children: ReactNode;
  className?: string;
  rippleColor?: string;
}) => {
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const newRipple = { id: Date.now(), x, y };
    setRipples(prev => [...prev, newRipple]);
    
    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
    }, 600);
  };

  return (
    <div 
      className={`relative overflow-hidden ${className}`}
      onClick={handleClick}
    >
      {children}
      <AnimatePresence>
        {ripples.map(ripple => (
          <motion.div
            key={ripple.id}
            className="absolute rounded-full pointer-events-none"
            style={{
              left: ripple.x,
              top: ripple.y,
              backgroundColor: rippleColor,
            }}
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 4, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

// Heartbeat pulse for important elements
export const HeartbeatPulse = ({ 
  children, 
  isActive = false,
  intensity = 0.1 
}: {
  children: ReactNode;
  isActive?: boolean;
  intensity?: number;
}) => {
  return (
    <motion.div
      animate={isActive ? {
        scale: [1, 1 + intensity, 1],
      } : {}}
      transition={{
        duration: 0.8,
        repeat: isActive ? Infinity : 0,
        ease: "easeInOut"
      }}
    >
      {children}
    </motion.div>
  );
};

// Breathing animation for meditation-like elements
export const BreathingAnimation = ({ 
  children, 
  isActive = false,
  duration = 4 
}: {
  children: ReactNode;
  isActive?: boolean;
  duration?: number;
}) => {
  return (
    <motion.div
      animate={isActive ? {
        scale: [1, 1.05, 1],
        opacity: [0.8, 1, 0.8],
      } : {}}
      transition={{
        duration,
        repeat: isActive ? Infinity : 0,
        ease: "easeInOut"
      }}
    >
      {children}
    </motion.div>
  );
};

// Gentle glow effect
export const GlowEffect = ({ 
  children, 
  isActive = false,
  color = "rgba(59, 130, 246, 0.4)",
  size = 20 
}: {
  children: ReactNode;
  isActive?: boolean;
  color?: string;
  size?: number;
}) => {
  return (
    <motion.div
      className="relative"
      animate={{
        filter: isActive 
          ? `drop-shadow(0 0 ${size}px ${color})` 
          : "drop-shadow(0 0 0px transparent)"
      }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
};

// Shake animation for errors or attention
export const ShakeAnimation = ({ 
  children, 
  trigger = false,
  intensity = 10 
}: {
  children: ReactNode;
  trigger?: boolean;
  intensity?: number;
}) => {
  return (
    <motion.div
      animate={trigger ? {
        x: [-intensity, intensity, -intensity, intensity, 0],
      } : {}}
      transition={{ duration: 0.5 }}
    >
      {children}
    </motion.div>
  );
};

// Particle burst effect
export const ParticleBurst = ({ 
  trigger = false,
  particles = 12,
  color = "rgb(59, 130, 246)" 
}: {
  trigger?: boolean;
  particles?: number;
  color?: string;
}) => {
  const [showParticles, setShowParticles] = useState(false);

  useEffect(() => {
    if (trigger) {
      setShowParticles(true);
      setTimeout(() => setShowParticles(false), 1000);
    }
  }, [trigger]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <AnimatePresence>
        {showParticles && Array.from({ length: particles }, (_, i) => {
          const angle = (i * 360) / particles;
          const distance = 100;
          const x = Math.cos(angle * Math.PI / 180) * distance;
          const y = Math.sin(angle * Math.PI / 180) * distance;
          
          return (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full"
              style={{
                backgroundColor: color,
                left: '50%',
                top: '50%',
              }}
              initial={{ 
                scale: 0,
                x: 0,
                y: 0,
                opacity: 1
              }}
              animate={{ 
                scale: [0, 1, 0],
                x: x,
                y: y,
                opacity: [1, 1, 0]
              }}
              exit={{ opacity: 0 }}
              transition={{ 
                duration: 0.8,
                ease: "easeOut"
              }}
            />
          );
        })}
      </AnimatePresence>
    </div>
  );
};

// Morphing shape animation
export const MorphingShape = ({ 
  isActive = false,
  size = 40,
  color = "rgb(59, 130, 246)" 
}: {
  isActive?: boolean;
  size?: number;
  color?: string;
}) => {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className="inline-block"
    >
      <motion.path
        d={isActive 
          ? "M50,10 L90,30 L90,70 L50,90 L10,70 L10,30 Z" 
          : "M50,25 L75,35 L75,65 L50,75 L25,65 L25,35 Z"
        }
        fill={color}
        stroke={color}
        strokeWidth="2"
        initial={false}
        animate={{
          d: isActive 
            ? "M50,10 L90,30 L90,70 L50,90 L10,70 L10,30 Z" 
            : "M50,25 L75,35 L75,65 L50,75 L25,65 L25,35 Z"
        }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
      />
    </motion.svg>
  );
};

// Text reveal animation
export const TextReveal = ({ 
  text, 
  trigger = false,
  staggerDelay = 0.05 
}: {
  text: string;
  trigger?: boolean;
  staggerDelay?: number;
}) => {
  return (
    <div className="flex">
      {text.split('').map((char, index) => (
        <motion.span
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={trigger ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ 
            duration: 0.3,
            delay: index * staggerDelay,
            ease: "easeOut"
          }}
        >
          {char === ' ' ? '\u00A0' : char}
        </motion.span>
      ))}
    </div>
  );
};

// Loading dots animation
export const LoadingDots = ({ 
  color = "rgb(59, 130, 246)",
  size = 8 
}: {
  color?: string;
  size?: number;
}) => {
  return (
    <div className="flex space-x-1">
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          style={{
            width: size,
            height: size,
            backgroundColor: color,
          }}
          className="rounded-full"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: index * 0.2,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
};

// Spotlight effect
export const SpotlightEffect = ({ 
  children, 
  isActive = false 
}: {
  children: ReactNode;
  isActive?: boolean;
}) => {
  return (
    <motion.div
      className="relative"
      animate={{
        background: isActive 
          ? "radial-gradient(circle at center, rgba(59, 130, 246, 0.1) 0%, transparent 70%)"
          : "transparent"
      }}
      transition={{ duration: 0.5 }}
    >
      {children}
    </motion.div>
  );
};