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
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Clock, Users, Target, Trophy, Plus, Globe, Home, Star } from "lucide-react";

export default function Dashboard() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinConfirm, setShowJoinConfirm] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: userRooms = [], isLoading: roomsLoading } = useQuery({
    queryKey: ["/api/rooms/my"],
  });

  const { data: publicRooms = [], isLoading: publicRoomsLoading } = useQuery({
    queryKey: ["/api/rooms/public"],
  });

  const { data: userAnalytics = {}, isLoading: analyticsLoading } = useQuery({
    queryKey: ["/api/user/analytics"],
  });

  const isLoading = roomsLoading || publicRoomsLoading || analyticsLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 animate-spin">
            <div className="w-full h-full border-4 border-green-200 border-t-green-600 rounded-full"></div>
          </div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const formatDuration = (days: number) => {
    if (days === 1) return "1 day";
    if (days < 30) return `${days} days`;
    return `${Math.floor(days / 30)} month${Math.floor(days / 30) > 1 ? 's' : ''}`;
  };

  // Join room mutation
  const joinRoomMutation = useMutation({
    mutationFn: async (roomId: number) => {
      const response = await fetch(`/api/rooms/${roomId}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
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
        description: `You have successfully joined the room`,
      });
      // Invalidate and refresh user rooms to show the new joined room
      queryClient.invalidateQueries({ queryKey: ['/api/rooms/my'] });
      setShowJoinConfirm(false);
      // Navigate to the room
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

  const handleJoinRoom = () => {
    if (selectedRoom) {
      joinRoomMutation.mutate(selectedRoom.id);
    }
  };

  const RoomCard = ({ room, isOwner = false, isPublic = false }: { room: any, isOwner?: boolean, isPublic?: boolean }) => (
    <Card className="mb-3 border border-gray-200 shadow-sm">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">
              {room.name || `${room.zikirName} Room`}
            </h3>
            <div className="flex items-center text-sm text-gray-600 mb-2">
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                {room.zikirName}
              </span>
            </div>
            {room.description && (
              <p className="text-sm text-gray-600 mb-2">{room.description}</p>
            )}
          </div>
          {isOwner ? (
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
              Owner
            </span>
          ) : (
            <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-medium">
              Global
            </span>
          )}
        </div>
        
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="text-center">
            <div className="flex items-center justify-center text-gray-500 mb-1">
              <Users className="w-4 h-4" />
            </div>
            <div className="text-sm font-medium">{room.memberCount || 0}</div>
            <div className="text-xs text-gray-500">Members</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center text-gray-500 mb-1">
              <Target className="w-4 h-4" />
            </div>
            <div className="text-sm font-medium">
              {room.unlimited ? '∞' : room.targetCount?.toLocaleString() || '100'}
            </div>
            <div className="text-xs text-gray-500">Target</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center text-gray-500 mb-1">
              <Clock className="w-4 h-4" />
            </div>
            <div className="text-sm font-medium">{formatDuration(room.duration || 30)}</div>
            <div className="text-xs text-gray-500">Duration</div>
          </div>
        </div>
        
        {isPublic ? (
          <Button 
            onClick={() => {
              setSelectedRoom(room);
              setShowJoinConfirm(true);
            }}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
          >
            Tap to Join Room
          </Button>
        ) : (
          <Link href={`/room/${room.id}`}>
            <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
              {isOwner ? 'Manage Room' : 'Enter Room'}
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Mobile Header */}
      <header className="bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-2xl">📿</span>
            </div>
            <div>
              <h1 className="text-xl font-bold">Zikir Amol</h1>
              <p className="text-sm text-green-100">As-salamu alaykum, {(user as any)?.firstName || 'Brother'}</p>
            </div>
          </div>
          
          <div className="relative">
            <img 
              src={(user as any)?.profileImageUrl || `https://ui-avatars.com/api/?name=${(user as any)?.firstName || 'User'}&background=059669&color=fff`} 
              alt="Profile" 
              className="w-12 h-12 rounded-full border-2 border-white/30"
            />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full border-2 border-white"></div>
          </div>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/10 backdrop-blur rounded-lg p-3 text-center">
            <div className="text-lg font-bold">{(userAnalytics as any)?.currentStreak || 0}</div>
            <div className="text-xs text-green-100">Day Streak</div>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-lg p-3 text-center">
            <div className="text-lg font-bold">{(userAnalytics as any)?.totalZikir || 0}</div>
            <div className="text-xs text-green-100">Total Zikir</div>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-lg p-3 text-center">
            <div className="text-lg font-bold">{Array.isArray(userRooms) ? userRooms.length : 0}</div>
            <div className="text-xs text-green-100">My Rooms</div>
          </div>
        </div>
      </header>

      {/* Action Buttons */}
      <div className="px-4 py-4">
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Button 
            onClick={() => setShowCreateModal(true)}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-4 rounded-xl shadow-lg"
            data-testid="button-create-room"
          >
            <div className="text-center">
              <Plus className="w-6 h-6 mx-auto mb-1" />
              <span className="text-sm">Create Room</span>
            </div>
          </Button>
          <Button 
            variant="outline"
            className="border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white font-semibold py-4 rounded-xl"
            data-testid="button-browse-rooms"
          >
            <div className="text-center">
              <Globe className="w-6 h-6 mx-auto mb-1" />
              <span className="text-sm">Browse Rooms</span>
            </div>
          </Button>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="my-rooms" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="my-rooms" data-testid="tab-my-rooms" className="text-xs">
              <div className="text-center">
                <Home className="w-4 h-4 mx-auto mb-1" />
                <span>My Rooms</span>
              </div>
            </TabsTrigger>
            <TabsTrigger value="public-rooms" data-testid="tab-public-rooms" className="text-xs">
              <div className="text-center">
                <Globe className="w-4 h-4 mx-auto mb-1" />
                <span>Public</span>
              </div>
            </TabsTrigger>
            <TabsTrigger value="leaderboard" data-testid="tab-leaderboard" className="text-xs">
              <div className="text-center">
                <Trophy className="w-4 h-4 mx-auto mb-1" />
                <span>Leaders</span>
              </div>
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