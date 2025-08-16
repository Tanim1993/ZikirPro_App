import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { X, RotateCcw, Minimize2, Maximize2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FloatingTasbihProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FloatingTasbih({ isOpen, onClose }: FloatingTasbihProps) {
  const [count, setCount] = useState(0);
  const [isPressed, setIsPressed] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [position, setPosition] = useState({ x: 20, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const { toast } = useToast();

  const handleCount = () => {
    setIsPressed(true);
    setCount(prev => prev + 1);
    setTimeout(() => setIsPressed(false), 150);
  };

  const resetCount = () => {
    setCount(0);
    toast({
      title: "Counter Reset",
      description: "Floating tasbih counter has been reset to 0",
    });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      
      const newX = Math.max(0, Math.min(window.innerWidth - 200, e.clientX - dragOffset.x));
      const newY = Math.max(0, Math.min(window.innerHeight - 200, e.clientY - dragOffset.y));
      
      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  if (!isOpen) return null;

  return (
    <div
      className={`fixed z-50 ${isMinimized ? 'w-16 h-16' : 'w-48 h-auto'} transition-all duration-300`}
      style={{ left: position.x, top: position.y }}
    >
      <Card className="bg-white/95 backdrop-blur border-2 border-green-200 shadow-xl">
        {/* Header */}
        <div
          className="flex items-center justify-between p-2 bg-gradient-to-r from-green-500 to-green-600 text-white cursor-move rounded-t-md"
          onMouseDown={handleMouseDown}
        >
          <div className="flex items-center gap-2">
            <div className="text-sm font-bold">📿</div>
            {!isMinimized && <span className="text-sm font-medium">Floating Tasbih</span>}
          </div>
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsMinimized(!isMinimized)}
              className="h-6 w-6 p-0 text-white hover:bg-white/20"
            >
              {isMinimized ? <Maximize2 className="w-3 h-3" /> : <Minimize2 className="w-3 h-3" />}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={onClose}
              className="h-6 w-6 p-0 text-white hover:bg-white/20"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {/* Content */}
        {!isMinimized && (
          <CardContent className="p-4">
            {/* Count Display */}
            <div className="text-center mb-4">
              <div className="text-3xl font-bold text-green-600 mb-1">{count.toLocaleString()}</div>
              <div className="text-xs text-gray-500">Personal Count</div>
            </div>

            {/* Count Button */}
            <div className="flex justify-center mb-3">
              <button
                onClick={handleCount}
                className={`w-16 h-16 rounded-full bg-gradient-to-b from-green-400 to-green-600 shadow-lg border-4 border-green-300 transition-all duration-100 ${
                  isPressed ? 'scale-95 shadow-md' : 'scale-100'
                } hover:from-green-500 hover:to-green-700`}
              >
                <div className="text-white text-lg font-semibold">TAP</div>
              </button>
            </div>

            {/* Controls */}
            <div className="flex justify-center">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={resetCount}
                className="text-xs"
              >
                <RotateCcw className="w-3 h-3 mr-1" />
                Reset
              </Button>
            </div>

            {/* Disclaimer */}
            <div className="mt-3 p-2 bg-amber-50 rounded text-center">
              <p className="text-xs text-amber-700">
                🌟 Personal counting - not recorded in competitions
              </p>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}