import React from 'react';
import { X, Gift, Sparkles, Check } from 'lucide-react';
import { WorldTheme, DailyRewardState } from '../game/types';
import { audio } from '../game/audio';

interface DailyRewardModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: WorldTheme;
  dailyReward: DailyRewardState;
  onClaim: () => void;
}

const REWARDS = [
  { day: 1, amount: 15 },
  { day: 2, amount: 20 },
  { day: 3, amount: 25 },
  { day: 4, amount: 30 },
  { day: 5, amount: 40 },
  { day: 6, amount: 50 },
  { day: 7, amount: 75 },
];

export const DailyRewardModal: React.FC<DailyRewardModalProps> = ({
  isOpen,
  onClose,
  theme,
  dailyReward,
  onClaim,
}) => {
  if (!isOpen) return null;

  const currentStreak = dailyReward.dayStreak;
  const canClaim = !dailyReward.claimedToday;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none text-white"
      onClick={onClose}
    >
      <div
        className="bg-[#121814] border border-white/20 rounded-3xl max-w-sm w-full p-6 text-center shadow-[0_0_50px_rgba(0,0,0,0.8)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
          <div className="flex items-center space-x-2">
            <Gift className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-black uppercase tracking-wider text-white">DAILY REWARD</h3>
          </div>
          <button
            type="button"
            onClick={() => {
              audio.playClick();
              onClose();
            }}
            className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/70 active:scale-95 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-white/60 mb-5">
          Log in daily to claim free crystal rewards and unlock rare skins!
        </p>

        {/* 7 Days Streak Row */}
        <div className="grid grid-cols-4 gap-2 mb-3">
          {REWARDS.slice(0, 4).map((r) => {
            const isCompleted = r.day < currentStreak || (r.day === currentStreak && dailyReward.claimedToday);
            const isToday = r.day === currentStreak && canClaim;

            return (
              <div
                key={r.day}
                style={{
                  borderColor: isToday ? '#FBBF24' : isCompleted ? '#22C55E' : 'rgba(255,255,255,0.1)',
                  backgroundColor: isToday ? 'rgba(251, 191, 36, 0.15)' : 'rgba(0,0,0,0.4)',
                }}
                className="p-2 rounded-2xl border flex flex-col items-center justify-center text-center"
              >
                <span className="text-[10px] font-black uppercase text-white/50 mb-1">D{r.day}</span>
                <Sparkles className="w-4 h-4 text-emerald-400 mb-0.5" />
                <span className="text-xs font-black font-mono">+{r.amount}</span>
                {isCompleted && <Check className="w-3 h-3 text-emerald-400 mt-0.5" />}
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-3 gap-2 mb-6">
          {REWARDS.slice(4, 7).map((r) => {
            const isCompleted = r.day < currentStreak || (r.day === currentStreak && dailyReward.claimedToday);
            const isToday = r.day === currentStreak && canClaim;

            return (
              <div
                key={r.day}
                style={{
                  borderColor: isToday ? '#FBBF24' : isCompleted ? '#22C55E' : 'rgba(255,255,255,0.1)',
                  backgroundColor: isToday ? 'rgba(251, 191, 36, 0.15)' : 'rgba(0,0,0,0.4)',
                }}
                className={`p-2.5 rounded-2xl border flex flex-col items-center justify-center text-center ${
                  r.day === 7 ? 'col-span-1 border-amber-400/40 bg-amber-500/10' : ''
                }`}
              >
                <span className="text-[10px] font-black uppercase text-white/50 mb-1">
                  {r.day === 7 ? '★ DAY 7' : `DAY ${r.day}`}
                </span>
                <Sparkles className="w-4 h-4 text-emerald-400 mb-0.5" />
                <span className="text-xs font-black font-mono">+{r.amount}</span>
                {isCompleted && <Check className="w-3 h-3 text-emerald-400 mt-0.5" />}
              </div>
            );
          })}
        </div>

        {canClaim ? (
          <button
            type="button"
            onClick={() => {
              audio.playClaimReward();
              onClaim();
            }}
            style={{
              background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
            }}
            className="w-full py-3.5 rounded-2xl text-[#0B0F0C] font-black uppercase tracking-wider text-sm active:scale-95 transition-all shadow-xl cursor-pointer"
          >
            Claim Today's Reward!
          </button>
        ) : (
          <div className="py-3 px-4 rounded-2xl bg-white/5 border border-white/10 text-xs font-bold text-white/50">
            ✓ Claimed Today! Come back tomorrow for Day {(currentStreak % 7) + 1}.
          </div>
        )}
      </div>
    </div>
  );
};
