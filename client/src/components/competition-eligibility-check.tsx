import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CheckCircle, XCircle, Info, Users, Trophy, Star, Lock } from 'lucide-react';
import { OrganizationLevels } from './organization-levels';

interface CompetitionEligibilityCheckProps {
  compId: number;
  orgId: string;
  levelRequired: number;
  onJoin?: () => void;
  joinButtonText?: string;
}

interface EligibilityData {
  eligible: boolean;
  userLevel: number;
  reason?: string;
}

interface LevelData {
  levels: Array<{
    level: number;
    name: string;
    description: string;
    color: string;
  }>;
  promotionRules: Array<{
    fromLevel: number;
    toLevel: number;
    anyOf: Array<{
      top3?: number;
      top5?: number;
      top10?: number;
      totalComps?: number;
    }>;
  }>;
}

export function CompetitionEligibilityCheck({ 
  compId, 
  orgId, 
  levelRequired, 
  onJoin,
  joinButtonText = "Join Competition"
}: CompetitionEligibilityCheckProps) {
  const [showLevelsModal, setShowLevelsModal] = useState(false);

  // Check user eligibility
  const { 
    data: eligibility, 
    isLoading: eligibilityLoading,
    refetch: refetchEligibility 
  } = useQuery<EligibilityData>({
    queryKey: [`/api/competitions/${compId}/eligibility`],
    enabled: !!compId,
  });

  // Get organization levels for context
  const { data: levelData } = useQuery<LevelData>({
    queryKey: [`/api/organizations/${orgId}/levels`],
    enabled: !!orgId,
  });

  if (eligibilityLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
        <span className="ml-2 text-sm text-gray-600">Checking eligibility...</span>
      </div>
    );
  }

  if (!eligibility) {
    return (
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Unable to check eligibility at this time. Please try again.
        </AlertDescription>
      </Alert>
    );
  }

  const getLevelName = (level: number) => {
    if (!levelData?.levels) return `Darajah ${level}`;
    const levelInfo = levelData.levels.find(l => l.level === level);
    return levelInfo?.name || `Darajah ${level}`;
  };

  const getLevelColor = (level: number) => {
    const colors = {
      1: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      2: 'bg-blue-100 text-blue-800 border-blue-200',
      3: 'bg-purple-100 text-purple-800 border-purple-200',
      4: 'bg-amber-100 text-amber-800 border-amber-200',
      5: 'bg-red-100 text-red-800 border-red-200',
    };
    return colors[level as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center mb-2">
          {eligibility.eligible ? (
            <CheckCircle className="w-8 h-8 text-green-600" />
          ) : (
            <XCircle className="w-8 h-8 text-red-600" />
          )}
        </div>
        <CardTitle className="text-lg">
          {eligibility.eligible ? 'Eligible to Join!' : 'Not Eligible'}
        </CardTitle>
        <CardDescription>
          {eligibility.eligible 
            ? 'You meet the requirements for this competition'
            : 'You don\'t meet the requirements yet'
          }
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Level Information */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Required Level:</span>
            <Badge className={`border ${getLevelColor(levelRequired)}`} variant="outline">
              <Star className="w-3 h-3 mr-1" />
              {getLevelName(levelRequired)}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Your Level:</span>
            <Badge className={`border ${getLevelColor(eligibility.userLevel)}`} variant="outline">
              <Trophy className="w-3 h-3 mr-1" />
              {getLevelName(eligibility.userLevel)}
            </Badge>
          </div>
        </div>

        {/* Eligibility Status */}
        {eligibility.eligible ? (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Perfect! You can join this competition right now.
            </AlertDescription>
          </Alert>
        ) : (
          <Alert className="border-red-200 bg-red-50">
            <Lock className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {eligibility.reason}
            </AlertDescription>
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 pt-4">
          {eligibility.eligible ? (
            <Button 
              onClick={onJoin} 
              className="w-full bg-green-600 hover:bg-green-700"
            >
              <Users className="w-4 h-4 mr-2" />
              {joinButtonText}
            </Button>
          ) : (
            <Button 
              variant="outline" 
              className="w-full" 
              disabled
            >
              <Lock className="w-4 h-4 mr-2" />
              Cannot Join Yet
            </Button>
          )}

          {/* View Levels Button */}
          <Dialog open={showLevelsModal} onOpenChange={setShowLevelsModal}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full">
                <Info className="w-4 h-4 mr-2" />
                View Level System
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Organization Level System</DialogTitle>
                <DialogDescription>
                  Learn about the levels and how to advance through competitions
                </DialogDescription>
              </DialogHeader>
              <OrganizationLevels 
                orgId={orgId} 
                showProgress={true} 
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Progress Hint */}
        {!eligibility.eligible && eligibility.userLevel < levelRequired && (
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-sm text-blue-800">
              <div className="font-medium mb-1">💡 How to advance:</div>
              <ul className="text-xs space-y-1 ml-4">
                <li>• Participate in competitions at your current level</li>
                <li>• Achieve top 3, top 5, or top 10 finishes</li>
                <li>• Meet promotion requirements to unlock higher levels</li>
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}