import React, { useState, useEffect } from 'react';
import { 
  Camera, 
  RotateCcw, 
  Sliders, 
  Volume2, 
  VolumeX, 
  Mail, 
  Download
} from 'lucide-react';
import { soundManager } from '../utils/audioSynth.js';

export default function UIOverlay({
  onToggleCustomizer,
  onOpenCardModal,
  onResetToImage,
  onCameraPreset,
  activeCameraPreset,
  sceneRef
}) {
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const [snapshotUrl, setSnapshotUrl] = useState(null);

  // Keep state synchronized with the soundManager
  useEffect(() => {
    const unsubscribe = soundManager.subscribe((playing) => {
      setIsPlayingMusic(playing);
    });
    return unsubscribe;
  }, []);

  const toggleMusic = () => {
    soundManager.toggle();
  };

  const handleTakeSnapshot = () => {
    if (!sceneRef.current) return;
    const dataUrl = sceneRef.current.takeSnapshot();
    setSnapshotUrl(dataUrl);
    soundManager.playChime(880);
  };

  const handleDownloadSnapshot = () => {
    if (!snapshotUrl) return;
    const a = document.createElement('a');
    a.href = snapshotUrl;
    a.download = `white-rose-bouquet-${Date.now()}.png`;
    a.click();
  };

  return (
    <>
      {/* Top Header Removed completely per user request ("also remove the top part") */}

      {/* Floating Action Buttons (Hidden on mobile for a completely clean view) */}
      <div 
        className="fixed pointer-events-auto z-30 hide-on-mobile flex items-center gap-1.5 sm:gap-2"
        style={{
          top: 'max(12px, env(safe-area-inset-top, 12px))',
          right: 'max(12px, env(safe-area-inset-right, 12px))'
        }}
      >
        {/* Ambient Music Toggle Button */}
        <button
          onClick={toggleMusic}
          title={isPlayingMusic ? "Mute ambient music" : "Play romantic ambient music"}
          style={{
            padding: '7px 11px',
            borderRadius: '16px',
            border: isPlayingMusic
              ? '1.5px solid #dfb858'
              : '1px solid rgba(255, 255, 255, 0.4)',
            backgroundColor: isPlayingMusic
              ? '#16181d'
              : 'rgba(255, 255, 255, 0.85)',
            color: isPlayingMusic ? '#dfb858' : '#334155',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            boxShadow: isPlayingMusic
              ? '0 4px 16px rgba(223, 184, 88, 0.35)'
              : '0 4px 12px rgba(0, 0, 0, 0.08)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12px',
            fontWeight: '600',
            transition: 'all 0.2s ease',
            userSelect: 'none',
            minHeight: '38px'
          }}
        >
          {isPlayingMusic ? (
            <>
              <Volume2 size={16} style={{ color: '#dfb858' }} />
              <span className="hidden sm:inline">Ambient </span>
              <span>Music</span>
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: '#22c55e',
                  boxShadow: '0 0 6px #22c55e',
                  display: 'inline-block'
                }}
              />
            </>
          ) : (
            <>
              <VolumeX size={16} style={{ color: '#94a3b8' }} />
              <span className="hidden sm:inline">Ambient </span>
              <span>Music</span>
            </>
          )}
        </button>

        {/* Gift Card Button */}
        <button
          onClick={onOpenCardModal}
          title="Open letter for you"
          className="p-2 sm:px-3 sm:py-2 rounded-2xl bg-white/85 dark:bg-slate-900/85 hover:bg-white text-slate-700 dark:text-slate-200 border border-white/40 dark:border-slate-800 backdrop-blur-md shadow-lg transition active:scale-95 flex items-center gap-1.5 text-xs font-medium min-h-[38px]"
        >
          <Mail size={16} className="text-amber-500" />
          <span className="hidden md:inline">Gift Card</span>
        </button>

        {/* Snapshot Button */}
        <button
          onClick={handleTakeSnapshot}
          title="Take High-Resolution Picture"
          className="p-2 sm:px-3 sm:py-2 rounded-2xl bg-white/85 dark:bg-slate-900/85 hover:bg-white text-slate-700 dark:text-slate-200 border border-white/40 dark:border-slate-800 backdrop-blur-md shadow-lg transition active:scale-95 flex items-center gap-1.5 text-xs font-medium min-h-[38px]"
        >
          <Camera size={16} className="text-amber-600" />
          <span className="hidden md:inline">Snapshot</span>
        </button>

        {/* Customizer Drawer Toggle */}
        <button
          onClick={onToggleCustomizer}
          title="Customize Bouquet"
          className="px-3 sm:px-4 py-2 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-slate-950 font-semibold text-xs shadow-lg shadow-amber-500/25 transition active:scale-95 flex items-center gap-1.5 min-h-[38px]"
        >
          <Sliders size={15} />
          <span className="hidden xs:inline">Customize</span>
        </button>
      </div>

      {/* Bottom Floating Camera Views Toolbar removed per user request: "remove the buttons below but still show the drag to rotate tap letter chuhcu" */}

      {/* Snapshot Preview Modal */}
      {snapshotUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
          <div className="relative max-w-lg w-full bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="font-serif text-xl font-bold text-slate-800 dark:text-slate-100 mb-3 flex items-center gap-2">
              <span>📸</span> Captured Bouquet Snapshot
            </h3>
            <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 mb-4 shadow-inner">
              <img src={snapshotUrl} alt="Bouquet Snapshot" className="w-full h-auto max-h-[60vh] object-contain" />
            </div>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setSnapshotUrl(null)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Close
              </button>
              <button
                onClick={handleDownloadSnapshot}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/25 transition active:scale-95"
              >
                <Download size={14} /> Download Image
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
