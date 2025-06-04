import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GameState } from '../types/game';
import { purchaseSkill, canPurchaseSkill, skillCommandUnlocks } from '../lib/skillSystem';
import { HARDWARE_ITEMS, SOFTWARE_ITEMS, BLACKMARKET_ITEMS } from '../lib/shop/items';
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
  X
} from 'lucide-react';

interface ShopInterfaceProps {
  gameState: GameState;
  onUpdateGameState: (updates: Partial<GameState>) => void;
  onClose: () => void;
}

type ShopTab = 'hardware' | 'software' | 'skills' | 'blackmarket';

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
}

const hardwareItems: ShopItem[] = [
  {
    id: 'esp32_dev',
    name: 'ESP32 Dev Board',
    description: 'Advanced IoT hacking capabilities',
    price: 300,
    category: 'hardware',
    unlocks: ['iot_hack'],
    icon: Cpu,
    rarity: 'common' as const
  },
  {
    id: 'wifi_adapter',
    name: 'High-Gain WiFi Adapter',
    description: 'Extended range wireless scanning capabilities',
    price: 800,
    category: 'hardware',
    unlocks: ['extended_scan'],
    icon: Shield,
    rarity: 'common' as const
  },
  {
    id: 'usb_killer',
    name: 'USB Killer v4',
    description: 'Disable target systems via USB ports',
    price: 1200,
    category: 'hardware',
    unlocks: ['usb_attack'],
    icon: Zap,
    rarity: 'rare' as const
  }
].sort((a, b) => a.price - b.price);

const softwareItems: ShopItem[] = [
  {
    id: 'basic_payload',
    name: 'Basic Payload',
    description: 'Simple injection payload for basic targets',
    price: 200,
    category: 'software',
    payload: 'payload_basic',
    icon: Eye,
    rarity: 'common' as const
  },
  {
    id: 'stealth_payload',
    name: 'Stealth Payload',
    description: 'Advanced evasion and persistence',
    price: 500,
    category: 'software',
    payload: 'payload_stealth',
    icon: Shield,
    rarity: 'rare' as const
  },
  {
    id: 'data_extractor',
    name: 'Data Extractor',
    description: 'Specialized data exfiltration tool',
    price: 750,
    category: 'software',
    payload: 'payload_extract',
    icon: Zap,
    rarity: 'rare' as const
  }
].sort((a, b) => a.price - b.price);

const blackMarketItems: ShopItem[] = [
  {
    id: 'zero_day',
    name: 'Zero-Day Exploit',
    description: 'Unpatched vulnerability exploit',
    price: 2500,
    category: 'exploit',
    unlocks: ['zero_day_attack'],
    icon: Skull,
    rarity: 'legendary' as const
  },
  {
    id: 'corp_database',
    name: 'Corporate Database Access',
    description: 'Leaked corporate credentials and intel',
    price: 5000,
    category: 'intel',
    unlocks: ['corp_access'],
    icon: Lock,
    rarity: 'legendary' as const
  },
  {
    id: 'gov_backdoor',
    name: 'Government Backdoor',
    description: 'Classified government system access',
    price: 10000,
    category: 'exploit',
    unlocks: ['gov_access'],
    icon: Users,
    rarity: 'legendary' as const
  }
].sort((a, b) => a.price - b.price);

