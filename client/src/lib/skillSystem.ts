import { SkillNode, SkillTree, GameState, SkillBonus } from '../types/game';

// ===== SKILL TREE SYSTEM =====
// Three main categories: Offensive, Defensive, Social
// Each category has multiple specializations with 10-15 skills each

// Skill to Command Mapping - defines which commands each skill unlocks
export const skillCommandUnlocks: Record<string, string[]> = {
  // Offensive Skills
  'basic_exploitation': ['exploit', 'crack'],
  'buffer_overflow': ['overflow', 'memory_dump'],
  'zero_day_hunter': ['zero_day', 'vuln_scan'],
  'exploit_chaining': ['chain_exploit', 'multi_exploit'],
  'ddos_mastery': ['ddos', 'flood'],
  'botnet_control': ['botnet', 'zombie_control'],
  'cyber_warfare': ['cyber_attack', 'infrastructure_hack'],
  'digital_apocalypse': ['apocalypse_mode', 'total_destruction'],
  
  // Infiltration Skills
  'network_infiltration': ['infiltrate', 'deep_scan'],
  'privilege_escalation': ['escalate', 'root_access'],
  'lateral_movement': ['lateral_move', 'network_pivot'],
  'air_gap_breach': ['air_gap', 'isolated_breach'],
  
  // Destruction Skills
  'data_destruction': ['shred', 'wipe_data'],
  'malware_creation': ['create_virus', 'deploy_malware'],
  
  // Defensive Skills
  'stealth_operations': ['stealth_mode', 'ghost_protocol'],
  'traffic_analysis': ['analyze_traffic', 'packet_inspect'],
  'digital_camouflage': ['camouflage', 'hide_presence'],
  'phantom_protocols': ['phantom_mode', 'invisible_ops'],
  'advanced_encryption': ['encrypt_advanced', 'secure_comm'],
  'quantum_cryptography': ['quantum_encrypt', 'unbreakable_cipher'],
  'data_fortress': ['data_vault', 'secure_storage'],
  'anonymity_networks': ['tor_enhanced', 'proxy_chain'],
  'identity_obfuscation': ['fake_identity', 'id_scramble'],
  'reality_distortion': ['reality_hack', 'perception_alter'],
  'digital_forensics': ['forensic_scan', 'evidence_recovery'],
  'memory_analysis': ['ram_dump', 'memory_forensics'],
  'archaeological_recovery': ['data_archaeology', 'recover_ancient'],
  
  // Social Skills
  'basic_psychology': ['psych_profile', 'behavior_read'],
  'neuro_linguistic_programming': ['nlp_attack', 'mind_hack'],
  'mass_manipulation': ['crowd_control', 'mass_influence'],
  'reality_engineering': ['reality_engineer', 'perception_control'],
  'identity_theft': ['steal_identity', 'credential_harvest'],
  'deep_fake_mastery': ['deep_fake', 'synthetic_media'],
  'quantum_deception': ['quantum_fake', 'superposition_lie'],
  'human_intelligence': ['humint', 'source_recruit'],
  'social_network_analysis': ['social_map', 'network_analysis'],
  'predictive_modeling': ['predict_behavior', 'forecast_actions'],
  'propaganda_creation': ['create_propaganda', 'viral_content'],
  'information_warfare': ['info_war', 'memetic_attack'],
  'memetic_engineering': ['meme_virus', 'idea_weapon'],
  'societal_programming': ['society_hack', 'culture_program']
};

export const skillCategories = {
  offensive: {
    name: '⚔️ Offensive Operations',
    description: 'Aggressive hacking techniques and exploitation methods',
    color: '#EF4444',
    specializations: {
      exploitation: 'System Exploitation',
      warfare: 'Cyber Warfare', 
      infiltration: 'Network Infiltration',
      destruction: 'Data Destruction'
    }
  },
  defensive: {
    name: '🛡️ Defensive Systems',
    description: 'Protection, evasion, and counter-intelligence techniques',
    color: '#3B82F6',
    specializations: {
      stealth: 'Stealth Operations',
      encryption: 'Cryptography & Security',
      evasion: 'Detection Evasion',
      forensics: 'Digital Forensics'
    }
  },
  social: {
    name: '🎭 Social Engineering',
    description: 'Human manipulation and psychological operations',
    color: '#8B5CF6',
    specializations: {
      manipulation: 'Psychological Manipulation',
      deception: 'Identity & Deception',
      intelligence: 'Human Intelligence',
      influence: 'Mass Influence'
    }
  }
};

