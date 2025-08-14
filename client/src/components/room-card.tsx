import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface RoomCardProps {
  room: any;
  isPublic?: boolean;
  isOwner?: boolean;
  isOrganization?: boolean;
}

export default function RoomCard({ room, isPublic = false, isOwner = false, isOrganization = false }: RoomCardProps) {
  const daysRemaining = room.endDate ? Math.max(0, Math.ceil((new Date(room.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))) : room.duration;
  const progress = room.duration ? Math.min(100, ((room.duration - daysRemaining) / room.duration) * 100) : 0;

  return (
    <Card className="hover:shadow-xl transition-shadow border border-gray-100 overflow-hidden">
      {/* Room header with gradient */}
      <div className="h-32 bg-gradient-to-r from-islamic-green to-islamic-green-light relative">
        <div className="absolute inset-0 islamic-pattern"></div>
        <div className="absolute bottom-4 left-4 text-white">
          <h3 className="font-bold text-lg font-amiri" data-testid="text-room-zikir-name">
            {room.zikirName || "Zikir Room"}
          </h3>
          <p className="text-sm text-green-100" data-testid="text-room-duration">
            {room.duration} Days Challenge
          </p>
        </div>
        {room.memberCount !== undefined && (
          <div className="absolute top-4 right-4">
            <div className="bg-islamic-gold text-white px-2 py-1 rounded-full text-xs font-semibold">
              <i className="fas fa-users mr-1"></i>
              <span data-testid="text-member-count">{room.memberCount}</span>
            </div>
          </div>
        )}
      </div>
      
      <CardContent className="p-4">
        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>
              Day <span data-testid="text-current-day">{room.duration - daysRemaining}</span> of{" "}
              <span data-testid="text-total-days">{room.duration}</span>
            </span>
            <span data-testid="text-progress">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-islamic-green h-2 rounded-full transition-all duration-300" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
        
        {/* User Stats (if not public) */}
        {!isPublic && (
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center">
              <div className="text-xl font-bold text-islamic-green" data-testid="text-user-count">
                {room.todayCount || 0}
              </div>
              <div className="text-xs text-gray-500">Your Count</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-islamic-gold" data-testid="text-user-rank">
                #{room.rank || "N/A"}
              </div>
              <div className="text-xs text-gray-500">Your Rank</div>
            </div>
          </div>
        )}
        
        {/* Room Description */}
        {room.description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2" data-testid="text-room-description">
            {room.description}
          </p>
        )}
        
        {/* Action Button */}
        <Link href={`/room/${room.id}`}>
          <Button 
            className="w-full bg-islamic-green hover:bg-islamic-green-dark text-white font-medium py-2 px-4 rounded-lg transition-colors"
            data-testid="button-enter-room"
          >
            <i className="fas fa-prayer-beads mr-2"></i>
            {isPublic ? "Join Room" : "Continue Zikir"}
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
