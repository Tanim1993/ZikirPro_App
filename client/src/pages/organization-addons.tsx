import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  BarChart3, Users, Trophy, Palette, Shield, Smartphone, 
  Zap, BookOpen, Settings, Crown, Check, Star,
  TrendingUp, MessageSquare, Award, Globe, Calendar,
  PieChart, Target, Megaphone, UserCheck, Gift
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AddonFeature {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  price: string;
  features: string[];
  category: 'analytics' | 'management' | 'engagement' | 'branding' | 'security' | 'mobile';
  tier: 'essential' | 'professional' | 'enterprise';
  popular?: boolean;
  comingSoon?: boolean;
}

const addons: AddonFeature[] = [
  {
    id: 'advanced-analytics',
    name: 'Advanced Analytics Pro',
    description: 'Comprehensive insights into your community engagement with detailed reporting and trend analysis',
    icon: BarChart3,
    price: '$19/month',
    category: 'analytics',
    tier: 'essential',
    popular: true,
    features: [
      'Real-time participation metrics',
      'Engagement trend analysis',
      'Export to PDF/Excel reports',
      'Community growth tracking',
      'Regional participation mapping',
      'Peak activity time analysis',
      'Comparative competition analysis'
    ]
  },
  {
    id: 'community-management',
    name: 'Community Management Suite',
    description: 'Direct engagement tools to build and nurture your Islamic community effectively',
    icon: Users,
    price: '$24/month',
    category: 'management',
    tier: 'essential',
    popular: true,
    features: [
      'Broadcast messaging to participants',
      'Community announcement system',
      'Participant feedback collection',
      'Community moderator roles',
      'Participant segmentation',
      'Welcome automation',
      'Event management tools'
    ]
  },
  {
    id: 'competition-pro',
    name: 'Competition Management Pro',
    description: 'Advanced competition tools with multi-tier support and automated management',
    icon: Trophy,
    price: '$29/month',
    category: 'management',
    tier: 'professional',
    features: [
      'Multi-tier competitions (beginner/advanced)',
      'Recurring competition scheduling',
      'Team-based competitions',
      'Custom scoring systems',
      'Automated prize distribution',
      'Competition templates library',
      'Timezone scheduling support'
    ]
  },
  {
    id: 'branding-suite',
    name: 'Branding & Customization',
    description: 'Professional branding tools to create a unique organizational identity',
    icon: Palette,
    price: '$34/month',
    category: 'branding',
    tier: 'professional',
    features: [
      'Custom theme colors and fonts',
      'White-label competition pages',
      'Custom domain support',
      'Organization-specific UI themes',
      'Branded certificates and awards',
      'Logo placement on all materials',
      'Custom email templates'
    ]
  },
  {
    id: 'gamification-engine',
    name: 'Gamification & Rewards Engine',
    description: 'Advanced gamification system with custom badges and achievement tracking',
    icon: Award,
    price: '$22/month',
    category: 'engagement',
    tier: 'professional',
    features: [
      'Custom badge creation and assignment',
      'Organization-specific achievements',
      'Leaderboard customization',
      'Reward tier management',
      'Special recognition ceremonies',
      'Milestone celebration automation',
      'Progress visualization tools'
    ]
  },
  {
    id: 'mobile-management',
    name: 'Mobile App Management',
    description: 'Mobile-focused tools for enhanced participant engagement on-the-go',
    icon: Smartphone,
    price: '$18/month',
    category: 'mobile',
    tier: 'professional',
    features: [
      'Push notification campaigns',
      'Mobile-optimized competition views',
      'QR code generation for events',
      'Mobile check-in systems',
      'Location-based competitions',
      'Mobile-first dashboard',
      'Offline participation tracking'
    ]
  },
  {
    id: 'security-compliance',
    name: 'Enterprise Security & Compliance',
    description: 'Enterprise-grade security features for data protection and compliance',
    icon: Shield,
    price: '$45/month',
    category: 'security',
    tier: 'enterprise',
    features: [
      'Single Sign-On (SSO) integration',
      'Role-based access control',
      'Audit logs and compliance reporting',
      'Data privacy management',
      'GDPR compliance tools',
      '2FA for admin accounts',
      'Advanced threat monitoring'
    ]
  },
  {
    id: 'business-intelligence',
    name: 'Business Intelligence Dashboard',
    description: 'Executive-level reporting and strategic insights for organizational growth',
    icon: TrendingUp,
    price: '$39/month',
    category: 'analytics',
    tier: 'enterprise',
    features: [
      'ROI tracking for competitions',
      'Community health scoring',
      'Engagement predictive analytics',
      'Benchmark comparisons',
      'Growth opportunity identification',
      'Executive summary reports',
      'Strategic planning insights'
    ]
  }
];