// ===== OFFENSIVE SKILLS =====
export const offensiveSkills: SkillNode[] = [
  // EXPLOITATION SPECIALIZATION
  {
    id: 'basic_exploitation',
    name: 'Basic Exploitation',
    description: 'Fundamental vulnerability exploitation techniques',
    category: 'offensive',
    specialization: 'exploitation',
    tier: 1,
    cost: 1,
    prerequisites: [],
    unlocks: ['exploit_scanner', 'buffer_overflow'],
    bonuses: [
      {
        type: 'command_success',
        value: 10,
        description: '+10% success rate for exploit commands',
        conditions: ['exploit', 'crack', 'bypass'],
        stackable: true
      }
    ],
    position: { x: 50, y: 100 },
    unlocked: true,
    purchased: false,
    maxLevel: 3,
    currentLevel: 0
  },
  {
    id: 'buffer_overflow',
    name: 'Buffer Overflow Mastery',
    description: 'Advanced memory corruption exploitation',
    category: 'offensive',
    specialization: 'exploitation',
    tier: 2,
    cost: 2,
    prerequisites: ['basic_exploitation'],
    unlocks: ['memory_corruption', 'heap_spray'],
    bonuses: [
      {
        type: 'command_success',
        value: 25,
        description: '+25% success rate for memory-based exploits',
        conditions: ['exploit', 'overflow'],
        stackable: true
      },
      {
        type: 'credit_multiplier',
        value: 1.2,
        description: '20% bonus credits for exploitation missions',
        conditions: ['exploitation_missions'],
        stackable: false
      }
    ],
    position: { x: 150, y: 100 },
    unlocked: false,
    purchased: false,
    maxLevel: 5,
    currentLevel: 0
  },
  {
    id: 'zero_day_hunter',
    name: 'Zero-Day Hunter',
    description: 'Discover and exploit unknown vulnerabilities',
    category: 'offensive',
    specialization: 'exploitation',
    tier: 3,
    cost: 4,
    prerequisites: ['buffer_overflow', 'advanced_scanning'],
    unlocks: ['zero_day_exploit', 'vulnerability_research'],
    bonuses: [
      {
        type: 'special_ability',
        value: 1,
        description: 'Chance to discover zero-day vulnerabilities',
        conditions: ['scanning', 'research'],
        stackable: false
      },
      {
        type: 'credit_multiplier',
        value: 2.0,
        description: 'Double credits for zero-day discoveries',
        conditions: ['zero_day_missions'],
        stackable: false
      }
    ],
    position: { x: 250, y: 100 },
    unlocked: false,
    purchased: false,
    maxLevel: 3,
    currentLevel: 0
  },
  {
    id: 'exploit_chaining',
    name: 'Exploit Chaining',
    description: 'Chain multiple exploits for maximum impact',
    category: 'offensive',
    specialization: 'exploitation',
    tier: 4,
    cost: 6,
    prerequisites: ['zero_day_hunter', 'privilege_escalation'],
    unlocks: ['multi_stage_exploit', 'exploit_automation'],
    bonuses: [
      {
        type: 'damage_bonus',
        value: 50,
        description: '+50% damage when chaining exploits',
        conditions: ['chained_exploits'],
        stackable: true
      }
    ],
    position: { x: 350, y: 100 },
    unlocked: false,
    purchased: false,
    maxLevel: 5,
    currentLevel: 0
  },

  // WARFARE SPECIALIZATION
  {
    id: 'ddos_mastery',
    name: 'DDoS Mastery',
    description: 'Distributed denial of service attack expertise',
    category: 'offensive',
    specialization: 'warfare',
    tier: 1,
    cost: 1,
    prerequisites: [],
    unlocks: ['botnet_control', 'amplification_attacks'],
    bonuses: [
      {
        type: 'command_success',
        value: 15,
        description: '+15% success rate for DDoS attacks',
        conditions: ['ddos', 'flood'],
        stackable: true
      }
    ],
    position: { x: 50, y: 200 },
    unlocked: true,
    purchased: false,
    maxLevel: 4,
    currentLevel: 0
  },
  {
    id: 'botnet_control',
    name: 'Botnet Command & Control',
    description: 'Manage large networks of compromised systems',
    category: 'offensive',
    specialization: 'warfare',
    tier: 2,
    cost: 3,
    prerequisites: ['ddos_mastery'],
    unlocks: ['zombie_network', 'distributed_computing'],
    bonuses: [
      {
        type: 'resource_efficiency',
        value: 30,
        description: '30% reduced resource cost for mass operations',
        conditions: ['mass_operations'],
        stackable: true
      },
      {
        type: 'passive_income',
        value: 50,
        description: '+50 credits per hour from botnet operations',
        conditions: ['always'],
        stackable: true
      }
    ],
    position: { x: 150, y: 200 },
    unlocked: false,
    purchased: false,
    maxLevel: 5,
    currentLevel: 0
  },
  {
    id: 'cyber_warfare',
    name: 'Cyber Warfare Tactics',
    description: 'Military-grade cyber attack strategies',
    category: 'offensive',
    specialization: 'warfare',
    tier: 3,
    cost: 5,
    prerequisites: ['botnet_control', 'infrastructure_targeting'],
    unlocks: ['nation_state_tools', 'critical_infrastructure'],
    bonuses: [
      {
        type: 'damage_bonus',
        value: 75,
        description: '+75% damage against infrastructure targets',
        conditions: ['infrastructure_attacks'],
        stackable: true
      }
    ],
    position: { x: 250, y: 200 },
    unlocked: false,
    purchased: false,
    maxLevel: 3,
    currentLevel: 0
  },
  {
    id: 'digital_apocalypse',
    name: 'Digital Apocalypse',
    description: 'Ultimate destructive cyber capabilities',
    category: 'offensive',
    specialization: 'warfare',
    tier: 5,
    cost: 10,
    prerequisites: ['cyber_warfare', 'worm_development'],
    unlocks: ['apocalypse_protocol', 'civilization_reset'],
    bonuses: [
      {
        type: 'special_ability',
        value: 1,
        description: 'Unlock civilization-ending cyber weapons',
        conditions: ['endgame'],
        stackable: false
      }
    ],
    position: { x: 350, y: 200 },
    unlocked: false,
    purchased: false,
    maxLevel: 1,
    currentLevel: 0
  },

  // INFILTRATION SPECIALIZATION
  {
    id: 'network_mapping',
    name: 'Network Mapping',
    description: 'Advanced network reconnaissance and topology discovery',
    category: 'offensive',
    specialization: 'infiltration',
    tier: 1,
    cost: 1,
    prerequisites: [],
    unlocks: ['advanced_scanning', 'topology_analysis'],
    bonuses: [
      {
        type: 'command_success',
        value: 20,
        description: '+20% success rate for scanning commands',
        conditions: ['scan', 'nmap', 'recon'],
        stackable: true
      }
    ],
    position: { x: 50, y: 300 },
    unlocked: true,
    purchased: false,
    maxLevel: 4,
    currentLevel: 0
  },
  {
    id: 'lateral_movement',
    name: 'Lateral Movement',
    description: 'Move through networks undetected',
    category: 'offensive',
    specialization: 'infiltration',
    tier: 2,
    cost: 2,
    prerequisites: ['network_mapping'],
    unlocks: ['privilege_escalation', 'persistence_mechanisms'],
    bonuses: [
      {
        type: 'detection_reduction',
        value: 25,
        description: '25% reduced detection when moving through networks',
        conditions: ['network_traversal'],
        stackable: true
      }
    ],
    position: { x: 150, y: 300 },
    unlocked: false,
    purchased: false,
    maxLevel: 5,
    currentLevel: 0
  },
  {
    id: 'deep_infiltration',
    name: 'Deep Infiltration',
    description: 'Penetrate the most secure networks',
    category: 'offensive',
    specialization: 'infiltration',
    tier: 4,
    cost: 7,
    prerequisites: ['lateral_movement', 'advanced_persistence'],
    unlocks: ['air_gap_bridge', 'insider_access'],
    bonuses: [
      {
        type: 'unlock_access',
        value: 1,
        description: 'Access to air-gapped and isolated networks',
        conditions: ['secure_networks'],
        stackable: false
      }
    ],
    position: { x: 250, y: 300 },
    unlocked: false,
    purchased: false,
    maxLevel: 3,
    currentLevel: 0
  },

  // DESTRUCTION SPECIALIZATION
  {
    id: 'data_corruption',
    name: 'Data Corruption',
    description: 'Systematically corrupt and destroy data',
    category: 'offensive',
    specialization: 'destruction',
    tier: 1,
    cost: 1,
    prerequisites: [],
    unlocks: ['file_shredding', 'database_poisoning'],
    bonuses: [
      {
        type: 'damage_bonus',
        value: 30,
        description: '+30% damage to data integrity',
        conditions: ['data_attacks'],
        stackable: true
      }
    ],
    position: { x: 50, y: 400 },
    unlocked: true,
    purchased: false,
    maxLevel: 4,
    currentLevel: 0
  },
  {
    id: 'worm_development',
    name: 'Worm Development',
    description: 'Create self-replicating malware',
    category: 'offensive',
    specialization: 'destruction',
    tier: 3,
    cost: 5,
    prerequisites: ['data_corruption', 'malware_engineering'],
    unlocks: ['self_replicating_virus', 'network_worm'],
    bonuses: [
      {
        type: 'special_ability',
        value: 1,
        description: 'Deploy self-spreading malware',
        conditions: ['worm_deployment'],
        stackable: false
      }
    ],
    position: { x: 150, y: 400 },
    unlocked: false,
    purchased: false,
    maxLevel: 3,
    currentLevel: 0
  }
];

