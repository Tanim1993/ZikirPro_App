import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Users, Calendar, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

interface Room {
  id: number;
  name: string;
  description: string;
  targetCount: number;
  duration: number;
  isPrivate: boolean;
  country: string;
  memberCount: number;
  createdAt: string;
  zikirName: string;
  creatorName: string;
  shareCode: string;
}

export default function Rooms() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("all");

  const { data: rooms = [], isLoading } = useQuery({
    queryKey: ["/api/rooms/public"],
  }) as { data: Room[], isLoading: boolean };

  const countries = ["all", "Malaysia", "Indonesia", "Turkey", "Egypt", "Pakistan", "Bangladesh", "Saudi Arabia"];

  const filteredRooms = rooms.filter((room: Room) => {
    const matchesSearch = room.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         room.zikirName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         room.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCountry = selectedCountry === "all" || room.country === selectedCountry;
    return matchesSearch && matchesCountry;
  });

  const formatTimeRemaining = (createdAt: string, duration: number) => {
    const created = new Date(createdAt);
    const endDate = new Date(created.getTime() + duration * 24 * 60 * 60 * 1000);
    const now = new Date();
    const remaining = endDate.getTime() - now.getTime();
    
    if (remaining <= 0) return "Ended";
    
    const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
    const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h left`;
    return `${hours}h left`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-islamic-gradient p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 text-white">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white"></div>
            </div>
            <p className="text-white/80">Loading rooms...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-islamic-gradient p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2 drop-shadow-lg">Browse Rooms</h1>
          <p className="text-white/80">Join active Zikir competitions from around the world</p>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search rooms, zikir, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 islamic-glass text-white placeholder:text-white/60"
              data-testid="input-search-rooms"
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            {countries.map((country) => (
              <Button
                key={country}
                variant={selectedCountry === country ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCountry(country)}
                className={cn(
                  "text-xs",
                  selectedCountry === country 
                    ? "bg-islamic-gradient text-white shadow-xl" 
                    : "islamic-glass text-white hover:bg-white/20"
                )}
                data-testid={`button-filter-${country.toLowerCase()}`}
              >
                {country === "all" ? "All Countries" : country}
              </Button>
            ))}
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4">
          <p className="text-sm text-white/80">
            Found {filteredRooms.length} room{filteredRooms.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Rooms Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRooms.map((room: Room) => (
            <Card key={room.id} className="overflow-hidden islamic-glass hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold text-gray-900 mb-1" data-testid={`text-room-name-${room.id}`}>
                      {room.name || `${room.zikirName} Challenge`}
                    </CardTitle>
                    <p className="text-sm text-islamic-primary font-medium" data-testid={`text-zikir-${room.id}`}>
                      {room.zikirName}
                    </p>
                  </div>
                  <Badge 
                    variant={room.isPrivate ? "secondary" : "default"}
                    className={cn(
                      "text-xs",
                      !room.isPrivate && "bg-islamic-secondary/20 text-islamic-primary"
                    )}
                  >
                    {room.isPrivate ? "Private" : "Public"}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                {room.description && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2" data-testid={`text-description-${room.id}`}>
                    {room.description}
                  </p>
                )}
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <Users className="w-4 h-4 mr-2" />
                    <span data-testid={`text-members-${room.id}`}>{room.memberCount} members</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-500">
                    <Globe className="w-4 h-4 mr-2" />
                    <span data-testid={`text-country-${room.id}`}>{room.country}</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span data-testid={`text-duration-${room.id}`}>
                      {formatTimeRemaining(room.createdAt, room.duration)}
                    </span>
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Target</span>
                    <span data-testid={`text-target-${room.id}`}>{room.targetCount?.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-islamic-primary to-islamic-secondary h-2 rounded-full transition-all duration-300"
                      style={{ width: "30%" }}
                    ></div>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="text-xs text-gray-500">
                    by {room.creatorName}
                  </div>
                  
                  <Link href={`/room/${room.id}`}>
                    <Button 
                      size="sm" 
                      className="bg-islamic-primary hover:bg-islamic-primary-dark text-white"
                      data-testid={`button-join-room-${room.id}`}
                    >
                      Join Room
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredRooms.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 text-gray-400">
              <Search className="w-full h-full" />
            </div>
            <p className="text-gray-500 mb-2">No rooms found</p>
            <p className="text-sm text-gray-400">
              {searchQuery || selectedCountry !== "all" 
                ? "Try adjusting your search or filters"
                : "Be the first to create a room!"
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}