import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Star, 
  Coins, 
  BookOpen, 
  Target, 
  GripVertical,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Save,
  X
} from 'lucide-react';

interface DhikrLevel {
  id: number;
  level: number;
  arabic: string;
  transliteration: string;
  meaning: string;
  count: number;
  coins: number;
  experience: number;
  category: string;
  isActive: boolean;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  timeEstimateMinutes: number;
  prerequisites?: number[];
  learningObjectives: string[];
  culturalContext: string;
  spiritualBenefits: string[];
  pronunciation: string;
  derivedFrom?: string;
  bestTimes: string[];
  sortOrder: number;
}

export function DragDropLevelManager() {
  const [levels, setLevels] = useState<DhikrLevel[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingLevel, setEditingLevel] = useState<DhikrLevel | null>(null);
  const [draggedLevel, setDraggedLevel] = useState<number | null>(null);
  const [formData, setFormData] = useState<Partial<DhikrLevel>>({
    category: 'Basic Tasbih',
    difficulty: 'beginner',
    isActive: true,
    count: 33,
    coins: 10,
    experience: 25,
    timeEstimateMinutes: 10,
    learningObjectives: [],
    spiritualBenefits: [],
    bestTimes: [],
    sortOrder: 0
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: serverLevels = [], isLoading } = useQuery<DhikrLevel[]>({
    queryKey: ['/api/admin/levels']
  });

  useEffect(() => {
    if (Array.isArray(serverLevels) && serverLevels.length > 0) {
      const sortedLevels = [...serverLevels].sort((a: DhikrLevel, b: DhikrLevel) => 
        (a.sortOrder || a.level || a.id) - (b.sortOrder || b.level || b.id)
      );
      setLevels(sortedLevels);
    }
  }, [serverLevels]);

  const updateLevelOrderMutation = useMutation({
    mutationFn: async (reorderedLevels: DhikrLevel[]) => {
      const updates = reorderedLevels.map((level, index) => ({
        id: level.id,
        sortOrder: index + 1,
        level: index + 1
      }));

      const response = await fetch('/api/admin/levels/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates })
      });
      
      if (!response.ok) throw new Error('Failed to update level order');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/levels'] });
      toast({ title: "Level order updated successfully" });
    }
  });

  const createLevelMutation = useMutation({
    mutationFn: async (levelData: Partial<DhikrLevel>) => {
      const newLevel = {
        ...levelData,
        level: levels.length + 1,
        sortOrder: levels.length + 1
      };
      
      const response = await fetch('/api/admin/levels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLevel)
      });
      if (!response.ok) throw new Error('Failed to create level');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/levels'] });
      setShowCreateModal(false);
      resetForm();
      toast({ title: "Level created successfully" });
    }
  });

  const updateLevelMutation = useMutation({
    mutationFn: async ({ id, ...levelData }: Partial<DhikrLevel> & { id: number }) => {
      const response = await fetch(`/api/admin/levels/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(levelData)
      });
      if (!response.ok) throw new Error('Failed to update level');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/levels'] });
      setEditingLevel(null);
      setShowCreateModal(false);
      toast({ title: "Level updated successfully" });
    }
  });

  const deleteLevelMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/admin/levels/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete level');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/levels'] });
      toast({ title: "Level deleted successfully" });
    }
  });

  const handleDragStart = (e: React.DragEvent, levelId: number) => {
    setDraggedLevel(levelId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetLevelId: number) => {
    e.preventDefault();
    
    if (!draggedLevel || draggedLevel === targetLevelId) {
      setDraggedLevel(null);
      return;
    }

    const reorderedLevels = [...levels];
    const draggedIndex = reorderedLevels.findIndex(l => l.id === draggedLevel);
    const targetIndex = reorderedLevels.findIndex(l => l.id === targetLevelId);

    if (draggedIndex !== -1 && targetIndex !== -1) {
      const [draggedItem] = reorderedLevels.splice(draggedIndex, 1);
      reorderedLevels.splice(targetIndex, 0, draggedItem);

      // Update levels immediately for UI feedback
      setLevels(reorderedLevels);
      
      // Send to server
      updateLevelOrderMutation.mutate(reorderedLevels);
    }

    setDraggedLevel(null);
  };

  const moveLevel = (levelId: number, direction: 'up' | 'down') => {
    const currentIndex = levels.findIndex(l => l.id === levelId);
    if (currentIndex === -1) return;

    if (direction === 'up' && currentIndex === 0) return;
    if (direction === 'down' && currentIndex === levels.length - 1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const reorderedLevels = [...levels];
    
    [reorderedLevels[currentIndex], reorderedLevels[newIndex]] = 
    [reorderedLevels[newIndex], reorderedLevels[currentIndex]];

    setLevels(reorderedLevels);
    updateLevelOrderMutation.mutate(reorderedLevels);
  };

  const toggleLevelActive = async (level: DhikrLevel) => {
    const updatedLevel = { ...level, isActive: !level.isActive };
    updateLevelMutation.mutate(updatedLevel);
  };

  const resetForm = () => {
    setFormData({
      category: 'Basic Tasbih',
      difficulty: 'beginner',
      isActive: true,
      count: 33,
      coins: 10,
      experience: 25,
      timeEstimateMinutes: 10,
      learningObjectives: [],
      spiritualBenefits: [],
      bestTimes: [],
      sortOrder: 0
    });
  };

  const handleEdit = (level: DhikrLevel) => {
    setEditingLevel(level);
    setFormData(level);
    setShowCreateModal(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this level? This action cannot be undone.')) {
      deleteLevelMutation.mutate(id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingLevel) {
      updateLevelMutation.mutate({ ...formData, id: editingLevel.id });
    } else {
      createLevelMutation.mutate(formData);
    }
  };

  const categories = [
    'Basic Tasbih', 'Daily Dhikr', 'Morning Dhikr', 'Evening Dhikr',
    'After Prayer Dhikr', 'Situational Dhikr', 'Advanced Practices',
    'Seasonal Dhikr', 'Night Dhikr', 'Travel Dhikr', 'Forgiveness Dhikr',
    'Gratitude Dhikr', 'Protection Dhikr', 'Healing Dhikr', 'Guidance Dhikr',
    'Special Occasions'
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 mx-auto mb-4 animate-spin border-4 border-blue-600 border-t-transparent rounded-full"></div>
          <p className="text-gray-600">Loading levels...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Level Configuration</h1>
          <p className="text-gray-600 mt-1">Drag and drop to reorder • Click to edit • Toggle to activate</p>
        </div>
        <Button 
          onClick={() => {
            setEditingLevel(null);
            resetForm();
            setShowCreateModal(true);
          }}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Level
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-600" />
              <div>
                <div className="text-sm text-gray-600">Total Levels</div>
                <div className="text-xl font-bold">{levels.length}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-green-600" />
              <div>
                <div className="text-sm text-gray-600">Active</div>
                <div className="text-xl font-bold">{levels.filter(l => l.isActive).length}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-600" />
              <div>
                <div className="text-sm text-gray-600">Categories</div>
                <div className="text-xl font-bold">{new Set(levels.map(l => l.category)).size}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Coins className="w-5 h-5 text-yellow-600" />
              <div>
                <div className="text-sm text-gray-600">Avg Rewards</div>
                <div className="text-xl font-bold">
                  {levels.length ? Math.round(levels.reduce((sum, l) => sum + l.coins, 0) / levels.length) : 0}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Draggable Level List */}
      <div className="space-y-3">
        {levels.map((level, index) => (
          <Card 
            key={level.id}
            className={`transition-all duration-200 hover:shadow-md cursor-move
              ${!level.isActive ? 'opacity-60 bg-gray-50' : 'bg-white'}
              ${draggedLevel === level.id ? 'shadow-lg scale-105 rotate-2' : ''}
            `}
            draggable
            onDragStart={(e) => handleDragStart(e, level.id)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, level.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                {/* Drag Handle */}
                <div className="flex flex-col items-center">
                  <GripVertical className="w-5 h-5 text-gray-400" />
                  <div className="text-xs text-gray-500 mt-1">
                    Level {level.level || index + 1}
                  </div>
                </div>

                {/* Level Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{level.transliteration}</h3>
                        <Badge variant={level.difficulty === 'beginner' ? 'default' : 
                                      level.difficulty === 'intermediate' ? 'secondary' : 'destructive'}>
                          {level.difficulty}
                        </Badge>
                        <Badge variant="outline">{level.category}</Badge>
                      </div>
                      
                      <div className="text-2xl font-arabic mb-2 text-blue-900">{level.arabic}</div>
                      <p className="text-gray-600 italic mb-3">"{level.meaning}"</p>
                      
                      <div className="flex gap-6 text-sm">
                        <div className="flex items-center gap-1">
                          <Coins className="w-4 h-4 text-yellow-600" />
                          <span>{level.coins} coins</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-purple-600" />
                          <span>{level.experience} XP</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <BookOpen className="w-4 h-4 text-blue-600" />
                          <span>{level.count} times</span>
                        </div>
                        <div className="text-gray-500">
                          ~{level.timeEstimateMinutes} min
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => moveLevel(level.id, 'up')}
                        disabled={index === 0}
                      >
                        <ArrowUp className="w-4 h-4" />
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => moveLevel(level.id, 'down')}
                        disabled={index === levels.length - 1}
                      >
                        <ArrowDown className="w-4 h-4" />
                      </Button>

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => toggleLevelActive(level)}
                        title={level.isActive ? "Deactivate level" : "Activate level"}
                      >
                        {level.isActive ? 
                          <Eye className="w-4 h-4 text-green-600" /> : 
                          <EyeOff className="w-4 h-4 text-gray-400" />
                        }
                      </Button>

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(level)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(level.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create/Edit Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingLevel ? `Edit Level ${editingLevel.level}` : 'Create New Level'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Arabic Text *</Label>
                <Input
                  value={formData.arabic || ''}
                  onChange={(e) => setFormData({...formData, arabic: e.target.value})}
                  className="font-arabic text-lg"
                  placeholder="سُبْحَانَ اللهِ"
                  required
                />
              </div>
              <div>
                <Label>Transliteration *</Label>
                <Input
                  value={formData.transliteration || ''}
                  onChange={(e) => setFormData({...formData, transliteration: e.target.value})}
                  placeholder="Subhanallahi"
                  required
                />
              </div>
            </div>

            <div>
              <Label>Meaning (English) *</Label>
              <Input
                value={formData.meaning || ''}
                onChange={(e) => setFormData({...formData, meaning: e.target.value})}
                placeholder="Glory be to Allah"
                required
              />
            </div>

            <div>
              <Label>Pronunciation Guide</Label>
              <Input
                value={formData.pronunciation || ''}
                onChange={(e) => setFormData({...formData, pronunciation: e.target.value})}
                placeholder="Sub-han-al-lah-hee"
              />
            </div>

            {/* Configuration */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Category *</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Difficulty *</Label>
                <Select value={formData.difficulty} onValueChange={(value) => setFormData({...formData, difficulty: value as any})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Rewards & Requirements */}
            <div className="grid grid-cols-4 gap-4">
              <div>
                <Label>Repetition Count *</Label>
                <Input
                  type="number"
                  value={formData.count || ''}
                  onChange={(e) => setFormData({...formData, count: parseInt(e.target.value)})}
                  min="1"
                  required
                />
              </div>
              <div>
                <Label>Coins Reward *</Label>
                <Input
                  type="number"
                  value={formData.coins || ''}
                  onChange={(e) => setFormData({...formData, coins: parseInt(e.target.value)})}
                  min="0"
                  required
                />
              </div>
              <div>
                <Label>Experience Points *</Label>
                <Input
                  type="number"
                  value={formData.experience || ''}
                  onChange={(e) => setFormData({...formData, experience: parseInt(e.target.value)})}
                  min="0"
                  required
                />
              </div>
              <div>
                <Label>Est. Time (min) *</Label>
                <Input
                  type="number"
                  value={formData.timeEstimateMinutes || ''}
                  onChange={(e) => setFormData({...formData, timeEstimateMinutes: parseInt(e.target.value)})}
                  min="1"
                  required
                />
              </div>
            </div>

            {/* Cultural Context */}
            <div>
              <Label>Cultural & Historical Context</Label>
              <Textarea
                value={formData.culturalContext || ''}
                onChange={(e) => setFormData({...formData, culturalContext: e.target.value})}
                placeholder="Provide background about this dhikr's origins, significance, and traditional usage..."
                rows={3}
              />
            </div>

            {/* Active Status */}
            <div className="flex items-center space-x-2">
              <Switch
                id="active-status"
                checked={formData.isActive || false}
                onCheckedChange={(checked) => setFormData({...formData, isActive: checked})}
              />
              <Label htmlFor="active-status">Active (visible to users)</Label>
            </div>

            {/* Form Actions */}
            <div className="flex gap-4 justify-end">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowCreateModal(false)}
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createLevelMutation.isPending || updateLevelMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Save className="w-4 h-4 mr-2" />
                {editingLevel ? 'Update' : 'Create'} Level
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}