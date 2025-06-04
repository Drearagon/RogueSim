import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, Coins, Zap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface MissionCompleteNotificationProps {
  isVisible: boolean;
  missionTitle: string;
  reward: number;
  onClose: () => void;
}

export function MissionCompleteNotification({ 
  isVisible, 
  missionTitle, 
  reward, 
  onClose 
}: MissionCompleteNotificationProps) {
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShowDetails(true);
      // Auto-close after 5 seconds
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ scale: 0, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0, opacity: 0, y: -50 }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 20,
              duration: 0.6 
            }}
            className="pointer-events-auto"
          >
            <Card className="bg-black/95 border-2 border-green-400 backdrop-blur-lg shadow-2xl shadow-green-400/20 max-w-md mx-4">
              <CardContent className="p-6 text-center">
                {/* Success Icon */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="mb-4"
                >
                  <div className="w-16 h-16 mx-auto bg-green-400/20 rounded-full flex items-center justify-center">
                    <Trophy className="w-8 h-8 text-green-400" />
                  </div>
                </motion.div>

                {/* Mission Complete Text */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mb-4"
                >
                  <h2 className="text-2xl font-mono font-bold text-green-400 mb-2">
                    MISSION COMPLETE
                  </h2>
                  <p className="text-green-300 font-mono text-sm">
                    {missionTitle}
                  </p>
                </motion.div>

                {/* Rewards */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 }}
                  className="space-y-3"
                >
                  <div className="flex items-center justify-center gap-2 bg-green-400/10 border border-green-400/30 rounded-lg p-3">
                    <Coins className="w-5 h-5 text-yellow-400" />
                    <span className="font-mono text-lg font-bold text-yellow-400">
                      +{reward.toLocaleString()} Credits
                    </span>
                  </div>

                  <div className="flex items-center justify-center gap-2 bg-blue-400/10 border border-blue-400/30 rounded-lg p-3">
                    <Star className="w-5 h-5 text-blue-400" />
                    <span className="font-mono text-lg font-bold text-blue-400">
                      +1 Skill Point
                    </span>
                  </div>

                  <div className="flex items-center justify-center gap-2 bg-purple-400/10 border border-purple-400/30 rounded-lg p-3">
                    <Zap className="w-5 h-5 text-purple-400" />
                    <span className="font-mono text-sm text-purple-400">
                      New Commands Unlocked
                    </span>
                  </div>
                </motion.div>

                {/* Status Badge */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="mt-4"
                >
                  <Badge className="bg-green-400 text-black font-mono font-bold px-4 py-1">
                    OPERATION SUCCESSFUL
                  </Badge>
                </motion.div>

                {/* Close Button */}
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  onClick={onClose}
                  className="mt-4 text-green-400/70 hover:text-green-400 font-mono text-sm transition-colors"
                >
                  [ CLICK TO CONTINUE ]
                </motion.button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 