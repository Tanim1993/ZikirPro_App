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
      {/* Navigation Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-islamic-green rounded-full flex items-center justify-center">
                <i className="fas fa-prayer-beads text-white text-lg"></i>
              </div>
              <h1 className="text-xl font-semibold text-gray-900 font-amiri">Zikir Amol</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link href="/profile">
                <Button variant="ghost" size="sm" data-testid="button-profile">
                  <div className="w-8 h-8 bg-islamic-green rounded-full overflow-hidden">
                    <div className="w-full h-full bg-islamic-green flex items-center justify-center">
                      <i className="fas fa-user text-white text-sm"></i>
                    </div>
                  </div>
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={handleLogout} data-testid="button-logout">
                <i className="fas fa-sign-out-alt"></i>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
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

        {/* Quick Actions */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <Button 
            onClick={() => setShowCreateModal(true)}
            className="flex-1 bg-islamic-gold hover:bg-islamic-gold-dark text-white font-semibold py-3 px-6 rounded-xl shadow-lg"
            data-testid="button-create-room"
          >
            <i className="fas fa-plus mr-2"></i>
            Create Zikir Room
          </Button>
          <Button 
            variant="outline"
            className="flex-1 border-2 border-islamic-green text-islamic-green hover:bg-islamic-green hover:text-white font-semibold py-3 px-6 rounded-xl shadow-lg"
            data-testid="button-join-room"
          >
            <i className="fas fa-door-open mr-2"></i>
            Join Room
          </Button>
        </div>

        {/* Tabs Navigation */}
        <Tabs defaultValue="my-rooms" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="my-rooms" data-testid="tab-my-rooms">
              <i className="fas fa-home mr-2"></i>My Rooms
            </TabsTrigger>
            <TabsTrigger value="public-rooms" data-testid="tab-public-rooms">
              <i className="fas fa-globe mr-2"></i>Public Rooms
            </TabsTrigger>
            <TabsTrigger value="leaderboard" data-testid="tab-leaderboard">
              <i className="fas fa-trophy mr-2"></i>Leaderboard
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
