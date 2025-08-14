import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Users, Target, Clock, Crown, Share2, Copy, Settings, Zap, AlertTriangle, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useWebSocket } from "@/hooks/useWebSocket";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { DigitalTasbih } from "@/components/digital-tasbih";
import { LeaderboardWidget } from "@/components/leaderboard-widget";
import TasbihGallery from "@/components/tasbih-gallery";
import { ReportRoomModal } from "@/components/report-room-modal";
import { DeleteRoomModal } from "@/components/delete-room-modal";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function Room() {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const roomId = parseInt(id || "0");
  
  const [tasbihType, setTasbihType] = useState<'digital' | 'physical' | 'hand'>('digital');
  const [showShareModal, setShowShareModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const { data: room, isLoading: roomLoading } = useQuery({
    queryKey: [`/api/rooms/${roomId}`],
    enabled: !!roomId,
  }) as { data: any, isLoading: boolean };

  const { data: userCount = 0 } = useQuery({
    queryKey: [`/api/rooms/${roomId}/user-count`],
    enabled: !!roomId,
    refetchInterval: 5000,
  }) as { data: number };

  const { data: leaderboard = [] } = useQuery({
    queryKey: [`/api/rooms/${roomId}/leaderboard`],
    enabled: !!roomId,
    refetchInterval: 3000,
  }) as { data: any[] };

  // Get room member count for deletion check
  const { data: memberCount = 0 } = useQuery({
    queryKey: [`/api/rooms/${roomId}/member-count`],
    enabled: !!roomId && !!user?.id,
  }) as { data: number };

  // Optimized count mutation with immediate UI feedback
  const countMutation = useMutation({
    mutationFn: async () => {
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
      // Rollback on error
      if (context?.previousCount !== undefined) {
        queryClient.setQueryData([`/api/rooms/${roomId}/user-count`], context.previousCount);
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
        title: "Count Failed",
        description: "Please try again",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      // Refresh leaderboard after successful count
      queryClient.invalidateQueries({ queryKey: [`/api/rooms/${roomId}/leaderboard`] });
    },
  });

  const handleCount = useCallback(() => {
    countMutation.mutate();
  }, [countMutation]);

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
            <div className="w-full h-full border-4 border-green-200 border-t-green-600 rounded-full"></div>
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 pb-20">
      {/* Header */}
      <header className="bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-4 sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          
          <div className="text-center flex-1">
            <h1 className="text-lg font-bold truncate">{room?.name || `${room?.zikirName} Room`}</h1>
            <p className="text-sm text-green-100">
              Room #{roomId.toString().padStart(6, '0')}
            </p>
          </div>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={shareRoom}
            className="text-white hover:bg-white/20"
          >
            <Share2 className="w-4 h-4" />
          </Button>
        </div>
        
        {/* Room Stats */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="bg-white/10 backdrop-blur rounded-lg p-2 text-center">
            <div className="flex items-center justify-center mb-1">
              <Users className="w-4 h-4" />
            </div>
            <div className="text-sm font-bold">{leaderboard.length}</div>
            <div className="text-xs text-green-100">Members</div>
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
              {room.zikirArabicText && (
                <div className="text-2xl mb-2 leading-relaxed" style={{ fontFamily: 'Amiri, serif' }}>
                  {room.zikirArabicText}
                </div>
              )}
              {room.zikirTransliteration && (
                <div className="text-gray-600 italic mb-2">{room.zikirTransliteration}</div>
              )}
              {room.zikirTranslation && (
                <div className="text-sm text-gray-700">{room.zikirTranslation}</div>
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

        {/* Tasbih Counter */}
        <div className="mb-6">
          <DigitalTasbih
            onCount={handleCount}
            count={userCount as number}
            targetCount={room?.targetCount}
            unlimited={room?.unlimited}
            tasbihType={tasbihType}
          />
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
            <Link href="/leaderboard">
              <div className="cursor-pointer" data-testid="link-leaderboard">
                <LeaderboardWidget
                  entries={leaderboard as any[]}
                  currentUserId={(user as any)?.id || ''}
                  title="Room Leaderboard"
                  showTop={10}
                />
                <div className="mt-2 text-center">
                  <Button variant="outline" size="sm" className="text-xs">
                    View Global Leaderboard →
                  </Button>
                </div>
              </div>
            </Link>
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
                    {user?.id === room?.ownerId && (
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
    </div>
  );
}