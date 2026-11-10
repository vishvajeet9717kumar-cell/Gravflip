import React, { useState } from 'react';
import {
  Play,
  Grid,
  Sparkles,
  Gift,
  Sliders,
  Trophy,
  Infinity as InfinityIcon,
  Timer,
  Calendar,
} from 'lucide-react';
import { WorldTheme, OrbSkin } from '../game/types';
import { audio } from '../game/audio';
import { PWAInstallButton } from './PWAInstallButton';
import { AboutLegalModal } from './AboutLegalModal';

interface MainMenuProps {
  theme: WorldTheme;
  equippedSkin: OrbSkin;
  totalCrystals: number;
  totalStars: number;
  maxStars: number;
  hasDailyReward: boolean;
  highestUnlockedLevel: number;
  unlockedAchievementsCount: number;
  totalAchievementsCount: number;
  onPlay: () => void;
  onOpenLevelSelect: () => void;
  onOpenSkins: () => void;
  onOpenDailyReward: () => void;
  onOpenSettings: () => void;
  onOpenAchievements: () => void;
  onOpenDailyChallenge: () => void;
  onOpenTimeAttack: () => void;
  onStartEndless: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  theme,
  equippedSkin,
  totalCrystals,
  totalStars,
  maxStars,
  hasDailyReward,
  highestUnlockedLevel,
  unlockedAchievementsCount,
  totalAchievementsCount,
  onPlay,
  onOpenLevelSelect,
  onOpenSkins,
  onOpenDailyReward,
  onOpenSettings,
  onOpenAchievements,
  onOpenDailyChallenge,
  onOpenTimeAttack,
  onStartEndless,
}) => {
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  return (
    <div
      className="absolute inset-0 z-30 flex flex-col justify-between p-4 sm:p-7 select-none text-white backdrop-blur-sm overflow-y-auto"
      style={{
        background: `radial-gradient(circle at 50% 30%, #0c140f 20%, #050806 90%)`,
      }}
    >
      {/* Top Header Bar */}
      <div className="flex items-center justify-between w-full max-w-4xl mx-auto pt-1">
        {/* Left: Star counter */}
        <div className="flex items-center space-x-2 bg-black/60 backdrop-blur-xl px-3.5 py-1.5 rounded-2xl border border-white/10 shadow-lg">
          <Trophy className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-black tracking-wider text-amber-300">
            {totalStars} / {maxStars} STARS
          </span>
        </div>

        {/* Right: Crystal Bank, Daily Reward, Install & Settings */}
        <div className="flex items-center space-x-2">
          {/* In-App PWA Install Button */}
          <PWAInstallButton accentColor={equippedSkin.primary} />

          {/* Daily Reward Button with pulse badge */}
          <button
            type="button"
            onClick={() => {
              audio.playClick();
              onOpenDailyReward();
            }}
            className="relative flex items-center space-x-1.5 px-3 py-1.5 rounded-2xl bg-black/60 backdrop-blur-xl border border-white/15 active:scale-95 transition-all shadow-lg cursor-pointer hover:border-amber-400/50"
          >
            <Gift className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs font-bold text-white/90">Daily</span>
            {hasDailyReward && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-ping" />
            )}
            {hasDailyReward && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full" />
            )}
          </button>

          {/* Crystals Bank */}
          <div className="flex items-center space-x-1.5 bg-black/60 backdrop-blur-xl px-3 py-1.5 rounded-2xl border border-white/10 shadow-lg">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-black font-mono tracking-wider text-white">
              {totalCrystals}
            </span>
          </div>

          {/* Settings */}
          <button
            type="button"
            onClick={() => {
              audio.playClick();
              onOpenSettings();
            }}
            aria-label="Settings"
            className="w-9 h-9 rounded-2xl bg-black/60 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white/80 active:scale-95 transition-all shadow-lg cursor-pointer"
          >
            <Sliders className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Hero Title & Animated Orb */}
      <div className="flex flex-col items-center justify-center text-center my-auto py-2">
        {/* Animated Cyber Orb Preview */}
        <div className="relative mb-4">
          <div
            className="w-20 h-20 sm:w-22 sm:h-22 rounded-full flex items-center justify-center border-2 border-white shadow-2xl animate-pulse"
            style={{
              background: `radial-gradient(circle at 35% 35%, #FFFFFF 5%, ${equippedSkin.primary} 40%, ${equippedSkin.secondary} 85%, #0B0F0C 100%)`,
              boxShadow: `0 0 45px ${equippedSkin.glow}`,
            }}
          >
            {/* Expressive Face */}
            <div className="flex flex-col items-center mt-1">
              <div className="flex space-x-2.5 mb-1">
                <div className="w-2.5 h-2.5 bg-[#0B0F0C] rounded-full relative">
                  <div className="w-1 h-1 bg-white rounded-full absolute top-0.5 right-0.5" />
                </div>
                <div className="w-2.5 h-2.5 bg-[#0B0F0C] rounded-full relative">
                  <div className="w-1 h-1 bg-white rounded-full absolute top-0.5 right-0.5" />
                </div>
              </div>
              <div className="w-3.5 h-1.5 border-b-2 border-[#0B0F0C] rounded-full" />
            </div>
          </div>
          {/* Orbital Ring */}
          <div
            className="absolute inset-[-8px] rounded-full border border-dashed animate-spin"
            style={{
              borderColor: equippedSkin.primary,
              animationDuration: '10s',
            }}
          />
        </div>

        {/* Title Logo */}
        <h1
          className="text-4xl sm:text-6xl font-black tracking-widest uppercase italic drop-shadow-[0_0_35px_rgba(183,255,50,0.5)] mb-0.5"
          style={{
            color: equippedSkin.primary,
            textShadow: `0 0 30px ${equippedSkin.glow}`,
          }}
        >
          GRAVFLIP
        </h1>
        <p className="text-[11px] sm:text-xs font-extrabold tracking-[0.25em] uppercase text-white/70 mb-5 font-mono">
          THE GRAVITY IS YOUR WEAPON
        </p>

        {/* Main Action Buttons Grid */}
        <div className="w-full max-w-sm space-y-2.5">
          {/* Primary Campaign Button */}
          <button
            type="button"
            onClick={() => {
              audio.playClick();
              onPlay();
            }}
            style={{
              background: `linear-gradient(135deg, ${equippedSkin.primary}, ${equippedSkin.secondary})`,
              boxShadow: `0 0 25px ${equippedSkin.glow}`,
            }}
            className="w-full py-3.5 rounded-2xl text-[#0B0F0C] font-black uppercase tracking-wider text-sm flex items-center justify-center space-x-2 active:scale-95 transition-all shadow-xl cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>PLAY ROOM {highestUnlockedLevel}</span>
          </button>

          {/* Row 1: Rooms Dispatch & Endless Orbit */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                audio.playClick();
                onOpenLevelSelect();
              }}
              className="py-2.5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-extrabold uppercase tracking-wider text-xs flex items-center justify-center space-x-1.5 active:scale-95 transition-all cursor-pointer shadow"
            >
              <Grid className="w-3.5 h-3.5 text-white/80" />
              <span>40 Rooms</span>
            </button>

            <button
              type="button"
              onClick={() => {
                audio.playClick();
                onStartEndless();
              }}
              className="py-2.5 rounded-2xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/35 text-rose-300 font-extrabold uppercase tracking-wider text-xs flex items-center justify-center space-x-1.5 active:scale-95 transition-all cursor-pointer shadow"
            >
              <InfinityIcon className="w-3.5 h-3.5 text-rose-400" />
              <span>Endless</span>
            </button>
          </div>

          {/* Row 2: Daily Challenge & Time Attack */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                audio.playClick();
                onOpenDailyChallenge();
              }}
              className="py-2.5 rounded-2xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/35 text-amber-300 font-extrabold uppercase tracking-wider text-xs flex items-center justify-center space-x-1.5 active:scale-95 transition-all cursor-pointer shadow"
            >
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              <span>Daily Run</span>
            </button>

            <button
              type="button"
              onClick={() => {
                audio.playClick();
                onOpenTimeAttack();
              }}
              className="py-2.5 rounded-2xl bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/35 text-sky-300 font-extrabold uppercase tracking-wider text-xs flex items-center justify-center space-x-1.5 active:scale-95 transition-all cursor-pointer shadow"
            >
              <Timer className="w-3.5 h-3.5 text-sky-400" />
              <span>Time Attack</span>
            </button>
          </div>

          {/* Row 3: Skins Wardrobe & Achievements Modal */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                audio.playClick();
                onOpenSkins();
              }}
              className="py-2.5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-extrabold uppercase tracking-wider text-xs flex items-center justify-center space-x-1.5 active:scale-95 transition-all cursor-pointer shadow"
            >
              <Sparkles className="w-3.5 h-3.5" style={{ color: equippedSkin.primary }} />
              <span>Wardrobe</span>
            </button>

            <button
              type="button"
              onClick={() => {
                audio.playClick();
                onOpenAchievements();
              }}
              className="py-2.5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-extrabold uppercase tracking-wider text-xs flex items-center justify-center space-x-1.5 active:scale-95 transition-all cursor-pointer shadow"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>{unlockedAchievementsCount}/{totalAchievementsCount} Badges</span>
            </button>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="w-full max-w-4xl mx-auto flex items-center justify-between text-[11px] text-white/40 font-mono pb-1">
        <span>40 ROOMS • 8 WORLDS</span>
        <button
          type="button"
          onClick={() => {
            audio.playClick();
            setIsAboutOpen(true);
          }}
          className="hover:text-emerald-400 text-white/60 underline tracking-wider cursor-pointer transition-colors"
        >
          ABOUT & PRIVACY
        </button>
        <span>HTML5 CANVAS 60FPS</span>
      </div>

      {/* In-App About & Legal Modal */}
      <AboutLegalModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
        theme={theme}
      />
    </div>
  );
};
