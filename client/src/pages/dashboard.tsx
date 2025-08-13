import { useEffect, useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/use-toast";
import { isUnauthorizedError } from "../lib/authUtils";
import RoomCard from "../components/room-card";
import CreateRoomModal from "../components/create-room-modal";

export default function Dashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [user, authLoading, toast]);

  const { data: userRooms = [] } = useQuery({
    queryKey: ["/api/rooms/my"],
    enabled: !!user,
  });

  const { data: publicRooms = [] } = useQuery({
    queryKey: ["/api/rooms/public"],
    enabled: !!user,
  });

  const { data: userAnalytics = {} } = useQuery({
    queryKey: ["/api/user/analytics"],
    enabled: !!user,
  });

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 text-islamic-green">
            <i className="fas fa-prayer-beads text-4xl animate-pulse"></i>
          </div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile App Header */}
      <header className="bg-gradient-to-r from-green-600 to-green-700 text-white sticky top-0 z-50">
        <div className="px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-2xl">📿</span>
              </div>
              <div>
                <h1 className="text-xl font-bold font-amiri">Zikir Amol</h1>
                <p className="text-xs text-green-100">Islamic Dhikr Competition</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="relative">
                <img 
                  src={user.profileImageUrl || "https://via.placeholder.com/40"} 
                  alt="Profile" 
                  className="w-10 h-10 rounded-full border-2 border-white/30"
                />
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full border border-white"></div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">As-salamu alaykum</p>
                <p className="text-xs text-green-100">{user.firstName}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="px-4 py-6 pb-24">
        {/* Welcome Section & Dashboard */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-islamic-green to-islamic-green-light rounded-2xl p-6 text-white islamic-pattern relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-2xl font-bold mb-2 font-amiri">Assalamu Alaikum</h2>
              <p className="text-green-100 mb-4">
                {(user as any)?.firstName ? `Brother ${(user as any).firstName}` : 'Welcome'}
              </p>
              
              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold" data-testid="text-streak">
                    {(userAnalytics as any)?.currentStreak || 0}
                  </div>
                  <div className="text-sm text-green-100">Day Streak</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold" data-testid="text-total-count">
                    {(userAnalytics as any)?.totalZikir || 0}
                  </div>
                  <div className="text-sm text-green-100">Total Count</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-islamic-gold">+0%</div>
                  <div className="text-sm text-green-100">Better Today</div>
                </div>
              </div>
            </div>
            
            <div className="absolute top-4 right-4 w-20 h-20 opacity-20">
              <i className="fas fa-star-and-crescent text-4xl animate-float"></i>
            </div>
          </div>
        </div>

        {/* Quick Actions - Mobile Style */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Button 
            onClick={() => setShowCreateModal(true)}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-4 rounded-xl shadow-lg"
            data-testid="button-create-room"
          >
            <div className="text-center">
              <span className="text-xl mb-1 block">➕</span>
              <span className="text-sm">Create Room</span>
            </div>
          </Button>
          <Button 
            variant="outline"
            className="border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white font-semibold py-4 px-4 rounded-xl"
            data-testid="button-join-room"
          >
            <div className="text-center">
              <span className="text-xl mb-1 block">🚪</span>
              <span className="text-sm">Join Room</span>
            </div>
          </Button>
        </div>

        {/* Tabs Navigation - Mobile Style */}
        <Tabs defaultValue="my-rooms" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="my-rooms" data-testid="tab-my-rooms" className="text-xs">
              <div className="text-center">
                <span className="block text-sm">🏠</span>
                <span>My Rooms</span>
              </div>
            </TabsTrigger>
            <TabsTrigger value="public-rooms" data-testid="tab-public-rooms" className="text-xs">
              <div className="text-center">
                <span className="block text-sm">🌍</span>
                <span>Public</span>
              </div>
            </TabsTrigger>
            <TabsTrigger value="leaderboard" data-testid="tab-leaderboard" className="text-xs">
              <div className="text-center">
                <span className="block text-sm">🏆</span>
                <span>Leaders</span>
              </div>
            </TabsTrigger>
            <TabsTrigger value="library" data-testid="tab-library">
              <i className="fas fa-book mr-2"></i>Library
            </TabsTrigger>
          </TabsList>

          <TabsContent value="my-rooms" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(userRooms as any[]).map((room: any) => (
                <RoomCard key={room.id} room={room} />
              ))}
              
              {(userRooms as any[]).length === 0 && (
                <Card className="col-span-full">
                  <CardContent className="text-center py-12">
                    <div className="w-16 h-16 bg-islamic-green bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <i className="fas fa-plus text-islamic-green text-2xl"></i>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">No Rooms Yet</h3>
                    <p className="text-gray-500 mb-4">Create your first Zikir room to get started</p>
                    <Button 
                      onClick={() => setShowCreateModal(true)}
                      className="bg-islamic-green hover:bg-islamic-green-dark"
                      data-testid="button-create-first-room"
                    >
                      Create Room
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="public-rooms" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(publicRooms as any[]).map((room: any) => (
                <RoomCard key={room.id} room={room} isPublic />
              ))}
              
              {(publicRooms as any[]).length === 0 && (
                <Card className="col-span-full">
                  <CardContent className="text-center py-12">
                    <div className="w-16 h-16 bg-islamic-green bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <i className="fas fa-globe text-islamic-green text-2xl"></i>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">No Public Rooms</h3>
                    <p className="text-gray-500">Check back later for public competitions</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="leaderboard" className="mt-6">
            <Card>
              <CardContent className="text-center py-12">
                <div className="w-16 h-16 bg-islamic-gold bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-trophy text-islamic-gold text-2xl"></i>
                </div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Global Leaderboard</h3>
                <p className="text-gray-500">Coming soon - compete with users worldwide</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="library" className="mt-6">
            <Card>
              <CardContent className="text-center py-12">
                <div className="w-16 h-16 bg-blue-500 bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-book text-blue-500 text-2xl"></i>
                </div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Zikir Library</h3>
                <p className="text-gray-500">Browse authentic zikir with fazilat and references</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Create Room Modal */}
      <CreateRoomModal 
        open={showCreateModal} 
        onOpenChange={setShowCreateModal}
      />
    </div>
  );
}
