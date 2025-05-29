import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GameState } from '../../types/game';
import { 
  getEnhancedItemsByCategory, 
  getEnhancedItemById, 
  EnhancedShopItem,
  ALL_ENHANCED_ITEMS 
} from '../../lib/shop/enhancedItems';
import { 
  ShoppingCart, 
  Zap, 
  Shield, 
  Cpu, 
  Eye, 
  Users,
  Skull,
  Lock,
  Unlock,
  ChevronRight,
  X,
  Check,
  AlertTriangle,
  Info,
  Star,
  Coins
} from 'lucide-react';

interface EnhancedShopInterfaceProps {
  gameState: GameState;
  onUpdateGameState: (updates: Partial<GameState>) => void;
  onClose: () => void;
}

type ShopTab = 'hardware' | 'software' | 'payload' | 'blackmarket';

export function EnhancedShopInterface({ gameState, onUpdateGameState, onClose }: EnhancedShopInterfaceProps) {
  const [activeTab, setActiveTab] = useState<ShopTab>('software');
  const [selectedItem, setSelectedItem] = useState<EnhancedShopItem | null>(null);
  const [cart, setCart] = useState<string[]>([]);

  const isOwned = (item: EnhancedShopItem): boolean => {
    if (item.payload) {
      return gameState.narrativeChoices?.includes(item.payload) || false;
    }
    if (item.unlocks) {
      return item.unlocks.every(cmd => gameState.unlockedCommands?.includes(cmd) || false);
    }
    return false;
  };

  const meetsPrerequisites = (item: EnhancedShopItem): boolean => {
    if (!item.prerequisites || item.prerequisites.length === 0) return true;
    
    return item.prerequisites.every(prereq => {
      const prereqItem = ALL_ENHANCED_ITEMS.find(i => i.id === prereq);
      if (prereqItem) {
        return isOwned(prereqItem);
      }
      return gameState.unlockedCommands?.includes(prereq) || false;
    });
  };

  const meetsRequirements = (item: EnhancedShopItem): boolean => {
    const hasCredits = gameState.credits >= item.price;
    const hasMissions = gameState.completedMissions >= (item.requiredMissions || 0);
    const hasPrereqs = meetsPrerequisites(item);
    
    return hasCredits && hasMissions && hasPrereqs && !isOwned(item);
  };

  const handlePurchase = (item: EnhancedShopItem) => {
    if (!meetsRequirements(item)) return;

    const updates: Partial<GameState> = {
      credits: gameState.credits - item.price
    };

    // Add to inventory
    if (!gameState.inventory) {
      updates.inventory = { hardware: [], software: [], payloads: [], intel: [] };
    } else {
      updates.inventory = { ...gameState.inventory };
    }

    switch (item.category) {
      case 'hardware':
        updates.inventory.hardware = [...(gameState.inventory?.hardware || []), item.id];
        break;
      case 'software':
        updates.inventory.software = [...(gameState.inventory?.software || []), item.id];
        break;
      case 'payload':
        updates.inventory.payloads = [...(gameState.inventory?.payloads || []), item.id];
        if (item.payload) {
          updates.narrativeChoices = [...(gameState.narrativeChoices || []), item.payload];
        }
        break;
      case 'exploit':
      case 'intel':
        updates.inventory.intel = [...(gameState.inventory?.intel || []), item.id];
        break;
    }

    // Unlock commands
    if (item.unlocks) {
      updates.unlockedCommands = [...(gameState.unlockedCommands || []), ...item.unlocks];
    }

    onUpdateGameState(updates);
    setSelectedItem(null);
  };

  const getRarityColor = (rarity: string): string => {
    switch (rarity) {
      case 'common': return 'border-green-500/50 bg-green-900/20 text-green-300';
      case 'rare': return 'border-blue-500/50 bg-blue-900/20 text-blue-300';
      case 'epic': return 'border-purple-500/50 bg-purple-900/20 text-purple-300';
      case 'legendary': return 'border-yellow-500/50 bg-yellow-900/20 text-yellow-300';
      default: return 'border-gray-500/50 bg-gray-900/20 text-gray-300';
    }
  };

  const getRarityStars = (rarity: string): number => {
    switch (rarity) {
      case 'common': return 1;
      case 'rare': return 2;
      case 'epic': return 3;
      case 'legendary': return 4;
      default: return 1;
    }
  };

  const TAB_CONFIG = [
    { id: 'software' as const, label: 'Software', icon: Cpu, description: 'Exploitation Tools' },
    { id: 'hardware' as const, label: 'Hardware', icon: Shield, description: 'Physical Devices' },
    { id: 'payload' as const, label: 'Payloads', icon: Zap, description: 'Attack Payloads' },
    { id: 'blackmarket' as const, label: 'Black Market', icon: Skull, description: 'Illegal Items' }
  ];

  const currentItems = getEnhancedItemsByCategory(activeTab);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex"
      onClick={onClose}
    >
      {/* Sidebar Navigation */}
      <motion.div
        initial={{ x: -300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: -300, opacity: 0 }}
        className="bg-black/95 border-r border-green-500/30 w-80 p-6 backdrop-blur-md overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-green-400 font-mono">ENHANCED SHOP</h2>
            <p className="text-green-300/60 text-sm font-mono">Professional Tools</p>
          </div>
          <button 
            onClick={onClose} 
            className="text-green-400 hover:text-green-300 transition-colors p-1"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Currency Display */}
        <div className="mb-6 p-4 rounded-lg bg-green-900/20 border border-green-500/30">
          <div className="flex justify-between items-center mb-2">
            <span className="text-green-300 text-sm font-mono">Credits</span>
            <span className="font-bold text-green-400 text-lg font-mono">{gameState.credits.toLocaleString()}₵</span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-green-300 text-sm font-mono">Missions</span>
            <span className="font-bold text-green-400 text-lg font-mono">{gameState.completedMissions}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-green-300 text-sm font-mono">Items Owned</span>
            <span className="font-bold text-green-400 text-lg font-mono">
              {(gameState.inventory?.hardware?.length || 0) + 
               (gameState.inventory?.software?.length || 0) + 
               (gameState.inventory?.payloads?.length || 0) + 
               (gameState.inventory?.intel?.length || 0)}
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="space-y-2 mb-6">
          {TAB_CONFIG.map(({ id, label, icon: Icon, description }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all font-mono ${
                activeTab === id
                  ? 'bg-green-900/30 border border-green-500/50 text-green-400'
                  : 'bg-gray-900/30 border border-gray-600/30 text-green-300 hover:bg-green-900/20'
              }`}
            >
              <Icon className="w-5 h-5" />
              <div className="text-left flex-1">
                <div className="font-medium">{label}</div>
                <div className="text-xs opacity-70">{description}</div>
              </div>
              <ChevronRight className="w-4 h-4" />
            </button>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="p-4 rounded-lg bg-gray-900/30 border border-gray-600/30">
          <h3 className="text-green-400 font-mono font-bold mb-3">Quick Stats</h3>
          <div className="space-y-2 text-sm font-mono">
            <div className="flex justify-between">
              <span className="text-green-300">Available Items:</span>
              <span className="text-green-400">{currentItems.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-green-300">Affordable:</span>
              <span className="text-green-400">
                {currentItems.filter(item => gameState.credits >= item.price).length}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-green-300">Unlocked:</span>
              <span className="text-green-400">
                {currentItems.filter(item => meetsRequirements(item)).length}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content Area */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 50 }}
        className="flex-1 p-6 overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-green-400 font-mono">
                {TAB_CONFIG.find(tab => tab.id === activeTab)?.label.toUpperCase()}
              </h1>
              <p className="text-green-300/70 font-mono">
                {TAB_CONFIG.find(tab => tab.id === activeTab)?.description}
              </p>
            </div>
            <div className="text-right">
              <div className="text-green-400 font-mono text-lg font-bold">
                {currentItems.length} Items Available
              </div>
              <div className="text-green-300/70 font-mono text-sm">
                {currentItems.filter(item => meetsRequirements(item)).length} Ready to Purchase
              </div>
            </div>
          </div>

          {/* Items Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentItems.map((item) => {
              const owned = isOwned(item);
              const canPurchase = meetsRequirements(item);
              const hasPrereqs = meetsPrerequisites(item);
              const hasCredits = gameState.credits >= item.price;
              const hasMissions = gameState.completedMissions >= (item.requiredMissions || 0);

              return (
                <motion.div
                  key={item.id}
                  layout
                  className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                    owned 
                      ? 'border-green-500/50 bg-green-900/20' 
                      : canPurchase
                      ? getRarityColor(item.rarity)
                      : 'border-gray-600/50 bg-gray-900/20 opacity-60'
                  }`}
                  onClick={() => setSelectedItem(item)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className={`p-2 rounded-lg ${
                      owned ? 'bg-green-500/20' : canPurchase ? 'bg-blue-500/20' : 'bg-gray-500/20'
                    }`}>
                      <item.icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-mono font-bold text-sm">{item.name}</h3>
                        {owned && <Check className="w-4 h-4 text-green-400" />}
                      </div>
                      <div className="flex items-center gap-1 mb-2">
                        {Array.from({ length: getRarityStars(item.rarity) }).map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-current" />
                        ))}
                        <span className="text-xs font-mono ml-1 capitalize">{item.rarity}</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs font-mono text-gray-300 mb-3 line-clamp-2">
                    {item.description}
                  </p>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-yellow-400 font-mono font-bold">
                        {item.price.toLocaleString()}₵
                      </span>
                      <div className="flex items-center gap-1 text-xs">
                        {!hasCredits && <AlertTriangle className="w-3 h-3 text-red-400" />}
                        {!hasMissions && <Lock className="w-3 h-3 text-orange-400" />}
                        {!hasPrereqs && <Info className="w-3 h-3 text-blue-400" />}
                      </div>
                    </div>

                    {item.requiredMissions && item.requiredMissions > 0 && (
                      <div className="text-xs font-mono text-gray-400">
                        Requires {item.requiredMissions} missions
                      </div>
                    )}

                    {item.unlocks && item.unlocks.length > 0 && (
                      <div className="text-xs font-mono text-green-400">
                        Unlocks: {item.unlocks.slice(0, 2).join(', ')}
                        {item.unlocks.length > 2 && '...'}
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Item Detail Modal */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-60 flex items-center justify-center p-4"
            onClick={() => setSelectedItem(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-black border-2 border-green-500/50 rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="p-3 rounded-lg bg-green-500/20">
                  <selectedItem.icon className="w-8 h-8 text-green-400" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-green-400 font-mono mb-2">
                    {selectedItem.name}
                  </h2>
                  <div className="flex items-center gap-2 mb-2">
                    {Array.from({ length: getRarityStars(selectedItem.rarity) }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current text-yellow-400" />
                    ))}
                    <span className="text-sm font-mono capitalize text-gray-300">
                      {selectedItem.rarity}
                    </span>
                  </div>
                  <p className="text-green-300 font-mono text-sm">
                    {selectedItem.description}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-gray-900/50 border border-gray-600/30">
                  <h3 className="text-green-400 font-mono font-bold mb-2">Functionality</h3>
                  <p className="text-green-300 font-mono text-sm">
                    {selectedItem.functionality}
                  </p>
                </div>

                {selectedItem.unlocks && selectedItem.unlocks.length > 0 && (
                  <div className="p-4 rounded-lg bg-blue-900/20 border border-blue-500/30">
                    <h3 className="text-blue-400 font-mono font-bold mb-2">Unlocks Commands</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedItem.unlocks.map(cmd => (
                        <span key={cmd} className="px-2 py-1 bg-blue-500/20 rounded text-blue-300 font-mono text-xs">
                          {cmd}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedItem.prerequisites && selectedItem.prerequisites.length > 0 && (
                  <div className="p-4 rounded-lg bg-orange-900/20 border border-orange-500/30">
                    <h3 className="text-orange-400 font-mono font-bold mb-2">Prerequisites</h3>
                    <div className="space-y-1">
                      {selectedItem.prerequisites.map(prereq => {
                        const prereqItem = ALL_ENHANCED_ITEMS.find(i => i.id === prereq);
                        const hasPrereq = prereqItem ? isOwned(prereqItem) : gameState.unlockedCommands?.includes(prereq);
                        return (
                          <div key={prereq} className="flex items-center gap-2">
                            {hasPrereq ? (
                              <Check className="w-4 h-4 text-green-400" />
                            ) : (
                              <X className="w-4 h-4 text-red-400" />
                            )}
                            <span className={`font-mono text-sm ${hasPrereq ? 'text-green-300' : 'text-red-300'}`}>
                              {prereqItem?.name || prereq}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between p-4 rounded-lg bg-green-900/20 border border-green-500/30">
                  <div>
                    <div className="text-2xl font-bold text-yellow-400 font-mono">
                      {selectedItem.price.toLocaleString()}₵
                    </div>
                    {selectedItem.requiredMissions && selectedItem.requiredMissions > 0 && (
                      <div className="text-sm font-mono text-gray-400">
                        Requires {selectedItem.requiredMissions} completed missions
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => handlePurchase(selectedItem)}
                    disabled={!meetsRequirements(selectedItem)}
                    className={`px-6 py-3 rounded-lg font-mono font-bold transition-all ${
                      isOwned(selectedItem)
                        ? 'bg-green-500/20 text-green-400 cursor-not-allowed'
                        : meetsRequirements(selectedItem)
                        ? 'bg-green-500 text-black hover:bg-green-400'
                        : 'bg-gray-500/20 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {isOwned(selectedItem) ? 'OWNED' : meetsRequirements(selectedItem) ? 'PURCHASE' : 'LOCKED'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
} 