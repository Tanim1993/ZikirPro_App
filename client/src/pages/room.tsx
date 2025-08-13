import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { useAuth } from "../hooks/useAuth";
import { useWebSocket } from "../hooks/useWebSocket";
import { useToast } from "../hooks/use-toast";
import { isUnauthorizedError } from "../lib/authUtils";
import { apiRequest } from "../lib/queryClient";
import TasbihCounter from "../components/tasbih-counter";
import LiveLeaderboard from "../components/live-leaderboard";
import CongratulationsModal from "../components/congratulations-modal";

export default function Room() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const roomId = parseInt(id || "0");
  
  const [showCongratulations, setShowCongratulations] = useState(false);
  const [congratulationsCount, setCongratulationsCount] = useState(0);

  // Redirect if not authenticated
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

  const { data: room, isLoading: roomLoading } = useQuery({
    queryKey: ["/api/rooms", roomId],
    enabled: !!user && !!roomId,
  });

  const { data: userCount } = useQuery({
    queryKey: ["/api/rooms", roomId, "user-count"],
    enabled: !!user && !!roomId,
  });

  const { data: leaderboard = [], isLoading: leaderboardLoading } = useQuery({
    queryKey: ["/api/rooms", roomId, "leaderboard"],
    enabled: !!user && !!roomId,
  });

  // WebSocket connection for real-time updates
  const { sendMessage } = useWebSocket({
    onMessage: (data) => {
      if (data.type === 'countUpdate' && data.data.roomId === roomId) {
        // Update leaderboard
        queryClient.setQueryData(["/api/rooms", roomId, "leaderboard"], data.data.leaderboard);
        
        // Show congratulations for milestones
        if (data.data.userId === (user as any)?.id && data.data.counter.todayCount % 100 === 0) {
          setCongratulationsCount(data.data.counter.todayCount);
          setShowCongratulations(true);
        }
      }
    }
  });

  // Join room WebSocket channel
  useEffect(() => {
    if (roomId && user) {
      sendMessage({
        type: 'joinRoom',
        roomId: roomId
      });
    }
  }, [roomId, user, sendMessage]);

  const incrementCountMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", `/api/rooms/${roomId}/count`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rooms", roomId, "leaderboard"] });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
      } else {
        toast({
          title: "Error",
          description: "Failed to increment count",
          variant: "destructive",
        });
      }
    }
  });

  const resetCountMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", `/api/rooms/${roomId}/reset`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rooms", roomId, "leaderboard"] });
      toast({
        title: "Count Reset",
        description: "Your count has been reset to 0",
      });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
      } else {
        toast({
          title: "Error",
          description: "Failed to reset count",
          variant: "destructive",
        });
      }
    }
  });

  const handleBack = () => {
    setLocation("/");
  };

  const handleTasbihTap = () => {
    incrementCountMutation.mutate();
  };

  const handleReset = () => {
    if (confirm("Are you sure you want to reset your count? This action cannot be undone.")) {
      resetCountMutation.mutate();
    }
  };

  if (authLoading || roomLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 text-islamic-green">
            <i className="fas fa-prayer-beads text-4xl animate-pulse"></i>
          </div>
          <p className="text-gray-600">Loading room...</p>
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="text-center py-12">
            <i className="fas fa-exclamation-circle text-red-500 text-4xl mb-4"></i>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Room Not Found</h2>
            <p className="text-gray-600 mb-4">This room doesn't exist or you don't have access.</p>
            <Button onClick={handleBack} data-testid="button-back-to-dashboard">
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const userInLeaderboard = (leaderboard as any[]).find((u: any) => u.userId === (user as any)?.id);
  const currentCount = userInLeaderboard?.todayCount || 0;

  return (
    <div className="min-h-screen bg-white">
      {/* Room Header */}
      <div className="bg-gradient-to-r from-islamic-green to-islamic-green-light text-white p-4">
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            onClick={handleBack}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg text-white"
            data-testid="button-exit-room"
          >
            <i className="fas fa-arrow-left text-xl"></i>
          </Button>
          <div className="text-center">
            <h2 className="text-xl font-bold font-amiri">{(room as any).zikirName}</h2>
            <p className="text-green-100">{(room as any).description || `${(room as any).duration} Days Challenge`}</p>
          </div>
          <Button 
            variant="ghost"
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg text-white"
            data-testid="button-room-settings"
          >
            <i className="fas fa-cog text-xl"></i>
          </Button>
        </div>
      </div>

      <div className="flex flex-col h-screen pt-20">
        {/* Live Leaderboard Section */}
        <div className="bg-gray-50 p-4 border-b">
          <LiveLeaderboard 
            leaderboard={leaderboard as any[]} 
            currentUserId={(user as any)?.id}
            isLoading={leaderboardLoading}
          />
        </div>

        {/* Digital Tasbih Counter Section */}
        <div className="flex-1 flex flex-col justify-center items-center p-8 bg-white">
          <TasbihCounter
            count={currentCount}
            target={(room as any).targetCount}
            onTap={handleTasbihTap}
            onReset={handleReset}
            isLoading={incrementCountMutation.isPending || resetCountMutation.isPending}
          />
        </div>
      </div>

      {/* Congratulations Modal */}
      <CongratulationsModal
        open={showCongratulations}
        onOpenChange={setShowCongratulations}
        count={congratulationsCount}
      />
    </div>
  );
}
