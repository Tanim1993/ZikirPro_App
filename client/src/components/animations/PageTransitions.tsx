import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode } from 'react';

// Page transition wrapper
export const PageTransition = ({ children, className = "" }: { children: ReactNode, className?: string }) => {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ 
        duration: 0.4,
        ease: "easeOut"
      }}
    >
      {children}
    </motion.div>
  );
};

// Staggered children animation
export const StaggerContainer = ({ 
  children, 
  className = "",
  staggerDelay = 0.1 
}: { 
  children: ReactNode[], 
  className?: string,
  staggerDelay?: number 
}) => {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay
          }
        }
      }}
    >
      {Array.isArray(children) ? children.map((child, index) => (
        <motion.div
          key={index}
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { 
              opacity: 1, 
              y: 0,
              transition: { duration: 0.4, ease: "easeOut" }
            }
          }}
        >
          {child}
        </motion.div>
      )) : (
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { 
              opacity: 1, 
              y: 0,
              transition: { duration: 0.4, ease: "easeOut" }
            }
          }}
        >
          {children}
        </motion.div>
      )}
    </motion.div>
  );
};

// Slide in from direction
export const SlideIn = ({ 
  children, 
  direction = 'up',
  delay = 0,
  className = ""
}: { 
  children: ReactNode,
  direction?: 'up' | 'down' | 'left' | 'right',
  delay?: number,
  className?: string
}) => {
  const directions = {
    up: { y: 30 },
    down: { y: -30 },
    left: { x: 30 },
    right: { x: -30 }
  };

  const initial = {
    opacity: 0,
    ...directions[direction]
  };

  const animate = {
    opacity: 1,
    x: 0,
    y: 0
  };

  return (
    <motion.div
      className={className}
      initial={initial}
      animate={animate}
      transition={{ 
        duration: 0.5,
        delay,
        ease: "easeOut"
      }}
    >
      {children}
    </motion.div>
  );
};

// Scale in animation
export const ScaleIn = ({ 
  children, 
  delay = 0,
  className = ""
}: { 
  children: ReactNode,
  delay?: number,
  className?: string
}) => {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ 
        duration: 0.4,
        delay,
        ease: "easeOut"
      }}
    >
      {children}
    </motion.div>
  );
};

// Fade in with blur
export const FadeInBlur = ({ 
  children, 
  delay = 0,
  className = ""
}: { 
  children: ReactNode,
  delay?: number,
  className?: string
}) => {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, filter: "blur(10px)" }}
      animate={{ opacity: 1, filter: "blur(0px)" }}
      transition={{ 
        duration: 0.6,
        delay,
        ease: "easeOut"
      }}
    >
      {children}
    </motion.div>
  );
};

// Reveal animation (like wiping)
export const Reveal = ({ 
  children, 
  direction = 'horizontal',
  delay = 0,
  className = ""
}: { 
  children: ReactNode,
  direction?: 'horizontal' | 'vertical',
  delay?: number,
  className?: string
}) => {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <motion.div
        initial={{ 
          [direction === 'horizontal' ? 'x' : 'y']: '-100%'
        }}
        animate={{ 
          [direction === 'horizontal' ? 'x' : 'y']: '0%'
        }}
        transition={{ 
          duration: 0.6,
          delay,
          ease: "easeInOut"
        }}
      >
        {children}
      </motion.div>
    </div>
  );
};

// Typewriter effect
export const TypeWriter = ({ 
  text, 
  delay = 0,
  speed = 50,
  className = ""
}: { 
  text: string,
  delay?: number,
  speed?: number,
  className?: string
}) => {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay }}
    >
      {text.split('').map((char, index) => (
        <motion.span
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ 
            delay: delay + (index * speed / 1000),
            duration: 0.1
          }}
        >
          {char === ' ' ? '\u00A0' : char}
        </motion.span>
      ))}
    </motion.div>
  );
};

// Magnetic hover effect
export const MagneticHover = ({ 
  children, 
  className = "",
  strength = 0.3
}: { 
  children: ReactNode,
  className?: string,
  strength?: number
}) => {
  return (
    <motion.div
      className={className}
      whileHover={{ scale: 1 + strength * 0.1 }}
      whileTap={{ scale: 1 - strength * 0.05 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      {children}
    </motion.div>
  );
};

// Parallax scroll effect
export const ParallaxScroll = ({ 
  children, 
  speed = 0.5,
  className = ""
}: { 
  children: ReactNode,
  speed?: number,
  className?: string
}) => {
  return (
    <motion.div
      className={className}
      style={{
        y: 0
      }}
      animate={{
        y: [0, -50 * speed, 0]
      }}
      transition={{
        duration: 8,
        repeat: Infinity,
        ease: "linear"
      }}
    >
      {children}
    </motion.div>
  );
};