// ===== DEFENSIVE SKILLS =====
export const defensiveSkills: SkillNode[] = [
  // STEALTH SPECIALIZATION
  {
    id: 'basic_stealth',
    name: 'Basic Stealth',
    description: 'Fundamental techniques to avoid detection',
    category: 'defensive',
    specialization: 'stealth',
    tier: 1,
    cost: 1,
    prerequisites: [],
    unlocks: ['traffic_obfuscation', 'log_cleaning'],
    bonuses: [
      {
        type: 'detection_reduction',
        value: 15,
        description: '15% reduced detection chance',
        conditions: ['all_operations'],
        stackable: true
      }
    ],
    position: { x: 50, y: 100 },
    unlocked: true,
    purchased: false,
    maxLevel: 5,
    currentLevel: 0
  },
  {
    id: 'ghost_protocols',
    name: 'Ghost Protocols',
    description: 'Advanced invisibility techniques',
    category: 'defensive',
    specialization: 'stealth',
    tier: 2,
    cost: 3,
    prerequisites: ['basic_stealth'],
    unlocks: ['phantom_mode', 'digital_invisibility'],
    bonuses: [
      {
        type: 'detection_reduction',
        value: 35,
        description: '35% reduced detection chance',
        conditions: ['stealth_operations'],
        stackable: true
      },
      {
        type: 'time_reduction',
        value: 25,
        description: '25% faster stealth command execution',
        conditions: ['stealth_commands'],
        stackable: true
      }
    ],
    position: { x: 150, y: 100 },
    unlocked: false,
    purchased: false,
    maxLevel: 4,
    currentLevel: 0
  },
  {
    id: 'shadow_mastery',
    name: 'Shadow Mastery',
    description: 'Become one with the digital shadows',
    category: 'defensive',
    specialization: 'stealth',
    tier: 4,
    cost: 8,
    prerequisites: ['ghost_protocols', 'advanced_anonymity'],
    unlocks: ['shadow_realm', 'perfect_invisibility'],
    bonuses: [
      {
        type: 'detection_reduction',
        value: 75,
        description: '75% reduced detection chance',
        conditions: ['all_operations'],
        stackable: false
      },
      {
        type: 'special_ability',
        value: 1,
        description: 'Operate completely undetected for short periods',
        conditions: ['shadow_mode'],
        stackable: false
      }
    ],
    position: { x: 250, y: 100 },
    unlocked: false,
    purchased: false,
    maxLevel: 3,
    currentLevel: 0
  },

  // ENCRYPTION SPECIALIZATION
  {
    id: 'basic_cryptography',
    name: 'Basic Cryptography',
    description: 'Fundamental encryption and decryption skills',
    category: 'defensive',
    specialization: 'encryption',
    tier: 1,
    cost: 1,
    prerequisites: [],
    unlocks: ['advanced_encryption', 'key_management'],
    bonuses: [
      {
        type: 'command_success',
        value: 20,
        description: '+20% success rate for encryption/decryption',
        conditions: ['decrypt', 'encrypt'],
        stackable: true
      }
    ],
    position: { x: 50, y: 200 },
    unlocked: true,
    purchased: false,
    maxLevel: 4,
    currentLevel: 0
  },
  {
    id: 'quantum_cryptography',
    name: 'Quantum Cryptography',
    description: 'Next-generation quantum encryption methods',
    category: 'defensive',
    specialization: 'encryption',
    tier: 3,
    cost: 6,
    prerequisites: ['advanced_encryption', 'mathematical_analysis'],
    unlocks: ['quantum_key_distribution', 'unbreakable_encryption'],
    bonuses: [
      {
        type: 'special_ability',
        value: 1,
        description: 'Create theoretically unbreakable encryption',
        conditions: ['quantum_encryption'],
        stackable: false
      }
    ],
    position: { x: 150, y: 200 },
    unlocked: false,
    purchased: false,
    maxLevel: 3,
    currentLevel: 0
  },
  {
    id: 'cryptographic_warfare',
    name: 'Cryptographic Warfare',
    description: 'Use encryption as a weapon',
    category: 'defensive',
    specialization: 'encryption',
    tier: 4,
    cost: 7,
    prerequisites: ['quantum_cryptography'],
    unlocks: ['encryption_bombs', 'data_hostage'],
    bonuses: [
      {
        type: 'damage_bonus',
        value: 100,
        description: 'Double damage when using encryption attacks',
        conditions: ['encryption_attacks'],
        stackable: false
      }
    ],
    position: { x: 250, y: 200 },
    unlocked: false,
    purchased: false,
    maxLevel: 2,
    currentLevel: 0
  },

  // EVASION SPECIALIZATION
  {
    id: 'proxy_chains',
    name: 'Proxy Chains',
    description: 'Route traffic through multiple proxies',
    category: 'defensive',
    specialization: 'evasion',
    tier: 1,
    cost: 1,
    prerequisites: [],
    unlocks: ['tor_mastery', 'vpn_chaining'],
    bonuses: [
      {
        type: 'detection_reduction',
        value: 20,
        description: '20% reduced traceability',
        conditions: ['network_operations'],
        stackable: true
      }
    ],
    position: { x: 50, y: 300 },
    unlocked: true,
    purchased: false,
    maxLevel: 5,
    currentLevel: 0
  },
  {
    id: 'digital_identity_mastery',
    name: 'Digital Identity Mastery',
    description: 'Create and manage multiple digital identities',
    category: 'defensive',
    specialization: 'evasion',
    tier: 2,
    cost: 3,
    prerequisites: ['proxy_chains'],
    unlocks: ['identity_cycling', 'persona_management'],
    bonuses: [
      {
        type: 'special_ability',
        value: 3,
        description: 'Maintain up to 3 active digital identities',
        conditions: ['identity_operations'],
        stackable: true
      }
    ],
    position: { x: 150, y: 300 },
    unlocked: false,
    purchased: false,
    maxLevel: 5,
    currentLevel: 0
  },
  {
    id: 'reality_distortion',
    name: 'Reality Distortion',
    description: 'Manipulate digital reality itself',
    category: 'defensive',
    specialization: 'evasion',
    tier: 5,
    cost: 12,
    prerequisites: ['digital_identity_mastery', 'quantum_tunneling'],
    unlocks: ['reality_manipulation', 'existence_denial'],
    bonuses: [
      {
        type: 'special_ability',
        value: 1,
        description: 'Temporarily erase your digital existence',
        conditions: ['reality_manipulation'],
        stackable: false
      }
    ],
    position: { x: 250, y: 300 },
    unlocked: false,
    purchased: false,
    maxLevel: 1,
    currentLevel: 0
  },

  // FORENSICS SPECIALIZATION
  {
    id: 'log_analysis',
    name: 'Log Analysis',
    description: 'Analyze system logs for intelligence',
    category: 'defensive',
    specialization: 'forensics',
    tier: 1,
    cost: 1,
    prerequisites: [],
    unlocks: ['timeline_reconstruction', 'evidence_gathering'],
    bonuses: [
      {
        type: 'command_success',
        value: 25,
        description: '+25% success rate for forensic commands',
        conditions: ['forensics', 'analysis'],
        stackable: true
      }
    ],
    position: { x: 50, y: 400 },
    unlocked: true,
    purchased: false,
    maxLevel: 4,
    currentLevel: 0
  },
  {
    id: 'memory_forensics',
    name: 'Memory Forensics',
    description: 'Extract secrets from system memory',
    category: 'defensive',
    specialization: 'forensics',
    tier: 2,
    cost: 3,
    prerequisites: ['log_analysis'],
    unlocks: ['ram_analysis', 'process_archaeology'],
    bonuses: [
      {
        type: 'unlock_access',
        value: 1,
        description: 'Access to memory-based intelligence',
        conditions: ['memory_operations'],
        stackable: false
      }
    ],
    position: { x: 150, y: 400 },
    unlocked: false,
    purchased: false,
    maxLevel: 3,
    currentLevel: 0
  },
  {
    id: 'digital_archaeology',
    name: 'Digital Archaeology',
    description: 'Uncover secrets from digital ruins',
    category: 'defensive',
    specialization: 'forensics',
    tier: 4,
    cost: 8,
    prerequisites: ['memory_forensics', 'data_recovery_mastery'],
    unlocks: ['ancient_systems', 'lost_knowledge'],
    bonuses: [
      {
        type: 'special_ability',
        value: 1,
        description: 'Recover data thought permanently lost',
        conditions: ['archaeological_recovery'],
        stackable: false
      }
    ],
    position: { x: 250, y: 400 },
    unlocked: false,
    purchased: false,
    maxLevel: 2,
    currentLevel: 0
  }
];

