import React, { useState, useEffect } from 'react';
import { Smartphone, RotateCw, Play, Maximize } from 'lucide-react';

interface RotateOverlayProps {
  isPortrait: boolean;
  onDismiss?: () => void;
}

export const RotateOverlay: React.FC<RotateOverlayProps> = ({ isPortrait }) => {
  if (!isPortrait) return null;

  const handleRequestFullscreenLandscape = async () => {
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
      if (window.screen?.orientation && 'lock' in window.screen.orientation) {
        await (window.screen.orientation as any).lock('landscape').catch(() => {});
      }
    } catch (_) {
      // Ignore if orientation lock is restricted by browser policy
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#070A08]/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center text-white select-none">
      <div className="relative mb-6">
        <div className="w-24 h-24 rounded-3xl bg-[#131B15] border-2 border-[#10B981] flex items-center justify-center shadow-[0_0_45px_rgba(16,185,129,0.35)] animate-pulse">
          <Smartphone className="w-12 h-12 text-[#10B981] rotate-90" />
        </div>
        <RotateCw className="w-7 h-7 text-[#34D399] absolute -bottom-1 -right-1 animate-spin" style={{ animationDuration: '3s' }} />
      </div>

      <h2 className="text-2xl font-black tracking-wider text-[#10B981] uppercase mb-2">
        Rotate Your Phone
      </h2>
      <p className="text-sm text-neutral-300 max-w-xs mb-7 leading-relaxed">
        Gravity Flip is designed for widescreen Landscape play. Please turn your device sideways to continue!
      </p>

      {/* Action Button */}
      <div className="flex flex-col w-full max-w-xs space-y-3">
        <button
          type="button"
          onClick={handleRequestFullscreenLandscape}
          className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#10B981] to-[#34D399] active:scale-95 text-[#070A08] font-black uppercase tracking-wider text-sm flex items-center justify-center space-x-2 shadow-[0_0_30px_rgba(16,185,129,0.4)] transition-transform cursor-pointer"
        >
          <Maximize className="w-5 h-5 text-[#070A08]" />
          <span>Rotate to Landscape</span>
        </button>
      </div>

      <p className="text-xs text-neutral-500 mt-6 max-w-xs">
        Ensure &quot;Auto-Rotate&quot; is turned ON in your phone quick settings bar.
      </p>
    </div>
  );
};