export function ShopInterface({ gameState, onUpdateGameState, onClose }: ShopInterfaceProps) {
  const [activeTab, setActiveTab] = useState<ShopTab>('software');
  const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null);

  const handlePurchase = (item: ShopItem) => {
    if (gameState.credits < item.price) return;

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

  const isOwned = (item: ShopItem) => {
    if (item.payload) {
      return gameState.narrativeChoices.includes(item.payload);
    }
    if (item.unlocks) {
      return item.unlocks.every(cmd => gameState.unlockedCommands.includes(cmd));
    }
    return false;
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'border-green-500/30 bg-green-900/10';
      case 'rare': return 'border-blue-500/30 bg-blue-900/10';
      case 'legendary': return 'border-purple-500/30 bg-purple-900/10';
      default: return 'border-gray-500/30 bg-gray-900/10';
    }
  };

  const handleSkillPurchase = (skillId: string) => {
    const canPurchase = canPurchaseSkill(skillId, gameState.skillTree);
    if (canPurchase.canPurchase) {
      const result = purchaseSkill(skillId, gameState.skillTree);
      onUpdateGameState({ 
        skillTree: result.skillTree,
        unlockedCommands: [
          ...gameState.unlockedCommands,
          ...result.unlockedCommands
        ]
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex"
      onClick={onClose}
    >
      <motion.div
        initial={{ x: -300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: -300, opacity: 0 }}
        className="bg-black/90 border-r border-green-500/30 w-80 p-6 backdrop-blur-md overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-green-400">Shop Interface</h2>
          <button onClick={onClose} className="text-green-400 hover:text-green-300">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-green-300 text-sm">Credits: <span className="font-bold text-green-400">{gameState.credits}₵</span></p>
          <p className="text-green-300 text-sm">Skill Points: <span className="font-bold text-green-400">{gameState.skillTree.skillPoints}</span></p>
        </div>

        {/* Tab Navigation */}
        <div className="space-y-2 mb-6">
          {[
            { id: 'software', label: 'Software', icon: Cpu },
            { id: 'hardware', label: 'Hardware', icon: Shield },
            { id: 'skills', label: 'Skills', icon: Zap },
            { id: 'blackmarket', label: 'Black Market', icon: Skull }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as ShopTab)}
              className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
                activeTab === id
                  ? 'bg-green-900/30 border border-green-500/50 text-green-400'
                  : 'bg-gray-900/30 border border-gray-600/30 text-green-300 hover:bg-green-900/20'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{label}</span>
              <ChevronRight className="w-4 h-4 ml-auto" />
            </button>
          ))}
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
          {activeTab === 'software' && (
            <ShopTabContent
              key="software"
              title="Software & Payloads"
              items={softwareItems}
              gameState={gameState}
              onPurchase={handlePurchase}
              onSelectItem={setSelectedItem}
              selectedItem={selectedItem}
              isOwned={isOwned}
              getRarityColor={getRarityColor}
            />
          )}
          
          {activeTab === 'hardware' && (
            <ShopTabContent
              key="hardware"
              title="Hardware Upgrades"
              items={hardwareItems}
              gameState={gameState}
              onPurchase={handlePurchase}
              onSelectItem={setSelectedItem}
              selectedItem={selectedItem}
              isOwned={isOwned}
              getRarityColor={getRarityColor}
            />
          )}

          {activeTab === 'skills' && (
            <SkillsTabContent
              key="skills"
              gameState={gameState}
              onUpdateGameState={onUpdateGameState}
            />
          )}

          {activeTab === 'blackmarket' && (
            <ShopTabContent
              key="blackmarket"
              title="Black Market"
              items={blackMarketItems}
              gameState={gameState}
              onPurchase={handlePurchase}
              onSelectItem={setSelectedItem}
              selectedItem={selectedItem}
              isOwned={isOwned}
              getRarityColor={getRarityColor}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

interface ShopTabContentProps {
  title: string;
  items: ShopItem[];
  gameState: GameState;
  onPurchase: (item: ShopItem) => void;
  onSelectItem: (item: ShopItem | null) => void;
  selectedItem: ShopItem | null;
  isOwned: (item: ShopItem) => boolean;
  getRarityColor: (rarity: string) => string;
}

function ShopTabContent({ 
  title, 
  items, 
  gameState, 
  onPurchase, 
  onSelectItem, 
  selectedItem,
  isOwned,
  getRarityColor 
}: ShopTabContentProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <h3 className="text-2xl font-bold text-green-400">{title}</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => {
          const owned = isOwned(item);
          const canAfford = gameState.credits >= item.price;
          const IconComponent = item.icon;
          
          return (
            <motion.div
              key={item.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                owned 
                  ? 'border-green-400/50 bg-green-900/20' 
                  : getRarityColor(item.rarity)
              } ${selectedItem?.id === item.id ? 'ring-2 ring-green-400/50' : ''}`}
              onClick={() => onSelectItem(selectedItem?.id === item.id ? null : item)}
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

              <div className="flex justify-between items-center">
                <span className={`font-bold ${canAfford ? 'text-green-400' : 'text-red-400'}`}>
                  {item.price}₵
                </span>
                
                {!owned && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (canAfford) onPurchase(item);
                    }}
                    disabled={!canAfford}
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                      canAfford
                        ? 'bg-green-600 hover:bg-green-500 text-white'
                        : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {canAfford ? 'Buy' : 'Insufficient Credits'}
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
    </motion.div>
  );
}

interface SkillsTabContentProps {
  gameState: GameState;
  onUpdateGameState: (updates: Partial<GameState>) => void;
}

function SkillsTabContent({ gameState, onUpdateGameState }: SkillsTabContentProps) {
  const handleSkillPurchase = (skillId: string) => {
    const canPurchase = canPurchaseSkill(skillId, gameState.skillTree);
    if (canPurchase.canPurchase) {
      const result = purchaseSkill(skillId, gameState.skillTree);
      onUpdateGameState({ 
        skillTree: result.skillTree,
        unlockedCommands: [
          ...gameState.unlockedCommands,
          ...result.unlockedCommands
        ]
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <h3 className="text-2xl font-bold text-green-400">Skill Upgrades</h3>
      <p className="text-green-300/80">
        Available Skill Points: <span className="font-bold text-green-400">{gameState.skillTree.skillPoints}</span>
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {gameState.skillTree.nodes
          .filter(skill => skill.unlocked)
          .map((skill) => {
            const canPurchase = canPurchaseSkill(skill.id, gameState.skillTree);
            const isPurchased = skill.purchased;
            
            return (
              <motion.div
                key={skill.id}
                whileHover={{ scale: 1.02 }}
                className={`p-4 rounded-lg border-2 transition-all ${
                  isPurchased
                    ? 'border-green-400/50 bg-green-900/20'
                    : canPurchase.canPurchase
                    ? 'border-green-500/50 bg-green-900/20 cursor-pointer'
                    : 'border-gray-600/30 bg-gray-900/20'
                }`}
                onClick={() => canPurchase.canPurchase && handleSkillPurchase(skill.id)}
              >
                <div className="flex items-center gap-3 mb-2">
                  <h4 className={`font-semibold ${isPurchased ? 'text-green-400' : 'text-green-300'}`}>
                    {skill.name}
                  </h4>
                  {isPurchased && <Unlock className="w-5 h-5 text-green-400" />}
                </div>
                
                <p className="text-sm text-green-300/70 mb-3">{skill.description}</p>
                
                {isPurchased && (
                  <div className="mb-3 p-2 bg-green-900/30 rounded border border-green-400/30">
                    <p className="text-xs text-green-400 font-medium">
                      ✓ SKILL ACQUIRED - Level {skill.currentLevel}/{skill.maxLevel}
                    </p>
                  </div>
                )}
                
                <div className="flex justify-between items-center">
                  <span className={`font-bold ${
                    isPurchased 
                      ? 'text-green-400' 
                      : canPurchase.canPurchase 
                      ? 'text-green-400' 
                      : 'text-gray-400'
                  }`}>
                    {skill.cost} SP
                  </span>
                  
                  {canPurchase.canPurchase && (
                    <button className="px-3 py-1 bg-green-600 hover:bg-green-500 text-white rounded text-sm font-medium transition-colors">
                      {isPurchased ? 'Upgrade' : 'Purchase'}
                    </button>
                  )}
                  
                  {!canPurchase.canPurchase && (
                    <span className="text-xs text-red-400">
                      {canPurchase.reason}
                    </span>
                  )}
                </div>

                {skill.bonuses && skill.bonuses.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-700">
                    <p className="text-xs text-green-400/70 mb-1">Bonuses:</p>
                    <div className="space-y-1">
                      {skill.bonuses.map((bonus, index) => (
                        <span key={index} className="text-xs px-2 py-1 bg-blue-900/30 text-blue-400 rounded block">
                          {bonus.description}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {skill.unlocks.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-700">
                    <p className="text-xs text-green-400/70 mb-1">Unlocks Skills:</p>
                    <div className="flex flex-wrap gap-1">
                      {skill.unlocks.map((unlock) => (
                        <span key={unlock} className="text-xs px-2 py-1 bg-green-900/30 text-green-400 rounded">
                          {unlock}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {skillCommandUnlocks[skill.id] && skillCommandUnlocks[skill.id].length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-700">
                    <p className="text-xs text-purple-400/70 mb-1">Unlocks Commands:</p>
                    <div className="flex flex-wrap gap-1">
                      {skillCommandUnlocks[skill.id].map((command) => (
                        <span key={command} className="text-xs px-2 py-1 bg-purple-900/30 text-purple-400 rounded">
                          {command}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
      </div>
      
      {gameState.skillTree.nodes.filter(skill => skill.unlocked).length === 0 && (
        <div className="text-center py-8">
          <p className="text-green-300/60">No skills available yet. Complete missions to unlock skills!</p>
        </div>
      )}
    </motion.div>
  );
}