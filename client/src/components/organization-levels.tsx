import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Star, TrendingUp, Award, Users, Target } from 'lucide-react';

interface LevelDefinition {
  level: number;
  name: string;
  description: string;
  color: string;
}

interface PromotionRule {
  fromLevel: number;
  toLevel: number;
  anyOf: Array<{
    top3?: number;
    top5?: number;
    top10?: number;
    totalComps?: number;
  }>;
}

interface OrganizationLevelsProps {
  orgId: string;
  showProgress?: boolean;
  compact?: boolean;
}

interface LevelData {
  levels: LevelDefinition[];
  promotionRules: PromotionRule[];
}

interface ProgressData {
  currentLevel: number;
  nextLevel: number;
  requirements: Array<{
    top3?: number;
    top5?: number;
    top10?: number;
    totalComps?: number;
  }>;
  progress: {
    top3: number;
    top5: number;
    top10: number;
    totalComps: number;
  };
}

const LEVEL_ICONS = {
  1: Star,
  2: Target,
  3: TrendingUp,
  4: Award,
  5: Trophy,
};

const LEVEL_COLORS = {
  1: 'from-emerald-400 to-emerald-600',
  2: 'from-blue-400 to-blue-600', 
  3: 'from-purple-400 to-purple-600',
  4: 'from-amber-400 to-amber-600',
  5: 'from-red-400 to-red-600',
};

