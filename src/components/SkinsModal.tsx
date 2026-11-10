import React, { useState, useRef, useEffect } from 'react';
import { X, Sparkles, Check } from 'lucide-react';
import { WorldTheme, OrbSkin } from '../game/types';
import { ORB_SKINS, getSkinById } from '../game/skins';
import { audio } from '../game/audio';
import { drawPlayerCharacter } from '../game/render';

interface SkinsModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: WorldTheme;
  totalCrystals: number;
  unlockedSkins: string[];
  equippedSkinId: string;
  onEquipSkin: (skinId: string) => void;
  onPurchaseSkin: (skinId: string, cost: number) => void;
}

type CharacterPose = 'idle' | 'run' | 'fall' | 'flip' | 'land';

export const SkinsModal: React.FC<SkinsModalProps> = ({
  isOpen,
  onClose,
  theme,
  totalCrystals,
  unlockedSkins,
  equippedSkinId,
  onEquipSkin,
  onPurchaseSkin,
}) => {
  const [previewSkinId, setPreviewSkinId] = useState<string>(equippedSkinId);
  const [activePose, setActivePose] = useState<CharacterPose>('idle');
  const previewSkin: OrbSkin = getSkinById(previewSkinId);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Live Canvas Animation Loop for Character Preview
  useEffect(() => {
    if (!isOpen) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const startTime = performance.now();

    const loop = (now: number) => {
      const elapsed = (now - startTime) / 1000;
      const w = canvas.width;
      const h = canvas.height;

      // 1. Sleek dark chamber backdrop
      ctx.clearRect(0, 0, w, h);
      const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
      bgGrad.addColorStop(0, '#090D0A');
      bgGrad.addColorStop(1, '#131A15');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Subtle grid dots in chamber
      ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
      for (let gx = 15; gx < w; gx += 20) {
        for (let gy = 15; gy < h; gy += 20) {
          ctx.fillRect(gx, gy, 2, 2);
        }
      }

      // 2. Draw ground platform or ceiling based on pose
      const isFlip = activePose === 'flip';
      const isFalling = activePose === 'fall';

      if (isFlip) {
        // Ceiling platform
        ctx.fillStyle = '#1E293B';
        ctx.fillRect(20, 12, w - 40, 6);
        ctx.strokeStyle = previewSkin.primary;
        ctx.lineWidth = 1.5;
        ctx.strokeRect(20, 12, w - 40, 6);
      } else if (!isFalling) {
        // Ground platform
        const floorY = h - 22;
        ctx.fillStyle = '#1E293B';
        ctx.fillRect(20, floorY, w - 40, 6);
        ctx.strokeStyle = previewSkin.primary;
        ctx.lineWidth = 1.5;
        ctx.strokeRect(20, floorY, w - 40, 6);
      } else {
        // Wind speed streaks for freefall
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 1.2;
        for (let i = 0; i < 4; i++) {
          const sx = 40 + i * 50;
          const sy = ((elapsed * 120 + i * 35) % (h - 20)) + 10;
          ctx.beginPath();
          ctx.moveTo(sx, sy);
          ctx.lineTo(sx, sy + 18);
          ctx.stroke();
        }
      }

      // 3. Position and Render Character Large (~1.4x scale)
      const cx = w / 2;
      let cy = h / 2 - 2;
      if (isFlip) {
        cy = 54;
      } else if (activePose === 'land') {
        cy = h - 45;
      } else if (!isFalling) {
        cy = h - 52;
      }

      // Natural blinking cadence in idle
      const blinkCycle = elapsed % 3.5;
      const isBlinking = activePose === 'idle' && blinkCycle > 3.25 && blinkCycle < 3.42;

      drawPlayerCharacter(ctx, {
        x: cx,
        y: cy,
        facing: 1,
        pose: activePose,
        scale: 1.35,
        time: elapsed,
        runCycle: elapsed * 8,
        expression: isBlinking ? 'blink' : activePose === 'fall' ? 'scared' : 'normal',
        primaryColor: previewSkin.primary,
        secondaryColor: previewSkin.secondary,
        glowColor: previewSkin.glow,
        trailStyle: previewSkin.trailStyle,
      });

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isOpen, previewSkinId, activePose, previewSkin]);

  if (!isOpen) return null;

  const poses: { id: CharacterPose; label: string }[] = [
    { id: 'idle', label: 'Idle' },
    { id: 'run', label: 'Run' },
    { id: 'fall', label: 'Fall' },
    { id: 'flip', label: 'Flip' },
    { id: 'land', label: 'Land' },
  ];

  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 select-none text-white"
      onClick={onClose}
    >
      <div
        className="bg-[#121814] border border-white/20 rounded-3xl max-w-lg w-full max-h-[92vh] flex flex-col p-4 sm:p-6 shadow-[0_0_50px_rgba(0,0,0,0.8)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-2.5 border-b border-white/10 shrink-0">
          <div>
            <h3 className="text-lg sm:text-xl font-black uppercase tracking-wider text-white">CHARACTER WARDROBE</h3>
            <p className="text-[11px] text-white/50 font-mono">Customize your hero and preview poses</p>
          </div>

          <div className="flex items-center space-x-3">
            {/* Crystal balance */}
            <div className="flex items-center space-x-1.5 bg-black/60 px-3 py-1.5 rounded-xl border border-white/10">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-black font-mono">{totalCrystals}</span>
            </div>

            <button
              type="button"
              onClick={() => {
                audio.playClick();
                onClose();
              }}
              className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/70 active:scale-95 transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Live Character Preview Screen */}
        <div className="flex flex-col items-center bg-black/50 rounded-2xl border border-white/10 p-3 my-2.5 shrink-0">
          <div className="w-full flex items-center justify-between px-2 mb-1.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-white/40">
              Live Character Preview
            </span>
            <span
              className="text-xs font-black uppercase tracking-wider"
              style={{ color: previewSkin.primary }}
            >
              {previewSkin.name}
            </span>
          </div>

          {/* Large Live Canvas */}
          <div className="w-full max-w-[280px] h-[135px] rounded-xl overflow-hidden border border-white/10 shadow-inner flex items-center justify-center bg-[#090D0A]">
            <canvas
              ref={canvasRef}
              width={280}
              height={135}
              className="w-full h-full block"
            />
          </div>

          {/* Interactive Pose Selection Buttons */}
          <div className="flex items-center justify-center gap-1.5 mt-2.5 w-full max-w-[280px]">
            {poses.map((p) => {
              const isSelected = activePose === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    audio.playClick();
                    setActivePose(p.id);
                  }}
                  style={{
                    backgroundColor: isSelected ? previewSkin.primary : 'rgba(255, 255, 255, 0.08)',
                    color: isSelected ? '#090D0A' : 'rgba(255, 255, 255, 0.75)',
                    borderColor: isSelected ? previewSkin.primary : 'rgba(255, 255, 255, 0.12)',
                  }}
                  className="flex-1 py-1 px-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider border transition-all active:scale-95 text-center cursor-pointer"
                >
                  {p.label}
                </button>
              );
            })}
          </div>

          <p className="text-[10px] text-white/40 text-center mt-1.5 max-w-xs truncate">
            {previewSkin.description}
          </p>
        </div>

        {/* Skins Grid */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            {ORB_SKINS.map((skin) => {
              const isUnlocked = unlockedSkins.includes(skin.id);
              const isEquipped = equippedSkinId === skin.id;
              const isSelected = previewSkinId === skin.id;

              return (
                <div
                  key={skin.id}
                  onClick={() => {
                    audio.playClick();
                    setPreviewSkinId(skin.id);
                  }}
                  style={{
                    borderColor: isSelected
                      ? skin.primary
                      : isEquipped
                      ? `${theme.primary}60`
                      : 'rgba(255,255,255,0.1)',
                    backgroundColor: isSelected ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.3)',
                  }}
                  className="p-3 rounded-2xl border transition-all flex flex-col justify-between cursor-pointer active:scale-98"
                >
                  <div className="flex items-center space-x-2 mb-2">
                    <div
                      className="w-6 h-6 rounded-full border border-white/60 shrink-0"
                      style={{
                        background: `radial-gradient(circle at 35% 35%, #FFFFFF 10%, ${skin.primary} 50%, ${skin.secondary} 100%)`,
                        boxShadow: `0 0 10px ${skin.glow}`,
                      }}
                    />
                    <span className="text-xs font-bold text-white truncate">{skin.name}</span>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    {isEquipped ? (
                      <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 flex items-center space-x-1">
                        <Check className="w-3 h-3" />
                        <span>Equipped</span>
                      </span>
                    ) : isUnlocked ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          audio.playClick();
                          onEquipSkin(skin.id);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[10px] font-bold uppercase tracking-wider text-white"
                      >
                        Equip
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          audio.playClick();
                          onPurchaseSkin(skin.id, skin.cost);
                        }}
                        disabled={totalCrystals < skin.cost}
                        style={{
                          backgroundColor: totalCrystals >= skin.cost ? skin.primary : 'rgba(255,255,255,0.1)',
                          color: totalCrystals >= skin.cost ? '#0B0F0C' : 'rgba(255,255,255,0.4)',
                        }}
                        className="px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center space-x-1"
                      >
                        <Sparkles className="w-3 h-3 fill-current" />
                        <span>{skin.cost}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
