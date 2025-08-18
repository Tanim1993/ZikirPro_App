import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreateCompetitionModal } from "@/components/create-competition-modal";
import { VerifiedBadge } from "@/components/verified-badge";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Plus, Trophy, Users, Calendar, Award, BarChart3, Eye, Crown } from "lucide-react";

interface Competition {
  id: string;
  name: string;
  description: string;
  prizeAmount: number;
  prizeCurrency: string;
  startDate: string;
  endDate: string;
  status: "upcoming" | "active" | "completed";
  participantCount: number;
  createdBy: string;
}

export default function OrganizationDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Fetch organization's competitions
  const { data: competitions = [], isLoading: loadingCompetitions } = useQuery({
    queryKey: ['/api/competitions/my'],
    enabled: !!(user as any)?.id,
  });

  // Fetch organization stats
  const { data: orgStats = {}, isLoading: loadingStats } = useQuery({
    queryKey: ['/api/organizations/stats'],
    enabled: !!(user as any)?.id,
  });

  if (!user || (user as any).userType !== 'organization') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">Access denied. Organization account required.</p>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'upcoming':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Upcoming</Badge>;
      case 'active':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Active</Badge>;
      case 'completed':
        return <Badge variant="secondary" className="bg-gray-100 text-gray-800">Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatPrize = (amount: number, currency: string) => {
    return `${amount.toLocaleString()} ${currency}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-islamic-primary/5 to-islamic-secondary/5 p-4">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              {(user as any).organizationName || "Organization"}
              <VerifiedBadge isVerified={(user as any).isVerified || false} />
            </h1>
            <p className="text-gray-600 mt-1">Organization Competition Dashboard</p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => window.location.href = '/organization-addons'}
              variant="outline"
              className="border-purple-600 text-purple-600 hover:bg-purple-50 flex items-center gap-2"
              data-testid="button-organization-addons"
            >
              <Crown className="w-4 h-4" />
              Premium Add-ons
            </Button>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-islamic-primary hover:bg-islamic-primary-dark text-white flex items-center gap-2"
              data-testid="button-create-competition"
            >
              <Plus className="w-4 h-4" />
              Create Competition
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white border-islamic-primary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Competitions</CardTitle>
              <Trophy className="h-4 w-4 text-islamic-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-islamic-primary">
                {loadingStats ? "..." : (orgStats as any)?.totalCompetitions || 0}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-islamic-secondary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Competitions</CardTitle>
              <Calendar className="h-4 w-4 text-islamic-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-islamic-secondary">
                {loadingStats ? "..." : (orgStats as any)?.activeCompetitions || 0}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Participants</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {loadingStats ? "..." : (orgStats as any)?.totalParticipants || 0}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-purple-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Prizes</CardTitle>
              <Award className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {loadingStats ? "..." : `$${(orgStats as any)?.totalPrizeValue || 0}`}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Competitions List */}
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">My Competitions</h2>
        </div>

        {loadingCompetitions ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="flex gap-4">
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (competitions as Competition[]).length === 0 ? (
          <Card className="bg-white border-dashed border-gray-300">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Trophy className="w-12 h-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No competitions yet</h3>
              <p className="text-gray-500 text-center mb-4">
                Create your first competition to start engaging your community with Islamic practices.
              </p>
              <Button
                onClick={() => setShowCreateModal(true)}
                className="bg-islamic-primary hover:bg-islamic-primary-dark text-white"
                data-testid="button-create-first-competition"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Competition
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {(competitions as Competition[]).map((competition: Competition) => (
              <Card key={competition.id} className="bg-white border-l-4 border-l-islamic-primary hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex-1">
                      <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                        {competition.name}
                        {getStatusBadge(competition.status)}
                      </CardTitle>
                      <p className="text-gray-600 mt-1">{competition.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-islamic-primary text-islamic-primary hover:bg-islamic-primary/10"
                        data-testid={`button-view-competition-${competition.id}`}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View Details
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-blue-600 text-blue-600 hover:bg-blue-50"
                        data-testid={`button-analytics-${competition.id}`}
                      >
                        <BarChart3 className="w-4 h-4 mr-1" />
                        Analytics
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Prize Pool</p>
                      <p className="font-semibold text-islamic-secondary">
                        {formatPrize(competition.prizeAmount, competition.prizeCurrency)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Participants</p>
                      <p className="font-semibold text-blue-600 flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {competition.participantCount}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Start Date</p>
                      <p className="font-semibold text-gray-900">
                        {formatDate(competition.startDate)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">End Date</p>
                      <p className="font-semibold text-gray-900">
                        {formatDate(competition.endDate)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create Competition Modal */}
      <CreateCompetitionModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </div>
  );
}