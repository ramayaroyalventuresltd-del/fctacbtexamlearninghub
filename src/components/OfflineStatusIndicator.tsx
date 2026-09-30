import React, { useState, useEffect } from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { Wifi, WifiOff, RefreshCw, CheckCircle2, Database, ShieldCheck } from 'lucide-react';
import { syncOfflineQueuedAttempts, getOfflineQueueCount } from '../services/examService';

export const OfflineStatusIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();
  const [queueCount, setQueueCount] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [justSynced, setJustSynced] = useState<boolean>(false);

  useEffect(() => {
    setQueueCount(getOfflineQueueCount());
    const interval = setInterval(() => {
      setQueueCount(getOfflineQueueCount());
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // When coming back online, trigger auto sync of queued submissions
  useEffect(() => {
    if (isOnline && queueCount > 0 && !isSyncing) {
      handleManualSync();
    }
  }, [isOnline]);

  const handleManualSync = async () => {
    if (!isOnline || isSyncing) return;
    setIsSyncing(true);
    try {
      const synced = await syncOfflineQueuedAttempts();
      setQueueCount(getOfflineQueueCount());
      if (synced > 0) {
        setJustSynced(true);
        setTimeout(() => setJustSynced(false), 4000);
      }
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="flex items-center gap-2 text-[11px] font-semibold">
      {isOnline ? (
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <Wifi className="w-3 h-3" />
          <span className="hidden sm:inline">Online • Cloud Active</span>
          {queueCount > 0 && (
            <button
              onClick={handleManualSync}
              disabled={isSyncing}
              className="ml-1 text-[10px] bg-emerald-600 hover:bg-emerald-500 text-white px-1.5 py-0.5 rounded flex items-center gap-1"
            >
              <RefreshCw className={`w-2.5 h-2.5 ${isSyncing ? 'animate-spin' : ''}`} />
              Sync ({queueCount})
            </button>
          )}
          {justSynced && (
            <span className="text-[10px] text-emerald-300 font-bold ml-1">Synced!</span>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-950/70 border border-amber-500/40 text-amber-300 animate-in fade-in">
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          <WifiOff className="w-3 h-3" />
          <span>Offline Mode • Using Local Persistence</span>
          {queueCount > 0 && (
            <span className="bg-amber-600/60 px-1.5 py-0.5 rounded text-[10px] font-mono text-white">
              {queueCount} queued
            </span>
          )}
        </div>
      )}
    </div>
  );
};
