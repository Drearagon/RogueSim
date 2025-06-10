import { SkillNode, SkillTree } from '../types/game';

export const skillTreeData: SkillNode[] = [
  // Reconnaissance Branch
  {
    id: 'basic_scan',
    name: 'Basic Scanning',
    description: 'Unlock advanced network scanning capabilities',
    category: 'reconnaissance',
    specialization: 'general',
    tier: 1,
    cost: 1,
    prerequisites: [],
    unlocks: ['nmap', 'portscan'],
    position: { x: 100, y: 100 },
    unlocked: true,
    purchased: false,
    bonuses: [],
    maxLevel: 1,
    currentLevel: 1
  },
  {
    id: 'advanced_recon',
    name: 'Advanced Recon',
    description: 'Deep packet inspection and traffic analysis',
    category: 'reconnaissance',
    specialization: 'general',
    tier: 2,
    cost: 2,
    prerequisites: ['basic_scan'],
    unlocks: ['sniff', 'analyze'],
    position: { x: 200, y: 100 },
    unlocked: false,
    purchased: false,
    bonuses: [],
    maxLevel: 1,
    currentLevel: 1
  },
  {
    id: 'stealth_scan',
    name: 'Stealth Scanning',
    description: 'Scan targets without detection',
    category: 'reconnaissance',
    specialization: 'general',
    tier: 3,
    cost: 3,
    prerequisites: ['advanced_recon'],
    unlocks: ['stealth_mode'],
    position: { x: 300, y: 100 },
    unlocked: false,
    purchased: false,
    bonuses: [],
    maxLevel: 1,
    currentLevel: 1
  },

  // Exploitation Branch
  {
    id: 'basic_exploit',
    name: 'Basic Exploitation',
    description: 'Execute simple exploits against vulnerabilities',
    category: 'exploitation',
    specialization: 'general',
    tier: 1,
    cost: 2,
    prerequisites: [],
    unlocks: ['exploit', 'buffer_overflow'],
    position: { x: 100, y: 200 },
    unlocked: true,
    purchased: false,
    bonuses: [],
    maxLevel: 1,
    currentLevel: 1
  },
  {
    id: 'advanced_exploit',
    name: 'Advanced Exploitation',
    description: 'Chain exploits for privilege escalation',
    category: 'exploitation',
    specialization: 'general',
    tier: 2,
    cost: 3,
    prerequisites: ['basic_exploit'],
    unlocks: ['privesc', 'rce'],
    position: { x: 200, y: 200 },
    unlocked: false,
    purchased: false,
    bonuses: [],
    maxLevel: 1,
    currentLevel: 1
  },
  {
    id: 'zero_day',
    name: 'Zero-Day Master',
    description: 'Craft and deploy zero-day exploits',
    category: 'exploitation',
    specialization: 'general',
    tier: 3,
    cost: 5,
    prerequisites: ['advanced_exploit'],
    unlocks: ['zero_day_craft'],
    position: { x: 300, y: 200 },
    unlocked: false,
    purchased: false,
    bonuses: [],
    maxLevel: 1,
    currentLevel: 1
  },

  // Persistence Branch
  {
    id: 'basic_backdoor',
    name: 'Basic Backdoor',
    description: 'Install simple backdoors for persistent access',
    category: 'persistence',
    specialization: 'general',
    tier: 1,
    cost: 2,
    prerequisites: ['basic_exploit'],
    unlocks: ['backdoor', 'reverse_shell'],
    position: { x: 100, y: 300 },
    unlocked: false,
    purchased: false,
    bonuses: [],
    maxLevel: 1,
    currentLevel: 1
  },
  {
    id: 'advanced_persistence',
    name: 'Advanced Persistence',
    description: 'Rootkits and kernel-level persistence',
    category: 'persistence',
    specialization: 'general',
    tier: 2,
    cost: 4,
    prerequisites: ['basic_backdoor'],
    unlocks: ['rootkit', 'kernel_mod'],
    position: { x: 200, y: 300 },
    unlocked: false,
    purchased: false,
    bonuses: [],
    maxLevel: 1,
    currentLevel: 1
  },

  // Evasion Branch
  {
    id: 'basic_evasion',
    name: 'Basic Evasion',
    description: 'Avoid detection by security systems',
    category: 'evasion',
    specialization: 'general',
    tier: 1,
    cost: 2,
    prerequisites: [],
    unlocks: ['spoof', 'encrypt_traffic'],
    position: { x: 100, y: 400 },
    unlocked: true,
    purchased: false,
    bonuses: [],
    maxLevel: 1,
    currentLevel: 1
  },
  {
    id: 'advanced_evasion',
    name: 'Advanced Evasion',
    description: 'Polymorphic code and anti-forensics',
    category: 'evasion',
    specialization: 'general',
    tier: 2,
    cost: 3,
    prerequisites: ['basic_evasion'],
    unlocks: ['polymorphic', 'anti_forensics'],
    position: { x: 200, y: 400 },
    unlocked: false,
    purchased: false,
    bonuses: [],
    maxLevel: 1,
    currentLevel: 1
  },

  // Social Engineering Branch
  {
    id: 'basic_social',
    name: 'Social Engineering',
    description: 'Human-based attack vectors',
    category: 'social',
    specialization: 'general',
    tier: 1,
    cost: 2,
    prerequisites: [],
    unlocks: ['phish', 'vishing'],
    position: { x: 100, y: 500 },
    unlocked: true,
    purchased: false,
    bonuses: [],
    maxLevel: 1,
    currentLevel: 1
  },
  {
    id: 'advanced_social',
    name: 'Advanced Social Eng',
    description: 'Psychological manipulation techniques',
    category: 'social',
    specialization: 'general',
    tier: 2,
    cost: 3,
    prerequisites: ['basic_social'],
    unlocks: ['pretexting', 'influence'],
    position: { x: 200, y: 500 },
    unlocked: false,
    purchased: false,
    bonuses: [],
    maxLevel: 1,
    currentLevel: 1
  }
];

