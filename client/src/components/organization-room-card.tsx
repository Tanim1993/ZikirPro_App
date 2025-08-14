import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { VerifiedBadge } from "./verified-badge";
import { Users, Target, Clock, Trophy, Building2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface OrganizationRoomCardProps {
  room: {
    id: number;
    name: string;
    description?: string;
    targetCount?: number;
    unlimited: boolean;
    duration: number;
    isPublic: boolean;
    country?: string;
    pictureUrl?: string;
    prizeDescription?: string;
    competitionType?: string;
    competitionStartDate?: string;
    competitionEndDate?: string;
    maxParticipants?: number;
    createdAt: string;
    owner?: {
      id: string;
      organizationName?: string;
      organizationLogo?: string;
      isVerified: boolean;
      userType: string;
    };
  };
  memberCount?: number;
  onJoin?: () => void;
}

export function OrganizationRoomCard({ room, memberCount = 0, onJoin }: OrganizationRoomCardProps) {
  const isOrganization = room.owner?.userType === "organization";
  const isCompetition = room.competitionType === "competition";
  
  return (
    <Card className="hover:shadow-md transition-shadow duration-200 border-l-4 border-l-blue-500">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <CardTitle className="text-lg">{room.name}</CardTitle>
              {isCompetition && (
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                  <Trophy className="w-3 h-3 mr-1" />
                  Competition
                </Badge>
              )}
            </div>
            
            {isOrganization && room.owner && (
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                <Building2 className="w-4 h-4" />
                <span>{room.owner.organizationName}</span>
                <VerifiedBadge isVerified={room.owner.isVerified} size="sm" />
              </div>
            )}
            
            {room.description && (
              <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                {room.description}
              </p>
            )}
          </div>
          
          {room.owner?.organizationLogo && (
            <div className="flex-shrink-0 ml-3">
              <img 
                src={room.owner.organizationLogo} 
                alt={`${room.owner.organizationName} logo`}
                className="w-12 h-12 rounded-lg object-cover border border-gray-200"
              />
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Prize Information */}
          {room.prizeDescription && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Trophy className="w-4 h-4 text-yellow-600" />
                <span className="text-sm font-semibold text-yellow-800">Prize</span>
              </div>
              <p className="text-sm text-yellow-700">{room.prizeDescription}</p>
            </div>
          )}
          
          {/* Room Stats */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-500" />
              <span className="text-gray-600">
                {memberCount} {memberCount === 1 ? 'member' : 'members'}
                {room.maxParticipants && ` / ${room.maxParticipants}`}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="text-gray-600">{room.duration} days</span>
            </div>
            
            {!room.unlimited && room.targetCount && (
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600">{room.targetCount.toLocaleString()} target</span>
              </div>
            )}
            
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">
                Created {formatDistanceToNow(new Date(room.createdAt))} ago
              </span>
            </div>
          </div>
          
          {/* Competition Timeline */}
          {isCompetition && room.competitionStartDate && room.competitionEndDate && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="text-sm">
                <div className="font-semibold text-blue-800 mb-1">Competition Period</div>
                <div className="text-blue-700">
                  {new Date(room.competitionStartDate).toLocaleDateString()} - {new Date(room.competitionEndDate).toLocaleDateString()}
                </div>
              </div>
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Link href={`/room/${room.id}`} className="flex-1">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                data-testid={`button-view-room-${room.id}`}
              >
                View Details
              </Button>
            </Link>
            
            {onJoin && (
              <Button 
                onClick={onJoin}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white"
                data-testid={`button-join-room-${room.id}`}
              >
                Join Competition
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}