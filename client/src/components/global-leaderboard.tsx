import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, Medal, TrendingUp, Trophy, User } from "lucide-react";

interface GlobalLeaderEntry {
  userId: string;
  firstName?: string;
  lastName?: string;
  totalCount: number;
  rank: number;
  profileImageUrl?: string;
  streakCount: number;
  roomsCount: number;
}

export function GlobalLeaderboard() {
  const { data: globalLeaderboard = [], isLoading } = useQuery({
    queryKey: ['/api/leaderboard/global'],
    refetchInterval: 30000, // Refresh every 30 seconds
  }) as { data: GlobalLeaderEntry[], isLoading: boolean };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Medal className="w-5 h-5 text-orange-600" />;
      default:
        return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-gray-600">#{rank}</span>;
    }
  };

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1: return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case 2: return "bg-gray-100 text-gray-800 border-gray-300";
      case 3: return "bg-orange-100 text-orange-800 border-orange-300";
      default: return "bg-green-100 text-green-800 border-green-300";
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              Global Leaderboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-gray-100 rounded-lg animate-pulse">
                  <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                  <div className="flex-1">
                    <div className="w-24 h-4 bg-gray-300 rounded mb-1"></div>
                    <div className="w-16 h-3 bg-gray-300 rounded"></div>
                  </div>
                  <div className="w-12 h-6 bg-gray-300 rounded"></div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!globalLeaderboard || globalLeaderboard.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <Trophy className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Global Rankings Yet</h3>
        <p className="text-gray-600">Start counting zikir to appear on the global leaderboard!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-700">
            <Trophy className="w-5 h-5 text-yellow-500" />
            Global Leaderboard
          </CardTitle>
          <p className="text-sm text-gray-600">Top zikir counters worldwide</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {globalLeaderboard.slice(0, 10).map((entry, index) => (
              <div 
                key={entry.userId} 
                className={`flex items-center gap-3 p-4 rounded-lg border transition-all duration-200 ${
                  entry.rank <= 3 
                    ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200 shadow-sm' 
                    : 'bg-gray-50 hover:bg-gray-100 border-gray-200'
                }`}
                data-testid={`leaderboard-entry-${entry.rank}`}
              >
                {/* Rank Icon */}
                <div className="flex-shrink-0">
                  {getRankIcon(entry.rank)}
                </div>

                {/* Profile Image */}
                <div className="flex-shrink-0">
                  {entry.profileImageUrl ? (
                    <img 
                      src={entry.profileImageUrl} 
                      alt="Profile" 
                      className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-green-200 flex items-center justify-center">
                      <User className="w-5 h-5 text-green-700" />
                    </div>
                  )}
                </div>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {entry.firstName && entry.lastName 
                        ? `${entry.firstName} ${entry.lastName}` 
                        : entry.firstName || 'Anonymous User'
                      }
                    </h3>
                    <Badge 
                      variant="outline" 
                      className={`text-xs px-2 py-1 ${getRankBadgeColor(entry.rank)}`}
                    >
                      #{entry.rank}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      <span>{entry.totalCount.toLocaleString()} zikir</span>
                    </div>
                    {entry.streakCount > 0 && (
                      <div className="flex items-center gap-1">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        <span>{entry.streakCount} day streak</span>
                      </div>
                    )}
                    {entry.roomsCount > 0 && (
                      <div className="text-xs">
                        {entry.roomsCount} rooms
                      </div>
                    )}
                  </div>
                </div>

                {/* Score Display */}
                <div className="text-right">
                  <div className={`text-lg font-bold ${
                    entry.rank <= 3 ? 'text-yellow-700' : 'text-green-700'
                  }`}>
                    {entry.totalCount.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500">total zikir</div>
                </div>
              </div>
            ))}
          </div>

          {globalLeaderboard.length > 10 && (
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                Showing top 10 of {globalLeaderboard.length.toLocaleString()} users
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm text-gray-700">Global Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-700">
                {globalLeaderboard.reduce((sum, entry) => sum + entry.totalCount, 0).toLocaleString()}
              </div>
              <div className="text-xs text-gray-600">Total Zikir Count</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-700">
                {globalLeaderboard.length.toLocaleString()}
              </div>
              <div className="text-xs text-gray-600">Active Users</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}