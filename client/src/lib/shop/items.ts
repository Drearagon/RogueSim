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
    description: 'Basic wireless scanning (50m range)',
    price: 200,
    category: ItemCategory.HARDWARE,
    rarity: ItemRarity.COMMON,
    unlocks: ['basic_scan'],
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
    unlocks: ['extended_scan', 'fast_scan'],
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
    unlocks: ['stealth_scan', 'wifi_monitor'],
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
    unlocks: ['signal_jam', 'wireless_warfare'],
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
    unlocks: ['basic_iot'],
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
    unlocks: ['iot_exploit', 'mesh_control'],
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
    unlocks: ['usb_basic'],
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
    unlocks: ['usb_attack', 'power_surge'],
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
    unlocks: ['usb_warfare', 'device_disable'],
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
    unlocks: ['basic_extract'],
    icon: HardDrive,
    prerequisites: [],
    maxQuantity: 1,
    requiredMissions: 1
  },
  {
    id: 'data_extractor_v2',
    name: 'Data Extractor v2',
    description: 'Enhanced file recovery and exfiltration',
    price: 750,
    category: ItemCategory.SOFTWARE,
    rarity: ItemRarity.RARE,
    unlocks: ['extract_data', 'file_recovery'],
    icon: HardDrive,
    prerequisites: ['data_scraper_v1'],
    maxQuantity: 1,
    requiredMissions: 5
  },
  {
    id: 'data_harvester_v3',
    name: 'Data Harvester v3',
    description: 'Advanced database mining and steganography',
    price: 1500,
    category: ItemCategory.SOFTWARE,
    rarity: ItemRarity.RARE,
    unlocks: ['database_mine', 'steganography'],
    icon: Database,
    prerequisites: ['data_extractor_v2'],
    maxQuantity: 1,
    requiredMissions: 11
  },

  // Keylogging Line
  {
    id: 'keylogger_basic_v1',
    name: 'Basic Keylogger v1',
    description: 'Simple keystroke capture',
    price: 250,
    category: ItemCategory.SOFTWARE,
    rarity: ItemRarity.COMMON,
    unlocks: ['keylog_basic'],
    icon: Key,
    prerequisites: [],
    maxQuantity: 1,
    requiredMissions: 2
  },
  {
    id: 'keylogger_pro_v2',
    name: 'Professional Keylogger v2',
    description: 'Advanced keystroke capture and analysis',
    price: 600,
    category: ItemCategory.SOFTWARE,
    rarity: ItemRarity.RARE,
    unlocks: ['keylog_advanced', 'credential_harvest'],
    icon: Key,
    prerequisites: ['keylogger_basic_v1'],
    maxQuantity: 1,
    requiredMissions: 7
  },
  {
    id: 'keylogger_elite_v3',
    name: 'Elite Keylogger v3',
    description: 'Undetectable keystroke monitoring with ML analysis',
    price: 1200,
    category: ItemCategory.SOFTWARE,
    rarity: ItemRarity.LEGENDARY,
    unlocks: ['stealth_keylog', 'behavior_analysis'],
    icon: Eye,
    prerequisites: ['keylogger_pro_v2'],
    maxQuantity: 1,
    requiredMissions: 13
  }
];

