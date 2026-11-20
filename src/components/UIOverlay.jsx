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

  const [isMobileScreen, setIsMobileScreen] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 1024 : false
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobileScreen(window.innerWidth < 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      {/* Top action buttons and toolbar removed entirely per user request */}

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
