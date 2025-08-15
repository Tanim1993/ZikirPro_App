import React, { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Trophy, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BadgeNotificationProps {
  badge: {
    id: number;
    name: string;
    description: string;
    badgeType: string;
    iconName: string;
    points: number;
  };
  onClose: () => void;
}

export function BadgeNotification({ badge, onClose }: BadgeNotificationProps) {
  useEffect(() => {
    // Auto-close after 5 seconds
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const getBadgeTypeColor = (badgeType: string) => {
    switch (badgeType) {
      case 'platinum': return 'bg-gradient-to-br from-gray-400 to-gray-600';
      case 'gold': return 'bg-gradient-to-br from-yellow-400 to-yellow-600';
      case 'silver': return 'bg-gradient-to-br from-gray-300 to-gray-500';
      case 'bronze': return 'bg-gradient-to-br from-orange-400 to-orange-600';
      default: return 'bg-gradient-to-br from-blue-500 to-blue-600';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right-full duration-300">
      <Card className="max-w-sm shadow-lg border-2 border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getBadgeTypeColor(badge.badgeType)}`}>
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-yellow-800">New Badge Earned!</h3>
                <p className="text-sm text-yellow-700 font-medium">{badge.name}</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              className="h-6 w-6 p-0 text-yellow-600 hover:text-yellow-800"
              data-testid="badge-notification-close"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          <p className="text-sm text-yellow-700 mb-3">{badge.description}</p>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-yellow-600 capitalize">{badge.badgeType} Badge</span>
            <span className="text-yellow-700 font-medium">+{badge.points} points</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default BadgeNotification;