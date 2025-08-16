import React, { useState, useRef, useCallback } from 'react';
import { X, Minimize2, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface FloatingTasbihButtonProps {
  isVisible: boolean;
  onClose: () => void;
}

export function FloatingTasbihButton({ isVisible, onClose }: FloatingTasbihButtonProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [count, setCount] = useState(0);
  const [position, setPosition] = useState({ x: 20, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  const buttonRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Simple count increment (no room needed)
  const incrementCount = useCallback(() => {
    setCount(prev => prev + 1);
    
    // Optional: sync with backend for analytics
    // You can add API call here if needed for overall user stats
  }, []);

  // Handle mouse/touch drag events
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isExpanded) return; // Don't drag when expanded
    
    setIsDragging(true);
    const rect = buttonRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    
    const newX = e.clientX - dragOffset.x;
    const newY = e.clientY - dragOffset.y;
    
    // Keep within screen bounds
    const maxX = window.innerWidth - 60;
    const maxY = window.innerHeight - 60;
    
    setPosition({
      x: Math.max(0, Math.min(newX, maxX)),
      y: Math.max(0, Math.min(newY, maxY))
    });
  }, [isDragging, dragOffset]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Add global event listeners for dragging
  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  if (!isVisible) return null;

  return (
    <div 
      ref={buttonRef}
      className={cn(
        "fixed z-50 transition-all duration-200",
        isExpanded ? "inset-4" : "w-16 h-16",
        isDragging ? "cursor-grabbing" : "cursor-grab"
      )}
      style={!isExpanded ? { 
        left: `${position.x}px`, 
        top: `${position.y}px` 
      } : {}}
    >
      {!isExpanded ? (
        // Floating Button (collapsed)
        <div
          className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full shadow-lg flex items-center justify-center hover:shadow-xl transition-all duration-200 hover:scale-105 cursor-pointer"
          onMouseDown={handleMouseDown}
          onClick={() => !isDragging && setIsExpanded(true)}
          data-testid="floating-tasbih-button"
        >
          <div className="text-white text-2xl">📿</div>
        </div>
      ) : (
        // Expanded Interface (fullscreen overlay)
        <div className="w-full h-full bg-black/50 backdrop-blur-sm rounded-lg flex items-center justify-center">
          <Card className="w-full max-w-md mx-auto bg-gradient-to-br from-islamic-primary/10 to-islamic-secondary/10 border-islamic-primary/20">
            <CardContent className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-islamic-primary">Simple Tasbih</h2>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsExpanded(false)}
                    className="h-8 w-8 p-0"
                    data-testid="button-minimize-tasbih"
                  >
                    <Minimize2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
                    data-testid="button-close-tasbih"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Counter Display */}
              <div className="text-center mb-8">
                <div className="text-6xl font-bold text-islamic-primary mb-2">
                  {count.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">
                  Total Count
                </div>
              </div>

              {/* Voice Toggle */}
              <div className="flex items-center justify-center gap-2 mb-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsVoiceEnabled(!isVoiceEnabled)}
                  className={cn(
                    "gap-2",
                    isVoiceEnabled ? "bg-green-50 text-green-700 border-green-200" : ""
                  )}
                  data-testid="button-toggle-voice"
                >
                  {isVoiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  Voice {isVoiceEnabled ? 'On' : 'Off'}
                </Button>
              </div>

              {/* Main Tasbih Button */}
              <div className="flex justify-center">
                <Button
                  onClick={incrementCount}
                  className="w-32 h-32 rounded-full bg-gradient-to-br from-islamic-primary to-islamic-secondary hover:from-islamic-primary-dark hover:to-islamic-primary text-white text-lg font-bold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                  data-testid="button-tasbih-count"
                >
                  <div className="text-center">
                    <div className="text-3xl mb-1">📿</div>
                    <div className="text-sm">Tap to Count</div>
                  </div>
                </Button>
              </div>

              {/* Reset Button */}
              <div className="flex justify-center mt-6">
                <Button
                  variant="outline"
                  onClick={() => setCount(0)}
                  className="text-sm"
                  data-testid="button-reset-count"
                >
                  Reset Count
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}