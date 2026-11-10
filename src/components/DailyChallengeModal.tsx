import React from 'react';
import { X, Calendar, Flame, Sparkles, Play, CheckCircle2, Zap } from 'lucide-react';
import { WorldTheme, DailyChallengeInfo } from '../game/types';
import { audio } from '../game/audio';

interface DailyChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: WorldTheme;
  info: DailyChallengeInfo;
  onStartChallenge: (levelId: number) => void;
}

export const DailyChallengeModal: React.FC<DailyChallengeModalProps> = ({
  isOpen,
  onClose,
  theme,
  info,
  onStartChallenge,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="absolute inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-4 sm:p-6 text-white select-none animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="bg-[#121A15] border border-white/20 rounded-3xl p-6 sm:p-7 max-w-sm w-full shadow-[0_0_60px_rgba(0,0,0,0.9)] relative overflow-hidden text-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={() => {
            audio.playClick();
            onClose();
          }}
          className="absolute top-4 right-4 w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 active:scale-95 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Top Header Icon */}
        <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center mx-auto mb-3">
          <Calendar className="w-7 h-7 text-amber-400" />
        </div>

        <h3 className="text-xl font-black uppercase tracking-wider text-white mb-1">
          DAILY CHALLENGE
        </h3>
        <p className="text-xs font-mono text-neutral-400 mb-4">{info.date}</p>

        {/* Challenge Box */}
        <div className="bg-[#18231C] border border-white/10 p-4 rounded-2xl mb-4 text-left">
          <div className="flex items-center justify-between mb-2">
            <span
              className="text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg"
              style={{ backgroundColor: `${theme.primary}25`, color: theme.primary }}
            >
              SECTOR ROOM {info.levelId}
            </span>

            {/* Streak Counter */}
            <div className="flex items-center space-x-1 text-xs font-mono font-black text-amber-300">
              <Flame className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span>{info.streak} STREAK</span>
            </div>
          </div>

          <div className="flex items-center space-x-1.5 text-xs font-black text-amber-300 mb-1">
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>MODIFIER: {info.modifierTitle}</span>
          </div>
          <p className="text-[11px] text-white/70 leading-relaxed mb-3">
            {info.modifierDesc}
          </p>

          <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs font-mono">
            <span className="text-white/60">Reward:</span>
            <div className="flex items-center space-x-1 text-amber-300 font-black">
              <Sparkles className="w-3.5 h-3.5" />
              <span>+{info.reward} Crystals</span>
            </div>
          </div>
        </div>

        {info.completed ? (
          <div className="space-y-2">
            <div className="py-3 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 font-black uppercase tracking-wider text-xs flex items-center justify-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>COMPLETED TODAY!</span>
            </div>
            {info.bestTime && (
              <p className="text-[11px] font-mono text-white/50">
                Your Time: {info.bestTime.toFixed(2)}s
              </p>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => {
              audio.playClick();
              onStartChallenge(info.levelId);
            }}
            style={{
              background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
            }}
            className="w-full py-3.5 rounded-2xl text-[#0B0F0C] font-black uppercase tracking-wider text-xs flex items-center justify-center space-x-2 active:scale-95 transition-transform shadow-xl cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>START CHALLENGE</span>
          </button>
        )}
      </div>
    </div>
  );
};
