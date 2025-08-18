import { motion } from 'framer-motion';
import { GeometricPattern, IslamicStar } from './IslamicAnimations';

// Islamic-themed loading spinner
export const IslamicLoader = ({ 
  size = 60, 
  message = "Loading...",
  variant = 'geometric' 
}: {
  size?: number;
  message?: string;
  variant?: 'geometric' | 'star' | 'crescent' | 'calligraphy';
}) => {
  if (variant === 'star') {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <IslamicStar isLoading={true} size={size} />
        <motion.p 
          className="mt-4 text-blue-600 font-medium"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {message}
        </motion.p>
      </div>
    );
  }

  if (variant === 'crescent') {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <motion.svg
          width={size}
          height={size}
          viewBox="0 0 100 100"
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        >
          <motion.path
            d="M50,10 A25,25 0 1,1 50,90 A35,35 0 1,0 50,10"
            fill="rgb(59, 130, 246)"
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.svg>
        <motion.p 
          className="mt-4 text-blue-600 font-medium"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {message}
        </motion.p>
      </div>
    );
  }

  if (variant === 'calligraphy') {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <motion.div
          className="text-4xl text-blue-600 font-arabic"
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.7, 1, 0.7] 
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          اللّٰهُ
        </motion.div>
        <motion.p 
          className="mt-4 text-blue-600 font-medium"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {message}
        </motion.p>
      </div>
    );
  }

  // Default geometric pattern
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="relative">
        <GeometricPattern isActive={true} size={size} color="rgb(59, 130, 246)" />
        
        {/* Rotating outer ring */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        >
          <svg width={size + 20} height={size + 20} viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="rgb(59, 130, 246)"
              strokeWidth="2"
              strokeDasharray="10,5"
              opacity="0.3"
            />
          </svg>
        </motion.div>
      </div>
      
      <motion.p 
        className="mt-4 text-blue-600 font-medium"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        {message}
      </motion.p>
    </div>
  );
};

// Page loading overlay
export const PageLoader = ({ 
  isVisible = false,
  message = "Loading...",
  variant = 'geometric' 
}: {
  isVisible?: boolean;
  message?: string;
  variant?: 'geometric' | 'star' | 'crescent' | 'calligraphy';
}) => {
  if (!isVisible) return null;

  return (
    <motion.div
      className="fixed inset-0 bg-white/90 backdrop-blur-sm z-50 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="bg-white rounded-2xl shadow-2xl border border-blue-100 p-8"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <IslamicLoader size={80} message={message} variant={variant} />
      </motion.div>
    </motion.div>
  );
};