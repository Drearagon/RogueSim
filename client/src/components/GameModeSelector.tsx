// @ts-nocheck
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Gamepad2, Users, Settings, User, LogOut } from 'lucide-react';

interface GameModeSelectorProps {
  currentMode: 'single' | 'multiplayer';
  hackerName: string;
  userEmail?: string;
  onModeChange: (mode: 'single' | 'multiplayer') => void;
  onStartGame: (mode?: 'single' | 'multiplayer') => void;
  onShowMultiplayerRoom: () => void;
  onShowLeaderboard: () => void;
  onLogout: () => void;
}

export function GameModeSelector({ 
  currentMode, 
  hackerName, 
  userEmail,
  onModeChange, 
  onStartGame,
  onLogout 
}: GameModeSelectorProps) {
  const [selectedMode, setSelectedMode] = useState<'single' | 'multiplayer'>(currentMode);

  const handleModeSelect = (mode: 'single' | 'multiplayer') => {
    setSelectedMode(mode);
    onModeChange(mode);
  };

  return (
    <div className="min-h-screen bg-black text-green-400 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-900 border border-green-500 rounded-lg p-8"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <User className="w-6 h-6 text-green-400 mr-2" />
                <span className="text-lg font-bold text-green-400">{hackerName}</span>
              </div>
              <motion.button
                onClick={onLogout}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center text-red-400 hover:text-red-300 transition-colors"
              >
                <LogOut className="w-5 h-5 mr-1" />
                Logout
              </motion.button>
            </div>
            <h1 className="text-3xl font-bold text-green-400 mb-2">
              Select Game Mode
            </h1>
            <p className="text-gray-400">
              Choose how you want to experience RogueSim
            </p>
            {userEmail && (
              <p className="text-sm text-green-300 mt-2">
                {userEmail}
              </p>
            )}
          </div>

          {/* Mode Selection */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Single Player Mode */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`border rounded-lg p-6 cursor-pointer transition-all ${
                selectedMode === 'single'
                  ? 'border-green-400 bg-green-900/20 shadow-lg shadow-green-400/20'
                  : 'border-gray-600 hover:border-green-500'
              }`}
              onClick={() => handleModeSelect('single')}
            >
              <div className="text-center">
                <Gamepad2 className="w-16 h-16 text-green-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-green-400 mb-2">
                  Single Player
                </h3>
                <p className="text-gray-400 text-sm mb-4">
                  Solo hacking adventures with procedural missions, skill progression, and personal challenges.
                </p>
                <div className="space-y-2 text-xs text-green-300">
                  <div>✓ Story-driven campaigns</div>
                  <div>✓ Skill tree progression</div>
                  <div>✓ Shop and equipment upgrades</div>
                  <div>✓ Personal statistics tracking</div>
                </div>
              </div>
            </motion.div>

            {/* Multiplayer Mode */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`border rounded-lg p-6 cursor-pointer transition-all ${
                selectedMode === 'multiplayer'
                  ? 'border-green-400 bg-green-900/20 shadow-lg shadow-green-400/20'
                  : 'border-gray-600 hover:border-green-500'
              }`}
              onClick={() => handleModeSelect('multiplayer')}
            >
              <div className="text-center">
                <Users className="w-16 h-16 text-green-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-green-400 mb-2">
                  Multiplayer
                </h3>
                <p className="text-gray-400 text-sm mb-4">
                  Team up with other hackers for cooperative missions, competitions, and shared challenges.
                </p>
                <div className="space-y-2 text-xs text-green-300">
                  <div>✓ Cooperative team missions</div>
                  <div>✓ PvP competitions</div>
                  <div>✓ Shared rooms and challenges</div>
                  <div>✓ Leaderboards and rankings</div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Mode Description */}
          <motion.div
            key={selectedMode}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800 border border-gray-700 rounded-lg p-4 mb-6"
          >
            {selectedMode === 'single' ? (
              <div>
                <h4 className="text-green-400 font-semibold mb-2">Single Player Experience</h4>
                <p className="text-gray-300 text-sm">
                  Dive into the cyberpunk world on your own. Complete missions at your own pace, 
                  develop your hacking skills, and unlock advanced equipment. Your progress is saved 
                  and you can switch to multiplayer anytime.
                </p>
              </div>
            ) : (
              <div>
                <h4 className="text-green-400 font-semibold mb-2">Multiplayer Experience</h4>
                <p className="text-gray-300 text-sm">
                  Join forces with other hackers in real-time. Create or join rooms for cooperative 
                  missions, compete in hacking challenges, and climb the leaderboards. Your individual 
                  progress carries over between modes.
                </p>
              </div>
            )}
          </motion.div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <motion.button
              onClick={onStartGame}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded transition-colors flex items-center justify-center"
            >
              {selectedMode === 'single' ? (
                <>
                  <Gamepad2 className="w-5 h-5 mr-2" />
                  Start Solo Mission
                </>
              ) : (
                <>
                  <Users className="w-5 h-5 mr-2" />
                  Enter Multiplayer
                </>
              )}
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-gray-700 hover:bg-gray-600 text-green-400 font-bold py-3 px-4 rounded transition-colors"
            >
              <Settings className="w-5 h-5" />
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}