import { Request, Response, NextFunction } from 'express';
import { SubscriptionService } from './subscription-service';

// Extend Request type to include premium info
declare global {
  namespace Express {
    interface Request {
      premiumStatus?: {
        hasActiveSubscription: boolean;
        isPremiumUser: boolean;
        features: string[];
      };
    }
  }
}

export const attachPremiumStatus = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user?.id) {
    return next();
  }

  try {
    const status = await SubscriptionService.getUserSubscriptionStatus(req.user.id as string);
    
    // Get all accessible feature IDs
    const featureIds: string[] = [];
    
    if (status.subscription) {
      // Add subscription plan features
      const planFeatures = status.subscription.plan?.features as string[] || [];
      featureIds.push(...planFeatures);
    }
    
    // Add individual premium features
    status.premiumFeatures.forEach(f => {
      if (f.featureId && !featureIds.includes(f.featureId)) {
        featureIds.push(f.featureId);
      }
    });

    req.premiumStatus = {
      hasActiveSubscription: status.hasActiveSubscription,
      isPremiumUser: status.isPremiumUser,
      features: featureIds
    };

    next();
  } catch (error) {
    console.error('Premium status middleware error:', error);
    // Continue without premium status if there's an error
    next();
  }
};

export const requirePremiumFeature = (featureId: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user?.id) {
      return res.status(401).json({ 
        error: 'Authentication required',
        premiumFeatureRequired: featureId 
      });
    }

    try {
      const hasAccess = await SubscriptionService.hasFeatureAccess(req.user.id as string, featureId);
      
      if (!hasAccess) {
        return res.status(403).json({
          error: 'Premium feature access required',
          featureId,
          upgradeRequired: true,
          message: `This feature requires premium access. Please upgrade your subscription to access ${featureId}.`
        });
      }

      next();
    } catch (error) {
      console.error(`Premium feature check error for ${featureId}:`, error);
      return res.status(500).json({ error: 'Failed to verify premium access' });
    }
  };
};

export const requirePremiumSubscription = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user?.id) {
    return res.status(401).json({ 
      error: 'Authentication required',
      subscriptionRequired: true 
    });
  }

  try {
    const subscription = await SubscriptionService.getUserActiveSubscription(req.user.id as string);
    
    if (!subscription) {
      return res.status(403).json({
        error: 'Active subscription required',
        upgradeRequired: true,
        message: 'This feature requires an active premium subscription.'
      });
    }

    next();
  } catch (error) {
    console.error('Premium subscription check error:', error);
    return res.status(500).json({ error: 'Failed to verify subscription status' });
  }
};

// Helper middleware to add premium info to responses
export const enrichWithPremiumInfo = (req: Request, res: Response, next: NextFunction) => {
  const originalJson = res.json;
  
  res.json = function(data: any) {
    if (req.premiumStatus && typeof data === 'object' && data !== null) {
      data._premium = req.premiumStatus;
    }
    return originalJson.call(this, data);
  };
  
  next();
};