import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode } from 'react';

// Islamic geometric pattern animation
export const GeometricPattern = ({ 
  isActive = false, 
  size = 24, 
  color = "currentColor" 
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
      animate={{
        rotate: isActive ? 360 : 0,
        scale: isActive ? [1, 1.1, 1] : 1
      }}
      transition={{
        rotate: { duration: 2, ease: "linear", repeat: isActive ? Infinity : 0 },
        scale: { duration: 0.8, ease: "easeInOut" }
      }}
    >
      <g fill={color} opacity="0.8">
        <motion.circle
          cx="50"
          cy="50"
          r="20"
          fill="none"
          stroke={color}
          strokeWidth="2"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: isActive ? 1 : 0.3 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        />
        <motion.circle
          cx="50"
          cy="50"
          r="30"
          fill="none"
          stroke={color}
          strokeWidth="1"
          strokeDasharray="5,5"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: isActive ? 1 : 0.2 }}
          transition={{ duration: 2, ease: "easeInOut", delay: 0.3 }}
        />
        <motion.path
          d="M30,30 L70,30 L70,70 L30,70 Z"
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: isActive ? 1 : 0.4 }}
          transition={{ duration: 1.2, ease: "easeInOut", delay: 0.6 }}
        />
      </g>
    </motion.svg>
  );
};

// Tasbih bead animation component
export const TasbihBeadAnimation = ({ 
  count = 0, 
  isAnimating = false 
}: {
  count?: number;
  isAnimating?: boolean;
}) => {
  const beadCount = Math.min(count % 33, 33); // Show up to 33 beads
  
  return (
    <motion.div 
      className="relative w-16 h-16 mx-auto"
      animate={{ scale: isAnimating ? [1, 1.05, 1] : 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <svg width="64" height="64" viewBox="0 0 64 64" className="absolute inset-0">
        {/* Tasbih string/circle */}
        <circle
          cx="32"
          cy="32"
          r="28"
          fill="none"
          stroke="rgb(59, 130, 246)"
          strokeWidth="2"
          strokeDasharray="2,2"
          opacity="0.3"
        />
        
        {/* Animated beads */}
        {Array.from({ length: 33 }, (_, i) => {
          const angle = (i * 360) / 33;
          const x = 32 + 26 * Math.cos((angle - 90) * Math.PI / 180);
          const y = 32 + 26 * Math.sin((angle - 90) * Math.PI / 180);
          const isActive = i < beadCount;
          
          return (
            <motion.circle
              key={i}
              cx={x}
              cy={y}
              r={isActive ? "3" : "2"}
              fill={isActive ? "rgb(59, 130, 246)" : "rgb(156, 163, 175)"}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ 
                scale: isActive ? 1 : 0.6,
                opacity: isActive ? 1 : 0.4,
                fill: isActive ? "rgb(59, 130, 246)" : "rgb(156, 163, 175)"
              }}
              transition={{ 
                duration: 0.3, 
                delay: isAnimating && i === beadCount - 1 ? 0.1 : 0,
                ease: "easeOut" 
              }}
            />
          );
        })}
        
        {/* Center highlight */}
        <motion.circle
          cx="32"
          cy="32"
          r="6"
          fill="rgb(59, 130, 246)"
          opacity="0.2"
          animate={{ 
            scale: isAnimating ? [1, 1.3, 1] : 1,
            opacity: isAnimating ? [0.2, 0.4, 0.2] : 0.2
          }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        />
      </svg>
    </motion.div>
  );
};

// Islamic star pattern for loading states
export const IslamicStar = ({ isLoading = false, size = 32 }) => {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className="inline-block"
      animate={{
        rotate: isLoading ? 360 : 0
      }}
      transition={{
        duration: 3,
        ease: "linear",
        repeat: isLoading ? Infinity : 0
      }}
    >
      <motion.path
        d="M50,10 L55,40 L85,40 L62,60 L70,90 L50,75 L30,90 L38,60 L15,40 L45,40 Z"
        fill="rgb(59, 130, 246)"
        stroke="rgb(37, 99, 235)"
        strokeWidth="1"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ 
          scale: 1, 
          opacity: isLoading ? [0.7, 1, 0.7] : 0.8 
        }}
        transition={{ 
          scale: { duration: 0.5 },
          opacity: { duration: 2, repeat: isLoading ? Infinity : 0, ease: "easeInOut" }
        }}
      />
      <motion.circle
        cx="50"
        cy="50"
        r="8"
        fill="white"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      />
    </motion.svg>
  );
};

