import { db } from '../db';
import { subscriptionPlans, premiumFeatures } from '../../shared/schema';

export async function seedPremiumData() {
  console.log('🔱 Seeding premium subscription plans and features...');
  
  try {
    // Check if data already exists
    const existingPlans = await db.select().from(subscriptionPlans).limit(1);
    if (existingPlans.length > 0) {
      console.log('✅ Premium data already exists, skipping seeding');
      return;
    }

    // Seed subscription plans for regular users
    const regularPlans = [
      {
        id: 'zikir-plus',
        name: 'Zikir Plus',
        description: 'Perfect for dedicated practitioners seeking enhanced spiritual growth',
        price: 999, // $9.99
        currency: 'USD',
        interval: 'month',
        intervalCount: 1,
        userType: 'regular',
        features: ['spiritual-journey', 'customization-suite', 'advanced-analytics', 'smart-notifications', 'premium-backup'],
        isActive: true
      },
      {
        id: 'zikir-pro',
        name: 'Zikir Pro',
        description: 'Complete spiritual experience with all premium tools and exclusive access',
        price: 1999, // $19.99
        currency: 'USD',
        interval: 'month',
        intervalCount: 1,
        userType: 'regular',
        features: ['spiritual-journey', 'customization-suite', 'advanced-analytics', 'smart-notifications', 'premium-backup', 'exclusive-competitions', 'islamic-tools', 'learning-education', 'social-community'],
        isActive: true
      },
      {
        id: 'zikir-elite',
        name: 'Zikir Elite',
        description: 'Ultimate package for Islamic community leaders and serious practitioners',
        price: 2999, // $29.99
        currency: 'USD',
        interval: 'month',
        intervalCount: 1,
        userType: 'regular',
        features: ['spiritual-journey', 'customization-suite', 'advanced-analytics', 'smart-notifications', 'premium-backup', 'exclusive-competitions', 'islamic-tools', 'learning-education', 'social-community', 'mobile-premium'],
        isActive: true
      }
    ];

    // Seed subscription plans for organizations
    const orgPlans = [
      {
        id: 'org-basic',
        name: 'Organization Basic',
        description: 'Essential tools for Islamic organizations and communities',
        price: 4500, // $45
        currency: 'USD',
        interval: 'month',
        intervalCount: 1,
        userType: 'organization',
        features: ['analytics-pro', 'community-management', 'branding-customization', 'business-intelligence'],
        isActive: true
      }
    ];

    // Insert subscription plans
    await db.insert(subscriptionPlans).values([...regularPlans, ...orgPlans]);

    // Seed premium features for regular users
    const regularFeatures = [
      {
        id: 'spiritual-journey',
        name: 'Premium Spiritual Journey',
        description: 'Unlock personalized spiritual growth with AI-powered recommendations and exclusive dhikr collections',
        category: 'spiritual',
        price: 499, // $4.99
        currency: 'USD',
        userType: 'regular',
        isPopular: true,
        isNewFeature: false,
        featureDetails: {
          includes: [
            'Unlock all 50+ levels instantly',
            'Personalized daily zikir recommendations', 
            'Advanced progress analytics with charts',
            'Custom spiritual goals and milestones',
            'Exclusive premium dhikr collections',
            'Personal spiritual advisor AI chatbot',
            'Priority access to new zikir content'
          ]
        },
        isActive: true
      },
      {
        id: 'customization-suite',
        name: 'Premium Customization',
        description: 'Personalize your spiritual experience with exclusive themes, avatars, and custom designs',
        category: 'customization',
        price: 299, // $2.99
        currency: 'USD',
        userType: 'regular',
        isPopular: false,
        isNewFeature: false,
        featureDetails: {
          includes: [
            'Custom profile themes and backgrounds',
            'Exclusive avatar collections (100+ options)',
            'Personalized tasbih bead designs',
            'Custom counter animations and effects',
            'Premium color schemes and fonts',
            'Personalized congratulations messages',
            'Custom room backgrounds and themes'
          ]
        },
        isActive: true
      },
      {
        id: 'advanced-analytics',
        name: 'Advanced Personal Analytics',
        description: 'Deep insights into your spiritual practice with detailed analytics and progress tracking',
        category: 'analytics',
        price: 399, // $3.99
        currency: 'USD',
        userType: 'regular',
        isPopular: false,
        isNewFeature: false,
        featureDetails: {
          includes: [
            'Detailed zikir frequency analysis',
            'Best practice time recommendations',
            'Spiritual consistency scoring',
            'Monthly/yearly progress reports (PDF)',
            'Comparative community benchmarking',
            'Habit tracking and streak optimization',
            'Goal achievement predictions'
          ]
        },
        isActive: true
      },
      {
        id: 'exclusive-competitions',
        name: 'VIP Competitions & Rewards',
        description: 'Access exclusive competitions with premium rewards and recognition',
        category: 'competition',
        price: 599, // $5.99
        currency: 'USD',
        userType: 'regular',
        isPopular: true,
        isNewFeature: false,
        featureDetails: {
          includes: [
            'VIP-only competition rooms',
            'Higher reward competitions',
            'Early access to seasonal events',
            'Premium prize eligibility',
            'Exclusive leaderboard categories',
            'Priority tournament invitations',
            'Special recognition ceremonies'
          ]
        },
        isActive: true
      },
      {
        id: 'islamic-tools',
        name: 'Advanced Islamic Tools',
        description: 'Comprehensive Islamic practice tools for complete spiritual guidance',
        category: 'tools',
        price: 699, // $6.99
        currency: 'USD',
        userType: 'regular',
        isPopular: false,
        isNewFeature: true,
        featureDetails: {
          includes: [
            'Advanced Salah tracker with Qaza management',
            'Complete 99 Names of Allah with audio',
            'Personalized dua recommendations',
            'Quranic verse of the day with context',
            'Advanced Qiblah with AR compass',
            'Islamic calendar with personal events',
            'Hajj/Umrah preparation guides'
          ]
        },
        isActive: true
      },
      {
        id: 'learning-education',
        name: 'Premium Learning Hub',
        description: 'Interactive Islamic education with quizzes, audio guides, and certificates',
        category: 'learning',
        price: 499, // $4.99
        currency: 'USD',
        userType: 'regular',
        isPopular: false,
        isNewFeature: false,
        featureDetails: {
          includes: [
            'Interactive Islamic quiz games',
            'Zikir meaning and context learning',
            'Audio pronunciation guides (native Arabic)',
            'Historical context of each dhikr',
            'Personalized learning paths',
            'Certificate generation for achievements',
            'Access to scholarly explanations'
          ]
        },
        isActive: true
      },
      {
        id: 'social-community',
        name: 'Social & Community Plus',
        description: 'Enhanced social features with unlimited rooms and community access',
        category: 'social',
        price: 399, // $3.99
        currency: 'USD',
        userType: 'regular',
        isPopular: false,
        isNewFeature: false,
        featureDetails: {
          includes: [
            'Create unlimited private rooms (vs 2 free)',
            'Friend system with progress sharing',
            'Private messaging within the app',
            'Community groups and discussions',
            'Mentorship program access',
            'Exclusive community events',
            'Priority customer support'
          ]
        },
        isActive: true
      },
      {
        id: 'smart-notifications',
        name: 'Smart Reminders AI',
        description: 'AI-powered intelligent notifications for optimal spiritual practice timing',
        category: 'notifications',
        price: 199, // $1.99
        currency: 'USD',
        userType: 'regular',
        isPopular: false,
        isNewFeature: false,
        featureDetails: {
          includes: [
            'AI-powered optimal zikir time suggestions',
            'Smart prayer time notifications',
            'Personalized spiritual reminder quotes',
            'Habit formation notification sequences',
            'Custom reminder tones and messages',
            'Location-based Islamic reminders',
            'Intelligent break suggestions'
          ]
        },
        isActive: true
      },
      {
        id: 'premium-backup',
        name: 'Premium Backup & Sync',
        description: 'Secure cloud backup with family account linking and data export',
        category: 'backup',
        price: 299, // $2.99
        currency: 'USD',
        userType: 'regular',
        isPopular: false,
        isNewFeature: false,
        featureDetails: {
          includes: [
            'Unlimited cloud backup storage',
            'Cross-device synchronization',
            'Data export in multiple formats',
            'Account recovery assistance',
            'Premium data encryption',
            'Family account linking (up to 5 members)',
            'Legacy account planning'
          ]
        },
        isActive: true
      },
      {
        id: 'mobile-premium',
        name: 'Premium Mobile Experience',
        description: 'Enhanced mobile functionality with smartwatch integration and offline capabilities',
        category: 'mobile',
        price: 299, // $2.99
        currency: 'USD',
        userType: 'regular',
        isPopular: false,
        isNewFeature: false,
        featureDetails: {
          includes: [
            'Offline zikir counting with sync',
            'Apple Watch / smartwatch integration',
            'Custom notification sounds (Quranic verses)',
            'Location-based prayer reminders',
            'Premium widgets for home screen',
            'Background counting capability',
            'Enhanced haptic feedback'
          ]
        },
        isActive: true
      }
    ];

    // Seed premium features for organizations
    const orgFeatures = [
      {
        id: 'analytics-pro',
        name: 'Advanced Analytics Pro',
        description: 'Comprehensive analytics and reporting tools for organizational insights',
        category: 'analytics',
        price: 1899, // $18.99
        currency: 'USD',
        userType: 'organization',
        isPopular: true,
        isNewFeature: false,
        featureDetails: {
          includes: [
            'Advanced participant analytics dashboard',
            'Custom report generation and scheduling',
            'Data export and API access',
            'Performance benchmarking tools',
            'Engagement metrics and insights',
            'ROI tracking and measurement'
          ]
        },
        isActive: true
      },
      {
        id: 'community-management',
        name: 'Community Management Suite',
        description: 'Professional tools for managing Islamic communities and participants',
        category: 'management',
        price: 2499, // $24.99
        currency: 'USD',
        userType: 'organization',
        isPopular: false,
        isNewFeature: false,
        featureDetails: {
          includes: [
            'Advanced participant management system',
            'Automated communication tools',
            'Custom registration and onboarding',
            'Volunteer coordination features',
            'Event planning and scheduling',
            'Resource sharing and management'
          ]
        },
        isActive: true
      },
      {
        id: 'branding-customization',
        name: 'Branding & Customization',
        description: 'Complete branding control with custom themes and organization identity',
        category: 'branding',
        price: 1899, // $18.99
        currency: 'USD',
        userType: 'organization',
        isPopular: false,
        isNewFeature: false,
        featureDetails: {
          includes: [
            'Custom organization themes and colors',
            'Logo integration and branding',
            'Custom domain and URL',
            'Personalized email templates',
            'White-label competition pages',
            'Custom certificates and awards'
          ]
        },
        isActive: true
      },
      {
        id: 'business-intelligence',
        name: 'Business Intelligence',
        description: 'Advanced data analytics and business insights for strategic decisions',
        category: 'intelligence',
        price: 4499, // $44.99
        currency: 'USD',
        userType: 'organization',
        isPopular: false,
        isNewFeature: true,
        featureDetails: {
          includes: [
            'Predictive analytics and forecasting',
            'Advanced data visualization tools',
            'Custom dashboard creation',
            'Integration with external systems',
            'AI-powered insights and recommendations',
            'Strategic planning and goal tracking'
          ]
        },
        isActive: true
      }
    ];

    // Insert premium features
    await db.insert(premiumFeatures).values([...regularFeatures, ...orgFeatures]);

    console.log('✅ Premium data seeded successfully');
    console.log(`   - Created ${regularPlans.length + orgPlans.length} subscription plans`);
    console.log(`   - Created ${regularFeatures.length + orgFeatures.length} premium features`);
    
  } catch (error) {
    console.error('❌ Error seeding premium data:', error);
    throw error;
  }
}