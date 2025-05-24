import React from 'react';
import { motion } from 'framer-motion';
import { ShopCategory } from '../../types/game';
import { Cpu, Shield, Zap, Skull, ChevronRight, X } from 'lucide-react';

interface ShopNavigationProps {
  activeTab: ShopCategory;
  onTabChange: (tab: ShopCategory) => void;
  onClose: () => void;
  credits: number;
  skillPoints: number;
}

const TAB_CONFIG = [
  { id: 'software' as const, label: 'Software', icon: Cpu, description: 'Tools & Payloads' },
  { id: 'hardware' as const, label: 'Hardware', icon: Shield, description: 'Physical Devices' },
  { id: 'skills' as const, label: 'Skills', icon: Zap, description: 'Ability Upgrades' },
  { id: 'blackmarket' as const, label: 'Black Market', icon: Skull, description: 'Illegal Items' }
];

export function ShopNavigation({ 
  activeTab, 
  onTabChange, 
  onClose, 
  credits, 
  skillPoints 
}: ShopNavigationProps) {
  return (
    <motion.div
      initial={{ x: -300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -300, opacity: 0 }}
      className="bg-black/95 border-r border-green-500/30 w-80 p-6 backdrop-blur-md overflow-y-auto"
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-green-400">Shop Interface</h2>
          <p className="text-green-300/60 text-sm">Secure marketplace</p>
        </div>
        <button 
          onClick={onClose} 
          className="text-green-400 hover:text-green-300 transition-colors p-1"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Currency Display */}
      <div className="mb-6 p-4 rounded-lg bg-green-900/20 border border-green-500/30">
        <div className="flex justify-between items-center mb-2">
          <span className="text-green-300 text-sm">Credits</span>
          <span className="font-bold text-green-400 text-lg">{credits}₵</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-green-300 text-sm">Skill Points</span>
          <span className="font-bold text-green-400 text-lg">{skillPoints}</span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="space-y-2">
        <h3 className="text-green-400 text-sm font-semibold mb-3 uppercase tracking-wider">
          Categories
        </h3>
        {TAB_CONFIG.map(({ id, label, icon: Icon, description }) => (
          <motion.button
            key={id}
            onClick={() => onTabChange(id)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`w-full flex items-center gap-3 p-4 rounded-lg transition-all group ${
              activeTab === id
                ? 'bg-green-900/40 border border-green-500/50 text-green-400'
                : 'bg-gray-900/30 border border-gray-600/30 text-green-300 hover:bg-green-900/20 hover:border-green-500/30'
            }`}
          >
            <div className={`p-2 rounded-lg transition-colors ${
              activeTab === id 
                ? 'bg-green-600' 
                : 'bg-gray-700 group-hover:bg-green-700'
            }`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 text-left">
              <div className="font-medium">{label}</div>
              <div className="text-xs opacity-70">{description}</div>
            </div>
            <ChevronRight className={`w-4 h-4 transition-transform ${
              activeTab === id ? 'rotate-90' : 'group-hover:translate-x-1'
            }`} />
          </motion.button>
        ))}
      </div>

      {/* Status Info */}
      <div className="mt-6 p-4 rounded-lg bg-gray-900/30 border border-gray-600/30">
        <h4 className="text-green-400 text-sm font-semibold mb-2">Quick Info</h4>
        <div className="space-y-1 text-xs text-green-300/70">
          <p>• Items unlock new commands</p>
          <p>• Check prerequisites before buying</p>
          <p>• Black market items are high-risk</p>
          <p>• Skills provide permanent upgrades</p>
        </div>
      </div>
    </motion.div>
  );
}