export function createDefaultSkillTree(): SkillTree {
  return {
    nodes: skillTreeData.map(node => ({ ...node })),
    skillPoints: 5, // Starting skill points
    totalSkillsUnlocked: 0,
    specializationBonuses: {}
  };
}

export function canPurchaseSkill(skillId: string, skillTree: SkillTree): boolean {
  const skill = skillTree.nodes.find(node => node.id === skillId);
  if (!skill || skill.purchased || !skill.unlocked) return false;
  
  // Check if we have enough skill points
  if (skillTree.skillPoints < skill.cost) return false;
  
  // Check prerequisites
  return skill.prerequisites.every(prereq => 
    skillTree.nodes.find(node => node.id === prereq)?.purchased
  );
}

export function purchaseSkill(skillId: string, skillTree: SkillTree): SkillTree {
  if (!canPurchaseSkill(skillId, skillTree)) return skillTree;
  
  const newSkillTree = {
    ...skillTree,
    skillPoints: skillTree.skillPoints - skillTree.nodes.find(node => node.id === skillId)!.cost,
    nodes: skillTree.nodes.map(node => {
      if (node.id === skillId) {
        return { ...node, purchased: true };
      }
      return { ...node };
    })
  };
  
  // Unlock dependent skills
  const purchasedSkill = newSkillTree.nodes.find(node => node.id === skillId)!;
  newSkillTree.nodes.forEach(node => {
    if (node.prerequisites.includes(skillId)) {
      node.unlocked = true;
    }
  });
  
  return newSkillTree;
}

export function getSkillsByCategory(skillTree: SkillTree) {
  return skillTree.nodes.reduce((acc, skill) => {
    if (!acc[skill.category]) {
      acc[skill.category] = [];
    }
    acc[skill.category].push(skill);
    return acc;
  }, {} as Record<string, SkillNode[]>);
}