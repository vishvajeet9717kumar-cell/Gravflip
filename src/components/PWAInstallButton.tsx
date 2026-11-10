import React, { useState } from 'react';
import { Download, Share2, PlusSquare, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { audio } from '../game/audio';

interface PWAInstallButtonProps {
  className?: string;
  accentColor?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  className = '',
  accentColor = '#B7FF32',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState<boolean>(false);

  // If already running inside an installed PWA, hide the button
  if (isInstalled) {
    return null;
  }

  // Only show when installation is available (beforeinstallprompt on Chromium/Android) or on iOS Safari
  if (!isInstallable && !isIOS) {
    return null;
  }

  const handleInstallClick = async () => {
    audio.playClick();
    if (isInstallable) {
      await install();
    } else if (isIOS) {
      setShowIOSGuide(true);
    }
  };

  return (
    <>
      <div className="flex flex-col items-end space-y-1">
        <button
          type="button"
          onClick={handleInstallClick}
          aria-label="Install GRAVFLIP App"
          style={{
            borderColor: `${accentColor}70`,
            boxShadow: `0 0 18px ${accentColor}30`,
          }}
          className={`flex items-center space-x-2 px-3.5 py-2 rounded-2xl bg-black/70 backdrop-blur-xl border text-xs font-black tracking-wider transition-all duration-200 active:scale-95 cursor-pointer hover:border-white/50 text-white ${className}`}
        >
          <Download className="w-3.5 h-3.5 animate-bounce" style={{ color: accentColor }} />
          <span className="text-white text-xs font-bold uppercase tracking-wider">
            Install GRAVFLIP
          </span>
        </button>

        {isIOS && (
          <span className="text-[10px] text-neutral-400 font-mono text-right">
            Tap Share, then Add to Home Screen
          </span>
        )}
      </div>

      {/* iOS Safari Guide Modal */}
      {showIOSGuide && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 text-white select-none animate-in fade-in"
          onClick={() => setShowIOSGuide(false)}
        >
          <div
            className="w-full max-w-sm rounded-3xl bg-[#121A15] border border-white/20 p-6 text-center shadow-[0_0_60px_rgba(0,0,0,0.9)] relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => {
                audio.playClick();
                setShowIOSGuide(false);
              }}
              className="absolute top-4 right-4 w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 active:scale-95 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-sky-500/20 border border-sky-400/40 flex items-center justify-center mx-auto mb-3">
              <Download className="w-6 h-6 text-sky-400" />
            </div>

            <h3 className="text-base font-black uppercase tracking-wider text-white mb-1">
              INSTALL GRAVFLIP
            </h3>
            <p className="text-xs text-neutral-400 font-mono mb-4">
              Tap Share, then Add to Home Screen
            </p>

            <div className="bg-[#18231C] border border-white/10 rounded-2xl p-4 text-left text-xs space-y-3 font-sans mb-5">
              <div className="flex items-center space-x-3">
                <div className="w-7 h-7 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                  <Share2 className="w-4 h-4 text-sky-400" />
                </div>
                <span>
                  1. Tap the <strong className="text-white">Share</strong> button in Safari toolbar.
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-7 h-7 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                  <PlusSquare className="w-4 h-4 text-emerald-400" />
                </div>
                <span>
                  2. Select <strong className="text-white">Add to Home Screen</strong>.
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                audio.playClick();
                setShowIOSGuide(false);
              }}
              style={{
                background: `linear-gradient(135deg, ${accentColor}, #38BDF8)`,
              }}
              className="w-full py-3 rounded-2xl text-[#0B0F0C] font-black uppercase tracking-wider text-xs active:scale-95 transition-transform shadow-lg cursor-pointer"
            >
              Got It
            </button>
          </div>
        </div>
      )}
    </>
  );
};
