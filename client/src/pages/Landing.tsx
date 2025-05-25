import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Terminal, Users, Zap, Lock } from 'lucide-react';

export default function Landing() {
  const handleLogin = () => {
    window.location.href = '/api/login';
  };

  return (
    <div className="min-h-screen bg-black text-green-400 overflow-hidden">
      {/* Matrix Rain Background */}
      <div className="fixed inset-0 opacity-20">
        <div className="matrix-rain" />
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="max-w-4xl w-full">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-8"
            >
              <Shield className="w-24 h-24 text-green-400 mx-auto mb-4" />
              <h1 className="text-6xl font-bold text-green-400 mb-4 font-mono">
                RogueSim
              </h1>
              <p className="text-xl text-green-300 mb-2">
                The ESP32 Hacker Terminal Game
              </p>
              <p className="text-gray-400">
                Enter the cyberpunk underground. Master the art of digital infiltration.
              </p>
            </motion.div>

            {/* Feature Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gray-900/50 border border-green-500/30 rounded-lg p-6"
              >
                <Terminal className="w-12 h-12 text-green-400 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-green-400 mb-2">
                  Authentic Terminal
                </h3>
                <p className="text-sm text-gray-400">
                  Real hacking commands and terminal experience
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-gray-900/50 border border-green-500/30 rounded-lg p-6"
              >
                <Users className="w-12 h-12 text-green-400 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-green-400 mb-2">
                  Multiplayer Modes
                </h3>
                <p className="text-sm text-gray-400">
                  Team up or compete with other hackers
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-gray-900/50 border border-green-500/30 rounded-lg p-6"
              >
                <Zap className="w-12 h-12 text-green-400 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-green-400 mb-2">
                  Progressive Skills
                </h3>
                <p className="text-sm text-gray-400">
                  Unlock advanced tools and techniques
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-gray-900/50 border border-green-500/30 rounded-lg p-6"
              >
                <Lock className="w-12 h-12 text-green-400 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-green-400 mb-2">
                  Secure Account
                </h3>
                <p className="text-sm text-gray-400">
                  Your progress saved across all devices
                </p>
              </motion.div>
            </div>

            {/* Login Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <motion.button
                onClick={handleLogin}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-green-600 hover:bg-green-700 text-black font-bold py-4 px-8 rounded-lg text-xl transition-colors shadow-lg shadow-green-400/20"
              >
                Enter the Matrix
              </motion.button>
              <p className="text-sm text-gray-400 mt-4">
                Secure login with Replit account
              </p>
            </motion.div>
          </motion.div>

          {/* Terminal Preview */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-black border border-green-500 rounded-lg p-6 font-mono text-sm max-w-2xl mx-auto"
          >
            <div className="flex items-center mb-4">
              <div className="flex space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
              <div className="ml-4 text-gray-400">RogueSim Terminal v2.1.0</div>
            </div>
            <div className="space-y-2">
              <div className="text-green-400">
                <span className="text-green-600">guest@matrix:~$</span> scan --network corporate
              </div>
              <div className="text-gray-300">
                [INFO] Scanning network 192.168.1.0/24...
              </div>
              <div className="text-green-300">
                [FOUND] 192.168.1.100 - Windows Server (Port 445 open)
              </div>
              <div className="text-green-300">
                [FOUND] 192.168.1.50 - IoT Device (ESP32)
              </div>
              <div className="text-green-400">
                <span className="text-green-600">guest@matrix:~$</span> connect 192.168.1.100
              </div>
              <div className="text-yellow-300">
                [WARNING] Target requires authentication
              </div>
              <div className="text-green-400">
                <span className="text-green-600">guest@matrix:~$</span> <span className="animate-pulse">_</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <style jsx>{`
        .matrix-rain {
          background: linear-gradient(
            to bottom,
            transparent 0%,
            rgba(0, 255, 0, 0.05) 50%,
            transparent 100%
          );
          animation: matrix-fall 20s linear infinite;
        }

        @keyframes matrix-fall {
          0% { transform: translateY(-100vh); }
          100% { transform: translateY(100vh); }
        }
      `}</style>
    </div>
  );
}