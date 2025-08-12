import React, { useState, useEffect } from 'react';
import NetworkVisualizer from './NetworkVisualizer';
import HexGrid from './HexGrid';
import MatrixRain from './MatrixRain';

interface BackgroundControllerProps {
  isActive?: boolean;
  visualizationType?: 'network' | 'hexgrid' | 'matrix' | 'combined';
  intensity?: 'low' | 'medium' | 'high';
  theme?: 'green' | 'blue' | 'red' | 'purple';
  className?: string;
  gameActivity?: 'idle' | 'typing' | 'hacking' | 'breach' | 'defense';
}

const BackgroundController: React.FC<BackgroundControllerProps> = ({
  isActive = true,
  visualizationType = 'combined',
  intensity = 'medium',
  theme = 'green',
  className = '',
  gameActivity = 'idle'
}) => {
  const [currentVisualization, setCurrentVisualization] = useState(visualizationType);
  const [dynamicIntensity, setDynamicIntensity] = useState(intensity);
  const [dynamicTheme, setDynamicTheme] = useState(theme);

  // Adjust visualization based on game activity
  useEffect(() => {
    switch (gameActivity) {
      case 'hacking':
        setDynamicIntensity('high');
        setCurrentVisualization('network');
        break;
      case 'breach':
        setDynamicIntensity('high');
        setDynamicTheme('red');
        setCurrentVisualization('matrix');
        break;
      case 'defense':
        setDynamicIntensity('medium');
        setDynamicTheme('blue');
        setCurrentVisualization('hexgrid');
        break;
      case 'typing':
        setDynamicIntensity('medium');
        break;
      default:
        setDynamicIntensity(intensity);
        setDynamicTheme(theme);
        setCurrentVisualization(visualizationType);
    }
  }, [gameActivity, intensity, theme, visualizationType]);

  // Auto-rotate visualizations in combined mode
  useEffect(() => {
    if (visualizationType === 'combined' && gameActivity === 'idle') {
      const rotationInterval = setInterval(() => {
        setCurrentVisualization(prev => {
          const types = ['network', 'hexgrid', 'matrix'];
          const currentIndex = types.indexOf(prev);
          return types[(currentIndex + 1) % types.length];
        });
      }, 15000); // Change every 15 seconds

      return () => clearInterval(rotationInterval);
    }
  }, [visualizationType, gameActivity]);

  const renderVisualization = () => {
    const commonProps = {
      isActive,
      intensity: dynamicIntensity,
      theme: dynamicTheme,
      className: "z-0"
    };

    switch (currentVisualization) {
      case 'network':
        return <NetworkVisualizer {...commonProps} />;
      case 'hexgrid':
        return (
          <HexGrid 
            {...commonProps} 
            animationType={gameActivity === 'hacking' ? 'scanning' : gameActivity === 'typing' ? 'flowing' : 'pulsing'}
          />
        );
      case 'matrix':
        return (
          <MatrixRain 
            {...commonProps} 
            characterSet={gameActivity === 'breach' ? 'binary' : gameActivity === 'hacking' ? 'hex' : 'matrix'}
          />
        );
      default:
        return <NetworkVisualizer {...commonProps} />;
    }
  };

  if (!isActive) {
    return null;
  }

  return (
    <div className={`absolute inset-0 pointer-events-none ${className}`}>
      {renderVisualization()}
      
      {/* Subtle overlay gradient for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/30 pointer-events-none" />
      
      {/* Optional: Activity indicator */}
      {gameActivity !== 'idle' && (
        <div className="absolute top-4 right-4 z-10">
          <div className={`
            px-2 py-1 rounded text-xs font-mono uppercase tracking-wider
            ${gameActivity === 'hacking' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
              gameActivity === 'breach' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
              gameActivity === 'defense' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
              gameActivity === 'typing' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
              'bg-gray-500/20 text-gray-400 border border-gray-500/30'}
          `}>
            {gameActivity}
          </div>
        </div>
      )}
    </div>
  );
};

export default BackgroundController;