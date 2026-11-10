import React, { useState } from 'react';
import { X, Timer, Trophy, Play, Ghost, ChevronLeft, ChevronRight } from 'lucide-react';
import { WorldTheme } from '../game/types';
import { getTimeAttackLeaderboard } from '../game/timeattack';
import { audio } from '../game/audio';

interface TimeAttackModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: WorldTheme;
  currentLevelId: number;
  totalLevels: number;
  ghostEnabled: boolean;
  onToggleGhost: () => void;
  onStartTimeAttack: (levelId: number) => void;
}

export const TimeAttackModal: React.FC<TimeAttackModalProps> = ({
  isOpen,
  onClose,
  theme,
  currentLevelId,
  totalLevels,
  ghostEnabled,
  onToggleGhost,
  onStartTimeAttack,
}) => {
  const [selectedLevel, setSelectedLevel] = useState<number>(currentLevelId);
  const leaderboard = getTimeAttackLeaderboard(selectedLevel);

  if (!isOpen) return null;

  const handlePrev = () => {
    audio.playClick();
    setSelectedLevel((prev) => (prev > 1 ? prev - 1 : totalLevels));
  };

  const handleNext = () => {
    audio.playClick();
    setSelectedLevel((prev) => (prev < totalLevels ? prev + 1 : 1));
  };

  return (
    <div
      className="absolute inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-4 sm:p-6 text-white select-none animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="bg-[#121A15] border border-white/20 rounded-3xl p-6 sm:p-7 max-w-sm w-full shadow-[0_0_60px_rgba(0,0,0,0.9)] relative overflow-hidden text-center"
        onClick={(e) => e.stopPropagation()}
      >
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
        <div className="w-14 h-14 rounded-2xl bg-sky-500/20 border border-sky-400/40 flex items-center justify-center mx-auto mb-3">
          <Timer className="w-7 h-7 text-sky-400" />
        </div>

        <h3 className="text-xl font-black uppercase tracking-wider text-white mb-1">
          TIME ATTACK
        </h3>
        <p className="text-[11px] font-mono text-white/50 mb-4">
          Pure speedrun mode • No crystal collecting required
        </p>

        {/* Level Switcher */}
        <div className="flex items-center justify-between bg-black/50 p-2 rounded-2xl border border-white/10 mb-4">
          <button
            type="button"
            onClick={handlePrev}
            className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 active:scale-95 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-black uppercase tracking-wider font-mono text-white">
            ROOM {selectedLevel} / {totalLevels}
          </span>
          <button
            type="button"
            onClick={handleNext}
            className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 active:scale-95 cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Local Leaderboard Records */}
        <div className="bg-[#18231C] border border-white/10 p-3.5 rounded-2xl mb-4 text-left">
          <div className="flex items-center space-x-1.5 text-xs font-black uppercase tracking-wider text-amber-300 mb-2">
            <Trophy className="w-3.5 h-3.5" />
            <span>LOCAL LEADERBOARD</span>
          </div>

          {leaderboard.length === 0 ? (
            <p className="text-xs text-white/40 font-mono py-2 text-center">
              No recorded runs yet for Room {selectedLevel}.
            </p>
          ) : (
            <div className="space-y-1.5">
              {leaderboard.map((rec, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between py-1 px-2 rounded-xl bg-white/5 text-xs font-mono"
                >
                  <span className="font-bold text-amber-400">#{idx + 1}</span>
                  <span className="font-black text-white">{rec.time.toFixed(2)}s</span>
                  <span className="text-[10px] text-white/40">{rec.date}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Ghost Run Replay Toggle */}
        <div className="flex items-center justify-between py-2 px-3 rounded-2xl bg-white/5 border border-white/10 mb-4">
          <div className="flex items-center space-x-2 text-xs font-mono">
            <Ghost className="w-4 h-4 text-sky-400" />
            <span>PB Ghost Run Replay</span>
          </div>
          <button
            type="button"
            onClick={() => {
              audio.playClick();
              onToggleGhost();
            }}
            className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
              ghostEnabled ? 'bg-sky-500' : 'bg-neutral-700'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                ghostEnabled ? 'left-6' : 'left-1'
              }`}
            />
          </button>
        </div>

        {/* Launch Button */}
        <button
          type="button"
          onClick={() => {
            audio.playClick();
            onStartTimeAttack(selectedLevel);
          }}
          style={{
            background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
          }}
          className="w-full py-3.5 rounded-2xl text-[#0B0F0C] font-black uppercase tracking-wider text-xs flex items-center justify-center space-x-2 active:scale-95 transition-transform shadow-xl cursor-pointer"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>LAUNCH SPEEDRUN</span>
        </button>
      </div>
    </div>
  );
};
