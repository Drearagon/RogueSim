import { GameState } from '../../types/game';
import { ShopItem, PurchaseResult, ItemCategory } from './types';
import { getItemById, getItemsByCategory, ALL_SHOP_ITEMS } from './items';

export class ShopManager {
  private gameState: GameState;

  constructor(gameState: GameState) {
    this.gameState = gameState;
  }

  canAfford(itemId: string): boolean {
    const item = getItemById(itemId);
    return item ? this.gameState.credits >= item.price : false;
  }

  isOwned(itemId: string): boolean {
    const item = getItemById(itemId);
    if (!item) return false;

    switch (item.category) {
      case ItemCategory.HARDWARE:
        return this.gameState.inventory.hardware.includes(itemId);
      case ItemCategory.SOFTWARE:
        return this.gameState.inventory.software.includes(itemId);
      case ItemCategory.PAYLOAD:
        return this.gameState.inventory.payloads.includes(itemId);
      case ItemCategory.EXPLOIT:
      case ItemCategory.INTEL:
        return this.gameState.inventory.intel.includes(itemId);
      default:
        return false;
    }
  }

  meetsPrerequisites(itemId: string): boolean {
    const item = getItemById(itemId);
    if (!item || !item.prerequisites.length) return true;

    return item.prerequisites.every(prereq => {
      // Check if prerequisite is a command
      if (this.gameState.unlockedCommands.includes(prereq)) return true;
      
      // Check if prerequisite is an owned item
      return this.isOwned(prereq);
    });
  }

  canPurchase(itemId: string): boolean {
    return !this.isOwned(itemId) && 
           this.canAfford(itemId) && 
           this.meetsPrerequisites(itemId);
  }

  purchaseItem(itemId: string): PurchaseResult {
    const item = getItemById(itemId);
    
    if (!item) {
      return {
        success: false,
        message: 'Item not found'
      };
    }

    if (this.isOwned(itemId)) {
      return {
        success: false,
        message: 'You already own this item'
      };
    }

    if (!this.canAfford(itemId)) {
      return {
        success: false,
        message: `Insufficient credits. Need ${item.price}₵, have ${this.gameState.credits}₵`
      };
    }

    if (!this.meetsPrerequisites(itemId)) {
      return {
        success: false,
        message: 'Prerequisites not met'
      };
    }

    // Process purchase
    const result: PurchaseResult = {
      success: true,
      message: `Successfully purchased ${item.name}`
    };

    // Add to appropriate inventory
    switch (item.category) {
      case ItemCategory.HARDWARE:
        result.updatedInventory = [...this.gameState.inventory.hardware, itemId];
        break;
      case ItemCategory.SOFTWARE:
        result.updatedInventory = [...this.gameState.inventory.software, itemId];
        break;
      case ItemCategory.PAYLOAD:
        result.updatedInventory = [...this.gameState.inventory.payloads, itemId];
        break;
      case ItemCategory.EXPLOIT:
      case ItemCategory.INTEL:
        result.updatedInventory = [...this.gameState.inventory.intel, itemId];
        break;
    }

    // Add unlocked commands
    if (item.unlocks) {
      result.unlockedCommands = [...this.gameState.unlockedCommands, ...item.unlocks];
    }

    return result;
  }

  getAvailableItems(category?: ItemCategory): ShopItem[] {
    const items: ShopItem[] = category
      ? getItemsByCategory(category)
      : ALL_SHOP_ITEMS;

    return items.filter(item => this.meetsPrerequisites(item.id));
  }

  getRarityColor(rarity: string): string {
    switch (rarity) {
      case 'common': 
        return 'border-green-500/30 bg-green-900/10 text-green-300';
      case 'rare': 
        return 'border-blue-500/30 bg-blue-900/10 text-blue-300';
      case 'legendary': 
        return 'border-purple-500/30 bg-purple-900/10 text-purple-300';
      default: 
        return 'border-gray-500/30 bg-gray-900/10 text-gray-300';
    }
  }
}