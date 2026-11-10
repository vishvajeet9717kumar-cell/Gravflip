import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-3 left-3 z-50 pointer-events-none select-none animate-in fade-in slide-in-from-bottom-2">
      <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-amber-950/90 border border-amber-400/50 backdrop-blur-md shadow-[0_0_15px_rgba(251,191,36,0.25)] text-amber-200 text-xs font-mono font-bold">
        <WifiOff className="w-3.5 h-3.5 text-amber-400 shrink-0" />
        <span>Offline mode</span>
        <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
      </div>
    </div>
  );
};
