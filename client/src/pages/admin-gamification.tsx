import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

interface LevelConfig {
  level: number;
  title_en: string;
  title_ar: string;
  points_required: number;
  room_creation_limit: number;
  coin_multiplier: number;
  unlock_message: string;
}

interface CurrencyConfig {
  id: number;
  activity_type: string;
  base_points: number;
  multiplier: number;
  seasonal_bonus: number;
  is_active: boolean;
}

interface BadgeConfig {
  id: number;
  badge_id: string;
  name_en: string;
  name_ar: string;
  description: string;
  category: string;
  criteria_type: string;
  target_value: number;
  points_reward: number;
  coins_reward: number;
  is_active: boolean;
}

export default function AdminGamification() {
  const [selectedLevel, setSelectedLevel] = useState<LevelConfig | null>(null);
  const [editingLevel, setEditingLevel] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch level configurations
  const { data: levels, isLoading: levelsLoading } = useQuery({
    queryKey: ['/api/admin/levels'],
  });

  // Fetch currency configurations
  const { data: currencies, isLoading: currenciesLoading } = useQuery({
    queryKey: ['/api/admin/currency'],
  });

  // Fetch badge configurations
  const { data: badges, isLoading: badgesLoading } = useQuery({
    queryKey: ['/api/admin/badges'],
  });

  // Fetch gamification stats
  const { data: stats } = useQuery({
    queryKey: ['/api/admin/gamification-stats'],
  });

  // Update level mutation
  const updateLevelMutation = useMutation({
    mutationFn: async (data: { level: number; config: Partial<LevelConfig> }) => {
      return apiRequest(`/api/admin/levels/${data.level}`, {
        method: 'PUT',
        body: JSON.stringify(data.config),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/levels'] });
      toast({
        title: "Success",
        description: "Level configuration updated successfully",
      });
      setEditingLevel(false);
      setSelectedLevel(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update level configuration",
        variant: "destructive",
      });
    },
  });

  const handleLevelUpdate = (level: number, config: Partial<LevelConfig>) => {
    updateLevelMutation.mutate({ level, config });
  };

  if (levelsLoading || currenciesLoading || badgesLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Loading gamification configuration...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
          🎮 Gamification Configuration
        </h1>
        <p className="text-gray-600 mt-2">
          Configure levels, currency, badges, and Islamic practices for user engagement
        </p>
      </div>

      {/* Quick Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{stats.totalBadgesEarned}</div>
              <p className="text-xs text-muted-foreground">Total Badges Earned</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{stats.levelDistribution?.length || 0}</div>
              <p className="text-xs text-muted-foreground">Active User Levels</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{stats.practiceStats?.length || 0}</div>
              <p className="text-xs text-muted-foreground">Islamic Practices</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">50</div>
              <p className="text-xs text-muted-foreground">Total Levels</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="levels" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="levels">Levels (1-50)</TabsTrigger>
          <TabsTrigger value="currency">Currency</TabsTrigger>
          <TabsTrigger value="badges">Badges</TabsTrigger>
          <TabsTrigger value="quests">Daily Quests</TabsTrigger>
          <TabsTrigger value="practices">Islamic Practices</TabsTrigger>
        </TabsList>

        {/* Level Configuration */}
        <TabsContent value="levels">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>🏆 Level System (1-50)</span>
                <Button variant="outline" size="sm">
                  Import/Export
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Level List */}
                <div>
                  <h3 className="font-semibold mb-4">Select Level to Configure</h3>
                  <div className="grid grid-cols-5 gap-2 max-h-96 overflow-y-auto">
                    {levels?.map((level: LevelConfig) => (
                      <Button
                        key={level.level}
                        variant={selectedLevel?.level === level.level ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedLevel(level)}
                        className="text-xs"
                      >
                        L{level.level}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Level Configuration Form */}
                <div>
                  {selectedLevel ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">Level {selectedLevel.level} Configuration</h3>
                        <Button 
                          size="sm" 
                          onClick={() => setEditingLevel(!editingLevel)}
                        >
                          {editingLevel ? 'Cancel' : 'Edit'}
                        </Button>
                      </div>
                      
                      <Separator />
                      
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="titleEn">English Title</Label>
                            <Input
                              id="titleEn"
                              value={selectedLevel.title_en}
                              disabled={!editingLevel}
                              onChange={(e) => setSelectedLevel({
                                ...selectedLevel,
                                title_en: e.target.value
                              })}
                              data-testid={`input-level-${selectedLevel.level}-title-en`}
                            />
                          </div>
                          <div>
                            <Label htmlFor="titleAr">Arabic Title</Label>
                            <Input
                              id="titleAr"
                              value={selectedLevel.title_ar}
                              disabled={!editingLevel}
                              onChange={(e) => setSelectedLevel({
                                ...selectedLevel,
                                title_ar: e.target.value
                              })}
                              data-testid={`input-level-${selectedLevel.level}-title-ar`}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="pointsRequired">Points Required</Label>
                            <Input
                              id="pointsRequired"
                              type="number"
                              value={selectedLevel.points_required}
                              disabled={!editingLevel}
                              onChange={(e) => setSelectedLevel({
                                ...selectedLevel,
                                points_required: parseInt(e.target.value)
                              })}
                              data-testid={`input-level-${selectedLevel.level}-points`}
                            />
                          </div>
                          <div>
                            <Label htmlFor="roomLimit">Room Creation Limit</Label>
                            <Input
                              id="roomLimit"
                              type="number"
                              value={selectedLevel.room_creation_limit}
                              disabled={!editingLevel}
                              onChange={(e) => setSelectedLevel({
                                ...selectedLevel,
                                room_creation_limit: parseInt(e.target.value)
                              })}
                              data-testid={`input-level-${selectedLevel.level}-room-limit`}
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="coinMultiplier">Coin Multiplier (100 = 1.0x)</Label>
                          <Input
                            id="coinMultiplier"
                            type="number"
                            value={selectedLevel.coin_multiplier}
                            disabled={!editingLevel}
                            onChange={(e) => setSelectedLevel({
                              ...selectedLevel,
                              coin_multiplier: parseInt(e.target.value)
                            })}
                            data-testid={`input-level-${selectedLevel.level}-multiplier`}
                          />
                          <p className="text-sm text-gray-500 mt-1">
                            Current: {((selectedLevel.coin_multiplier || 100) / 100).toFixed(1)}x
                          </p>
                        </div>

                        <div>
                          <Label htmlFor="unlockMessage">Unlock Message</Label>
                          <Input
                            id="unlockMessage"
                            value={selectedLevel.unlock_message || ''}
                            disabled={!editingLevel}
                            onChange={(e) => setSelectedLevel({
                              ...selectedLevel,
                              unlock_message: e.target.value
                            })}
                            data-testid={`input-level-${selectedLevel.level}-message`}
                          />
                        </div>

                        {editingLevel && (
                          <Button
                            className="w-full"
                            onClick={() => handleLevelUpdate(selectedLevel.level, selectedLevel)}
                            disabled={updateLevelMutation.isPending}
                            data-testid={`button-save-level-${selectedLevel.level}`}
                          >
                            {updateLevelMutation.isPending ? 'Saving...' : 'Save Changes'}
                          </Button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      Select a level to configure its settings
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Currency Configuration */}
        <TabsContent value="currency">
          <Card>
            <CardHeader>
              <CardTitle>🪙 Currency & Points Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {currencies?.map((currency: CurrencyConfig) => (
                  <div key={currency.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-semibold capitalize">{currency.activity_type.replace('_', ' ')}</h4>
                      <p className="text-sm text-gray-500">
                        Base: {currency.base_points} points | Multiplier: {currency.multiplier / 100}x
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={currency.is_active ? "default" : "secondary"}>
                        {currency.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                      <Button variant="outline" size="sm" data-testid={`button-edit-currency-${currency.id}`}>
                        Edit
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Badge Configuration */}
        <TabsContent value="badges">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>🏆 Badge System</span>
                <Button data-testid="button-create-badge">Create New Badge</Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {badges?.map((badge: BadgeConfig) => (
                  <div key={badge.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold">{badge.name_en}</h4>
                        <p className="text-sm text-gray-600">{badge.name_ar}</p>
                      </div>
                      <Badge variant="outline">{badge.category}</Badge>
                    </div>
                    <p className="text-sm text-gray-500 mb-3">{badge.description}</p>
                    <div className="flex justify-between items-center text-xs">
                      <span>Target: {badge.target_value}</span>
                      <span>Reward: {badge.points_reward} pts</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Daily Quests Configuration */}
        <TabsContent value="quests">
          <Card>
            <CardHeader>
              <CardTitle>🎯 Daily Quest System</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center text-gray-500 py-8">
                Quest configuration interface coming soon...
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Islamic Practices Configuration */}
        <TabsContent value="practices">
          <Card>
            <CardHeader>
              <CardTitle>🕌 Islamic Practice Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center text-gray-500 py-8">
                Islamic practice configuration interface coming soon...
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}