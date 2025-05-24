import { useState, useEffect } from 'react';
import { useSound } from '../hooks/useSound';

interface BootScreenProps {
  onBootComplete: () => void;
}

export function BootScreen({ onBootComplete }: BootScreenProps) {
  const [progress, setProgress] = useState(0);
  const { playBoot } = useSound();

  useEffect(() => {
    playBoot();
    
    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + Math.random() * 15;
        if (newProgress >= 100) {
          clearInterval(interval);
          setTimeout(onBootComplete, 1000);
          return 100;
        }
        return newProgress;
      });
    }, 200);

    return () => clearInterval(interval);
  }, [onBootComplete, playBoot]);

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center text-green-500 font-mono">
      <div className="text-center space-y-8">
        <div className="text-4xl md:text-6xl font-bold mb-8 animate-pulse">
          <div>█▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀█</div>
          <div>█   ROGUE-SIM v1.0   █</div>
          <div>█  ESP32 CORE ONLINE █</div>
          <div>█▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄█</div>
        </div>
        
        <div className="text-lg space-y-4">
          <div className="animate-pulse">Initializing Shadow Protocol...</div>
          <div className="flex items-center justify-center space-x-2">
            <span>Loading</span>
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
          <div className="w-64 h-2 bg-gray-700 rounded mx-auto">
            <div 
              className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded transition-all duration-100 shadow-lg shadow-green-500/50"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
        
        <div className="text-sm text-green-400 space-y-1">
          <div>▶ ESP32 Firmware v3.1.4 LOADED</div>
          <div>▶ Marauder Protocol ACTIVE</div>
          <div>▶ Neural Interface SYNCHRONIZED</div>
          <div>▶ Shadow Network ACCESS GRANTED</div>
        </div>
      </div>
    </div>
  );
}
