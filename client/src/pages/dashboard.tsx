import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import CreateRoomModal from "@/components/create-room-modal";
import { GlobalLeaderboard } from "@/components/global-leaderboard";
import SeasonalCompetitions from "@/pages/seasonal-competitions";
import { GamificationTopBar } from "@/components/gamification-top-bar";
import { NewUserOnboarding } from "@/components/NewUserOnboarding";
import { GamificationIntroModal } from "@/components/gamification-intro-modal";
import { SpiritualProgressionSystem } from "@/components/spiritual-progression-system";
import { AchievementNotification } from "@/components/achievement-notification";
import { IslamicBadgeGallery } from "@/components/islamic-badge-gallery";
import { FloatingTasbih } from "@/components/floating-tasbih";
import { useGamification } from "@/hooks/useGamification";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Clock, Users, Target, Trophy, Plus, Globe, Home, Star, Calculator, Building2, Zap, Calendar, BookOpen } from "lucide-react";
import React from "react";
import { cn } from "@/lib/utils";

export default function Dashboard() {
  // All useState hooks at the top - NEVER move these after any conditional returns
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinConfirm, setShowJoinConfirm] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [showFloatingTasbih, setShowFloatingTasbih] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showGamificationIntro, setShowGamificationIntro] = useState(() => {
    return !localStorage.getItem('gamification-intro-seen');
  });
  
  // All custom hooks immediately after useState
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { currentAchievement, dismissAchievement } = useGamification();
  
  // All useQuery hooks together
  const { data: userRooms = [], isLoading: roomsLoading } = useQuery({
    queryKey: ["/api/rooms/my"],
    staleTime: 30000, // Data stays fresh for 30 seconds
    refetchInterval: 30000, // Reduced from 15s to 30s
  });



  const { data: orgRooms = [], isLoading: orgRoomsLoading } = useQuery({
    queryKey: ["/api/rooms/organizations"],
    staleTime: 60000, // Data stays fresh for 60 seconds
    enabled: (user as any)?.userType !== 'organization', // Only load for regular users
  });

  const { data: userAnalytics = {}, isLoading: analyticsLoading } = useQuery({
    queryKey: ["/api/user/analytics"],
    staleTime: 20000, // Data stays fresh for 20 seconds
    refetchInterval: 60000, // Reduced from 10s to 60s for analytics
  });

  // Get gamification data from separate query since it's not in the hook
  const { data: gamificationData } = useQuery({ 
    queryKey: ["/api/user/gamification"],
    staleTime: 30000, // Data stays fresh for 30 seconds
  });

  // Check floating tasbih setting
  React.useEffect(() => {
    if ((user as any)?.floatingTasbihEnabled) {
      setShowFloatingTasbih(true);
    }
  }, [(user as any)?.floatingTasbihEnabled]);

  // Calculate total rooms count
  const totalRoomsCount = (userRooms as any[])?.length || 0;

  // Check if user is new (no rooms and low activity)
  const isNewUser = totalRoomsCount === 0 && 
    ((userAnalytics as any)?.totalZikir || 0) === 0 && 
    ((gamificationData as any)?.barakahCoins || 0) === 0;

  // Show onboarding for new users
  React.useEffect(() => {
    if (isNewUser && !roomsLoading && !analyticsLoading) {
      setShowOnboarding(true);
    }
  }, [isNewUser, roomsLoading, analyticsLoading]);

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

  const isLoading = roomsLoading || orgRoomsLoading || analyticsLoading;

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

  const RoomCard = ({ room, isOwner = false, isPublic = false, isOrganization = false }: { room: any, isOwner?: boolean, isPublic?: boolean, isOrganization?: boolean }) => (
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
        
        <div className="grid grid-cols-3 gap-2 mb-3 text-center">
          <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg p-2.5 text-white shadow-md">
            <div className="text-lg font-bold">{room.memberCount || 0}</div>
            <div className="text-xs opacity-90">Members</div>
          </div>
          <div className="bg-gradient-to-br from-indigo-500 to-blue-600 rounded-lg p-2.5 text-white shadow-md">
            <div className="text-lg font-bold">{room.totalCount || 0}</div>
            <div className="text-xs opacity-90">Total Count</div>
          </div>
          <div className="bg-green-500 rounded-lg p-2.5 text-white shadow-md">
            <div className="text-sm font-bold">{formatDuration(room.duration)}</div>
            <div className="text-xs opacity-90">Duration</div>
          </div>
        </div>
        
        {isPublic ? (
          <Button 
            onClick={() => {
              setSelectedRoom(room);
              setShowJoinConfirm(true);
            }}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white py-2 text-sm font-medium rounded-lg shadow-md hover:shadow-lg transition-all"
            data-testid="button-tap-to-join"
          >
            Join Room
          </Button>
        ) : (
          <Link href={`/room/${room.id}`}>
            <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-2 text-sm font-medium rounded-lg shadow-md hover:shadow-lg transition-all" data-testid="button-enter-room">
              {isOwner ? 'Manage Room' : 'Enter Room'}
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Ludo Star Style Gamification Top Bar */}
      <GamificationTopBar />
      

      {/* Achievement Notifications */}
      <AchievementNotification 
        achievement={currentAchievement}
        onComplete={dismissAchievement}
      />

      {/* Floating Tasbih */}
      <FloatingTasbih 
        isOpen={showFloatingTasbih}
        onClose={() => setShowFloatingTasbih(false)}
      />

      {/* User Stats Section - Beautiful Cards positioned above Level display */}
      <div className="bg-gradient-to-b from-blue-50 to-white px-4 py-4">
        <div className="max-w-md mx-auto">
          <div className="grid grid-cols-4 gap-3 mb-4">
            {/* Total Zikir */}
            <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg p-3 text-white shadow-lg">
              <div className="flex items-center justify-center mb-1">
                <Star className="w-4 h-4" />
              </div>
              <div className="text-center">
                <div className="text-lg font-bold">{parseInt((userAnalytics as any)?.totalZikir) || 0}</div>
                <div className="text-xs opacity-90">Total Zikir</div>
              </div>
            </div>

            {/* Barakah Coins */}
            <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg p-3 text-white shadow-lg">
              <div className="flex items-center justify-center mb-1">
                <Calculator className="w-4 h-4" />
              </div>
              <div className="text-center">
                <div className="text-lg font-bold">{(gamificationData as any)?.barakahCoins || 0}</div>
                <div className="text-xs opacity-90">Coins</div>
              </div>
            </div>

            {/* Total Rooms */}
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg p-3 text-white shadow-lg">
              <div className="flex items-center justify-center mb-1">
                <Home className="w-4 h-4" />
              </div>
              <div className="text-center">
                <div className="text-lg font-bold">{totalRoomsCount}</div>
                <div className="text-xs opacity-90">My Rooms</div>
              </div>
            </div>

            {/* Current Streak */}
            <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg p-3 text-white shadow-lg">
              <div className="flex items-center justify-center mb-1">
                <Zap className="w-4 h-4" />
              </div>
              <div className="text-center">
                <div className="text-lg font-bold">{(userAnalytics as any)?.currentStreak || 0}</div>
                <div className="text-xs opacity-90">Day Streak</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* App Header with Create Room Button - Moved below stats */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-islamic-gradient rounded-lg flex items-center justify-center">
                <div className="text-sm font-bold text-white font-amiri">ج</div>
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-800">Zikir Amol</h1>
                <p className="text-gray-500 text-xs">Islamic Prayer Counter & Competition</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={() => setShowCreateModal(true)}
                className="bg-islamic-primary text-white hover:bg-islamic-primary/90 shadow-sm px-3 py-2 text-sm font-medium rounded-lg"
                data-testid="button-create-room"
              >
                <Plus className="w-4 h-4 mr-1" />
                Create Room
              </Button>
              
              {/* Admin Buttons - Only for admin users */}
              {user && ((user as any)?.userType === 'admin' || (user as any)?.username === 'admin' || (user as any)?.id === 'founder-admin-id') ? (
                <>
                  <Link href="/admin-levels">
                    <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm px-3 py-2 text-sm font-medium rounded-lg" data-testid="button-admin-levels">
                      <div className="text-sm mr-1">⚙️</div>
                      Levels
                    </Button>
                  </Link>
                  <Link href="/admin-gamification">
                    <Button className="bg-purple-600 hover:bg-purple-700 text-white shadow-sm px-3 py-2 text-sm font-medium rounded-lg" data-testid="button-admin-gamification">
                      <div className="text-sm mr-1">🎮</div>
                      Admin
                    </Button>
                  </Link>
                </>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* Clean Content Section */}
      <div className="max-w-md mx-auto px-4">
        <Tabs defaultValue="my-rooms" className="w-full">
          <TabsList className={cn(
            "bg-gray-100 p-1 rounded-lg w-full",
            (user as any)?.userType === 'organization' 
              ? "grid grid-cols-3" 
              : "grid grid-cols-6"
          )}>
            <TabsTrigger value="my-rooms" className="text-xs data-[state=active]:bg-white data-[state=active]:text-islamic-primary data-[state=active]:shadow-sm" data-testid="tab-my-rooms">
              <Home className="w-3 h-3 mr-1" />
              {(user as any)?.userType === 'organization' ? 'Competitions' : 'Rooms'}
            </TabsTrigger>
            {(user as any)?.userType !== 'organization' && (
              <TabsTrigger value="org-rooms" className="text-xs data-[state=active]:bg-white data-[state=active]:text-islamic-primary data-[state=active]:shadow-sm" data-testid="tab-org-rooms">
                <Building2 className="w-3 h-3 mr-1" />
                Org
              </TabsTrigger>
            )}
            {(user as any)?.userType !== 'organization' && (
              <TabsTrigger value="journey" className="text-xs data-[state=active]:bg-white data-[state=active]:text-islamic-primary data-[state=active]:shadow-sm" data-testid="tab-journey">
                <BookOpen className="w-3 h-3 mr-1" />
                Journey
              </TabsTrigger>
            )}
            <TabsTrigger value="seasonal" className="text-xs data-[state=active]:bg-white data-[state=active]:text-islamic-primary data-[state=active]:shadow-sm" data-testid="tab-seasonal">
              <Star className="w-3 h-3 mr-1" />
              Seasonal
            </TabsTrigger>
            {(user as any)?.userType !== 'organization' && (
              <TabsTrigger value="badges" className="text-xs data-[state=active]:bg-white data-[state=active]:text-islamic-primary data-[state=active]:shadow-sm" data-testid="tab-badges">
                <Trophy className="w-3 h-3 mr-1" />
                Badges
              </TabsTrigger>
            )}
            <TabsTrigger value="leaderboard" className="text-xs data-[state=active]:bg-white data-[state=active]:text-islamic-primary data-[state=active]:shadow-sm" data-testid="tab-leaderboard">
              <Trophy className="w-3 h-3 mr-1" />
              Leaders
            </TabsTrigger>
          </TabsList>

          <TabsContent value="my-rooms" className="space-y-4">
            {!Array.isArray(userRooms) || userRooms.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <Home className="w-8 h-8 text-gray-400" />
                </div>
{(user as any)?.userType === 'organization' ? (
                  <>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No competitions created</h3>
                    <p className="text-gray-600 mb-4">Create your first competition to engage your community</p>
                    <Button 
                      onClick={() => setShowCreateModal(true)}
                      className="bg-gradient-to-r from-islamic-primary to-blue-600 hover:from-islamic-primary/90 hover:to-blue-600/90"
                      data-testid="button-create-first-competition"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Competition
                    </Button>
                  </>
                ) : (
                  <>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No rooms yet</h3>
                    <p className="text-gray-600">Use the Create Room button above to get started</p>
                  </>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {(userRooms as any[]).map((room: any) => (
                  <RoomCard 
                    key={room.id} 
                    room={room} 
                    isOwner={room.role === "owner"}
                    isOrganization={(user as any)?.userType === 'organization'}
                  />
                ))}
              </div>
            )}
          </TabsContent>



{(user as any)?.userType !== 'organization' && (
            <TabsContent value="org-rooms" className="space-y-4">
              {!Array.isArray(orgRooms) || orgRooms.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <Building2 className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No organization rooms</h3>
                  <p className="text-gray-600">Organization competitions will appear here</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {(orgRooms as any[]).map((room: any) => (
                    <RoomCard key={room.id} room={room} isPublic={true} />
                  ))}
                </div>
              )}
            </TabsContent>
          )}

          {(user as any)?.userType !== 'organization' && (
            <TabsContent value="journey" className="space-y-4">
              <SpiritualProgressionSystem onStartLevel={(levelId) => {
                // Navigate to learning interface for specific level
                console.log("Starting level:", levelId);
              }} />
            </TabsContent>
          )}

          <TabsContent value="seasonal" className="space-y-4">
            <SeasonalCompetitions />
          </TabsContent>

          {(user as any)?.userType !== 'organization' && (
            <TabsContent value="badges" className="space-y-4">
              <IslamicBadgeGallery />
            </TabsContent>
          )}

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

      {/* New User Onboarding */}
      <NewUserOnboarding 
        onComplete={() => setShowOnboarding(false)}
        onCreateRoom={() => setShowCreateModal(true)}
      />

      {/* Gamification Introduction Modal */}
      <GamificationIntroModal
        open={showGamificationIntro}
        onClose={() => setShowGamificationIntro(false)}
      />

      {/* Join Room Confirmation Dialog */}
      <Dialog open={showJoinConfirm && !showOnboarding} onOpenChange={setShowJoinConfirm}>
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