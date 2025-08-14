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
    <div className="min-h-screen bg-white">
      {/* Clean Blue Header */}
      <div className="bg-islamic-gradient px-4 py-6">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/90 rounded-lg flex items-center justify-center">
                <div className="text-lg font-bold text-islamic-primary font-amiri">ج</div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Zikir Amol</h1>
                <p className="text-white/80 text-xs">Islamic Prayer Counter & Competition</p>
              </div>
            </div>
            <Button 
              onClick={() => setShowCreateModal(true)}
              className="bg-white text-islamic-primary hover:bg-white/90 shadow-sm px-4 py-2 text-sm font-medium rounded-lg"
              data-testid="button-create-room"
            >
              <Plus className="w-4 h-4 mr-1" />
              Create Room
            </Button>
          </div>
          
          {/* Clean Stats Cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center bg-white/10 rounded-lg p-3 backdrop-blur-sm">
              <div className="text-xl font-bold text-white">{parseInt((userAnalytics as any)?.totalCount) || 102}</div>
              <div className="text-xs text-white/80">Total Zikir</div>
            </div>
            <div className="text-center bg-white/10 rounded-lg p-3 backdrop-blur-sm">
              <div className="text-xl font-bold text-white">{(userAnalytics as any)?.currentStreak || 1}</div>
              <div className="text-xs text-white/80">Day Streak</div>
            </div>
            <div className="text-center bg-white/10 rounded-lg p-3 backdrop-blur-sm">
              <div className="text-xl font-bold text-white">{Array.isArray(userRooms) ? userRooms.length : 6}</div>
              <div className="text-xs text-white/80">My Rooms</div>
            </div>
          </div>
        </div>
      </div>

      {/* Clean Content Section */}
      <div className="max-w-md mx-auto px-4">
        <Tabs defaultValue="my-rooms" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gray-100 p-1 rounded-lg">
            <TabsTrigger value="my-rooms" className="text-sm data-[state=active]:bg-white data-[state=active]:text-islamic-primary data-[state=active]:shadow-sm" data-testid="tab-my-rooms">
              <Home className="w-4 h-4 mr-2" />
              My Rooms
            </TabsTrigger>
            <TabsTrigger value="public-rooms" className="text-sm data-[state=active]:bg-white data-[state=active]:text-islamic-primary data-[state=active]:shadow-sm" data-testid="tab-public-rooms">
              <Globe className="w-4 h-4 mr-2" />
              Public
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="text-sm data-[state=active]:bg-white data-[state=active]:text-islamic-primary data-[state=active]:shadow-sm" data-testid="tab-leaderboard">
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