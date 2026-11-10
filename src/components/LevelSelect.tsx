import React, { useState, useRef } from 'react';
import {
  ArrowLeft,
  Lock,
  Star,
  Sparkles,
  Clock,
  Play,
  ChevronLeft,
  ChevronRight,
  Crown,
  Compass,
} from 'lucide-react';
import { WorldTheme, LevelProgress } from '../game/types';
import { getLevelsForWorld } from '../game/levels';
import { getWorldTheme } from '../game/themes';
import { audio } from '../game/audio';

interface LevelSelectProps {
  currentTheme: WorldTheme;
  levelProgress: Record<number, LevelProgress>;
  currentLevelId: number;
  onSelectLevel: (lvlId: number) => void;
  onBackToMenu: () => void;
}

const WORLDS = [
  { id: 1, name: 'Neon Sector', subtitle: 'Gravity Basics (1–5)', boss: 'Laser Sentinel' },
  { id: 2, name: 'Cyber Platform', subtitle: 'Moving Rails (6–10)', boss: 'Plasma Ascent' },
  { id: 3, name: 'Magma Hazard', subtitle: 'Lasers & Saws (11–15)', boss: 'Crushing Forge' },
  { id: 4, name: 'Void Dimensions', subtitle: 'Spatial Vector (16–20)', boss: 'Grand Gauntlet' },
  { id: 5, name: 'Frost Glacier', subtitle: 'Ice & Wind (21–25)', boss: 'Frost Tempest' },
  { id: 6, name: 'Machine Factory', subtitle: 'Switches & Crates (26–30)', boss: 'Apex Mecha-Construct' },
  { id: 7, name: 'Dark Laboratory', subtitle: 'Shadow & Lasers (31–35)', boss: 'Cyber Hydra Drone' },
  { id: 8, name: 'Chaos Core', subtitle: 'Final Singularity (36–40)', boss: 'Graviton Singularity' },
];

