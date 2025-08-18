import { Router } from 'express';
import { db } from '../db';
import { subscriptionPlans, premiumFeatures, userSubscriptions, paymentTransactions } from '../../shared/schema';
import { SubscriptionService } from './subscription-service';
import { stripe, createStripeCustomer } from './stripe-config';
import { attachPremiumStatus, requirePremiumFeature } from './premium-middleware';
import { eq, desc } from 'drizzle-orm';
import { z } from 'zod';

const router = Router();

// Apply premium status to all routes
router.use(attachPremiumStatus);

// Get user's premium status
router.get('/status', async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const status = await SubscriptionService.getUserSubscriptionStatus(req.user.id as string);
    res.json(status);
  } catch (error) {
    console.error('Premium status error:', error);
    res.status(500).json({ error: 'Failed to get premium status' });
  }
});

// Get available subscription plans
router.get('/plans', async (req, res) => {
  try {
    const userType = req.query.userType as string || 'regular';
    
    const plans = await db
      .select()
      .from(subscriptionPlans)
      .where(eq(subscriptionPlans.userType, userType));

    res.json({ plans });
  } catch (error) {
    console.error('Get plans error:', error);
    res.status(500).json({ error: 'Failed to get subscription plans' });
  }
});

// Get available premium features
router.get('/features', async (req, res) => {
  try {
    const userType = req.query.userType as string || 'regular';
    
    const features = await db
      .select()
      .from(premiumFeatures)
      .where(eq(premiumFeatures.userType, userType));

    res.json({ features });
  } catch (error) {
    console.error('Get features error:', error);
    res.status(500).json({ error: 'Failed to get premium features' });
  }
});

// Create checkout session for subscription
const createCheckoutSchema = z.object({
  planId: z.string(),
  userType: z.enum(['regular', 'organization']),
  successUrl: z.string().url(),
  cancelUrl: z.string().url()
});

router.post('/checkout/subscription', async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { planId, userType, successUrl, cancelUrl } = createCheckoutSchema.parse(req.body);

    // Get or create Stripe customer
    let stripeCustomerId: string;
    const existingSubscription = await SubscriptionService.getUserActiveSubscription(req.user.id as string);
    
    if (existingSubscription?.stripeCustomerId) {
      stripeCustomerId = existingSubscription.stripeCustomerId;
    } else {
      const customer = await createStripeCustomer(req.user.id as string, req.user.email);
      stripeCustomerId = customer.id;
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: `Premium Subscription - ${planId}`,
            description: `Monthly subscription for ${userType} users`
          },
          unit_amount: userType === 'regular' ? 999 : 4500, // Default pricing
          recurring: {
            interval: 'month'
          }
        },
        quantity: 1
      }],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId: req.user.id as string,
        planId,
        userType
      }
    });

    res.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Create checkout session error:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// Create checkout session for individual feature
const createFeatureCheckoutSchema = z.object({
  featureId: z.string(),
  userType: z.enum(['regular', 'organization']),
  successUrl: z.string().url(),
  cancelUrl: z.string().url()
});

router.post('/checkout/feature', async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { featureId, userType, successUrl, cancelUrl } = createFeatureCheckoutSchema.parse(req.body);

    // Get feature details
    const feature = await db
      .select()
      .from(premiumFeatures)
      .where(eq(premiumFeatures.id, featureId))
      .limit(1);

    if (!feature[0]) {
      return res.status(404).json({ error: 'Feature not found' });
    }

    // Get or create Stripe customer
    let stripeCustomerId: string;
    const existingSubscription = await SubscriptionService.getUserActiveSubscription(req.user.id as string);
    
    if (existingSubscription?.stripeCustomerId) {
      stripeCustomerId = existingSubscription.stripeCustomerId;
    } else {
      const customer = await createStripeCustomer(req.user.id as string, req.user.email);
      stripeCustomerId = customer.id;
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: feature[0].name,
            description: feature[0].description || ''
          },
          unit_amount: feature[0].price,
          recurring: {
            interval: 'month'
          }
        },
        quantity: 1
      }],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId: req.user.id as string,
        featureId,
        userType
      }
    });

    res.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Create feature checkout session error:', error);
    res.status(500).json({ error: 'Failed to create feature checkout session' });
  }
});

// Cancel subscription
router.post('/subscription/cancel', async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    await SubscriptionService.cancelSubscription(req.user.id as string);
    res.json({ message: 'Subscription cancelled successfully' });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({ error: 'Failed to cancel subscription' });
  }
});

// Premium feature example endpoint
router.get('/spiritual-journey', requirePremiumFeature('spiritual-journey'), async (req, res) => {
  res.json({
    message: 'Welcome to your Premium Spiritual Journey!',
    features: [
      'Personalized daily zikir recommendations',
      'Advanced progress analytics',
      'Custom spiritual goals',
      'Exclusive premium dhikr collections',
      'AI spiritual advisor chatbot'
    ]
  });
});

// Get user's payment history
router.get('/transactions', async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const transactions = await db
      .select()
      .from(paymentTransactions)
      .where(eq(paymentTransactions.userId, req.user.id as string))
      .orderBy(desc(paymentTransactions.createdAt));

    res.json({ transactions });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ error: 'Failed to get payment history' });
  }
});

export { router as premiumRoutes };