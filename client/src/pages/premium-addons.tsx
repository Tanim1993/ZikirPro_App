import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Sparkles, BarChart3, Palette, Trophy, Smartphone, 
  BookOpen, Users, Bell, Cloud, Star, Crown, Check, 
  Zap, Heart, Target, Award, Gift, TrendingUp,
  Calendar, MessageSquare, Shield, Headphones
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PremiumFeature {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  price: string;
  originalPrice?: string;
  features: string[];
  category: 'spiritual' | 'customization' | 'analytics' | 'competition' | 'mobile' | 'tools' | 'learning' | 'social' | 'notifications' | 'backup';
  popular?: boolean;
  newFeature?: boolean;
  discount?: string;
}

const premiumAddons: PremiumFeature[] = [
  {
    id: 'spiritual-journey',
    name: 'Premium Spiritual Journey',
    description: 'Unlock personalized spiritual growth with AI-powered recommendations and exclusive dhikr collections',
    icon: Sparkles,
    price: '$4.99/month',
    category: 'spiritual',
    popular: true,
    features: [
      'Unlock all 50+ levels instantly',
      'Personalized daily zikir recommendations',
      'Advanced progress analytics with charts',
      'Custom spiritual goals and milestones',
      'Exclusive premium dhikr collections',
      'Personal spiritual advisor AI chatbot',
      'Priority access to new zikir content'
    ]
  },
  {
    id: 'customization-suite',
    name: 'Premium Customization',
    description: 'Personalize your spiritual experience with exclusive themes, avatars, and custom designs',
    icon: Palette,
    price: '$2.99/month',
    category: 'customization',
    features: [
      'Custom profile themes and backgrounds',
      'Exclusive avatar collections (100+ options)',
      'Personalized tasbih bead designs',
      'Custom counter animations and effects',
      'Premium color schemes and fonts',
      'Personalized congratulations messages',
      'Custom room backgrounds and themes'
    ]
  },
  {
    id: 'advanced-analytics',
    name: 'Advanced Personal Analytics',
    description: 'Deep insights into your spiritual practice with detailed analytics and progress tracking',
    icon: BarChart3,
    price: '$3.99/month',
    category: 'analytics',
    features: [
      'Detailed zikir frequency analysis',
      'Best practice time recommendations',
      'Spiritual consistency scoring',
      'Monthly/yearly progress reports (PDF)',
      'Comparative community benchmarking',
      'Habit tracking and streak optimization',
      'Goal achievement predictions'
    ]
  },
  {
    id: 'exclusive-competitions',
    name: 'VIP Competitions & Rewards',
    description: 'Access exclusive competitions with premium rewards and recognition',
    icon: Trophy,
    price: '$5.99/month',
    category: 'competition',
    popular: true,
    features: [
      'VIP-only competition rooms',
      'Higher reward competitions',
      'Early access to seasonal events',
      'Premium prize eligibility',
      'Exclusive leaderboard categories',
      'Priority tournament invitations',
      'Special recognition ceremonies'
    ]
  },
  {
    id: 'mobile-premium',
    name: 'Premium Mobile Experience',
    description: 'Enhanced mobile functionality with smartwatch integration and offline capabilities',
    icon: Smartphone,
    price: '$2.99/month',
    category: 'mobile',
    features: [
      'Offline zikir counting with sync',
      'Apple Watch / smartwatch integration',
      'Custom notification sounds (Quranic verses)',
      'Location-based prayer reminders',
      'Premium widgets for home screen',
      'Background counting capability',
      'Enhanced haptic feedback'
    ]
  },
  {
    id: 'islamic-tools',
    name: 'Advanced Islamic Tools',
    description: 'Comprehensive Islamic practice tools for complete spiritual guidance',
    icon: BookOpen,
    price: '$6.99/month',
    category: 'tools',
    newFeature: true,
    features: [
      'Advanced Salah tracker with Qaza management',
      'Complete 99 Names of Allah with audio',
      'Personalized dua recommendations',
      'Quranic verse of the day with context',
      'Advanced Qiblah with AR compass',
      'Islamic calendar with personal events',
      'Hajj/Umrah preparation guides'
    ]
  },
  {
    id: 'learning-education',
    name: 'Premium Learning Hub',
    description: 'Interactive Islamic education with quizzes, audio guides, and certificates',
    icon: Award,
    price: '$4.99/month',
    category: 'learning',
    features: [
      'Interactive Islamic quiz games',
      'Zikir meaning and context learning',
      'Audio pronunciation guides (native Arabic)',
      'Historical context of each dhikr',
      'Personalized learning paths',
      'Certificate generation for achievements',
      'Access to scholarly explanations'
    ]
  },
  {
    id: 'social-community',
    name: 'Social & Community Plus',
    description: 'Enhanced social features with unlimited rooms and community access',
    icon: Users,
    price: '$3.99/month',
    category: 'social',
    features: [
      'Create unlimited private rooms (vs 2 free)',
      'Friend system with progress sharing',
      'Private messaging within the app',
      'Community groups and discussions',
      'Mentorship program access',
      'Exclusive community events',
      'Priority customer support'
    ]
  },
  {
    id: 'smart-notifications',
    name: 'Smart Reminders AI',
    description: 'AI-powered intelligent notifications for optimal spiritual practice timing',
    icon: Bell,
    price: '$1.99/month',
    category: 'notifications',
    features: [
      'AI-powered optimal zikir time suggestions',
      'Smart prayer time notifications',
      'Personalized spiritual reminder quotes',
      'Habit formation notification sequences',
      'Custom reminder tones and messages',
      'Location-based Islamic reminders',
      'Intelligent break suggestions'
    ]
  },
  {
    id: 'premium-backup',
    name: 'Premium Backup & Sync',
    description: 'Secure cloud backup with family account linking and data export',
    icon: Cloud,
    price: '$2.99/month',
    category: 'backup',
    features: [
      'Unlimited cloud backup storage',
      'Cross-device synchronization',
      'Data export in multiple formats',
      'Account recovery assistance',
      'Premium data encryption',
      'Family account linking (up to 5 members)',
      'Legacy account planning'
    ]
  }
];