// Subtle floating animation for cards
export const FloatingCard = ({ 
  children, 
  delay = 0 
}: {
  children: ReactNode;
  delay?: number;
}) => {
  return (
    <motion.div
      initial={{ y: 0 }}
      animate={{ 
        y: [0, -4, 0],
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut",
        delay: delay
      }}
      whileHover={{ 
        y: -8,
        transition: { duration: 0.3 }
      }}
    >
      {children}
    </motion.div>
  );
};

// Islamic calligraphy-inspired text animation
export const CalligraphyText = ({ 
  children, 
  className = "", 
  isVisible = true 
}: {
  children: ReactNode;
  className?: string;
  isVisible?: boolean;
}) => {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 10 }}
      animate={{ 
        opacity: isVisible ? 1 : 0,
        y: isVisible ? 0 : 10
      }}
      transition={{ 
        duration: 0.8,
        ease: "easeOut"
      }}
    >
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: isVisible ? 1 : 0 }}
        transition={{ duration: 1.2, ease: "easeInOut", delay: 0.3 }}
        className="origin-left"
      >
        {children}
      </motion.div>
    </motion.div>
  );
};

// Button with Islamic-inspired hover effects
export const IslamicButton = ({ 
  children, 
  onClick, 
  disabled = false, 
  variant = "primary" as "primary" | "secondary" | "outline",
  className = "",
  isLoading = false 
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "outline";
  className?: string;
  isLoading?: boolean;
}) => {
  const variants = {
    primary: "bg-gradient-to-r from-blue-600 to-blue-700 text-white",
    secondary: "bg-white text-blue-600 border border-blue-200",
    outline: "border border-blue-300 text-blue-600 bg-transparent"
  };

  return (
    <motion.button
      className={`
        relative px-6 py-3 rounded-lg font-medium transition-all duration-200
        ${variants[variant]}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      onClick={onClick}
      disabled={disabled || isLoading}
      whileHover={!disabled ? { 
        scale: 1.02,
        boxShadow: "0 8px 25px rgba(59, 130, 246, 0.3)"
      } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center"
          >
            <IslamicStar isLoading={true} size={20} />
            <span className="ml-2">Processing...</span>
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Subtle pattern overlay */}
      <motion.div
        className="absolute inset-0 rounded-lg opacity-0"
        style={{
          background: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='3' cy='3' r='1'/%3E%3Ccircle cx='13' cy='13' r='1'/%3E%3C/g%3E%3C/svg%3E")`
        }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      />
    </motion.button>
  );
};

// Count celebration animation
export const CountCelebration = ({ show = false, count = 0 }) => {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center pointer-events-none z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="text-center"
            initial={{ scale: 0, y: 50 }}
            animate={{ 
              scale: [0, 1.2, 1],
              y: [50, 0, -20]
            }}
            exit={{ 
              scale: 0,
              y: -100,
              opacity: 0
            }}
            transition={{ 
              duration: 1.5,
              ease: "easeOut"
            }}
          >
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border">
              <GeometricPattern isActive={true} size={48} color="rgb(59, 130, 246)" />
              <motion.h2 
                className="text-3xl font-bold text-blue-600 mt-4"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                {count}
              </motion.h2>
              <motion.p 
                className="text-lg text-gray-600"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                SubhanAllah!
              </motion.p>
            </div>
          </motion.div>
          
          {/* Floating particles */}
          {Array.from({ length: 8 }, (_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-blue-400 rounded-full"
              initial={{ 
                x: 0, 
                y: 0, 
                scale: 0,
                opacity: 0
              }}
              animate={{ 
                x: (Math.random() - 0.5) * 200,
                y: (Math.random() - 0.5) * 200,
                scale: [0, 1, 0],
                opacity: [0, 1, 0]
              }}
              transition={{ 
                duration: 2,
                delay: 0.5 + i * 0.1,
                ease: "easeOut"
              }}
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Progress ring animation
export const ProgressRing = ({ 
  progress = 0, 
  size = 120, 
  strokeWidth = 8, 
  className = "" 
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className={`relative ${className}`}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="rgb(229, 231, 235)"
          strokeWidth={strokeWidth}
        />
        
        {/* Progress ring */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="rgb(59, 130, 246)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={strokeDasharray}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1, ease: "easeInOut" }}
        />
      </svg>
      
      {/* Center content */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.span 
          className="text-xl font-bold text-blue-600"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          {Math.round(progress)}%
        </motion.span>
      </div>
    </div>
  );
};