export function OrganizationLevels({ orgId, showProgress = false, compact = false }: OrganizationLevelsProps) {
  const [userLevel, setUserLevel] = useState(1);

  // Fetch organization level schema
  const { data: levelData, isLoading } = useQuery<LevelData>({
    queryKey: [`/api/organizations/${orgId}/levels`],
    enabled: !!orgId,
  });

  // Fetch user's promotion progress if showProgress is true
  const { data: progressData } = useQuery<ProgressData>({
    queryKey: [`/api/organizations/${orgId}/promotion-progress`],
    enabled: showProgress && !!orgId,
  });

  useEffect(() => {
    if (progressData?.currentLevel) {
      setUserLevel(progressData.currentLevel);
    }
  }, [progressData]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!levelData) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Users className="mx-auto h-12 w-12 mb-2 opacity-50" />
        <p>No level system configured</p>
      </div>
    );
  }

  const { levels, promotionRules } = levelData;

  if (compact) {
    return (
      <div className="grid grid-cols-5 gap-2">
        {levelData.levels.map((level: LevelDefinition) => {
          const IconComponent = LEVEL_ICONS[level.level as keyof typeof LEVEL_ICONS] || Star;
          const isCurrentLevel = level.level === userLevel;
          const isCompleted = level.level < userLevel;
          
          return (
            <div
              key={level.level}
              className={`
                relative p-3 rounded-lg text-center transition-all duration-200
                ${isCurrentLevel 
                  ? `bg-gradient-to-br ${LEVEL_COLORS[level.level as keyof typeof LEVEL_COLORS]} text-white shadow-lg scale-105` 
                  : isCompleted 
                  ? 'bg-green-100 text-green-800 border border-green-200' 
                  : 'bg-gray-100 text-gray-600 border border-gray-200'
                }
                hover:shadow-md cursor-pointer
              `}
            >
              <IconComponent className="w-5 h-5 mx-auto mb-1" />
              <div className="text-xs font-medium">{level.name}</div>
              {isCurrentLevel && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full border-2 border-white animate-pulse"></div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Level Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-600" />
            Organization Levels System
          </CardTitle>
          <CardDescription>
            Advance through levels by participating in competitions and achieving top positions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {levelData.levels.map((level: LevelDefinition) => {
              const IconComponent = LEVEL_ICONS[level.level as keyof typeof LEVEL_ICONS] || Star;
              const isCurrentLevel = level.level === userLevel;
              const isCompleted = level.level < userLevel;
              
              return (
                <div
                  key={level.level}
                  className={`
                    relative p-4 rounded-lg border transition-all duration-200
                    ${isCurrentLevel 
                      ? 'border-blue-300 bg-blue-50 shadow-md' 
                      : isCompleted 
                      ? 'border-green-300 bg-green-50' 
                      : 'border-gray-200 bg-gray-50'
                    }
                  `}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`
                          p-2 rounded-full
                          ${isCurrentLevel 
                            ? `bg-gradient-to-br ${LEVEL_COLORS[level.level as keyof typeof LEVEL_COLORS]} text-white` 
                            : isCompleted 
                            ? 'bg-green-600 text-white' 
                            : 'bg-gray-400 text-white'
                          }
                        `}
                      >
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{level.name}</h3>
                        <p className="text-sm text-gray-600">{level.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isCurrentLevel && (
                        <Badge variant="default" className="bg-blue-600">
                          Current Level
                        </Badge>
                      )}
                      {isCompleted && (
                        <Badge variant="outline" className="border-green-600 text-green-600">
                          Completed
                        </Badge>
                      )}
                      {level.level > userLevel && (
                        <Badge variant="secondary">
                          Locked
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Progress Details */}
      {showProgress && progressData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Your Progress
            </CardTitle>
            <CardDescription>
              Track your advancement to the next level
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">Current Level</span>
                <Badge className="bg-blue-600">
                  {levelData.levels.find((l: LevelDefinition) => l.level === progressData.currentLevel)?.name}
                </Badge>
              </div>
              
              {progressData.nextLevel && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Next Level</span>
                    <Badge variant="outline">
                      {levelData.levels.find((l: LevelDefinition) => l.level === progressData.nextLevel)?.name}
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">Requirements (any one of):</h4>
                    {progressData.requirements.map((req: any, index: number) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-lg">
                        <div className="space-y-2">
                          {req.top3 && (
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Top 3 finishes</span>
                              <div className="flex items-center gap-2">
                                <div className="w-24 h-2 bg-gray-200 rounded-full">
                                  <div 
                                    className="h-2 bg-blue-600 rounded-full transition-all duration-300"
                                    style={{ width: `${Math.min(100, (progressData.progress.top3 / req.top3) * 100)}%` }}
                                  />
                                </div>
                                <span className="text-sm font-medium">
                                  {progressData.progress.top3}/{req.top3}
                                </span>
                              </div>
                            </div>
                          )}
                          {req.top5 && (
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Top 5 finishes</span>
                              <div className="flex items-center gap-2">
                                <div className="w-24 h-2 bg-gray-200 rounded-full">
                                  <div 
                                    className="h-2 bg-blue-600 rounded-full transition-all duration-300"
                                    style={{ width: `${Math.min(100, (progressData.progress.top5 / req.top5) * 100)}%` }}
                                  />
                                </div>
                                <span className="text-sm font-medium">
                                  {progressData.progress.top5}/{req.top5}
                                </span>
                              </div>
                            </div>
                          )}
                          {req.top10 && (
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Top 10 finishes</span>
                              <div className="flex items-center gap-2">
                                <div className="w-24 h-2 bg-gray-200 rounded-full">
                                  <div 
                                    className="h-2 bg-blue-600 rounded-full transition-all duration-300"
                                    style={{ width: `${Math.min(100, (progressData.progress.top10 / req.top10) * 100)}%` }}
                                  />
                                </div>
                                <span className="text-sm font-medium">
                                  {progressData.progress.top10}/{req.top10}
                                </span>
                              </div>
                            </div>
                          )}
                          {req.totalComps && (
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Total competitions</span>
                              <div className="flex items-center gap-2">
                                <div className="w-24 h-2 bg-gray-200 rounded-full">
                                  <div 
                                    className="h-2 bg-blue-600 rounded-full transition-all duration-300"
                                    style={{ width: `${Math.min(100, (progressData.progress.totalComps / req.totalComps) * 100)}%` }}
                                  />
                                </div>
                                <span className="text-sm font-medium">
                                  {progressData.progress.totalComps}/{req.totalComps}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}