import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Medal, Award, Crown, Globe, Flag } from "lucide-react";
import { cn } from "@/lib/utils";

interface LeaderboardUser {
  userId: string;
  firstName: string;
  lastName: string;
  profileImageUrl: string;
  country: string;
  totalCount: number;
  rank: number;
}

interface CountryStats {
  country: string;
  totalUsers: number;
  totalZikir: number;
  avgPerUser: number;
  topUser: string;
}

export default function Leaderboard() {
  const [selectedTab, setSelectedTab] = useState("global");

  const { data: globalLeaderboard = [], isLoading: globalLoading } = useQuery({
    queryKey: ["/api/leaderboard/global"],
  }) as { data: LeaderboardUser[], isLoading: boolean };

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/stats/global"],
  }) as { data: any, isLoading: boolean };

  // Generate country stats from global leaderboard
  const countryStats: CountryStats[] = globalLeaderboard.reduce((acc: any[], user: LeaderboardUser) => {
    const existing = acc.find(c => c.country === user.country);
    if (existing) {
      existing.totalUsers += 1;
      existing.totalZikir += user.totalCount;
      if (user.totalCount > existing.topUserCount) {
        existing.topUser = `${user.firstName} ${user.lastName}`;
        existing.topUserCount = user.totalCount;
      }
    } else {
      acc.push({
        country: user.country,
        totalUsers: 1,
        totalZikir: user.totalCount,
        topUser: `${user.firstName} ${user.lastName}`,
        topUserCount: user.totalCount
      });
    }
    return acc;
  }, []).map((country: any) => ({
    ...country,
    avgPerUser: Math.round(country.totalZikir / country.totalUsers)
  })).sort((a: any, b: any) => b.totalZikir - a.totalZikir);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Trophy className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Medal className="w-6 h-6 text-amber-600" />;
      default:
        return <Award className="w-5 h-5 text-gray-400" />;
    }
  };

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-yellow-400 to-yellow-600";
      case 2:
        return "bg-gradient-to-r from-gray-300 to-gray-500";
      case 3:
        return "bg-gradient-to-r from-amber-400 to-amber-600";
      default:
        return "bg-gradient-to-r from-green-400 to-green-600";
    }
  };

  const getCountryFlag = (country: string) => {
    const flags: { [key: string]: string } = {
      "Malaysia": "🇲🇾",
      "Indonesia": "🇮🇩",
      "Turkey": "🇹🇷",
      "Egypt": "🇪🇬",
      "Pakistan": "🇵🇰",
      "Bangladesh": "🇧🇩",
      "Saudi Arabia": "🇸🇦"
    };
    return flags[country] || "🌍";
  };

  if (globalLoading || statsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 text-green-600">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600"></div>
            </div>
            <p className="text-gray-600">Loading leaderboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Global Leaderboard</h1>
          <p className="text-gray-600">Top performers in the Zikir community worldwide</p>
        </div>

        {/* Global Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600" data-testid="text-total-users">
                  {parseInt(stats.totalUsers).toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Total Users</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600" data-testid="text-total-zikir">
                  {parseInt(stats.totalZikir).toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Total Zikir</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600" data-testid="text-active-rooms">
                  {parseInt(stats.activeRooms).toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Active Rooms</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-orange-600" data-testid="text-today-count">
                  {parseInt(stats.todayCount).toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Today</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="global" className="flex items-center gap-2" data-testid="tab-global">
              <Globe className="w-4 h-4" />
              Global Leaders
            </TabsTrigger>
            <TabsTrigger value="countries" className="flex items-center gap-2" data-testid="tab-countries">
              <Flag className="w-4 h-4" />
              Country Rankings
            </TabsTrigger>
          </TabsList>

          {/* Global Leaderboard */}
          <TabsContent value="global" className="mt-6">
            <div className="space-y-4">
              {globalLeaderboard.slice(0, 50).map((user: LeaderboardUser, index: number) => (
                <Card 
                  key={user.userId} 
                  className={cn(
                    "transition-all hover:shadow-md",
                    index < 3 && "ring-2",
                    index === 0 && "ring-yellow-400 bg-gradient-to-r from-yellow-50 to-amber-50",
                    index === 1 && "ring-gray-400 bg-gradient-to-r from-gray-50 to-slate-50", 
                    index === 2 && "ring-amber-400 bg-gradient-to-r from-amber-50 to-orange-50"
                  )}
                  data-testid={`card-user-${user.userId}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          {getRankIcon(user.rank)}
                          <Badge 
                            className={cn(
                              "text-white font-semibold px-3 py-1",
                              getRankBadgeColor(user.rank)
                            )}
                          >
                            #{user.rank}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <img
                            src={user.profileImageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.userId}`}
                            alt={`${user.firstName} ${user.lastName}`}
                            className="w-12 h-12 rounded-full border-2 border-white shadow-md"
                            data-testid={`img-avatar-${user.userId}`}
                          />
                          <div>
                            <div className="font-semibold text-gray-900" data-testid={`text-username-${user.userId}`}>
                              {user.firstName} {user.lastName}
                            </div>
                            <div className="flex items-center text-sm text-gray-500">
                              <span className="mr-1">{getCountryFlag(user.country)}</span>
                              {user.country}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600" data-testid={`text-count-${user.userId}`}>
                          {user.totalCount.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-500">total zikir</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Country Rankings */}
          <TabsContent value="countries" className="mt-6">
            <div className="space-y-4">
              {countryStats.map((country: CountryStats, index: number) => (
                <Card 
                  key={country.country}
                  className={cn(
                    "transition-all hover:shadow-md",
                    index < 3 && "ring-2",
                    index === 0 && "ring-yellow-400 bg-gradient-to-r from-yellow-50 to-amber-50",
                    index === 1 && "ring-gray-400 bg-gradient-to-r from-gray-50 to-slate-50",
                    index === 2 && "ring-amber-400 bg-gradient-to-r from-amber-50 to-orange-50"
                  )}
                  data-testid={`card-country-${country.country.toLowerCase().replace(' ', '-')}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          {getRankIcon(index + 1)}
                          <Badge className={cn(
                            "text-white font-semibold px-3 py-1",
                            getRankBadgeColor(index + 1)
                          )}>
                            #{index + 1}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <div className="text-4xl">{getCountryFlag(country.country)}</div>
                          <div>
                            <div className="font-semibold text-gray-900 text-lg" data-testid={`text-country-name-${country.country.toLowerCase().replace(' ', '-')}`}>
                              {country.country}
                            </div>
                            <div className="text-sm text-gray-500">
                              {country.totalUsers} users • Top: {country.topUser}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600" data-testid={`text-country-total-${country.country.toLowerCase().replace(' ', '-')}`}>
                          {country.totalZikir.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-500">
                          {country.avgPerUser.toLocaleString()} avg/user
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}