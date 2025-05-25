import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Shield, Gamepad2, Users } from 'lucide-react';

interface UserSetupProps {
  onSetupComplete: (hackerName: string, preferredMode: 'single' | 'multiplayer') => void;
  userEmail?: string;
}

export function UserSetup({ onSetupComplete, userEmail }: UserSetupProps) {
  const [hackerName, setHackerName] = useState('');
  const [preferredMode, setPreferredMode] = useState<'single' | 'multiplayer'>('single');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (hackerName.length < 3) {
      setError('Hacker name must be at least 3 characters');
      return;
    }
    if (hackerName.length > 20) {
      setError('Hacker name must be no more than 20 characters');
      return;
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(hackerName)) {
      setError('Hacker name can only contain letters, numbers, hyphens, and underscores');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      // Validate username availability
      const response = await fetch('/api/auth/check-username', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hackerName })
      });
      
      if (!response.ok) {
        const data = await response.json();
        setError(data.message || 'Username not available');
        return;
      }
      
      onSetupComplete(hackerName, preferredMode);
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-green-400 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-900 border border-green-500 rounded-lg p-8"
        >
          <div className="text-center mb-8">
            <Shield className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-green-400 mb-2">
              Welcome to RogueSim
            </h1>
            <p className="text-gray-400">
              Complete your hacker profile setup
            </p>
            {userEmail && (
              <p className="text-sm text-green-300 mt-2">
                Authenticated as: {userEmail}
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-green-400 text-sm font-bold mb-2">
                Choose Your Hacker Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-5 h-5 text-green-400" />
                <input
                  type="text"
                  value={hackerName}
                  onChange={(e) => setHackerName(e.target.value)}
                  className="w-full bg-black border border-green-500 rounded px-10 py-3 text-green-400 placeholder-green-700 focus:outline-none focus:border-green-300"
                  placeholder="Enter hacker name"
                  maxLength={20}
                  required
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                3-20 characters, letters, numbers, hyphens, and underscores only
              </p>
            </div>

            <div>
              <label className="block text-green-400 text-sm font-bold mb-3">
                Preferred Game Mode
              </label>
              <div className="space-y-3">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    preferredMode === 'single'
                      ? 'border-green-400 bg-green-900/20'
                      : 'border-gray-600 hover:border-green-500'
                  }`}
                  onClick={() => setPreferredMode('single')}
                >
                  <div className="flex items-center">
                    <Gamepad2 className="w-5 h-5 text-green-400 mr-3" />
                    <div>
                      <h3 className="text-green-400 font-semibold">Single Player</h3>
                      <p className="text-sm text-gray-400">
                        Solo hacking missions and skill development
                      </p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    preferredMode === 'multiplayer'
                      ? 'border-green-400 bg-green-900/20'
                      : 'border-gray-600 hover:border-green-500'
                  }`}
                  onClick={() => setPreferredMode('multiplayer')}
                >
                  <div className="flex items-center">
                    <Users className="w-5 h-5 text-green-400 mr-3" />
                    <div>
                      <h3 className="text-green-400 font-semibold">Multiplayer</h3>
                      <p className="text-sm text-gray-400">
                        Team up with other hackers for group missions
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-red-900/50 border border-red-500 rounded p-3 text-red-300 text-sm"
              >
                {error}
              </motion.div>
            )}

            <motion.button
              type="submit"
              disabled={isLoading || !hackerName}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded transition-colors"
            >
              {isLoading ? 'Setting up...' : 'Enter the Matrix'}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}