export const BLACKMARKET_ITEMS: ShopItem[] = [
  // Zero-Day Exploit Line
  {
    id: 'exploit_kit_v1',
    name: 'Exploit Kit v1',
    description: 'Basic vulnerability scanner and exploits',
    price: 1000,
    category: ItemCategory.EXPLOIT,
    rarity: ItemRarity.RARE,
    unlocks: ['basic_exploit', 'vuln_scan'],
    icon: Bug,
    prerequisites: ['payload_stealth_v2'],
    maxQuantity: 1,
    requiredMissions: 6
  },
  {
    id: 'zero_day_v2',
    name: 'Zero-Day Collection v2',
    description: 'Curated unpatched vulnerability exploits',
    price: 2500,
    category: ItemCategory.EXPLOIT,
    rarity: ItemRarity.LEGENDARY,
    unlocks: ['zero_day_attack', 'system_compromise'],
    icon: Bug,
    prerequisites: ['exploit_kit_v1'],
    maxQuantity: 1,
    requiredMissions: 10
  },
  {
    id: 'apex_exploits_v3',
    name: 'Apex Exploits v3',
    description: 'Nation-state level exploitation framework',
    price: 5000,
    category: ItemCategory.EXPLOIT,
    rarity: ItemRarity.LEGENDARY,
    unlocks: ['nation_state_attacks', 'infrastructure_compromise'],
    icon: Skull,
    prerequisites: ['zero_day_v2'],
    maxQuantity: 1,
    requiredMissions: 16
  },

  // Intelligence Network Line
  {
    id: 'dark_contacts_v1',
    name: 'Dark Web Contacts v1',
    description: 'Basic underground network connections',
    price: 1500,
    category: ItemCategory.INTEL,
    rarity: ItemRarity.RARE,
    unlocks: ['dark_intel', 'underground_access'],
    icon: Users,
    prerequisites: ['data_extractor_v2'],
    maxQuantity: 1,
    requiredMissions: 7
  },
  {
    id: 'corp_database_v2',
    name: 'Corporate Database Access v2',
    description: 'Leaked Fortune 500 credentials and insider docs',
    price: 3500,
    category: ItemCategory.INTEL,
    rarity: ItemRarity.LEGENDARY,
    unlocks: ['corp_access', 'insider_info'],
    icon: Database,
    prerequisites: ['dark_contacts_v1'],
    maxQuantity: 1,
    requiredMissions: 12
  },
  {
    id: 'gov_intel_v3',
    name: 'Government Intel Package v3',
    description: 'Classified government database access',
    price: 7500,
    category: ItemCategory.INTEL,
    rarity: ItemRarity.LEGENDARY,
    unlocks: ['gov_access', 'classified_data'],
    icon: Lock,
    prerequisites: ['corp_database_v2'],
    maxQuantity: 1,
    requiredMissions: 17
  },
  {
    id: 'shadow_nexus_v4',
    name: 'Shadow Nexus v4',
    description: 'Elite hacker collective inner circle access',
    price: 15000,
    category: ItemCategory.INTEL,
    rarity: ItemRarity.LEGENDARY,
    unlocks: ['shadow_missions', 'black_ops', 'nexus_protocols'],
    icon: Users,
    prerequisites: ['gov_intel_v3', 'apex_exploits_v3'],
    maxQuantity: 1,
    requiredMissions: 25
  },

  // Specialized Black Market Tools
  {
    id: 'quantum_decrypt_v2',
    name: 'Quantum Decryption Array v2',
    description: 'Experimental quantum-resistant encryption breaker',
    price: 4000,
    category: ItemCategory.EXPLOIT,
    rarity: ItemRarity.LEGENDARY,
    unlocks: ['quantum_decrypt', 'crypto_break'],
    icon: Key,
    prerequisites: ['zero_day_v2'],
    maxQuantity: 1,
    requiredMissions: 14
  },
  {
    id: 'neural_ai_v3',
    name: 'Neural AI Assistant v3',
    description: 'Advanced AI for automated hacking and social engineering',
    price: 6000,
    category: ItemCategory.SOFTWARE,
    rarity: ItemRarity.LEGENDARY,
    unlocks: ['ai_hacking', 'auto_social_eng'],
    icon: Eye,
    prerequisites: ['corp_database_v2'],
    maxQuantity: 1,
    requiredMissions: 18
  },
  {
    id: 'stealth_satellite_v4',
    name: 'Stealth Satellite Access v4',
    description: 'Hijacked military satellite for global surveillance',
    price: 12000,
    category: ItemCategory.HARDWARE,
    rarity: ItemRarity.LEGENDARY,
    unlocks: ['satellite_surveillance', 'global_intercept'],
    icon: Shield,
    prerequisites: ['gov_intel_v3'],
    maxQuantity: 1,
    requiredMissions: 22
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