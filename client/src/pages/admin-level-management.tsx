import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Star, Coins, BookOpen, Target } from 'lucide-react';

interface DhikrLevel {
  id: number;
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
}

export default function AdminLevelManagement() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingLevel, setEditingLevel] = useState<DhikrLevel | null>(null);
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
    bestTimes: []
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: levels = [], isLoading } = useQuery({
    queryKey: ['/api/admin/levels'],
  });

  const createLevelMutation = useMutation({
    mutationFn: async (levelData: Partial<DhikrLevel>) => {
      const response = await fetch('/api/admin/levels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(levelData)
      });
      if (!response.ok) throw new Error('Failed to create level');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/levels'] });
      setShowCreateModal(false);
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
        bestTimes: []
      });
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingLevel) {
      updateLevelMutation.mutate({ ...formData, id: editingLevel.id });
    } else {
      createLevelMutation.mutate(formData);
    }
  };

  const handleEdit = (level: DhikrLevel) => {
    setEditingLevel(level);
    setFormData(level);
    setShowCreateModal(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this level?')) {
      deleteLevelMutation.mutate(id);
    }
  };

  const categories = [
    'Basic Tasbih',
    'Daily Dhikr', 
    'Morning Dhikr',
    'Evening Dhikr',
    'After Prayer Dhikr',
    'Situational Dhikr',
    'Advanced Practices',
    'Seasonal Dhikr',
    'Night Dhikr',
    'Travel Dhikr',
    'Forgiveness Dhikr',
    'Gratitude Dhikr',
    'Protection Dhikr',
    'Healing Dhikr',
    'Guidance Dhikr',
    'Special Occasions'
  ];

  const difficulties = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Level Management</h1>
            <p className="text-gray-600">Create and manage spiritual progression levels</p>
          </div>
          <Button 
            onClick={() => {
              setEditingLevel(null);
              setShowCreateModal(true);
            }}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Level
          </Button>
        </div>

        {/* Stats Cards */}
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
                <BookOpen className="w-5 h-5 text-green-600" />
                <div>
                  <div className="text-sm text-gray-600">Active</div>
                  <div className="text-xl font-bold">{levels.filter((l: any) => l.isActive).length}</div>
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
                  <div className="text-xl font-bold">{new Set(levels.map((l: any) => l.category)).size}</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-yellow-600" />
                <div>
                  <div className="text-sm text-gray-600">Avg Coins</div>
                  <div className="text-xl font-bold">
                    {levels.length ? Math.round(levels.reduce((sum: number, l: any) => sum + l.coins, 0) / levels.length) : 0}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Levels Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {levels.map((level: DhikrLevel) => (
            <Card key={level.id} className={!level.isActive ? 'opacity-60' : ''}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">Level {level.id}</CardTitle>
                    <p className="text-sm text-gray-600">{level.transliteration}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => handleEdit(level)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDelete(level.id)}>
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-xl font-arabic text-center">{level.arabic}</div>
                  <p className="text-sm text-gray-600 italic">"{level.meaning}"</p>
                  
                  <div className="flex gap-2 flex-wrap">
                    <Badge variant="outline">{level.category}</Badge>
                    <Badge variant={level.difficulty === 'beginner' ? 'default' : level.difficulty === 'intermediate' ? 'secondary' : 'destructive'}>
                      {level.difficulty}
                    </Badge>
                    {!level.isActive && <Badge variant="destructive">Inactive</Badge>}
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="text-center">
                      <div className="font-semibold">{level.coins}</div>
                      <div className="text-gray-600">Coins</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold">{level.experience}</div>
                      <div className="text-gray-600">XP</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold">{level.count}</div>
                      <div className="text-gray-600">Count</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Create/Edit Modal */}
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingLevel ? 'Edit Level' : 'Create New Level'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Arabic Text</Label>
                  <Input
                    value={formData.arabic || ''}
                    onChange={(e) => setFormData({...formData, arabic: e.target.value})}
                    className="font-arabic"
                    required
                  />
                </div>
                <div>
                  <Label>Transliteration</Label>
                  <Input
                    value={formData.transliteration || ''}
                    onChange={(e) => setFormData({...formData, transliteration: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div>
                <Label>Meaning (English)</Label>
                <Input
                  value={formData.meaning || ''}
                  onChange={(e) => setFormData({...formData, meaning: e.target.value})}
                  required
                />
              </div>

              <div>
                <Label>Pronunciation Guide</Label>
                <Input
                  value={formData.pronunciation || ''}
                  onChange={(e) => setFormData({...formData, pronunciation: e.target.value})}
                  placeholder="Phonetic pronunciation guide"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Category</Label>
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
                  <Label>Difficulty</Label>
                  <Select value={formData.difficulty} onValueChange={(value) => setFormData({...formData, difficulty: value as any})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {difficulties.map(diff => (
                        <SelectItem key={diff.value} value={diff.value}>{diff.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div>
                  <Label>Count</Label>
                  <Input
                    type="number"
                    value={formData.count || ''}
                    onChange={(e) => setFormData({...formData, count: parseInt(e.target.value)})}
                    required
                  />
                </div>
                <div>
                  <Label>Coins</Label>
                  <Input
                    type="number"
                    value={formData.coins || ''}
                    onChange={(e) => setFormData({...formData, coins: parseInt(e.target.value)})}
                    required
                  />
                </div>
                <div>
                  <Label>Experience</Label>
                  <Input
                    type="number"
                    value={formData.experience || ''}
                    onChange={(e) => setFormData({...formData, experience: parseInt(e.target.value)})}
                    required
                  />
                </div>
                <div>
                  <Label>Time (min)</Label>
                  <Input
                    type="number"
                    value={formData.timeEstimateMinutes || ''}
                    onChange={(e) => setFormData({...formData, timeEstimateMinutes: parseInt(e.target.value)})}
                    required
                  />
                </div>
              </div>

              <div>
                <Label>Cultural Context</Label>
                <Textarea
                  value={formData.culturalContext || ''}
                  onChange={(e) => setFormData({...formData, culturalContext: e.target.value})}
                  placeholder="Historical and cultural background of this dhikr"
                />
              </div>

              <div className="flex gap-4 justify-end">
                <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createLevelMutation.isPending || updateLevelMutation.isPending}>
                  {editingLevel ? 'Update' : 'Create'} Level
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}