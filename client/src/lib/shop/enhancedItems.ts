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
  Key,
  Terminal,
  Network,
  Smartphone,
  Radio,
  Camera,
  Mic,
  Bluetooth,
  Usb
} from 'lucide-react';

export interface EnhancedShopItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'hardware' | 'software' | 'payload' | 'exploit' | 'intel';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlocks?: string[]; // Commands unlocked
  payload?: string; // Payload identifier
  icon: any;
  prerequisites?: string[];
  requiredLevel?: number;
  requiredFaction?: string;
  maxQuantity?: number;
  requiredMissions?: number;
  functionality: string; // What it actually does
}

export const ENHANCED_HARDWARE_ITEMS: EnhancedShopItem[] = [
  // WiFi Hacking Tools
  {
    id: 'wifi_pineapple',
    name: 'WiFi Pineapple Mark VII',
    description: 'Professional WiFi auditing platform with evil twin capabilities',
    price: 1200,
    category: 'hardware',
    rarity: 'rare',
    unlocks: ['evil_twin', 'wifi_audit', 'captive_portal'],
    icon: Wifi,
    prerequisites: [],
    maxQuantity: 1,
    requiredMissions: 3,
    functionality: 'Creates fake WiFi hotspots to capture credentials and perform man-in-the-middle attacks'
  },
  {
    id: 'alfa_adapter',
    name: 'Alfa AWUS036ACS USB Adapter',
    description: 'High-gain dual-band USB WiFi adapter for extended range scanning',
    price: 400,
    category: 'hardware',
    rarity: 'common',
    unlocks: ['extended_scan', 'monitor_mode', 'packet_injection'],
    icon: Wifi,
    prerequisites: [],
    maxQuantity: 2,
    requiredMissions: 1,
    functionality: 'Enables long-range WiFi scanning and packet injection attacks'
  },
  {
    id: 'cantenna',
    name: 'Directional Cantenna Array',
    description: 'High-gain directional antenna for long-distance WiFi attacks',
    price: 800,
    category: 'hardware',
    rarity: 'rare',
    unlocks: ['long_range_scan', 'directional_attack'],
    icon: Radio,
    prerequisites: ['alfa_adapter'],
    maxQuantity: 1,
    requiredMissions: 5,
    functionality: 'Extends WiFi attack range up to 10km with line of sight'
  },

  // USB Attack Tools
  {
    id: 'rubber_ducky',
    name: 'USB Rubber Ducky',
    description: 'Keystroke injection tool disguised as USB drive',
    price: 600,
    category: 'hardware',
    rarity: 'common',
    unlocks: ['keystroke_inject', 'payload_delivery', 'social_engineer'],
    icon: Usb,
    prerequisites: [],
    maxQuantity: 3,
    requiredMissions: 2,
    functionality: 'Automatically types malicious commands when plugged into target computer'
  },
  {
    id: 'bash_bunny',
    name: 'Bash Bunny Mark II',
    description: 'Multi-vector USB attack platform with Ethernet and storage',
    price: 1500,
    category: 'hardware',
    rarity: 'epic',
    unlocks: ['multi_vector_attack', 'network_implant', 'data_exfiltration'],
    icon: Usb,
    prerequisites: ['rubber_ducky'],
    maxQuantity: 1,
    requiredMissions: 8,
    functionality: 'Combines keystroke injection, network attacks, and mass storage in one device'
  },
  {
    id: 'usb_killer',
    name: 'USB Killer v4.0',
    description: 'High-voltage USB device for permanently disabling electronics',
    price: 2000,
    category: 'hardware',
    rarity: 'epic',
    unlocks: ['hardware_destroy', 'power_surge', 'device_disable'],
    icon: Zap,
    prerequisites: ['bash_bunny'],
    maxQuantity: 1,
    requiredMissions: 12,
    functionality: 'Destroys target devices by delivering high-voltage electrical surge'
  },

  // IoT and Embedded Hacking
  {
    id: 'esp32_devkit',
    name: 'ESP32 Development Kit',
    description: 'Versatile microcontroller for IoT hacking and custom tools',
    price: 300,
    category: 'hardware',
    rarity: 'common',
    unlocks: ['iot_hack', 'sensor_spoof', 'mesh_attack'],
    icon: Cpu,
    prerequisites: [],
    maxQuantity: 5,
    requiredMissions: 1,
    functionality: 'Programs custom IoT attacks and spoofs sensor data'
  },
  {
    id: 'flipper_zero',
    name: 'Flipper Zero',
    description: 'Multi-tool for pentesting and hardware hacking',
    price: 2500,
    category: 'hardware',
    rarity: 'epic',
    unlocks: ['rfid_clone', 'infrared_replay', 'sub_ghz_attack', 'nfc_emulate'],
    icon: Radio,
    prerequisites: ['esp32_devkit'],
    maxQuantity: 1,
    requiredMissions: 10,
    functionality: 'Clones RFID cards, replays IR signals, and attacks sub-GHz devices'
  },

  // Network Tapping
  {
    id: 'network_tap',
    name: 'Throwing Star LAN Tap',
    description: 'Passive network tap for monitoring Ethernet traffic',
    price: 1000,
    category: 'hardware',
    rarity: 'rare',
    unlocks: ['network_monitor', 'passive_sniff', 'traffic_analysis'],
    icon: Network,
    prerequisites: [],
    maxQuantity: 2,
    requiredMissions: 4,
    functionality: 'Invisibly monitors all network traffic passing through Ethernet cables'
  },
  {
    id: 'packet_squirrel',
    name: 'Packet Squirrel',
    description: 'Stealthy network implant for remote access and monitoring',
    price: 1800,
    category: 'hardware',
    rarity: 'epic',
    unlocks: ['network_implant', 'remote_access', 'persistent_backdoor'],
    icon: Network,
    prerequisites: ['network_tap'],
    maxQuantity: 1,
    requiredMissions: 9,
    functionality: 'Provides persistent remote access to target networks'
  },

  // Mobile Device Hacking
  {
    id: 'cellebrite_ufed',
    name: 'Cellebrite UFED Touch',
    description: 'Mobile forensics platform for extracting smartphone data',
    price: 5000,
    category: 'hardware',
    rarity: 'legendary',
    unlocks: ['mobile_extract', 'phone_forensics', 'bypass_lock'],
    icon: Smartphone,
    prerequisites: ['flipper_zero'],
    maxQuantity: 1,
    requiredMissions: 15,
    functionality: 'Extracts data from locked smartphones and bypasses security measures'
  },

  // Surveillance Equipment
  {
    id: 'spy_camera',
    name: 'Covert Surveillance Camera',
    description: 'Miniature wireless camera for physical reconnaissance',
    price: 800,
    category: 'hardware',
    rarity: 'rare',
    unlocks: ['surveillance', 'recon_cam', 'remote_monitor'],
    icon: Camera,
    prerequisites: [],
    maxQuantity: 3,
    requiredMissions: 3,
    functionality: 'Provides real-time video surveillance of target locations'
  },
  {
    id: 'audio_bug',
    name: 'GSM Audio Bug',
    description: 'Remote listening device with cellular connectivity',
    price: 1200,
    category: 'hardware',
    rarity: 'rare',
    unlocks: ['audio_surveillance', 'remote_listen', 'voice_record'],
    icon: Mic,
    prerequisites: ['spy_camera'],
    maxQuantity: 2,
    requiredMissions: 6,
    functionality: 'Records and transmits audio from target locations via cellular network'
  }
];

