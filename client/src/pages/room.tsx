import { useState, useCallback, useEffect } from "react";
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
  const [tasbihType, setTasbihType] = useState<string>("digital");

  // Load tasbih type from localStorage
  useEffect(() => {
    if (roomId) {
      const savedType = localStorage.getItem(`tasbih-type-${roomId}`);
      if (savedType) {
        setTasbihType(savedType);
      }
    }
  }, [roomId]);

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
        queryClient.setQueryData([`/api/rooms/${roomId}/user-count`], context.previousCount);
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
      // Reduced refetch frequency to prevent excessive API calls
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: [`/api/rooms/${roomId}/user-count`] });
      }, 500);
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
    // Prevent rapid clicks/taps
    if (countMutation.isPending) return;
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
    <div className="h-screen bg-gradient-to-br from-islamic-secondary/20 to-islamic-primary/10 flex flex-col overflow-hidden">
      {/* Compact Fixed Header */}
      <header className="bg-islamic-gradient text-white px-3 py-2 flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 h-8 px-2">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
          </Link>
          
          <div className="text-center flex-1">
            <h1 className="text-base font-bold">{room?.name}</h1>
            <p className="text-xs text-islamic-secondary/80">
              Room #{roomId.toString().padStart(6, '0')}
            </p>
          </div>
          
          <div className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={shareRoom}
              className="text-white hover:bg-white/20 h-8 w-8 p-0"
            >
              <Share2 className="w-4 h-4" />
            </Button>
            
            {room?.ownerId !== (user as any)?.id && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => leaveRoomMutation.mutate()}
                className="text-white hover:bg-red-500/20 h-8 w-8 p-0"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            )}
            
            <Link href={`/room/${roomId}/settings`}>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-white hover:bg-white/20 h-8 w-8 p-0"
              >
                <Settings className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Compact Stats Bar */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-white/10 backdrop-blur rounded-lg p-1.5 text-center">
            <Users className="w-3 h-3 mx-auto mb-0.5" />
            <div className="text-xs font-bold">{room?.memberCount || 0}</div>
            <div className="text-[10px] text-islamic-secondary/80">Members</div>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-lg p-1.5 text-center">
            <Target className="w-3 h-3 mx-auto mb-0.5" />
            <div className="text-xs font-bold">
              {room?.unlimited ? '∞' : room?.targetCount?.toLocaleString() || '1K'}
            </div>
            <div className="text-[10px] text-islamic-secondary/80">Target</div>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-lg p-1.5 text-center">
            <Crown className="w-3 h-3 mx-auto mb-0.5" />
            <div className="text-xs font-bold">#{1}</div>
            <div className="text-[10px] text-islamic-secondary/80">Rank</div>
          </div>
        </div>
      </header>

      {/* Main Content - Compact Mobile Layout */}
      <div className="flex-1 flex flex-col px-3 py-2 overflow-hidden">
        {/* Compact Zikir Display */}
        <div className="bg-white/90 backdrop-blur rounded-lg p-3 mb-3 text-center flex-shrink-0">
          <h2 className="text-lg font-bold text-gray-900 mb-1">{room?.zikirName || room?.name}</h2>
          {room?.zikirArabic && (
            <div className="text-xl mb-1 leading-relaxed font-arabic text-islamic-primary">
              {room.zikirArabic}
            </div>
          )}
          {room?.transliteration && (
            <div className="text-gray-600 italic text-sm">{room.transliteration}</div>
          )}
        </div>

        {/* Compact Voice and Sound Controls */}
        <div className="flex justify-center gap-3 mb-3 flex-shrink-0">
          <Button
            variant={isVoiceEnabled ? "default" : "outline"}
            size="sm"
            onClick={() => setIsVoiceEnabled(!isVoiceEnabled)}
            className={`h-8 px-3 text-xs ${isVoiceEnabled ? "bg-green-500 hover:bg-green-600" : ""}`}
          >
            {isVoiceEnabled ? <Mic className="w-3 h-3 mr-1" /> : <MicOff className="w-3 h-3 mr-1" />}
            Voice {isVoiceEnabled ? "ON" : "OFF"}
          </Button>

          <Button
            variant={isSoundEnabled ? "default" : "outline"}
            size="sm"
            onClick={() => setIsSoundEnabled(!isSoundEnabled)}
            className={`h-8 px-3 text-xs ${isSoundEnabled ? "bg-blue-500 hover:bg-blue-600" : ""}`}
          >
            {isSoundEnabled ? <Volume2 className="w-3 h-3 mr-1" /> : <VolumeX className="w-3 h-3 mr-1" />}
            Sound {isSoundEnabled ? "ON" : "OFF"}
          </Button>
        </div>

        {/* Compact Count Display */}
        <div className="flex-1 flex items-center justify-center min-h-0">
          <motion.div
            animate={countMutation.isPending ? { scale: [1, 1.05, 1] } : {}}
            transition={{ duration: 0.2 }}
            className="text-center"
          >
            <div className="text-5xl font-bold text-islamic-primary mb-2">
              {(userCount || 0).toLocaleString()}
            </div>
            <div className="text-sm text-gray-600 mb-3">Total Count</div>
            
            {/* Compact Progress Bar */}
            {!room?.unlimited && room?.targetCount && (
              <div className="w-60 mx-auto mb-3">
                <div className="bg-gray-200 rounded-full h-2 mb-1">
                  <motion.div
                    className="bg-islamic-primary h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, ((userCount || 0) / room.targetCount) * 100)}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <div className="text-xs text-gray-500">
                  {Math.round(((userCount || 0) / room.targetCount) * 100)}% of target
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Dynamic Tasbih Interface */}
        <div className="flex-shrink-0 pb-2">
          {tasbihType === "digital" && (
            <div className="flex justify-center">
              <Button
                onClick={handleCount}
                disabled={countMutation.isPending || !user}
                className="w-32 h-32 rounded-full bg-islamic-primary hover:bg-islamic-primary-dark text-white font-bold text-lg shadow-lg active:scale-95 transition-all duration-150 select-none"
              >
                {countMutation.isPending ? "..." : "COUNT"}
              </Button>
            </div>
          )}

          {tasbihType === "physical" && (
            <div className="text-center">
              <div className="text-6xl mb-3">📿</div>
              <p className="text-sm text-gray-600 mb-3">Use your physical tasbih</p>
              <Button
                onClick={handleCount}
                disabled={countMutation.isPending || !user}
                variant="outline"
                className="w-24 h-12 text-sm select-none"
              >
                {countMutation.isPending ? "..." : "Manual +1"}
              </Button>
            </div>
          )}

          {tasbihType === "hand" && (
            <div className="text-center">
              <div className="text-6xl mb-3">✋</div>
              <p className="text-sm text-gray-600 mb-3">Count with your fingers</p>
              <Button
                onClick={handleCount}
                disabled={countMutation.isPending || !user}
                variant="outline"
                className="w-24 h-12 text-sm select-none"
              >
                {countMutation.isPending ? "..." : "Count +1"}
              </Button>
            </div>
          )}
          
          {isVoiceEnabled && (
            <div className="mt-2 flex justify-center">
              <VoiceRecognitionButton 
                targetPhrase={room?.zikirName || "Subhanallah"}
                onPhraseDetected={handleCount}
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