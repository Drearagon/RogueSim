import { test, expect } from 'vitest';
import { initializeSkillTree, purchaseSkill } from '../client/src/lib/skillSystem';

test('purchasing a skill increases its level and reduces skill points', () => {
  const tree = initializeSkillTree();
  const skill = tree.nodes.find(s => s.unlocked && !s.purchased)!;
  const startingPoints = tree.skillPoints;
  const { skillTree } = purchaseSkill(skill.id, tree);
  const updated = skillTree.nodes.find(n => n.id === skill.id)!;
  expect(updated.purchased).toBe(true);
  expect(updated.currentLevel).toBe(skill.currentLevel + 1);
  expect(skillTree.skillPoints).toBe(startingPoints - skill.cost);
});