export const ENHANCED_SOFTWARE_ITEMS: EnhancedShopItem[] = [
  // Exploitation Frameworks
  {
    id: 'metasploit_pro',
    name: 'Metasploit Pro License',
    description: 'Professional exploitation framework with advanced features',
    price: 2000,
    category: 'software',
    rarity: 'epic',
    unlocks: ['auto_exploit', 'payload_gen', 'post_exploit'],
    icon: Bug,
    prerequisites: [],
    maxQuantity: 1,
    requiredMissions: 5,
    functionality: 'Automatically finds and exploits vulnerabilities in target systems'
  },
  {
    id: 'cobalt_strike',
    name: 'Cobalt Strike License',
    description: 'Advanced threat emulation and red team operations platform',
    price: 4000,
    category: 'software',
    rarity: 'legendary',
    unlocks: ['beacon_implant', 'lateral_movement', 'command_control'],
    icon: Shield,
    prerequisites: ['metasploit_pro'],
    maxQuantity: 1,
    requiredMissions: 12,
    functionality: 'Provides advanced persistent access and lateral movement capabilities'
  },

  // Password Cracking
  {
    id: 'hashcat_rig',
    name: 'Hashcat GPU Cluster',
    description: 'High-performance password cracking setup with multiple GPUs',
    price: 3000,
    category: 'software',
    rarity: 'epic',
    unlocks: ['gpu_crack', 'hash_attack', 'rainbow_tables'],
    icon: Key,
    prerequisites: [],
    maxQuantity: 1,
    requiredMissions: 7,
    functionality: 'Cracks password hashes at billions of attempts per second'
  },
  {
    id: 'john_jumbo',
    name: 'John the Ripper Jumbo',
    description: 'Enhanced password cracking tool with custom rules',
    price: 800,
    category: 'software',
    rarity: 'rare',
    unlocks: ['password_crack', 'rule_based_attack', 'wordlist_gen'],
    icon: Key,
    prerequisites: [],
    maxQuantity: 1,
    requiredMissions: 3,
    functionality: 'Cracks passwords using dictionary attacks and custom rules'
  },

  // Network Analysis
  {
    id: 'wireshark_pro',
    name: 'Wireshark Professional',
    description: 'Advanced network protocol analyzer with custom plugins',
    price: 1200,
    category: 'software',
    rarity: 'rare',
    unlocks: ['packet_analysis', 'protocol_decode', 'traffic_reconstruct'],
    icon: Network,
    prerequisites: [],
    maxQuantity: 1,
    requiredMissions: 4,
    functionality: 'Analyzes network traffic and reconstructs communications'
  },
  {
    id: 'burp_suite_pro',
    name: 'Burp Suite Professional',
    description: 'Web application security testing platform',
    price: 1500,
    category: 'software',
    rarity: 'rare',
    unlocks: ['web_scan', 'sql_inject', 'xss_attack', 'web_fuzz'],
    icon: Database,
    prerequisites: [],
    maxQuantity: 1,
    requiredMissions: 5,
    functionality: 'Finds and exploits web application vulnerabilities'
  },

  // Social Engineering
  {
    id: 'set_toolkit',
    name: 'Social Engineer Toolkit Pro',
    description: 'Advanced social engineering attack framework',
    price: 1000,
    category: 'software',
    rarity: 'rare',
    unlocks: ['phishing_gen', 'credential_harvest', 'fake_site'],
    icon: Users,
    prerequisites: [],
    maxQuantity: 1,
    requiredMissions: 3,
    functionality: 'Creates convincing phishing campaigns and fake websites'
  },
  {
    id: 'gophish',
    name: 'GoPhish Enterprise',
    description: 'Professional phishing campaign management platform',
    price: 2500,
    category: 'software',
    rarity: 'epic',
    unlocks: ['mass_phish', 'campaign_track', 'template_gen'],
    icon: Users,
    prerequisites: ['set_toolkit'],
    maxQuantity: 1,
    requiredMissions: 8,
    functionality: 'Manages large-scale phishing campaigns with detailed analytics'
  },

  // Steganography and Encryption
  {
    id: 'steghide_pro',
    name: 'Steganography Suite Pro',
    description: 'Advanced data hiding and extraction tools',
    price: 800,
    category: 'software',
    rarity: 'rare',
    unlocks: ['data_hide', 'steg_extract', 'covert_channel'],
    icon: Eye,
    prerequisites: [],
    maxQuantity: 1,
    requiredMissions: 4,
    functionality: 'Hides data inside images, audio, and video files'
  },
  {
    id: 'crypto_suite',
    name: 'Cryptanalysis Suite',
    description: 'Advanced encryption breaking and analysis tools',
    price: 3500,
    category: 'software',
    rarity: 'legendary',
    unlocks: ['crypto_break', 'cipher_analyze', 'key_recovery'],
    icon: Lock,
    prerequisites: ['steghide_pro'],
    maxQuantity: 1,
    requiredMissions: 14,
    functionality: 'Breaks weak encryption and recovers cryptographic keys'
  }
];

