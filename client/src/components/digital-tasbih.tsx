import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RotateCcw, Settings, Share2 } from "lucide-react";

interface DigitalTasbihProps {
  onCount: () => void;
  count: number;
  targetCount?: number;
  unlimited?: boolean;
  tasbihType?: 'digital' | 'physical' | 'hand';
}

export function DigitalTasbih({ onCount, count, targetCount, unlimited, tasbihType = 'digital' }: DigitalTasbihProps) {
  const [isPressed, setIsPressed] = useState(false);

  const handleCount = () => {
    setIsPressed(true);
    onCount();
    setTimeout(() => setIsPressed(false), 150);
  };

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
          <div className="w-64 h-64 relative">
            {/* Hand with Tasbih */}
            <div className="absolute inset-0 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full">
              <img 
                src="/api/placeholder/256/256"
                alt="Hand with Tasbih"
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            
            {/* Count Button Overlay */}
            <button
              onClick={handleCount}
              className={`absolute inset-0 w-full h-full rounded-full bg-black/10 hover:bg-black/20 transition-all duration-100 ${
                isPressed ? 'scale-95' : 'scale-100'
              }`}
            >
              <span className="sr-only">Count Tasbih</span>
            </button>
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
    </div>
  );
}