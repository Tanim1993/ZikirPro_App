import { useState, useCallback } from "react";
import { useParams, Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Settings, Share2, LogOut, Mic, MicOff, Volume2, VolumeX, Users, Target, Crown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useOfflineSync } from "@/hooks/useOfflineSync";
import { isUnauthorizedError } from "@/lib/authUtils";
import { DigitalTasbih } from "@/components/digital-tasbih";
import { VoiceRecognitionButton } from "@/components/VoiceRecognitionButton";
import { motion, AnimatePresence } from "framer-motion";

export default function Room() {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const roomId = parseInt(id || "0");

  const { isOnline, addOfflineCount } = useOfflineSync();
  
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);

  const { data: room, isLoading: roomLoading } = useQuery({
    queryKey: [`/api/rooms/${roomId}`],
    enabled: !!roomId,
  }) as { data: any, isLoading: boolean };

  const { data: userCount = 0 } = useQuery({
    queryKey: [`/api/rooms/${roomId}/user-count`],
    enabled: !!roomId,
    refetchInterval: 10000,
  }) as { data: number };

  const countMutation = useMutation({
    mutationFn: async () => {
      if (!isOnline) {
        if ((user as any)?.id) {
          addOfflineCount(roomId, (user as any).id);
        }
        return { success: true, offline: true };
      }

      const response = await fetch(`/api/rooms/${roomId}/count`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      if (!response.ok) throw new Error(`${response.status}: ${response.statusText}`);
      return await response.json();
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: [`/api/rooms/${roomId}/user-count`] });
      const previousCount = queryClient.getQueryData([`/api/rooms/${roomId}/user-count`]) as number;
      queryClient.setQueryData([`/api/rooms/${roomId}/user-count`], (old: number = 0) => old + 1);
      return { previousCount };
    },
    onError: (error, variables, context) => {
      if (context?.previousCount !== undefined) {
        const currentCount = queryClient.getQueryData([`/api/rooms/${roomId}/user-count`]) as number || 0;
        if (context.previousCount <= currentCount) {
          queryClient.setQueryData([`/api/rooms/${roomId}/user-count`], context.previousCount);
        } else {
          queryClient.setQueryData([`/api/rooms/${roomId}/user-count`], Math.max(0, currentCount - 1));
        }
      }
      
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
        title: "Count failed",
        description: "Please try again",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/rooms/${roomId}/user-count`] });
    },
  });

  const leaveRoomMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/rooms/${roomId}/leave`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      if (!response.ok) throw new Error(`${response.status}: ${response.statusText}`);
      return await response.json();
    },
    onSuccess: () => {
      window.location.href = '/dashboard';
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['/api/rooms/my'] });
        toast({ title: "Left Room", description: "You have successfully left the room" });
      }, 100);
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-islamic-secondary/20 to-islamic-primary/10">
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-islamic-secondary/20 to-islamic-primary/10">
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-islamic-secondary/20 to-islamic-primary/10 flex flex-col overflow-hidden">
      {/* Fixed Header */}
      <header className="bg-islamic-gradient text-white px-4 py-3 flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          
          <div className="text-center flex-1">
            <h1 className="text-lg font-bold">{room?.name}</h1>
            <p className="text-sm text-islamic-secondary/80">
              Room #{roomId.toString().padStart(6, '0')}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={shareRoom}
              className="text-white hover:bg-white/20"
            >
              <Share2 className="w-4 h-4" />
            </Button>
            
            {room?.ownerId !== (user as any)?.id && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => leaveRoomMutation.mutate()}
                className="text-white hover:bg-red-500/20"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            )}
            
            <Link href={`/room/${roomId}/settings`}>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-white hover:bg-white/20"
              >
                <Settings className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Room Stats Bar */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/10 backdrop-blur rounded-lg p-2 text-center">
            <Users className="w-4 h-4 mx-auto mb-1" />
            <div className="text-sm font-bold">{room.memberCount || 0}</div>
            <div className="text-xs text-islamic-secondary/80">Members</div>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-lg p-2 text-center">
            <Target className="w-4 h-4 mx-auto mb-1" />
            <div className="text-sm font-bold">
              {room.unlimited ? '∞' : room.targetCount?.toLocaleString() || '1000'}
            </div>
            <div className="text-xs text-islamic-secondary/80">Target</div>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-lg p-2 text-center">
            <Crown className="w-4 h-4 mx-auto mb-1" />
            <div className="text-sm font-bold">#{1}</div>
            <div className="text-xs text-islamic-secondary/80">Your Rank</div>
          </div>
        </div>
      </header>

      {/* Main Content - No Scroll, Single Screen */}
      <div className="flex-1 flex flex-col px-4 py-4 overflow-hidden">
        {/* Zikir Display */}
        <Card className="mb-4 flex-shrink-0">
          <CardContent className="p-4 text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-2">{room.zikirName}</h2>
            {room.zikirArabic && (
              <div className="text-2xl mb-2 leading-relaxed font-arabic text-islamic-primary">
                {room.zikirArabic}
              </div>
            )}
            {room.transliteration && (
              <div className="text-gray-600 italic mb-2">{room.transliteration}</div>
            )}
            {room.translation && (
              <div className="text-sm text-gray-500">{room.translation}</div>
            )}
          </CardContent>
        </Card>

        {/* Voice and Sound Controls */}
        <div className="flex justify-center gap-4 mb-6 flex-shrink-0">
          <Button
            variant={isVoiceEnabled ? "default" : "outline"}
            size="sm"
            onClick={() => setIsVoiceEnabled(!isVoiceEnabled)}
            className={isVoiceEnabled ? "bg-green-500 hover:bg-green-600" : ""}
          >
            {isVoiceEnabled ? <Mic className="w-4 h-4 mr-2" /> : <MicOff className="w-4 h-4 mr-2" />}
            Voice {isVoiceEnabled ? "ON" : "OFF"}
          </Button>

          <Button
            variant={isSoundEnabled ? "default" : "outline"}
            size="sm"
            onClick={() => setIsSoundEnabled(!isSoundEnabled)}
            className={isSoundEnabled ? "bg-blue-500 hover:bg-blue-600" : ""}
          >
            {isSoundEnabled ? <Volume2 className="w-4 h-4 mr-2" /> : <VolumeX className="w-4 h-4 mr-2" />}
            Sound {isSoundEnabled ? "ON" : "OFF"}
          </Button>
        </div>

        {/* Count Display - Large and Prominent */}
        <div className="flex-1 flex items-center justify-center">
          <motion.div
            animate={countMutation.isPending ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 0.2 }}
            className="text-center"
          >
            <div className="text-6xl font-bold text-islamic-primary mb-4">
              {userCount.toLocaleString()}
            </div>
            <div className="text-lg text-gray-600 mb-8">Total Count</div>
            
            {/* Progress Bar if target exists */}
            {!room.unlimited && room.targetCount && (
              <div className="w-80 mx-auto mb-8">
                <div className="bg-gray-200 rounded-full h-3 mb-2">
                  <motion.div
                    className="bg-islamic-primary h-3 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, (userCount / room.targetCount) * 100)}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <div className="text-sm text-gray-500">
                  {Math.round((userCount / room.targetCount) * 100)}% of target
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Digital Tasbih - Bottom Section */}
        <div className="flex-shrink-0">
          <DigitalTasbih 
            onCount={handleCount}
            isPending={countMutation.isPending}
            disabled={!user}
            soundEnabled={isSoundEnabled}
          />
          
          {isVoiceEnabled && (
            <div className="mt-4 flex justify-center">
              <VoiceRecognitionButton 
                onCount={handleCount}
                zikirName={room.zikirName}
                disabled={countMutation.isPending}
              />
            </div>
          )}
        </div>
      </div>

      {/* Offline Indicator */}
      <AnimatePresence>
        {!isOnline && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-orange-500 text-white px-4 py-2 rounded-full shadow-lg"
          >
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              <span className="text-sm font-medium">Offline Mode</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}