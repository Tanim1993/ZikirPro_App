import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, Users, Trophy, Settings, Plus, Edit, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

export default function AdminSimple() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('competitions');

  // Fetch data
  const { data: competitions = [], isLoading: competitionsLoading } = useQuery({
    queryKey: ['/api/admin/seasonal-competitions'],
    queryFn: async () => {
      const res = await fetch('/api/admin/seasonal-competitions');
      if (!res.ok) throw new Error('Failed to fetch competitions');
      return res.json();
    }
  });

  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ['/api/admin/users'],
    queryFn: async () => {
      const res = await fetch('/api/admin/users');
      if (!res.ok) {
        console.error('Failed to fetch users');
        return [];
      }
      return res.json();
    }
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/admin/stats'],
    queryFn: async () => {
      const res = await fetch('/api/admin/stats');
      if (!res.ok) throw new Error('Failed to fetch stats');
      return res.json();
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Shield className="w-8 h-8" />
            <div>
              <h1 className="text-2xl font-bold">Admin Portal</h1>
              <p className="text-blue-100">App Founder Dashboard</p>
            </div>
          </div>
          <Badge variant="secondary" className="bg-white/20 text-white border-0">
            Founder Access
          </Badge>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Trophy className="w-8 h-8 text-purple-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Competitions</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {statsLoading ? '...' : stats?.totalCompetitions || '0'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="w-8 h-8 text-blue-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {statsLoading ? '...' : stats?.activeUsers || '0'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="w-8 h-8 text-green-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Participants</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {statsLoading ? '...' : stats?.totalParticipants || '0'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Trophy className="w-8 h-8 text-orange-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Zikir</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {statsLoading ? '...' : (stats?.totalZikir || '0')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="competitions" className="flex items-center space-x-2">
              <Trophy className="w-4 h-4" />
              <span>Competitions</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Users</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center space-x-2">
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </TabsTrigger>
          </TabsList>

          {/* Competitions Tab */}
          <TabsContent value="competitions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Seasonal Competitions</span>
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Competition
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {competitionsLoading ? (
                  <div className="text-center py-8">
                    <div className="w-8 h-8 mx-auto animate-spin border-4 border-blue-200 border-t-blue-600 rounded-full mb-4"></div>
                    <p className="text-gray-600">Loading competitions...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {competitions.map((comp: any) => (
                      <div key={comp.id} className="border rounded-lg p-4 bg-white">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">{comp.name}</h3>
                            <p className="text-sm text-gray-600 mt-1">{comp.description}</p>
                            <div className="flex items-center space-x-4 mt-2">
                              <Badge variant="outline" className="text-xs">
                                {comp.season} {comp.season_year}
                              </Badge>
                              <span className="text-xs text-gray-500">
                                {comp.participant_count || 0} participants
                              </span>
                              <span className="text-xs text-gray-500">
                                Target: {comp.unlimited ? 'Unlimited' : comp.target_count}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant={comp.is_active ? "default" : "secondary"}>
                              {comp.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                            <Button variant="outline" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="sm" className="text-red-600">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
              </CardHeader>
              <CardContent>
                {usersLoading ? (
                  <div className="text-center py-8">
                    <div className="w-8 h-8 mx-auto animate-spin border-4 border-blue-200 border-t-blue-600 rounded-full mb-4"></div>
                    <p className="text-gray-600">Loading users...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {users.slice(0, 10).map((user: any) => (
                      <div key={user.id} className="border rounded-lg p-4 bg-white">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">{user.username}</h3>
                            <p className="text-sm text-gray-600">{user.display_name || 'No display name'}</p>
                            <div className="flex items-center space-x-4 mt-2">
                              <Badge variant="outline" className="text-xs">
                                {user.user_type || 'user'}
                              </Badge>
                              <span className="text-xs text-gray-500">
                                Zikir: {user.total_zikir || 0}
                              </span>
                              {user.last_login_at && (
                                <span className="text-xs text-gray-500">
                                  Last login: {new Date(user.last_login_at).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button variant="outline" size="sm">
                              View Details
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>System Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Database Management</h3>
                  <div className="space-y-2">
                    <Button variant="outline">Export Competition Data</Button>
                    <Button variant="outline">Export User Data</Button>
                    <Button variant="outline">Backup Database</Button>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-4">System Configuration</h3>
                  <div className="space-y-2">
                    <Button variant="outline">Maintenance Mode</Button>
                    <Button variant="outline">User Registration Settings</Button>
                    <Button variant="outline">Push Notifications</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}