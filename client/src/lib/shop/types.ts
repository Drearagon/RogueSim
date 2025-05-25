import { z } from 'zod';
import { LucideIcon } from 'lucide-react';

export enum ItemRarity {
  COMMON = 'common',
  RARE = 'rare',
  LEGENDARY = 'legendary'
}

export enum ItemCategory {
  HARDWARE = 'hardware',
  SOFTWARE = 'software',
  PAYLOAD = 'payload',
  EXPLOIT = 'exploit',
  INTEL = 'intel'
}

export const ShopItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  price: z.number().positive(),
  category: z.nativeEnum(ItemCategory),
  rarity: z.nativeEnum(ItemRarity),
  unlocks: z.array(z.string()).optional(),
  payload: z.string().optional(),
  prerequisites: z.array(z.string()).default([]),
  maxQuantity: z.number().positive().default(1),
  requiredMissions: z.number().default(0)
});

export type ShopItem = z.infer<typeof ShopItemSchema> & {
  icon: LucideIcon;
};

export interface PurchaseResult {
  success: boolean;
  message: string;
  updatedInventory?: string[];
  unlockedCommands?: string[];
}

export interface ShopContextType {
  items: ShopItem[];
  purchaseItem: (itemId: string) => PurchaseResult;
  isOwned: (itemId: string) => boolean;
  canAfford: (itemId: string) => boolean;
  meetsPrerequisites: (itemId: string) => boolean;
}