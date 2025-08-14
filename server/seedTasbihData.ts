import { db } from "./db";
import { tasbihSkins } from "@shared/schema";

export const tasbihSkinData = [
  {
    id: "classic_wood",
    name: "Classic Wood",
    rarity: "common",
    priceCoins: 200,
    animationType: "subtle_shine",
    description: "Polished walnut beads with subtle shine on tap",
    thumbUrl: "/tasbih-thumbs/classic_wood.png",
    previewUrl: "/tasbih-previews/classic_wood.mp4"
  },
  {
    id: "emerald_glow",
    name: "Emerald Glow",
    rarity: "uncommon",
    priceCoins: 400,
    animationType: "radial_glow",
    description: "Deep green beads with soft radial glow on increment",
    thumbUrl: "/tasbih-thumbs/emerald_glow.png",
    previewUrl: "/tasbih-previews/emerald_glow.mp4"
  },
  {
    id: "noor_pearl",
    name: "Noor Pearl",
    rarity: "uncommon",
    priceCoins: 400,
    animationType: "gentle_bloom",
    description: "Pearl-white beads with gentle bloom and haptic ping",
    thumbUrl: "/tasbih-thumbs/noor_pearl.png",
    previewUrl: "/tasbih-previews/noor_pearl.mp4"
  },
  {
    id: "sands_of_haram",
    name: "Sands of Haram",
    rarity: "rare",
    priceCoins: 600,
    animationType: "dust_shimmer",
    description: "Sand-texture beads with dust-mote shimmer",
    thumbUrl: "/tasbih-thumbs/sands_of_haram.png",
    previewUrl: "/tasbih-previews/sands_of_haram.mp4"
  },
  {
    id: "sabah_misbah",
    name: "Sabah Misbah",
    rarity: "rare",
    priceCoins: 600,
    animationType: "sunrise_sweep",
    description: "Amber beads with sunrise sweep on combo taps",
    thumbUrl: "/tasbih-thumbs/sabah_misbah.png",
    previewUrl: "/tasbih-previews/sabah_misbah.mp4"
  },
  {
    id: "zulfiqar_black",
    name: "Zulfiqar Black",
    rarity: "rare",
    priceCoins: 800,
    animationType: "ring_ripple",
    description: "Matte onyx beads with minimal ring ripple",
    thumbUrl: "/tasbih-thumbs/zulfiqar_black.png",
    previewUrl: "/tasbih-previews/zulfiqar_black.mp4"
  },
  {
    id: "barakah_gold",
    name: "Barakah Gold",
    rarity: "epic",
    priceCoins: 1000,
    animationType: "halo_ring",
    description: "Brushed gold beads with halo ring on milestones (33/99)",
    thumbUrl: "/tasbih-thumbs/barakah_gold.png",
    previewUrl: "/tasbih-previews/barakah_gold.mp4"
  },
  {
    id: "ayatul_noor",
    name: "Ayatul Noor",
    rarity: "epic",
    priceCoins: 1200,
    animationType: "light_trace",
    description: "Calligraphy micro-etch with light trace follows bead",
    thumbUrl: "/tasbih-thumbs/ayatul_noor.png",
    previewUrl: "/tasbih-previews/ayatul_noor.mp4"
  },
  {
    id: "rawdah_garden",
    name: "Rawdah Garden",
    rarity: "legendary",
    priceCoins: 1500,
    animationType: "leaf_petal_burst",
    description: "Olive green with rose separators, leaf-petal burst",
    thumbUrl: "/tasbih-thumbs/rawdah_garden.png",
    previewUrl: "/tasbih-previews/rawdah_garden.mp4"
  },
  {
    id: "lailatul_qadr",
    name: "Lailatul Qadr",
    rarity: "legendary",
    priceCoins: 1800,
    animationType: "star_sparkle",
    description: "Night-sky beads with star sparkle trail on tap",
    thumbUrl: "/tasbih-thumbs/lailatul_qadr.png",
    previewUrl: "/tasbih-previews/lailatul_qadr.mp4"
  }
];

export async function seedTasbihSkins() {
  try {
    console.log("Seeding tasbih skins...");
    
    for (const skinData of tasbihSkinData) {
      await db.insert(tasbihSkins).values(skinData).onConflictDoNothing();
    }
    
    console.log("Tasbih skins seeded successfully!");
  } catch (error) {
    console.error("Error seeding tasbih skins:", error);
  }
}