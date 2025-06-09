// @ts-nocheck
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Cpu, HardDrive, Wifi, Shield, Zap, Eye, Gamepad2, 
  Smartphone, Laptop, Router, Usb, Lock, Unlock,
  Star, TrendingUp, Award, Settings
} from 'lucide-react';
import { GameState } from '../types/GameState';

interface GearCustomizationProps {
  gameState: GameState;
  onUpdateGameState: (updates: Partial<GameState>) => void;
  onClose: () => void;
}

interface GearItem {
  id: string;
  name: string;
  category: 'hardware' | 'software' | 'peripheral' | 'enhancement';
  type: string;
  description: string;
  stats: {
    processing: number;
    stealth: number;
    detection: number;
    speed: number;
    reliability: number;
  };
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockRequirement: {
    level: number;
    missions?: number;
    reputation?: string;
    credits?: number;
  };
  price: number;
  icon: React.ComponentType<any>;
  skillBonus?: string[];
  isEquipped?: boolean;
  isOwned?: boolean;
}

interface CustomizationSlot {
  id: string;
  name: string;
  description: string;
  equippedItem?: GearItem;
  allowedTypes: string[];
}

export function GearCustomization({ gameState, onUpdateGameState, onClose }: GearCustomizationProps) {
  const [selectedSlot, setSelectedSlot] = useState<string>('cpu');
  const [selectedItem, setSelectedItem] = useState<GearItem | null>(null);
  const [activeTab, setActiveTab] = useState('loadout');

  const customizationSlots: CustomizationSlot[] = [
    {
      id: 'cpu',
      name: 'Processing Unit',
      description: 'Core computational power for complex operations',
      allowedTypes: ['cpu', 'quantum_core', 'neural_processor']
    },
    {
      id: 'memory',
      name: 'Memory Module',
      description: 'Data storage and quick access systems',
      allowedTypes: ['ram', 'ssd', 'quantum_storage']
    },
    {
      id: 'network',
      name: 'Network Interface',
      description: 'Connection and infiltration capabilities',
      allowedTypes: ['wifi_card', 'ethernet_adapter', 'mesh_node']
    },
    {
      id: 'security',
      name: 'Security Module',
      description: 'Protection and encryption systems',
      allowedTypes: ['firewall', 'vpn_chip', 'quantum_encryption']
    },
    {
      id: 'peripheral',
      name: 'Peripheral Device',
      description: 'Specialized hacking tools and accessories',
      allowedTypes: ['usb_toolkit', 'rfid_cloner', 'signal_analyzer']
    },
    {
      id: 'enhancement',
      name: 'System Enhancement',
      description: 'Performance boosters and special abilities',
      allowedTypes: ['overclocking_kit', 'cooling_system', 'power_amplifier']
    }
  ];

  const availableGear: GearItem[] = [
    {
      id: 'basic_cpu',
      name: 'Standard Processing Core',
      category: 'hardware',
      type: 'cpu',
      description: 'Basic computational unit for entry-level operations',
      stats: { processing: 60, stealth: 40, detection: 30, speed: 50, reliability: 70 },
      rarity: 'common',
      unlockRequirement: { level: 1 },
      price: 500,
      icon: Cpu,
      isOwned: true
    },
    {
      id: 'quantum_core',
      name: 'Quantum Processing Core',
      category: 'hardware',
      type: 'cpu',
      description: 'Advanced quantum computational capabilities',
      stats: { processing: 95, stealth: 80, detection: 70, speed: 90, reliability: 85 },
      rarity: 'legendary',
      unlockRequirement: { level: 15, missions: 25, reputation: 'Elite' },
      price: 15000,
      icon: Cpu,
      skillBonus: ['Quantum Decryption', 'Parallel Processing']
    },
    {
      id: 'stealth_ram',
      name: 'Stealth Memory Module',
      category: 'hardware',
      type: 'ram',
      description: 'Memory designed to avoid detection systems',
      stats: { processing: 70, stealth: 90, detection: 20, speed: 75, reliability: 80 },
      rarity: 'epic',
      unlockRequirement: { level: 8, missions: 10 },
      price: 3500,
      icon: HardDrive,
      skillBonus: ['Memory Obfuscation']
    },
    {
      id: 'mesh_adapter',
      name: 'Mesh Network Adapter',
      category: 'hardware',
      type: 'wifi_card',
      description: 'Connect to multiple networks simultaneously',
      stats: { processing: 50, stealth: 70, detection: 60, speed: 85, reliability: 75 },
      rarity: 'rare',
      unlockRequirement: { level: 5, credits: 1000 },
      price: 2000,
      icon: Wifi,
      skillBonus: ['Multi-Network Access']
    },
    {
      id: 'quantum_firewall',
      name: 'Quantum Firewall Chip',
      category: 'software',
      type: 'firewall',
      description: 'Ultimate protection using quantum encryption',
      stats: { processing: 60, stealth: 85, detection: 95, speed: 40, reliability: 95 },
      rarity: 'legendary',
      unlockRequirement: { level: 20, reputation: 'Legendary' },
      price: 25000,
      icon: Shield,
      skillBonus: ['Quantum Shield', 'Advanced Countermeasures']
    },
    {
      id: 'usb_toolkit',
      name: 'Universal USB Toolkit',
      category: 'peripheral',
      type: 'usb_toolkit',
      description: 'Multi-purpose USB device for various exploits',
      stats: { processing: 40, stealth: 60, detection: 80, speed: 70, reliability: 85 },
      rarity: 'rare',
      unlockRequirement: { level: 3 },
      price: 800,
      icon: Usb,
      skillBonus: ['USB Exploitation']
    }
  ];

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-400 border-gray-400';
      case 'rare': return 'text-blue-400 border-blue-400';
      case 'epic': return 'text-purple-400 border-purple-400';
      case 'legendary': return 'text-yellow-400 border-yellow-400';
      default: return 'text-green-400 border-green-400';
    }
  };

  const isItemUnlocked = (item: GearItem) => {
    const req = item.unlockRequirement;
    return (
      gameState.playerLevel >= req.level &&
      (!req.missions || (gameState.missionsCompleted || 0) >= req.missions) &&
      (!req.credits || gameState.credits >= req.credits) &&
      (!req.reputation || gameState.reputation === req.reputation)
    );
  };

  const canAffordItem = (item: GearItem) => {
    return gameState.credits >= item.price;
  };

  const handleEquipItem = (item: GearItem) => {
    // Add equipment logic here
    console.log('Equipping item:', item.name);
  };

  const handlePurchaseItem = (item: GearItem) => {
    if (canAffordItem(item) && isItemUnlocked(item)) {
      onUpdateGameState({
        credits: gameState.credits - item.price
      });
      // Mark item as owned
      item.isOwned = true;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-6xl bg-black/90 border-green-400 text-green-400 max-h-[90vh] overflow-hidden">
        <CardHeader className="border-b border-green-400">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3">
              <Settings className="h-6 w-6" />
              GEAR CUSTOMIZATION LAB
            </CardTitle>
            <button 
              onClick={onClose}
              className="text-green-400 hover:text-green-300 text-xl"
            >
              ×
            </button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3 bg-black border-b border-green-400">
              <TabsTrigger value="loadout" className="font-mono">LOADOUT</TabsTrigger>
              <TabsTrigger value="inventory" className="font-mono">INVENTORY</TabsTrigger>
              <TabsTrigger value="stats" className="font-mono">STATS</TabsTrigger>
            </TabsList>

            {/* Loadout Tab */}
            <TabsContent value="loadout" className="mt-0">
              <div className="grid grid-cols-1 lg:grid-cols-2 h-[600px]">
                {/* Equipment Slots */}
                <div className="border-r border-green-400 p-6">
                  <h3 className="text-lg font-mono mb-4 flex items-center gap-2">
                    <Gamepad2 className="h-5 w-5" />
                    EQUIPMENT SLOTS
                  </h3>
                  
                  <div className="space-y-3">
                    {customizationSlots.map((slot) => (
                      <Card 
                        key={slot.id}
                        className={`cursor-pointer transition-colors ${
                          selectedSlot === slot.id 
                            ? 'border-green-400 bg-green-400/10' 
                            : 'border-gray-600 hover:border-green-400/50'
                        }`}
                        onClick={() => setSelectedSlot(slot.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-mono font-bold text-sm">{slot.name}</h4>
                              <p className="text-xs text-green-400/70 mt-1">{slot.description}</p>
                            </div>
                            <div className="text-right">
                              {slot.equippedItem ? (
                                <Badge className={getRarityColor(slot.equippedItem.rarity)}>
                                  {slot.equippedItem.name}
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="border-gray-600 text-gray-400">
                                  EMPTY
                                </Badge>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Item Details */}
                <div className="p-6">
                  <h3 className="text-lg font-mono mb-4 flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    AVAILABLE ITEMS
                  </h3>

                  <div className="space-y-3 max-h-[500px] overflow-y-auto">
                    {availableGear
                      .filter(item => 
                        customizationSlots
                          .find(slot => slot.id === selectedSlot)
                          ?.allowedTypes.includes(item.type)
                      )
                      .map((item) => (
                        <Card 
                          key={item.id}
                          className={`cursor-pointer transition-colors ${
                            selectedItem?.id === item.id 
                              ? 'border-green-400 bg-green-400/10' 
                              : 'border-gray-600 hover:border-green-400/50'
                          }`}
                          onClick={() => setSelectedItem(item)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-3">
                                <item.icon className="h-6 w-6" />
                                <div>
                                  <h4 className="font-mono font-bold text-sm flex items-center gap-2">
                                    {item.name}
                                    <Badge className={getRarityColor(item.rarity)}>
                                      {item.rarity}
                                    </Badge>
                                  </h4>
                                  <p className="text-xs text-green-400/70 mt-1">{item.description}</p>
                                  
                                  {/* Stats Preview */}
                                  <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                                    <div>Processing: {item.stats.processing}%</div>
                                    <div>Stealth: {item.stats.stealth}%</div>
                                    <div>Detection: {item.stats.detection}%</div>
                                    <div>Speed: {item.stats.speed}%</div>
                                  </div>

                                  {/* Skill Bonuses */}
                                  {item.skillBonus && (
                                    <div className="mt-2">
                                      <span className="text-xs text-blue-400">Bonuses:</span>
                                      {item.skillBonus.map((bonus, index) => (
                                        <Badge key={index} variant="outline" className="ml-1 text-xs border-blue-400">
                                          {bonus}
                                        </Badge>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              <div className="text-right">
                                <div className="text-sm font-mono mb-2">{item.price} C</div>
                                <div className="space-y-1">
                                  {item.isOwned ? (
                                    <Button size="sm" className="bg-green-400 text-black">
                                      <Unlock className="h-3 w-3 mr-1" />
                                      EQUIP
                                    </Button>
                                  ) : isItemUnlocked(item) ? (
                                    canAffordItem(item) ? (
                                      <Button 
                                        size="sm" 
                                        variant="outline"
                                        onClick={() => handlePurchaseItem(item)}
                                        className="border-green-400"
                                      >
                                        BUY
                                      </Button>
                                    ) : (
                                      <Badge variant="outline" className="border-red-400 text-red-400">
                                        INSUFFICIENT CREDITS
                                      </Badge>
                                    )
                                  ) : (
                                    <Badge variant="outline" className="border-gray-600 text-gray-400">
                                      <Lock className="h-3 w-3 mr-1" />
                                      LOCKED
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Inventory Tab */}
            <TabsContent value="inventory" className="mt-0 p-6 h-[600px] overflow-y-auto">
              <h3 className="text-lg font-mono mb-4 flex items-center gap-2">
                <HardDrive className="h-5 w-5" />
                OWNED EQUIPMENT
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableGear.filter(item => item.isOwned).map((item) => (
                  <Card key={item.id} className="border-green-400">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <item.icon className="h-6 w-6" />
                        <div>
                          <h4 className="font-mono font-bold text-sm">{item.name}</h4>
                          <Badge className={getRarityColor(item.rarity)}>
                            {item.rarity}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span>Processing:</span>
                          <Progress value={item.stats.processing} className="w-16 h-2" />
                        </div>
                        <div className="flex justify-between">
                          <span>Stealth:</span>
                          <Progress value={item.stats.stealth} className="w-16 h-2" />
                        </div>
                        <div className="flex justify-between">
                          <span>Detection:</span>
                          <Progress value={item.stats.detection} className="w-16 h-2" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Stats Tab */}
            <TabsContent value="stats" className="mt-0 p-6 h-[600px] overflow-y-auto">
              <h3 className="text-lg font-mono mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                SYSTEM PERFORMANCE
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-green-400">
                  <CardHeader>
                    <CardTitle className="text-sm font-mono">OVERALL STATS</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Processing Power</span>
                          <span>85%</span>
                        </div>
                        <Progress value={85} />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Stealth Rating</span>
                          <span>72%</span>
                        </div>
                        <Progress value={72} />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Detection Capability</span>
                          <span>68%</span>
                        </div>
                        <Progress value={68} />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>System Speed</span>
                          <span>91%</span>
                        </div>
                        <Progress value={91} />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-green-400">
                  <CardHeader>
                    <CardTitle className="text-sm font-mono">ACTIVE BONUSES</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Award className="h-4 w-4 text-blue-400" />
                        <span className="text-sm">Quantum Processing +15%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-purple-400" />
                        <span className="text-sm">Stealth Mode +20%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-yellow-400" />
                        <span className="text-sm">Speed Boost +10%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}