export const ENHANCED_PAYLOAD_ITEMS: EnhancedShopItem[] = [
  // Basic Payloads
  {
    id: 'reverse_shell',
    name: 'Reverse Shell Payload',
    description: 'Basic command line access payload',
    price: 200,
    category: 'payload',
    rarity: 'common',
    payload: 'payload_reverse_shell',
    unlocks: ['reverse_connect'],
    icon: Terminal,
    prerequisites: [],
    maxQuantity: 1,
    requiredMissions: 0,
    functionality: 'Provides command line access to compromised systems'
  },
  {
    id: 'meterpreter',
    name: 'Meterpreter Payload',
    description: 'Advanced post-exploitation payload with multiple features',
    price: 800,
    category: 'payload',
    rarity: 'rare',
    payload: 'payload_meterpreter',
    unlocks: ['file_upload', 'screenshot', 'keylog_remote'],
    icon: Terminal,
    prerequisites: ['reverse_shell'],
    maxQuantity: 1,
    requiredMissions: 3,
    functionality: 'Provides advanced post-exploitation capabilities including file transfer and keylogging'
  },
  {
    id: 'empire_agent',
    name: 'PowerShell Empire Agent',
    description: 'Fileless PowerShell-based payload for Windows systems',
    price: 1500,
    category: 'payload',
    rarity: 'epic',
    payload: 'payload_empire',
    unlocks: ['powershell_exec', 'memory_inject', 'persistence'],
    icon: Terminal,
    prerequisites: ['meterpreter'],
    maxQuantity: 1,
    requiredMissions: 7,
    functionality: 'Operates entirely in memory without touching disk, evading antivirus'
  },

  // Specialized Payloads
  {
    id: 'ransomware_kit',
    name: 'Ransomware Development Kit',
    description: 'Educational ransomware creation toolkit (for authorized testing only)',
    price: 5000,
    category: 'payload',
    rarity: 'legendary',
    payload: 'payload_ransomware',
    unlocks: ['file_encrypt', 'ransom_note', 'crypto_wallet'],
    icon: Lock,
    prerequisites: ['empire_agent'],
    maxQuantity: 1,
    requiredMissions: 15,
    functionality: 'Encrypts files and demands payment for decryption (educational purposes only)'
  },
  {
    id: 'rootkit_payload',
    name: 'Advanced Rootkit',
    description: 'Kernel-level rootkit for deep system persistence',
    price: 3000,
    category: 'payload',
    rarity: 'legendary',
    payload: 'payload_rootkit',
    unlocks: ['kernel_access', 'process_hide', 'file_hide'],
    icon: Skull,
    prerequisites: ['empire_agent'],
    maxQuantity: 1,
    requiredMissions: 12,
    functionality: 'Provides kernel-level access and hides presence from security tools'
  }
];

