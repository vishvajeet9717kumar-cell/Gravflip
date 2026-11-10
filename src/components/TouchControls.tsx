import React, { useCallback } from 'react';
import { ChevronLeft, ChevronRight, ArrowUpDown } from 'lucide-react';
import { GravityDirection, WorldTheme } from '../game/types';

interface TouchControlsProps {
  onMoveLeft: (pressed: boolean) => void;
  onMoveRight: (pressed: boolean) => void;
  onFlip: () => void;
  currentGravity: GravityDirection;
  theme?: WorldTheme;
  controlOpacity?: number;
}

export const TouchControls = React.memo<TouchControlsProps>(({
  onMoveLeft,
  onMoveRight,
  onFlip,
  currentGravity,
  theme,
  controlOpacity = 0.60,
}) => {
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
  }, []);

  const primaryColor = theme?.primary || '#B7FF32';
  const secondaryColor = theme?.secondary || '#6CFF80';

  return (
    <div
      className="absolute inset-0 pointer-events-none select-none z-20 flex justify-between items-end p-4 md:p-6 pb-[max(1.2rem,env(safe-area-inset-bottom))] pl-[max(1.2rem,env(safe-area-inset-left))] pr-[max(1.2rem,env(safe-area-inset-right))]"
      onContextMenu={handleContextMenu}
    >
      {/* Left/Right Directional Pad on bottom-left */}
      <div
        className="pointer-events-auto flex items-center space-x-3 bg-black/60 backdrop-blur-xl p-2 rounded-3xl border border-white/10 shadow-2xl transition-opacity duration-150"
        style={{ opacity: controlOpacity }}
      >
        {/* LEFT BUTTON */}
        <button
          type="button"
          aria-label="Move Left"
          className="w-16 h-16 min-w-[58px] min-h-[58px] rounded-2xl bg-white/5 active:bg-white/15 active:scale-95 border-2 border-white/10 flex items-center justify-center transition-transform duration-75 shadow-lg select-none touch-none cursor-pointer"
          style={{ color: primaryColor }}
          onPointerDown={(e) => {
            e.preventDefault();
            try {
              e.currentTarget.setPointerCapture(e.pointerId);
            } catch (_) {}
            onMoveLeft(true);
          }}
          onPointerUp={(e) => {
            e.preventDefault();
            onMoveLeft(false);
          }}
          onPointerCancel={() => onMoveLeft(false)}
          onTouchStart={(e) => {
            e.preventDefault();
            onMoveLeft(true);
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            onMoveLeft(false);
          }}
          onTouchCancel={() => onMoveLeft(false)}
        >
          <ChevronLeft className="w-9 h-9 stroke-[3]" />
        </button>

        {/* RIGHT BUTTON */}
        <button
          type="button"
          aria-label="Move Right"
          className="w-16 h-16 min-w-[58px] min-h-[58px] rounded-2xl bg-white/5 active:bg-white/15 active:scale-95 border-2 border-white/10 flex items-center justify-center transition-transform duration-75 shadow-lg select-none touch-none cursor-pointer"
          style={{ color: primaryColor }}
          onPointerDown={(e) => {
            e.preventDefault();
            try {
              e.currentTarget.setPointerCapture(e.pointerId);
            } catch (_) {}
            onMoveRight(true);
          }}
          onPointerUp={(e) => {
            e.preventDefault();
            onMoveRight(false);
          }}
          onPointerCancel={() => onMoveRight(false)}
          onTouchStart={(e) => {
            e.preventDefault();
            onMoveRight(true);
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            onMoveRight(false);
          }}
          onTouchCancel={() => onMoveRight(false)}
        >
          <ChevronRight className="w-9 h-9 stroke-[3]" />
        </button>
      </div>

      {/* Large FLIP Button on bottom-right */}
      <div
        className="pointer-events-auto flex flex-col items-center transition-opacity duration-150"
        style={{ opacity: controlOpacity }}
      >
        <button
          type="button"
          aria-label="Flip Gravity"
          className="w-20 h-20 min-w-[68px] min-h-[68px] rounded-3xl active:scale-90 text-[#0B0F0C] font-black flex flex-col items-center justify-center transition-transform duration-75 select-none touch-none border-2 border-white/40 cursor-pointer"
          style={{
            background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
            boxShadow: `0 0 35px ${primaryColor}60`,
          }}
          onPointerDown={(e) => {
            e.preventDefault();
            onFlip();
          }}
          onTouchStart={(e) => {
            e.preventDefault();
            onFlip();
          }}
        >
          <ArrowUpDown className="w-7 h-7 stroke-[3]" />
          <span className="text-xs tracking-wider uppercase font-black mt-0.5">FLIP</span>
        </button>
      </div>
    </div>
  );
});
