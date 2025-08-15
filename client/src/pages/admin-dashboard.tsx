import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  Settings, 
  Trophy, 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Calendar,
  Target,
  Crown,
  Activity,
  BarChart3,
  Shield,
  Database
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface SeasonalCompetition {
  id: number;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  targetCount?: number;
  unlimited: boolean;
  isActive: boolean;
  maxParticipants?: number;
  prizeDescription?: string;
  category: string;
  createdAt: string;
}

interface AdminUser {
  id: string;
  username: string;
  displayName?: string;
  email?: string;
  userType: string;
  isActive: boolean;
  createdAt: string;
  lastLoginAt?: string;
  totalZikir: number;
}

export default function AdminDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingCompetition, setEditingCompetition] = useState<SeasonalCompetition | null>(null);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  
  const [newCompetition, setNewCompetition] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    targetCount: '',
    unlimited: false,
    maxParticipants: '',
    prizeDescription: '',
    category: 'general'
  });

  // Check admin authentication
  useEffect(() => {
    const checkAdminAuth = async () => {
      try {
        const response = await fetch('/api/auth/admin-check');
        if (response.ok) {
          setIsAdminAuthenticated(true);
        } else {
          setLocation('/admin/login');
        }
      } catch (error) {
        setLocation('/admin/login');
      } finally {
        setIsCheckingAuth(false);
      }
    };
    
    checkAdminAuth();
  }, [setLocation]);

  // Fetch admin data - only when authenticated
  const { data: competitions = [] } = useQuery({
    queryKey: ['/api/admin/seasonal-competitions'],
    queryFn: () => fetch('/api/admin/seasonal-competitions').then(res => res.json()),
    enabled: isAdminAuthenticated
  });

  const { data: users = [] } = useQuery({
    queryKey: ['/api/admin/users'],
    queryFn: () => fetch('/api/admin/users').then(res => res.json()),
    enabled: isAdminAuthenticated
  });

  const { data: stats } = useQuery({
    queryKey: ['/api/admin/stats'],
    queryFn: () => fetch('/api/admin/stats').then(res => res.json()),
    enabled: isAdminAuthenticated
  });

  // Show loading while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 animate-spin">
            <div className="w-full h-full border-4 border-blue-200 border-t-blue-600 rounded-full"></div>
          </div>
          <p className="text-gray-600">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  // Redirect handled by useEffect, this is backup
  if (!isAdminAuthenticated) {
    return null;
  }

  // Create competition mutation
  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/admin/seasonal-competitions', 'POST', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/seasonal-competitions'] });
      setIsCreateModalOpen(false);
      resetForm();
      toast({ title: 'Competition created successfully!' });
    },
    onError: (error: any) => {
      toast({ title: 'Error creating competition', description: error.message, variant: 'destructive' });
    }
  });

  // Update competition mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => 
      apiRequest(`/api/admin/seasonal-competitions/${id}`, 'PUT', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/seasonal-competitions'] });
      setEditingCompetition(null);
      toast({ title: 'Competition updated successfully!' });
    },
    onError: (error: any) => {
      toast({ title: 'Error updating competition', description: error.message, variant: 'destructive' });
    }
  });

  // Delete competition mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/admin/seasonal-competitions/${id}`, 'DELETE'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/seasonal-competitions'] });
      toast({ title: 'Competition deleted successfully!' });
    },
    onError: (error: any) => {
      toast({ title: 'Error deleting competition', description: error.message, variant: 'destructive' });
    }
  });

  // Toggle competition status
  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) =>
      apiRequest(`/api/admin/seasonal-competitions/${id}/toggle`, 'PUT', { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/seasonal-competitions'] });
      toast({ title: 'Competition status updated!' });
    }
  });

  // User management mutations
  const toggleUserMutation = useMutation({
    mutationFn: ({ userId, isActive }: { userId: string; isActive: boolean }) =>
      apiRequest(`/api/admin/users/${userId}/toggle`, 'PUT', { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({ title: 'User status updated!' });
    }
  });

  const resetForm = () => {
    setNewCompetition({
      name: '',
      description: '',
      startDate: '',
      endDate: '',
      targetCount: '',
      unlimited: false,
      maxParticipants: '',
      prizeDescription: '',
      category: 'general'
    });
  };

  const handleCreateSubmit = () => {
    if (!newCompetition.name || !newCompetition.description) {
      toast({ title: 'Please fill in required fields', variant: 'destructive' });
      return;
    }

    createMutation.mutate({
      ...newCompetition,
      targetCount: newCompetition.unlimited ? null : parseInt(newCompetition.targetCount) || null,
      maxParticipants: newCompetition.maxParticipants ? parseInt(newCompetition.maxParticipants) : null,
      isActive: true
    });
  };

  const handleEditSubmit = () => {
    if (!editingCompetition) return;

    updateMutation.mutate({
      id: editingCompetition.id,
      data: editingCompetition
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Shield className="w-8 h-8 mr-3 text-blue-600" />
                Admin Dashboard
              </h1>
              <p className="text-gray-600 mt-1">Seasonal Competitions Management Portal</p>
            </div>
            <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2">
              App Founder Portal
            </Badge>
          </div>
        </div>

        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100">Total Competitions</p>
                    <p className="text-2xl font-bold">{stats.totalCompetitions || 0}</p>
                  </div>
                  <Trophy className="w-8 h-8 text-blue-200" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100">Active Users</p>
                    <p className="text-2xl font-bold">{stats.activeUsers || 0}</p>
                  </div>
                  <Users className="w-8 h-8 text-green-200" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100">Total Participants</p>
                    <p className="text-2xl font-bold">{stats.totalParticipants || 0}</p>
                  </div>
                  <Activity className="w-8 h-8 text-purple-200" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100">Total Zikir</p>
                    <p className="text-2xl font-bold">{stats.totalZikir || 0}</p>
                  </div>
                  <BarChart3 className="w-8 h-8 text-orange-200" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content Tabs */}
        <Tabs defaultValue="competitions" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="competitions" className="flex items-center">
              <Trophy className="w-4 h-4 mr-2" />
              Competitions
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center">
              <Users className="w-4 h-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Competitions Tab */}
          <TabsContent value="competitions" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Seasonal Competitions</h2>
              <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-blue-500 to-blue-600">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Competition
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create New Seasonal Competition</DialogTitle>
                  </DialogHeader>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <Label htmlFor="name">Competition Name *</Label>
                      <Input
                        id="name"
                        value={newCompetition.name}
                        onChange={(e) => setNewCompetition({...newCompetition, name: e.target.value})}
                        placeholder="e.g., Ramadan Blessing 2025"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="description">Description *</Label>
                      <Textarea
                        id="description"
                        value={newCompetition.description}
                        onChange={(e) => setNewCompetition({...newCompetition, description: e.target.value})}
                        placeholder="Competition description..."
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="startDate">Start Date</Label>
                        <Input
                          id="startDate"
                          type="datetime-local"
                          value={newCompetition.startDate}
                          onChange={(e) => setNewCompetition({...newCompetition, startDate: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="endDate">End Date</Label>
                        <Input
                          id="endDate"
                          type="datetime-local"
                          value={newCompetition.endDate}
                          onChange={(e) => setNewCompetition({...newCompetition, endDate: e.target.value})}
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="unlimited"
                        checked={newCompetition.unlimited}
                        onCheckedChange={(checked) => setNewCompetition({...newCompetition, unlimited: checked})}
                      />
                      <Label htmlFor="unlimited">Unlimited Competition</Label>
                    </div>
                    
                    {!newCompetition.unlimited && (
                      <div>
                        <Label htmlFor="targetCount">Target Count</Label>
                        <Input
                          id="targetCount"
                          type="number"
                          value={newCompetition.targetCount}
                          onChange={(e) => setNewCompetition({...newCompetition, targetCount: e.target.value})}
                          placeholder="e.g., 1000"
                        />
                      </div>
                    )}
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="category">Category</Label>
                        <Select value={newCompetition.category} onValueChange={(value) => setNewCompetition({...newCompetition, category: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="general">General</SelectItem>
                            <SelectItem value="ramadan">Ramadan</SelectItem>
                            <SelectItem value="hajj">Hajj</SelectItem>
                            <SelectItem value="muharram">Muharram</SelectItem>
                            <SelectItem value="special">Special Event</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="maxParticipants">Max Participants</Label>
                        <Input
                          id="maxParticipants"
                          type="number"
                          value={newCompetition.maxParticipants}
                          onChange={(e) => setNewCompetition({...newCompetition, maxParticipants: e.target.value})}
                          placeholder="Leave empty for unlimited"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="prizeDescription">Prize Description</Label>
                      <Textarea
                        id="prizeDescription"
                        value={newCompetition.prizeDescription}
                        onChange={(e) => setNewCompetition({...newCompetition, prizeDescription: e.target.value})}
                        placeholder="Describe the prize or reward..."
                      />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2 mt-6">
                    <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateSubmit} disabled={createMutation.isPending}>
                      {createMutation.isPending ? 'Creating...' : 'Create Competition'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {competitions.map((competition: SeasonalCompetition) => (
                <Card key={competition.id} className="border shadow-sm">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center">
                          {competition.name}
                          <Badge 
                            className={`ml-2 ${competition.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                          >
                            {competition.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </CardTitle>
                        <p className="text-sm text-gray-600 mt-1">{competition.description}</p>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleStatusMutation.mutate({
                            id: competition.id,
                            isActive: !competition.isActive
                          })}
                        >
                          {competition.isActive ? 'Deactivate' : 'Activate'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingCompetition(competition)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteMutation.mutate(competition.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Category</p>
                        <p className="font-medium">{competition.category}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Target</p>
                        <p className="font-medium">
                          {competition.unlimited ? 'Unlimited' : `${competition.targetCount} zikir`}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Duration</p>
                        <p className="font-medium">
                          {new Date(competition.startDate).toLocaleDateString()} - {new Date(competition.endDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Created</p>
                        <p className="font-medium">{new Date(competition.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    {competition.prizeDescription && (
                      <div className="mt-3 p-2 bg-yellow-50 rounded border">
                        <p className="text-sm font-medium text-yellow-800">Prize: {competition.prizeDescription}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">User Management</h2>
              <div className="flex space-x-2">
                <Input placeholder="Search users..." className="w-64" />
                <Button variant="outline">
                  <Eye className="w-4 h-4 mr-2" />
                  View All
                </Button>
              </div>
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b bg-gray-50">
                      <tr>
                        <th className="text-left p-4">User</th>
                        <th className="text-left p-4">Type</th>
                        <th className="text-left p-4">Total Zikir</th>
                        <th className="text-left p-4">Last Login</th>
                        <th className="text-left p-4">Status</th>
                        <th className="text-left p-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user: AdminUser) => (
                        <tr key={user.id} className="border-b hover:bg-gray-50">
                          <td className="p-4">
                            <div>
                              <p className="font-medium">{user.displayName || user.username}</p>
                              <p className="text-sm text-gray-500">{user.email || user.username}</p>
                            </div>
                          </td>
                          <td className="p-4">
                            <Badge className={user.userType === 'organization' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}>
                              {user.userType}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <span className="font-medium">{user.totalZikir || 0}</span>
                          </td>
                          <td className="p-4">
                            <span className="text-sm text-gray-600">
                              {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Never'}
                            </span>
                          </td>
                          <td className="p-4">
                            <Badge className={user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                              {user.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedUser(user)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => toggleUserMutation.mutate({
                                  userId: user.id,
                                  isActive: !user.isActive
                                })}
                              >
                                {user.isActive ? 'Deactivate' : 'Activate'}
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <h2 className="text-2xl font-semibold">System Settings</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Database className="w-5 h-5 mr-2" />
                    Database Management
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline" className="w-full justify-start">
                    Export Competition Data
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    Export User Data
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    Backup Database
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="w-5 h-5 mr-2" />
                    System Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="maintenance">Maintenance Mode</Label>
                    <Switch id="maintenance" />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="registration">User Registration</Label>
                    <Switch id="registration" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="notifications">Push Notifications</Label>
                    <Switch id="notifications" defaultChecked />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Competition Modal */}
      {editingCompetition && (
        <Dialog open={!!editingCompetition} onOpenChange={() => setEditingCompetition(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Competition</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="edit-name">Competition Name</Label>
                <Input
                  id="edit-name"
                  value={editingCompetition.name}
                  onChange={(e) => setEditingCompetition({...editingCompetition, name: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={editingCompetition.description}
                  onChange={(e) => setEditingCompetition({...editingCompetition, description: e.target.value})}
                />
              </div>
              {/* Add more fields as needed */}
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <Button variant="outline" onClick={() => setEditingCompetition(null)}>
                Cancel
              </Button>
              <Button onClick={handleEditSubmit} disabled={updateMutation.isPending}>
                {updateMutation.isPending ? 'Updating...' : 'Update Competition'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* User Details Modal */}
      {selectedUser && (
        <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>User Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium">Username</h4>
                <p className="text-gray-600">{selectedUser.username}</p>
              </div>
              <div>
                <h4 className="font-medium">Display Name</h4>
                <p className="text-gray-600">{selectedUser.displayName || 'Not set'}</p>
              </div>
              <div>
                <h4 className="font-medium">User Type</h4>
                <Badge className={selectedUser.userType === 'organization' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}>
                  {selectedUser.userType}
                </Badge>
              </div>
              <div>
                <h4 className="font-medium">Total Zikir</h4>
                <p className="text-gray-600">{selectedUser.totalZikir || 0}</p>
              </div>
              <div>
                <h4 className="font-medium">Created At</h4>
                <p className="text-gray-600">{new Date(selectedUser.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <h4 className="font-medium">Last Login</h4>
                <p className="text-gray-600">
                  {selectedUser.lastLoginAt ? new Date(selectedUser.lastLoginAt).toLocaleString() : 'Never'}
                </p>
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <Button onClick={() => setSelectedUser(null)}>
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}