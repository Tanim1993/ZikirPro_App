interface LeaderboardMember {
  userId: string;
  firstName?: string;
  lastName?: string;
  nickname?: string;
  avatarType?: string;
  todayCount: number;
  totalCount: number;
  rank: number;
  lastCountAt?: string;
}

interface LiveLeaderboardProps {
  leaderboard: LeaderboardMember[];
  currentUserId?: string;
  isLoading?: boolean;
}

export default function LiveLeaderboard({ leaderboard, currentUserId, isLoading = false }: LiveLeaderboardProps) {
  if (isLoading) {
    return (
      <div className="text-center py-4">
        <i className="fas fa-spinner fa-spin text-islamic-green text-2xl mb-2"></i>
        <p className="text-gray-600">Loading leaderboard...</p>
      </div>
    );
  }

  const top3 = leaderboard.slice(0, 3);
  const others = leaderboard.slice(3);

  const getCrownIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return { icon: "fas fa-crown", color: "text-yellow-600", bg: "bg-yellow-400" };
      case 2:
        return { icon: "fas fa-crown", color: "text-gray-600", bg: "bg-gray-400" };
      case 3:
        return { icon: "fas fa-crown", color: "text-amber-800", bg: "bg-amber-600" };
      default:
        return { icon: "fas fa-user", color: "text-gray-600", bg: "bg-gray-400" };
    }
  };

  const getMemberName = (member: LeaderboardMember) => {
    if (member.nickname) return member.nickname;
    if (member.firstName) return `${member.firstName} ${member.lastName || ''}`.trim();
    return 'Anonymous';
  };

  const getLastActiveText = (lastCountAt?: string) => {
    if (!lastCountAt) return 'Never';
    const diff = Date.now() - new Date(lastCountAt).getTime();
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} min ago`;
    return `${Math.floor(diff / 3600000)} hour ago`;
  };

  const getBorderColor = (member: LeaderboardMember, rank: number) => {
    if (member.userId === currentUserId) return 'border-islamic-green';
    switch (rank) {
      case 1: return 'border-yellow-400';
      case 2: return 'border-gray-400';
      case 3: return 'border-amber-600';
      default: return 'border-gray-200';
    }
  };

  const getBackgroundColor = (member: LeaderboardMember) => {
    return member.userId === currentUserId ? 'bg-islamic-green bg-opacity-10' : 'bg-white';
  };

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-800 mb-3 text-center">
        <i className="fas fa-trophy text-islamic-gold mr-2"></i>
        Live Leaderboard
      </h3>
      
      <div className="space-y-2">
        {/* Top 3 members */}
        {top3.map((member) => {
          const crown = getCrownIcon(member.rank);
          const isCurrentUser = member.userId === currentUserId;
          
          return (
            <div
              key={member.userId}
              className={`flex items-center justify-between p-3 rounded-lg shadow-sm border-l-4 ${getBorderColor(member, member.rank)} ${getBackgroundColor(member)}`}
              data-testid={`leaderboard-member-${member.rank}`}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 ${crown.bg} rounded-full flex items-center justify-center`}>
                  <i className={`${crown.icon} ${crown.color} text-sm`}></i>
                </div>
                <div>
                  <div className="font-medium text-gray-900" data-testid="text-member-name">
                    {isCurrentUser ? `You (${getMemberName(member)})` : getMemberName(member)}
                  </div>
                  <div className={`text-xs ${isCurrentUser ? 'text-islamic-green font-medium' : 'text-gray-500'}`}>
                    {isCurrentUser ? 'Currently counting' : getLastActiveText(member.lastCountAt)}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-xl font-bold ${crown.color}`} data-testid="text-member-count">
                  {member.todayCount.toLocaleString()}
                </div>
                <div className="text-xs text-green-600 flex items-center">
                  {member.rank === 1 && <i className="fas fa-arrow-up mr-1"></i>}
                  {isCurrentUser ? 'Live' : member.totalCount > member.todayCount ? '+15' : '-'}
                </div>
              </div>
            </div>
          );
        })}
        
        {/* Other members */}
        {others.length > 0 && (
          <div className="mt-4">
            <div className="text-sm font-medium text-gray-600 mb-2">Others</div>
            {others.map((member) => {
              const isCurrentUser = member.userId === currentUserId;
              
              return (
                <div
                  key={member.userId}
                  className={`flex items-center justify-between p-2 rounded border-l-2 ${getBorderColor(member, member.rank)} ${getBackgroundColor(member)} mb-1`}
                  data-testid={`leaderboard-member-${member.rank}`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-white">{member.rank}</span>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {isCurrentUser ? `You (${getMemberName(member)})` : getMemberName(member)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-700">
                      {member.todayCount.toLocaleString()}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        {/* Empty state */}
        {leaderboard.length === 0 && (
          <div className="text-center py-8">
            <i className="fas fa-users text-gray-400 text-3xl mb-2"></i>
            <p className="text-gray-600">No members yet</p>
            <p className="text-sm text-gray-500">Start counting to appear on the leaderboard!</p>
          </div>
        )}
      </div>
    </div>
  );
}
