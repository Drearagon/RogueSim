import { 
  Shield, 
  Zap, 
  Cpu, 
  Eye, 
  Users, 
  Skull, 
  Lock, 
  Wifi, 
  HardDrive,
  Database,
  Bug,
  Key
} from 'lucide-react';
import { ShopItem, ItemRarity, ItemCategory } from './types';

export const HARDWARE_ITEMS: ShopItem[] = [
  // WiFi Equipment Line
  {
    id: 'wifi_scanner_v1',
    name: 'WiFi Scanner v1',
    description: 'Basic wireless network detection (50m range)',
    price: 200,
    category: ItemCategory.HARDWARE,
    rarity: ItemRarity.COMMON,
    unlocks: ['scan'],
    icon: Wifi,
    prerequisites: [],
    maxQuantity: 1,
    requiredMissions: 0
  },
  {
    id: 'wifi_adapter_v2',
    name: 'WiFi Adapter v2',
    description: 'Enhanced wireless capabilities (100m range, faster scanning)',
    price: 600,
    category: ItemCategory.HARDWARE,
    rarity: ItemRarity.COMMON,
    unlocks: ['extended_scan'],
    icon: Wifi,
    prerequisites: ['wifi_scanner_v1'],
    maxQuantity: 1,
    requiredMissions: 3
  },
  {
    id: 'wifi_suite_v3',
    name: 'Professional WiFi Suite v3',
    description: 'Advanced wireless toolkit (200m range, stealth mode)',
    price: 1200,
    category: ItemCategory.HARDWARE,
    rarity: ItemRarity.RARE,
    unlocks: ['wifi_monitor'],
    icon: Wifi,
    prerequisites: ['wifi_adapter_v2'],
    maxQuantity: 1,
    requiredMissions: 8
  },
  {
    id: 'wifi_array_v4',
    name: 'Military WiFi Array v4',
    description: 'Elite wireless warfare system (500m range, signal jamming)',
    price: 3000,
    category: ItemCategory.HARDWARE,
    rarity: ItemRarity.LEGENDARY,
    unlocks: ['spoof'],
    icon: Shield,
    prerequisites: ['wifi_suite_v3'],
    maxQuantity: 1,
    requiredMissions: 15
  },

  // ESP32 Development Line
  {
    id: 'esp32_basic_v1',
    name: 'ESP32 Basic v1',
    description: 'Entry-level IoT development board',
    price: 150,
    category: ItemCategory.HARDWARE,
    rarity: ItemRarity.COMMON,
    unlocks: ['test'],
    icon: Cpu,
    prerequisites: [],
    maxQuantity: 3,
    requiredMissions: 1
  },
  {
    id: 'esp32_dev_v2',
    name: 'ESP32 Development Kit v2',
    description: 'Enhanced IoT hacking with sensor integration',
    price: 400,
    category: ItemCategory.HARDWARE,
    rarity: ItemRarity.COMMON,
    unlocks: ['iot_hack', 'sensor_spoof'],
    icon: Cpu,
    prerequisites: ['esp32_basic_v1'],
    maxQuantity: 2,
    requiredMissions: 5
  },
  {
    id: 'esp32_pro_v3',
    name: 'ESP32 Pro Suite v3',
    description: 'Professional IoT exploitation platform',
    price: 800,
    category: ItemCategory.HARDWARE,
    rarity: ItemRarity.RARE,
    unlocks: [],
    icon: Cpu,
    prerequisites: ['esp32_dev_v2'],
    maxQuantity: 1,
    requiredMissions: 10
  },

  // USB Attack Line
  {
    id: 'usb_tool_v1',
    name: 'USB Multi-Tool v1',
    description: 'Basic USB exploitation capabilities',
    price: 300,
    category: ItemCategory.HARDWARE,
    rarity: ItemRarity.COMMON,
    unlocks: [],
    icon: Zap,
    prerequisites: [],
    maxQuantity: 1,
    requiredMissions: 2
  },
  {
    id: 'usb_killer_v2',
    name: 'USB Killer v2',
    description: 'Enhanced power surge attacks',
    price: 700,
    category: ItemCategory.HARDWARE,
    rarity: ItemRarity.RARE,
    unlocks: [],
    icon: Zap,
    prerequisites: ['usb_tool_v1'],
    maxQuantity: 1,
    requiredMissions: 6
  },
  {
    id: 'usb_arsenal_v3',
    name: 'USB Arsenal v3',
    description: 'Complete USB warfare toolkit',
    price: 1500,
    category: ItemCategory.HARDWARE,
    rarity: ItemRarity.RARE,
    unlocks: [],
    icon: Zap,
    prerequisites: ['usb_killer_v2'],
    maxQuantity: 1,
    requiredMissions: 12
  }
];

