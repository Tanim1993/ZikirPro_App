import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { Calendar, Target, Trophy, Flame, Globe, Users, BarChart3, TrendingUp } from "lucide-react";

export default function Stats() {
  const { user } = useAuth();

  const { data: userAnalytics, isLoading } = useQuery({
    queryKey: ["/api/user/analytics"],
  });

  const { data: globalStats } = useQuery({
    queryKey: ["/api/stats/global"],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 animate-spin">
            <div className="w-full h-full border-4 border-islamic-secondary/30 border-t-islamic-primary rounded-full"></div>
          </div>
          <p className="text-gray-600">Loading stats...</p>
        </div>
      </div>
    );
  }

  const stats = [
    {
      icon: Target,
      label: "Total Zikir",
      value: userAnalytics?.totalZikir || 0,
      color: "text-islamic-primary",
      bg: "bg-islamic-secondary/10"
    },
    {
      icon: Flame,
      label: "Current Streak",
      value: `${userAnalytics?.currentStreak || 0} days`,
      color: "text-orange-600",
      bg: "bg-orange-50"
    },
    {
      icon: Trophy,
      label: "Best Streak",
      value: `${userAnalytics?.longestStreak || 0} days`,
      color: "text-yellow-600",
      bg: "bg-yellow-50"
    },
    {
      icon: Calendar,
      label: "Days Active",
      value: userAnalytics?.daysActive || 0,
      color: "text-blue-600",
      bg: "bg-blue-50"
    }
  ];

  const globalStatsList = [
    {
      icon: Users,
      label: "Total Users",
      value: globalStats?.totalUsers || 0,
      color: "text-purple-600",
      bg: "bg-purple-50"
    },
    {
      icon: Target,
      label: "Global Zikir Count",
      value: globalStats?.totalZikir || 0,
      color: "text-islamic-primary",
      bg: "bg-islamic-secondary/10"
    },
    {
      icon: Globe,
      label: "Active Rooms",
      value: globalStats?.activeRooms || 0,
      color: "text-blue-600",
      bg: "bg-blue-50"
    },
    {
      icon: TrendingUp,
      label: "Today's Count",
      value: globalStats?.todayCount || 0,
      color: "text-indigo-600",
      bg: "bg-indigo-50"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-gradient-to-r from-islamic-primary to-islamic-primary-dark text-white px-4 py-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Statistics</h1>
            <p className="text-sm text-islamic-secondary/80">Your progress & achievements</p>
          </div>
        </div>
      </header>

      <div className="px-4 py-6">
        <Tabs defaultValue="personal" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="personal">Personal Stats</TabsTrigger>
            <TabsTrigger value="global">Global Stats</TabsTrigger>
          </TabsList>

          <TabsContent value="personal" className="space-y-6">
            {/* Personal Stats Cards */}
            <div className="grid grid-cols-2 gap-4">
              {stats.map((stat, index) => (
                <Card key={index} className="border border-gray-200">
                  <CardContent className="p-4">
                    <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center mb-3`}>
                      <stat.icon className={`w-5 h-5 ${stat.color}`} />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                    </div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Weekly Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-green-600" />
                  This Week
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
                    <div key={day} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">{day}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full" 
                            style={{ width: `${Math.random() * 100}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600 w-12 text-right">
                          {Math.floor(Math.random() * 200)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Achievements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Trophy className="w-5 h-5 mr-2 text-yellow-600" />
                  Recent Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                    <Trophy className="w-6 h-6 text-yellow-600" />
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">First Century</div>
                      <div className="text-sm text-gray-600">Completed 100 zikir in a single session</div>
                    </div>
                    <div className="text-xs text-gray-500">Today</div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                    <Flame className="w-6 h-6 text-green-600" />
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">Consistent Devotion</div>
                      <div className="text-sm text-gray-600">Maintained a 7-day streak</div>
                    </div>
                    <div className="text-xs text-gray-500">2 days ago</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="global" className="space-y-6">
            {/* Global Stats Cards */}
            <div className="grid grid-cols-2 gap-4">
              {globalStatsList.map((stat, index) => (
                <Card key={index} className="border border-gray-200">
                  <CardContent className="p-4">
                    <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center mb-3`}>
                      <stat.icon className={`w-5 h-5 ${stat.color}`} />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      {stat.value.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Global Leaderboard Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Trophy className="w-5 h-5 mr-2 text-yellow-600" />
                  Global Champions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { name: "Muhammad A.", count: "15,420", country: "🇧🇩 Bangladesh" },
                    { name: "Fatima S.", count: "12,880", country: "🇵🇰 Pakistan" },
                    { name: "Ahmed R.", count: "11,650", country: "🇮🇩 Indonesia" },
                    { name: "Aisha M.", count: "10,240", country: "🇹🇷 Turkey" },
                    { name: "Omar K.", count: "9,870", country: "🇪🇬 Egypt" }
                  ].map((user, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-600">{user.country}</div>
                      </div>
                      <div className="font-bold text-green-600">{user.count}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Countries Ranking */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Globe className="w-5 h-5 mr-2 text-blue-600" />
                  Top Countries
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { country: "🇧🇩 Bangladesh", count: "125,430" },
                    { country: "🇵🇰 Pakistan", count: "98,760" },
                    { country: "🇮🇩 Indonesia", count: "87,650" },
                    { country: "🇹🇷 Turkey", count: "76,240" },
                    { country: "🇪🇬 Egypt", count: "65,870" }
                  ].map((country, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 bg-blue-600 rounded text-white text-xs flex items-center justify-center font-bold">
                          {index + 1}
                        </div>
                        <span className="font-medium">{country.country}</span>
                      </div>
                      <span className="font-bold text-blue-600">{country.count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}