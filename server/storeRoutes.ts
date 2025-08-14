import type { Express } from "express";
import { eq, and } from "drizzle-orm";
import { db } from "./db";
import { 
  tasbihSkins, 
  userWallets, 
  userInventory, 
  userPurchases, 
  userRoomConfigs 
} from "@shared/schema";

export function registerStoreRoutes(app: Express) {
  
  // Get all active tasbih skins
  app.get('/api/store/tasbih-skins', async (req, res) => {
    try {
      const skins = await db
        .select()
        .from(tasbihSkins)
        .where(eq(tasbihSkins.status, 'active'))
        .orderBy(tasbihSkins.priceCoins);
      
      res.json(skins);
    } catch (error) {
      console.error("Error fetching tasbih skins:", error);
      res.status(500).json({ message: "Failed to fetch tasbih skins" });
    }
  });

  // Get user wallet
  app.get('/api/user/wallet', async (req: any, res) => {
    try {
      if (!req.session?.user?.id) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const userId = req.session.user.id;
      
      // Get or create wallet
      let [wallet] = await db
        .select()
        .from(userWallets)
        .where(eq(userWallets.userId, userId));

      if (!wallet) {
        [wallet] = await db
          .insert(userWallets)
          .values({ userId, coins: 500 }) // Give new users 500 starting coins
          .returning();
      }

      res.json(wallet);
    } catch (error) {
      console.error("Error fetching user wallet:", error);
      res.status(500).json({ message: "Failed to fetch wallet" });
    }
  });

  // Get user inventory
  app.get('/api/user/inventory', async (req: any, res) => {
    try {
      if (!req.session?.user?.id) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const userId = req.session.user.id;
      
      const inventory = await db
        .select()
        .from(userInventory)
        .where(eq(userInventory.userId, userId));

      res.json(inventory);
    } catch (error) {
      console.error("Error fetching user inventory:", error);
      res.status(500).json({ message: "Failed to fetch inventory" });
    }
  });

  // Buy tasbih skin
  app.post('/api/store/buy-skin', async (req: any, res) => {
    try {
      if (!req.session?.user?.id) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const userId = req.session.user.id;
      const { skinId } = req.body;

      if (!skinId) {
        return res.status(400).json({ message: "Skin ID required" });
      }

      // Get skin details
      const [skin] = await db
        .select()
        .from(tasbihSkins)
        .where(eq(tasbihSkins.id, skinId));

      if (!skin) {
        return res.status(404).json({ message: "Tasbih skin not found" });
      }

      // Check if already owned
      const [existingItem] = await db
        .select()
        .from(userInventory)
        .where(and(
          eq(userInventory.userId, userId),
          eq(userInventory.tasbihSkinId, skinId)
        ));

      if (existingItem) {
        return res.status(400).json({ message: "You already own this tasbih skin" });
      }

      // Get user wallet
      const [wallet] = await db
        .select()
        .from(userWallets)
        .where(eq(userWallets.userId, userId));

      if (!wallet || wallet.coins < skin.priceCoins) {
        return res.status(400).json({ message: "Insufficient coins" });
      }

      // Perform transaction: deduct coins and add to inventory
      await db.transaction(async (tx) => {
        // Deduct coins
        await tx
          .update(userWallets)
          .set({ 
            coins: wallet.coins - skin.priceCoins,
            updatedAt: new Date()
          })
          .where(eq(userWallets.userId, userId));

        // Add to inventory
        await tx
          .insert(userInventory)
          .values({
            userId,
            tasbihSkinId: skinId
          });

        // Record purchase
        await tx
          .insert(userPurchases)
          .values({
            userId,
            type: 'skin',
            itemId: skinId,
            coinsDelta: -skin.priceCoins
          });
      });

      res.json({ 
        message: "Purchase successful",
        skinId,
        skinName: skin.name,
        coinsRemaining: wallet.coins - skin.priceCoins
      });

    } catch (error) {
      console.error("Error buying skin:", error);
      res.status(500).json({ message: "Failed to purchase skin" });
    }
  });

  // Equip tasbih skin in room
  app.post('/api/room/:roomId/equip', async (req: any, res) => {
    try {
      if (!req.session?.user?.id) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const userId = req.session.user.id;
      const roomId = parseInt(req.params.roomId);
      const { skinId } = req.body;

      if (!skinId || !roomId) {
        return res.status(400).json({ message: "Skin ID and Room ID required" });
      }

      // Verify ownership
      const [inventoryItem] = await db
        .select()
        .from(userInventory)
        .where(and(
          eq(userInventory.userId, userId),
          eq(userInventory.tasbihSkinId, skinId)
        ));

      if (!inventoryItem) {
        return res.status(403).json({ message: "You don't own this tasbih skin" });
      }

      // Get skin name
      const [skin] = await db
        .select()
        .from(tasbihSkins)
        .where(eq(tasbihSkins.id, skinId));

      // Upsert room config
      await db
        .insert(userRoomConfigs)
        .values({
          userId,
          roomId,
          equippedTasbihSkinId: skinId
        })
        .onConflictDoUpdate({
          target: [userRoomConfigs.userId, userRoomConfigs.roomId],
          set: {
            equippedTasbihSkinId: skinId,
            updatedAt: new Date()
          }
        });

      res.json({
        message: "Tasbih equipped successfully",
        skinId,
        skinName: skin?.name || skinId
      });

    } catch (error) {
      console.error("Error equipping skin:", error);
      res.status(500).json({ message: "Failed to equip tasbih skin" });
    }
  });

  // Get user's equipped tasbih for a room
  app.get('/api/room/:roomId/config', async (req: any, res) => {
    try {
      if (!req.session?.user?.id) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const userId = req.session.user.id;
      const roomId = parseInt(req.params.roomId);

      const [config] = await db
        .select()
        .from(userRoomConfigs)
        .where(and(
          eq(userRoomConfigs.userId, userId),
          eq(userRoomConfigs.roomId, roomId)
        ));

      res.json({
        equippedTasbihSkinId: config?.equippedTasbihSkinId || 'classic_wood'
      });

    } catch (error) {
      console.error("Error fetching room config:", error);
      res.status(500).json({ message: "Failed to fetch room config" });
    }
  });

  // Buy coins (placeholder for real payment integration)
  app.post('/api/store/buy-coins', async (req: any, res) => {
    try {
      if (!req.session?.user?.id) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const userId = req.session.user.id;
      const { sku } = req.body;

      // Define coin packages
      const packages = {
        'coins_300': { coins: 300, price: 199 }, // $1.99
        'coins_800': { coins: 800, price: 499 }, // $4.99
        'coins_1800': { coins: 1800, price: 999 } // $9.99
      };

      const packageInfo = packages[sku as keyof typeof packages];
      if (!packageInfo) {
        return res.status(400).json({ message: "Invalid package" });
      }

      // For demo purposes, just add coins (in real app, verify payment first)
      const [wallet] = await db
        .select()
        .from(userWallets)
        .where(eq(userWallets.userId, userId));

      if (!wallet) {
        return res.status(404).json({ message: "Wallet not found" });
      }

      await db.transaction(async (tx) => {
        // Add coins
        await tx
          .update(userWallets)
          .set({
            coins: wallet.coins + packageInfo.coins,
            updatedAt: new Date()
          })
          .where(eq(userWallets.userId, userId));

        // Record purchase
        await tx
          .insert(userPurchases)
          .values({
            userId,
            type: 'coins',
            sku,
            coinsDelta: packageInfo.coins,
            amountCurrency: 'USD',
            amountCents: packageInfo.price,
            provider: 'demo'
          });
      });

      res.json({
        message: "Coins purchased successfully",
        coinsAdded: packageInfo.coins,
        totalCoins: wallet.coins + packageInfo.coins
      });

    } catch (error) {
      console.error("Error buying coins:", error);
      res.status(500).json({ message: "Failed to purchase coins" });
    }
  });
}