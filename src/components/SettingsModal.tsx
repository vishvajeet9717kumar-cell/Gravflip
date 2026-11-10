import React from 'react';
import { X, Volume2, VolumeX, Music, Sparkles, Sliders, FastForward } from 'lucide-react';
import { WorldTheme } from '../game/types';
import { audio } from '../game/audio';
import { PWAInstallButton } from './PWAInstallButton';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: WorldTheme;
  reduceEffects: boolean;
  onToggleReduceEffects: (val: boolean) => void;
  sfxMuted: boolean;
  musicMuted: boolean;
  sfxVolume: number;
  musicVolume: number;
  onToggleSfx: (muted: boolean) => void;
  onToggleMusic: (muted: boolean) => void;
  onChangeSfxVolume: (vol: number) => void;
  onChangeMusicVolume: (vol: number) => void;
  autoNext?: boolean;
  onToggleAutoNext?: (val: boolean) => void;
  controlOpacity?: number;
  onChangeControlOpacity?: (val: number) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  theme,
  reduceEffects,
  onToggleReduceEffects,
  sfxMuted,
  musicMuted,
  sfxVolume,
  musicVolume,
  onToggleSfx,
  onToggleMusic,
  onChangeSfxVolume,
  onChangeMusicVolume,
  autoNext = true,
  onToggleAutoNext,
  controlOpacity = 0.60,
  onChangeControlOpacity,
}) => {
  const { isInstallable, isInstalled, isIOS } = usePWAInstall();
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none"
      onClick={onClose}
    >
      <div
        className="bg-[#141A16] border border-white/20 rounded-3xl p-6 sm:p-7 max-w-sm w-full shadow-2xl text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
          <div className="flex items-center space-x-2.5">
            <Sliders className="w-5 h-5" style={{ color: theme.primary }} />
            <h3 className="text-lg font-black tracking-wider uppercase text-white">
              Audio & Visuals
            </h3>
          </div>
          <button
            type="button"
            onClick={() => {
              audio.playClick();
              onClose();
            }}
            className="w-8 h-8 rounded-xl bg-white/5 active:bg-white/15 flex items-center justify-center text-white/70 active:scale-95 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Settings Body */}
        <div className="space-y-5">
          {/* Sound FX Control */}
          <div className="bg-white/5 p-3.5 rounded-2xl border border-white/5">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center space-x-2">
                {sfxMuted ? (
                  <VolumeX className="w-4 h-4 text-neutral-400" />
                ) : (
                  <Volume2 className="w-4 h-4" style={{ color: theme.primary }} />
                )}
                <span className="text-xs font-bold uppercase tracking-wider text-white/90">
                  Sound Effects
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  audio.playClick();
                  onToggleSfx(!sfxMuted);
                }}
                className={`px-3 py-1 rounded-xl text-xs font-extrabold uppercase transition-all cursor-pointer ${
                  !sfxMuted
                    ? 'bg-white/15 text-white border border-white/20'
                    : 'bg-black/40 text-neutral-500 border border-white/5'
                }`}
              >
                {!sfxMuted ? 'ON' : 'OFF'}
              </button>
            </div>
            {/* SFX Volume Slider */}
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              disabled={sfxMuted}
              value={sfxMuted ? 0 : sfxVolume}
              onChange={(e) => onChangeSfxVolume(parseFloat(e.target.value))}
              className="w-full accent-white h-1.5 bg-neutral-700 rounded-lg appearance-none cursor-pointer disabled:opacity-40"
              style={{ accentColor: theme.primary }}
            />
          </div>

          {/* Background Music Control */}
          <div className="bg-white/5 p-3.5 rounded-2xl border border-white/5">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center space-x-2">
                <Music className="w-4 h-4" style={{ color: !musicMuted ? theme.secondary : '#737373' }} />
                <span className="text-xs font-bold uppercase tracking-wider text-white/90">
                  Ambient Synth Music
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  audio.playClick();
                  onToggleMusic(!musicMuted);
                }}
                className={`px-3 py-1 rounded-xl text-xs font-extrabold uppercase transition-all cursor-pointer ${
                  !musicMuted
                    ? 'bg-white/15 text-white border border-white/20'
                    : 'bg-black/40 text-neutral-500 border border-white/5'
                }`}
              >
                {!musicMuted ? 'ON' : 'OFF'}
              </button>
            </div>
            {/* Music Volume Slider */}
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              disabled={musicMuted}
              value={musicMuted ? 0 : musicVolume}
              onChange={(e) => onChangeMusicVolume(parseFloat(e.target.value))}
              className="w-full accent-white h-1.5 bg-neutral-700 rounded-lg appearance-none cursor-pointer disabled:opacity-40"
              style={{ accentColor: theme.secondary }}
            />
          </div>

          {/* Reduce Effects Toggle */}
          <div className="bg-white/5 p-3.5 rounded-2xl border border-white/5 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4" style={{ color: reduceEffects ? theme.primary : '#a3a3a3' }} />
              <div>
                <span className="block text-xs font-bold uppercase tracking-wider text-white/90">
                  Reduce Effects
                </span>
                <span className="block text-[10px] text-neutral-400">
                  Disable screen flash & shake
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                audio.playClick();
                onToggleReduceEffects(!reduceEffects);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold uppercase transition-all cursor-pointer ${
                reduceEffects
                  ? 'bg-white/20 text-white border border-white/30'
                  : 'bg-black/40 text-neutral-500 border border-white/5'
              }`}
              style={{
                borderColor: reduceEffects ? theme.primary : undefined,
                color: reduceEffects ? theme.primary : undefined,
              }}
            >
              {reduceEffects ? 'ACTIVE' : 'OFF'}
            </button>
          </div>

          {/* Auto-Next Level Toggle */}
          <div className="bg-white/5 p-3.5 rounded-2xl border border-white/5 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FastForward className="w-4 h-4" style={{ color: autoNext ? theme.primary : '#a3a3a3' }} />
              <div>
                <span className="block text-xs font-bold uppercase tracking-wider text-white/90">
                  Auto-Next Room
                </span>
                <span className="block text-[10px] text-neutral-400">
                  Countdown 5s to next level automatically
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                audio.playClick();
                if (onToggleAutoNext) onToggleAutoNext(!autoNext);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold uppercase transition-all cursor-pointer ${
                autoNext
                  ? 'bg-white/20 text-white border border-white/30'
                  : 'bg-black/40 text-neutral-500 border border-white/5'
              }`}
              style={{
                borderColor: autoNext ? theme.primary : undefined,
                color: autoNext ? theme.primary : undefined,
              }}
            >
              {autoNext ? 'ON' : 'OFF'}
            </button>
          </div>

          {/* Control Opacity Slider (30% to 100%) */}
          <div className="bg-white/5 p-3.5 rounded-2xl border border-white/5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Sliders className="w-4 h-4" style={{ color: theme.primary }} />
                <div>
                  <span className="block text-xs font-bold uppercase tracking-wider text-white/90">
                    Control Opacity
                  </span>
                  <span className="block text-[10px] text-neutral-400">
                    Button transparency on screen
                  </span>
                </div>
              </div>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-lg bg-black/40 border border-white/10 text-white">
                {Math.round(controlOpacity * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0.30"
              max="1.00"
              step="0.05"
              value={controlOpacity}
              onChange={(e) => {
                if (onChangeControlOpacity) {
                  onChangeControlOpacity(parseFloat(e.target.value));
                }
              }}
              className="w-full accent-white h-1.5 bg-neutral-700 rounded-lg appearance-none cursor-pointer"
              style={{ accentColor: theme.primary }}
            />
            <div className="flex justify-between text-[9px] font-mono text-neutral-500 mt-1">
              <span>30%</span>
              <span>60% (Default)</span>
              <span>100%</span>
            </div>
          </div>

          {/* Standalone PWA Installation row - appears only when installation is available or on iOS */}
          {!isInstalled && (isInstallable || isIOS) && (
            <div className="bg-white/5 p-3.5 rounded-2xl border border-white/5 flex items-center justify-between">
              <div>
                <span className="block text-xs font-bold uppercase tracking-wider text-white/90">
                  PWA Installation
                </span>
                <span className="block text-[10px] text-neutral-400">
                  {isIOS ? 'iOS Safari home screen install' : 'Fullscreen 60 FPS offline play'}
                </span>
              </div>
              <PWAInstallButton accentColor={theme.primary} />
            </div>
          )}
        </div>

        {/* Done Button */}
        <button
          type="button"
          onClick={() => {
            audio.playClick();
            onClose();
          }}
          style={{
            background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
          }}
          className="w-full mt-6 py-3 rounded-2xl text-[#0B0F0C] font-black uppercase tracking-wider text-xs active:scale-95 transition-transform shadow-lg cursor-pointer"
        >
          Save & Return
        </button>
      </div>
    </div>
  );
};
