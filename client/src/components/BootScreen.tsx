import { useState, useEffect } from 'react';
import { useSound } from '../hooks/useSound';
import Hyperspeed from './Hyperspeed';

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

  // Custom hyperspeed options for the loading screen
  const hyperspeedOptions = {
    distortion: 'turbulentDistortion',
    length: 300,
    roadWidth: 8,
    islandWidth: 1,
    lanesPerRoad: 3,
    fov: 100,
    speedUp: 1.5,
    carLightsFade: 0.3,
    totalSideLightSticks: 15,
    lightPairsPerRoadWay: 30,
    colors: {
      roadColor: 0x0a0a0a,
      islandColor: 0x050505,
      background: 0x000000,
      shoulderLines: 0x00ff41,
      brokenLines: 0x00ff41,
      leftCars: [0x00ff41, 0x39ff14, 0x32cd32],
      rightCars: [0x00bfff, 0x1e90ff, 0x0080ff],
      sticks: 0x00ff41,
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center text-green-500 font-mono p-4">
      {/* Hyperspeed Background */}
      <div className="absolute inset-0 opacity-30">
        <Hyperspeed effectOptions={hyperspeedOptions} />
      </div>

      {/* Boot Screen Content */}
      <div className="relative z-10 text-center space-y-4 md:space-y-8 max-w-lg backdrop-blur-sm bg-black/60 p-6 rounded-lg border border-green-500/30 shadow-2xl shadow-green-500/20">
        <div className="text-xl md:text-4xl lg:text-6xl font-bold mb-4 md:mb-8 animate-pulse">
          <div className="text-xs md:text-base lg:text-xl">█▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀█</div>
          <div className="text-xs md:text-base lg:text-xl">█   ROGUE-SIM v1.0   █</div>
          <div className="text-xs md:text-base lg:text-xl">█  ESP32 CORE ONLINE █</div>
          <div className="text-xs md:text-base lg:text-xl">█▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄█</div>
        </div>
        
        <div className="text-sm md:text-lg space-y-2 md:space-y-4">
          <div className="animate-pulse">Initializing Shadow Protocol...</div>
          <div className="flex items-center justify-center space-x-2">
            <span>Loading Neural Interface</span>
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
          <div className="w-64 h-2 bg-gray-700 rounded mx-auto border border-green-500/50">
            <div 
              className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded transition-all duration-100 shadow-lg shadow-green-500/50"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="text-xs text-center text-green-400">{Math.round(progress)}%</div>
        </div>
        
        <div className="text-sm text-green-400 space-y-1">
          <div className="flex items-center justify-center space-x-2">
            <span className="text-green-500">▶</span>
            <span>ESP32 Firmware v3.1.4 LOADED</span>
          </div>
          <div className="flex items-center justify-center space-x-2">
            <span className="text-green-500">▶</span>
            <span>Marauder Protocol ACTIVE</span>
          </div>
          <div className="flex items-center justify-center space-x-2">
            <span className="text-green-500">▶</span>
            <span>Neural Interface SYNCHRONIZED</span>
          </div>
          <div className="flex items-center justify-center space-x-2">
            <span className="text-green-500">▶</span>
            <span>Shadow Network ACCESS GRANTED</span>
          </div>
        </div>

        {/* Additional loading text based on progress */}
        {progress > 20 && (
          <div className="text-xs text-green-300 animate-pulse">
            Connecting to dark web nodes...
          </div>
        )}
        {progress > 40 && (
          <div className="text-xs text-green-300 animate-pulse">
            Establishing encrypted channels...
          </div>
        )}
        {progress > 60 && (
          <div className="text-xs text-green-300 animate-pulse">
            Loading hacking modules...
          </div>
        )}
        {progress > 80 && (
          <div className="text-xs text-green-300 animate-pulse">
            Finalizing system initialization...
          </div>
        )}
      </div>
    </div>
  );
}
