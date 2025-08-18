import { db } from "../db";
import { userSubscriptions, subscriptionPlans, userPremiumFeatures, premiumFeatures } from "../../shared/schema";
import { eq, and } from "drizzle-orm";
import { stripe } from "./stripe-config";

export class SubscriptionService {
  static async getUserActiveSubscription(userId: string) {
    const subscription = await db
      .select()
      .from(userSubscriptions)
      .where(
        and(
          eq(userSubscriptions.userId, userId),
          eq(userSubscriptions.status, 'active')
        )
      )
      .limit(1);
    
    return subscription[0] || null;
  }

  static async getUserPremiumFeatures(userId: string) {
    const features = await db
      .select({
        featureId: userPremiumFeatures.featureId,
        status: userPremiumFeatures.status,
        expiryDate: userPremiumFeatures.expiryDate,
        feature: premiumFeatures
      })
      .from(userPremiumFeatures)
      .leftJoin(premiumFeatures, eq(userPremiumFeatures.featureId, premiumFeatures.id))
      .where(
        and(
          eq(userPremiumFeatures.userId, userId),
          eq(userPremiumFeatures.status, 'active')
        )
      );

    return features;
  }

  static async hasFeatureAccess(userId: string, featureId: string): Promise<boolean> {
    // Check if user has active subscription that includes this feature
    const subscription = await this.getUserActiveSubscription(userId);
    if (subscription) {
      const plan = await db
        .select()
        .from(subscriptionPlans)
        .where(eq(subscriptionPlans.id, subscription.planId))
        .limit(1);
      
      if (plan[0]) {
        const features = plan[0].features as string[];
        if (features.includes(featureId)) {
          return true;
        }
      }
    }

    // Check if user has individual feature access
    const feature = await db
      .select()
      .from(userPremiumFeatures)
      .where(
        and(
          eq(userPremiumFeatures.userId, userId),
          eq(userPremiumFeatures.featureId, featureId),
          eq(userPremiumFeatures.status, 'active')
        )
      )
      .limit(1);

    return feature.length > 0;
  }

  static async createSubscription(userId: string, planId: string, stripeSubscriptionId: string) {
    const subscription = await db
      .insert(userSubscriptions)
      .values({
        userId,
        planId,
        stripeSubscriptionId,
        status: 'active',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
      })
      .returning();

    return subscription[0];
  }

  static async cancelSubscription(userId: string) {
    const subscription = await this.getUserActiveSubscription(userId);
    if (!subscription) {
      throw new Error('No active subscription found');
    }

    // Cancel in Stripe
    if (subscription.stripeSubscriptionId) {
      await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
        cancel_at_period_end: true
      });
    }

    // Update in database
    await db
      .update(userSubscriptions)
      .set({
        cancelAtPeriodEnd: true,
        updatedAt: new Date()
      })
      .where(eq(userSubscriptions.id, subscription.id));

    return true;
  }

  static async addPremiumFeature(userId: string, featureId: string, expiryDate?: Date) {
    const feature = await db
      .insert(userPremiumFeatures)
      .values({
        userId,
        featureId,
        status: 'active',
        expiryDate
      })
      .returning();

    return feature[0];
  }

  static async getUserSubscriptionStatus(userId: string) {
    const subscription = await this.getUserActiveSubscription(userId);
    const features = await this.getUserPremiumFeatures(userId);

    return {
      hasActiveSubscription: !!subscription,
      subscription,
      premiumFeatures: features,
      isPremiumUser: !!subscription || features.length > 0
    };
  }
}