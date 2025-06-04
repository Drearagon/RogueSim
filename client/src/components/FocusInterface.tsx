import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  focusSystem, 
  FocusState, 
  FocusEffect, 
  Stimulant 
} from '@/lib/focusSystem';
import { 
  Brain, 
  Zap, 
  Coffee, 
  Pill, 
  Heart, 
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Pause
} from 'lucide-react';

export function FocusInterface() {
  const [focusState, setFocusState] = useState<FocusState>(focusSystem.getState());
  const [activeEffects, setActiveEffects] = useState<FocusEffect[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [themeColors, setThemeColors] = useState({
    primary: '#10b981', // green-500
    background: '#000000',
    text: '#10b981'
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setFocusState(focusSystem.getState());
      setActiveEffects(focusSystem.getActiveEffects());
    }, 1000);

    // Listen for terminal theme changes
    const handleThemeChange = (event: CustomEvent) => {
      const { primaryColor, backgroundColor, textColor } = event.detail;
      setThemeColors({
        primary: primaryColor || '#10b981',
        background: backgroundColor || '#000000',
        text: textColor || '#10b981'
      });
    };

    window.addEventListener('terminalSettingsChanged', handleThemeChange as EventListener);

    return () => {
      clearInterval(interval);
      window.removeEventListener('terminalSettingsChanged', handleThemeChange as EventListener);
    };
  }, []);

  const handleUseStimulant = (type: Stimulant['type']) => {
    const result = focusSystem.useStimulant(type);
    if (result.success) {
      setFocusState(focusSystem.getState());
    }
  };

  const getFocusColor = () => {
    const percentage = focusSystem.getFocusPercentage();
    if (percentage > 80) return 'text-green-400';
    if (percentage > 60) return 'text-yellow-400';
    if (percentage > 40) return 'text-orange-400';
    return 'text-red-400';
  };

  const getFocusBarColor = () => {
    const percentage = focusSystem.getFocusPercentage();
    if (percentage > 80) return '#10b981';
    if (percentage > 60) return '#f59e0b';
    if (percentage > 40) return '#f97316';
    return '#ef4444';
  };

  const getStimulantIcon = (type: Stimulant['type']) => {
    const icons = {
      caffeine: <Coffee className="w-3 h-3" />,
      nootropic: <Pill className="w-3 h-3" />,
      energy_drink: <Zap className="w-3 h-3" />,
      meditation: <Heart className="w-3 h-3" />,
      break: <Pause className="w-3 h-3" />
    };
    return icons[type];
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (isExpanded && !target.closest('.focus-interface')) {
        setIsExpanded(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isExpanded]);

  return (
    <div className="focus-interface relative w-full max-w-[280px] sm:max-w-[320px]">
      {/* Compact Focus Bar */}
      <div 
        className="flex items-center gap-2 px-3 py-2 bg-black/20 backdrop-blur-sm rounded-lg cursor-pointer transition-all hover:bg-black/30 border"
        style={{ 
          borderColor: `${themeColors.primary}50`,
          boxShadow: isExpanded ? `0 0 10px ${themeColors.primary}30` : 'none'
        }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <Brain 
          className={`w-4 h-4 ${getFocusColor()}`} 
          style={{ color: themeColors.primary }}
        />
        
        {/* Focus Bar */}
        <div className="flex-1 h-2 bg-black/40 rounded-full overflow-hidden min-w-[60px]">
          <div 
            className="h-full transition-all duration-300 rounded-full"
            style={{ 
              width: `${focusSystem.getFocusPercentage()}%`,
              backgroundColor: getFocusBarColor()
            }}
          />
        </div>
        
        {/* Focus Percentage */}
        <span 
          className={`text-xs font-mono ${getFocusColor()} min-w-[30px]`}
          style={{ color: themeColors.text }}
        >
          {Math.round(focusSystem.getFocusPercentage())}%
        </span>

        {/* Status Indicators */}
        <div className="flex items-center gap-1">
          {focusState.isOverloaded && (
            <AlertTriangle className="w-3 h-3 text-red-400" />
          )}
          {activeEffects.length > 0 && (
            <Badge 
              variant="secondary" 
              className="text-xs px-1 py-0 h-4 bg-orange-500/20 text-orange-300 border-orange-500/50"
            >
              {activeEffects.length}
            </Badge>
          )}
          {focusState.stimulants.length > 0 && (
            <div className="flex items-center">
              {focusState.stimulants.slice(0, 2).map((stim, idx) => (
                <div key={stim.id} className="ml-1" style={{ color: themeColors.primary }}>
                  {getStimulantIcon(stim.type)}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Expand/Collapse Icon */}
        {isExpanded ? (
          <ChevronUp className="w-4 h-4" style={{ color: themeColors.primary }} />
        ) : (
          <ChevronDown className="w-4 h-4" style={{ color: themeColors.primary }} />
        )}
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div 
          className="absolute top-full left-0 right-0 mt-2 p-4 bg-black/90 backdrop-blur-sm rounded-lg shadow-2xl z-50 max-h-[70vh] overflow-y-auto border"
          style={{ 
            borderColor: `${themeColors.primary}50`,
            boxShadow: `0 0 20px ${themeColors.primary}20`
          }}
        >
          
          {/* Focus Details */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm" style={{ color: themeColors.primary }}>Mental Focus</span>
              <span 
                className={`text-lg font-bold ${getFocusColor()}`}
                style={{ color: themeColors.text }}
              >
                {focusState.current}/{focusState.maximum}
              </span>
            </div>
            
            {focusState.isOverloaded && (
              <div className="p-2 bg-red-500/20 border border-red-500/50 rounded text-xs text-red-300 mb-2">
                <AlertTriangle className="w-3 h-3 inline mr-1" />
                Mental overload - commands cost double focus
              </div>
            )}
          </div>

          {/* Active Effects */}
          {activeEffects.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm text-orange-400 mb-2">Active Effects</h4>
              <div className="space-y-1">
                {activeEffects.map((effect) => (
                  <div key={effect.id} className="flex items-center justify-between p-2 bg-black/40 rounded text-xs">
                    <span className="text-orange-300 capitalize">
                      {effect.type.replace('_', ' ')}
                    </span>
                    <Badge variant="outline" className="text-xs h-4 border-orange-500/50 text-orange-400">
                      {effect.severity}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Active Stimulants */}
          {focusState.stimulants.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm" style={{ color: themeColors.primary }}>Active Stimulants</h4>
              <div className="space-y-1 mt-2">
                {focusState.stimulants.map((stim) => (
                  <div key={stim.id} className="flex items-center justify-between p-2 bg-green-500/20 rounded text-xs">
                    <div className="flex items-center gap-2">
                      {getStimulantIcon(stim.type)}
                      <span className="text-green-300">{stim.name}</span>
                    </div>
                    <span className="text-green-400">+{stim.focusBoost}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              className="text-xs h-8 border-green-500/30 hover:bg-green-500/20 text-green-300"
              onClick={() => handleUseStimulant('caffeine')}
              disabled={focusState.stimulants.length >= 2}
            >
              <Coffee className="w-3 h-3 mr-1" />
              Coffee (50c)
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="text-xs h-8 border-blue-500/30 hover:bg-blue-500/20 text-blue-300"
              onClick={() => handleUseStimulant('meditation')}
            >
              <Heart className="w-3 h-3 mr-1" />
              Meditate
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="text-xs h-8 border-yellow-500/30 hover:bg-yellow-500/20 text-yellow-300"
              onClick={() => handleUseStimulant('energy_drink')}
              disabled={focusState.stimulants.length >= 2}
            >
              <Zap className="w-3 h-3 mr-1" />
              Energy (75c)
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="text-xs h-8 border-purple-500/30 hover:bg-purple-500/20 text-purple-300"
              onClick={() => handleUseStimulant('break')}
            >
              <Pause className="w-3 h-3 mr-1" />
              Break
            </Button>
          </div>

          {/* Tips */}
          <div 
            className="mt-3 p-2 rounded text-xs border"
            style={{ 
              backgroundColor: `${themeColors.primary}10`,
              borderColor: `${themeColors.primary}30`,
              color: `${themeColors.text}80`
            }}
          >
            <div className="font-medium mb-1" style={{ color: themeColors.text }}>Focus Tips:</div>
            <div>• Complex commands drain more focus</div>
            <div>• Focus regenerates during inactivity</div>
            <div>• Max 2 stimulants at once</div>
          </div>
        </div>
      )}
    </div>
  );
} 