import React, { useState } from 'react';
import { X, Trophy, Sparkles, CheckCircle2, Lock, Award, Flame, Compass, Layers } from 'lucide-react';
import { WorldTheme, Achievement } from '../game/types';
import { loadAchievements } from '../game/achievements';
import { audio } from '../game/audio';

interface AchievementsModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: WorldTheme;
}

export const AchievementsModal: React.FC<AchievementsModalProps> = ({ isOpen, onClose, theme }) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const achievements: Achievement[] = loadAchievements();

  if (!isOpen) return null;

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const totalCount = achievements.length;
  const percent = Math.round((unlockedCount / totalCount) * 100);

  const filtered = achievements.filter((a) => {
    if (activeCategory === 'all') return true;
    return a.category === activeCategory;
  });

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'progression':
        return <Layers className="w-3.5 h-3.5" />;
      case 'skill':
        return <Flame className="w-3.5 h-3.5" />;
      case 'secrets':
        return <Compass className="w-3.5 h-3.5" />;
      default:
        return <Award className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div
      className="absolute inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-4 sm:p-6 text-white select-none animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="bg-[#121A15] border border-white/20 rounded-3xl p-5 sm:p-6 max-w-2xl w-full flex flex-col max-h-[85vh] shadow-[0_0_60px_rgba(0,0,0,0.9)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black uppercase tracking-wider text-white">
                ACHIEVEMENTS
              </h3>
              <p className="text-[11px] font-mono text-white/50">
                {unlockedCount} of {totalCount} Completed ({percent}%)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              audio.playClick();
              onClose();
            }}
            className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 active:scale-95 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center space-x-1.5 py-3 shrink-0 overflow-x-auto no-scrollbar">
          {[
            { id: 'all', label: 'All' },
            { id: 'progression', label: 'Progression' },
            { id: 'skill', label: 'Skill' },
            { id: 'secrets', label: 'Secrets' },
            { id: 'mastery', label: 'Mastery' },
          ].map((cat) => {
            const isSelected = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  audio.playClick();
                  setActiveCategory(cat.id);
                }}
                style={{
                  backgroundColor: isSelected ? theme.primary : 'rgba(255,255,255,0.06)',
                  color: isSelected ? '#0B0F0C' : '#FFFFFF',
                }}
                className="px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider whitespace-nowrap active:scale-95 transition-all cursor-pointer"
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Achievements List */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-2.5 py-1">
          {filtered.map((item) => {
            const progressRatio = Math.min(1, item.current / item.target);
            return (
              <div
                key={item.id}
                className={`p-3 rounded-2xl border transition-all flex items-center justify-between space-x-3 ${
                  item.unlocked
                    ? 'bg-[#18231C] border-amber-400/40 shadow-[0_0_15px_rgba(251,191,36,0.15)]'
                    : 'bg-[#141C17] border-white/10 opacity-75'
                }`}
              >
                {/* Icon */}
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                    item.unlocked
                      ? 'bg-amber-400/20 border-amber-400/50 text-amber-300'
                      : 'bg-white/5 border-white/10 text-white/40'
                  }`}
                >
                  {item.unlocked ? (
                    <CheckCircle2 className="w-5 h-5 text-amber-400" />
                  ) : (
                    <Lock className="w-4 h-4 text-white/40" />
                  )}
                </div>

                {/* Details & Progress Bar */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <h4
                      className={`text-xs font-black uppercase tracking-wider truncate ${
                        item.unlocked ? 'text-white' : 'text-white/80'
                      }`}
                    >
                      {item.title}
                    </h4>
                    <span className="text-[10px] font-mono font-bold text-white/50 shrink-0">
                      {item.current}/{item.target}
                    </span>
                  </div>

                  <p className="text-[11px] text-white/60 mb-2 line-clamp-1">
                    {item.description}
                  </p>

                  {/* Progress Track */}
                  <div className="w-full h-1.5 bg-black/50 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${progressRatio * 100}%`,
                        backgroundColor: item.unlocked ? '#FBBF24' : theme.primary,
                      }}
                    />
                  </div>
                </div>

                {/* Reward Badge */}
                <div className="shrink-0 flex items-center space-x-1 bg-amber-400/15 border border-amber-400/30 px-2 py-1 rounded-xl text-[10px] font-black text-amber-300">
                  <Sparkles className="w-3 h-3 text-amber-300" />
                  <span>+{item.rewardCrystals}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
