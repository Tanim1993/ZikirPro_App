import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface TasbihCounterProps {
  count: number;
  target?: number;
  onTap: () => void;
  onReset: () => void;
  isLoading?: boolean;
}

export default function TasbihCounter({ count, target, onTap, onReset, isLoading = false }: TasbihCounterProps) {
  const [animateBeads, setAnimateBeads] = useState(false);
  
  const progressPercent = target ? Math.min(100, (count / target) * 100) : 0;
  const strokeDasharray = 314; // 2 * π * 50
  const strokeDashoffset = strokeDasharray - (strokeDasharray * progressPercent) / 100;

  // Animate beads on count change
  useEffect(() => {
    if (count > 0) {
      setAnimateBeads(true);
      const timer = setTimeout(() => setAnimateBeads(false), 500);
      return () => clearTimeout(timer);
    }
  }, [count]);

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
    <div className="text-center">
      {/* Current Count Display */}
      <div className="mb-8">
        <div className="text-6xl font-bold text-islamic-green mb-2" data-testid="text-count-display">
          {count.toLocaleString()}
        </div>
        {target && (
          <div className="text-gray-500" data-testid="text-target">
            Target: {target.toLocaleString()}
          </div>
        )}
        
        {/* Progress Circle */}
        {target && (
          <div className="w-32 h-32 mx-auto mt-6 relative">
            <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="50" stroke="#E5E7EB" strokeWidth="8" fill="none"/>
              <circle 
                cx="60" 
                cy="60" 
                r="50" 
                stroke="#16A34A" 
                strokeWidth="8" 
                fill="none" 
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-500"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold text-islamic-green" data-testid="text-progress-percent">
                {Math.round(progressPercent)}%
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Digital Tasbih Button */}
      <div className="mb-8">
        <Button
          onClick={handleTap}
          disabled={isLoading}
          className={`w-40 h-40 bg-gradient-to-br from-islamic-green to-islamic-green-dark rounded-full shadow-2xl flex items-center justify-center transform transition-all duration-200 hover:scale-105 active:scale-95 ${
            isLoading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          data-testid="button-tasbih"
        >
          <div className="text-center text-white">
            <i className={`fas fa-prayer-beads text-4xl mb-2 ${isLoading ? 'animate-spin' : 'animate-pulse-slow'}`}></i>
            <div className="text-sm font-medium">
              {isLoading ? 'Counting...' : 'Tap to Count'}
            </div>
          </div>
        </Button>
      </div>

      {/* Tasbih Beads Visualization */}
      <div className="flex justify-center space-x-2 mb-6">
        {Array.from({ length: 10 }).map((_, i) => {
          const beadIndex = i;
          const activeIndex = count % 10;
          const isActive = beadIndex <= activeIndex;
          const isCurrent = beadIndex === activeIndex;
          
          return (
            <div
              key={i}
              className={`tasbih-bead w-3 h-3 rounded-full transition-all duration-300 ${
                isCurrent && animateBeads
                  ? 'bg-islamic-gold shadow-lg scale-125 animate-pulse'
                  : isActive
                  ? 'bg-islamic-gold'
                  : 'bg-gray-300'
              }`}
            />
          );
        })}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4">
        <Button 
          onClick={handleReset}
          disabled={isLoading}
          variant="destructive"
          className="px-6 py-3"
          data-testid="button-reset"
        >
          <i className="fas fa-redo mr-2"></i>
          Reset
        </Button>
        <Button 
          variant="secondary"
          className="px-6 py-3"
          data-testid="button-details"
        >
          <i className="fas fa-info-circle mr-2"></i>
          Details
        </Button>
        <Button 
          variant="secondary"
          className="px-6 py-3 bg-islamic-gold hover:bg-islamic-gold-dark text-white"
          data-testid="button-history"
        >
          <i className="fas fa-calendar-alt mr-2"></i>
          History
        </Button>
      </div>
    </div>
  );
}
