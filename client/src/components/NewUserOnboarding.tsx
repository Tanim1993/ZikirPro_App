import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  Users, 
  Trophy, 
  Plus, 
  CheckCircle, 
  Star, 
  Heart, 
  PlayCircle,
  Coins,
  Settings
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface NewUserOnboardingProps {
  onComplete: () => void;
  onCreateRoom: () => void;
}

export function NewUserOnboarding({ onComplete, onCreateRoom }: NewUserOnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [showWelcome, setShowWelcome] = useState(true);

  const onboardingSteps = [
    {
      title: "🌙 Welcome to Zikir Amol",
      icon: <Heart className="w-6 h-6 text-red-500" />,
      content: (
        <div className="space-y-4">
          <p className="text-gray-700 text-center">
            <strong>Assalamu Alaikum!</strong><br/>
            Welcome to the Islamic Zikir Competition App
          </p>
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">What is Zikir Amol?</h4>
            <p className="text-blue-700 text-sm">
              A halal platform where Muslims can perform remembrance (dhikr) of Allah together, 
              compete spiritually, and grow in faith through community engagement.
            </p>
          </div>
        </div>
      )
    },
    {
      title: "📿 How to Use Digital Tasbih",
      icon: <PlayCircle className="w-6 h-6 text-green-500" />,
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">Learn how to count your dhikr:</p>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">1</div>
              <div>
                <strong>Tap the Tasbih Button</strong>
                <p className="text-sm text-gray-600">Each tap counts as one dhikr</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">2</div>
              <div>
                <strong>Use Voice Recognition</strong>
                <p className="text-sm text-gray-600">Say the dhikr phrase to count automatically</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold">3</div>
              <div>
                <strong>Floating Tasbih</strong>
                <p className="text-sm text-gray-600">Enable in profile settings for quick access anywhere</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "🏠 Rooms & Competition",
      icon: <Users className="w-6 h-6 text-blue-500" />,
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">Join or create spiritual competitions:</p>
          <div className="space-y-3">
            <div className="p-3 border rounded-lg">
              <h4 className="font-semibold text-green-600">✅ Create Your Own Room</h4>
              <p className="text-sm text-gray-600">Set dhikr type, duration (1-40 days), and invite friends</p>
            </div>
            <div className="p-3 border rounded-lg">
              <h4 className="font-semibold text-blue-600">👥 Join Others' Rooms</h4>
              <p className="text-sm text-gray-600">Participate in public rooms and compete together</p>
            </div>
            <div className="p-3 border rounded-lg">
              <h4 className="font-semibold text-purple-600">🏆 Compete Spiritually</h4>
              <p className="text-sm text-gray-600">See leaderboards and track your progress</p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "⭐ Rules & Guidelines",
      icon: <BookOpen className="w-6 h-6 text-orange-500" />,
      content: (
        <div className="space-y-4">
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-semibold text-green-800 mb-2">🌟 Islamic Guidelines</h4>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• All dhikr should be done with sincere intention (Niyyah)</li>
              <li>• Competition is to encourage each other, not for pride</li>
              <li>• Remember: "The best dhikr is La ilaha illa Allah"</li>
            </ul>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">📋 Platform Rules</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Be respectful to all community members</li>
              <li>• No inappropriate content or language</li>
              <li>• Report any issues using the report button</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      title: "🎮 Rewards & Gamification",
      icon: <Trophy className="w-6 h-6 text-yellow-500" />,
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">Earn rewards for your spiritual journey:</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-yellow-50 rounded-lg text-center">
              <Coins className="w-6 h-6 text-yellow-600 mx-auto mb-1" />
              <div className="text-sm font-semibold text-yellow-800">Barakah Coins</div>
              <p className="text-xs text-yellow-600">Earn through dhikr</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg text-center">
              <Star className="w-6 h-6 text-purple-600 mx-auto mb-1" />
              <div className="text-sm font-semibold text-purple-800">Levels</div>
              <p className="text-xs text-purple-600">Progress spiritually</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg text-center">
              <Trophy className="w-6 h-6 text-green-600 mx-auto mb-1" />
              <div className="text-sm font-semibold text-green-800">Badges</div>
              <p className="text-xs text-green-600">Achievement unlocks</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg text-center">
              <CheckCircle className="w-6 h-6 text-blue-600 mx-auto mb-1" />
              <div className="text-sm font-semibold text-blue-800">Streaks</div>
              <p className="text-xs text-blue-600">Daily consistency</p>
            </div>
          </div>
        </div>
      )
    }
  ];

  const nextStep = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowWelcome(false);
      onComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (!showWelcome) return null;

  return (
    <Dialog open={showWelcome} onOpenChange={setShowWelcome}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            {onboardingSteps[currentStep].icon}
            {onboardingSteps[currentStep].title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Progress Indicator */}
          <div className="flex justify-center space-x-2">
            {onboardingSteps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index <= currentStep ? 'bg-blue-500' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          {/* Step Content */}
          <div className="min-h-[300px]">
            {onboardingSteps[currentStep].content}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0}
              className="px-6"
            >
              Previous
            </Button>
            
            <Badge variant="secondary" className="px-3 py-1">
              {currentStep + 1} of {onboardingSteps.length}
            </Badge>
            
            {currentStep === onboardingSteps.length - 1 ? (
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    onCreateRoom();
                    setShowWelcome(false);
                  }}
                  className="bg-green-600 hover:bg-green-700 px-4"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Create Room
                </Button>
                <Button
                  onClick={nextStep}
                  className="bg-blue-600 hover:bg-blue-700 px-6"
                >
                  Start Journey
                </Button>
              </div>
            ) : (
              <Button
                onClick={nextStep}
                className="bg-blue-600 hover:bg-blue-700 px-6"
              >
                Next
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}