// ===== SOCIAL SKILLS =====
export const socialSkills: SkillNode[] = [
  // MANIPULATION SPECIALIZATION
  {
    id: 'basic_psychology',
    name: 'Basic Psychology',
    description: 'Understanding human behavior and motivations',
    category: 'social',
    specialization: 'manipulation',
    tier: 1,
    cost: 1,
    prerequisites: [],
    unlocks: ['emotional_manipulation', 'behavioral_analysis'],
    bonuses: [
      {
        type: 'command_success',
        value: 15,
        description: '+15% success rate for social engineering',
        conditions: ['phish', 'social_engineer'],
        stackable: true
      }
    ],
    position: { x: 50, y: 100 },
    unlocked: true,
    purchased: false,
    maxLevel: 5,
    currentLevel: 0
  },
  {
    id: 'neuro_linguistic_programming',
    name: 'Neuro-Linguistic Programming',
    description: 'Advanced psychological manipulation techniques',
    category: 'social',
    specialization: 'manipulation',
    tier: 2,
    cost: 3,
    prerequisites: ['basic_psychology'],
    unlocks: ['mind_control', 'subliminal_influence'],
    bonuses: [
      {
        type: 'command_success',
        value: 35,
        description: '+35% success rate for manipulation',
        conditions: ['manipulation_commands'],
        stackable: true
      }
    ],
    position: { x: 150, y: 100 },
    unlocked: false,
    purchased: false,
    maxLevel: 4,
    currentLevel: 0
  },
  {
    id: 'mass_psychology',
    name: 'Mass Psychology',
    description: 'Manipulate groups and crowds',
    category: 'social',
    specialization: 'manipulation',
    tier: 3,
    cost: 5,
    prerequisites: ['neuro_linguistic_programming'],
    unlocks: ['crowd_control', 'social_contagion'],
    bonuses: [
      {
        type: 'special_ability',
        value: 1,
        description: 'Influence multiple targets simultaneously',
        conditions: ['mass_manipulation'],
        stackable: false
      }
    ],
    position: { x: 250, y: 100 },
    unlocked: false,
    purchased: false,
    maxLevel: 3,
    currentLevel: 0
  },
  {
    id: 'reality_architect',
    name: 'Reality Architect',
    description: 'Reshape perception of reality itself',
    category: 'social',
    specialization: 'manipulation',
    tier: 5,
    cost: 10,
    prerequisites: ['mass_psychology', 'information_warfare'],
    unlocks: ['perception_control', 'reality_engineering'],
    bonuses: [
      {
        type: 'special_ability',
        value: 1,
        description: 'Alter fundamental beliefs and perceptions',
        conditions: ['reality_manipulation'],
        stackable: false
      }
    ],
    position: { x: 350, y: 100 },
    unlocked: false,
    purchased: false,
    maxLevel: 1,
    currentLevel: 0
  },

  // DECEPTION SPECIALIZATION
  {
    id: 'identity_theft',
    name: 'Identity Theft',
    description: 'Steal and assume digital identities',
    category: 'social',
    specialization: 'deception',
    tier: 1,
    cost: 1,
    prerequisites: [],
    unlocks: ['impersonation', 'credential_harvesting'],
    bonuses: [
      {
        type: 'command_success',
        value: 20,
        description: '+20% success rate for identity-based attacks',
        conditions: ['identity_attacks'],
        stackable: true
      }
    ],
    position: { x: 50, y: 200 },
    unlocked: true,
    purchased: false,
    maxLevel: 4,
    currentLevel: 0
  },
  {
    id: 'deep_fake_mastery',
    name: 'Deep Fake Mastery',
    description: 'Create convincing fake media and identities',
    category: 'social',
    specialization: 'deception',
    tier: 2,
    cost: 3,
    prerequisites: ['identity_theft'],
    unlocks: ['synthetic_media', 'voice_cloning'],
    bonuses: [
      {
        type: 'special_ability',
        value: 1,
        description: 'Create undetectable fake media',
        conditions: ['deep_fake_operations'],
        stackable: false
      }
    ],
    position: { x: 150, y: 200 },
    unlocked: false,
    purchased: false,
    maxLevel: 3,
    currentLevel: 0
  },
  {
    id: 'quantum_deception',
    name: 'Quantum Deception',
    description: 'Exist in multiple states of truth simultaneously',
    category: 'social',
    specialization: 'deception',
    tier: 4,
    cost: 8,
    prerequisites: ['deep_fake_mastery', 'parallel_identities'],
    unlocks: ['superposition_identity', 'truth_uncertainty'],
    bonuses: [
      {
        type: 'special_ability',
        value: 1,
        description: 'Maintain contradictory identities simultaneously',
        conditions: ['quantum_identity'],
        stackable: false
      }
    ],
    position: { x: 250, y: 200 },
    unlocked: false,
    purchased: false,
    maxLevel: 2,
    currentLevel: 0
  },

  // INTELLIGENCE SPECIALIZATION
  {
    id: 'human_intelligence',
    name: 'Human Intelligence (HUMINT)',
    description: 'Gather intelligence through human sources',
    category: 'social',
    specialization: 'intelligence',
    tier: 1,
    cost: 1,
    prerequisites: [],
    unlocks: ['source_recruitment', 'intelligence_analysis'],
    bonuses: [
      {
        type: 'passive_income',
        value: 25,
        description: '+25 credits per hour from intelligence operations',
        conditions: ['always'],
        stackable: true
      }
    ],
    position: { x: 50, y: 300 },
    unlocked: true,
    purchased: false,
    maxLevel: 5,
    currentLevel: 0
  },
  {
    id: 'social_network_analysis',
    name: 'Social Network Analysis',
    description: 'Map and exploit social connections',
    category: 'social',
    specialization: 'intelligence',
    tier: 2,
    cost: 2,
    prerequisites: ['human_intelligence'],
    unlocks: ['relationship_mapping', 'influence_networks'],
    bonuses: [
      {
        type: 'command_success',
        value: 30,
        description: '+30% success when targeting connected individuals',
        conditions: ['network_targeting'],
        stackable: true
      }
    ],
    position: { x: 150, y: 300 },
    unlocked: false,
    purchased: false,
    maxLevel: 4,
    currentLevel: 0
  },
  {
    id: 'predictive_modeling',
    name: 'Predictive Modeling',
    description: 'Predict human behavior with AI assistance',
    category: 'social',
    specialization: 'intelligence',
    tier: 3,
    cost: 6,
    prerequisites: ['social_network_analysis'],
    unlocks: ['behavior_prediction', 'decision_forecasting'],
    bonuses: [
      {
        type: 'special_ability',
        value: 1,
        description: 'Predict target responses with high accuracy',
        conditions: ['prediction_operations'],
        stackable: false
      }
    ],
    position: { x: 250, y: 300 },
    unlocked: false,
    purchased: false,
    maxLevel: 3,
    currentLevel: 0
  },

  // INFLUENCE SPECIALIZATION
  {
    id: 'propaganda_creation',
    name: 'Propaganda Creation',
    description: 'Create compelling propaganda and disinformation',
    category: 'social',
    specialization: 'influence',
    tier: 1,
    cost: 1,
    prerequisites: [],
    unlocks: ['viral_content', 'narrative_control'],
    bonuses: [
      {
        type: 'command_success',
        value: 25,
        description: '+25% success rate for influence operations',
        conditions: ['influence_commands'],
        stackable: true
      }
    ],
    position: { x: 50, y: 400 },
    unlocked: true,
    purchased: false,
    maxLevel: 4,
    currentLevel: 0
  },
  {
    id: 'information_warfare',
    name: 'Information Warfare',
    description: 'Weaponize information for strategic advantage',
    category: 'social',
    specialization: 'influence',
    tier: 2,
    cost: 3,
    prerequisites: ['propaganda_creation'],
    unlocks: ['memetic_warfare', 'cognitive_attacks'],
    bonuses: [
      {
        type: 'damage_bonus',
        value: 50,
        description: '+50% damage from information-based attacks',
        conditions: ['information_attacks'],
        stackable: true
      }
    ],
    position: { x: 150, y: 400 },
    unlocked: false,
    purchased: false,
    maxLevel: 4,
    currentLevel: 0
  },
  {
    id: 'memetic_engineering',
    name: 'Memetic Engineering',
    description: 'Engineer viral ideas that spread autonomously',
    category: 'social',
    specialization: 'influence',
    tier: 3,
    cost: 7,
    prerequisites: ['information_warfare'],
    unlocks: ['idea_viruses', 'cultural_programming'],
    bonuses: [
      {
        type: 'special_ability',
        value: 1,
        description: 'Create self-spreading ideas and beliefs',
        conditions: ['memetic_operations'],
        stackable: false
      }
    ],
    position: { x: 250, y: 400 },
    unlocked: false,
    purchased: false,
    maxLevel: 3,
    currentLevel: 0
  },
  {
    id: 'civilization_architect',
    name: 'Civilization Architect',
    description: 'Shape the fundamental structures of society',
    category: 'social',
    specialization: 'influence',
    tier: 5,
    cost: 15,
    prerequisites: ['memetic_engineering', 'reality_architect'],
    unlocks: ['societal_control', 'civilization_design'],
    bonuses: [
      {
        type: 'special_ability',
        value: 1,
        description: 'Influence the direction of human civilization',
        conditions: ['civilization_control'],
        stackable: false
      }
    ],
    position: { x: 350, y: 400 },
    unlocked: false,
    purchased: false,
    maxLevel: 1,
    currentLevel: 0
  }
];

