import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Trophy, Users, Clock, Star } from 'lucide-react';

interface SeasonalCompetition {
  id: number;
  name: string;
  description: string;
  season: string;
  seasonYear: number;
  targetCount?: number;
  unlimited: boolean;
  prizeDescription?: string;
  startDate: string;
  endDate: string;
  registrationStartDate: string;
  registrationEndDate: string;
  maxParticipants?: number;
  isActive: boolean;
  themeColor: string;
  backgroundImage?: string;
}

export default function SeasonalCompetitions() {
  const [selectedCompetition, setSelectedCompetition] = useState<SeasonalCompetition | null>(null);

  const { data: competitions, isLoading } = useQuery({
    queryKey: ['/api/seasonal-competitions'],
    queryFn: () => fetch('/api/seasonal-competitions').then(res => res.json())
  });

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const getSeasonIcon = (season: string) => {
    switch (season) {
      case 'ramadan': return '🌙';
      case 'hajj': return '🕋';
      case 'muharram': return '☪️';
      default: return '⭐';
    }
  };

  const getSeasonColor = (season: string) => {
    switch (season) {
      case 'ramadan': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'hajj': return 'bg-green-100 text-green-800 border-green-200';
      case 'muharram': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleJoinCompetition = async (competitionId: number) => {
    try {
      const response = await fetch(`/api/seasonal-competitions/${competitionId}/join`, {
        method: 'POST'
      });
      
      if (response.ok) {
        alert('Successfully joined the competition!');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to join competition');
      }
    } catch (error) {
      console.error('Error joining competition:', error);
      alert('Failed to join competition');
    }
  };

  return (
    <div className="space-y-4">
      {/* Competitions Grid */}
      {competitions?.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
            {competitions.map((competition: SeasonalCompetition) => (
              <Card key={competition.id} className="group hover:shadow-lg transition-shadow duration-200">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">{getSeasonIcon(competition.season)}</span>
                      <Badge className={getSeasonColor(competition.season)}>
                        {competition.season} {competition.seasonYear}
                      </Badge>
                    </div>
                    {competition.isActive && (
                      <Badge className="bg-green-100 text-green-800 border-green-200">
                        Active
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {competition.name}
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <p className="text-gray-600 text-sm line-clamp-3">
                    {competition.description}
                  </p>
                  
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>{formatDate(competition.startDate)} - {formatDate(competition.endDate)}</span>
                    </div>
                    
                    {competition.maxParticipants && (
                      <div className="flex items-center text-sm text-gray-500">
                        <Users className="w-4 h-4 mr-2" />
                        <span>Max {competition.maxParticipants} participants</span>
                      </div>
                    )}
                    
                    <div className="flex items-center text-sm text-gray-500">
                      <Star className="w-4 h-4 mr-2" />
                      <span>
                        {competition.unlimited ? 'Unlimited zikir' : `Target: ${competition.targetCount} zikir`}
                      </span>
                    </div>
                  </div>

                  {competition.prizeDescription && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <div className="flex items-center text-sm font-medium text-yellow-800 mb-1">
                        <Trophy className="w-4 h-4 mr-1" />
                        Prize
                      </div>
                      <p className="text-sm text-yellow-700">{competition.prizeDescription}</p>
                    </div>
                  )}

                  <div className="flex space-x-2 pt-2">
                    <Button 
                      onClick={() => handleJoinCompetition(competition.id)}
                      className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                      data-testid={`button-join-competition-${competition.id}`}
                    >
                      Join Competition
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setSelectedCompetition(competition)}
                      data-testid={`button-view-details-${competition.id}`}
                    >
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
      ) : (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full mb-4">
            <Clock className="w-6 h-6 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Active Competitions</h3>
          <p className="text-gray-600 text-sm">
            Stay tuned for upcoming seasonal competitions during special Islamic occasions.
          </p>
        </div>
      )}

        {/* Competition Detail Modal */}
        {selectedCompetition && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-3xl">{getSeasonIcon(selectedCompetition.season)}</span>
                    <div>
                      <CardTitle className="text-2xl">{selectedCompetition.name}</CardTitle>
                      <Badge className={getSeasonColor(selectedCompetition.season)}>
                        {selectedCompetition.season} {selectedCompetition.seasonYear}
                      </Badge>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setSelectedCompetition(null)}
                    data-testid="button-close-modal"
                  >
                    ×
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <p className="text-gray-700">{selectedCompetition.description}</p>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-gray-900">Competition Period</h4>
                    <p className="text-sm text-gray-600">
                      {formatDate(selectedCompetition.startDate)} - {formatDate(selectedCompetition.endDate)}
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold text-gray-900">Registration</h4>
                    <p className="text-sm text-gray-600">
                      Until {formatDate(selectedCompetition.registrationEndDate)}
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold text-gray-900">Target</h4>
                    <p className="text-sm text-gray-600">
                      {selectedCompetition.unlimited ? 'Unlimited zikir counting' : `${selectedCompetition.targetCount} zikir`}
                    </p>
                  </div>
                  
                  {selectedCompetition.maxParticipants && (
                    <div className="space-y-2">
                      <h4 className="font-semibold text-gray-900">Max Participants</h4>
                      <p className="text-sm text-gray-600">{selectedCompetition.maxParticipants}</p>
                    </div>
                  )}
                </div>

                {selectedCompetition.prizeDescription && (
                  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-semibold text-yellow-800 mb-2 flex items-center">
                      <Trophy className="w-5 h-5 mr-2" />
                      Competition Prize
                    </h4>
                    <p className="text-yellow-700">{selectedCompetition.prizeDescription}</p>
                  </div>
                )}

                <div className="flex space-x-3 pt-4">
                  <Button 
                    onClick={() => handleJoinCompetition(selectedCompetition.id)}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                    data-testid={`button-join-modal-${selectedCompetition.id}`}
                  >
                    Join This Competition
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setSelectedCompetition(null)}
                    data-testid="button-cancel-modal"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
    </div>
  );
}