const subscriptionTiers = [
  {
    id: 'zikir-plus',
    name: 'Zikir Plus',
    price: '$9.99/month',
    originalPrice: '$16.95',
    description: 'Perfect for dedicated practitioners seeking enhanced spiritual growth',
    badge: 'Most Popular',
    savings: 'Save 40%',
    features: [
      'Premium Spiritual Journey',
      'Premium Customization Suite',
      'Advanced Personal Analytics',
      'Smart Reminders AI',
      'Premium Backup & Sync',
      'Priority support',
      'Early access to new features'
    ],
    popular: true
  },
  {
    id: 'zikir-pro', 
    name: 'Zikir Pro',
    price: '$19.99/month',
    originalPrice: '$39.92',
    description: 'Complete spiritual experience with all premium tools and exclusive access',
    badge: 'Best Value',
    savings: 'Save 50%',
    features: [
      'All Zikir Plus features',
      'VIP Competitions & Rewards',
      'Advanced Islamic Tools',
      'Premium Learning Hub',
      'Social & Community Plus',
      '24/7 Priority support',
      'Exclusive monthly webinars'
    ]
  },
  {
    id: 'zikir-elite',
    name: 'Zikir Elite',
    price: '$29.99/month',
    originalPrice: '$74.91',
    description: 'Ultimate package for Islamic community leaders and serious practitioners',
    badge: 'Ultimate',
    savings: 'Save 60%',
    features: [
      'All Zikir Pro features',
      'Premium Mobile Experience',
      'Personal spiritual consultation (monthly)',
      'Custom feature requests',
      'White-glove onboarding',
      'Dedicated account manager',
      'Beta feature access'
    ]
  }
];

