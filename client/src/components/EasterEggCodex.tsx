import React, { useEffect, useMemo, useState } from 'react';
import { X, Sparkles, Lightbulb, Gift, Shield } from 'lucide-react';
import {
  easterEggs,
  getDiscoveredEasterEggs,
  getEasterEggStats,
  loadDiscoveredEasterEggs
} from '../lib/easterEggs';

interface EasterEggCodexProps {
  onClose: () => void;
}

interface RewardDisplay {
  label: string;
  icon: string;
}

const rarityStyles: Record<string, string> = {
  common: 'bg-emerald-950/80 border-emerald-500/40 text-emerald-100',
  rare: 'bg-sky-950/70 border-sky-500/40 text-sky-100',
  epic: 'bg-purple-950/70 border-purple-500/40 text-purple-100',
  legendary: 'bg-amber-950/80 border-amber-500/40 text-amber-100'
};

const rarityLabels: Record<string, string> = {
  common: 'Common Discovery',
  rare: 'Rare Discovery',
  epic: 'Epic Discovery',
  legendary: 'Legendary Discovery'
};

export function EasterEggCodex({ onClose }: EasterEggCodexProps) {
  const [discoveredEggIds, setDiscoveredEggIds] = useState<string[]>(() => {
    try {
      loadDiscoveredEasterEggs();
      return getDiscoveredEasterEggs();
    } catch (error) {
      console.warn('Failed to load discovered easter eggs:', error);
      return [];
    }
  });

  useEffect(() => {
    const syncDiscoveredEggs = () => {
      try {
        loadDiscoveredEasterEggs();
        setDiscoveredEggIds(getDiscoveredEasterEggs());
      } catch (error) {
        console.warn('Failed to synchronise easter eggs:', error);
      }
    };

    const handleEggDiscovered = (_event: Event) => {
      syncDiscoveredEggs();
    };

    const handleStorage = () => {
      syncDiscoveredEggs();
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('easterEggDiscovered', handleEggDiscovered);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('easterEggDiscovered', handleEggDiscovered);
    };
  }, []);

  const stats = useMemo(() => getEasterEggStats(), [discoveredEggIds]);

  const discoveredEggs = useMemo(
    () => Object.values(easterEggs).filter(egg => discoveredEggIds.includes(egg.id)),
    [discoveredEggIds]
  );

  const undiscoveredEggs = useMemo(
    () => Object.values(easterEggs).filter(egg => !discoveredEggIds.includes(egg.id)),
    [discoveredEggIds]
  );

  const getRewardDisplay = (reward: typeof easterEggs[keyof typeof easterEggs]['reward']): RewardDisplay[] => {
    const rewards: RewardDisplay[] = [];

    if (reward.credits) {
      rewards.push({ label: `${reward.credits.toLocaleString()} credits`, icon: '💰' });
    }
    if (reward.reputation) {
      rewards.push({ label: `Reputation: ${reward.reputation}`, icon: '⭐' });
    }
    if (reward.unlockedCommands?.length) {
      rewards.push({ label: `Commands: ${reward.unlockedCommands.join(', ')}`, icon: '🔓' });
    }
    if (reward.specialItems?.length) {
      rewards.push({ label: `Items: ${reward.specialItems.join(', ')}`, icon: '🎁' });
    }
    if (reward.achievement) {
      rewards.push({ label: `Achievement: ${reward.achievement}`, icon: '🏆' });
    }
    if (reward.secretMessage) {
      rewards.push({ label: `Secret message unlocked`, icon: '💬' });
    }

    return rewards;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl p-4">
      <div className="relative w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-xl border border-emerald-500/40 bg-gray-950/90 shadow-lg shadow-emerald-500/20">
        <div className="flex items-start justify-between border-b border-emerald-500/30 px-6 py-4">
          <div>
            <h2 className="text-3xl font-bold text-emerald-400">Easter Egg Codex</h2>
            <p className="text-sm text-emerald-200/80">
              Classified intel on hidden protocols and their recovered artifacts.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full border border-emerald-500/40 p-2 text-emerald-200 hover:bg-emerald-500/10 transition"
            aria-label="Close Codex"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid gap-4 border-b border-emerald-500/10 bg-emerald-500/5 px-6 py-4 sm:grid-cols-3">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-emerald-400" />
            <div>
              <p className="text-xs uppercase tracking-wide text-emerald-300/80">Recovered</p>
              <p className="text-2xl font-semibold text-emerald-100">{stats.discovered}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Sparkles className="h-8 w-8 text-emerald-400" />
            <div>
              <p className="text-xs uppercase tracking-wide text-emerald-300/80">Total Eggs</p>
              <p className="text-2xl font-semibold text-emerald-100">{stats.total}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Lightbulb className="h-8 w-8 text-emerald-400" />
            <div>
              <p className="text-xs uppercase tracking-wide text-emerald-300/80">Still Hidden</p>
              <p className="text-2xl font-semibold text-emerald-100">{stats.remaining}</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 overflow-y-auto px-6 py-6 lg:grid-cols-[2fr,1fr]">
          <section>
            <h3 className="mb-4 text-lg font-semibold text-emerald-300">Recovered Intelligence</h3>
            {discoveredEggs.length === 0 ? (
              <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4 text-sm text-emerald-200/80">
                No easter eggs recovered yet. Explore the network and experiment with commands to uncover hidden secrets.
              </div>
            ) : (
              <div className="space-y-4">
                {discoveredEggs.map(egg => {
                  const rewards = getRewardDisplay(egg.reward);
                  return (
                    <div
                      key={egg.id}
                      className={`rounded-lg border p-4 transition hover:border-emerald-400/60 ${rarityStyles[egg.rarity]}`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <h4 className="text-xl font-bold tracking-wide">{egg.name}</h4>
                          <p className="text-xs uppercase tracking-[0.2em] text-emerald-200/80">
                            {rarityLabels[egg.rarity]}
                          </p>
                        </div>
                        <span className="rounded-full border border-current px-3 py-1 text-xs font-semibold uppercase">
                          {egg.type.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="mt-3 text-sm text-emerald-50/90">{egg.description}</p>
                      <div className="mt-4 space-y-2 text-sm">
                        {rewards.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-200/70">
                              Rewards recovered
                            </p>
                            <div className="mt-2 flex flex-wrap gap-2">
                              {rewards.map(reward => (
                                <span
                                  key={reward.label}
                                  className="inline-flex items-center gap-2 rounded-full border border-emerald-300/40 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-100"
                                >
                                  <span>{reward.icon}</span>
                                  {reward.label}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {egg.reward.secretMessage && (
                          <div className="rounded-lg border border-emerald-300/20 bg-black/30 p-3 text-xs italic text-emerald-100/80">
                            “{egg.reward.secretMessage}”
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <section className="space-y-4">
            <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4">
              <div className="flex items-center gap-2 text-emerald-200">
                <Lightbulb className="h-5 w-5" />
                <h3 className="text-sm font-semibold uppercase tracking-wide">Active Hints</h3>
              </div>
              <div className="mt-3 space-y-3 text-sm text-emerald-100/80">
                {undiscoveredEggs.filter(egg => egg.hint).length === 0 ? (
                  <p className="text-emerald-200/70">All available hints recovered. Keep exploring for hidden triggers.</p>
                ) : (
                  undiscoveredEggs
                    .filter(egg => egg.hint)
                    .map(egg => (
                      <div key={egg.id} className="rounded border border-emerald-500/10 bg-black/40 p-3">
                        <p className="text-xs uppercase tracking-wide text-emerald-300/70">{egg.name}</p>
                        <p className="mt-1 text-emerald-100/80">{egg.hint}</p>
                      </div>
                    ))
                )}
              </div>
            </div>

            <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4">
              <div className="flex items-center gap-2 text-emerald-200">
                <Gift className="h-5 w-5" />
                <h3 className="text-sm font-semibold uppercase tracking-wide">Remaining Rewards</h3>
              </div>
              <div className="mt-3 space-y-2 text-sm text-emerald-100/80">
                {undiscoveredEggs.length === 0 ? (
                  <p className="text-emerald-200/70">All easter eggs uncovered. Legendary work, operative.</p>
                ) : (
                  undiscoveredEggs.map(egg => (
                    <div key={egg.id} className="rounded border border-emerald-500/10 bg-black/40 p-3">
                      <p className="text-xs uppercase tracking-wide text-emerald-300/70">{egg.name}</p>
                      <p className="mt-1 text-emerald-100/80">
                        Potential rewards classified. Trigger the sequence to retrieve intel.
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
