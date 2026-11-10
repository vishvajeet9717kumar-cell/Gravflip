import React from 'react';
import { RefreshCw, Sparkles } from 'lucide-react';
import { applyPWAUpdate } from '../pwaManager';

interface PWAUpdateToastProps {
  show: boolean;
}

export const PWAUpdateToast: React.FC<PWAUpdateToastProps> = ({ show }) => {
  if (!show) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 pointer-events-auto select-none animate-in fade-in slide-in-from-top-3">
      <button
        type="button"
        onClick={() => applyPWAUpdate()}
        className="flex items-center space-x-2.5 px-4 py-2 rounded-2xl bg-[#121B15]/95 border-2 border-[#B7FF32] text-white shadow-[0_0_30px_rgba(183,255,50,0.4)] backdrop-blur-xl active:scale-95 transition-transform cursor-pointer"
      >
        <RefreshCw className="w-4 h-4 text-[#B7FF32] animate-spin" style={{ animationDuration: '4s' }} />
        <span className="text-xs font-black uppercase tracking-wider text-white">
          Update available — tap to refresh
        </span>
        <Sparkles className="w-3.5 h-3.5 text-[#B7FF32]" />
      </button>
    </div>
  );
};
