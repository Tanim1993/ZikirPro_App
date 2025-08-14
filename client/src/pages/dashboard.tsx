import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import CreateRoomModal from "@/components/create-room-modal";
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
  });

  const { data: publicRooms = [], isLoading: publicRoomsLoading } = useQuery({
    queryKey: ["/api/rooms/public"],
  });

  const { data: userAnalytics = {}, isLoading: analyticsLoading } = useQuery({
    queryKey: ["/api/user/analytics"],
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 animate-spin">
            <div className="w-full h-full border-4 border-green-200 border-t-green-600 rounded-full"></div>
          </div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const RoomCard = ({ room, isOwner = false, isPublic = false }: { room: any, isOwner?: boolean, isPublic?: boolean }) => (
    <Card className="mb-3 border border-green-200 shadow-lg bg-gradient-to-r from-white to-green-50">
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
            <p className="text-green-700 font-medium text-sm mb-1">{room.zikirName}</p>
            {room.description && (
              <p className="text-gray-600 text-sm mb-2 line-clamp-2">{room.description}</p>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-3 mb-4 text-center">
          <div className="bg-green-100 rounded-lg p-2 border border-green-200">
            <div className="text-lg font-bold text-green-700">{room.memberCount || 0}</div>
            <div className="text-xs text-green-600">Members</div>
          </div>
          <div className="bg-blue-100 rounded-lg p-2 border border-blue-200">
            <div className="text-lg font-bold text-blue-700">{room.totalCount || 0}</div>
            <div className="text-xs text-blue-600">Total Count</div>
          </div>
          <div className="bg-purple-100 rounded-lg p-2 border border-purple-200">
            <div className="text-lg font-bold text-purple-700">{formatDuration(room.duration)}</div>
            <div className="text-xs text-purple-600">Duration</div>
          </div>
        </div>
        
        {isPublic ? (
          <Button 
            onClick={() => {
              setSelectedRoom(room);
              setShowJoinConfirm(true);
            }}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
            data-testid="button-tap-to-join"
          >
            Tap to Join Room
          </Button>
        ) : (
          <Link href={`/room/${room.id}`}>
            <Button className="w-full bg-green-600 hover:bg-green-700 text-white" data-testid="button-enter-room">
              {isOwner ? 'Manage Room' : 'Enter Room'}
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Header with Islamic Design */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-700 px-4 py-6 relative overflow-hidden">
        {/* Islamic Pattern Background */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="islamic-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="10" cy="10" r="2" fill="white"/>
                <path d="M5,5 L15,5 L15,15 L5,15 Z" fill="none" stroke="white" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#islamic-pattern)"/>
          </svg>
        </div>
        
        <div className="max-w-md mx-auto relative z-10">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-white">Zikir Amol</h1>
            <Button 
              onClick={() => setShowCreateModal(true)}
              className="bg-white text-green-600 hover:bg-gray-100 shadow-md"
              data-testid="button-create-room"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Room
            </Button>
          </div>
          
          {/* Quick Stats with Islamic Design */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center bg-white/20 backdrop-blur-sm rounded-lg p-3 border border-white/30">
              <div className="text-2xl font-bold text-white">{userAnalytics.totalCount || 0}</div>
              <div className="text-xs text-green-100">Total Zikir</div>
            </div>
            <div className="text-center bg-white/20 backdrop-blur-sm rounded-lg p-3 border border-white/30">
              <div className="text-2xl font-bold text-white">{userAnalytics.currentStreak || 0}</div>
              <div className="text-xs text-green-100">Day Streak</div>
            </div>
            <div className="text-center bg-white/20 backdrop-blur-sm rounded-lg p-3 border border-white/30">
              <div className="text-2xl font-bold text-white">{Array.isArray(userRooms) ? userRooms.length : 0}</div>
              <div className="text-xs text-green-100">My Rooms</div>
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
                <p className="text-gray-600 mb-4">Create your first zikir room to get started</p>
                <Button 
                  onClick={() => setShowCreateModal(true)}
                  className="bg-green-600 hover:bg-green-700"
                  data-testid="button-create-first-room"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Room
                </Button>
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
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <Trophy className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Global Leaderboard</h3>
              <p className="text-gray-600">Coming soon...</p>
            </div>
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