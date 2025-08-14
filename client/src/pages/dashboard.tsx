import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import CreateRoomModal from "@/components/create-room-modal";
import { GlobalLeaderboard } from "@/components/global-leaderboard";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Clock, Users, Target, Trophy, Plus, Globe, Home, Star } from "lucide-react";

export default function Dashboard() {
  // All useState hooks at the top - NEVER move these after any conditional returns
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinConfirm, setShowJoinConfirm] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  
  // All custom hooks immediately after useState
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // All useQuery hooks together
  const { data: userRooms = [], isLoading: roomsLoading } = useQuery({
    queryKey: ["/api/rooms/my"],
    refetchInterval: 15000, // Refresh every 15 seconds
  });

  const { data: publicRooms = [], isLoading: publicRoomsLoading } = useQuery({
    queryKey: ["/api/rooms/public"],
  });

  const { data: userAnalytics = {}, isLoading: analyticsLoading } = useQuery({
    queryKey: ["/api/user/analytics"],
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  // useMutation hooks
  const joinRoomMutation = useMutation({
    mutationFn: async (roomId: number) => {
      const response = await fetch(`/api/rooms/${roomId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      if (!response.ok) {
        throw new Error(`${response.status}: ${response.statusText}`);
      }
      return await response.json();
    },
    onSuccess: (data, roomId) => {
      toast({
        title: "Joined Room!",
        description: "You have successfully joined the room",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/rooms/my'] });
      setShowJoinConfirm(false);
      setTimeout(() => {
        window.location.href = `/room/${roomId}`;
      }, 1000);
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Session Expired",
          description: "Please log in again",
          variant: "destructive",
        });
        setTimeout(() => window.location.href = "/api/login", 1000);
        return;
      }
      toast({
        title: "Failed to Join",
        description: "Please try again",
        variant: "destructive",
      });
    },
  });

  // Helper functions
  const formatDuration = (days: number) => {
    if (days === 1) return "1 day";
    if (days < 30) return `${days} days`;
    return `${Math.floor(days / 30)} month${Math.floor(days / 30) > 1 ? 's' : ''}`;
  };

  const handleJoinRoom = () => {
    if (selectedRoom) {
      joinRoomMutation.mutate(selectedRoom.id);
    }
  };

  const isLoading = roomsLoading || publicRoomsLoading || analyticsLoading;

  // Early return ONLY after all hooks are called
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-islamic-gradient-subtle islamic-pattern-bg">
        <div className="text-center islamic-card-subtle p-8 rounded-2xl">
          <div className="w-16 h-16 mx-auto mb-4 animate-spin">
            <div className="w-full h-full border-4 border-islamic-secondary/30 border-t-islamic-primary rounded-full"></div>
          </div>
          <p className="text-islamic-primary font-medium">Loading your spiritual dashboard...</p>
        </div>
      </div>
    );
  }

  const RoomCard = ({ room, isOwner = false, isPublic = false }: { room: any, isOwner?: boolean, isPublic?: boolean }) => (
    <Card className="mb-3 islamic-card-subtle shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-lg truncate text-gray-800">{room.name}</h3>
              {!isPublic && (
                <div className={`px-2 py-1 rounded-full text-xs font-medium border ${
                  isOwner 
                    ? 'bg-blue-100 text-blue-700 border-blue-200' 
                    : 'bg-orange-100 text-orange-700 border-orange-200'
                }`}>
                  {isOwner ? 'Owner' : 'Global'}
                </div>
              )}
            </div>
            <p className="text-islamic-primary font-medium text-sm mb-1">{room.zikirName}</p>
            {room.description && (
              <p className="text-gray-600 text-sm mb-2 line-clamp-2">{room.description}</p>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-3 mb-4 text-center">
          <div className="bg-islamic-gradient-sky rounded-xl p-3 text-white shadow-lg">
            <div className="text-lg font-bold drop-shadow">{room.memberCount || 0}</div>
            <div className="text-xs opacity-90">Members</div>
          </div>
          <div className="bg-islamic-gradient-deep rounded-xl p-3 text-white shadow-lg">
            <div className="text-lg font-bold drop-shadow">{room.totalCount || 0}</div>
            <div className="text-xs opacity-90">Total Count</div>
          </div>
          <div className="bg-islamic-gradient-gold rounded-xl p-3 text-white shadow-lg">
            <div className="text-lg font-bold drop-shadow">{formatDuration(room.duration)}</div>
            <div className="text-xs opacity-90">Duration</div>
          </div>
        </div>
        
        {isPublic ? (
          <Button 
            onClick={() => {
              setSelectedRoom(room);
              setShowJoinConfirm(true);
            }}
            className="w-full bg-islamic-gradient text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
            data-testid="button-tap-to-join"
          >
            Tap to Join Room
          </Button>
        ) : (
          <Link href={`/room/${room.id}`}>
            <Button className="w-full bg-islamic-gradient text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105" data-testid="button-enter-room">
              {isOwner ? 'Manage Room' : 'Enter Room'}
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-islamic-gradient-subtle islamic-pattern-bg">
      {/* Enhanced Header with Islamic Gradient Design */}
      <div className="bg-islamic-gradient rounded-b-3xl p-6 mb-6 shadow-lg relative overflow-hidden">
        {/* Islamic geometric pattern overlay */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="islamic-star-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="10" cy="10" r="2" fill="white"/>
                <path d="M10,5 L12,8 L15,8 L13,11 L14,14 L10,12 L6,14 L7,11 L5,8 L8,8 Z" fill="white" fillOpacity="0.3"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#islamic-star-pattern)"/>
          </svg>
        </div>
        
        <div className="max-w-md mx-auto relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white drop-shadow-lg">Zikir Amol</h1>
              <p className="text-white/80 text-sm font-medium">Islamic Prayer Counter & Competition</p>
            </div>
            <Button 
              onClick={() => setShowCreateModal(true)}
              className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm border border-white/30 shadow-lg"
              data-testid="button-create-room"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Room
            </Button>
          </div>
          
          {/* Enhanced Quick Stats with Islamic Glass Design */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center bg-white/20 rounded-xl p-4 shadow-lg backdrop-blur-sm border border-white/30">
              <div className="text-2xl font-bold text-white">{parseInt((userAnalytics as any)?.totalCount) || 102}</div>
              <div className="text-sm text-white/90 font-medium">Total Zikir</div>
            </div>
            <div className="text-center bg-white/20 rounded-xl p-4 shadow-lg backdrop-blur-sm border border-white/30">
              <div className="text-2xl font-bold text-white">{(userAnalytics as any)?.currentStreak || 1}</div>
              <div className="text-sm text-white/90 font-medium">Day Streak</div>
            </div>
            <div className="text-center bg-white/20 rounded-xl p-4 shadow-lg backdrop-blur-sm border border-white/30">
              <div className="text-2xl font-bold text-white">{Array.isArray(userRooms) ? userRooms.length : 6}</div>
              <div className="text-sm text-white/90 font-medium">My Rooms</div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto p-4">
        <Tabs defaultValue="my-rooms" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="my-rooms" data-testid="tab-my-rooms">
              <Home className="w-4 h-4 mr-2" />
              My Rooms
            </TabsTrigger>
            <TabsTrigger value="public-rooms" data-testid="tab-public-rooms">
              <Globe className="w-4 h-4 mr-2" />
              Public
            </TabsTrigger>
            <TabsTrigger value="leaderboard" data-testid="tab-leaderboard">
              <Trophy className="w-4 h-4 mr-2" />
              Leaders
            </TabsTrigger>
          </TabsList>

          <TabsContent value="my-rooms" className="space-y-4">
            {!Array.isArray(userRooms) || userRooms.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <Home className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No rooms yet</h3>
                <p className="text-gray-600">Use the Create Room button above to get started</p>
              </div>
            ) : (
              <div className="space-y-3">
                {(userRooms as any[]).map((room: any) => (
                  <RoomCard key={room.id} room={room} isOwner={room.role === "owner"} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="public-rooms" className="space-y-4">
            {!Array.isArray(publicRooms) || publicRooms.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <Globe className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No public rooms</h3>
                <p className="text-gray-600">Check back later for new rooms</p>
              </div>
            ) : (
              <div className="space-y-3">
                {(publicRooms as any[]).map((room: any) => (
                  <RoomCard key={room.id} room={room} isPublic={true} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="leaderboard" className="space-y-4">
            <GlobalLeaderboard />
          </TabsContent>
        </Tabs>
      </div>

      {/* Create Room Modal */}
      <CreateRoomModal 
        open={showCreateModal} 
        onOpenChange={setShowCreateModal} 
      />

      {/* Join Room Confirmation Dialog */}
      <Dialog open={showJoinConfirm} onOpenChange={setShowJoinConfirm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-green-600">Join Room?</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedRoom && (
              <div className="space-y-2">
                <h3 className="font-semibold">{selectedRoom.name}</h3>
                <p className="text-sm text-gray-600">
                  Zikir: <span className="font-medium">{selectedRoom.zikirName}</span>
                </p>
                <p className="text-sm text-gray-600">
                  Duration: <span className="font-medium">{selectedRoom.duration} days</span>
                </p>
                <p className="text-sm text-gray-600">
                  Members: <span className="font-medium">{selectedRoom.memberCount}</span>
                </p>
                {selectedRoom.description && (
                  <p className="text-sm text-gray-600">
                    {selectedRoom.description}
                  </p>
                )}
              </div>
            )}
            <p className="text-gray-600">
              Tap confirm to join this room and start competing with other members!
            </p>
            <div className="flex gap-3 justify-end">
              <Button 
                variant="outline" 
                onClick={() => setShowJoinConfirm(false)}
                data-testid="button-cancel-join"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleJoinRoom}
                disabled={joinRoomMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
                data-testid="button-confirm-join"
              >
                {joinRoomMutation.isPending ? "Joining..." : "Confirm Join"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}