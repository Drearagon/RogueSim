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
  {
    id: 'wifi_adapter',
    name: 'High-Gain WiFi Adapter',
    description: 'Extended range wireless scanning capabilities',
    price: 800,
    category: ItemCategory.HARDWARE,
    rarity: ItemRarity.COMMON,
    unlocks: ['extended_scan', 'wifi_monitor'],
    icon: Wifi,
    prerequisites: [],
    maxQuantity: 1
  },
  {
    id: 'usb_killer',
    name: 'USB Killer v4',
    description: 'Disable target systems via USB ports',
    price: 1200,
    category: ItemCategory.HARDWARE,
    rarity: ItemRarity.RARE,
    unlocks: ['usb_attack', 'device_disable'],
    icon: Zap,
    prerequisites: ['basic_hardware'],
    maxQuantity: 1
  },
  {
    id: 'esp32_dev',
    name: 'ESP32 Dev Board',
    description: 'Advanced IoT hacking capabilities',
    price: 300,
    category: ItemCategory.HARDWARE,
    rarity: ItemRarity.COMMON,
    unlocks: ['iot_hack', 'sensor_spoof'],
    icon: Cpu,
    prerequisites: [],
    maxQuantity: 3
  },
  {
    id: 'signal_jammer',
    name: 'Portable Signal Jammer',
    description: 'Disable wireless communications in target area',
    price: 2500,
    category: ItemCategory.HARDWARE,
    rarity: ItemRarity.LEGENDARY,
    unlocks: ['signal_jam', 'comm_disable'],
    icon: Shield,
    prerequisites: ['wifi_adapter', 'advanced_electronics'],
    maxQuantity: 1
  }
];

export const SOFTWARE_ITEMS: ShopItem[] = [
  {
    id: 'basic_payload',
    name: 'Basic Payload',
    description: 'Simple injection payload for basic targets',
    price: 200,
    category: ItemCategory.PAYLOAD,
    rarity: ItemRarity.COMMON,
    payload: 'payload_basic',
    icon: Eye,
    prerequisites: [],
    maxQuantity: 1
  },
  {
    id: 'stealth_payload',
    name: 'Stealth Payload',
    description: 'Advanced evasion and persistence capabilities',
    price: 500,
    category: ItemCategory.PAYLOAD,
    rarity: ItemRarity.RARE,
    payload: 'payload_stealth',
    icon: Shield,
    prerequisites: ['basic_payload'],
    maxQuantity: 1
  },
  {
    id: 'data_extractor',
    name: 'Data Extractor',
    description: 'Specialized data exfiltration tool',
    price: 750,
    category: ItemCategory.SOFTWARE,
    rarity: ItemRarity.RARE,
    unlocks: ['extract_data', 'file_recovery'],
    icon: HardDrive,
    prerequisites: ['basic_payload'],
    maxQuantity: 1
  },
  {
    id: 'keylogger_pro',
    name: 'Professional Keylogger',
    description: 'Advanced keystroke capture and analysis',
    price: 600,
    category: ItemCategory.SOFTWARE,
    rarity: ItemRarity.RARE,
    unlocks: ['keylog_advanced', 'credential_harvest'],
    icon: Key,
    prerequisites: [],
    maxQuantity: 1
  }
];

export const BLACKMARKET_ITEMS: ShopItem[] = [
  {
    id: 'zero_day',
    name: 'Zero-Day Exploit',
    description: 'Unpatched vulnerability exploit for critical systems',
    price: 2500,
    category: ItemCategory.EXPLOIT,
    rarity: ItemRarity.LEGENDARY,
    unlocks: ['zero_day_attack', 'system_compromise'],
    icon: Bug,
    prerequisites: ['stealth_payload', 'advanced_exploitation'],
    maxQuantity: 1
  },
  {
    id: 'corp_database',
    name: 'Corporate Database Access',
    description: 'Leaked corporate credentials and internal documentation',
    price: 5000,
    category: ItemCategory.INTEL,
    rarity: ItemRarity.LEGENDARY,
    unlocks: ['corp_access', 'insider_info'],
    icon: Database,
    prerequisites: ['data_extractor'],
    maxQuantity: 1
  },
  {
    id: 'gov_backdoor',
    name: 'Government Backdoor',
    description: 'Classified government system access codes',
    price: 10000,
    category: ItemCategory.EXPLOIT,
    rarity: ItemRarity.LEGENDARY,
    unlocks: ['gov_access', 'classified_data'],
    icon: Lock,
    prerequisites: ['zero_day', 'corp_database'],
    maxQuantity: 1
  },
  {
    id: 'shadow_contact',
    name: 'Shadow Organization Contact',
    description: 'Direct line to underground hacker collective',
    price: 15000,
    category: ItemCategory.INTEL,
    rarity: ItemRarity.LEGENDARY,
    unlocks: ['shadow_missions', 'black_ops'],
    icon: Users,
    prerequisites: ['gov_backdoor'],
    maxQuantity: 1
  }
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