export const SOFTWARE_ITEMS: ShopItem[] = [
  // Payload Development Line
  {
    id: 'payload_basic_v1',
    name: 'Basic Payload v1',
    description: 'Simple injection payload for basic targets',
    price: 200,
    category: ItemCategory.PAYLOAD,
    rarity: ItemRarity.COMMON,
    payload: 'payload_basic',
    icon: Eye,
    prerequisites: [],
    maxQuantity: 1,
    requiredMissions: 0
  },
  {
    id: 'payload_stealth_v2',
    name: 'Stealth Payload v2',
    description: 'Enhanced evasion and persistence capabilities',
    price: 500,
    category: ItemCategory.PAYLOAD,
    rarity: ItemRarity.RARE,
    payload: 'payload_stealth',
    icon: Shield,
    prerequisites: ['payload_basic_v1'],
    maxQuantity: 1,
    requiredMissions: 4
  },
  {
    id: 'payload_advanced_v3',
    name: 'Advanced Payload v3',
    description: 'Multi-stage exploitation with polymorphic features',
    price: 1000,
    category: ItemCategory.PAYLOAD,
    rarity: ItemRarity.RARE,
    payload: 'payload_advanced',
    icon: Shield,
    prerequisites: ['payload_stealth_v2'],
    maxQuantity: 1,
    requiredMissions: 9
  },
  {
    id: 'payload_apex_v4',
    name: 'Apex Payload v4',
    description: 'Military-grade exploitation framework',
    price: 2500,
    category: ItemCategory.PAYLOAD,
    rarity: ItemRarity.LEGENDARY,
    payload: 'payload_apex',
    icon: Skull,
    prerequisites: ['payload_advanced_v3'],
    maxQuantity: 1,
    requiredMissions: 18
  },

  // Data Extraction Line
  {
    id: 'data_scraper_v1',
    name: 'Data Scraper v1',
    description: 'Basic file extraction capabilities',
    price: 300,
    category: ItemCategory.SOFTWARE,
    rarity: ItemRarity.COMMON,
    unlocks: ['extract_data'],
    icon: HardDrive,
    prerequisites: [],
    maxQuantity: 1,
    requiredMissions: 1
  },
  {
    id: 'data_extractor_v2',
    name: 'Advanced Data Extractor v2',
    description: 'Enhanced data recovery and forensics tools',
    price: 800,
    category: ItemCategory.SOFTWARE,
    rarity: ItemRarity.RARE,
    unlocks: ['file_recovery'],
    icon: Database,
    prerequisites: ['data_scraper_v1'],
    maxQuantity: 1,
    requiredMissions: 5
  },

  // Network Security Line
  {
    id: 'network_scanner_v1',
    name: 'Network Scanner v1',
    description: 'Advanced network reconnaissance tools',
    price: 250,
    category: ItemCategory.SOFTWARE,
    rarity: ItemRarity.COMMON,
    unlocks: ['nmap', 'trace'],
    icon: Wifi,
    prerequisites: [],
    maxQuantity: 1,
    requiredMissions: 2
  },
  {
    id: 'password_cracker_v1',
    name: 'Password Cracker v1',
    description: 'WiFi password cracking utility',
    price: 500,
    category: ItemCategory.SOFTWARE,
    rarity: ItemRarity.COMMON,
    unlocks: ['crack'],
    icon: Key,
    prerequisites: ['network_scanner_v1'],
    maxQuantity: 1,
    requiredMissions: 3
  },
  {
    id: 'keylogger_suite_v1',
    name: 'Keylogger Suite v1',
    description: 'Stealth keystroke capture and monitoring',
    price: 750,
    category: ItemCategory.SOFTWARE,
    rarity: ItemRarity.RARE,
    unlocks: ['keylog'],
    icon: Eye,
    prerequisites: ['password_cracker_v1'],
    maxQuantity: 1,
    requiredMissions: 6
  },

  // Exploit Development Line
  {
    id: 'exploit_framework_v1',
    name: 'Exploit Framework v1',
    description: 'Basic vulnerability exploitation tools',
    price: 1000,
    category: ItemCategory.SOFTWARE,
    rarity: ItemRarity.RARE,
    unlocks: ['exploit', 'inject'],
    icon: Bug,
    prerequisites: ['keylogger_suite_v1'],
    maxQuantity: 1,
    requiredMissions: 8
  }
];

export const BLACKMARKET_ITEMS: ShopItem[] = [
  // Placeholder for future blackmarket items
  // These will be added when corresponding commands are implemented
];

export const ALL_SHOP_ITEMS = [
  ...HARDWARE_ITEMS,
  ...SOFTWARE_ITEMS,
  ...BLACKMARKET_ITEMS
];

export function getItemsByCategory(category: ItemCategory): ShopItem[] {
  switch (category) {
    case ItemCategory.HARDWARE:
      return HARDWARE_ITEMS;
    case ItemCategory.SOFTWARE:
    case ItemCategory.PAYLOAD:
      return SOFTWARE_ITEMS;
    case ItemCategory.EXPLOIT:
    case ItemCategory.INTEL:
      return BLACKMARKET_ITEMS;
    default:
      return [];
  }
}

export function getItemById(itemId: string): ShopItem | undefined {
  return ALL_SHOP_ITEMS.find(item => item.id === itemId);
}