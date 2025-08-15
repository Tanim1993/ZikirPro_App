import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
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

// Quest Configuration Component
function QuestConfiguration() {
  const [selectedQuest, setSelectedQuest] = useState<any>(null);
  const [editingQuest, setEditingQuest] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch quest configurations
  const { data: quests, isLoading } = useQuery({
    queryKey: ['/api/admin/quests'],
  });

  // Update quest mutation
  const updateQuestMutation = useMutation({
    mutationFn: async (data: { id: number; config: any }) => {
      return apiRequest(`/api/admin/quests/${data.id}`, {
        method: 'PUT',
        body: JSON.stringify(data.config),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/quests'] });
      toast({
        title: "Success",
        description: "Quest configuration updated successfully",
      });
      setEditingQuest(false);
      setSelectedQuest(null);
    },
  });

  if (isLoading) {
    return <div className="text-center py-8">Loading quests...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>🎯 Daily Quest System</span>
          <Dialog>
            <DialogTrigger asChild>
              <Button data-testid="button-create-quest">Create New Quest</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Quest</DialogTitle>
              </DialogHeader>
              <CreateQuestForm />
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quest List */}
          <div>
            <h3 className="font-semibold mb-4">Available Quests</h3>
            <div className="space-y-2">
              {quests?.map((quest: any) => (
                <Button
                  key={quest.id}
                  variant={selectedQuest?.id === quest.id ? "default" : "outline"}
                  className="w-full justify-start text-left h-auto p-4"
                  onClick={() => setSelectedQuest(quest)}
                >
                  <div>
                    <div className="font-semibold">{quest.name_en}</div>
                    <div className="text-sm text-gray-500">{quest.name_ar}</div>
                    <div className="text-xs text-gray-400">{quest.quest_type} • {quest.points_reward} pts</div>
                  </div>
                </Button>
              ))}
            </div>
          </div>

          {/* Quest Configuration Form */}
          <div>
            {selectedQuest ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{selectedQuest.name_en}</h3>
                  <Button 
                    size="sm" 
                    onClick={() => setEditingQuest(!editingQuest)}
                  >
                    {editingQuest ? 'Cancel' : 'Edit'}
                  </Button>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="questNameEn">English Name</Label>
                      <Input
                        id="questNameEn"
                        value={selectedQuest.name_en}
                        disabled={!editingQuest}
                        onChange={(e) => setSelectedQuest({
                          ...selectedQuest,
                          name_en: e.target.value
                        })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="questNameAr">Arabic Name</Label>
                      <Input
                        id="questNameAr"
                        value={selectedQuest.name_ar}
                        disabled={!editingQuest}
                        onChange={(e) => setSelectedQuest({
                          ...selectedQuest,
                          name_ar: e.target.value
                        })}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="questDesc">Description</Label>
                    <Input
                      id="questDesc"
                      value={selectedQuest.description}
                      disabled={!editingQuest}
                      onChange={(e) => setSelectedQuest({
                        ...selectedQuest,
                        description: e.target.value
                      })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="questTarget">Target Value</Label>
                      <Input
                        id="questTarget"
                        type="number"
                        value={selectedQuest.target_value}
                        disabled={!editingQuest}
                        onChange={(e) => setSelectedQuest({
                          ...selectedQuest,
                          target_value: parseInt(e.target.value)
                        })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="questReward">Points Reward</Label>
                      <Input
                        id="questReward"
                        type="number"
                        value={selectedQuest.points_reward}
                        disabled={!editingQuest}
                        onChange={(e) => setSelectedQuest({
                          ...selectedQuest,
                          points_reward: parseInt(e.target.value)
                        })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="questMinLevel">Min Level</Label>
                      <Input
                        id="questMinLevel"
                        type="number"
                        value={selectedQuest.min_level}
                        disabled={!editingQuest}
                        onChange={(e) => setSelectedQuest({
                          ...selectedQuest,
                          min_level: parseInt(e.target.value)
                        })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="questMaxLevel">Max Level</Label>
                      <Input
                        id="questMaxLevel"
                        type="number"
                        value={selectedQuest.max_level}
                        disabled={!editingQuest}
                        onChange={(e) => setSelectedQuest({
                          ...selectedQuest,
                          max_level: parseInt(e.target.value)
                        })}
                      />
                    </div>
                  </div>

                  {editingQuest && (
                    <Button
                      className="w-full"
                      onClick={() => updateQuestMutation.mutate({ 
                        id: selectedQuest.id, 
                        config: {
                          nameEn: selectedQuest.name_en,
                          nameAr: selectedQuest.name_ar,
                          description: selectedQuest.description,
                          targetValue: selectedQuest.target_value,
                          pointsReward: selectedQuest.points_reward,
                          minLevel: selectedQuest.min_level,
                          maxLevel: selectedQuest.max_level,
                          isActive: selectedQuest.is_active
                        }
                      })}
                      disabled={updateQuestMutation.isPending}
                    >
                      {updateQuestMutation.isPending ? 'Saving...' : 'Save Changes'}
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                Select a quest to configure its settings
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Islamic Practice Configuration Component
function IslamicPracticeConfiguration() {
  const [selectedPractice, setSelectedPractice] = useState<any>(null);
  const [editingPractice, setEditingPractice] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch practice configurations
  const { data: practices, isLoading } = useQuery({
    queryKey: ['/api/admin/practices'],
  });

  // Update practice mutation
  const updatePracticeMutation = useMutation({
    mutationFn: async (data: { id: number; config: any }) => {
      return apiRequest(`/api/admin/practices/${data.id}`, {
        method: 'PUT',
        body: JSON.stringify(data.config),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/practices'] });
      toast({
        title: "Success",
        description: "Islamic practice updated successfully",
      });
      setEditingPractice(false);
      setSelectedPractice(null);
    },
  });

  if (isLoading) {
    return <div className="text-center py-8">Loading Islamic practices...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>🕌 Islamic Practice Configuration</span>
          <Dialog>
            <DialogTrigger asChild>
              <Button data-testid="button-create-practice">Create New Practice</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Islamic Practice</DialogTitle>
              </DialogHeader>
              <CreatePracticeForm />
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Practice List */}
          <div>
            <h3 className="font-semibold mb-4">Islamic Practices</h3>
            <div className="space-y-2">
              {practices?.map((practice: any) => (
                <Button
                  key={practice.id}
                  variant={selectedPractice?.id === practice.id ? "default" : "outline"}
                  className="w-full justify-start text-left h-auto p-4"
                  onClick={() => setSelectedPractice(practice)}
                >
                  <div>
                    <div className="font-semibold">{practice.name_en}</div>
                    <div className="text-sm text-gray-500">{practice.name_ar}</div>
                    <div className="text-xs text-gray-400">{practice.points_reward} pts • {practice.recommended_time}</div>
                  </div>
                </Button>
              ))}
            </div>
          </div>

          {/* Practice Configuration Form */}
          <div>
            {selectedPractice ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{selectedPractice.name_en}</h3>
                  <Button 
                    size="sm" 
                    onClick={() => setEditingPractice(!editingPractice)}
                  >
                    {editingPractice ? 'Cancel' : 'Edit'}
                  </Button>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="practiceDesc">Description</Label>
                    <Input
                      id="practiceDesc"
                      value={selectedPractice.description}
                      disabled
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="practicePoints">Points Reward</Label>
                      <Input
                        id="practicePoints"
                        type="number"
                        value={selectedPractice.points_reward}
                        disabled={!editingPractice}
                        onChange={(e) => setSelectedPractice({
                          ...selectedPractice,
                          points_reward: parseInt(e.target.value)
                        })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="practiceStreak">Streak Bonus</Label>
                      <Input
                        id="practiceStreak"
                        type="number"
                        value={selectedPractice.streak_bonus}
                        disabled={!editingPractice}
                        onChange={(e) => setSelectedPractice({
                          ...selectedPractice,
                          streak_bonus: parseInt(e.target.value)
                        })}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="practiceTime">Recommended Time</Label>
                    <Input
                      id="practiceTime"
                      value={selectedPractice.recommended_time}
                      disabled
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="practiceActive"
                      checked={selectedPractice.is_active}
                      disabled={!editingPractice}
                      onChange={(e) => setSelectedPractice({
                        ...selectedPractice,
                        is_active: e.target.checked
                      })}
                    />
                    <Label htmlFor="practiceActive">Practice is active</Label>
                  </div>

                  {editingPractice && (
                    <Button
                      className="w-full"
                      onClick={() => updatePracticeMutation.mutate({ 
                        id: selectedPractice.id, 
                        config: {
                          pointsReward: selectedPractice.points_reward,
                          streakBonus: selectedPractice.streak_bonus,
                          isActive: selectedPractice.is_active
                        }
                      })}
                      disabled={updatePracticeMutation.isPending}
                    >
                      {updatePracticeMutation.isPending ? 'Saving...' : 'Save Changes'}
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                Select a practice to configure its settings
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
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
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" data-testid={`button-edit-currency-${currency.id}`}>
                            Edit
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Edit Currency: {currency.activity_type}</DialogTitle>
                          </DialogHeader>
                          <EditCurrencyForm currency={currency} />
                        </DialogContent>
                      </Dialog>
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
                <Dialog>
                  <DialogTrigger asChild>
                    <Button data-testid="button-create-badge">Create New Badge</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Create New Badge</DialogTitle>
                    </DialogHeader>
                    <CreateBadgeForm />
                  </DialogContent>
                </Dialog>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {badges?.map((badge: BadgeConfig) => (
                  <div key={badge.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center justify-between w-full">
                          <h4 className="font-semibold">{badge.name_en}</h4>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">Edit</Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Edit Badge: {badge.name_en}</DialogTitle>
                              </DialogHeader>
                              <EditBadgeForm badge={badge} />
                            </DialogContent>
                          </Dialog>
                        </div>
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
          <QuestConfiguration />
        </TabsContent>

        {/* Islamic Practices Configuration */}
        <TabsContent value="practices">
          <IslamicPracticeConfiguration />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Edit Currency Form Component
function EditCurrencyForm({ currency }: { currency: any }) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    basePoints: currency.base_points,
    multiplier: currency.multiplier,
    seasonalBonus: currency.seasonal_bonus,
    isActive: currency.is_active
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => fetch(`/api/admin/currency/${currency.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        basePoints: data.basePoints,
        multiplier: data.multiplier,
        seasonalBonus: data.seasonalBonus,
        isActive: data.isActive
      })
    }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/currency'] });
      toast({ title: 'Currency updated successfully!' });
    },
    onError: (error: any) => {
      toast({ title: 'Update failed', description: error.message, variant: 'destructive' });
    }
  });

  return (
    <form onSubmit={(e) => { e.preventDefault(); updateMutation.mutate(formData); }} className="space-y-4">
      <div>
        <Label>Base Points</Label>
        <Input type="number" value={formData.basePoints} onChange={(e) => setFormData({...formData, basePoints: parseInt(e.target.value)})} />
      </div>
      <div>
        <Label>Multiplier</Label>
        <Input type="number" value={formData.multiplier} onChange={(e) => setFormData({...formData, multiplier: parseInt(e.target.value)})} />
      </div>
      <div>
        <Label>Seasonal Bonus</Label>
        <Input type="number" value={formData.seasonalBonus} onChange={(e) => setFormData({...formData, seasonalBonus: parseInt(e.target.value)})} />
      </div>
      <div className="flex items-center space-x-2">
        <Switch checked={formData.isActive} onCheckedChange={(checked) => setFormData({...formData, isActive: checked})} />
        <Label>Active</Label>
      </div>
      <Button type="submit" disabled={updateMutation.isPending}>
        {updateMutation.isPending ? 'Updating...' : 'Update Currency'}
      </Button>
    </form>
  );
}

// Create Badge Form Component
function CreateBadgeForm() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    badgeId: '',
    nameEn: '',
    nameAr: '',
    description: '',
    category: 'zikir',
    targetValue: 1,
    pointsReward: 100,
    coinsReward: 100
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch('/api/admin/badges', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data)
    }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/badges'] });
      toast({ title: 'Badge created successfully!' });
      setFormData({ badgeId: '', nameEn: '', nameAr: '', description: '', category: 'zikir', targetValue: 1, pointsReward: 100, coinsReward: 100 });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      badgeId: formData.badgeId,
      nameEn: formData.nameEn,
      nameAr: formData.nameAr,
      description: formData.description,
      category: formData.category,
      criteriaType: 'count',
      targetValue: formData.targetValue,
      pointsReward: formData.pointsReward,
      coinsReward: formData.coinsReward
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Badge ID</Label>
          <Input value={formData.badgeId} onChange={(e) => setFormData({...formData, badgeId: e.target.value})} required />
        </div>
        <div>
          <Label>Category</Label>
          <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="zikir">Zikir</SelectItem>
              <SelectItem value="consistency">Consistency</SelectItem>
              <SelectItem value="community">Community</SelectItem>
              <SelectItem value="seasonal">Seasonal</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>English Name</Label>
          <Input value={formData.nameEn} onChange={(e) => setFormData({...formData, nameEn: e.target.value})} required />
        </div>
        <div>
          <Label>Arabic Name</Label>
          <Input value={formData.nameAr} onChange={(e) => setFormData({...formData, nameAr: e.target.value})} required />
        </div>
      </div>
      <div>
        <Label>Description</Label>
        <Textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label>Target Value</Label>
          <Input type="number" value={formData.targetValue} onChange={(e) => setFormData({...formData, targetValue: parseInt(e.target.value)})} />
        </div>
        <div>
          <Label>Points Reward</Label>
          <Input type="number" value={formData.pointsReward} onChange={(e) => setFormData({...formData, pointsReward: parseInt(e.target.value)})} />
        </div>
        <div>
          <Label>Coins Reward</Label>
          <Input type="number" value={formData.coinsReward} onChange={(e) => setFormData({...formData, coinsReward: parseInt(e.target.value)})} />
        </div>
      </div>
      <Button type="submit" disabled={createMutation.isPending}>
        {createMutation.isPending ? 'Creating...' : 'Create Badge'}
      </Button>
    </form>
  );
}

// Create Quest Form Component
function CreateQuestForm() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    questId: '',
    nameEn: '',
    nameAr: '',
    description: '',
    questType: 'zikir',
    targetValue: 1,
    pointsReward: 50,
    minLevel: 1,
    maxLevel: 50
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/admin/quests', 'POST', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/quests'] });
      toast({ title: 'Quest created successfully!' });
      setFormData({ questId: '', nameEn: '', nameAr: '', description: '', questType: 'zikir', targetValue: 1, pointsReward: 50, minLevel: 1, maxLevel: 50 });
    }
  });

  return (
    <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate({...formData, timeLimit: 'all_day'}); }} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Quest ID</Label>
          <Input value={formData.questId} onChange={(e) => setFormData({...formData, questId: e.target.value})} required />
        </div>
        <div>
          <Label>Quest Type</Label>
          <Select value={formData.questType} onValueChange={(value) => setFormData({...formData, questType: value})}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="zikir">Zikir</SelectItem>
              <SelectItem value="community">Community</SelectItem>
              <SelectItem value="consistency">Consistency</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>English Name</Label>
          <Input value={formData.nameEn} onChange={(e) => setFormData({...formData, nameEn: e.target.value})} required />
        </div>
        <div>
          <Label>Arabic Name</Label>
          <Input value={formData.nameAr} onChange={(e) => setFormData({...formData, nameAr: e.target.value})} required />
        </div>
      </div>
      <div>
        <Label>Description</Label>
        <Textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
      </div>
      <div className="grid grid-cols-4 gap-4">
        <div>
          <Label>Target Value</Label>
          <Input type="number" value={formData.targetValue} onChange={(e) => setFormData({...formData, targetValue: parseInt(e.target.value)})} />
        </div>
        <div>
          <Label>Points Reward</Label>
          <Input type="number" value={formData.pointsReward} onChange={(e) => setFormData({...formData, pointsReward: parseInt(e.target.value)})} />
        </div>
        <div>
          <Label>Min Level</Label>
          <Input type="number" min="1" max="50" value={formData.minLevel} onChange={(e) => setFormData({...formData, minLevel: parseInt(e.target.value)})} />
        </div>
        <div>
          <Label>Max Level</Label>
          <Input type="number" min="1" max="50" value={formData.maxLevel} onChange={(e) => setFormData({...formData, maxLevel: parseInt(e.target.value)})} />
        </div>
      </div>
      <Button type="submit" disabled={createMutation.isPending}>
        {createMutation.isPending ? 'Creating...' : 'Create Quest'}
      </Button>
    </form>
  );
}

// Create Practice Form Component  
function CreatePracticeForm() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    practiceId: '',
    nameEn: '',
    nameAr: '',
    description: '',
    recommendedTime: 'any_time',
    pointsReward: 100,
    streakBonus: 10
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/admin/practices', 'POST', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/practices'] });
      toast({ title: 'Practice created successfully!' });
      setFormData({ practiceId: '', nameEn: '', nameAr: '', description: '', recommendedTime: 'any_time', pointsReward: 100, streakBonus: 10 });
    }
  });

  return (
    <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate({...formData, verificationType: 'self_confirmation'}); }} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Practice ID</Label>
          <Input value={formData.practiceId} onChange={(e) => setFormData({...formData, practiceId: e.target.value})} required />
        </div>
        <div>
          <Label>Recommended Time</Label>
          <Select value={formData.recommendedTime} onValueChange={(value) => setFormData({...formData, recommendedTime: value})}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="any_time">Any Time</SelectItem>
              <SelectItem value="night_time">Night Time</SelectItem>
              <SelectItem value="friday_only">Friday Only</SelectItem>
              <SelectItem value="all_day">All Day</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>English Name</Label>
          <Input value={formData.nameEn} onChange={(e) => setFormData({...formData, nameEn: e.target.value})} required />
        </div>
        <div>
          <Label>Arabic Name</Label>
          <Input value={formData.nameAr} onChange={(e) => setFormData({...formData, nameAr: e.target.value})} required />
        </div>
      </div>
      <div>
        <Label>Description</Label>
        <Textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Points Reward</Label>
          <Input type="number" value={formData.pointsReward} onChange={(e) => setFormData({...formData, pointsReward: parseInt(e.target.value)})} />
        </div>
        <div>
          <Label>Streak Bonus</Label>
          <Input type="number" value={formData.streakBonus} onChange={(e) => setFormData({...formData, streakBonus: parseInt(e.target.value)})} />
        </div>
      </div>
      <Button type="submit" disabled={createMutation.isPending}>
        {createMutation.isPending ? 'Creating...' : 'Create Practice'}
      </Button>
    </form>
  );
}

// Edit Badge Form Component
function EditBadgeForm({ badge }: { badge: any }) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    nameEn: badge.name_en,
    nameAr: badge.name_ar,
    description: badge.description,
    category: badge.category,
    targetValue: badge.target_value,
    pointsReward: badge.points_reward,
    coinsReward: badge.coins_reward,
    isActive: badge.is_active
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => fetch(`/api/admin/badges/${badge.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data)
    }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/badges'] });
      toast({ title: 'Badge updated successfully!' });
    },
    onError: (error: any) => {
      toast({ title: 'Update failed', description: error.message, variant: 'destructive' });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({
      nameEn: formData.nameEn,
      nameAr: formData.nameAr,
      description: formData.description,
      category: formData.category,
      targetValue: formData.targetValue,
      pointsReward: formData.pointsReward,
      coinsReward: formData.coinsReward,
      isActive: formData.isActive
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Category</Label>
          <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="zikir">Zikir</SelectItem>
              <SelectItem value="consistency">Consistency</SelectItem>
              <SelectItem value="community">Community</SelectItem>
              <SelectItem value="seasonal">Seasonal</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center space-x-2">
          <Switch checked={formData.isActive} onCheckedChange={(checked) => setFormData({...formData, isActive: checked})} />
          <Label>Active</Label>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>English Name</Label>
          <Input value={formData.nameEn} onChange={(e) => setFormData({...formData, nameEn: e.target.value})} required />
        </div>
        <div>
          <Label>Arabic Name</Label>
          <Input value={formData.nameAr} onChange={(e) => setFormData({...formData, nameAr: e.target.value})} required />
        </div>
      </div>
      <div>
        <Label>Description</Label>
        <Textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label>Target Value</Label>
          <Input type="number" value={formData.targetValue} onChange={(e) => setFormData({...formData, targetValue: parseInt(e.target.value)})} />
        </div>
        <div>
          <Label>Points Reward</Label>
          <Input type="number" value={formData.pointsReward} onChange={(e) => setFormData({...formData, pointsReward: parseInt(e.target.value)})} />
        </div>
        <div>
          <Label>Coins Reward</Label>
          <Input type="number" value={formData.coinsReward} onChange={(e) => setFormData({...formData, coinsReward: parseInt(e.target.value)})} />
        </div>
      </div>
      <Button type="submit" disabled={updateMutation.isPending}>
        {updateMutation.isPending ? 'Updating...' : 'Update Badge'}
      </Button>
    </form>
  );
}