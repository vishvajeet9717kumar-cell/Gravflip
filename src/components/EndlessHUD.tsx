import React from 'react';
import { Trophy, Sparkles, RotateCcw, Home, Pause, Play, Zap } from 'lucide-react';
import { WorldTheme } from '../game/types';
import { audio } from '../game/audio';

interface EndlessHUDProps {
  distance: number;
  stageNumber: number;
  crystalsCollected: number;
  highScore: number;
  speedMultiplier: number;
  isGameOver: boolean;
  isPaused: boolean;
  theme: WorldTheme;
  onRestart: () => void;
  onTogglePause: () => void;
  onBackToMenu: () => void;
}

export const EndlessHUD: React.FC<EndlessHUDProps> = ({
  distance,
  stageNumber,
  crystalsCollected,
  highScore,
  speedMultiplier,
  isGameOver,
  isPaused,
  theme,
  onRestart,
  onTogglePause,
  onBackToMenu,
}) => {
  const isNewHighScore = distance > highScore && distance > 0;

  // Track viewport dimensions and orientation
  const [dimensions, setDimensions] = React.useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 800,
    height: typeof window !== 'undefined' ? window.innerHeight : 600,
    isLandscape: typeof window !== 'undefined' ? window.innerWidth > window.innerHeight : true,
    isShortScreen: typeof window !== 'undefined' ? window.innerHeight < 500 : false,
  });

  React.useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      setDimensions({
        width: w,
        height: h,
        isLandscape: w > h,
        isShortScreen: h < 500,
      });
    };
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  return (
    <>
      {/* Top Header Bar */}
      <div className="absolute top-0 left-0 right-0 z-20 flex flex-col items-center pointer-events-none select-none px-3 md:px-5 py-2.5">
        <div className="w-full flex items-center justify-between">
          {/* Left: Distance & Stage */}
          <div className="flex items-center space-x-2 pointer-events-auto">
            <div className="flex items-center bg-black/60 backdrop-blur-xl px-3.5 py-1.5 rounded-2xl border border-white/10 shadow-lg space-x-2">
              <span className="text-xs font-black uppercase tracking-wider text-rose-400 font-mono">
                STAGE {stageNumber}
              </span>
              <span className="text-white/30 font-mono text-xs">•</span>
              <span className="text-sm font-black font-mono text-white tracking-widest">
                {distance}m
              </span>
            </div>

            {/* Speed Multiplier Badge */}
            <div className="hidden sm:flex items-center space-x-1 px-2.5 py-1.5 rounded-2xl border border-amber-400/40 bg-black/60 backdrop-blur-xl text-[10px] font-black font-mono text-amber-300">
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>{speedMultiplier.toFixed(2)}x SPEED</span>
            </div>
          </div>

          {/* Center: High Score & Crystals */}
          <div className="flex items-center space-x-2 pointer-events-auto">
            <div className="flex items-center space-x-1.5 bg-black/60 backdrop-blur-xl px-3 py-1.5 rounded-2xl border border-white/10 shadow-lg text-xs font-mono">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-neutral-400 text-[10px]">BEST:</span>
              <span className="font-black text-amber-300">{Math.max(highScore, distance)}m</span>
            </div>

            <div className="flex items-center space-x-1.5 bg-black/60 backdrop-blur-xl px-3 py-1.5 rounded-2xl border border-white/10 shadow-lg text-xs font-mono">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-black text-white">{crystalsCollected}</span>
            </div>
          </div>

          {/* Right: Controls */}
          <div className="flex items-center space-x-2 pointer-events-auto">
            <button
              type="button"
              onClick={() => {
                audio.playClick();
                onRestart();
              }}
              aria-label="Restart Run"
              className="w-10 h-10 rounded-2xl bg-black/60 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white/80 active:scale-95 transition-all shadow-lg cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                audio.playClick();
                onTogglePause();
              }}
              aria-label="Pause"
              className="w-10 h-10 rounded-2xl bg-black/60 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white/80 active:scale-95 transition-all shadow-lg cursor-pointer"
            >
              {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={() => {
                audio.playClick();
                onBackToMenu();
              }}
              aria-label="Menu"
              className="w-10 h-10 rounded-2xl bg-black/60 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white/80 active:scale-95 transition-all shadow-lg cursor-pointer"
            >
              <Home className="w-4 h-4" style={{ color: theme.primary }} />
            </button>
          </div>
        </div>
      </div>

      {/* Endless Pause Modal */}
      {isPaused && !isGameOver && (
        <div
          className="absolute inset-0 z-40 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 text-white select-none animate-in fade-in"
          style={{
            paddingTop: 'max(8px, env(safe-area-inset-top))',
            paddingBottom: 'max(8px, env(safe-area-inset-bottom))',
            paddingLeft: 'max(8px, env(safe-area-inset-left))',
            paddingRight: 'max(8px, env(safe-area-inset-right))',
          }}
        >
          <div
            className="bg-[#121A15] border border-white/20 rounded-3xl max-w-sm w-full flex flex-col shadow-[0_0_60px_rgba(0,0,0,0.9)] overflow-hidden"
            style={{ maxHeight: 'min(94dvh, 94svh)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`flex-1 min-h-0 overflow-y-auto text-center ${dimensions.isShortScreen ? 'p-3 space-y-2' : 'p-5 sm:p-6 space-y-3'}`}>
              <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mx-auto">
                <Pause className="w-6 h-6 text-white" />
              </div>
              <h3 className={`font-black uppercase tracking-widest text-white ${dimensions.isShortScreen ? 'text-lg' : 'text-xl'}`}>
                ENDLESS PAUSED
              </h3>
              <p className="text-xs font-mono text-neutral-400">
                Stage {stageNumber} • {distance}m
              </p>
            </div>

            {/* Pinned Sticky Footer - Min 56px height */}
            <div className={`shrink-0 sticky bottom-0 z-10 bg-gradient-to-t from-[#121A15] via-[#121A15] to-[#121A15]/90 border-t border-white/10 space-y-2 ${dimensions.isShortScreen ? 'p-2 sm:p-2.5' : 'p-3 sm:p-4'}`}>
              <button
                type="button"
                onClick={() => {
                  audio.playClick();
                  onTogglePause();
                }}
                style={{
                  background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
                }}
                className="w-full min-h-[56px] h-14 rounded-2xl text-[#0B0F0C] font-black uppercase tracking-wider text-xs sm:text-sm flex items-center justify-center space-x-2 active:scale-95 transition-transform shadow-xl cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Resume Run</span>
              </button>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    audio.playClick();
                    onRestart();
                  }}
                  className="min-h-[56px] h-14 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold uppercase tracking-wider text-xs flex items-center justify-center space-x-1.5 active:scale-95 transition-all cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Restart</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    audio.playClick();
                    onBackToMenu();
                  }}
                  className="min-h-[56px] h-14 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold uppercase tracking-wider text-xs flex items-center justify-center space-x-1.5 active:scale-95 transition-all cursor-pointer"
                >
                  <Home className="w-4 h-4" style={{ color: theme.primary }} />
                  <span>Menu</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Endless Game Over Modal */}
      {isGameOver && (
        <div
          className="absolute inset-0 z-40 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 text-white select-none animate-in fade-in"
          style={{
            paddingTop: 'max(8px, env(safe-area-inset-top))',
            paddingBottom: 'max(8px, env(safe-area-inset-bottom))',
            paddingLeft: 'max(8px, env(safe-area-inset-left))',
            paddingRight: 'max(8px, env(safe-area-inset-right))',
          }}
        >
          <div
            className={`bg-[#121A15] border border-white/20 rounded-3xl w-full flex flex-col shadow-[0_0_60px_rgba(0,0,0,0.9)] overflow-hidden ${
              dimensions.isLandscape ? 'max-w-lg' : 'max-w-sm'
            }`}
            style={{ maxHeight: 'min(94dvh, 94svh)' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Scrollable Middle Content */}
            <div className={`flex-1 min-h-0 overflow-y-auto text-center ${dimensions.isShortScreen ? 'p-3 space-y-2' : 'p-5 sm:p-6 space-y-3'}`}>
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-400/40 flex items-center justify-center mx-auto">
                <Trophy className="w-6 h-6 text-amber-400" />
              </div>

              <div>
                <h3 className={`font-black uppercase tracking-widest text-white ${dimensions.isShortScreen ? 'text-lg' : 'text-xl'}`}>
                  ORBIT CONCLUDED
                </h3>
                <p className="text-xs font-mono text-neutral-400">
                  Reached Stage {stageNumber} in the Void
                </p>
              </div>

              {/* Score Grid */}
              <div className="grid grid-cols-2 gap-2 text-left">
                <div className={`bg-[#18231C] rounded-2xl border border-white/10 ${dimensions.isShortScreen ? 'p-2' : 'p-3'}`}>
                  <span className="block text-[10px] uppercase font-bold text-neutral-400 mb-0.5">
                    Distance
                  </span>
                  <span className="text-base sm:text-lg font-black font-mono text-white">{distance}m</span>
                  {isNewHighScore && (
                    <span className="block text-[9px] font-black text-amber-300 uppercase tracking-wider mt-0.5 animate-pulse">
                      ★ New High Score!
                    </span>
                  )}
                </div>
                <div className={`bg-[#18231C] rounded-2xl border border-white/10 ${dimensions.isShortScreen ? 'p-2' : 'p-3'}`}>
                  <span className="block text-[10px] uppercase font-bold text-neutral-400 mb-0.5">
                    Reward
                  </span>
                  <span className="text-base sm:text-lg font-black font-mono text-emerald-400">
                    +{crystalsCollected + Math.floor(distance / 20)}
                  </span>
                  <span className="block text-[9px] text-neutral-400 uppercase tracking-wider mt-0.5">
                    Bank updated
                  </span>
                </div>
              </div>
            </div>

            {/* Pinned Sticky Footer - Min 56px height */}
            <div className={`shrink-0 sticky bottom-0 z-10 bg-gradient-to-t from-[#121A15] via-[#121A15] to-[#121A15]/90 border-t border-white/10 space-y-2 ${dimensions.isShortScreen ? 'p-2 sm:p-2.5' : 'p-3 sm:p-4'}`}>
              <button
                type="button"
                onClick={() => {
                  audio.playClick();
                  onRestart();
                }}
                style={{
                  background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
                }}
                className="w-full min-h-[56px] h-14 rounded-2xl text-[#0B0F0C] font-black uppercase tracking-wider text-xs sm:text-sm flex items-center justify-center space-x-2 active:scale-95 transition-transform shadow-xl cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>RETRY RUN</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  audio.playClick();
                  onBackToMenu();
                }}
                className="w-full min-h-[56px] h-14 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold uppercase tracking-wider text-xs flex items-center justify-center space-x-2 active:scale-95 transition-transform cursor-pointer"
              >
                <Home className="w-4 h-4" style={{ color: theme.primary }} />
                <span>Main Menu</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