// Combine all skills
export const allSkills: SkillNode[] = [
  ...offensiveSkills,
  ...defensiveSkills,
  ...socialSkills
];

// ===== SKILL SYSTEM FUNCTIONS =====

export function initializeSkillTree(): SkillTree {
  try {
    const skillTree = {
      nodes: allSkills.map(skill => ({ ...skill })), // Deep copy
      skillPoints: 3, // Starting skill points
      totalSkillsUnlocked: 0,
      specializationBonuses: {}
    };
    
    return skillTree;
  } catch (error) {
    console.error('Error in initializeSkillTree:', error);
    // Return a minimal skill tree to prevent crashes
    return {
      nodes: [],
      skillPoints: 3,
      totalSkillsUnlocked: 0,
      specializationBonuses: {}
    };
  }
}

export function canPurchaseSkill(skillId: string, skillTree: SkillTree): { canPurchase: boolean; reason?: string } {
  const skill = skillTree.nodes.find(node => node.id === skillId);
  if (!skill) return { canPurchase: false, reason: 'Skill not found' };
  
  // If skill is already purchased, check if it can be upgraded
  if (skill.purchased && skill.currentLevel >= skill.maxLevel) {
    return { canPurchase: false, reason: 'Skill already at maximum level' };
  }
  
  // Check if player has enough skill points
  if (skillTree.skillPoints < skill.cost) {
    return { canPurchase: false, reason: `Need ${skill.cost} skill points (have ${skillTree.skillPoints})` };
  }
  
  // For first-time purchase, check if skill is unlocked
  if (!skill.purchased && !skill.unlocked) {
    return { canPurchase: false, reason: 'Skill not unlocked yet' };
  }
  
  // Check prerequisites (only for first-time purchase)
  if (!skill.purchased) {
    for (const prereqId of skill.prerequisites) {
      const prereq = skillTree.nodes.find(node => node.id === prereqId);
      if (!prereq || !prereq.purchased) {
        return { canPurchase: false, reason: `Requires ${prereq?.name || prereqId}` };
      }
    }
  }
  
  return { canPurchase: true };
}

