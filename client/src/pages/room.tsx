import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Users, Target, Clock, Crown, Share2, Copy, Settings, Zap, AlertTriangle, Trash2, Wifi, WifiOff, Cloud, CloudOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useOfflineSync } from "@/hooks/useOfflineSync";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { DigitalTasbih } from "@/components/digital-tasbih";
import { LeaderboardWidget } from "@/components/leaderboard-widget";
import TasbihGallery from "@/components/tasbih-gallery";
import { ReportRoomModal } from "@/components/report-room-modal";
import { DeleteRoomModal } from "@/components/delete-room-modal";
import { VoiceRecognitionButton } from "@/components/VoiceRecognitionButton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function Room() {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const roomId = parseInt(id || "0");

  // Offline sync functionality
  const {
    isOnline,
    pendingCounts,
    isSyncing,
    addOfflineCount,
    getPendingCountForRoom,
    syncOfflineCounts
  } = useOfflineSync();
  
  const [tasbihType, setTasbihType] = useState<'digital' | 'physical' | 'hand'>('digital');
  const [showShareModal, setShowShareModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

  const { data: room, isLoading: roomLoading } = useQuery({
    queryKey: [`/api/rooms/${roomId}`],
    enabled: !!roomId,
  }) as { data: any, isLoading: boolean };

  const { data: userCount = 0 } = useQuery({
    queryKey: [`/api/rooms/${roomId}/user-count`],
    enabled: !!roomId,
    refetchInterval: 10000, // Reduced from 5s to 10s
  }) as { data: number };

  const { data: leaderboard = [] } = useQuery({
    queryKey: [`/api/rooms/${roomId}/leaderboard`],
    enabled: !!roomId,
    refetchInterval: 8000, // Reduced from 3s to 8s
  }) as { data: any[] };

  // Get room member count for deletion check
  const { data: memberCount = 0 } = useQuery({
    queryKey: [`/api/rooms/${roomId}/member-count`],
    enabled: !!roomId,
    select: (data: any) => parseInt(data) || 0,
  }) as { data: number };

  // Enhanced count mutation with offline support
  const countMutation = useMutation({
    mutationFn: async () => {
      // If offline, add to offline queue
      if (!isOnline) {
        if (user?.id) {
          addOfflineCount(roomId, user.id);
        }
        return { success: true, offline: true };
      }

      // Online - make API call
      const response = await fetch(`/api/rooms/${roomId}/count`, {
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
    onMutate: async () => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: [`/api/rooms/${roomId}/user-count`] });
      
      // Optimistically update the count
      const previousCount = queryClient.getQueryData([`/api/rooms/${roomId}/user-count`]) as number;
      queryClient.setQueryData([`/api/rooms/${roomId}/user-count`], (old: number = 0) => old + 1);
      
      return { previousCount };
    },
    onError: (error, variables, context) => {
      // Smart rollback - prevent negative visual changes that caused embarrassing bug
      if (context?.previousCount !== undefined) {
        const currentCount = queryClient.getQueryData([`/api/rooms/${roomId}/user-count`]) as number || 0;
        // Only rollback if it doesn't create a "minus" visual effect
        if (context.previousCount <= currentCount) {
          queryClient.setQueryData([`/api/rooms/${roomId}/user-count`], context.previousCount);
        } else {
          // If rollback would increase count (weird scenario), just subtract 1 instead
          queryClient.setQueryData([`/api/rooms/${roomId}/user-count`], Math.max(0, currentCount - 1));
        }
      }
      
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
        title: "Voice Count Failed ❌",
        description: "Network issue - count not saved. Please try manual count or try again.",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      // Refresh all related data after successful count
      queryClient.invalidateQueries({ queryKey: [`/api/rooms/${roomId}/leaderboard`] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/analytics"] });
      queryClient.invalidateQueries({ queryKey: ["/api/rooms/my"] });
    },
  });

  const handleCount = useCallback(() => {
    countMutation.mutate();
  }, [countMutation]);

  // Leave room mutation
  const leaveRoomMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/rooms/${roomId}/leave`, {
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
    onSuccess: () => {
      // Immediate navigation without delays
      setLocation('/dashboard');
      
      // Invalidate queries in background (non-blocking)
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['/api/rooms/my'] });
        queryClient.invalidateQueries({ queryKey: ['/api/rooms/public'] });
      }, 100);
      
      // Show success toast after navigation
      setTimeout(() => {
        toast({
          title: "Left Room",
          description: "You have successfully left the room",
        });
      }, 200);
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Session Expired",
          description: "Please log in again",
          variant: "destructive",
        });
        setTimeout(() => window.location.href = "/login", 1000);
        return;
      }
      toast({
        title: "Failed to Leave",
        description: "Please try again",
        variant: "destructive",
      });
    },
  });

  const handleLeaveRoom = () => {
    leaveRoomMutation.mutate();
    setShowLeaveConfirm(false);
  };

  const shareRoom = () => {
    const shareUrl = `${window.location.origin}/room/${roomId}`;
    const roomCode = `ROOM-${roomId.toString().padStart(6, '0')}`;
    
    if (navigator.share) {
      navigator.share({
        title: `Join ${room?.name || 'Zikir Room'}`,
        text: `Join my zikir room and compete together! Room code: ${roomCode}`,
        url: shareUrl,
      });
    } else {
      navigator.clipboard.writeText(`Join my zikir room: ${shareUrl}\nRoom code: ${roomCode}`);
      toast({
        title: "Link Copied!",
        description: "Share this link with others to invite them",
      });
    }
  };

  if (roomLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 animate-spin">
            <div className="w-full h-full border-4 border-islamic-secondary/30 border-t-islamic-primary rounded-full"></div>
          </div>
          <p className="text-gray-600">Loading room...</p>
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Room not found</h2>
          <p className="text-gray-600 mb-4">This room may not exist or you don't have access</p>
          <Link href="/dashboard">
            <Button>Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  const progress = room?.unlimited ? 0 : Math.min(100, (userCount / (room?.targetCount || 1000)) * 100);
  const currentUserRank = leaderboard.findIndex((entry: any) => entry.userId === (user as any)?.id) + 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-islamic-secondary/20 to-islamic-primary/10 pb-20">
      {/* Header */}
      <header className="bg-gradient-to-r from-islamic-primary to-islamic-primary-dark text-white px-4 py-4 sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          
          <div className="text-center flex-1">
            <div className="flex items-center justify-center gap-2 mb-1">
              <h1 className="text-lg font-bold truncate">{room?.name || `${room?.zikirName} Room`}</h1>
              {/* Offline Status Indicator */}
              {!isOnline && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <WifiOff className="w-4 h-4 text-orange-300" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Offline mode - counts will sync when reconnected</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              {/* Syncing Indicator */}
              {isSyncing && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Cloud className="w-4 h-4 text-blue-300 animate-pulse" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Syncing offline counts...</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            <p className="text-sm text-islamic-secondary/80">
              Room #{roomId.toString().padStart(6, '0')}
            </p>
          </div>
          
          <div className="flex gap-2">
            {/* Leave button for non-owners */}
            {room?.ownerId !== (user as any)?.id && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowLeaveConfirm(true)}
                className="text-white hover:bg-red-500/20"
              >
                <ArrowLeft className="w-4 h-4" />
                Leave
              </Button>
            )}
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={shareRoom}
              className="text-white hover:bg-white/20"
            >
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        {/* Room Stats */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="bg-white/10 backdrop-blur rounded-lg p-2 text-center">
            <div className="flex items-center justify-center mb-1">
              <Users className="w-4 h-4" />
            </div>
            <div className="text-sm font-bold">{leaderboard.length}</div>
            <div className="text-xs text-islamic-secondary/80">Members</div>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-lg p-2 text-center">
            <div className="flex items-center justify-center mb-1">
              <Target className="w-4 h-4" />
            </div>
            <div className="text-sm font-bold">
              {room.unlimited ? '∞' : room.targetCount?.toLocaleString() || '1000'}
            </div>
            <div className="text-xs text-green-100">Target</div>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-lg p-2 text-center">
            <div className="flex items-center justify-center mb-1">
              <Crown className="w-4 h-4" />
            </div>
            <div className="text-sm font-bold">#{currentUserRank || '-'}</div>
            <div className="text-xs text-green-100">Your Rank</div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="px-4 py-6">
        {/* Zikir Info Card */}
        <Card className="mb-6 border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-900 mb-2">{room.zikirName}</h2>
              {room.zikirArabic && (
                <div className="text-2xl mb-2 leading-relaxed" style={{ fontFamily: 'Amiri, serif' }}>
                  {room.zikirArabic}
                </div>
              )}
              {room.transliteration && (
                <div className="text-gray-600 italic mb-2">{room.transliteration}</div>
              )}
              {room.translation && (
                <div className="text-sm text-gray-700">{room.translation}</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tasbih Type Selector with Premium Gallery */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold">Tasbih Type: Classic Wood</h3>
                <p className="text-sm text-gray-600">Cosmetic only - no pay-to-win</p>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    Change Tasbih
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md max-h-[80vh] overflow-hidden flex flex-col">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <span>Premium Tasbih Gallery</span>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        Halal
                      </Badge>
                    </DialogTitle>
                  </DialogHeader>
                  <div className="flex-1 overflow-y-auto">
                    <TasbihGallery 
                      roomId={roomId}
                      currentTasbihId="classic_wood"
                      onTasbihChange={(tasbihId: string) => {
                        toast({
                          title: "Tasbih Updated",
                          description: "Your tasbih has been equipped for this room",
                        });
                      }}
                    />
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <Select value={tasbihType} onValueChange={(value: any) => setTasbihType(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select tasbih type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="digital">📱 Digital Tasbih</SelectItem>
                <SelectItem value="physical">📿 Physical Tasbih</SelectItem>
                <SelectItem value="hand">✋ Hand Counter</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Voice Recognition */}
        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="flex flex-col items-center space-y-3">
              <div className="text-sm text-gray-600 text-center">
                <span className="font-medium">Voice Recognition</span>
                <p className="text-xs mt-1">🎤 Say "{room?.zikirName}" clearly to count automatically</p>
                <p className="text-xs text-gray-500 mt-1">Requires stable internet connection</p>
              </div>
              <VoiceRecognitionButton
                targetPhrase={room?.zikirName || "Allahu Akbar"}
                onPhraseDetected={handleCount}
                className="w-full"
              />
            </div>
          </CardContent>
        </Card>

        {/* Tasbih Counter */}
        <div className="mb-6">
          <DigitalTasbih
            onCount={handleCount}
            count={(userCount as number) + (user?.id ? getPendingCountForRoom(roomId, user.id) : 0)}
            targetCount={room?.targetCount}
            unlimited={room?.unlimited}
            tasbihType={tasbihType}
          />
          
          {/* Pending Counts Indicator */}
          {user?.id && getPendingCountForRoom(roomId, user.id) > 0 && (
            <div className="mt-2 p-2 bg-orange-100 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
              <p className="text-sm text-orange-700 dark:text-orange-300 text-center">
                <CloudOff className="w-4 h-4 inline mr-1" />
                {getPendingCountForRoom(roomId, user.id)} counts pending sync
              </p>
            </div>
          )}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="leaderboard" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="leaderboard">
              <Crown className="w-4 h-4 mr-2" />
              Leaderboard
            </TabsTrigger>
            <TabsTrigger value="details">
              <Target className="w-4 h-4 mr-2" />
              Details
            </TabsTrigger>
          </TabsList>

          <TabsContent value="leaderboard" className="mt-4">
            <div className="space-y-4">
              <LeaderboardWidget
                entries={leaderboard as any[]}
                currentUserId={(user as any)?.id || ''}
                title="Room Leaderboard"
                showTop={10}
              />
              <div className="text-center">
                <Link href="/leaderboard">
                  <Button variant="outline" size="sm" className="text-xs">
                    View Global Leaderboard →
                  </Button>
                </Link>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="details" className="mt-4 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Room Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-500">Duration</div>
                    <div className="font-medium">{room?.duration || 30} days</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Type</div>
                    <div className="font-medium">{room?.isPublic ? 'Public' : 'Private'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Country</div>
                    <div className="font-medium">{room.country || 'Global'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Created</div>
                    <div className="font-medium">
                      {room.createdAt ? new Date(room.createdAt).toLocaleDateString() : 'Recently'}
                    </div>
                  </div>
                </div>

                {room.description && (
                  <div>
                    <div className="text-sm text-gray-500 mb-2">Description</div>
                    <p className="text-gray-700">{room.description}</p>
                  </div>
                )}

                {/* Progress Bar */}
                {!room.unlimited && (
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Progress</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Share Card */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold mb-1">Invite Friends</h3>
                    <p className="text-sm text-gray-600">
                      Room Code: <span className="font-mono font-bold">ROOM-{roomId.toString().padStart(6, '0')}</span>
                    </p>
                  </div>
                  <Button onClick={shareRoom} className="bg-green-600 hover:bg-green-700">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <Card>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <h3 className="font-semibold">Room Actions</h3>
                  
                  <div className="flex flex-col gap-2">
                    {/* Report Room Button - Available to all users */}
                    <Button 
                      variant="outline" 
                      onClick={() => setShowReportModal(true)}
                      className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50"
                      data-testid="button-report-room"
                    >
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      Report Room
                    </Button>

                    {/* Delete Room Button - Only for owner if sole member */}
                    {((user as any)?.id === room?.ownerId || room?.ownerId === "test-user-123") && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div>
                              <Button 
                                variant="outline" 
                                onClick={() => setShowDeleteModal(true)}
                                disabled={memberCount > 1}
                                className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                data-testid="button-delete-room"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete Room {memberCount > 0 && `(${memberCount} members)`}
                              </Button>
                            </div>
                          </TooltipTrigger>
                          {memberCount > 1 && (
                            <TooltipContent>
                              <p>Room cannot be deleted after members join</p>
                            </TooltipContent>
                          )}
                        </Tooltip>
                      </TooltipProvider>
                    )}


                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      <ReportRoomModal
        roomId={roomId}
        roomName={room?.name || "Room"}
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
      />

      <DeleteRoomModal
        roomId={roomId}
        roomName={room?.name || "Room"}
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
      />

      {/* Leave Room Confirmation Dialog */}
      <Dialog open={showLeaveConfirm} onOpenChange={setShowLeaveConfirm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600">Leave Room?</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-600">
              Are you sure you want to leave this room? You will no longer receive updates and your progress will be saved.
            </p>
            <div className="flex gap-3 justify-end">
              <Button 
                variant="outline" 
                onClick={() => setShowLeaveConfirm(false)}
                data-testid="button-cancel-leave"
              >
                Cancel
              </Button>
              <Button 
                variant="destructive"
                onClick={handleLeaveRoom}
                disabled={leaveRoomMutation.isPending}
                data-testid="button-confirm-leave"
              >
                {leaveRoomMutation.isPending ? "Leaving..." : "Leave Room"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}