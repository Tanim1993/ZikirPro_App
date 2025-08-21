import { useState, useEffect } from "react";
import { Link, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Users, Trophy, Info, Share2, Crown, Calendar, Clock, Target, Award } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";

interface RoomMember {
  userId: string;
  displayName: string;
  totalCount: number;
  isOwner: boolean;
}

interface Room {
  id: number;
  name: string;
  description: string;
  zikir: any;
  duration: number;
  isPrivate: boolean;
  createdBy: string;
  createdAt: string;
  memberCount: number;
}

export default function RoomSettings() {
  const { roomId } = useParams<{ roomId: string }>();
  const [selectedTasbihType, setSelectedTasbihType] = useState<string>("digital");

  const { data: room } = useQuery<Room>({
    queryKey: [`/api/rooms/${roomId}`],
    enabled: !!roomId,
  });

  const { data: leaderboard = [] } = useQuery<RoomMember[]>({
    queryKey: [`/api/rooms/${roomId}/leaderboard`],
    enabled: !!roomId,
    refetchInterval: 5000,
  });

  const tasbihOptions = [
    { 
      id: "digital", 
      name: "Digital Tasbih", 
      icon: "📱", 
      description: "Count using digital button on your phone screen" 
    },
    { 
      id: "physical", 
      name: "Physical Tasbih", 
      icon: "📿", 
      description: "Count using traditional physical tasbih beads" 
    },
    { 
      id: "hand", 
      name: "Hand Counting", 
      icon: "✋", 
      description: "Count using your fingers in traditional way" 
    },
  ];

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Join ${room?.name} - Zikir Room`,
        text: `Join me in this spiritual journey of remembrance`,
        url: window.location.origin + `/room/${roomId}`,
      });
    } else {
      navigator.clipboard.writeText(window.location.origin + `/room/${roomId}`);
    }
  };

  if (!room) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-islamic-secondary/20 to-islamic-primary/10">
      {/* Header */}
      <header className="bg-islamic-gradient text-white px-4 py-4 sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <Link href={`/room/${roomId}`}>
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Room
            </Button>
          </Link>
          
          <div className="text-center flex-1">
            <h1 className="text-xl font-bold">Room Settings</h1>
            <p className="text-sm text-islamic-secondary/80">{room.name}</p>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleShare}
            className="text-white hover:bg-white/20"
          >
            <Share2 className="w-4 h-4" />
          </Button>
        </div>
      </header>

      <div className="px-4 py-6 space-y-6">
        {/* Room Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Info className="w-5 h-5 mr-2 text-islamic-primary" />
              Room Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg">{room.name}</h3>
              <p className="text-gray-600 text-sm">{room.description}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-islamic-primary" />
                <div>
                  <p className="text-sm text-gray-500">Duration</p>
                  <p className="font-semibold">{room.duration} days</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-islamic-primary" />
                <div>
                  <p className="text-sm text-gray-500">Members</p>
                  <p className="font-semibold">{room.memberCount}</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Badge variant={room.isPrivate ? "secondary" : "default"}>
                {room.isPrivate ? "Private" : "Public"}
              </Badge>
              <span className="text-xs text-gray-500">
                Created {new Date(room.createdAt).toLocaleDateString()}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Tasbih Type Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="w-5 h-5 mr-2 text-islamic-primary" />
              Select Tasbih Type
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {tasbihOptions.map((tasbih) => (
                <motion.div
                  key={tasbih.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card 
                    className={`cursor-pointer transition-all duration-200 ${
                      selectedTasbihType === tasbih.id 
                        ? "ring-2 ring-islamic-primary shadow-lg bg-islamic-primary/5" 
                        : "hover:shadow-md"
                    }`}
                    onClick={() => setSelectedTasbihType(tasbih.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="text-2xl">{tasbih.icon}</div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{tasbih.name}</h4>
                            <p className="text-sm text-gray-500">{tasbih.description}</p>
                          </div>
                        </div>
                        {selectedTasbihType === tasbih.id && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-6 h-6 bg-islamic-primary rounded-full flex items-center justify-center"
                          >
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: 0.1 }}
                              className="w-3 h-3 bg-white rounded-full"
                            />
                          </motion.div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Leaderboard */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Trophy className="w-5 h-5 mr-2 text-islamic-primary" />
              Room Leaderboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {leaderboard.slice(0, 10).map((member, index) => (
                <motion.div
                  key={member.userId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-50"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                      index === 0 ? "bg-yellow-500 text-white" :
                      index === 1 ? "bg-gray-400 text-white" :
                      index === 2 ? "bg-amber-600 text-white" :
                      "bg-gray-200 text-gray-700"
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 flex items-center">
                        {member.displayName}
                        {member.isOwner && (
                          <Crown className="w-4 h-4 ml-1 text-yellow-500" />
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-islamic-primary">{member.totalCount.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">total count</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Award className="w-5 h-5 mr-2 text-islamic-primary" />
              Room Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-4 bg-islamic-primary/5 rounded-lg">
                <p className="text-2xl font-bold text-islamic-primary">
                  {leaderboard.reduce((sum, member) => sum + member.totalCount, 0).toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">Total Zikir Count</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">{leaderboard.length}</p>
                <p className="text-sm text-gray-600">Active Members</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">
                  {leaderboard.length > 0 ? Math.round(leaderboard.reduce((sum, member) => sum + member.totalCount, 0) / leaderboard.length) : 0}
                </p>
                <p className="text-sm text-gray-600">Average per Member</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-2xl font-bold text-purple-600">{room ? Math.max(0, room.duration - Math.floor((Date.now() - new Date(room.createdAt).getTime()) / (1000 * 60 * 60 * 24))) : 0}</p>
                <p className="text-sm text-gray-600">Days Remaining</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Share Options */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Share2 className="w-5 h-5 mr-2 text-islamic-primary" />
              Share Room
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button onClick={handleShare} className="w-full bg-islamic-primary">
                <Share2 className="w-4 h-4 mr-2" />
                Share with Friends
              </Button>
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-2">Room ID: {roomId}</p>
                <p className="text-xs text-gray-400">Share this ID for others to join</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}