export const LevelSelect: React.FC<LevelSelectProps> = ({
  levelProgress,
  currentLevelId,
  onSelectLevel,
  onBackToMenu,
}) => {
  // Determine initial selected world based on current level
  const initialWorld = Math.max(1, Math.min(8, Math.ceil(currentLevelId / 5)));
  const [selectedWorld, setSelectedWorld] = useState<number>(initialWorld);
  const tabsContainerRef = useRef<HTMLDivElement | null>(null);

  const worldLevels = getLevelsForWorld(selectedWorld);
  const activeWorldTheme = getWorldTheme(selectedWorld);

  // Compute total stars for active world
  const worldStars = worldLevels.reduce((acc, lvl) => {
    return acc + (levelProgress[lvl.id]?.stars || 0);
  }, 0);

  const handlePrevWorld = () => {
    audio.playClick();
    setSelectedWorld((prev) => {
      const next = prev > 1 ? prev - 1 : 8;
      scrollToTab(next);
      return next;
    });
  };

  const handleNextWorld = () => {
    audio.playClick();
    setSelectedWorld((prev) => {
      const next = prev < 8 ? prev + 1 : 1;
      scrollToTab(next);
      return next;
    });
  };

  const scrollToTab = (wId: number) => {
    if (!tabsContainerRef.current) return;
    const tabEl = tabsContainerRef.current.children[wId - 1] as HTMLElement;
    if (tabEl) {
      tabEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  };

  const formatTime = (sec: number | null) => {
    if (sec === null) return '--:--';
    const mins = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    const ms = Math.floor((sec % 1) * 10);
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms}`;
  };

  return (
    <div
      className="absolute inset-0 z-30 flex flex-col p-4 sm:p-6 select-none text-white overflow-hidden backdrop-blur-md"
      style={{
        backgroundColor: activeWorldTheme.bgDark,
        background: `radial-gradient(circle at 50% 20%, ${activeWorldTheme.bgDark} 30%, #060907 90%)`,
      }}
    >
      {/* Top Header */}
      <div className="flex items-center justify-between w-full max-w-4xl mx-auto mb-3 shrink-0">
        <button
          type="button"
          onClick={() => {
            audio.playClick();
            onBackToMenu();
          }}
          className="flex items-center space-x-2 px-3.5 py-2 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 text-xs font-black uppercase tracking-wider active:scale-95 transition-all cursor-pointer shadow-lg"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Menu</span>
        </button>

        <div className="flex flex-col items-center">
          <h2
            className="text-lg sm:text-2xl font-black uppercase tracking-widest drop-shadow-md"
            style={{ color: activeWorldTheme.primary }}
          >
            SECTOR DISPATCH // 8 WORLDS
          </h2>
          <div className="flex items-center space-x-2 text-[11px] font-mono text-white/60">
            <span>World {selectedWorld} Stars:</span>
            <span className="font-bold text-amber-400 flex items-center space-x-0.5">
              <Star className="w-3 h-3 fill-amber-400 inline" />
              <span>{worldStars}/15</span>
            </span>
          </div>
        </div>

        <div className="w-20" />
      </div>

      {/* World Carousel Navigation (Horizontal Swipe + Left/Right Chevrons) */}
      <div className="w-full max-w-4xl mx-auto mb-4 shrink-0 flex items-center space-x-2">
        <button
          type="button"
          onClick={handlePrevWorld}
          aria-label="Previous World"
          className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center shrink-0 active:scale-90 transition-all cursor-pointer shadow"
        >
          <ChevronLeft className="w-4 h-4 text-white" />
        </button>

        <div
          ref={tabsContainerRef}
          className="flex-1 flex items-center space-x-2 overflow-x-auto no-scrollbar scroll-smooth py-1"
          style={{ scrollbarWidth: 'none' }}
        >
          {WORLDS.map((w) => {
            const wTheme = getWorldTheme(w.id);
            const isSelected = w.id === selectedWorld;
            return (
              <button
                key={w.id}
                type="button"
                onClick={() => {
                  audio.playClick();
                  setSelectedWorld(w.id);
                  scrollToTab(w.id);
                }}
                style={{
                  borderColor: isSelected ? wTheme.primary : 'rgba(255,255,255,0.12)',
                  backgroundColor: isSelected ? `${wTheme.primary}22` : 'rgba(0,0,0,0.45)',
                  boxShadow: isSelected ? `0 0 16px ${wTheme.primary}35` : 'none',
                }}
                className="px-3.5 py-2 rounded-2xl border text-left shrink-0 transition-all active:scale-95 cursor-pointer shadow-md min-w-[130px] sm:min-w-[150px]"
              >
                <div className="flex items-center justify-between">
                  <span
                    className="text-[10px] font-black uppercase tracking-wider"
                    style={{ color: isSelected ? wTheme.primary : '#94A3B8' }}
                  >
                    W{w.id} • {w.id <= 4 ? 'BASE' : 'EXPANSION'}
                  </span>
                  <Crown className="w-3 h-3 text-amber-400/70" />
                </div>
                <span className="block text-xs font-bold text-white truncate">{w.name}</span>
                <span className="block text-[9px] text-white/50 truncate font-mono">{w.subtitle}</span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={handleNextWorld}
          aria-label="Next World"
          className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center shrink-0 active:scale-90 transition-all cursor-pointer shadow"
        >
          <ChevronRight className="w-4 h-4 text-white" />
        </button>
      </div>

      {/* Level Cards Grid for Current World (5 handcrafted levels per world) */}
      <div className="flex-1 w-full max-w-4xl mx-auto overflow-y-auto pr-1">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pb-6">
          {worldLevels.map((lvl) => {
            const prog = levelProgress[lvl.id] || {
              unlocked: lvl.id === 1,
              stars: 0,
              bestTime: null,
              crystalsCollected: 0,
            };
            const isUnlocked = prog.unlocked;
            const isCurrent = lvl.id === currentLevelId;
            const isBossRoom = !!lvl.isBoss;

            return (
              <div
                key={lvl.id}
                style={{
                  borderColor: isCurrent
                    ? activeWorldTheme.primary
                    : isBossRoom
                    ? '#F43F5E60'
                    : isUnlocked
                    ? 'rgba(255,255,255,0.15)'
                    : 'rgba(255,255,255,0.06)',
                  backgroundColor: isBossRoom
                    ? 'rgba(35, 15, 20, 0.75)'
                    : isUnlocked
                    ? 'rgba(20, 26, 22, 0.75)'
                    : 'rgba(10, 14, 12, 0.6)',
                }}
                className={`p-4 rounded-3xl border transition-all flex flex-col justify-between shadow-xl relative overflow-hidden ${
                  isUnlocked ? 'hover:border-white/30' : 'opacity-60'
                }`}
              >
                {/* Boss Corner Ribbon / Glow */}
                {isBossRoom && (
                  <div className="absolute top-0 right-0 bg-rose-600/25 border-b border-l border-rose-500/40 px-2 py-0.5 rounded-bl-xl text-[9px] font-black uppercase tracking-widest text-rose-300 flex items-center space-x-1">
                    <Crown className="w-3 h-3 text-amber-400" />
                    <span>BOSS CHALLENGE</span>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-1.5">
                      <span
                        className="text-xs font-black uppercase tracking-wider font-mono px-2 py-0.5 rounded-lg"
                        style={{
                          backgroundColor: `${activeWorldTheme.primary}20`,
                          color: activeWorldTheme.primary,
                        }}
                      >
                        ROOM {lvl.id}
                      </span>

                      {/* Secret Room indicator if present */}
                      {lvl.secretPassages && lvl.secretPassages.length > 0 && (
                        <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-400/30 flex items-center space-x-0.5">
                          <Compass className="w-2.5 h-2.5" />
                          <span>SECRET</span>
                        </span>
                      )}
                    </div>

                    {/* Star Rating Badges */}
                    {isUnlocked ? (
                      <div className="flex items-center space-x-1">
                        {[1, 2, 3].map((starIdx) => (
                          <Star
                            key={starIdx}
                            className={`w-4 h-4 ${
                              prog.stars >= starIdx
                                ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]'
                                : 'text-white/20'
                            }`}
                          />
                        ))}
                      </div>
                    ) : (
                      <Lock className="w-4 h-4 text-white/40" />
                    )}
                  </div>

                  <h3 className="text-sm font-black text-white/95 mb-1 truncate">
                    {lvl.bossTitle || lvl.name}
                  </h3>
                  <p className="text-[11px] text-white/50 line-clamp-2 mb-3">
                    {lvl.bossIntroText || lvl.hint || ''}
                  </p>
                </div>

                {isUnlocked ? (
                  <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                    <div className="flex items-center space-x-3 text-[10px] font-mono text-white/70">
                      <div className="flex items-center space-x-1">
                        <Sparkles className="w-3 h-3 text-emerald-400" />
                        <span>{prog.crystalsCollected}/{lvl.crystals.length}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3 text-sky-400" />
                        <span>{formatTime(prog.bestTime)}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        audio.playClick();
                        onSelectLevel(lvl.id);
                      }}
                      style={{
                        backgroundColor: isBossRoom ? '#F43F5E' : activeWorldTheme.primary,
                        color: isBossRoom ? '#FFFFFF' : '#0B0F0C',
                      }}
                      className="px-3.5 py-1.5 rounded-xl font-black uppercase tracking-wider text-[11px] flex items-center space-x-1 active:scale-95 transition-transform shadow-md cursor-pointer"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>{isBossRoom ? 'Fight' : 'Play'}</span>
                    </button>
                  </div>
                ) : (
                  <div className="pt-2 border-t border-white/5 text-[10px] font-mono text-white/40 flex items-center space-x-1">
                    <Lock className="w-3 h-3" />
                    <span>Clear previous room to unlock</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