export function purchaseSkill(skillId: string, skillTree: SkillTree): { 
  skillTree: SkillTree; 
  unlockedCommands: string[] 
} {
  const canPurchase = canPurchaseSkill(skillId, skillTree);
  if (!canPurchase.canPurchase) {
    return { skillTree, unlockedCommands: [] };
  }
  
  const updatedNodes = skillTree.nodes.map(node => {
    if (node.id === skillId) {
      const newLevel = node.currentLevel + 1;
      return {
        ...node,
        purchased: true,
        currentLevel: newLevel,
        unlocked: true
      };
    }
    return node;
  });
  
  const skill = skillTree.nodes.find(node => node.id === skillId)!;
  const isFirstPurchase = !skill.purchased;
  
  // Unlock dependent skills (only on first purchase)
  if (isFirstPurchase) {
    skill.unlocks.forEach(unlockId => {
      const unlockSkill = updatedNodes.find(node => node.id === unlockId);
      if (unlockSkill) {
        unlockSkill.unlocked = true;
      }
    });
  }
  
  // Update specialization bonuses
  const specializationKey = `${skill.category}_${skill.specialization}`;
  const currentBonus = skillTree.specializationBonuses[specializationKey] || 0;
  
  // Get commands unlocked by this skill (only on first purchase)
  const unlockedCommands = isFirstPurchase ? (skillCommandUnlocks[skillId] || []) : [];
  
  const updatedSkillTree = {
    ...skillTree,
    nodes: updatedNodes,
    skillPoints: skillTree.skillPoints - skill.cost,
    totalSkillsUnlocked: skillTree.totalSkillsUnlocked + (isFirstPurchase ? 1 : 0),
    specializationBonuses: {
      ...skillTree.specializationBonuses,
      [specializationKey]: currentBonus + 1
    }
  };
  
  return { 
    skillTree: updatedSkillTree, 
    unlockedCommands 
  };
}

