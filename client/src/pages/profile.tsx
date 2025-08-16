import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { User, Mail, Phone, MapPin, Calendar, LogOut, Edit2, Settings, Smartphone } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { FloatingTasbihButton } from "@/components/FloatingTasbihButton";
import { Switch } from "@/components/ui/switch";
import type { User as UserType } from "@shared/schema";

export default function Profile() {
  const { user, isLoading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [showFloatingTasbih, setShowFloatingTasbih] = useState(false);
  const { toast } = useToast();
  
  // Type assertion for user data
  const typedUser = user as UserType;

  const { data: analytics } = useQuery({
    queryKey: ["/api/user/analytics"],
    enabled: !!user,
  });

  // Update Floating Tasbih Setting
  const updateFloatingTasbihMutation = useMutation({
    mutationFn: async (enabled: boolean) => {
      const response = await fetch('/api/user/floating-tasbih', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ enabled }),
      });
      if (!response.ok) {
        throw new Error('Failed to update floating tasbih setting');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      toast({
        title: "Setting Updated",
        description: "Floating Tasbih setting has been saved",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update floating tasbih setting",
        variant: "destructive",
      });
    },
  });

  // Update Mazhab mutation
  const updateMazhabMutation = useMutation({
    mutationFn: async (mazhab: string) => {
      const response = await fetch('/api/user/mazhab', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mazhab }),
      });
      if (!response.ok) {
        throw new Error('Failed to update mazhab');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      toast({
        title: "Mazhab Updated",
        description: "Your Mazhab preference has been saved successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update Mazhab preference",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 p-4">
        <div className="max-w-md mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="h-32 bg-gray-200 rounded mb-4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="text-center p-6">
            <p className="text-gray-600">Please log in to view your profile.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleLogout = async () => {
    try {
      // Call logout endpoint
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
      
      // Clear query cache
      queryClient.clear();
      
      // Force page reload to landing page
      window.location.replace('/');
    } catch (error) {
      // Fallback - still redirect to root
      window.location.replace('/');
    }
  };

  const getAvatarDisplay = (): string => {
    const avatarMap: { [key: string]: string } = {
      'male-1': '🧔',
      'male-2': '👨',
      'male-3': '🧑',
      'female-1': '👩',
      'female-2': '👩‍🦱',
      'female-3': '🧕'
    };
    return avatarMap[typedUser?.avatarType || 'male-1'] || '👤';
  };

  const getBgColorClass = (): string => {
    const colorMap: { [key: string]: string } = {
      'green': 'bg-green-100',
      'blue': 'bg-blue-100',
      'purple': 'bg-purple-100',
      'orange': 'bg-orange-100',
      'pink': 'bg-pink-100',
      'teal': 'bg-teal-100'
    };
    return colorMap[typedUser?.bgColor || 'green'] || 'bg-green-100';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 p-4 pb-20">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="text-center py-4">
          <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600 mt-1">Manage your account settings</p>
        </div>

        {/* User Profile Card */}
        <Card>
          <CardHeader className="text-center">
            <div className={`w-20 h-20 ${getBgColorClass()} rounded-full flex items-center justify-center text-3xl mx-auto mb-4`}>
              <span>{getAvatarDisplay()}</span>
            </div>
            <CardTitle className="text-xl">{typedUser?.firstName} {typedUser?.lastName}</CardTitle>
            <CardDescription>@{typedUser?.username}</CardDescription>
            <Badge variant={typedUser?.isVerified ? "default" : "secondary"} className="w-fit mx-auto mt-2">
              {typedUser?.isVerified ? "Verified" : "Unverified"}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 text-gray-600">
              <Mail className="h-4 w-4" />
              <span>{typedUser?.email || "No email provided"}</span>
            </div>
            {typedUser?.phone && (
              <div className="flex items-center gap-3 text-gray-600">
                <Phone className="h-4 w-4" />
                <span>{typedUser.phone}</span>
              </div>
            )}
            <div className="flex items-center gap-3 text-gray-600">
              <MapPin className="h-4 w-4" />
              <span>{typedUser?.country || "Not specified"}</span>
            </div>
            <div className="flex items-center gap-3 text-gray-600">
              <Calendar className="h-4 w-4" />
              <span>Joined {typedUser?.createdAt ? new Date(typedUser.createdAt as unknown as string).toLocaleDateString() : 'Unknown'}</span>
            </div>
          </CardContent>
        </Card>

        {/* Analytics Card */}
        {analytics && typeof analytics === 'object' && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Your Statistics</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{(analytics as any)?.currentStreak || 0}</div>
                <div className="text-sm text-gray-600">Current Streak</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{(analytics as any)?.longestStreak || 0}</div>
                <div className="text-sm text-gray-600">Best Streak</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{(analytics as any)?.totalZikir || 0}</div>
                <div className="text-sm text-gray-600">Total Zikir</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{(analytics as any)?.totalRooms || 0}</div>
                <div className="text-sm text-gray-600">Rooms Joined</div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Islamic Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              Islamic Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Mazhab (School of Jurisprudence)</label>
              <Select
                value={(user as any)?.mazhab || 'Hanafi'}
                onValueChange={(value) => updateMazhabMutation.mutate(value)}
                disabled={updateMazhabMutation.isPending}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select your Mazhab" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Hanafi">Hanafi</SelectItem>
                  <SelectItem value="Shafi">Shafi'i</SelectItem>
                  <SelectItem value="Maliki">Maliki</SelectItem>
                  <SelectItem value="Hanbali">Hanbali</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                This affects prayer time calculations in Salah Tracker
              </p>
            </div>

            <div className="space-y-3 pt-4 border-t">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4 text-blue-600" />
                    <label className="text-sm font-medium text-gray-700">Floating Tasbih</label>
                  </div>
                  <p className="text-xs text-gray-500">
                    Enable floating tasbih button for quick access anywhere
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={(user as any)?.floatingTasbihEnabled || false}
                    onCheckedChange={(checked) => {
                      updateFloatingTasbihMutation.mutate(checked);
                      if (checked) {
                        setShowFloatingTasbih(true);
                      } else {
                        setShowFloatingTasbih(false);
                      }
                    }}
                    disabled={updateFloatingTasbihMutation.isPending}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Account Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full justify-start" 
              onClick={() => setIsEditing(true)}
            >
              <Edit2 className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
            
            <Button 
              variant="destructive" 
              className="w-full justify-start" 
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </CardContent>
        </Card>

        {/* Signup Method Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Account Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Signup Method</span>
              <Badge variant="outline">
                {typedUser?.signupMethod === 'username' ? 'Username' : 
                 typedUser?.signupMethod === 'google' ? 'Google' : 
                 typedUser?.signupMethod === 'otp' ? 'Phone OTP' : 'Unknown'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Floating Tasbih Button */}
      <FloatingTasbihButton 
        isVisible={showFloatingTasbih || (user as any)?.floatingTasbihEnabled}
        onClose={() => setShowFloatingTasbih(false)}
      />
    </div>
  );
}