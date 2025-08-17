import React, { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Coins, Star, Trophy, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';

interface GamificationIntroModalProps {
  open: boolean;
  onClose: () => void;
}

export function GamificationIntroModal({ open, onClose }: GamificationIntroModalProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: "🎮 Rewards & Gamification",
      content: (
        <div className="space-y-6">
          <p className="text-gray-600 text-center">
            Earn rewards for your spiritual journey:
          </p>
          
          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-yellow-50 border-yellow-200">
              <CardContent className="p-4 text-center">
                <Coins className="w-8 h-8 mx-auto mb-2 text-yellow-600" />
                <h3 className="font-semibold text-yellow-800">Barakah Coins</h3>
                <p className="text-sm text-yellow-700">Earn through dhikr</p>
              </CardContent>
            </Card>
            
            <Card className="bg-purple-50 border-purple-200">
              <CardContent className="p-4 text-center">
                <Star className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                <h3 className="font-semibold text-purple-800">Levels</h3>
                <p className="text-sm text-purple-700">Progress spiritually</p>
              </CardContent>
            </Card>
            
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4 text-center">
                <Trophy className="w-8 h-8 mx-auto mb-2 text-green-600" />
                <h3 className="font-semibold text-green-800">Badges</h3>
                <p className="text-sm text-green-700">Achievement unlocks</p>
              </CardContent>
            </Card>
            
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4 text-center">
                <CheckCircle className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                <h3 className="font-semibold text-blue-800">Streaks</h3>
                <p className="text-sm text-blue-700">Daily consistency</p>
              </CardContent>
            </Card>
          </div>
        </div>
      )
    },
    {
      title: "🌟 Spiritual Journey",
      content: (
        <div className="space-y-6">
          <p className="text-gray-600 text-center">
            Progress through authentic Islamic dhikr levels:
          </p>
          
          <div className="space-y-4">
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                  <div>
                    <h4 className="font-semibold">Learn Meaning</h4>
                    <p className="text-sm text-gray-600">Study dhikr significance</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                  <div>
                    <h4 className="font-semibold">Practice with Reflection</h4>
                    <p className="text-sm text-gray-600">Mindful recitation (5 min minimum)</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-purple-50 border-purple-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                  <div>
                    <h4 className="font-semibold">Knowledge Check</h4>
                    <p className="text-sm text-gray-600">Test understanding</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )
    },
    {
      title: "🎯 Ready to Begin",
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Start Your Journey</h3>
            <p className="text-gray-600 mb-6">
              Visit the Journey tab to begin Level 1 and earn your first Barakah Coins!
            </p>
          </div>
          
          <Card className="bg-gradient-to-r from-yellow-50 to-blue-50 border border-yellow-200">
            <CardContent className="p-4 text-center">
              <h4 className="font-semibold text-gray-800 mb-2">Level 1 Rewards</h4>
              <div className="flex items-center justify-center gap-4 text-sm">
                <span className="flex items-center gap-1">
                  <Coins className="w-4 h-4 text-yellow-600" />
                  10 Barakah Coins
                </span>
                <span className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-purple-600" />
                  25 Experience
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }
  ];

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const handleClose = () => {
    localStorage.setItem('gamification-intro-seen', 'true');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-md">
        <div className="space-y-6">
          {/* Progress Dots */}
          <div className="flex justify-center gap-2">
            {slides.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index === currentSlide ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          {/* Current Slide */}
          <div className="text-center">
            <h2 className="text-xl font-bold mb-4">{slides[currentSlide].title}</h2>
            {slides[currentSlide].content}
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              {currentSlide + 1} of {slides.length}
            </div>
            
            <div className="flex gap-2">
              {currentSlide > 0 && (
                <Button variant="outline" size="sm" onClick={prevSlide}>
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Previous
                </Button>
              )}
              
              {currentSlide < slides.length - 1 ? (
                <Button size="sm" onClick={nextSlide} className="bg-blue-600 hover:bg-blue-700">
                  Next
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              ) : (
                <Button size="sm" onClick={handleClose} className="bg-green-600 hover:bg-green-700">
                  Start Journey
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}