export function getSkillBonuses(skillTree: SkillTree, command?: string, conditions?: string[]): {
  successBonus: number;
  creditMultiplier: number;
  timeReduction: number;
  detectionReduction: number;
  damageBonus: number;
  specialAbilities: string[];
} {
  let successBonus = 0;
  let creditMultiplier = 1;
  let timeReduction = 0;
  let detectionReduction = 0;
  let damageBonus = 0;
  let specialAbilities: string[] = [];
  
  skillTree.nodes.forEach(skill => {
    if (!skill.purchased) return;
    
    skill.bonuses.forEach(bonus => {
      // Check if bonus conditions are met
      const conditionsMet = !bonus.conditions || bonus.conditions.some(condition => {
        if (command && command.includes(condition)) return true;
        if (conditions && conditions.includes(condition)) return true;
        if (condition === 'always') return true;
        return false;
      });
      
      if (!conditionsMet) return;
      
      const value = bonus.stackable ? bonus.value * skill.currentLevel : bonus.value;
      
      switch (bonus.type) {
        case 'command_success':
          successBonus += value;
          break;
        case 'credit_multiplier':
          creditMultiplier *= value;
          break;
        case 'time_reduction':
          timeReduction += value;
          break;
        case 'detection_reduction':
          detectionReduction += value;
          break;
        case 'damage_bonus':
          damageBonus += value;
          break;
        case 'special_ability':
          specialAbilities.push(bonus.description);
          break;
      }
    });
  });
  
  return {
    successBonus,
    creditMultiplier,
    timeReduction,
    detectionReduction,
    damageBonus,
    specialAbilities
  };
}

