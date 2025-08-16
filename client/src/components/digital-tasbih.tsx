import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RotateCcw, Settings, Share2, Trophy, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DigitalTasbihProps {
  onCount: () => void;
  count: number;
  targetCount?: number;
  unlimited?: boolean;
  tasbihType?: 'digital' | 'physical' | 'hand';
  roomName?: string;
}

export function DigitalTasbih({ onCount, count, targetCount, unlimited, tasbihType = 'digital', roomName }: DigitalTasbihProps) {
  const [isPressed, setIsPressed] = useState(false);
  const [showCongratulations, setShowCongratulations] = useState(false);
  const [lastCompletedTarget, setLastCompletedTarget] = useState(0);
  const { toast } = useToast();

  const handleCount = () => {
    // Prevent counting if target is reached and not unlimited
    if (!unlimited && targetCount && count >= targetCount) {
      toast({
        title: "Target Completed!",
        description: "You've reached your target. Create a new room or enable unlimited mode to continue counting.",
        duration: 3000,
      });
      return;
    }
    
    setIsPressed(true);
    onCount();
    setTimeout(() => setIsPressed(false), 150);
  };

  // Check for target completion
  useEffect(() => {
    if (!unlimited && targetCount && count >= targetCount && count > lastCompletedTarget) {
      setLastCompletedTarget(count);
      setShowCongratulations(true);
      
      // Also show toast notification
      toast({
        title: "🎉 Mashallah! Target Completed!",
        description: `You've completed ${targetCount.toLocaleString()} dhikr in ${roomName || 'this room'}`,
        duration: 5000,
      });
    }
  }, [count, targetCount, unlimited, lastCompletedTarget, roomName, toast]);

  const progress = unlimited ? 0 : targetCount ? Math.min(100, (count / targetCount) * 100) : 0;

  return (
    <div className="flex flex-col items-center space-y-6">
      {/* Progress Display */}
      <Card className="w-full max-w-sm">
        <CardContent className="p-6 text-center">
          <div className="text-4xl font-bold text-green-600 mb-2">{count.toLocaleString()}</div>
          {!unlimited && targetCount && (
            <>
              <div className="text-sm text-gray-500 mb-3">
                {targetCount.toLocaleString()} target
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
              <div className="text-xs text-gray-500 mt-2">
                {Math.round(progress)}% complete
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Digital Tasbih Interface */}
      {tasbihType === 'digital' && (
        <div className="relative">
          {/* Digital Tasbih Design */}
          <div className="w-64 h-80 bg-gradient-to-b from-purple-500 to-blue-500 rounded-3xl p-6 shadow-2xl">
            <div className="bg-gray-800 rounded-lg p-4 mb-4">
              <div className="text-white text-center">
                <div className="text-xs mb-1">Five Tasbeeh</div>
                <div className="bg-green-400 text-black px-3 py-2 rounded text-lg font-mono">
                  {count.toString().padStart(4, '0')}
                </div>
              </div>
            </div>
            
            <div className="flex justify-between mb-6">
              <Button 
                size="sm" 
                variant="outline" 
                className="text-white border-white bg-white/20 hover:bg-white hover:text-black font-bold opacity-100 visible"
                data-testid="button-count-mode"
              >
                COUNT
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                className="text-white border-white bg-white/20 hover:bg-white hover:text-black font-bold opacity-100 visible"
                data-testid="button-reset-mode"
              >
                RESET
              </Button>
            </div>
            
            {/* Main Count Button */}
            <div className="flex justify-center">
              <button
                onClick={handleCount}
                className={`w-20 h-20 rounded-full bg-gradient-to-b from-gray-300 to-gray-500 shadow-lg border-4 border-gray-400 transition-all duration-100 ${
                  isPressed ? 'scale-95 shadow-md' : 'scale-100'
                } flex items-center justify-center`}
                style={{
                  boxShadow: isPressed 
                    ? 'inset 0 4px 8px rgba(0,0,0,0.3)' 
                    : '0 6px 12px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.3)'
                }}
              >
                <div className="w-full h-full rounded-full bg-gradient-to-b from-white to-gray-200 border-2 border-gray-300 flex items-center justify-center">
                  <span className="text-gray-700 font-bold text-xs">TAP</span>
                </div>
              </button>
            </div>
            
            {/* Small indicator button */}
            <div className="absolute top-4 right-4">
              <div className="w-3 h-3 rounded-full bg-gray-400 shadow-inner" />
            </div>
          </div>
        </div>
      )}

      {/* Physical Tasbih Interface */}
      {tasbihType === 'physical' && (
        <div className="relative">
          <div className="w-80 h-96 relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-4 shadow-2xl">
            {/* Islamic Pattern Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-teal-900/20 to-emerald-900/20 rounded-2xl opacity-60">
              <div className="absolute inset-4 bg-gradient-to-br from-teal-800/10 to-emerald-800/10 rounded-xl" 
                style={{
                  backgroundImage: `radial-gradient(circle at 20% 20%, rgba(20, 184, 166, 0.1) 0%, transparent 50%), 
                                   radial-gradient(circle at 80% 80%, rgba(16, 185, 129, 0.1) 0%, transparent 50%)`
                }}
              />
            </div>
            
            {/* Tasbih String Path */}
            <div className="absolute inset-8">
              <svg width="100%" height="100%" viewBox="0 0 288 320" className="absolute inset-0">
                {/* String path */}
                <path
                  d="M 144 40 Q 240 120 144 200 Q 48 280 144 320"
                  stroke="rgba(139, 69, 19, 0.8)"
                  strokeWidth="2"
                  fill="none"
                />
              </svg>
              
              {/* Moving Beads - 33 beads following the string path */}
              {Array.from({ length: 33 }).map((_, i) => {
                // Calculate position along the curved path
                const progress = (i + (count * 0.1) % 33) / 33;
                let x, y;
                
                if (progress <= 0.5) {
                  // Upper curve: right to center
                  const t = progress * 2;
                  x = 144 + (96 * Math.cos(Math.PI * t)) - 96 * t;
                  y = 40 + 80 * t + 40 * Math.sin(Math.PI * t);
                } else {
                  // Lower curve: center to left and back
                  const t = (progress - 0.5) * 2;
                  x = 144 - (96 * Math.cos(Math.PI * t)) + 96 * t;
                  y = 200 + 60 * t + 40 * Math.sin(Math.PI * t);
                }
                
                // Animate movement on count
                const animationDelay = `${i * 50}ms`;
                const isActiveBeads = i < (count % 33);
                
                return (
                  <div
                    key={i}
                    className={`absolute w-4 h-4 rounded-full shadow-lg transition-all duration-500 ${
                      isActiveBeads 
                        ? 'bg-gradient-to-br from-yellow-400 to-amber-500 scale-110' 
                        : 'bg-gradient-to-br from-amber-600 to-amber-800'
                    }`}
                    style={{
                      left: `${x - 8}px`,
                      top: `${y - 8}px`,
                      transform: `translate(-50%, -50%) ${isPressed ? 'scale(1.2)' : 'scale(1)'}`,
                      transitionDelay: animationDelay,
                      zIndex: isActiveBeads ? 10 : 5
                    }}
                  />
                );
              })}
              
              {/* Central Counter Display */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="w-20 h-20 bg-gradient-to-br from-emerald-600 to-teal-700 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-xl border-4 border-emerald-400/50">
                  {count}
                </div>
              </div>
            </div>
            
            {/* Tap Area */}
            <button
              onClick={handleCount}
              disabled={!unlimited && targetCount ? count >= targetCount : false}
              className={`absolute inset-0 w-full h-full rounded-2xl bg-transparent hover:bg-white/5 transition-all duration-100 ${
                isPressed ? 'scale-98' : 'scale-100'
              } ${!unlimited && targetCount ? (count >= targetCount ? 'opacity-50 cursor-not-allowed' : '') : ''}`}
            >
              <span className="sr-only">Count Tasbih</span>
            </button>
            
            {/* Islamic Decoration */}
            <div className="absolute top-2 left-1/2 transform -translate-x-1/2 text-emerald-400 text-lg font-amiri">
              بِسْمِ ٱللَّٰهِ
            </div>
          </div>
        </div>
      )}

      {/* Hand Counter Interface */}
      {tasbihType === 'hand' && (
        <div className="relative">
          <button
            onClick={handleCount}
            className={`w-32 h-32 rounded-full bg-gradient-to-b from-green-400 to-green-600 shadow-xl border-4 border-green-300 transition-all duration-100 ${
              isPressed ? 'scale-95 shadow-lg' : 'scale-100'
            } hover:from-green-500 hover:to-green-700`}
          >
            <div className="text-white text-lg font-semibold">TAP</div>
            <div className="text-white text-xs">to count</div>
          </button>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex space-x-4">
        <Button variant="outline" size="sm">
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset
        </Button>
        <Button variant="outline" size="sm">
          <Settings className="w-4 h-4 mr-2" />
          Settings
        </Button>
        <Button variant="outline" size="sm">
          <Share2 className="w-4 h-4 mr-2" />
          Share
        </Button>
      </div>

      {/* Congratulations Dialog */}
      <Dialog open={showCongratulations} onOpenChange={setShowCongratulations}>
        <DialogContent className="max-w-md text-center">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-center gap-2 text-2xl text-green-600">
              <Trophy className="w-8 h-8" />
              Mashallah! 🎉
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-6">
            <div className="text-6xl animate-bounce">🎊</div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-green-800">Target Completed!</h3>
              <p className="text-gray-700">
                You have successfully completed <strong>{targetCount?.toLocaleString()}</strong> dhikr
                {roomName && ` in ${roomName}`}
              </p>
              <div className="bg-green-50 p-3 rounded-lg">
                <p className="text-sm text-green-800 font-medium">
                  "And whoever relies upon Allah - then He is sufficient for him. 
                  Indeed, Allah will accomplish His purpose." - Quran 65:3
                </p>
              </div>
            </div>
            <div className="flex justify-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-500 animate-pulse" />
              <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" style={{ animationDelay: '0.5s' }} />
              <Sparkles className="w-6 h-6 text-yellow-600 animate-pulse" style={{ animationDelay: '1s' }} />
            </div>
            <div className="flex gap-3 justify-center">
              <Button 
                onClick={() => setShowCongratulations(false)}
                className="bg-green-600 hover:bg-green-700 text-white px-6"
              >
                Continue Dhikr
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowCongratulations(false);
                  // Navigate to create new room
                  window.location.href = '/dashboard';
                }}
                className="px-6"
              >
                New Room
              </Button>
            </div>
            <div className="mt-3 p-2 bg-amber-50 rounded-lg">
              <p className="text-xs text-amber-700">
                📿 Floating tasbih counts separately and won't be recorded in leaderboards
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}