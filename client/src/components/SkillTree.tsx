import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SkillNode, SkillTree as SkillTreeType, GameState } from '../types/game';
import { canPurchaseSkill, purchaseSkill, getSkillsByCategories } from '../lib/skillSystem';
import { Lock, Unlock, Zap, Shield, Eye, Users, Cpu } from 'lucide-react';

interface SkillTreeProps {
  gameState: GameState;
  onUpdateGameState: (updates: Partial<GameState>) => void;
  onClose: () => void;
}

const categoryIcons = {
  reconnaissance: Eye,
  exploitation: Zap,
  persistence: Cpu,
  evasion: Shield,
  social: Users
};

const categoryColors = {
  reconnaissance: 'from-blue-500 to-cyan-500',
  exploitation: 'from-red-500 to-orange-500',
  persistence: 'from-purple-500 to-pink-500',
  evasion: 'from-green-500 to-emerald-500',
  social: 'from-yellow-500 to-amber-500'
};

export function SkillTree({ gameState, onUpdateGameState, onClose }: SkillTreeProps) {
  const [selectedSkill, setSelectedSkill] = useState<SkillNode | null>(null);
  const [hoveredSkill, setHoveredSkill] = useState<string | null>(null);
  const skillsByCategory = getSkillsByCategories(gameState.skillTree);

  const handlePurchaseSkill = (skillId: string) => {
    const canPurchase = canPurchaseSkill(skillId, gameState.skillTree);
    if (canPurchase.canPurchase) {
      const result = purchaseSkill(skillId, gameState.skillTree);
      onUpdateGameState({ 
        skillTree: result.skillTree,
        unlockedCommands: [
          ...gameState.unlockedCommands,
          ...result.unlockedCommands
        ]
      });
      setSelectedSkill(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-black/80 border border-green-500/30 rounded-lg p-6 max-w-6xl w-full max-h-[90vh] overflow-y-auto backdrop-blur-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-green-400 mb-2">Skill Tree</h2>
            <p className="text-green-300/70">
              Skill Points Available: <span className="text-green-400 font-bold">{gameState.skillTree.skillPoints}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-green-400 hover:text-green-300 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(skillsByCategory).map(([category, skills]) => {
            const IconComponent = categoryIcons[category as keyof typeof categoryIcons];
            const colorClass = categoryColors[category as keyof typeof categoryColors];
            
            return (
              <motion.div
                key={category}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: Object.keys(skillsByCategory).indexOf(category) * 0.1 }}
                className="bg-gray-900/50 border border-green-500/20 rounded-lg p-4"
              >
                <div className="flex items-center gap-2 mb-4">
                  <div className={`p-2 rounded-lg bg-gradient-to-r ${colorClass}`}>
                    <IconComponent className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-green-400 capitalize">
                    {category}
                  </h3>
                </div>

                <div className="space-y-3">
                  {skills.map((skill) => (
                    <SkillNodeComponent
                      key={skill.id}
                      skill={skill}
                      skillTree={gameState.skillTree}
                      isHovered={hoveredSkill === skill.id}
                      isSelected={selectedSkill?.id === skill.id}
                      onHover={setHoveredSkill}
                      onClick={setSelectedSkill}
                      onPurchase={() => handlePurchaseSkill(skill.id)}
                      categoryColor={colorClass}
                    />
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>

        <AnimatePresence>
          {selectedSkill && (
            <SkillDetailModal
              skill={selectedSkill}
              skillTree={gameState.skillTree}
              onClose={() => setSelectedSkill(null)}
              onPurchase={() => handlePurchaseSkill(selectedSkill.id)}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

interface SkillNodeComponentProps {
  skill: SkillNode;
  skillTree: SkillTreeType;
  isHovered: boolean;
  isSelected: boolean;
  onHover: (skillId: string | null) => void;
  onClick: (skill: SkillNode) => void;
  onPurchase: () => void;
  categoryColor: string;
}

function SkillNodeComponent({
  skill,
  skillTree,
  isHovered,
  isSelected,
  onHover,
  onClick,
  onPurchase,
  categoryColor
}: SkillNodeComponentProps) {
  const canPurchase = canPurchaseSkill(skill.id, skillTree);
  const isLocked = !skill.unlocked;
  const isPurchased = skill.purchased;

  return (
    <motion.div
      layout
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`
        relative p-3 rounded-lg border-2 cursor-pointer transition-all duration-300
        ${isPurchased 
          ? `bg-gradient-to-r ${categoryColor}/20 border-green-400` 
          : isLocked
          ? 'bg-gray-800/30 border-gray-600'
          : canPurchase
          ? 'bg-green-900/20 border-green-500/50 hover:border-green-400'
          : 'bg-gray-800/50 border-gray-500'
        }
        ${isHovered && 'ring-2 ring-green-400/50'}
      `}
      onMouseEnter={() => onHover(skill.id)}
      onMouseLeave={() => onHover(null)}
      onClick={() => onClick(skill)}
    >
      <div className="flex items-center justify-between mb-2">
        <h4 className={`font-semibold text-sm ${isPurchased ? 'text-green-400' : isLocked ? 'text-gray-500' : 'text-green-300'}`}>
          {skill.name}
        </h4>
        <div className="flex items-center gap-1">
          {isPurchased ? (
            <Unlock className="w-4 h-4 text-green-400" />
          ) : isLocked ? (
            <Lock className="w-4 h-4 text-gray-500" />
          ) : (
            <span className={`text-xs px-2 py-1 rounded ${canPurchase ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-300'}`}>
              {skill.cost}SP
            </span>
          )}
        </div>
      </div>

      <p className={`text-xs ${isPurchased ? 'text-green-300/80' : isLocked ? 'text-gray-500' : 'text-green-300/60'}`}>
        {skill.description}
      </p>

      {skill.unlocks.length > 0 && (
        <div className="mt-2">
          <p className="text-xs text-green-400/70 mb-1">Unlocks:</p>
          <div className="flex flex-wrap gap-1">
            {skill.unlocks.map((unlock) => (
              <span
                key={unlock}
                className="text-xs px-2 py-1 bg-green-900/30 text-green-400 rounded"
              >
                {unlock}
              </span>
            ))}
          </div>
        </div>
      )}

      {isPurchased && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
        >
          <span className="text-white text-xs">✓</span>
        </motion.div>
      )}
    </motion.div>
  );
}

interface SkillDetailModalProps {
  skill: SkillNode;
  skillTree: SkillTreeType;
  onClose: () => void;
  onPurchase: () => void;
}

function SkillDetailModal({ skill, skillTree, onClose, onPurchase }: SkillDetailModalProps) {
  const canPurchase = canPurchaseSkill(skill.id, skillTree);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-60"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gray-900 border border-green-500 rounded-lg p-6 max-w-md w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-xl font-bold text-green-400 mb-3">{skill.name}</h3>
        <p className="text-green-300/80 mb-4">{skill.description}</p>

        <div className="space-y-3 mb-6">
          <div>
            <span className="text-green-400 text-sm">Cost: </span>
            <span className="text-white">{skill.cost} Skill Points</span>
          </div>

          {skill.prerequisites.length > 0 && (
            <div>
              <span className="text-green-400 text-sm">Prerequisites: </span>
              <div className="flex flex-wrap gap-1 mt-1">
                {skill.prerequisites.map((prereq) => (
                  <span key={prereq} className="text-xs px-2 py-1 bg-gray-800 text-green-300 rounded">
                    {prereq}
                  </span>
                ))}
              </div>
            </div>
          )}

          {skill.unlocks.length > 0 && (
            <div>
              <span className="text-green-400 text-sm">Unlocks: </span>
              <div className="flex flex-wrap gap-1 mt-1">
                {skill.unlocks.map((unlock) => (
                  <span key={unlock} className="text-xs px-2 py-1 bg-green-900 text-green-400 rounded">
                    {unlock}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
          >
            Close
          </button>
          {!skill.purchased && (
            <button
              onClick={onPurchase}
              disabled={!canPurchase}
              className={`flex-1 px-4 py-2 rounded transition-colors ${
                canPurchase
                  ? 'bg-green-600 text-white hover:bg-green-500'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }`}
            >
              {canPurchase ? 'Purchase' : 'Cannot Purchase'}
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}