export function getSkillsByCategory(category: 'offensive' | 'defensive' | 'social'): SkillNode[] {
  return allSkills.filter(skill => skill.category === category);
}

export function getSkillsByCategories(skillTree: SkillTree): Record<string, SkillNode[]> {
  return skillTree.nodes.reduce((acc, skill) => {
    if (!acc[skill.category]) {
      acc[skill.category] = [];
    }
    acc[skill.category].push(skill);
    return acc;
  }, {} as Record<string, SkillNode[]>);
}

export function getSkillsBySpecialization(category: string, specialization: string): SkillNode[] {
  return allSkills.filter(skill => 
    skill.category === category && skill.specialization === specialization
  );
}

export function calculateSkillTreeProgress(skillTree: SkillTree): {
  totalSkills: number;
  purchasedSkills: number;
  progressPercentage: number;
  categoryProgress: Record<string, { purchased: number; total: number; percentage: number }>;
} {
  try {
    if (!skillTree || !skillTree.nodes) {
      console.warn('Invalid skill tree provided to calculateSkillTreeProgress');
      return {
        totalSkills: 0,
        purchasedSkills: 0,
        progressPercentage: 0,
        categoryProgress: {
          offensive: { purchased: 0, total: 0, percentage: 0 },
          defensive: { purchased: 0, total: 0, percentage: 0 },
          social: { purchased: 0, total: 0, percentage: 0 }
        }
      };
    }

    const totalSkills = allSkills.length;
    const purchasedSkills = skillTree.nodes.filter(skill => skill.purchased).length;
    const progressPercentage = Math.floor((purchasedSkills / totalSkills) * 100);
    
    const categoryProgress: Record<string, { purchased: number; total: number; percentage: number }> = {};
    
    ['offensive', 'defensive', 'social'].forEach(category => {
      const categorySkills = skillTree.nodes.filter(skill => skill.category === category);
      const purchasedCategorySkills = categorySkills.filter(skill => skill.purchased);
      
      categoryProgress[category] = {
        purchased: purchasedCategorySkills.length,
        total: categorySkills.length,
        percentage: categorySkills.length > 0 ? Math.floor((purchasedCategorySkills.length / categorySkills.length) * 100) : 0
      };
    });
    
    return {
      totalSkills,
      purchasedSkills,
      progressPercentage,
      categoryProgress
    };
  } catch (error) {
    console.error('Error in calculateSkillTreeProgress:', error);
    return {
      totalSkills: 0,
      purchasedSkills: 0,
      progressPercentage: 0,
      categoryProgress: {
        offensive: { purchased: 0, total: 0, percentage: 0 },
        defensive: { purchased: 0, total: 0, percentage: 0 },
        social: { purchased: 0, total: 0, percentage: 0 }
      }
    };
  }
}

// Award skill points for various achievements
export function awardSkillPoints(gameState: GameState, reason: string, amount: number = 1): number {
  const currentPoints = gameState.skillTree?.skillPoints || 0;
  return currentPoints + amount;
} 