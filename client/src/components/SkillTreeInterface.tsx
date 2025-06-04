import React, { useState } from 'react';
import { GameState, SkillNode } from '../types/game';
import { 
  skillCategories, 
  getSkillsByCategory, 
  canPurchaseSkill, 
  purchaseSkill,
  calculateSkillTreeProgress 
} from '../lib/skillSystem';

interface SkillTreeInterfaceProps {
  gameState: GameState;
  onSkillPurchase: (skillId: string) => void;
  onClose: () => void;
}

export function SkillTreeInterface({ gameState, onSkillPurchase, onClose }: SkillTreeInterfaceProps) {
  const [activeCategory, setActiveCategory] = useState<'offensive' | 'defensive' | 'social'>('offensive');
  const [selectedSkill, setSelectedSkill] = useState<SkillNode | null>(null);
  
  // Safety check for gameState and skillTree
  if (!gameState || !gameState.skillTree || !gameState.skillTree.nodes) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
        <div className="bg-gray-900 border border-red-500 rounded-lg p-6 max-w-md w-full mx-4">
          <h2 className="text-xl font-bold text-red-400 mb-4">Error Loading Skill Tree</h2>
          <p className="text-gray-400 mb-4">
            The skill tree system is not properly initialized. Please try refreshing the page.
          </p>
          <button
            onClick={onClose}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded"
          >
            Close
          </button>
        </div>
      </div>
    );
  }
  
  const progress = calculateSkillTreeProgress(gameState.skillTree);
  const categorySkills = getSkillsByCategory(activeCategory);
  
  const getSkillIcon = (skill: SkillNode) => {
    if (skill.purchased) return '✓';
    if (skill.unlocked) return '○';
    return '✗';
  };
  
  const getSkillColor = (skill: SkillNode) => {
    if (skill.purchased) return 'text-green-400';
    if (skill.unlocked) return 'text-blue-400';
    return 'text-gray-600';
  };
  
  const getTierColor = (tier: number) => {
    const colors = ['text-gray-400', 'text-green-400', 'text-blue-400', 'text-purple-400', 'text-orange-400'];
    return colors[tier - 1] || 'text-gray-400';
  };
  
  const handleSkillPurchase = (skillId: string) => {
    const canPurchase = canPurchaseSkill(skillId, gameState.skillTree);
    if (canPurchase.canPurchase) {
      onSkillPurchase(skillId);
    }
  };
  
  // Group skills by specialization
  const skillsBySpecialization = categorySkills.reduce((acc, skill) => {
    if (!acc[skill.specialization]) {
      acc[skill.specialization] = [];
    }
    acc[skill.specialization].push(skill);
    return acc;
  }, {} as Record<string, SkillNode[]>);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-green-500 rounded-lg p-6 max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-green-400 mb-2">🧠 Neural Enhancement Matrix</h2>
            <div className="text-sm text-gray-400">
              <span>Progress: {progress.purchasedSkills}/{progress.totalSkills} skills ({progress.progressPercentage}%)</span>
              <span className="ml-4">Available Points: {gameState.skillTree.skillPoints}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-red-400 hover:text-red-300 text-xl font-bold"
          >
            ✕
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex space-x-4 mb-6">
          {Object.entries(skillCategories).map(([key, category]) => (
            <button
              key={key}
              onClick={() => setActiveCategory(key as any)}
              className={`px-4 py-2 rounded border transition-colors ${
                activeCategory === key
                  ? 'border-green-500 bg-green-900 text-green-400'
                  : 'border-gray-600 bg-gray-800 text-gray-400 hover:border-gray-500'
              }`}
            >
              {category.name}
              <div className="text-xs mt-1">
                {progress.categoryProgress[key].purchased}/{progress.categoryProgress[key].total}
              </div>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Skill Tree */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800 border border-gray-600 rounded-lg p-4">
              <h3 className="text-lg font-bold text-green-400 mb-4">
                {skillCategories[activeCategory].name}
              </h3>
              <p className="text-gray-400 text-sm mb-6">
                {skillCategories[activeCategory].description}
              </p>

              {/* Specializations */}
              {Object.entries(skillsBySpecialization).map(([specialization, skills]) => (
                <div key={specialization} className="mb-8">
                  <h4 className="text-md font-semibold text-blue-400 mb-3 border-b border-gray-700 pb-2">
                    {specialization.replace('_', ' ').toUpperCase()}
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {skills.map((skill) => {
                      const canPurchase = canPurchaseSkill(skill.id, gameState.skillTree);
                      
                      return (
                        <div
                          key={skill.id}
                          onClick={() => setSelectedSkill(skill)}
                          className={`p-3 border rounded cursor-pointer transition-all ${
                            selectedSkill?.id === skill.id
                              ? 'border-green-500 bg-green-900 bg-opacity-30'
                              : skill.purchased
                              ? 'border-green-600 bg-green-900 bg-opacity-20'
                              : skill.unlocked
                              ? 'border-blue-600 bg-blue-900 bg-opacity-20 hover:border-blue-500'
                              : 'border-gray-700 bg-gray-800 opacity-60'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className={`text-lg ${getSkillColor(skill)}`}>
                              {getSkillIcon(skill)}
                            </span>
                            <div className="flex items-center space-x-2">
                              <span className={`text-xs ${getTierColor(skill.tier)}`}>
                                Tier {skill.tier}
                              </span>
                              <span className="text-xs text-gray-400">
                                {skill.cost}pts
                              </span>
                            </div>
                          </div>
                          
                          <h5 className={`font-semibold text-sm mb-1 ${getSkillColor(skill)}`}>
                            {skill.name}
                          </h5>
                          
                          <p className="text-xs text-gray-400 mb-2">
                            {skill.description.substring(0, 80)}...
                          </p>
                          
                          {skill.purchased && (
                            <div className="text-xs text-green-400">
                              Level {skill.currentLevel}/{skill.maxLevel}
                            </div>
                          )}
                          
                          {!skill.purchased && skill.unlocked && canPurchase.canPurchase && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSkillPurchase(skill.id);
                              }}
                              className="text-xs bg-green-600 hover:bg-green-500 text-white px-2 py-1 rounded mt-2"
                            >
                              Purchase
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Skill Details */}
          <div className="bg-gray-800 border border-gray-600 rounded-lg p-4">
            {selectedSkill ? (
              <div>
                <h3 className="text-lg font-bold text-green-400 mb-4">
                  {selectedSkill.name}
                </h3>
                
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-gray-400">Description:</span>
                    <p className="text-white mt-1">{selectedSkill.description}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-gray-400">Tier:</span>
                      <p className={`${getTierColor(selectedSkill.tier)}`}>
                        {selectedSkill.tier}/5
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-400">Cost:</span>
                      <p className="text-white">{selectedSkill.cost} points</p>
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-gray-400">Level:</span>
                    <p className="text-white">
                      {selectedSkill.currentLevel}/{selectedSkill.maxLevel}
                    </p>
                  </div>
                  
                  {selectedSkill.bonuses.length > 0 && (
                    <div>
                      <span className="text-gray-400">Bonuses:</span>
                      <div className="mt-2 space-y-2">
                        {selectedSkill.bonuses.map((bonus, index) => (
                          <div key={index} className="bg-gray-700 p-2 rounded">
                            <div className="text-blue-400 text-xs font-semibold">
                              {bonus.type.replace('_', ' ').toUpperCase()}
                            </div>
                            <div className="text-white text-xs">
                              {bonus.description}
                            </div>
                            <div className="text-gray-400 text-xs">
                              Value: {bonus.value}{bonus.stackable ? ' (per level)' : ''}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {selectedSkill.prerequisites.length > 0 && (
                    <div>
                      <span className="text-gray-400">Prerequisites:</span>
                      <ul className="mt-1 text-white text-xs">
                        {selectedSkill.prerequisites.map((prereq, index) => (
                          <li key={index}>• {prereq}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {selectedSkill.unlocks.length > 0 && (
                    <div>
                      <span className="text-gray-400">Unlocks:</span>
                      <ul className="mt-1 text-white text-xs">
                        {selectedSkill.unlocks.map((unlock, index) => (
                          <li key={index}>• {unlock}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  <div className="pt-4 border-t border-gray-700">
                    {selectedSkill.purchased ? (
                      <div className="text-green-400 text-sm">✓ Skill Acquired</div>
                    ) : selectedSkill.unlocked ? (
                      canPurchaseSkill(selectedSkill.id, gameState.skillTree).canPurchase ? (
                        <button
                          onClick={() => handleSkillPurchase(selectedSkill.id)}
                          className="w-full bg-green-600 hover:bg-green-500 text-white py-2 px-4 rounded"
                        >
                          Purchase Skill
                        </button>
                      ) : (
                        <div className="text-red-400 text-sm">
                          {canPurchaseSkill(selectedSkill.id, gameState.skillTree).reason}
                        </div>
                      )
                    ) : (
                      <div className="text-gray-500 text-sm">✗ Skill Locked</div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-400">
                <div className="text-4xl mb-4">🧠</div>
                <p>Select a skill to view details</p>
                <div className="mt-4 text-sm">
                  <p>Available Points: {gameState.skillTree.skillPoints}</p>
                  <p className="mt-2">
                    Skills enhance your hacking capabilities with permanent bonuses
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 flex justify-center space-x-8 text-sm">
          <div className="flex items-center space-x-2">
            <span className="text-green-400">✓</span>
            <span className="text-gray-400">Purchased</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-blue-400">○</span>
            <span className="text-gray-400">Available</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-gray-600">✗</span>
            <span className="text-gray-400">Locked</span>
          </div>
        </div>
      </div>
    </div>
  );
} 