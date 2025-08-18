import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, Users, Trophy, Palette, Shield, Smartphone, 
  Award, BookOpen, Settings, Crown, Star, TrendingUp, 
  MessageSquare, Globe, Calendar, PieChart, Target,
  CheckCircle, Clock, Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface FeatureHighlight {
  title: string;
  description: string;
  icon: React.ElementType;
  status: 'available' | 'premium' | 'coming-soon';
  category: string;
}

const organizationFeatures: FeatureHighlight[] = [
  {
    title: 'Basic Competition Management',
    description: 'Create and manage Islamic competitions for your community',
    icon: Trophy,
    status: 'available',
    category: 'Core Features'
  },
  {
    title: 'Organization Verification',
    description: 'Verified badge to establish trust and credibility',
    icon: CheckCircle,
    status: 'available',
    category: 'Core Features'
  },
  {
    title: 'Simple Analytics Dashboard',
    description: 'Basic insights into competition participation',
    icon: BarChart3,
    status: 'available',
    category: 'Core Features'
  },
  {
    title: 'Advanced Analytics Pro',
    description: 'Comprehensive insights with trend analysis and reporting',
    icon: TrendingUp,
    status: 'premium',
    category: 'Premium Analytics'
  },
  {
    title: 'Community Management Suite',
    description: 'Direct messaging, announcements, and participant management',
    icon: Users,
    status: 'premium',
    category: 'Community Tools'
  },
  {
    title: 'Competition Management Pro',
    description: 'Multi-tier competitions, recurring schedules, team competitions',
    icon: Trophy,
    status: 'premium',
    category: 'Advanced Competition'
  },
  {
    title: 'Custom Branding Suite',
    description: 'White-label pages, custom themes, and branded materials',
    icon: Palette,
    status: 'premium',
    category: 'Branding & Design'
  },
  {
    title: 'Mobile App Management',
    description: 'Push notifications, QR codes, and mobile-optimized tools',
    icon: Smartphone,
    status: 'premium',
    category: 'Mobile Features'
  },
  {
    title: 'Gamification Engine',
    description: 'Custom badges, achievements, and reward systems',
    icon: Award,
    status: 'premium',
    category: 'Engagement Tools'
  },
  {
    title: 'Enterprise Security',
    description: 'SSO integration, audit logs, and compliance tools',
    icon: Shield,
    status: 'premium',
    category: 'Security & Compliance'
  },
  {
    title: 'Educational Content Hub',
    description: 'Islamic learning materials and course management',
    icon: BookOpen,
    status: 'coming-soon',
    category: 'Learning & Education'
  },
  {
    title: 'AI-Powered Insights',
    description: 'Predictive analytics and intelligent recommendations',
    icon: Zap,
    status: 'coming-soon',
    category: 'AI & Intelligence'
  }
];

interface OrganizationFeaturesShowcaseProps {
  className?: string;
}

export function OrganizationFeaturesShowcase({ className }: OrganizationFeaturesShowcaseProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available':
        return <Badge className="bg-green-100 text-green-800">Available</Badge>;
      case 'premium':
        return <Badge className="bg-purple-100 text-purple-800">Premium</Badge>;
      case 'coming-soon':
        return <Badge className="bg-orange-100 text-orange-800">Coming Soon</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const groupedFeatures = organizationFeatures.reduce((acc, feature) => {
    if (!acc[feature.category]) {
      acc[feature.category] = [];
    }
    acc[feature.category].push(feature);
    return acc;
  }, {} as Record<string, FeatureHighlight[]>);

  return (
    <div className={cn("space-y-8", className)}>
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center">
          <Crown className="w-12 h-12 text-purple-600 mr-3" />
          <h2 className="text-3xl font-bold text-gray-900">Organization Features</h2>
        </div>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Comprehensive tools to manage and grow your Islamic community with advanced features and premium add-ons
        </p>
      </div>

      {/* Features by Category */}
      {Object.entries(groupedFeatures).map(([category, features]) => (
        <div key={category} className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-800 border-b border-gray-200 pb-2">
            {category}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <Card key={index} className={cn(
                  "relative transition-all duration-300 hover:shadow-md",
                  feature.status === 'premium' && "border-purple-200 bg-purple-50/30",
                  feature.status === 'coming-soon' && "border-orange-200 bg-orange-50/30"
                )}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <IconComponent className={cn(
                        "w-8 h-8",
                        feature.status === 'available' && "text-green-600",
                        feature.status === 'premium' && "text-purple-600", 
                        feature.status === 'coming-soon' && "text-orange-600"
                      )} />
                      {getStatusBadge(feature.status)}
                    </div>
                    <CardTitle className="text-lg font-semibold">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <CardDescription className="text-sm text-gray-600">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      ))}

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-8 text-white text-center">
        <Star className="w-12 h-12 mx-auto mb-4" />
        <h3 className="text-2xl font-bold mb-4">Ready to Upgrade Your Organization?</h3>
        <p className="text-purple-100 mb-6 max-w-2xl mx-auto">
          Access premium features, advanced analytics, and comprehensive community management tools 
          to take your Islamic organization to the next level.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            className="bg-white text-purple-600 hover:bg-gray-100"
            onClick={() => window.location.href = '/organization-addons'}
            data-testid="button-explore-addons"
          >
            <Crown className="w-4 h-4 mr-2" />
            Explore Premium Add-ons
          </Button>
          <Button 
            variant="outline" 
            className="border-white text-white hover:bg-white/10"
            data-testid="button-contact-sales"
          >
            Contact Sales Team
          </Button>
        </div>
      </div>
    </div>
  );
}