export default function PremiumAddons() {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string>('');

  // Redirect organizations to their own add-ons page
  if ((user as any)?.userType === 'organization') {
    window.location.href = '/organization-addons';
    return null;
  }

  const categories = [
    { id: 'all', name: 'All Features', icon: Star },
    { id: 'spiritual', name: 'Spiritual', icon: Sparkles },
    { id: 'customization', name: 'Customization', icon: Palette },
    { id: 'analytics', name: 'Analytics', icon: BarChart3 },
    { id: 'competition', name: 'Competitions', icon: Trophy },
    { id: 'tools', name: 'Islamic Tools', icon: BookOpen },
    { id: 'learning', name: 'Learning', icon: Award },
    { id: 'social', name: 'Social', icon: Users },
    { id: 'mobile', name: 'Mobile', icon: Smartphone }
  ];

  const filteredAddons = selectedCategory === 'all' 
    ? premiumAddons 
    : premiumAddons.filter(addon => addon.category === selectedCategory);

  const AddonCard = ({ addon }: { addon: PremiumFeature }) => {
    const IconComponent = addon.icon;
    
    return (
      <Card className={cn(
        "relative overflow-hidden transition-all duration-300 hover:shadow-xl border-2",
        addon.popular && "border-blue-500 ring-2 ring-blue-200 scale-105",
        addon.newFeature && "border-green-500 ring-2 ring-green-200"
      )}>
        {addon.popular && (
          <div className="absolute -top-1 -right-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 text-xs font-bold rounded-bl-xl shadow-lg">
            🔥 POPULAR
          </div>
        )}
        {addon.newFeature && (
          <div className="absolute -top-1 -right-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 text-xs font-bold rounded-bl-xl shadow-lg">
            ✨ NEW
          </div>
        )}
        {addon.discount && (
          <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 text-xs font-bold rounded-full">
            {addon.discount}
          </div>
        )}
        
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between mb-3">
            <IconComponent className="w-10 h-10 text-blue-600" />
            <Badge className="bg-purple-100 text-purple-800 font-medium">
              Premium
            </Badge>
          </div>
          <CardTitle className="text-xl font-bold text-gray-900">{addon.name}</CardTitle>
          <CardDescription className="text-gray-600 text-sm leading-relaxed">
            {addon.description}
          </CardDescription>
          <div className="flex items-center justify-between pt-3">
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold text-blue-600">{addon.price}</span>
              {addon.originalPrice && (
                <span className="text-lg text-gray-400 line-through">{addon.originalPrice}</span>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <ul className="space-y-3 mb-6">
            {addon.features.map((feature, index) => (
              <li key={index} className="flex items-start gap-3 text-sm">
                <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">{feature}</span>
              </li>
            ))}
          </ul>
          
          <Button 
            className={cn(
              "w-full text-base font-semibold py-3 rounded-lg transition-all duration-300",
              addon.popular 
                ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl" 
                : "bg-islamic-primary hover:bg-islamic-primary/90 hover:shadow-lg"
            )}
            onClick={() => {
              setSelectedPlan(addon.id);
              setShowUpgradeDialog(true);
            }}
            data-testid={`button-addon-${addon.id}`}
          >
            <Crown className="w-5 h-5 mr-2" />
            Upgrade to Premium
          </Button>
        </CardContent>
      </Card>
    );
  };

  const PlanCard = ({ plan, index }: { plan: any; index: number }) => (
    <Card className={cn(
      "relative overflow-hidden transition-all duration-300 hover:shadow-2xl border-2",
      plan.popular && "border-blue-500 ring-4 ring-blue-200 scale-110 shadow-2xl",
      index === 1 && "border-purple-500 ring-2 ring-purple-200"
    )}>
      {plan.badge && (
        <div className={cn(
          "absolute -top-1 -right-1 text-white px-6 py-3 text-sm font-bold rounded-bl-2xl shadow-lg",
          plan.popular 
            ? "bg-gradient-to-r from-blue-500 to-purple-600" 
            : "bg-gradient-to-r from-purple-500 to-pink-600"
        )}>
          ⭐ {plan.badge}
        </div>
      )}
      
      <CardHeader className="text-center pb-6 pt-8">
        <div className="mb-4">
          <Crown className={cn(
            "w-16 h-16 mx-auto",
            plan.popular ? "text-blue-600" : "text-purple-600"
          )} />
        </div>
        <CardTitle className="text-3xl font-bold text-gray-900">{plan.name}</CardTitle>
        <div className="py-6">
          <div className="flex items-center justify-center gap-3">
            <span className="text-5xl font-bold text-blue-600">{plan.price}</span>
            <div className="text-left">
              <div className="text-lg text-gray-400 line-through">{plan.originalPrice}</div>
              <div className="text-sm font-bold text-green-600">{plan.savings}</div>
            </div>
          </div>
        </div>
        <CardDescription className="text-gray-600 text-base">
          {plan.description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="px-8 pb-8">
        <ul className="space-y-4 mb-8">
          {plan.features.map((feature: string, featureIndex: number) => (
            <li key={featureIndex} className="flex items-start gap-3">
              <Check className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
              <span className="text-gray-700 text-base">{feature}</span>
            </li>
          ))}
        </ul>
        
        <Button 
          className={cn(
            "w-full text-lg font-bold py-4 rounded-lg transition-all duration-300",
            plan.popular 
              ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-xl hover:shadow-2xl transform hover:scale-105" 
              : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl"
          )}
          onClick={() => {
            setSelectedPlan(plan.id);
            setShowUpgradeDialog(true);
          }}
          data-testid={`button-plan-${plan.id}`}
        >
          <Star className="w-6 h-6 mr-2" />
          Start {plan.name}
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-100">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 text-white py-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center mb-6">
            <Crown className="w-20 h-20 mr-4" />
            <div>
              <h1 className="text-5xl font-bold mb-2">Premium Features</h1>
              <div className="flex items-center justify-center gap-2 text-lg">
                <Star className="w-6 h-6" />
                <span>Elevate Your Spiritual Journey</span>
                <Star className="w-6 h-6" />
              </div>
            </div>
          </div>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
            Unlock advanced spiritual tools, exclusive content, and personalized guidance 
            to deepen your Islamic practice and achieve spiritual excellence
          </p>
          
          {/* Special Offer Banner */}
          <div className="mt-8 bg-white/10 backdrop-blur-sm rounded-2xl p-6 max-w-md mx-auto">
            <div className="flex items-center justify-center gap-2 text-yellow-300 mb-2">
              <Gift className="w-6 h-6" />
              <span className="font-bold text-lg">Limited Time Offer</span>
            </div>
            <p className="text-blue-100">7-Day Free Trial • Cancel Anytime</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        <Tabs defaultValue="plans" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-12 h-14 bg-white/80 backdrop-blur-sm">
            <TabsTrigger value="plans" className="text-lg font-semibold">
              💎 Subscription Plans
            </TabsTrigger>
            <TabsTrigger value="individual" className="text-lg font-semibold">
              🔧 Individual Add-ons
            </TabsTrigger>
          </TabsList>

          <TabsContent value="plans" className="space-y-12">
            {/* Subscription Plans */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Premium Plan</h2>
              <p className="text-lg text-gray-600">Save more with bundled subscriptions</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {subscriptionTiers.map((tier, index) => (
                <PlanCard key={tier.id} plan={tier} index={index} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="individual" className="space-y-8">
            {/* Category Filter */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Individual Premium Features</h2>
              <p className="text-lg text-gray-600 mb-8">Choose specific features that enhance your spiritual practice</p>
              
              <div className="flex flex-wrap gap-3 justify-center">
                {categories.map((category) => {
                  const IconComponent = category.icon;
                  return (
                    <Button
                      key={category.id}
                      variant={selectedCategory === category.id ? "default" : "outline"}
                      size="lg"
                      onClick={() => setSelectedCategory(category.id)}
                      className={cn(
                        "flex items-center gap-2 px-6 py-3 rounded-full transition-all duration-300",
                        selectedCategory === category.id 
                          ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg" 
                          : "hover:shadow-md"
                      )}
                      data-testid={`filter-${category.id}`}
                    >
                      <IconComponent className="w-5 h-5" />
                      {category.name}
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Add-ons Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {filteredAddons.map((addon) => (
                <AddonCard key={addon.id} addon={addon} />
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Upgrade Dialog */}
        <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-center text-2xl font-bold">
                <Star className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
                Premium Features Coming Soon!
              </DialogTitle>
              <DialogDescription className="text-center text-lg">
                We're putting the finishing touches on our premium features. 
                Be the first to know when they launch!
              </DialogDescription>
            </DialogHeader>
            <div className="text-center space-y-6 pt-4">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
                <Crown className="w-16 h-16 mx-auto text-purple-600 mb-4" />
                <h3 className="font-bold text-lg text-gray-900 mb-2">Join the Waitlist</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Get notified when premium features launch and enjoy early-bird discounts
                </p>
                <div className="flex items-center justify-center gap-2 text-green-600 font-semibold">
                  <Check className="w-5 h-5" />
                  <span>7-Day Free Trial for Early Users</span>
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button 
                  onClick={() => setShowUpgradeDialog(false)} 
                  variant="outline"
                  className="flex-1"
                >
                  Maybe Later
                </Button>
                <Button 
                  onClick={() => setShowUpgradeDialog(false)} 
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600"
                >
                  <Bell className="w-4 h-4 mr-2" />
                  Notify Me
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}