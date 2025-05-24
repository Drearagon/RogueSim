import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GameState } from '../../types/game';
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
  Wifi,
  HardDrive,
  Database,
  Bug,
  Key
} from 'lucide-react';

interface ModernShopInterfaceProps {
  gameState: GameState;
  onUpdateGameState: (updates: Partial<GameState>) => void;
  onClose: () => void;
}

type ShopTab = 'software' | 'hardware' | 'skills' | 'blackmarket';

interface ShopItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  unlocks?: string[];
  payload?: string;
  icon: React.ComponentType<any>;
  rarity: 'common' | 'rare' | 'legendary';
  prerequisites?: string[];
}

// Clean, organized item data
const SHOP_DATA = {
  software: [
    {
      id: 'basic_payload',
      name: 'Basic Payload',
      description: 'Simple injection payload for basic targets',
      price: 200,
      category: 'software',
      payload: 'payload_basic',
      icon: Eye,
      rarity: 'common' as const,
      prerequisites: []
    },
    {
      id: 'stealth_payload',
      name: 'Stealth Payload',
      description: 'Advanced evasion and persistence capabilities',
      price: 500,
      category: 'software',
      payload: 'payload_stealth',
      icon: Shield,
      rarity: 'rare' as const,
      prerequisites: ['basic_payload']
    },
    {
      id: 'data_extractor',
      name: 'Data Extractor',
      description: 'Specialized data exfiltration tool',
      price: 750,
      category: 'software',
      unlocks: ['extract_data', 'file_recovery'],
      icon: HardDrive,
      rarity: 'rare' as const,
      prerequisites: []
    }
  ],
  hardware: [
    {
      id: 'wifi_adapter',
      name: 'High-Gain WiFi Adapter',
      description: 'Extended range wireless scanning capabilities',
      price: 800,
      category: 'hardware',
      unlocks: ['extended_scan', 'wifi_monitor'],
      icon: Wifi,
      rarity: 'common' as const,
      prerequisites: []
    },
    {
      id: 'esp32_dev',
      name: 'ESP32 Dev Board',
      description: 'Advanced IoT hacking capabilities',
      price: 300,
      category: 'hardware',
      unlocks: ['iot_hack', 'sensor_spoof'],
      icon: Cpu,
      rarity: 'common' as const,
      prerequisites: []
    },
    {
      id: 'usb_killer',
      name: 'USB Killer v4',
      description: 'Disable target systems via USB ports',
      price: 1200,
      category: 'hardware',
      unlocks: ['usb_attack', 'device_disable'],
      icon: Zap,
      rarity: 'rare' as const,
      prerequisites: ['wifi_adapter']
    }
  ],
  blackmarket: [
    {
      id: 'zero_day',
      name: 'Zero-Day Exploit',
      description: 'Unpatched vulnerability exploit for critical systems',
      price: 2500,
      category: 'exploit',
      unlocks: ['zero_day_attack', 'system_compromise'],
      icon: Bug,
      rarity: 'legendary' as const,
      prerequisites: ['stealth_payload']
    },
    {
      id: 'corp_database',
      name: 'Corporate Database Access',
      description: 'Leaked corporate credentials and internal documentation',
      price: 5000,
      category: 'intel',
      unlocks: ['corp_access', 'insider_info'],
      icon: Database,
      rarity: 'legendary' as const,
      prerequisites: ['data_extractor']
    },
    {
      id: 'gov_backdoor',
      name: 'Government Backdoor',
      description: 'Classified government system access codes',
      price: 10000,
      category: 'exploit',
      unlocks: ['gov_access', 'classified_data'],
      icon: Lock,
      rarity: 'legendary' as const,
      prerequisites: ['zero_day', 'corp_database']
    }
  ]
};

