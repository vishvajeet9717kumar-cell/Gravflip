import React, { useState } from 'react';
import { X, Info, ShieldCheck, Mail, FileText, ExternalLink, Heart, Sparkles } from 'lucide-react';
import { WorldTheme } from '../game/types';
import { audio } from '../game/audio';

interface AboutLegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: WorldTheme;
}

type TabType = 'about' | 'privacy' | 'contact' | 'terms';

export const AboutLegalModal: React.FC<AboutLegalModalProps> = ({
  isOpen,
  onClose,
  theme,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('about');

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 select-none"
      onClick={onClose}
    >
      <div
        className="bg-[#141A16] border border-white/20 rounded-3xl p-5 sm:p-6 max-w-lg w-full max-h-[88vh] flex flex-col shadow-2xl text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5" style={{ color: theme.primary }} />
            <h3 className="text-base sm:text-lg font-black tracking-wider uppercase text-white">
              About & Legal
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

        {/* Tab Navigation */}
        <div className="grid grid-cols-4 gap-1.5 p-1 bg-black/40 rounded-2xl border border-white/10 mb-4">
          <button
            type="button"
            onClick={() => {
              audio.playClick();
              setActiveTab('about');
            }}
            className={`py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1 cursor-pointer ${
              activeTab === 'about'
                ? 'bg-white/20 text-white shadow-sm'
                : 'text-white/50 hover:text-white/80'
            }`}
          >
            <Info className="w-3.5 h-3.5" />
            <span>About</span>
          </button>

          <button
            type="button"
            onClick={() => {
              audio.playClick();
              setActiveTab('privacy');
            }}
            className={`py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1 cursor-pointer ${
              activeTab === 'privacy'
                ? 'bg-white/20 text-white shadow-sm'
                : 'text-white/50 hover:text-white/80'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Privacy</span>
          </button>

          <button
            type="button"
            onClick={() => {
              audio.playClick();
              setActiveTab('contact');
            }}
            className={`py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1 cursor-pointer ${
              activeTab === 'contact'
                ? 'bg-white/20 text-white shadow-sm'
                : 'text-white/50 hover:text-white/80'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Contact</span>
          </button>

          <button
            type="button"
            onClick={() => {
              audio.playClick();
              setActiveTab('terms');
            }}
            className={`py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1 cursor-pointer ${
              activeTab === 'terms'
                ? 'bg-white/20 text-white shadow-sm'
                : 'text-white/50 hover:text-white/80'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Terms</span>
          </button>
        </div>

        {/* Tab Content (Scrollable) */}
        <div className="flex-1 overflow-y-auto pr-1 text-xs space-y-3 leading-relaxed text-white/80">
          {activeTab === 'about' && (
            <div className="space-y-3 bg-white/5 p-4 rounded-2xl border border-white/5">
              <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                <div>
                  <h4 className="text-sm font-black text-white">GRAVFLIP</h4>
                  <p className="text-[11px] text-neutral-400">Version 1.0.0 (Release Build)</p>
                </div>
                <span className="px-2.5 py-1 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold uppercase">
                  Verified Ready
                </span>
              </div>
              <p>
                <strong>GRAVFLIP</strong> is a precision 2D gravity-flipping neon platformer designed for mobile-first play. Flip through 40 handcrafted rooms across 8 unique worlds with fluid physics, checkpoints, moving traps, crumbling platforms, and laser hazards.
              </p>
              <div className="bg-black/40 p-3 rounded-xl border border-white/10 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-neutral-400">Developer:</span>
                  <span className="font-bold text-white">Vishvajeet Kumar</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Platform:</span>
                  <span className="text-white">Android / PWA / Web</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Engine:</span>
                  <span className="text-white">HTML5 Canvas 60 FPS • Vite • React</span>
                </div>
              </div>
              <p className="text-[11px] text-neutral-400 italic flex items-center space-x-1">
                <Heart className="w-3.5 h-3.5 text-rose-500 inline mr-1" /> Built with passion for gaming.
              </p>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-3 bg-white/5 p-4 rounded-2xl border border-white/5">
              <h4 className="text-sm font-bold text-white flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Zero Tracking & Local Storage</span>
              </h4>
              <p>
                We respect your personal privacy. GRAVFLIP does not collect, transmit, share, or sell any personal information, location coordinates, or device identifiers.
              </p>
              <div className="bg-black/40 p-3 rounded-xl border border-white/10 space-y-1">
                <p className="font-bold text-emerald-400">✓ 100% Offline Capable</p>
                <p className="text-[11px] text-neutral-300">
                  Game save state (unlocked rooms, golden star achievements, collected crystals, and sound settings) is stored purely locally on your device via browser LocalStorage.
                </p>
                <p className="font-bold text-emerald-400 mt-2">✓ Family & COPPA Safe</p>
                <p className="text-[11px] text-neutral-300">
                  Safe for players of all ages with zero external ads tracking or user profiling.
                </p>
              </div>
              <div className="pt-2">
                <a
                  href="/privacy.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1 text-emerald-400 hover:text-emerald-300 underline font-semibold text-xs"
                >
                  <span>Open Full Web Privacy Policy</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          )}

          {activeTab === 'contact' && (
            <div className="space-y-3 bg-white/5 p-4 rounded-2xl border border-white/5">
              <h4 className="text-sm font-bold text-white flex items-center space-x-1.5">
                <Mail className="w-4 h-4 text-sky-400" />
                <span>Developer Support & Inquiries</span>
              </h4>
              <p>
                Have a suggestion, found a bug in a room, or need support? Reach out directly to the developer:
              </p>
              <div className="bg-black/40 p-3.5 rounded-xl border border-white/10 space-y-2">
                <div>
                  <span className="block text-[11px] text-neutral-400">Official Support Email</span>
                  <span className="font-mono font-bold text-white text-xs select-all">
                    vishvajeet9717kumar@gmail.com
                  </span>
                </div>
                <a
                  href="mailto:vishvajeet9717kumar@gmail.com?subject=GRAVFLIP%20Support%20Feedback"
                  className="inline-flex items-center justify-center w-full py-2 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 font-bold uppercase text-[11px] tracking-wider transition-colors"
                >
                  Send Email to Support
                </a>
              </div>
              <p className="text-[11px] text-neutral-400">
                Responses are typically provided within 24-48 business hours.
              </p>
            </div>
          )}

          {activeTab === 'terms' && (
            <div className="space-y-3 bg-white/5 p-4 rounded-2xl border border-white/5">
              <h4 className="text-sm font-bold text-white flex items-center space-x-1.5">
                <FileText className="w-4 h-4 text-amber-400" />
                <span>Terms of Use & License</span>
              </h4>
              <p>
                GRAVFLIP is provided for personal entertainment. By playing the game, you agree to fair gameplay and non-commercial personal usage.
              </p>
              <div className="bg-black/40 p-3 rounded-xl border border-white/10 space-y-1.5">
                <p className="text-[11px] text-neutral-300">
                  • All game assets, visual designs, audio synthesis patterns, and level designs are protected under intellectual property rights.
                </p>
                <p className="text-[11px] text-neutral-300">
                  • The game is provided "as is" with continuous performance optimizations.
                </p>
              </div>
              <div className="pt-2">
                <a
                  href="/terms.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1 text-amber-400 hover:text-amber-300 underline font-semibold text-xs"
                >
                  <span>Open Full Terms of Service</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Close Button */}
        <button
          type="button"
          onClick={() => {
            audio.playClick();
            onClose();
          }}
          style={{
            background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
          }}
          className="w-full mt-4 py-2.5 rounded-2xl text-[#0B0F0C] font-black uppercase tracking-wider text-xs active:scale-95 transition-transform shadow-lg cursor-pointer"
        >
          Close
        </button>
      </div>
    </div>
  );
};
