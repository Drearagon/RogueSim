import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Palette, Type, Volume2, Eye, X } from 'lucide-react';

interface TerminalSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  settings: TerminalSettings;
  onSettingsChange: (settings: TerminalSettings) => void;
}

export interface TerminalSettings {
  colorScheme: string;
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
  fontSize: number;
  fontFamily: string;
  soundEnabled: boolean;
  scanlineEffect: boolean;
  glowEffect: boolean;
  typingSpeed: number;
}

const COLOR_SCHEMES = {
  classic: {
    name: 'Classic Green',
    primaryColor: '#00ff00',
    backgroundColor: '#000000',
    textColor: '#00ff00'
  },
  cyberpunk: {
    name: 'Cyberpunk Neon',
    primaryColor: '#ff0080',
    backgroundColor: '#0a0014',
    textColor: '#ff0080'
  },
  matrix: {
    name: 'Matrix Code',
    primaryColor: '#00ff41',
    backgroundColor: '#000000',
    textColor: '#00ff41'
  },
  ice: {
    name: 'Ice Blue',
    primaryColor: '#00f5ff',
    backgroundColor: '#001122',
    textColor: '#00f5ff'
  },
  amber: {
    name: 'Retro Amber',
    primaryColor: '#ffb000',
    backgroundColor: '#1a0f00',
    textColor: '#ffb000'
  },
  purple: {
    name: 'Deep Purple',
    primaryColor: '#a020f0',
    backgroundColor: '#0f0520',
    textColor: '#a020f0'
  }
};

const FONT_FAMILIES = [
  { name: 'JetBrains Mono', value: 'JetBrains Mono, monospace' },
  { name: 'Fira Code', value: 'Fira Code, monospace' },
  { name: 'Source Code Pro', value: 'Source Code Pro, monospace' },
  { name: 'Consolas', value: 'Consolas, monospace' },
  { name: 'Monaco', value: 'Monaco, monospace' },
  { name: 'Courier New', value: 'Courier New, monospace' }
];

export function TerminalSettings({ isOpen, onClose, settings, onSettingsChange }: TerminalSettingsProps) {
  const [activeTab, setActiveTab] = useState('appearance');

  const updateSettings = (updates: Partial<TerminalSettings>) => {
    onSettingsChange({ ...settings, ...updates });
  };

  const applyColorScheme = (schemeKey: string) => {
    const scheme = COLOR_SCHEMES[schemeKey as keyof typeof COLOR_SCHEMES];
    if (scheme) {
      updateSettings({
        colorScheme: schemeKey,
        primaryColor: scheme.primaryColor,
        backgroundColor: scheme.backgroundColor,
        textColor: scheme.textColor
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="w-full max-w-2xl bg-black border border-green-500/30 rounded-lg shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-green-500/20">
            <div className="flex items-center gap-3">
              <Settings className="h-5 w-5 text-green-400" />
              <h2 className="text-green-400 font-bold text-lg">Terminal Settings</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-800 rounded text-green-400"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-green-500/20">
            {[
              { id: 'appearance', label: 'Appearance', icon: Palette },
              { id: 'typography', label: 'Typography', icon: Type },
              { id: 'effects', label: 'Effects', icon: Eye },
              { id: 'audio', label: 'Audio', icon: Volume2 }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 p-3 transition-colors ${
                  activeTab === tab.id
                    ? 'bg-green-900/30 text-green-400 border-b-2 border-green-500'
                    : 'text-gray-400 hover:text-green-300'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span className="text-sm">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="p-6 max-h-96 overflow-y-auto">
            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-green-400 font-semibold mb-3">Color Schemes</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(COLOR_SCHEMES).map(([key, scheme]) => (
                      <button
                        key={key}
                        onClick={() => applyColorScheme(key)}
                        className={`p-3 rounded border transition-all ${
                          settings.colorScheme === key
                            ? 'border-green-500 bg-green-900/20'
                            : 'border-gray-600 hover:border-gray-500'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-4 h-4 rounded"
                            style={{ backgroundColor: scheme.primaryColor }}
                          />
                          <span className="text-sm text-white">{scheme.name}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-green-400 font-semibold mb-3">Custom Colors</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm text-gray-300 mb-2">Primary Color</label>
                      <input
                        type="color"
                        value={settings.primaryColor}
                        onChange={(e) => updateSettings({ primaryColor: e.target.value })}
                        className="w-full h-10 rounded border border-gray-600"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-300 mb-2">Background Color</label>
                      <input
                        type="color"
                        value={settings.backgroundColor}
                        onChange={(e) => updateSettings({ backgroundColor: e.target.value })}
                        className="w-full h-10 rounded border border-gray-600"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'typography' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-green-400 font-semibold mb-3">Font Family</h3>
                  <select
                    value={settings.fontFamily}
                    onChange={(e) => updateSettings({ fontFamily: e.target.value })}
                    className="w-full p-3 bg-gray-800 border border-gray-600 rounded text-white"
                  >
                    {FONT_FAMILIES.map((font) => (
                      <option key={font.value} value={font.value}>
                        {font.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <h3 className="text-green-400 font-semibold mb-3">Font Size</h3>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="12"
                      max="24"
                      value={settings.fontSize}
                      onChange={(e) => updateSettings({ fontSize: parseInt(e.target.value) })}
                      className="flex-1"
                    />
                    <span className="text-white w-12">{settings.fontSize}px</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-green-400 font-semibold mb-3">Typing Speed</h3>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={settings.typingSpeed}
                      onChange={(e) => updateSettings({ typingSpeed: parseInt(e.target.value) })}
                      className="flex-1"
                    />
                    <span className="text-white w-16">{settings.typingSpeed}x</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'effects' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-green-400 font-semibold">Scanline Effect</h3>
                    <p className="text-sm text-gray-400">Classic CRT monitor scanlines</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.scanlineEffect}
                      onChange={(e) => updateSettings({ scanlineEffect: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-green-400 font-semibold">Glow Effect</h3>
                    <p className="text-sm text-gray-400">Text glow for enhanced cyberpunk feel</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.glowEffect}
                      onChange={(e) => updateSettings({ glowEffect: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                  </label>
                </div>
              </div>
            )}

            {activeTab === 'audio' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-green-400 font-semibold">Sound Effects</h3>
                    <p className="text-sm text-gray-400">Enable terminal sound effects</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.soundEnabled}
                      onChange={(e) => updateSettings({ soundEnabled: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 p-4 border-t border-green-500/20">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => {
                // Reset to defaults
                updateSettings({
                  colorScheme: 'classic',
                  primaryColor: '#00ff00',
                  backgroundColor: '#000000',
                  textColor: '#00ff00',
                  fontSize: 14,
                  fontFamily: 'JetBrains Mono, monospace',
                  soundEnabled: true,
                  scanlineEffect: true,
                  glowEffect: true,
                  typingSpeed: 5
                });
              }}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded transition-colors"
            >
              Reset Defaults
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}