export function ModernShopInterface({ gameState, onUpdateGameState, onClose }: ModernShopInterfaceProps) {
  const [activeTab, setActiveTab] = useState<ShopTab>('software');
  const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null);

  // Shop logic functions
  const isOwned = (item: ShopItem): boolean => {
    if (item.payload) {
      return gameState.narrativeChoices.includes(item.payload);
    }
    if (item.unlocks) {
      return item.unlocks.every(cmd => gameState.unlockedCommands.includes(cmd));
    }
    return false;
  };

  const meetsPrerequisites = (item: ShopItem): boolean => {
    if (!item.prerequisites || item.prerequisites.length === 0) return true;
    
    return item.prerequisites.every(prereq => {
      // Check if it's another item that's owned
      const allItems = [...SHOP_DATA.software, ...SHOP_DATA.hardware, ...SHOP_DATA.blackmarket];
      const prereqItem = allItems.find(i => i.id === prereq);
      if (prereqItem) {
        return isOwned(prereqItem);
      }
      // Check if it's a command that's unlocked
      return gameState.unlockedCommands.includes(prereq);
    });
  };

  const canPurchase = (item: ShopItem): boolean => {
    return !isOwned(item) && 
           gameState.credits >= item.price && 
           meetsPrerequisites(item);
  };

  const handlePurchase = (item: ShopItem) => {
    if (!canPurchase(item)) return;

    const updates: Partial<GameState> = {
      credits: gameState.credits - item.price
    };

    if (item.payload) {
      updates.narrativeChoices = [...gameState.narrativeChoices, item.payload];
    }

    if (item.unlocks) {
      updates.unlockedCommands = [...gameState.unlockedCommands, ...item.unlocks];
    }

    onUpdateGameState(updates);
    setSelectedItem(null);
  };

  const getRarityColor = (rarity: string): string => {
    switch (rarity) {
      case 'common': return 'border-green-500/30 bg-green-900/10 text-green-300';
      case 'rare': return 'border-blue-500/30 bg-blue-900/10 text-blue-300';
      case 'legendary': return 'border-purple-500/30 bg-purple-900/10 text-purple-300';
      default: return 'border-gray-500/30 bg-gray-900/10 text-gray-300';
    }
  };

  const TAB_CONFIG = [
    { id: 'software' as const, label: 'Software', icon: Cpu, description: 'Tools & Payloads' },
    { id: 'hardware' as const, label: 'Hardware', icon: Shield, description: 'Physical Devices' },
    { id: 'skills' as const, label: 'Skills', icon: Zap, description: 'Ability Upgrades' },
    { id: 'blackmarket' as const, label: 'Black Market', icon: Skull, description: 'Illegal Items' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex flex-col md:flex-row"
      onClick={onClose}
    >
      {/* Navigation Sidebar - Mobile: Top, Desktop: Left */}
      <motion.div
        initial={{ x: -300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: -300, opacity: 0 }}
        className="bg-black/95 border-b md:border-r md:border-b-0 border-green-500/30 w-full md:w-80 p-4 md:p-6 backdrop-blur-md overflow-y-auto max-h-64 md:max-h-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-green-400">Shop Interface</h2>
            <p className="text-green-300/60 text-sm">Secure marketplace</p>
          </div>
          <button onClick={onClose} className="text-green-400 hover:text-green-300 p-1">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Currency Display */}
        <div className="mb-6 p-4 rounded-lg bg-green-900/20 border border-green-500/30">
          <div className="flex justify-between items-center mb-2">
            <span className="text-green-300 text-sm">Credits</span>
            <span className="font-bold text-green-400 text-lg">{gameState.credits}₵</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-green-300 text-sm">Skill Points</span>
            <span className="font-bold text-green-400 text-lg">{gameState.skillTree.skillPoints}</span>
          </div>
        </div>

        {/* Tab Navigation - Mobile: Horizontal scroll, Desktop: Vertical */}
        <div className="space-y-2">
          <h3 className="text-green-400 text-sm font-semibold mb-3 uppercase tracking-wider hidden md:block">
            Categories
          </h3>
          
          {/* Mobile: Horizontal scrolling tabs */}
          <div className="flex md:hidden gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
            {TAB_CONFIG.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex-shrink-0 flex items-center gap-2 px-4 py-3 rounded-lg transition-all ${
                  activeTab === id
                    ? 'bg-green-900/40 border border-green-500/50 text-green-400'
                    : 'bg-gray-900/30 border border-gray-600/30 text-green-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium whitespace-nowrap">{label}</span>
              </button>
            ))}
          </div>

          {/* Desktop: Vertical tabs */}
          <div className="hidden md:block space-y-2">
            {TAB_CONFIG.map(({ id, label, icon: Icon, description }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`w-full flex items-center gap-3 p-4 rounded-lg transition-all group ${
                  activeTab === id
                    ? 'bg-green-900/40 border border-green-500/50 text-green-400'
                    : 'bg-gray-900/30 border border-gray-600/30 text-green-300 hover:bg-green-900/20'
                }`}
              >
                <div className={`p-2 rounded-lg ${
                  activeTab === id ? 'bg-green-600' : 'bg-gray-700 group-hover:bg-green-700'
                }`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-medium">{label}</div>
                  <div className="text-xs opacity-70">{description}</div>
                </div>
                <ChevronRight className={`w-4 h-4 transition-transform ${
                  activeTab === id ? 'rotate-90' : 'group-hover:translate-x-1'
                }`} />
              </button>
            ))}
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
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <h3 className="text-2xl font-bold text-green-400 capitalize">
              {activeTab === 'blackmarket' ? 'Black Market' : activeTab}
            </h3>
            
            {activeTab === 'skills' ? (
              <div className="text-green-300">
                <p>Skill upgrades are managed in the Skills interface.</p>
                <p className="text-sm text-green-300/70 mt-2">
                  Use the 'skills' command to access the skill tree.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                {SHOP_DATA[activeTab]?.map((item) => {
                  const owned = isOwned(item);
                  const canAfford = gameState.credits >= item.price;
                  const meetsPrereqs = meetsPrerequisites(item);
                  const purchasable = canPurchase(item);
                  const IconComponent = item.icon;
                  
                  return (
                    <motion.div
                      key={item.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`p-3 md:p-4 rounded-lg border-2 cursor-pointer transition-all min-h-[160px] touch-manipulation ${
                        owned 
                          ? 'border-green-400/50 bg-green-900/20' 
                          : getRarityColor(item.rarity)
                      } ${selectedItem?.id === item.id ? 'ring-2 ring-green-400/50' : ''}`}
                      onClick={() => setSelectedItem(selectedItem?.id === item.id ? null : item)}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`p-2 rounded-lg ${owned ? 'bg-green-600' : 'bg-gray-700'}`}>
                          <IconComponent className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className={`font-semibold ${owned ? 'text-green-400' : 'text-green-300'}`}>
                            {item.name}
                          </h4>
                          <p className="text-sm text-green-300/60 capitalize">{item.rarity}</p>
                        </div>
                        {owned && <Unlock className="w-5 h-5 text-green-400" />}
                      </div>

                      <p className="text-sm text-green-300/80 mb-3">{item.description}</p>

                      {!meetsPrereqs && item.prerequisites && (
                        <div className="mb-3 p-2 rounded bg-red-900/20 border border-red-500/30">
                          <p className="text-xs text-red-400">
                            Requires: {item.prerequisites.join(', ')}
                          </p>
                        </div>
                      )}

                      <div className="flex justify-between items-center">
                        <span className={`font-bold ${canAfford ? 'text-green-400' : 'text-red-400'}`}>
                          {item.price}₵
                        </span>
                        
                        {!owned && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (purchasable) handlePurchase(item);
                            }}
                            disabled={!purchasable}
                            className={`shop-button px-3 py-2 rounded text-sm font-medium transition-colors ${
                              purchasable
                                ? 'bg-green-600 hover:bg-green-500 text-white'
                                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                            }`}
                          >
                            {!canAfford ? 'Insufficient Credits' : 
                             !meetsPrereqs ? 'Prerequisites' : 'Buy'}
                          </button>
                        )}
                      </div>

                      {item.unlocks && (
                        <div className="mt-3 pt-3 border-t border-gray-700">
                          <p className="text-xs text-green-400/70 mb-1">Unlocks:</p>
                          <div className="flex flex-wrap gap-1">
                            {item.unlocks.map((unlock) => (
                              <span key={unlock} className="text-xs px-2 py-1 bg-green-900/30 text-green-400 rounded">
                                {unlock}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}