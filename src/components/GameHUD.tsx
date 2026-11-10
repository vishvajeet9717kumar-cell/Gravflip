import React, { useMemo, useState, useEffect, useRef } from 'react';
import {
  ArrowDown,
  ArrowUp,
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  Pause,
  Play,
  Sparkles,
  Trophy,
  Maximize,
  Sliders,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  Crown,
  AlertTriangle,
  Terminal,
  Compass,
  Ghost,
  Skull,
} from 'lucide-react';
import { GravityDirection, GameStatus, WorldTheme } from '../game/types';
import { audio } from '../game/audio';
import { Star, Shield, Zap, Clock, Home, Grid, MoreVertical, X, FastForward } from 'lucide-react';

interface GameHUDProps {
  levelName: string;
  levelNumber: number;
  totalLevels: number;
  hint?: string;
  parTime: number;
  crystalsCollected: number;
  totalCrystals: number;
  timeSeconds: number;
  gravityDir: GravityDirection;
  status: GameStatus;
  theme: WorldTheme;
  currentWorld: number;
  hasStarCrystal?: boolean;
  starCrystalAvailable?: boolean;
  activeCombo?: number;
  hasShield?: boolean;
  extraFlips?: number;
  timeSlowTimer?: number;
  starsEarned?: number;
  newCrystalsAdded?: number;
  isNewBestTime?: boolean;
  // Stage D Props
  isBoss?: boolean;
  bossTitle?: string;
  bossIntroText?: string;
  storyIntro?: string | { worldName?: string; lines: string[]; };
  chaosTimer?: number;
  // Stage E Props
  gameMode?: 'STANDARD' | 'ENDLESS' | 'DAILY' | 'TIME_ATTACK';
  hintAvailable?: boolean;
  onTriggerHint?: () => void;
  ghostActive?: boolean;
  deathCount?: number;
  onCycleWorld?: () => void;
  onRestart: () => void;
  onTogglePause: () => void;
  onNextLevel: () => void;
  onSelectLevel: (lvlId: number) => void;
  onOpenSettings: () => void;
  autoNext?: boolean;
  onBackToMenu?: () => void;
  onOpenLevelSelect?: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  levelName,
  levelNumber,
  totalLevels,
  hint,
  parTime,
  crystalsCollected,
  totalCrystals,
  timeSeconds,
  gravityDir,
  status,
  theme,
  currentWorld,
  hasStarCrystal = false,
  starCrystalAvailable = true,
  activeCombo = 0,
  hasShield = false,
  extraFlips = 0,
  timeSlowTimer = 0,
  starsEarned = 1,
  newCrystalsAdded = 0,
  isNewBestTime = false,
  isBoss = false,
  bossTitle,
  bossIntroText,
  storyIntro,
  chaosTimer,
  gameMode = 'STANDARD',
  hintAvailable = false,
  onTriggerHint,
  ghostActive = false,
  deathCount = 0,
  onCycleWorld,
  onRestart,
  onTogglePause,
  onNextLevel,
  onSelectLevel,
  onOpenSettings,
  autoNext = true,
  onBackToMenu,
  onOpenLevelSelect,
}) => {
  const [showHint, setShowHint] = useState<boolean>(true);
  const [showBossIntro, setShowBossIntro] = useState<boolean>(isBoss);
  const [showStoryModal, setShowStoryModal] = useState<boolean>(!!storyIntro);

  // Responsive dimensions tracking (auto updates on resize & orientation change)
  const [dimensions, setDimensions] = useState(() => ({
    width: typeof window !== 'undefined' ? window.innerWidth : 800,
    height: typeof window !== 'undefined' ? window.innerHeight : 600,
    isLandscape: typeof window !== 'undefined' ? window.innerWidth >= window.innerHeight : true,
    isShortScreen: typeof window !== 'undefined' ? window.innerHeight < 500 : false,
  }));

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      setDimensions({
        width: w,
        height: h,
        isLandscape: w >= h,
        isShortScreen: h < 500,
      });
    };
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    handleResize();
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  // Level & World progression logic
  const isWorldEnd = levelNumber % 5 === 0 && levelNumber < 40;
  const isGameFinished = levelNumber >= 40;
  const nextWorldNumber = Math.floor(levelNumber / 5) + 1;

  // Auto-next countdown state with interval ref to prevent race conditions & bad setState
  const [autoNextCountdown, setAutoNextCountdown] = useState<number | null>(null);
  const autoNextTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onNextLevelRef = useRef(onNextLevel);
  useEffect(() => {
    onNextLevelRef.current = onNextLevel;
  }, [onNextLevel]);

  const cancelAutoNext = () => {
    if (autoNextTimerRef.current) {
      clearInterval(autoNextTimerRef.current);
      autoNextTimerRef.current = null;
    }
    setAutoNextCountdown(null);
  };

  useEffect(() => {
    if (status !== 'LEVEL_COMPLETED' || !autoNext || isGameFinished) {
      if (autoNextTimerRef.current) {
        clearInterval(autoNextTimerRef.current);
        autoNextTimerRef.current = null;
      }
      setAutoNextCountdown(null);
      return;
    }

    let remaining = 5;
    setAutoNextCountdown(remaining);

    autoNextTimerRef.current = setInterval(() => {
      remaining -= 1;
      if (remaining <= 0) {
        if (autoNextTimerRef.current) {
          clearInterval(autoNextTimerRef.current);
          autoNextTimerRef.current = null;
        }
        setAutoNextCountdown(null);
        // Execute onNextLevel safely in next tick outside React's render/updater phase
        setTimeout(() => {
          onNextLevelRef.current();
        }, 0);
      } else {
        setAutoNextCountdown(remaining);
      }
    }, 1000);

    return () => {
      if (autoNextTimerRef.current) {
        clearInterval(autoNextTimerRef.current);
        autoNextTimerRef.current = null;
      }
    };
  }, [status, autoNext, isGameFinished]);

  const getNextButtonLabel = () => {
    if (isWorldEnd) {
      return autoNextCountdown !== null
        ? `Enter World ${nextWorldNumber} in ${autoNextCountdown}`
        : `Enter World ${nextWorldNumber}`;
    }
    return autoNextCountdown !== null
      ? `Next Level in ${autoNextCountdown}`
      : 'Next Level';
  };

  // Trigger boss audio or reset modals whenever level changes
  useEffect(() => {
    setShowHint(true);
    if (isBoss) {
      setShowBossIntro(true);
      audio.playBossIntro();
    } else {
      setShowBossIntro(false);
    }

    if (storyIntro) {
      setShowStoryModal(true);
    } else {
      setShowStoryModal(false);
    }
  }, [levelNumber, isBoss, storyIntro]);

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isInIframe = useMemo(() => {
    try {
      return typeof window !== 'undefined' && window.self !== window.top;
    } catch (_) {
      return true;
    }
  }, []);

  const formatTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    const ms = Math.floor((sec % 1) * 10);
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms}`;
  };

  const handleOpenStandalone = () => {
    audio.playClick();
    try {
      window.open(window.location.href, '_blank');
    } catch (_) {
      window.location.href = window.location.href;
    }
  };

  const handlePrevLevel = () => {
    const prev = levelNumber > 1 ? levelNumber - 1 : totalLevels;
    onSelectLevel(prev);
  };

  const handleNextLevelClick = () => {
    const next = levelNumber < totalLevels ? levelNumber + 1 : 1;
    onSelectLevel(next);
  };

  return (
    <>
      {/* Top Header Bar */}
      <div className="absolute top-0 left-0 right-0 z-20 flex flex-col items-center pointer-events-none select-none px-3 md:px-5 py-2 pt-[max(0.5rem,env(safe-area-inset-top))] pl-[max(0.75rem,env(safe-area-inset-left))] pr-[max(0.75rem,env(safe-area-inset-right))]">
        <div className="w-full flex items-center justify-between">
          {/* Left: Level Number & Crystal Progress */}
          <div className="flex items-center space-x-2 pointer-events-auto">
            {/* Level Badge */}
            <div className="flex items-center bg-black/75 backdrop-blur-xl px-3 py-1.5 rounded-2xl border border-white/10 shadow-lg space-x-1.5">
              <span
                className="text-xs font-black uppercase tracking-wider"
                style={{ color: isBoss ? '#F43F5E' : theme.primary }}
              >
                {isBoss ? 'BOSS' : `LVL ${levelNumber}/${totalLevels}`}
              </span>
              <span className="text-white/30 font-mono text-xs">•</span>
              <span className="text-xs font-semibold text-white/85 truncate max-w-[120px] sm:max-w-none">
                {bossTitle || levelName}
              </span>
            </div>

            {/* Compact Crystals Count */}
            <div className="flex items-center space-x-1.5 bg-black/75 backdrop-blur-xl px-2.5 py-1.5 rounded-2xl border border-white/10 shadow-lg">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-xs font-black font-mono tracking-wider text-white">
                {crystalsCollected}/{totalCrystals}
              </span>
            </div>
          </div>

          {/* Right: Only Restart, Pause, and Menu Dropdown */}
          <div className="flex items-center space-x-2 pointer-events-auto relative">
            {/* Restart Button */}
            <button
              type="button"
              onClick={() => {
                audio.playClick();
                onRestart();
              }}
              title="Restart Room (R)"
              aria-label="Restart Level"
              className="w-10 h-10 rounded-2xl bg-black/75 backdrop-blur-xl border border-white/10 hover:border-white/30 active:scale-95 flex items-center justify-center text-white/85 transition-all shadow-lg cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Pause / Resume Button */}
            <button
              type="button"
              onClick={() => {
                audio.playClick();
                onTogglePause();
              }}
              title={status === 'PAUSED' ? 'Resume Game (Esc/P)' : 'Pause Game (Esc/P)'}
              aria-label={status === 'PAUSED' ? 'Resume Game' : 'Pause Game'}
              className="w-10 h-10 rounded-2xl bg-black/75 backdrop-blur-xl border border-white/10 hover:border-white/30 active:scale-95 flex items-center justify-center text-white/85 transition-all shadow-lg cursor-pointer"
            >
              {status === 'PAUSED' ? <Play className="w-4 h-4 text-emerald-400" /> : <Pause className="w-4 h-4" />}
            </button>

            {/* Menu Popover Button */}
            <button
              type="button"
              onClick={() => {
                audio.playClick();
                setIsMenuOpen((prev) => !prev);
              }}
              title="Game Options Menu"
              aria-label="Game Menu"
              className={`w-10 h-10 rounded-2xl bg-black/75 backdrop-blur-xl border flex items-center justify-center active:scale-95 transition-all shadow-lg cursor-pointer ${
                isMenuOpen ? 'border-emerald-400 text-emerald-400' : 'border-white/10 hover:border-white/30 text-white/85'
              }`}
            >
              {isMenuOpen ? <X className="w-4 h-4" /> : <MoreVertical className="w-4 h-4" />}
            </button>

            {/* Floating Options Dropdown Menu */}
            {isMenuOpen && (
              <div
                className="absolute right-0 top-12 w-64 bg-[#121814]/95 backdrop-blur-2xl border border-white/20 rounded-3xl p-3 shadow-[0_15px_50px_rgba(0,0,0,0.85)] z-40 flex flex-col space-y-1.5 animate-in fade-in zoom-in-95 duration-150"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Sector / Level Select */}
                {onOpenLevelSelect && (
                  <button
                    type="button"
                    onClick={() => {
                      audio.playClick();
                      setIsMenuOpen(false);
                      onOpenLevelSelect();
                    }}
                    className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 text-white text-xs font-bold transition-all text-left cursor-pointer"
                  >
                    <Grid className="w-4 h-4 text-emerald-400" />
                    <span>Sector Rooms (1–{totalLevels})</span>
                  </button>
                )}

                {/* Return to Main Menu */}
                {onBackToMenu && (
                  <button
                    type="button"
                    onClick={() => {
                      audio.playClick();
                      setIsMenuOpen(false);
                      onBackToMenu();
                    }}
                    className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 text-white text-xs font-bold transition-all text-left cursor-pointer"
                  >
                    <Home className="w-4 h-4 text-sky-400" />
                    <span>Return to Main Menu</span>
                  </button>
                )}

                {/* Audio & Visual Settings */}
                <button
                  type="button"
                  onClick={() => {
                    audio.playClick();
                    setIsMenuOpen(false);
                    onOpenSettings();
                  }}
                  className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 text-white text-xs font-bold transition-all text-left cursor-pointer"
                >
                  <Sliders className="w-4 h-4 text-purple-400" />
                  <span>Audio & Display Settings</span>
                </button>

                {/* Fullscreen Toggle */}
                <button
                  type="button"
                  onClick={async () => {
                    audio.playClick();
                    try {
                      if (!document.fullscreenElement) {
                        if (document.documentElement.requestFullscreen) {
                          await document.documentElement.requestFullscreen();
                        }
                      } else {
                        if (document.exitFullscreen) {
                          await document.exitFullscreen();
                        }
                      }
                    } catch (_) {}
                    setIsMenuOpen(false);
                  }}
                  className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 text-white text-xs font-bold transition-all text-left cursor-pointer"
                >
                  <Maximize className="w-4 h-4 text-amber-400" />
                  <span>Toggle Fullscreen</span>
                </button>

                {/* Standalone Tab */}
                {isInIframe && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      handleOpenStandalone();
                    }}
                    className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 text-white text-xs font-bold transition-all text-left cursor-pointer"
                  >
                    <ExternalLink className="w-4 h-4 text-rose-400" />
                    <span>Open Standalone Tab</span>
                  </button>
                )}

                {/* Room Status Chips */}
                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-white/50 px-1">
                  <span>Par: {parTime}s</span>
                  <span>Grav: {gravityDir}</span>
                  {deathCount > 0 && <span>Deaths: {deathCount}</span>}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Stage C: Dynamic Combo Multiplier Banner */}
        {activeCombo > 1 && (
          <div className="mt-1 pointer-events-none flex items-center space-x-1.5 bg-gradient-to-r from-amber-500/25 via-amber-400/35 to-amber-500/25 border border-amber-400/50 px-4 py-1 rounded-full text-xs font-black text-amber-300 shadow-[0_0_20px_rgba(251,191,36,0.5)] animate-pulse">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span className="tracking-widest">x{activeCombo} COMBO MULTIPLIER!</span>
          </div>
        )}

        {/* Stage D: Boss Encounter Warning Header Banner */}
        {isBoss && showBossIntro && (
          <div className="mt-2 pointer-events-auto flex items-center justify-between space-x-3 bg-gradient-to-r from-rose-950/90 via-red-900/90 to-rose-950/90 border border-rose-500/60 px-4 py-2 rounded-2xl text-xs text-rose-200 shadow-[0_0_25px_rgba(244,63,94,0.45)] max-w-xl animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center space-x-2 truncate">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 animate-bounce" />
              <div className="truncate">
                <span className="font-black text-white uppercase tracking-wider block">
                  BOSS PROTOCOL: {bossTitle}
                </span>
                <span className="text-[11px] text-rose-200/80 line-clamp-1">{bossIntroText}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                audio.playClick();
                setShowBossIntro(false);
              }}
              className="px-3 py-1 bg-rose-600/40 hover:bg-rose-600/70 border border-rose-400/40 rounded-xl text-[10px] font-black uppercase text-white tracking-wider cursor-pointer shrink-0 active:scale-95"
            >
              ENGAGE
            </button>
          </div>
        )}

        {/* Dynamic Mechanic Hint Banner */}
        {hint && showHint && activeCombo <= 1 && !isBoss && (
          <div className="mt-1 pointer-events-auto flex items-center space-x-2 bg-black/75 backdrop-blur-md px-3.5 py-1 rounded-full border border-white/15 text-[11px] text-white/90 shadow-md max-w-xl transition-all">
            <HelpCircle className="w-3.5 h-3.5 shrink-0" style={{ color: theme.primary }} />
            <span className="truncate">{hint}</span>
            <button
              type="button"
              onClick={() => setShowHint(false)}
              className="text-white/40 hover:text-white text-xs pl-1 cursor-pointer font-mono"
            >
              ×
            </button>
          </div>
        )}

        {/* Stage E: Dynamic Need a Hint Button (Appears after 3 deaths in same spot) */}
        {hintAvailable && (
          <button
            type="button"
            onClick={() => {
              audio.playHint();
              if (onTriggerHint) onTriggerHint();
            }}
            className="mt-1.5 pointer-events-auto flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-emerald-500/25 hover:bg-emerald-500/40 border border-emerald-400/60 text-xs font-black uppercase text-emerald-300 shadow-[0_0_20px_rgba(74,222,128,0.5)] active:scale-95 transition-all cursor-pointer animate-pulse"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>NEED A HINT? (SHOW PATH)</span>
          </button>
        )}
      </div>

      {/* Stage D: Story Intro Narrative Modal (Shown at start of each world) */}
      {storyIntro && showStoryModal && status === 'PLAYING' && (
        <div className="absolute inset-0 z-40 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-white select-none animate-in fade-in">
          <div className="bg-[#101712] border border-white/20 rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-[0_0_50px_rgba(0,0,0,0.9)] relative overflow-hidden">
            <div className="flex items-center space-x-2 text-xs font-mono font-black uppercase tracking-wider mb-2 text-emerald-400">
              <Terminal className="w-4 h-4" />
              <span>SUBTERRANEAN LOG // WORLD {currentWorld} TRANSMISSION</span>
            </div>

            <h3
              className="text-xl sm:text-2xl font-black uppercase tracking-widest mb-3"
              style={{ color: theme.primary }}
            >
              {typeof storyIntro === 'object' && storyIntro?.worldName ? storyIntro.worldName : theme.name}
            </h3>

            <div className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-sans mb-6 border-l-2 border-emerald-400/50 pl-3 space-y-1.5">
              {typeof storyIntro === 'string'
                ? storyIntro
                : storyIntro?.lines?.map((line, idx) => <p key={idx}>{line}</p>)}
            </div>

            <button
              type="button"
              onClick={() => {
                audio.playClick();
                setShowStoryModal(false);
              }}
              style={{
                background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
              }}
              className="w-full py-3 rounded-2xl text-[#0B0F0C] font-black uppercase tracking-wider text-xs active:scale-95 transition-transform shadow-lg cursor-pointer"
            >
              Acknowledge & Proceed
            </button>
          </div>
        </div>
      )}

      {/* Pause Screen Overlay with Sticky Buttons */}
      {status === 'PAUSED' && (
        <div
          className="fixed inset-0 z-40 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 text-white select-none overflow-hidden animate-in fade-in duration-200"
          style={{
            paddingTop: 'max(8px, env(safe-area-inset-top))',
            paddingBottom: 'max(8px, env(safe-area-inset-bottom))',
            paddingLeft: 'max(8px, env(safe-area-inset-left))',
            paddingRight: 'max(8px, env(safe-area-inset-right))',
          }}
          onClick={() => {
            audio.playClick();
            onTogglePause();
          }}
        >
          <div
            className={`bg-[#141A16] border border-white/20 rounded-3xl w-full flex flex-col shadow-2xl relative overflow-hidden ${
              dimensions.isLandscape ? 'max-w-xl' : 'max-w-sm sm:max-w-md'
            }`}
            style={{
              maxHeight: 'min(94dvh, 94svh)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className={`border-b border-white/10 shrink-0 flex items-center justify-between ${dimensions.isShortScreen ? 'p-2.5 sm:p-3' : 'p-3.5 sm:p-4'}`}>
              <div>
                <h3
                  className={`font-black tracking-widest uppercase ${dimensions.isShortScreen ? 'text-lg' : 'text-xl sm:text-2xl'}`}
                  style={{ color: theme.primary }}
                >
                  PAUSED
                </h3>
                <p className="text-[11px] text-neutral-400 font-mono">
                  World {currentWorld}: {theme.name} • Par: {parTime}s
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  audio.playClick();
                  onTogglePause();
                }}
                className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/15 flex items-center justify-center text-white/80 active:scale-95 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Middle Scrollable Content */}
            <div className={`flex-1 min-h-0 overflow-y-auto space-y-3 ${dimensions.isShortScreen ? 'p-2.5 sm:p-3' : 'p-3.5 sm:p-4'}`}>
              <div>
                <span className="block text-[10px] font-extrabold uppercase text-white/50 mb-1.5">
                  Sector Room Dispatch (1–{totalLevels}):
                </span>
                <div className="grid grid-cols-5 sm:grid-cols-8 gap-1.5 pr-0.5 max-h-36 overflow-y-auto">
                  {Array.from({ length: totalLevels }, (_, i) => i + 1).map((lvlId) => (
                    <button
                      key={lvlId}
                      type="button"
                      onClick={() => {
                        onSelectLevel(lvlId);
                        onTogglePause();
                      }}
                      style={{
                        borderColor: lvlId === levelNumber ? theme.primary : 'rgba(255,255,255,0.15)',
                        backgroundColor:
                          lvlId === levelNumber ? `${theme.primary}25` : 'rgba(255,255,255,0.05)',
                        color: lvlId === levelNumber ? theme.primary : '#FFFFFF',
                      }}
                      className="py-1.5 rounded-xl text-xs font-black border transition-all active:scale-95 cursor-pointer"
                    >
                      L{lvlId}
                    </button>
                  ))}
                </div>
              </div>

              {/* Utility links */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    audio.playClick();
                    onOpenSettings();
                  }}
                  className="py-2 px-3 rounded-xl bg-white/5 border border-white/10 text-white/80 hover:text-white font-bold uppercase tracking-wider text-[11px] flex items-center justify-center space-x-1.5 active:scale-95 transition-all cursor-pointer"
                >
                  <Sliders className="w-3.5 h-3.5" style={{ color: theme.primary }} />
                  <span>Audio & Visuals</span>
                </button>
                {onOpenLevelSelect && (
                  <button
                    type="button"
                    onClick={() => {
                      audio.playClick();
                      onOpenLevelSelect();
                    }}
                    className="py-2 px-3 rounded-xl bg-white/5 border border-white/10 text-white/80 hover:text-white font-bold uppercase tracking-wider text-[11px] flex items-center justify-center space-x-1.5 active:scale-95 transition-all cursor-pointer"
                  >
                    <Grid className="w-3.5 h-3.5" />
                    <span>All Sectors</span>
                  </button>
                )}
              </div>
            </div>

            {/* Pinned Sticky Footer - Never scrolls, min 56px height */}
            <div className={`shrink-0 sticky bottom-0 z-10 bg-gradient-to-t from-[#141A16] via-[#141A16] to-[#141A16]/90 border-t border-white/10 space-y-2 ${dimensions.isShortScreen ? 'p-2 sm:p-2.5' : 'p-3 sm:p-4'}`}>
              <button
                type="button"
                onClick={() => {
                  audio.playClick();
                  onTogglePause();
                }}
                style={{
                  background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
                }}
                className="w-full min-h-[56px] h-14 rounded-2xl text-[#0B0F0C] font-black uppercase tracking-wider text-sm flex items-center justify-center space-x-2 active:scale-95 transition-transform shadow-lg cursor-pointer"
              >
                <Play className="w-5 h-5 fill-current" />
                <span>Resume Game</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    audio.playClick();
                    onRestart();
                    onTogglePause();
                  }}
                  className="min-h-[56px] h-14 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold uppercase tracking-wider text-xs flex items-center justify-center space-x-2 active:scale-95 transition-all cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Restart</span>
                </button>
                {onBackToMenu && (
                  <button
                    type="button"
                    onClick={() => {
                      audio.playClick();
                      onBackToMenu();
                    }}
                    className="min-h-[56px] h-14 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold uppercase tracking-wider text-xs flex items-center justify-center space-x-2 active:scale-95 transition-all cursor-pointer"
                  >
                    <Home className="w-4 h-4" style={{ color: theme.primary }} />
                    <span>Main Menu</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Game Over Screen Overlay with Sticky Buttons */}
      {status === 'GAME_OVER' && (
        <div
          className="fixed inset-0 z-40 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 text-white select-none overflow-hidden animate-in fade-in duration-200"
          style={{
            paddingTop: 'max(8px, env(safe-area-inset-top))',
            paddingBottom: 'max(8px, env(safe-area-inset-bottom))',
            paddingLeft: 'max(8px, env(safe-area-inset-left))',
            paddingRight: 'max(8px, env(safe-area-inset-right))',
          }}
        >
          <div
            className="bg-[#180E10] border border-rose-500/40 rounded-3xl w-full max-w-sm sm:max-w-md flex flex-col shadow-2xl relative overflow-hidden"
            style={{ maxHeight: 'min(94dvh, 94svh)' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Scrollable Middle Content */}
            <div className={`flex-1 min-h-0 overflow-y-auto flex flex-col items-center text-center space-y-2.5 ${dimensions.isShortScreen ? 'p-3' : 'p-4 sm:p-5'}`}>
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-rose-500/20 border border-rose-400/40 flex items-center justify-center text-rose-400 mb-1">
                <Skull className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black tracking-widest uppercase text-rose-400">
                SECTOR BREACH
              </h3>
              <p className="text-xs text-neutral-300 font-mono">
                Level {levelNumber}: {bossTitle || levelName}
              </p>
              <p className="text-xs text-neutral-400 max-w-xs">
                Orb collapsed under gravitational flux. Recalibrate trajectory and re-enter the sector.
              </p>
            </div>

            {/* Pinned Sticky Footer - Never scrolls, min 56px height */}
            <div className={`shrink-0 sticky bottom-0 z-10 bg-gradient-to-t from-[#180E10] via-[#180E10] to-[#180E10]/90 border-t border-rose-500/20 space-y-2 ${dimensions.isShortScreen ? 'p-2 sm:p-2.5' : 'p-3 sm:p-4'}`}>
              <button
                type="button"
                onClick={() => {
                  audio.playClick();
                  onRestart();
                }}
                className="w-full min-h-[56px] h-14 rounded-2xl bg-gradient-to-r from-rose-500 to-amber-500 text-[#0B0F0C] font-black uppercase tracking-wider text-sm flex items-center justify-center space-x-2 active:scale-95 transition-transform shadow-lg cursor-pointer"
              >
                <RotateCcw className="w-5 h-5" />
                <span>Retry Level</span>
              </button>
              {onBackToMenu && (
                <button
                  type="button"
                  onClick={() => {
                    audio.playClick();
                    onBackToMenu();
                  }}
                  className="w-full min-h-[56px] h-14 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold uppercase tracking-wider text-xs flex items-center justify-center space-x-2 active:scale-95 transition-all cursor-pointer"
                >
                  <Home className="w-4 h-4 text-rose-400" />
                  <span>Main Menu</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Level Complete (Room Completed) Overlay with 2-Column Landscape, dvh sizing & Sticky Buttons */}
      {status === 'LEVEL_COMPLETED' && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 text-white select-none overflow-hidden animate-in fade-in duration-200"
          style={{
            paddingTop: 'max(8px, env(safe-area-inset-top))',
            paddingBottom: 'max(8px, env(safe-area-inset-bottom))',
            paddingLeft: 'max(8px, env(safe-area-inset-left))',
            paddingRight: 'max(8px, env(safe-area-inset-right))',
          }}
        >
          <div
            className={`border rounded-3xl w-full flex flex-col shadow-2xl relative overflow-hidden transition-all duration-200 ${
              dimensions.isLandscape
                ? 'max-w-2xl sm:max-w-3xl'
                : 'max-w-sm sm:max-w-md'
            } ${
              isGameFinished
                ? 'bg-[#18150E] border-amber-500/50 shadow-[0_0_60px_rgba(245,158,11,0.4)]'
                : isBoss
                ? 'bg-[#180E14] border-rose-500/40 shadow-[0_0_50px_rgba(244,63,94,0.35)]'
                : 'bg-[#121814] border-white/20 shadow-[0_0_50px_rgba(0,0,0,0.85)]'
            }`}
            style={{
              maxHeight: 'min(94dvh, 94svh)',
              height: dimensions.isLandscape ? 'min(94dvh, 520px)' : undefined,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Badge */}
            <div className={`border-b border-white/10 shrink-0 flex items-center justify-between ${dimensions.isShortScreen ? 'p-2 sm:p-2.5' : 'p-3 sm:p-3.5'}`}>
              <div className="flex items-center space-x-2 truncate">
                {isGameFinished ? (
                  <span className="flex items-center space-x-1.5 text-amber-300 bg-amber-500/20 px-2.5 py-1 rounded-full border border-amber-400/40 text-[10px] font-black uppercase tracking-widest animate-pulse">
                    <Trophy className="w-3.5 h-3.5 text-amber-300" />
                    <span>GAME FINISHED</span>
                  </span>
                ) : isBoss ? (
                  <span className="flex items-center space-x-1.5 text-rose-300 bg-rose-500/20 px-2.5 py-1 rounded-full border border-rose-400/40 text-[10px] font-black uppercase tracking-widest animate-pulse">
                    <Crown className="w-3.5 h-3.5 text-rose-300" />
                    <span>BOSS SECURED</span>
                  </span>
                ) : isWorldEnd ? (
                  <span className="flex items-center space-x-1.5 text-amber-300 bg-amber-500/20 px-2.5 py-1 rounded-full border border-amber-400/40 text-[10px] font-black uppercase tracking-widest">
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>WORLD {currentWorld} CONQUERED</span>
                  </span>
                ) : (
                  <span className="flex items-center space-x-1.5 text-emerald-300 bg-emerald-500/15 px-2.5 py-1 rounded-full border border-emerald-400/30 text-[10px] font-black uppercase tracking-widest">
                    <span>SECTOR CLEAR</span>
                  </span>
                )}
                <span className="text-xs font-mono font-bold text-white/80 truncate">
                  Level {levelNumber}: {bossTitle || levelName}
                </span>
              </div>

              {autoNextCountdown !== null && !isGameFinished && (
                <span className="text-[10px] font-mono font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-400/25 shrink-0">
                  Auto: {autoNextCountdown}s
                </span>
              )}
            </div>

            {/* Content Area: 2-Column in Landscape, 1-Column in Portrait */}
            {dimensions.isLandscape ? (
              /* --- LANDSCAPE TWO-COLUMN LAYOUT --- */
              <div className="flex-1 min-h-0 grid grid-cols-2 divide-x divide-white/10 overflow-hidden">
                {/* Left Column: Stars + 3 Star Conditions */}
                <div className={`flex flex-col justify-between overflow-y-auto ${dimensions.isShortScreen ? 'p-3 space-y-2' : 'p-4 sm:p-5 space-y-3'}`}>
                  <div>
                    <h3 className={`font-black tracking-widest uppercase mb-1 ${dimensions.isShortScreen ? 'text-lg' : 'text-xl sm:text-2xl'}`}>
                      {isGameFinished ? 'YOU ESCAPED!' : isBoss ? 'SECTOR SECURED!' : 'ROOM COMPLETED!'}
                    </h3>
                    <p className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider mb-2">
                      World {currentWorld}: {theme.name}
                    </p>

                    {/* 3-Star Rating Fanfare */}
                    <div className="flex items-center space-x-2.5 py-1 mb-2">
                      {[1, 2, 3].map((starNum) => {
                        const isEarned = starNum <= starsEarned;
                        return (
                          <div
                            key={starNum}
                            className="relative transition-all duration-300 transform"
                            style={{
                              transform: isEarned ? 'scale(1.1)' : 'scale(0.95)',
                            }}
                          >
                            <Star
                              className={`transition-all ${dimensions.isShortScreen ? 'w-8 h-8' : 'w-10 h-10'}`}
                              style={{
                                color: isEarned ? '#FBBF24' : 'rgba(255,255,255,0.18)',
                                fill: isEarned ? '#FBBF24' : 'none',
                                filter: isEarned ? 'drop-shadow(0 0 10px rgba(251,191,36,0.8))' : 'none',
                              }}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* 3 Star Goals Breakdown */}
                  <div className={`bg-[#18201B] rounded-2xl border border-white/10 font-mono space-y-1.5 ${dimensions.isShortScreen ? 'p-2 text-[10px]' : 'p-3 text-[11px]'}`}>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center space-x-1.5">
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0" />
                        <span className="text-white/80">{isBoss ? 'Boss Defeated' : 'Room Cleared'}</span>
                      </span>
                      <span className="text-emerald-400 font-bold">✓</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center space-x-1.5">
                        <Star
                          className="w-3 h-3 shrink-0"
                          style={{
                            color: crystalsCollected >= totalCrystals ? '#FBBF24' : 'rgba(255,255,255,0.3)',
                            fill: crystalsCollected >= totalCrystals ? '#FBBF24' : 'none',
                          }}
                        />
                        <span className="text-white/80">All Crystals ({crystalsCollected}/{totalCrystals})</span>
                      </span>
                      <span
                        className={crystalsCollected >= totalCrystals ? 'text-emerald-400 font-bold' : 'text-neutral-500'}
                      >
                        {crystalsCollected >= totalCrystals ? '✓' : '—'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center space-x-1.5">
                        <Star
                          className="w-3 h-3 shrink-0"
                          style={{
                            color: timeSeconds <= parTime ? '#FBBF24' : 'rgba(255,255,255,0.3)',
                            fill: timeSeconds <= parTime ? '#FBBF24' : 'none',
                          }}
                        />
                        <span className="text-white/80">Under Par Time (≤ {parTime}s)</span>
                      </span>
                      <span
                        className={timeSeconds <= parTime ? 'text-emerald-400 font-bold' : 'text-neutral-500'}
                      >
                        {timeSeconds <= parTime ? '✓' : '—'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Column: Stats, Messages & Sticky Buttons */}
                <div className="flex flex-col justify-between overflow-hidden">
                  {/* Top Stats & Messages (scrollable if needed) */}
                  <div className={`flex-1 min-h-0 overflow-y-auto space-y-2 ${dimensions.isShortScreen ? 'p-3' : 'p-4 sm:p-5'}`}>
                    {/* Rare Golden Star Crystal Banner */}
                    {hasStarCrystal && (
                      <div className="flex items-center justify-center space-x-1.5 bg-amber-500/15 border border-amber-400/30 py-1.5 px-3 rounded-xl text-xs font-black text-amber-300">
                        <Star className="w-3.5 h-3.5 text-amber-300 fill-amber-300 shrink-0" />
                        <span>GOLDEN STAR FOUND! (+10 ✦)</span>
                      </div>
                    )}

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className={`bg-[#1D2520] rounded-2xl border border-white/5 ${dimensions.isShortScreen ? 'p-2' : 'p-2.5'}`}>
                        <span className="block text-[10px] uppercase font-bold text-neutral-400">Time / Par</span>
                        <span
                          className={`font-black font-mono block ${dimensions.isShortScreen ? 'text-xs' : 'text-sm'}`}
                          style={{ color: timeSeconds <= parTime ? theme.primary : '#F87171' }}
                        >
                          {formatTime(timeSeconds)} / {parTime}s
                        </span>
                        {isNewBestTime && (
                          <span className="block text-[9px] font-black text-amber-300 uppercase tracking-wider mt-0.5">
                            ★ New Best Record!
                          </span>
                        )}
                      </div>
                      <div className={`bg-[#1D2520] rounded-2xl border border-white/5 ${dimensions.isShortScreen ? 'p-2' : 'p-2.5'}`}>
                        <span className="block text-[10px] uppercase font-bold text-neutral-400">Reward</span>
                        <span className={`font-black font-mono block ${dimensions.isShortScreen ? 'text-xs' : 'text-sm'}`} style={{ color: theme.secondary }}>
                          +{newCrystalsAdded} Crystals
                        </span>
                        <span className="block text-[9px] text-neutral-400 uppercase tracking-wider mt-0.5">
                          Bank updated
                        </span>
                      </div>
                    </div>

                    {isGameFinished && (
                      <div className="bg-amber-500/10 border border-amber-400/30 rounded-2xl p-2.5 text-center">
                        <p className="text-xs font-black text-amber-300 uppercase tracking-wider">
                          YOU ESCAPED!
                        </p>
                        <p className="text-[10px] text-neutral-300 mt-0.5">
                          Facility breached. All 40 gravity anomaly sectors conquered!
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Sticky Buttons - Pinned at bottom of right column, min 56px height */}
                  <div className={`shrink-0 sticky bottom-0 z-10 bg-gradient-to-t from-[#121814] via-[#121814] to-[#121814]/90 border-t border-white/10 space-y-2 ${dimensions.isShortScreen ? 'p-2 sm:p-2.5' : 'p-3 sm:p-4'}`}>
                    {!isGameFinished && (
                      <button
                        type="button"
                        onClick={() => {
                          audio.playClick();
                          cancelAutoNext();
                          onNextLevel();
                        }}
                        style={{
                          background: isBoss
                            ? 'linear-gradient(135deg, #F43F5E, #FB923C)'
                            : `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
                        }}
                        className="w-full min-h-[56px] h-14 rounded-2xl text-[#0B0F0C] font-black uppercase tracking-wider text-xs sm:text-sm flex items-center justify-center space-x-2 active:scale-95 transition-transform shadow-lg cursor-pointer"
                      >
                        <FastForward className="w-4 h-4 fill-current" />
                        <span>{getNextButtonLabel()}</span>
                      </button>
                    )}

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          audio.playClick();
                          cancelAutoNext();
                          onRestart();
                        }}
                        className="min-h-[56px] h-14 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold uppercase tracking-wider text-xs flex items-center justify-center space-x-1.5 active:scale-95 transition-all cursor-pointer"
                      >
                        <RotateCcw className="w-4 h-4" />
                        <span>{isGameFinished ? 'Play Again' : 'Replay'}</span>
                      </button>

                      {onBackToMenu && (
                        <button
                          type="button"
                          onClick={() => {
                            audio.playClick();
                            cancelAutoNext();
                            onBackToMenu();
                          }}
                          className="min-h-[56px] h-14 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold uppercase tracking-wider text-xs flex items-center justify-center space-x-1.5 active:scale-95 transition-all cursor-pointer"
                        >
                          <Home className="w-4 h-4" style={{ color: theme.primary }} />
                          <span>Main Menu</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* --- PORTRAIT SINGLE-COLUMN LAYOUT --- */
              <div className="flex-1 min-h-0 flex flex-col justify-between overflow-hidden">
                {/* Scrollable Middle Content */}
                <div className={`flex-1 min-h-0 overflow-y-auto space-y-2.5 text-center ${dimensions.isShortScreen ? 'p-2.5' : 'p-4'}`}>
                  {/* 3-Star Rating Fanfare */}
                  <div className="flex items-center justify-center space-x-3 mb-1">
                    {[1, 2, 3].map((starNum) => {
                      const isEarned = starNum <= starsEarned;
                      return (
                        <div
                          key={starNum}
                          className="relative transition-all duration-300 transform"
                          style={{
                            transform: isEarned ? 'scale(1.15)' : 'scale(0.95)',
                          }}
                        >
                          <Star
                            className={`transition-all ${dimensions.isShortScreen ? 'w-8 h-8' : 'w-10 h-10'}`}
                            style={{
                              color: isEarned ? '#FBBF24' : 'rgba(255,255,255,0.18)',
                              fill: isEarned ? '#FBBF24' : 'none',
                              filter: isEarned ? 'drop-shadow(0 0 12px rgba(251,191,36,0.8))' : 'none',
                            }}
                          />
                        </div>
                      );
                    })}
                  </div>

                  <h3 className={`font-black tracking-widest uppercase mb-0.5 ${dimensions.isShortScreen ? 'text-lg' : 'text-xl'}`}>
                    {isGameFinished ? 'YOU ESCAPED!' : isBoss ? 'SECTOR SECURED!' : 'ROOM COMPLETED!'}
                  </h3>
                  <p className="text-[11px] uppercase tracking-widest font-mono font-bold" style={{ color: isBoss ? '#F43F5E' : theme.primary }}>
                    Level {levelNumber}: {bossTitle || levelName}
                  </p>

                  {/* 3 Star Goals Breakdown */}
                  <div className="bg-[#18201B] p-2.5 rounded-2xl border border-white/10 space-y-1 text-left text-[11px] font-mono">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center space-x-1.5">
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0" />
                        <span className="text-white/80">{isBoss ? 'Boss Defeated' : 'Room Cleared'}</span>
                      </span>
                      <span className="text-emerald-400 font-bold">✓</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center space-x-1.5">
                        <Star
                          className="w-3 h-3 shrink-0"
                          style={{
                            color: crystalsCollected >= totalCrystals ? '#FBBF24' : 'rgba(255,255,255,0.3)',
                            fill: crystalsCollected >= totalCrystals ? '#FBBF24' : 'none',
                          }}
                        />
                        <span className="text-white/80">All Crystals ({crystalsCollected}/{totalCrystals})</span>
                      </span>
                      <span
                        className={crystalsCollected >= totalCrystals ? 'text-emerald-400 font-bold' : 'text-neutral-500'}
                      >
                        {crystalsCollected >= totalCrystals ? '✓' : '—'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center space-x-1.5">
                        <Star
                          className="w-3 h-3 shrink-0"
                          style={{
                            color: timeSeconds <= parTime ? '#FBBF24' : 'rgba(255,255,255,0.3)',
                            fill: timeSeconds <= parTime ? '#FBBF24' : 'none',
                          }}
                        />
                        <span className="text-white/80">Under Par Time (≤ {parTime}s)</span>
                      </span>
                      <span
                        className={timeSeconds <= parTime ? 'text-emerald-400 font-bold' : 'text-neutral-500'}
                      >
                        {timeSeconds <= parTime ? '✓' : '—'}
                      </span>
                    </div>
                  </div>

                  {/* Rare Golden Star Crystal Banner */}
                  {hasStarCrystal && (
                    <div className="flex items-center justify-center space-x-1.5 bg-amber-500/15 border border-amber-400/30 py-1.5 px-3 rounded-xl text-xs font-black text-amber-300">
                      <Star className="w-3.5 h-3.5 text-amber-300 fill-amber-300 shrink-0" />
                      <span>GOLDEN STAR FOUND! (+10 ✦)</span>
                    </div>
                  )}

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-[#1D2520] p-2.5 rounded-2xl border border-white/5 text-left">
                      <span className="block text-[10px] uppercase font-bold text-neutral-400">Time / Par</span>
                      <span
                        className="text-xs sm:text-sm font-black font-mono"
                        style={{ color: timeSeconds <= parTime ? theme.primary : '#F87171' }}
                      >
                        {formatTime(timeSeconds)} / {parTime}s
                      </span>
                      {isNewBestTime && (
                        <span className="block text-[9px] font-black text-amber-300 uppercase tracking-wider mt-0.5">
                          ★ Best Record!
                        </span>
                      )}
                    </div>
                    <div className="bg-[#1D2520] p-2.5 rounded-2xl border border-white/5 text-left">
                      <span className="block text-[10px] uppercase font-bold text-neutral-400">Reward</span>
                      <span className="text-xs sm:text-sm font-black font-mono" style={{ color: theme.secondary }}>
                        +{newCrystalsAdded} Crystals
                      </span>
                      <span className="block text-[9px] text-neutral-400 uppercase tracking-wider mt-0.5">
                        Bank updated
                      </span>
                    </div>
                  </div>

                  {isGameFinished && (
                    <div className="bg-amber-500/10 border border-amber-400/30 rounded-2xl p-2.5 text-center">
                      <p className="text-xs font-black text-amber-300 uppercase tracking-wider">
                        YOU ESCAPED!
                      </p>
                      <p className="text-[10px] text-neutral-300 mt-0.5">
                        Facility breached. All 40 gravity anomaly sectors conquered!
                      </p>
                    </div>
                  )}
                </div>

                {/* Sticky Footer: Fixed at bottom, min 56px height, NEVER scrolls */}
                <div className={`shrink-0 sticky bottom-0 z-10 bg-gradient-to-t from-[#121814] via-[#121814] to-[#121814]/90 border-t border-white/10 space-y-2 ${dimensions.isShortScreen ? 'p-2 sm:p-2.5' : 'p-3 sm:p-4'}`}>
                  {!isGameFinished && (
                    <button
                      type="button"
                      onClick={() => {
                        audio.playClick();
                        cancelAutoNext();
                        onNextLevel();
                      }}
                      style={{
                        background: isBoss
                          ? 'linear-gradient(135deg, #F43F5E, #FB923C)'
                          : `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
                      }}
                      className="w-full min-h-[56px] h-14 rounded-2xl text-[#0B0F0C] font-black uppercase tracking-wider text-xs sm:text-sm flex items-center justify-center space-x-2 active:scale-95 transition-transform shadow-lg cursor-pointer"
                    >
                      <FastForward className="w-4 h-4 fill-current" />
                      <span>{getNextButtonLabel()}</span>
                    </button>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        audio.playClick();
                        cancelAutoNext();
                        onRestart();
                      }}
                      className="min-h-[56px] h-14 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold uppercase tracking-wider text-xs flex items-center justify-center space-x-1.5 active:scale-95 transition-all cursor-pointer"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>{isGameFinished ? 'Play Again' : 'Replay'}</span>
                    </button>

                    {onBackToMenu && (
                      <button
                        type="button"
                        onClick={() => {
                          audio.playClick();
                          cancelAutoNext();
                          onBackToMenu();
                        }}
                        className="min-h-[56px] h-14 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold uppercase tracking-wider text-xs flex items-center justify-center space-x-1.5 active:scale-95 transition-all cursor-pointer"
                      >
                        <Home className="w-4 h-4" style={{ color: theme.primary }} />
                        <span>Main Menu</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
