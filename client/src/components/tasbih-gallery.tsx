import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Coins, ShoppingCart, Eye, Star } from "lucide-react";
import { useToast } from "../hooks/use-toast";
import { apiRequest, queryClient } from "../lib/queryClient";
import type { TasbihSkin, UserWallet } from "../../shared/schema";

interface TasbihGalleryProps {
  roomId: number;
  currentTasbihId?: string;
  onTasbihChange?: (tasbihId: string) => void;
}

export default function TasbihGallery({ roomId, currentTasbihId, onTasbihChange }: TasbihGalleryProps) {
  const [selectedSkin, setSelectedSkin] = useState<TasbihSkin | null>(null);
  const [showPurchaseCoins, setShowPurchaseCoins] = useState(false);
  const { toast } = useToast();

  // Fetch available tasbih skins
  const { data: tasbihSkins = [], isLoading: skinsLoading } = useQuery({
    queryKey: ["/api/store/tasbih-skins"],
  });

  // Fetch user wallet
  const { data: wallet } = useQuery({
    queryKey: ["/api/user/wallet"],
  }) as { data: UserWallet | undefined };

  // Fetch user inventory
  const { data: inventory = [] } = useQuery({
    queryKey: ["/api/user/inventory"],
  });

  // Buy skin mutation
  const buySkinMutation = useMutation({
    mutationFn: async (skinId: string) => {
      const response = await apiRequest("POST", "/api/store/buy-skin", { skinId });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "MashaAllah! ✨",
        description: `${data.skinName} equipped successfully`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user/wallet"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/inventory"] });
    },
    onError: (error: any) => {
      toast({
        title: "Purchase Failed",
        description: error.message || "Failed to purchase tasbih skin",
        variant: "destructive",
      });
    },
  });

  // Equip skin mutation
  const equipSkinMutation = useMutation({
    mutationFn: async (skinId: string) => {
      const response = await apiRequest("POST", `/api/room/${roomId}/equip`, { skinId });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Tasbih Equipped",
        description: `${data.skinName} is now active in this room`,
      });
      onTasbihChange?.(data.skinId);
      queryClient.invalidateQueries({ queryKey: [`/api/room/${roomId}/config`] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Equip",
        description: error.message || "Failed to equip tasbih skin",
        variant: "destructive",
      });
    },
  });

  const isOwned = (skinId: string) => {
    return inventory.some((item: any) => item.tasbihSkinId === skinId);
  };

  const canAfford = (price: number) => {
    return (wallet?.coins || 0) >= price;
  };

  const getRarityColor = (rarity: string) => {
    const colors = {
      common: "bg-gray-100 text-gray-800",
      uncommon: "bg-green-100 text-green-800",
      rare: "bg-blue-100 text-blue-800",
      epic: "bg-purple-100 text-purple-800",
      legendary: "bg-orange-100 text-orange-800"
    };
    return colors[rarity as keyof typeof colors] || colors.common;
  };

  const getRarityStars = (rarity: string) => {
    const stars = {
      common: 1,
      uncommon: 2,
      rare: 3,
      epic: 4,
      legendary: 5
    };
    return stars[rarity as keyof typeof stars] || 1;
  };

  const handleBuySkin = (skin: TasbihSkin) => {
    if (!canAfford(skin.priceCoins)) {
      setShowPurchaseCoins(true);
      return;
    }
    buySkinMutation.mutate(skin.id);
  };

  const handleEquipSkin = (skinId: string) => {
    equipSkinMutation.mutate(skinId);
  };

  if (skinsLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 p-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-32 bg-gray-200 rounded-lg mb-2"></div>
            <div className="h-4 bg-gray-200 rounded mb-1"></div>
            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* Wallet Info */}
      <div className="flex items-center justify-between bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg">
        <div className="flex items-center gap-2">
          <Coins className="h-5 w-5 text-amber-500" />
          <span className="font-semibold text-gray-700">{wallet?.coins || 0} Gold Coins</span>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setShowPurchaseCoins(true)}
          className="text-green-600 border-green-600 hover:bg-green-50"
        >
          Buy Coins
        </Button>
      </div>

      {/* Tasbih Grid */}
      <div className="grid grid-cols-2 gap-4">
        {tasbihSkins.map((skin: TasbihSkin) => {
          const owned = isOwned(skin.id);
          const equipped = currentTasbihId === skin.id;
          const affordable = canAfford(skin.priceCoins);

          return (
            <Card key={skin.id} className={`relative ${equipped ? 'ring-2 ring-green-500' : ''}`}>
              <CardHeader className="p-3 pb-2">
                <div className="flex items-center justify-between">
                  <Badge className={getRarityColor(skin.rarity)} variant="secondary">
                    {skin.rarity}
                  </Badge>
                  <div className="flex">
                    {Array.from({ length: getRarityStars(skin.rarity) }).map((_, i) => (
                      <Star key={i} className="h-3 w-3 text-amber-400 fill-current" />
                    ))}
                  </div>
                </div>
                
                {/* Tasbih Preview */}
                <div className="h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center relative overflow-hidden">
                  {/* Placeholder for actual tasbih animation */}
                  <div className="text-4xl">📿</div>
                  {equipped && (
                    <div className="absolute top-1 right-1">
                      <Badge variant="default" className="text-xs bg-green-500">
                        Equipped
                      </Badge>
                    </div>
                  )}
                </div>
                
                <CardTitle className="text-sm">{skin.name}</CardTitle>
              </CardHeader>
              
              <CardContent className="p-3 pt-0 space-y-2">
                <p className="text-xs text-gray-600 line-clamp-2">{skin.description}</p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Coins className="h-4 w-4 text-amber-500" />
                    <span className="text-sm font-semibold">{skin.priceCoins}</span>
                  </div>
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="p-1">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{skin.name}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="h-40 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                          <div className="text-6xl">📿</div>
                        </div>
                        <p className="text-gray-600">{skin.description}</p>
                        <div className="flex items-center justify-between">
                          <Badge className={getRarityColor(skin.rarity)}>
                            {skin.rarity}
                          </Badge>
                          <div className="flex items-center gap-1">
                            <Coins className="h-4 w-4 text-amber-500" />
                            <span className="font-semibold">{skin.priceCoins}</span>
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                {/* Action Buttons */}
                <div className="w-full">
                  {owned ? (
                    <Button
                      size="sm"
                      className="w-full"
                      variant={equipped ? "secondary" : "default"}
                      onClick={() => handleEquipSkin(skin.id)}
                      disabled={equipped || equipSkinMutation.isPending}
                    >
                      {equipped ? "Equipped" : "Equip"}
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      className="w-full"
                      variant={affordable ? "default" : "secondary"}
                      onClick={() => handleBuySkin(skin)}
                      disabled={buySkinMutation.isPending}
                    >
                      <ShoppingCart className="h-3 w-3 mr-1" />
                      {affordable ? "Buy" : "Need More Coins"}
                    </Button>
                  )}
                </div>

                {!affordable && !owned && (
                  <p className="text-xs text-red-500 text-center">
                    Need {skin.priceCoins - (wallet?.coins || 0)} more coins
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Purchase Coins Modal */}
      <Dialog open={showPurchaseCoins} onOpenChange={setShowPurchaseCoins}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Purchase Gold Coins</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Get coins to unlock beautiful tasbih designs. All purchases are halal and transparent with no randomized rewards.
            </p>
            
            <div className="space-y-3">
              {[
                { coins: 300, price: "$1.99", sku: "coins_300" },
                { coins: 800, price: "$4.99", sku: "coins_800", popular: true },
                { coins: 1800, price: "$9.99", sku: "coins_1800" }
              ].map((pack) => (
                <Card key={pack.sku} className={pack.popular ? "ring-2 ring-green-500" : ""}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Coins className="h-6 w-6 text-amber-500" />
                      <div>
                        <div className="font-semibold">{pack.coins} Gold Coins</div>
                        <div className="text-sm text-gray-600">{pack.price}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {pack.popular && (
                        <Badge variant="default" className="bg-green-500">
                          Popular
                        </Badge>
                      )}
                      <Button size="sm">
                        Purchase
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
              <strong>Halal Notice:</strong> Cosmetic only. No chance-based rewards. All purchases support app development.
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}