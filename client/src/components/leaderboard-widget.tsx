import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Crown, Medal, Award } from "lucide-react";

interface LeaderboardEntry {
  userId: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  totalCount: number;
  rank: number;
}

interface LeaderboardWidgetProps {
  entries: LeaderboardEntry[];
  currentUserId: string;
  title?: string;
  showTop?: number;
}

export function LeaderboardWidget({ entries, currentUserId, title = "Leaderboard", showTop = 5 }: LeaderboardWidgetProps) {
  const topEntries = entries.slice(0, showTop);
  const currentUserEntry = entries.find(entry => entry.userId === currentUserId);
  const currentUserRank = currentUserEntry ? entries.findIndex(entry => entry.userId === currentUserId) + 1 : null;

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Award className="w-5 h-5 text-amber-600" />;
      default:
        return <div className="w-5 h-5 bg-gray-300 rounded-full flex items-center justify-center text-xs font-bold text-gray-600">{rank}</div>;
    }
  };

  const getPodiumStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white";
      case 2:
        return "bg-gradient-to-r from-gray-300 to-gray-500 text-white";
      case 3:
        return "bg-gradient-to-r from-amber-500 to-amber-700 text-white";
      default:
        return "bg-white text-gray-900";
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center">
          <Crown className="w-5 h-5 mr-2 text-yellow-500" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Top 3 Podium Style */}
        {topEntries.length >= 3 && (
          <div className="grid grid-cols-3 gap-2 mb-4">
            {/* 2nd Place */}
            <div className="text-center">
              <div className={`p-3 rounded-lg ${getPodiumStyle(2)} mb-2`}>
                <img 
                  src={topEntries[1]?.profileImageUrl || `https://ui-avatars.com/api/?name=${topEntries[1]?.firstName}&background=6B7280&color=fff`}
                  alt="2nd place"
                  className="w-12 h-12 rounded-full mx-auto mb-2 border-2 border-white"
                />
                <div className="text-xs font-bold">#{2}</div>
                <div className="text-xs truncate">@{topEntries[1]?.firstName || 'User'}</div>
                <div className="text-sm font-bold">{topEntries[1]?.totalCount || 0}</div>
              </div>
            </div>

            {/* 1st Place (Winner) */}
            <div className="text-center">
              <div className={`p-3 rounded-lg ${getPodiumStyle(1)} mb-2 relative`}>
                <Crown className="w-6 h-6 absolute -top-3 left-1/2 transform -translate-x-1/2 text-yellow-400" />
                <img 
                  src={topEntries[0]?.profileImageUrl || `https://ui-avatars.com/api/?name=${topEntries[0]?.firstName}&background=F59E0B&color=fff`}
                  alt="1st place"
                  className="w-16 h-16 rounded-full mx-auto mb-2 border-3 border-yellow-300"
                />
                <div className="text-sm font-bold">#{1}</div>
                <div className="text-sm truncate">@{topEntries[0]?.firstName || 'Champion'}</div>
                <div className="text-lg font-bold">{topEntries[0]?.totalCount || 0}</div>
              </div>
            </div>

            {/* 3rd Place */}
            <div className="text-center">
              <div className={`p-3 rounded-lg ${getPodiumStyle(3)} mb-2`}>
                <img 
                  src={topEntries[2]?.profileImageUrl || `https://ui-avatars.com/api/?name=${topEntries[2]?.firstName}&background=D97706&color=fff`}
                  alt="3rd place"
                  className="w-12 h-12 rounded-full mx-auto mb-2 border-2 border-white"
                />
                <div className="text-xs font-bold">#{3}</div>
                <div className="text-xs truncate">@{topEntries[2]?.firstName || 'User'}</div>
                <div className="text-sm font-bold">{topEntries[2]?.totalCount || 0}</div>
              </div>
            </div>
          </div>
        )}

        {/* Remaining Top Entries */}
        {topEntries.slice(3).map((entry, index) => (
          <div key={entry.userId} className="flex items-center space-x-3 p-3 bg-purple-500 rounded-lg text-white">
            <div className="flex items-center justify-center w-8 h-8 bg-purple-600 rounded text-sm font-bold">
              {index + 4}
            </div>
            <img 
              src={entry.profileImageUrl || `https://ui-avatars.com/api/?name=${entry.firstName}&background=8B5CF6&color=fff`}
              alt={`${entry.firstName} profile`}
              className="w-10 h-10 rounded-full border-2 border-white"
            />
            <div className="flex-1">
              <div className="font-medium">@{entry.firstName || 'User'}</div>
            </div>
            <div className="font-bold">{entry.totalCount}</div>
          </div>
        ))}

        {/* Current User Position (if not in top) */}
        {currentUserEntry && currentUserRank && currentUserRank > showTop && (
          <div className="border-t pt-3 mt-4">
            <div className="flex items-center space-x-3 p-3 bg-blue-50 border-2 border-blue-200 rounded-lg">
              <div className="flex items-center justify-center w-8 h-8 bg-blue-500 text-white rounded text-sm font-bold">
                {currentUserRank}
              </div>
              <img 
                src={currentUserEntry.profileImageUrl || `https://ui-avatars.com/api/?name=${currentUserEntry.firstName}&background=3B82F6&color=fff`}
                alt="Your profile"
                className="w-10 h-10 rounded-full border-2 border-blue-500"
              />
              <div className="flex-1">
                <div className="font-medium text-blue-900">@{currentUserEntry.firstName || 'You'}</div>
                <div className="text-sm text-blue-600">Your position</div>
              </div>
              <div className="font-bold text-blue-900">{currentUserEntry.totalCount}</div>
            </div>
          </div>
        )}

        {entries.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Crown className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <div className="text-sm">No entries yet</div>
            <div className="text-xs">Start counting to appear on the leaderboard!</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}