import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY environment variable is required');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

// Subscription plan configurations
export const SUBSCRIPTION_PLANS = {
  regular: {
    'zikir-plus': {
      name: 'Zikir Plus',
      price: 999, // $9.99 in cents
      interval: 'month' as Stripe.Price.Recurring.Interval,
      features: ['spiritual-journey', 'customization-suite', 'advanced-analytics', 'smart-notifications', 'premium-backup']
    },
    'zikir-pro': {
      name: 'Zikir Pro', 
      price: 1999, // $19.99 in cents
      interval: 'month' as Stripe.Price.Recurring.Interval,
      features: ['spiritual-journey', 'customization-suite', 'advanced-analytics', 'smart-notifications', 'premium-backup', 'exclusive-competitions', 'islamic-tools', 'learning-education', 'social-community']
    },
    'zikir-elite': {
      name: 'Zikir Elite',
      price: 2999, // $29.99 in cents
      interval: 'month' as Stripe.Price.Recurring.Interval,
      features: ['spiritual-journey', 'customization-suite', 'advanced-analytics', 'smart-notifications', 'premium-backup', 'exclusive-competitions', 'islamic-tools', 'learning-education', 'social-community', 'mobile-premium']
    }
  },
  organization: {
    'org-basic': {
      name: 'Organization Basic',
      price: 4500, // $45 in cents
      interval: 'month' as Stripe.Price.Recurring.Interval,
      features: ['analytics-pro', 'community-management', 'branding-customization', 'business-intelligence']
    }
  }
} as const;

// Individual feature pricing
export const PREMIUM_FEATURES = {
  regular: {
    'spiritual-journey': { name: 'Premium Spiritual Journey', price: 499 },
    'customization-suite': { name: 'Premium Customization', price: 299 },
    'advanced-analytics': { name: 'Advanced Personal Analytics', price: 399 },
    'exclusive-competitions': { name: 'VIP Competitions & Rewards', price: 599 },
    'mobile-premium': { name: 'Premium Mobile Experience', price: 299 },
    'islamic-tools': { name: 'Advanced Islamic Tools', price: 699 },
    'learning-education': { name: 'Premium Learning Hub', price: 499 },
    'social-community': { name: 'Social & Community Plus', price: 399 },
    'smart-notifications': { name: 'Smart Reminders AI', price: 199 },
    'premium-backup': { name: 'Premium Backup & Sync', price: 299 }
  },
  organization: {
    'analytics-pro': { name: 'Advanced Analytics Pro', price: 1899 },
    'community-management': { name: 'Community Management Suite', price: 2499 },
    'branding-customization': { name: 'Branding & Customization', price: 1899 },
    'business-intelligence': { name: 'Business Intelligence', price: 4499 }
  }
};

export async function createStripeProduct(planId: string, userType: 'regular' | 'organization') {
  const planConfig = SUBSCRIPTION_PLANS[userType]?.[planId as keyof typeof SUBSCRIPTION_PLANS[typeof userType]];
  if (!planConfig) {
    throw new Error(`Plan ${planId} not found for user type ${userType}`);
  }

  const product = await stripe.products.create({
    id: `${userType}_${planId}`,
    name: planConfig.name,
    description: `${planConfig.name} subscription for ${userType} users`,
    metadata: {
      userType,
      planId,
      features: JSON.stringify(planConfig.features)
    }
  });

  const price = await stripe.prices.create({
    product: product.id,
    unit_amount: planConfig.price,
    currency: 'usd',
    recurring: {
      interval: planConfig.interval
    }
  });

  return { product, price };
}

export async function createStripeCustomer(userId: string, email?: string) {
  return await stripe.customers.create({
    metadata: {
      userId
    },
    email
  });
}