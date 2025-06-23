import { initializeSkillTree, canPurchaseSkill, purchaseSkill } from './skillSystem';

// Test function to verify skill purchase mechanics
export function testSkillPurchaseSystem() {
  console.log('Testing Skill Purchase System...');
  
  // Initialize a fresh skill tree
  let skillTree = initializeSkillTree();
  console.log('Initial state:', {
    skillPoints: skillTree.skillPoints,
    totalNodes: skillTree.nodes.length,
    purchasedSkills: skillTree.nodes.filter(n => n.purchased).length
  });
  
  // Find a skill that should be unlocked by default
  const basicSkill = skillTree.nodes.find(n => n.unlocked && !n.purchased);
  if (!basicSkill) {
    console.error('No unlocked skills found!');
    return false;
  }
  
  console.log(`Testing skill: ${basicSkill.name} (${basicSkill.id})`);
  
  // Check if we can purchase it
  const canPurchase = canPurchaseSkill(basicSkill.id, skillTree);
  console.log('Can purchase?', canPurchase);
  
  if (!canPurchase.canPurchase) {
    console.error('Cannot purchase:', canPurchase.reason);
    return false;
  }
  
  // Purchase the skill
  const result = purchaseSkill(basicSkill.id, skillTree);
  skillTree = result.skillTree;
  
  // Check if purchase was successful
  const purchasedSkill = skillTree.nodes.find(n => n.id === basicSkill.id);
  if (!purchasedSkill?.purchased) {
    console.error('Skill was not marked as purchased!');
    return false;
  }
  
  console.log('Skill purchase successful!', {
    skillName: purchasedSkill.name,
    purchased: purchasedSkill.purchased,
    currentLevel: purchasedSkill.currentLevel,
    remainingPoints: skillTree.skillPoints,
    unlockedCommands: result.unlockedCommands
  });
  
  return true;
}

// Run test if called directly
if (typeof window !== 'undefined') {
  (window as any).testSkillSystem = testSkillPurchaseSystem;
  console.log('Test function available as window.testSkillSystem()');
} 