import React, { useEffect } from 'react';
import { Trophy, Sparkles } from 'lucide-react';
import { Achievement } from '../game/types';

interface AchievementToastProps {
  achievement: Achievement | null;
  onDismiss: () => void;
}

export const AchievementToast: React.FC<AchievementToastProps> = ({ achievement, onDismiss }) => {
  useEffect(() => {
    if (!achievement) return;
    const timer = setTimeout(() => {
      onDismiss();
    }, 4000);
    return () => clearTimeout(timer);
  }, [achievement, onDismiss]);

  if (!achievement) return null;

  return (
    <div className="fixed top-14 right-4 z-50 pointer-events-auto select-none animate-in fade-in slide-in-from-top-3 duration-300">
      <div className="flex items-center space-x-3 bg-gradient-to-r from-[#18201B] via-[#1F2C24] to-[#18201B] border border-amber-400/60 p-3.5 rounded-2xl shadow-[0_0_30px_rgba(251,191,36,0.45)] max-w-sm">
        <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center shrink-0">
          <Trophy className="w-5 h-5 text-amber-400 animate-bounce" />
        </div>
        <div className="flex-1 min-w-0 pr-1">
          <div className="flex items-center space-x-1.5 mb-0.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">
              ACHIEVEMENT UNLOCKED!
            </span>
          </div>
          <h4 className="text-xs font-black text-white truncate">{achievement.title}</h4>
          <p className="text-[10px] text-white/60 line-clamp-1">{achievement.description}</p>
        </div>
        <div className="shrink-0 flex items-center space-x-1 bg-amber-400/15 border border-amber-400/30 px-2 py-1 rounded-xl text-[10px] font-black text-amber-300">
          <Sparkles className="w-3 h-3 text-amber-300" />
          <span>+{achievement.rewardCrystals}</span>
        </div>
      </div>
    </div>
  );
};