const subscriptionTiers = [
  {
    name: 'Basic Organization',
    price: 'Free',
    description: 'Essential features for small Islamic communities',
    features: [
      'Basic competition creation',
      'Simple analytics dashboard',
      'Organization verification badge',
      'Up to 100 participants',
      'Basic support'
    ],
    buttonText: 'Current Plan',
    popular: false
  },
  {
    name: 'Professional Organization',
    price: '$49/month',
    description: 'Advanced tools for growing Islamic organizations',
    features: [
      'All Basic features',
      'Advanced Analytics Pro included',
      'Community Management Suite included',
      'Up to 1,000 participants',
      'Priority support',
      'Custom branding options'
    ],
    buttonText: 'Upgrade to Pro',
    popular: true
  },
  {
    name: 'Enterprise Organization',
    price: '$149/month',
    description: 'Complete solution for large Islamic institutions',
    features: [
      'All Professional features',
      'All add-ons included',
      'Unlimited participants',
      'Dedicated account manager',
      'Custom integrations',
      'White-label solution'
    ],
    buttonText: 'Contact Sales',
    popular: false
  }
];

export default function OrganizationAddons() {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);

  // Check if user is organization
  if (!user || (user as any).userType !== 'organization') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="p-8 text-center">
          <CardContent>
            <Shield className="w-16 h-16 mx-auto text-red-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600">Organization account required to access add-ons.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const categories = [
    { id: 'all', name: 'All Add-ons', icon: Settings },
    { id: 'analytics', name: 'Analytics', icon: BarChart3 },
    { id: 'management', name: 'Management', icon: Users },
    { id: 'engagement', name: 'Engagement', icon: Award },
    { id: 'branding', name: 'Branding', icon: Palette },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'mobile', name: 'Mobile', icon: Smartphone }
  ];

  const filteredAddons = selectedCategory === 'all' 
    ? addons 
    : addons.filter(addon => addon.category === selectedCategory);

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'essential': return 'bg-green-100 text-green-800';
      case 'professional': return 'bg-blue-100 text-blue-800';
      case 'enterprise': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const AddonCard = ({ addon }: { addon: AddonFeature }) => {
    const IconComponent = addon.icon;
    
    return (
      <Card className={cn(
        "relative overflow-hidden transition-all duration-300 hover:shadow-lg border",
        addon.popular && "border-blue-500 ring-2 ring-blue-200"
      )}>
        {addon.popular && (
          <div className="absolute top-0 right-0 bg-blue-500 text-white px-3 py-1 text-xs font-semibold rounded-bl-lg">
            Popular
          </div>
        )}
        {addon.comingSoon && (
          <div className="absolute top-0 right-0 bg-orange-500 text-white px-3 py-1 text-xs font-semibold rounded-bl-lg">
            Coming Soon
          </div>
        )}
        
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <IconComponent className="w-8 h-8 text-blue-600" />
            <Badge className={getTierColor(addon.tier)} variant="secondary">
              {addon.tier}
            </Badge>
          </div>
          <CardTitle className="text-xl font-bold">{addon.name}</CardTitle>
          <CardDescription className="text-gray-600">{addon.description}</CardDescription>
          <div className="flex items-center justify-between pt-2">
            <span className="text-2xl font-bold text-blue-600">{addon.price}</span>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <ul className="space-y-2 mb-6">
            {addon.features.map((feature, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
          
          <Button 
            className={cn(
              "w-full",
              addon.comingSoon 
                ? "bg-gray-400 cursor-not-allowed" 
                : addon.popular 
                  ? "bg-blue-600 hover:bg-blue-700" 
                  : "bg-islamic-primary hover:bg-islamic-primary/90"
            )}
            disabled={addon.comingSoon}
            onClick={() => setShowUpgradeDialog(true)}
            data-testid={`button-addon-${addon.id}`}
          >
            {addon.comingSoon ? 'Coming Soon' : 'Add to Plan'}
          </Button>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center">
            <Crown className="w-16 h-16 mx-auto mb-4" />
            <h1 className="text-4xl font-bold mb-4">Organization Add-ons</h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Enhance your Islamic community management with professional tools and advanced features
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <Tabs defaultValue="addons" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="addons" className="text-sm font-medium">
              Individual Add-ons
            </TabsTrigger>
            <TabsTrigger value="plans" className="text-sm font-medium">
              Subscription Plans
            </TabsTrigger>
          </TabsList>

          <TabsContent value="addons" className="space-y-6">
            {/* Category Filter */}
            <div className="flex flex-wrap gap-2 justify-center">
              {categories.map((category) => {
                const IconComponent = category.icon;
                return (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category.id)}
                    className="flex items-center gap-2"
                    data-testid={`filter-${category.id}`}
                  >
                    <IconComponent className="w-4 h-4" />
                    {category.name}
                  </Button>
                );
              })}
            </div>

            {/* Add-ons Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAddons.map((addon) => (
                <AddonCard key={addon.id} addon={addon} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="plans" className="space-y-6">
            {/* Subscription Plans */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {subscriptionTiers.map((tier, index) => (
                <Card key={index} className={cn(
                  "relative overflow-hidden transition-all duration-300 hover:shadow-lg",
                  tier.popular && "border-blue-500 ring-2 ring-blue-200 scale-105"
                )}>
                  {tier.popular && (
                    <div className="absolute top-0 right-0 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-1 text-sm font-semibold rounded-bl-lg">
                      Most Popular
                    </div>
                  )}
                  
                  <CardHeader className="text-center pb-4">
                    <CardTitle className="text-2xl font-bold">{tier.name}</CardTitle>
                    <div className="py-4">
                      <span className="text-4xl font-bold text-blue-600">{tier.price}</span>
                      {tier.price !== 'Free' && <span className="text-gray-500">/month</span>}
                    </div>
                    <CardDescription>{tier.description}</CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <ul className="space-y-3 mb-8">
                      {tier.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start gap-3">
                          <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <Button 
                      className={cn(
                        "w-full",
                        tier.popular 
                          ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700" 
                          : "bg-islamic-primary hover:bg-islamic-primary/90"
                      )}
                      onClick={() => setShowUpgradeDialog(true)}
                      data-testid={`button-plan-${tier.name.toLowerCase().replace(' ', '-')}`}
                    >
                      {tier.buttonText}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Upgrade Dialog */}
        <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-center">Coming Soon!</DialogTitle>
              <DialogDescription className="text-center">
                Organization add-ons and premium plans are currently in development. 
                We'll notify you when they become available.
              </DialogDescription>
            </DialogHeader>
            <div className="text-center space-y-4 pt-4">
              <Star className="w-12 h-12 mx-auto text-yellow-500" />
              <p className="text-sm text-gray-600">
                Be among the first to access premium features when they launch.
              </p>
              <Button onClick={() => setShowUpgradeDialog(false)} className="w-full">
                Got it!
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}