import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { OrganizationRoomCard } from "@/components/organization-room-card";
import { OrganizationSignupModal } from "@/components/organization-signup-modal";
import { Search, Building2, Trophy, Plus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function OrganizationSearch() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [showSignupModal, setShowSignupModal] = useState(false);

  // Search for organization rooms
  const { data: organizationRooms = [], isLoading } = useQuery({
    queryKey: ['/api/rooms/search', { query: searchQuery, type: 'organization' }],
    enabled: searchQuery.length > 2,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is handled by the query above
  };

  const isOrganization = (user as any)?.userType === 'organization';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-4 py-6">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Building2 className="w-6 h-6 text-white" />
              <h1 className="text-2xl font-bold text-white">Organizations</h1>
            </div>
            {!user && (
              <Button 
                onClick={() => setShowSignupModal(true)}
                className="bg-white text-blue-600 hover:bg-gray-100"
                size="sm"
                data-testid="button-create-org-account"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Org Account
              </Button>
            )}
          </div>
          
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center">
            <div className="text-white text-sm">
              🏆 Discover verified organizations hosting zikir competitions with real prizes
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto p-4 space-y-6">
        {/* Search */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Search className="w-5 h-5" />
              Search Organizations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="space-y-3">
              <Input
                type="text"
                placeholder="Search for organization name or competition..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
                data-testid="input-search-organizations"
              />
              <div className="text-xs text-gray-600">
                Examples: "Islamic Education Foundation", "Zikir Challenge 2025"
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Search Results */}
        {searchQuery.length > 2 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Search Results</h2>
              <Badge variant="outline">
                {organizationRooms.length} found
              </Badge>
            </div>

            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : organizationRooms.length > 0 ? (
              <div className="space-y-4">
                {organizationRooms.map((room: any) => (
                  <OrganizationRoomCard
                    key={room.id}
                    room={room}
                    memberCount={room.memberCount || 0}
                    onJoin={() => {
                      // Handle join logic
                      console.log("Joining room:", room.id);
                    }}
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <Building2 className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                  <h3 className="font-medium text-gray-900 mb-2">No organizations found</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Try a different search term or browse all competitions
                  </p>
                  <Button variant="outline" size="sm">
                    Browse All Competitions
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Featured Organizations */}
        {searchQuery.length <= 2 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Featured Organizations</h2>
            
            <Card className="border-yellow-200 bg-yellow-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Trophy className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">Islamic Education Foundation</h3>
                      <Badge className="bg-blue-100 text-blue-800 border-blue-300">
                        ✓ Verified
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">Running monthly competitions with prizes</p>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-3 mb-3">
                  <div className="text-sm font-medium text-yellow-800 mb-1">🏆 Current Prize</div>
                  <div className="text-sm text-yellow-700">$100 gift card for the winner</div>
                </div>
                <Button size="sm" className="w-full bg-yellow-600 hover:bg-yellow-700">
                  View Competitions
                </Button>
              </CardContent>
            </Card>

            <div className="text-center py-8">
              <Building2 className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">Are you an organization?</h3>
              <p className="text-sm text-gray-500 mb-4">
                Create competitions with prizes and engage the community
              </p>
              <Button 
                onClick={() => setShowSignupModal(true)}
                className="bg-blue-600 hover:bg-blue-700"
                data-testid="button-create-org-account-main"
              >
                <Building2 className="w-4 h-4 mr-2" />
                Create Organization Account
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Organization Signup Modal */}
      <OrganizationSignupModal
        isOpen={showSignupModal}
        onClose={() => setShowSignupModal(false)}
      />
    </div>
  );
}