export const ENHANCED_BLACKMARKET_ITEMS: EnhancedShopItem[] = [
  // Zero-Day Exploits
  {
    id: 'windows_zero_day',
    name: 'Windows 11 Zero-Day Exploit',
    description: 'Unpatched Windows 11 privilege escalation exploit',
    price: 10000,
    category: 'exploit',
    rarity: 'legendary',
    unlocks: ['windows_privesc', 'uac_bypass', 'defender_disable'],
    icon: Skull,
    prerequisites: ['metasploit_pro'],
    maxQuantity: 1,
    requiredMissions: 20,
    functionality: 'Bypasses all Windows 11 security measures for full system access'
  },
  {
    id: 'ios_jailbreak',
    name: 'iOS 17 Jailbreak Chain',
    description: 'Complete iOS 17 jailbreak exploit chain',
    price: 15000,
    category: 'exploit',
    rarity: 'legendary',
    unlocks: ['ios_jailbreak', 'mobile_implant', 'app_bypass'],
    icon: Smartphone,
    prerequisites: ['cellebrite_ufed'],
    maxQuantity: 1,
    requiredMissions: 25,
    functionality: 'Completely compromises iOS devices and installs persistent access'
  },

  // Stolen Databases
  {
    id: 'corp_database',
    name: 'Fortune 500 Database Dump',
    description: 'Leaked employee credentials from major corporation',
    price: 7500,
    category: 'intel',
    rarity: 'epic',
    unlocks: ['corp_access', 'employee_data', 'credential_stuff'],
    icon: Database,
    prerequisites: [],
    maxQuantity: 1,
    requiredMissions: 10,
    functionality: 'Provides access to corporate systems using leaked credentials'
  },
  {
    id: 'gov_intel',
    name: 'Government Intelligence Package',
    description: 'Classified government system access and intelligence',
    price: 20000,
    category: 'intel',
    rarity: 'legendary',
    unlocks: ['gov_access', 'classified_data', 'surveillance_bypass'],
    icon: Shield,
    prerequisites: ['corp_database'],
    maxQuantity: 1,
    requiredMissions: 30,
    functionality: 'Accesses classified government systems and intelligence databases'
  },

  // Advanced Tools
  {
    id: 'quantum_computer',
    name: 'Quantum Computing Access',
    description: 'Remote access to quantum computer for cryptographic attacks',
    price: 25000,
    category: 'software',
    rarity: 'legendary',
    unlocks: ['quantum_crack', 'rsa_break', 'crypto_future'],
    icon: Cpu,
    prerequisites: ['crypto_suite'],
    maxQuantity: 1,
    requiredMissions: 35,
    functionality: 'Breaks RSA encryption and other quantum-vulnerable cryptography'
  },
  {
    id: 'ai_assistant',
    name: 'Advanced AI Hacking Assistant',
    description: 'AI-powered autonomous hacking and social engineering',
    price: 30000,
    category: 'software',
    rarity: 'legendary',
    unlocks: ['ai_hack', 'auto_social', 'ml_exploit'],
    icon: Eye,
    prerequisites: ['gophish'],
    maxQuantity: 1,
    requiredMissions: 40,
    functionality: 'Autonomously finds vulnerabilities and conducts social engineering attacks'
  }
];

export const ALL_ENHANCED_ITEMS = [
  ...ENHANCED_HARDWARE_ITEMS,
  ...ENHANCED_SOFTWARE_ITEMS,
  ...ENHANCED_PAYLOAD_ITEMS,
  ...ENHANCED_BLACKMARKET_ITEMS
];

export function getEnhancedItemsByCategory(category: string): EnhancedShopItem[] {
  switch (category) {
    case 'hardware':
      return ENHANCED_HARDWARE_ITEMS;
    case 'software':
      return ENHANCED_SOFTWARE_ITEMS;
    case 'payload':
      return ENHANCED_PAYLOAD_ITEMS;
    case 'blackmarket':
      return [...ENHANCED_BLACKMARKET_ITEMS.filter(item => item.category === 'exploit' || item.category === 'intel')];
    default:
      return [];
  }
}

export function getEnhancedItemById(id: string): EnhancedShopItem | undefined {
  return ALL_ENHANCED_ITEMS.find(item => item.id === id);
} 