import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { User, Mail, Phone, MapPin, Calendar, LogOut, Edit2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export default function Profile() {
  const { user, isLoading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  const { data: analytics } = useQuery({
    queryKey: ["/api/user/analytics"],
    enabled: !!user,
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

  const handleLogout = () => {
    window.location.href = '/api/logout';
  };

  const getAvatarDisplay = () => {
    const avatarMap: { [key: string]: string } = {
      'male-1': '🧔',
      'male-2': '👨',
      'male-3': '🧑',
      'female-1': '👩',
      'female-2': '👩‍🦱',
      'female-3': '🧕'
    };
    return avatarMap[user.avatarType || 'male-1'] || '👤';
  };

  const getBgColorClass = () => {
    const colorMap: { [key: string]: string } = {
      'green': 'bg-green-100',
      'blue': 'bg-blue-100',
      'purple': 'bg-purple-100',
      'orange': 'bg-orange-100',
      'pink': 'bg-pink-100',
      'teal': 'bg-teal-100'
    };
    return colorMap[user.bgColor || 'green'] || 'bg-green-100';
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
              {getAvatarDisplay()}
            </div>
            <CardTitle className="text-xl">{user.firstName} {user.lastName}</CardTitle>
            <CardDescription>@{user.username}</CardDescription>
            <Badge variant={user.isVerified ? "default" : "secondary"} className="w-fit mx-auto mt-2">
              {user.isVerified ? "Verified" : "Unverified"}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 text-gray-600">
              <Mail className="h-4 w-4" />
              <span>{user.email || "No email provided"}</span>
            </div>
            {user.phone && (
              <div className="flex items-center gap-3 text-gray-600">
                <Phone className="h-4 w-4" />
                <span>{user.phone}</span>
              </div>
            )}
            <div className="flex items-center gap-3 text-gray-600">
              <MapPin className="h-4 w-4" />
              <span>{user.country || "Not specified"}</span>
            </div>
            <div className="flex items-center gap-3 text-gray-600">
              <Calendar className="h-4 w-4" />
              <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
            </div>
          </CardContent>
        </Card>

        {/* Analytics Card */}
        {analytics && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Your Statistics</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{analytics.currentStreak}</div>
                <div className="text-sm text-gray-600">Current Streak</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{analytics.longestStreak}</div>
                <div className="text-sm text-gray-600">Best Streak</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{analytics.totalZikir}</div>
                <div className="text-sm text-gray-600">Total Zikir</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{analytics.totalRooms}</div>
                <div className="text-sm text-gray-600">Rooms Joined</div>
              </div>
            </CardContent>
          </Card>
        )}

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
                {user.signupMethod === 'username' ? 'Username' : 
                 user.signupMethod === 'google' ? 'Google' : 
                 user.signupMethod === 'otp' ? 'Phone OTP' : 'Unknown'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}